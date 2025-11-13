import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { theme, style, mood, length } = await req.json();

    if (!theme || typeof theme !== 'string') {
      return NextResponse.json(
        { error: 'Theme is required' },
        { status: 400 }
      );
    }

    const prompt = `Write a ${length} poem in ${style} style with a ${mood} mood about the following theme:

Theme: ${theme}

Create an original, creative poem that:
- Follows the ${style} poetic structure
- Conveys a ${mood} emotional tone
- Is approximately ${length} in length
- Uses vivid imagery and engaging language

Provide ONLY the poem, no title or commentary.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1536,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const poem = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log(`[Poem] ${style} | ${mood} | Tokens: ${message.usage.input_tokens}/${message.usage.output_tokens}`);

    return NextResponse.json({
      poem,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Poem API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
