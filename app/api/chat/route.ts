import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { AnthropicModel } from '@/lib/types';
import { getModelConfig, estimateCost, getModelTypeFromString } from '@/lib/modelSelection';
import { trackModelUsage } from '@/lib/analytics';
// import { getSession } from '@auth0/nextjs-auth0'; // TODO: Fix Auth0 session check

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' &&
                chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
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
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
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
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
