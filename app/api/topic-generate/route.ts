import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCacheManager } from '@/lib/cache';
import { getAPIKeyManager } from '@/lib/apiKeyManager';

export async function POST(request: NextRequest) {
  try {
    const { subject, category } = await request.json();

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    // Check cache
    const cache = await getCacheManager();
    const cacheKey = JSON.stringify({ subject, category });
    const cached = await cache.get(cacheKey, 'claude-3-5-haiku-20241022');

    if (cached) {
      console.log('[Topic Generate] Cache hit for request');
      return NextResponse.json({ topics: cached.response });
    }

    // Get API key
    const apiKeyManager = getAPIKeyManager();
    const keyData = apiKeyManager.getAvailableKey();

    if (!keyData) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const anthropic = new Anthropic({ apiKey: keyData.key });

    const categoryPrompt = category ? `\nType of content: ${category}` : '';

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1536,
        messages: [
          {
            role: 'user',
            content: `You are a creative topic generator. Generate 15 interesting, engaging, and researchable topic ideas for the following subject area:${categoryPrompt}

Subject: "${subject}"

Requirements:
- Make topics specific and focused enough to write about
- Include a variety of angles and perspectives
- Make topics thought-provoking and current
- Ensure topics are appropriate for academic or professional writing
- Mix different difficulty levels and scopes

Provide ONLY the 15 topic ideas, one per line, without numbering or additional text.`
          }
        ],
      });

      const response = message.content[0].type === 'text' ? message.content[0].text : '';
      const topics = response.split('\n').filter(line => line.trim()).slice(0, 15);

      // Cache successful response
      await cache.set(cacheKey, 'claude-3-5-haiku-20241022', topics, {
        input: message.usage?.input_tokens || 0,
        output: message.usage?.output_tokens || 0
      });

      // Report success to API key manager
      apiKeyManager.reportSuccess(keyData.key);

      return NextResponse.json({ topics });

    } catch (error: any) {
      // Report error to API key manager
      apiKeyManager.reportError(keyData.key, error);
      throw error;
    }

  } catch (error: any) {
    console.error('Topic generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate topics' },
      { status: 500 }
    );
  }
}
