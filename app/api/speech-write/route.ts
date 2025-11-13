import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { occasion, audience, keyPoints, speechType, tone, duration } = await req.json();

    if (!occasion || !keyPoints) {
      return NextResponse.json(
        { error: 'Occasion and key points are required' },
        { status: 400 }
      );
    }

    const prompt = `Write a ${duration} ${speechType} speech with a ${tone} tone for the following occasion:

Occasion: ${occasion}
Audience: ${audience || 'General audience'}
Key Points to Include: ${keyPoints}

Create a complete, well-structured speech that:
- Opens with a strong introduction
- Covers all key points naturally
- Maintains the appropriate tone throughout
- Has a memorable conclusion
- Fits within the ${duration} timeframe

Provide ONLY the speech text, no additional commentary.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const speech = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log(`[Speech] ${speechType} | ${tone} | Tokens: ${message.usage.input_tokens}/${message.usage.output_tokens}`);

    return NextResponse.json({
      speech,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Speech API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
