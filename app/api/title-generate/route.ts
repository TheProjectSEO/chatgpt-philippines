import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCacheManager } from '@/lib/cache';
import { getAPIKeyManager } from '@/lib/apiKeyManager';

export async function POST(request: NextRequest) {
  try {
    const { topic, context } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Check cache
    const cache = await getCacheManager();
    const cacheKey = JSON.stringify({ topic, context });
    const cached = await cache.get(cacheKey, 'claude-3-5-haiku-20241022');

    if (cached) {
      console.log('[Title Generate] Cache hit for request');
      return NextResponse.json({ titles: cached.response });
    }

    // Get API key
    const apiKeyManager = getAPIKeyManager();
    const keyData = apiKeyManager.getAvailableKey();

    if (!keyData) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const anthropic = new Anthropic({ apiKey: keyData.key });

    const contextPrompt = context ? `\nContext: ${context}` : '';

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a creative title generator. Generate 10 compelling, attention-grabbing titles for the following topic:${contextPrompt}

Topic: "${topic}"

Requirements:
- Make titles engaging and clickable
- Use power words and emotional triggers
- Keep titles between 40-70 characters when possible
- Vary the style (question-based, how-to, listicle, etc.)
- Make them SEO-friendly

Provide ONLY the 10 titles, one per line, without numbering or additional text.`
          }
        ],
      });

      const response = message.content[0].type === 'text' ? message.content[0].text : '';
      const titles = response.split('\n').filter(line => line.trim()).slice(0, 10);

      // Cache successful response
      await cache.set(cacheKey, 'claude-3-5-haiku-20241022', titles, {
        input: message.usage?.input_tokens || 0,
        output: message.usage?.output_tokens || 0
      });

      // Report success to API key manager
      apiKeyManager.reportSuccess(keyData.key);

      return NextResponse.json({ titles });

    } catch (error: any) {
      // Report error to API key manager
      apiKeyManager.reportError(keyData.key, error);
      throw error;
    }

  } catch (error: any) {
    console.error('Title generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate titles' },
      { status: 500 }
    );
  }
}
