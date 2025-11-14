import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Check text length (3000 character limit)
    if (text.length > 3000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 3000 characters' },
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

        console.log(`[Rate Limit] Plagiarism Check: ${rateLimit.count}/${rateLimit.limit} used`);
      }
    } catch (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    // Create plagiarism check prompt
    const systemPrompt = `You are an expert plagiarism detection assistant.
Analyze the provided text for potential plagiarism indicators including:
1. Writing style consistency
2. Tone and vocabulary shifts
3. Formatting inconsistencies
4. Overly complex or simple passages
5. Common plagiarism patterns

Provide a detailed analysis report including:
- Overall assessment (Original/Likely Original/Suspicious/Likely Plagiarized)
- Specific areas of concern if any
- Recommendations for the writer

Be honest but helpful in your assessment.`;

    const userPrompt = `Analyze this text for potential plagiarism:\n\n${text}`;

    // Call Claude API for plagiarism analysis using Haiku
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.3, // Lower temperature for consistent analysis
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract analysis from response
    const analysis = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Log usage for monitoring
    console.log(`[Plagiarism Check] Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      analysis,
      count: rateLimitCount,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Plagiarism Check API Error:', error);

    // Handle Anthropic API errors
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Plagiarism check failed' },
      { status: 500 }
    );
  }
}
