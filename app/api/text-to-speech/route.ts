import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MAX_FREE_USES = 10;

export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json();

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Check text length
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
          },
          body: JSON.stringify({ action: 'check' })
        }
      );

      if (rateLimitResponse.ok) {
        const rateLimit = await rateLimitResponse.json();

        if (rateLimit.count >= MAX_FREE_USES) {
          return NextResponse.json({
            error: 'Rate limit exceeded',
            message: 'You have reached your free usage limit. Please sign up to continue.',
            remaining: 0
          }, { status: 429 });
        }
      }
    } catch (error) {
      console.error('Rate limit check error:', error);
    }

    // Create prompt for TTS description
    const prompt = `Generate a detailed description of what a text-to-speech audio file would sound like for the following text using a ${voice} voice.

Describe the tone, pacing, emphasis, and how the voice would deliver this content naturally. Make it professional and detailed.

Text to convert to speech:
${text}

Provide ONLY the audio description, no additional commentary.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      temperature: 0.6,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract description
    const description = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Increment rate limit after successful generation
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/rate-limit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': req.headers.get('x-forwarded-for') || '',
            'x-real-ip': req.headers.get('x-real-ip') || '',
          },
          body: JSON.stringify({ action: 'increment' })
        }
      );
    } catch (error) {
      console.error('Rate limit increment error:', error);
    }

    console.log(`[TTS] Voice: ${voice} | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      description,
      voice,
      remaining: MAX_FREE_USES - 1,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('TTS API Error:', error);

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
