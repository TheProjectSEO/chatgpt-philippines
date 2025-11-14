import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCacheManager } from '@/lib/cache';
import { getAPIKeyManager } from '@/lib/apiKeyManager';

export async function POST(request: NextRequest) {
  try {
    const { sourceType, citationStyle, sourceInfo } = await request.json();

    if (!sourceType || !citationStyle || !sourceInfo) {
      return NextResponse.json(
        { error: 'Source type, citation style, and source info are required' },
        { status: 400 }
      );
    }

    if (!sourceInfo.title || !sourceInfo.author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    // Check cache
    const cache = await getCacheManager();
    const cacheKey = JSON.stringify({ sourceType, citationStyle, sourceInfo });
    const cached = await cache.get(cacheKey, 'claude-3-5-haiku-20241022');

    if (cached) {
      console.log('[Citation Generate] Cache hit for request');
      return NextResponse.json({ citation: cached.response });
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
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `You are a citation formatting expert. Generate a properly formatted ${citationStyle} style citation for the following source:

Source Type: ${sourceType}
Title: ${sourceInfo.title}
Author(s): ${sourceInfo.author}
${sourceInfo.url ? `URL: ${sourceInfo.url}` : ''}
${sourceInfo.date ? `Publication Date: ${sourceInfo.date}` : ''}
${sourceInfo.publisher ? `Publisher/Journal: ${sourceInfo.publisher}` : ''}

Requirements:
- Follow ${citationStyle} style guide rules exactly
- Format all elements correctly (punctuation, capitalization, italics)
- Include all provided information
- Use proper spacing and ordering

Provide ONLY the formatted citation without any introductory text or explanations.`
          }
        ],
      });

      const citation = message.content[0].type === 'text' ? message.content[0].text : '';

      // Cache successful response
      await cache.set(cacheKey, 'claude-3-5-haiku-20241022', citation, {
        input: message.usage?.input_tokens || 0,
        output: message.usage?.output_tokens || 0
      });

      // Report success to API key manager
      apiKeyManager.reportSuccess(keyData.key);

      return NextResponse.json({ citation });

    } catch (error: any) {
      // Report error to API key manager
      apiKeyManager.reportError(keyData.key, error);
      throw error;
    }

  } catch (error: any) {
    console.error('Citation generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate citation' },
      { status: 500 }
    );
  }
}
