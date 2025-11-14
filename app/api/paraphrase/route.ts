import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { getCacheManager } from '@/lib/cache';
import { getAPIKeyManager } from '@/lib/apiKeyManager';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { text, mode } = await req.json();

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (text.length > 3000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 3000 characters' },
        { status: 400 }
      );
    }

    // Define mode instructions
    const modeInstructions: Record<string, string> = {
      standard: 'Rewrite the text in a natural, clear manner while preserving the original meaning.',
      formal: 'Rewrite the text using formal, professional language suitable for business or academic contexts.',
      simple: 'Rewrite the text using simpler words and shorter sentences while maintaining the meaning.',
      creative: 'Rewrite the text in a creative, engaging way while keeping the core message intact.',
    };

    const instruction = modeInstructions[mode] || modeInstructions.standard;

    // Check cache
    const cache = await getCacheManager();
    const cacheKey = JSON.stringify({ text, mode });
    const cached = await cache.get(cacheKey, 'claude-3-5-haiku-20241022');

    if (cached) {
      console.log('[Paraphrase] Cache hit for request');
      return NextResponse.json({ paraphrased: cached.response });
    }

    // Get API key
    const apiKeyManager = getAPIKeyManager();
    const keyData = apiKeyManager.getAvailableKey();

    if (!keyData) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const anthropic = new Anthropic({ apiKey: keyData.key });

    // Create paraphrasing prompt
    const prompt = `${instruction}

Original text:
${text}

Provide ONLY the paraphrased text, no explanations or additional commentary.`;

    try {
      // Call Claude API for paraphrasing using Haiku
      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2048,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract paraphrased text from response
      const paraphrased = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      // Cache successful response
      await cache.set(cacheKey, 'claude-3-5-haiku-20241022', paraphrased, {
        input: message.usage?.input_tokens || 0,
        output: message.usage?.output_tokens || 0
      });

      // Report success to API key manager
      apiKeyManager.reportSuccess(keyData.key);

      // Log usage for monitoring
      console.log(`[Paraphraser] ${mode} mode | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

      return NextResponse.json({
        paraphrased,
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
        }
      });

    } catch (error: any) {
      // Report error to API key manager
      apiKeyManager.reportError(keyData.key, error);
      throw error;
    }

  } catch (error: any) {
    console.error('Paraphraser API Error:', error);

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Paraphrasing failed' },
      { status: 500 }
    );
  }
}
