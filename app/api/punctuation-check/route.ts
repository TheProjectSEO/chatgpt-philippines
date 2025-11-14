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
      console.log('[Punctuation Check] Cache hit for request');
      return NextResponse.json(cached.response);
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
            content: `You are a punctuation expert. Analyze the following text and:
1. Correct all punctuation errors (commas, periods, apostrophes, quotation marks, etc.)
2. List the specific errors found

Original text: "${text}"

Provide your response in this exact format:
CORRECTED TEXT:
[the corrected text here]

ERRORS FOUND:
[list each error on a new line, starting with a dash]

If no errors are found, write "No punctuation errors detected" under ERRORS FOUND.`
          }
        ],
      });

      const response = message.content[0].type === 'text' ? message.content[0].text : '';

      // Parse the response
      const correctedMatch = response.match(/CORRECTED TEXT:\s*([\s\S]*?)(?=ERRORS FOUND:|$)/);
      const errorsMatch = response.match(/ERRORS FOUND:\s*([\s\S]*?)$/);

      const correctedText = correctedMatch ? correctedMatch[1].trim() : text;
      const errorsText = errorsMatch ? errorsMatch[1].trim() : '';

      const errors = errorsText
        .split('\n')
        .filter(line => line.trim() && !line.toLowerCase().includes('no punctuation errors'))
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line);

      const result = {
        correctedText,
        errors
      };

      // Cache successful response
      await cache.set(cacheKey, 'claude-3-5-haiku-20241022', result, {
        input: message.usage?.input_tokens || 0,
        output: message.usage?.output_tokens || 0
      });

      // Report success to API key manager
      apiKeyManager.reportSuccess(keyData.key);

      return NextResponse.json(result);

    } catch (error: any) {
      // Report error to API key manager
      apiKeyManager.reportError(keyData.key, error);
      throw error;
    }

  } catch (error: any) {
    console.error('Punctuation check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check punctuation' },
      { status: 500 }
    );
  }
}
