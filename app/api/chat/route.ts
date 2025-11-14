import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { AnthropicModel } from '@/lib/types';
import { getModelConfig, estimateCost, getModelTypeFromString } from '@/lib/modelSelection';
import { trackModelUsage } from '@/lib/analytics';
import { getCacheManager } from '@/lib/cache';
import { getAPIKeyManager } from '@/lib/apiKeyManager';
// import { getSession } from '@auth0/nextjs-auth0'; // TODO: Fix Auth0 session check

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    // const session = await getSession();
    // const isAuthenticated = !!session?.user;
    const isAuthenticated = false; // TODO: Implement proper auth check

    // Check rate limit for non-authenticated users
    if (!isAuthenticated) {
      try {
        // Forward all relevant headers to rate limit API
        const rateLimitResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/rate-limit`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-forwarded-for': req.headers.get('x-forwarded-for') || '',
              'x-real-ip': req.headers.get('x-real-ip') || '',
              'cf-connecting-ip': req.headers.get('cf-connecting-ip') || '',
              'x-vercel-forwarded-for': req.headers.get('x-vercel-forwarded-for') || '',
              'user-agent': req.headers.get('user-agent') || '',
              'accept-language': req.headers.get('accept-language') || '',
              'accept-encoding': req.headers.get('accept-encoding') || '',
              'sec-ch-ua': req.headers.get('sec-ch-ua') || '',
              'sec-ch-ua-platform': req.headers.get('sec-ch-ua-platform') || '',
            },
            body: JSON.stringify({ action: 'increment' })
          }
        );

        if (!rateLimitResponse.ok) {
          console.error('Rate limit check failed');
        } else {
          const rateLimit = await rateLimitResponse.json();

          if (rateLimit.blocked) {
            return NextResponse.json({
              error: 'Rate limit exceeded',
              message: 'You have reached your free message limit. Please sign up to continue chatting.',
              limit: rateLimit.limit,
              count: rateLimit.count,
              remaining: rateLimit.remaining
            }, { status: 429 });
          }

          console.log(`[Rate Limit] Guest user: ${rateLimit.count}/${rateLimit.limit} messages used`);
        }
      } catch (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError);
        // Continue anyway - don't block users if rate limiting fails
      }
    } else {
      console.log('[Rate Limit] Authenticated user - unlimited messages');
    }

    const { messages, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Get the last user message for model selection
    const lastUserMessage = anthropicMessages.filter((m: any) => m.role === 'user').pop();
    const userMessageContent = lastUserMessage?.content || '';

    // Select appropriate model based on query complexity
    let selectedModel: string;
    let maxTokens: number;
    let temperature: number;

    if (model) {
      // If model is explicitly provided, use it
      selectedModel = model;
      maxTokens = 4096;
      temperature = 0.7;
      console.log('[Chat API] Using manually selected model:', selectedModel);
    } else {
      // Otherwise, use intelligent model selection
      const modelConfig = getModelConfig(userMessageContent, anthropicMessages.length);
      selectedModel = modelConfig.model;
      maxTokens = modelConfig.maxTokens;
      temperature = modelConfig.temperature;
      console.log('[Chat API] Auto-selected model:', selectedModel, 'for query:', userMessageContent.substring(0, 50));
    }

    // Check cache before making API call
    const cache = await getCacheManager();
    const cacheKey = JSON.stringify(anthropicMessages);
    const cached = await cache.get(cacheKey, selectedModel);

    if (cached) {
      console.log('[Cache] Returning cached response');
      // Return cached response as a stream to maintain consistency with non-cached responses
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        start(controller) {
          // Stream the cached response text
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: cached.response })}\n\n`)
          );
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new NextResponse(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Get API key from manager
    const apiKeyManager = getAPIKeyManager();
    const keyData = apiKeyManager.getAvailableKey();

    if (!keyData) {
      console.error('[API Key Manager] No API keys available');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    console.log('[API Key Manager] Using key for request');

    // Create Anthropic client with selected API key
    const anthropic = new Anthropic({
      apiKey: keyData.key,
    });

    // Create streaming response
    const stream = await anthropic.messages.stream({
      model: selectedModel as AnthropicModel,
      max_tokens: maxTokens,
      temperature: temperature,
      messages: anthropicMessages,
    });

    // Track usage for cost monitoring
    let inputTokens = 0;
    let outputTokens = 0;
    let fullResponseText = ''; // Accumulate response text for caching

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' &&
                chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
              fullResponseText += text; // Accumulate for caching
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          // Get final usage stats
          const finalMessage = await stream.finalMessage();
          if (finalMessage.usage) {
            inputTokens = finalMessage.usage.input_tokens;
            outputTokens = finalMessage.usage.output_tokens;

            const modelType = getModelTypeFromString(selectedModel);
            const cost = estimateCost(modelType, inputTokens, outputTokens);

            console.log(`[Cost] Model: ${selectedModel} | Cost: $${cost.toFixed(6)} | Input: ${inputTokens} tokens | Output: ${outputTokens} tokens`);

            // Track usage in database (async, don't block response)
            trackModelUsage({
              user_id: null, // TODO: Add session?.user?.sub when auth is fixed
              model: selectedModel,
              input_tokens: inputTokens,
              output_tokens: outputTokens,
              cost_usd: cost,
            }).catch((error) => {
              console.error('[Analytics] Failed to track usage:', error);
            });

            // Cache the successful response
            cache.set(
              cacheKey,
              selectedModel,
              fullResponseText,
              { input: inputTokens, output: outputTokens }
            ).catch((error) => {
              console.error('[Cache] Failed to cache response:', error);
            });

            // Report success to API key manager
            apiKeyManager.reportSuccess(keyData.key);
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: any) {
          console.error('[Stream Error]:', error);

          // Report error to API key manager
          apiKeyManager.reportError(keyData.key, error);

          controller.error(error);
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API Error:', error);

    // Report error to API key manager if we have a key
    try {
      const apiKeyManager = getAPIKeyManager();
      const keyData = apiKeyManager.getAvailableKey();
      if (keyData) {
        apiKeyManager.reportError(keyData.key, error);
      }
    } catch (managerError) {
      console.error('[API Key Manager] Error reporting failure:', managerError);
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
