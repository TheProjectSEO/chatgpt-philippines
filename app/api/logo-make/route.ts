import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MAX_FREE_USES = 10;

export async function POST(req: NextRequest) {
  try {
    const { prompt, style, colors } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Brand description is required' }, { status: 400 });
    }

    if (prompt.length > 2000) {
      return NextResponse.json({ error: 'Description exceeds maximum length of 2000 characters' }, { status: 400 });
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

    const systemPrompt = `Generate a detailed logo design concept based on the following parameters:

Brand/Business: ${prompt}
Design Style: ${style}
Color Scheme: ${colors}

Create a comprehensive logo concept description that includes:
1. Primary logo elements and symbolism
2. Typography recommendations (font style, weight)
3. Color palette with specific hex codes
4. Layout and composition details
5. Variations (full logo, icon only, wordmark)
6. Usage guidelines and scalability notes
7. Brand personality it conveys

Provide a professional, detailed logo concept that a designer could use as a brief.

Provide ONLY the logo concept description, no additional commentary.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      temperature: 0.7,
      messages: [{ role: 'user', content: systemPrompt }],
    });

    const description = message.content[0].type === 'text' ? message.content[0].text : '';

    // Increment rate limit
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

    console.log(`[Logo] ${style} ${colors} | Input: ${message.usage.input_tokens} | Output: ${message.usage.output_tokens}`);

    return NextResponse.json({
      description,
      parameters: { style, colors },
      remaining: MAX_FREE_USES - 1,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Logo API Error:', error);
    if (error.status === 429) {
      return NextResponse.json({ error: 'API rate limit exceeded. Please try again later.' }, { status: 429 });
    }
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
