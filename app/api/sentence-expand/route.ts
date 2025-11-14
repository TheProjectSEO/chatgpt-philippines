import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCacheManager } from '@/lib/cache';
import { getAPIKeyManager } from '@/lib/apiKeyManager';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Check cache
    const cache = await getCacheManager();
    const cacheKey = JSON.stringify({ text });
    const cached = await cache.get(cacheKey, 'claude-3-5-haiku-20241022');

    if (cached) {
      console.log('[Sentence Expand] Cache hit for request');
      return NextResponse.json({ expanded: cached.response });
    }

    // Get API key
    const apiKeyManager = getAPIKeyManager();
    const keyData = apiKeyManager.getAvailableKey();

    if (!keyData) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const anthropic = new Anthropic({ apiKey: keyData.key });

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `You are a professional writing assistant. Expand the following text by adding relevant details, context, and elaboration while maintaining the original meaning and tone. Make it more comprehensive and informative without changing the core message.

Original text: "${text}"

Provide only the expanded version without any introductory phrases or explanations.`
          }
        ],
      });

      const expanded = message.content[0].type === 'text' ? message.content[0].text : '';

      // Cache successful response
      await cache.set(cacheKey, 'claude-3-5-haiku-20241022', expanded, {
        input: message.usage?.input_tokens || 0,
        output: message.usage?.output_tokens || 0
      });

      // Report success to API key manager
      apiKeyManager.reportSuccess(keyData.key);

      return NextResponse.json({ expanded });

    } catch (error: any) {
      // Report error to API key manager
      apiKeyManager.reportError(keyData.key, error);
      throw error;
    }

  } catch (error: any) {
    console.error('Sentence expansion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to expand text' },
      { status: 500 }
    );
  }
}
