import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const languageNames: Record<string, string> = {
  'python': 'Python',
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'java': 'Java',
  'cpp': 'C++',
  'csharp': 'C#',
  'php': 'PHP',
  'ruby': 'Ruby',
  'go': 'Go',
  'rust': 'Rust',
  'swift': 'Swift',
  'kotlin': 'Kotlin',
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, language } = await req.json();

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: 'Programming language is required' },
        { status: 400 }
      );
    }

    // Check text length (2000 character limit)
    if (prompt.length > 2000) {
      return NextResponse.json(
        { error: 'Prompt exceeds maximum length of 2000 characters' },
        { status: 400 }
      );
    }

    // Check rate limit for non-authenticated users
    let rateLimitCount = 0;
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
        rateLimitCount = rateLimit.count;

        if (rateLimit.blocked) {
          return NextResponse.json({
            error: 'Rate limit exceeded',
            message: 'You have reached your free usage limit. Please sign up to continue.',
            limit: rateLimit.limit,
            count: rateLimit.count,
            remaining: rateLimit.remaining
          }, { status: 429 });
        }

        console.log(`[Rate Limit] Code Generation: ${rateLimit.count}/${rateLimit.limit} used`);
      }
    } catch (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    // Get language name
    const languageName = languageNames[language] || language;

    // Create code generation prompt
    const systemPrompt = `You are an expert programmer. Generate clean, efficient, and well-documented code based on the user's request.
Include comments explaining the code. Follow best practices for ${languageName}.
Provide ONLY the code without any explanations before or after it.`;

    const userPrompt = `Generate ${languageName} code for the following request:\n\n${prompt}`;

    // Call Claude API for code generation using Haiku
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.3, // Lower temperature for more consistent code generation
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract code from response
    const code = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Log usage for monitoring
    console.log(`[Code Generation] ${languageName} | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      code,
      language: languageName,
      count: rateLimitCount,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Code Generation API Error:', error);

    // Handle Anthropic API errors
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Code generation failed' },
      { status: 500 }
    );
  }
}
