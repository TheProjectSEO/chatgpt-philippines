import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { sourceInfo, citationStyle, sourceType } = await req.json();

    if (!sourceInfo || typeof sourceInfo !== 'string') {
      return NextResponse.json(
        { error: 'Source information is required' },
        { status: 400 }
      );
    }

    const prompt = `Create a properly formatted bibliography citation in ${citationStyle} style for the following ${sourceType}:\n\n${sourceInfo}\n\nProvide ONLY the citation in the correct format, no explanations.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const bibliography = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log(`[Bibliography] ${citationStyle} | ${sourceType} | Tokens: ${message.usage.input_tokens}/${message.usage.output_tokens}`);

    return NextResponse.json({
      bibliography,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Bibliography API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
