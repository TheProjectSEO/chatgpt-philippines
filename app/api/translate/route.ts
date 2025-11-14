import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { getCacheManager } from '@/lib/cache';
import { getAPIKeyManager } from '@/lib/apiKeyManager';

export const dynamic = 'force-dynamic';

// Map of language codes to full language names for better translation prompts
const languageNames: Record<string, string> = {
  'auto': 'Auto-detect',
  'tl': 'Filipino (Tagalog)',
  'en': 'English',
  'es': 'Spanish',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'hi': 'Hindi',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',
  'nl': 'Dutch',
  'tr': 'Turkish',
  'pl': 'Polish',
  'uk': 'Ukrainian',
  'cs': 'Czech',
  'sv': 'Swedish',
  'da': 'Danish',
  'fi': 'Finnish',
  'no': 'Norwegian',
  'el': 'Greek',
  'he': 'Hebrew',
};

export async function POST(req: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await req.json();

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!targetLang) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Check text length (5000 character limit)
    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 5000 characters' },
        { status: 400 }
      );
    }

    // Check rate limit for non-authenticated users
    try {
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

      if (rateLimitResponse.ok) {
        const rateLimit = await rateLimitResponse.json();

        if (rateLimit.blocked) {
          return NextResponse.json({
            error: 'Rate limit exceeded',
            message: 'You have reached your free translation limit. Please sign up to continue.',
            limit: rateLimit.limit,
            count: rateLimit.count,
            remaining: rateLimit.remaining
          }, { status: 429 });
        }

        console.log(`[Rate Limit] Translation: ${rateLimit.count}/${rateLimit.limit} used`);
      }
    } catch (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      // Continue anyway - don't block users if rate limiting fails
    }

    // Check cache
    const cache = await getCacheManager();
    const cacheKey = JSON.stringify({ text, sourceLang, targetLang });
    const cached = await cache.get(cacheKey, 'claude-3-5-haiku-20241022');

    if (cached) {
      console.log('[Translate] Cache hit for request');
      return NextResponse.json({ translation: cached.response });
    }

    // Get API key
    const apiKeyManager = getAPIKeyManager();
    const keyData = apiKeyManager.getAvailableKey();

    if (!keyData) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const anthropic = new Anthropic({ apiKey: keyData.key });

    // Get language names
    const sourceLanguageName = sourceLang === 'auto'
      ? 'the source language (auto-detect)'
      : languageNames[sourceLang] || sourceLang;
    const targetLanguageName = languageNames[targetLang] || targetLang;

    // Create translation prompt
    const prompt = sourceLang === 'auto'
      ? `Translate the following text to ${targetLanguageName}. Detect the source language automatically. Provide ONLY the translation, no explanations or additional text.\n\nText to translate:\n${text}`
      : `Translate the following text from ${sourceLanguageName} to ${targetLanguageName}. Provide ONLY the translation, no explanations or additional text.\n\nText to translate:\n${text}`;

    try {
      // Call Claude API for translation using Haiku (fast and cheap)
      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2048,
        temperature: 0.3, // Lower temperature for more consistent translations
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract translation from response
      const translation = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      // Cache successful response
      await cache.set(cacheKey, 'claude-3-5-haiku-20241022', translation, {
        input: message.usage?.input_tokens || 0,
        output: message.usage?.output_tokens || 0
      });

      // Report success to API key manager
      apiKeyManager.reportSuccess(keyData.key);

      // Log usage for monitoring
      console.log(`[Translation] ${sourceLanguageName} -> ${targetLanguageName} | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

      return NextResponse.json({
        translation,
        detectedSourceLang: sourceLang === 'auto' ? 'auto-detected' : sourceLang,
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
    console.error('Translation API Error:', error);

    // Handle Anthropic API errors
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    );
  }
}
