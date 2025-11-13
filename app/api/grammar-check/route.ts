import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GrammarError {
  id: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'style';
  message: string;
  explanation: string;
  suggestion: string;
  start: number;
  end: number;
  originalText: string;
}

// Get client IP for rate limiting
function getClientIP(request: NextRequest): string {
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) return cfConnectingIP;

  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIP = request.headers.get('x-real-ip');
  if (xRealIP) return xRealIP;

  const vercelIP = request.headers.get('x-vercel-forwarded-for');
  if (vercelIP) return vercelIP.split(',')[0].trim();

  return 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'auto' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 5000 characters' },
        { status: 400 }
      );
    }

    // Check rate limit
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
          body: JSON.stringify({ action: 'check' })
        }
      );

      if (rateLimitResponse.ok) {
        const rateLimit = await rateLimitResponse.json();
        if (rateLimit.blocked) {
          return NextResponse.json({
            error: 'Rate limit exceeded',
            message: 'You have reached your free limit. Please sign up to continue.',
            limit: rateLimit.limit,
            count: rateLimit.count,
            remaining: rateLimit.remaining
          }, { status: 429 });
        }
      }
    } catch (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      // Continue anyway - don't block users if rate limiting fails
    }

    // Construct the prompt based on language preference
    let languageContext = '';
    if (language === 'filipino') {
      languageContext = 'The text is in Filipino (Tagalog). ';
    } else if (language === 'english') {
      languageContext = 'The text is in English. ';
    } else {
      languageContext = 'The text may be in Filipino (Tagalog), English, or a mix (Taglish). ';
    }

    const prompt = `${languageContext}Please analyze the following text for grammar, spelling, punctuation, and style errors.

For each error you find, provide:
1. The type of error (grammar, spelling, punctuation, or style)
2. A brief message describing the issue
3. A clear explanation of why it's wrong
4. A suggested correction
5. The exact position in the text (start and end character index)
6. The original text that has the error

Return your response as a JSON array of error objects. Each error object should have this exact structure:
{
  "type": "grammar" | "spelling" | "punctuation" | "style",
  "message": "Brief description",
  "explanation": "Detailed explanation",
  "suggestion": "Corrected text",
  "start": number,
  "end": number,
  "originalText": "Original incorrect text"
}

If there are no errors, return an empty array: []

IMPORTANT:
- Be thorough and catch all mistakes
- Only return valid JSON, no additional text
- For position indices, count from the beginning of the text (0-indexed)
- For Filipino/Taglish, understand code-switching patterns
- Be strict about grammar rules

Text to check:
"""
${text}
"""`;

    // Call Claude API - Using Haiku for cost-effective grammar checking
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      temperature: 0.3, // Lower temperature for more consistent output
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract the text content from Claude's response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse the JSON response
    let errors: GrammarError[] = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedErrors = JSON.parse(jsonMatch[0]);

        // Add unique IDs to each error
        errors = parsedErrors.map((error: Omit<GrammarError, 'id'>, index: number) => ({
          ...error,
          id: `error-${Date.now()}-${index}`
        }));
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      console.error('Raw response:', responseText);

      // Return empty array if parsing fails
      errors = [];
    }

    return NextResponse.json({
      errors,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens
      }
    });

  } catch (error: any) {
    console.error('Grammar check API error:', error);

    // Handle specific Anthropic API errors
    if (error.status === 429) {
      return NextResponse.json({
        error: 'API rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      }, { status: 429 });
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
