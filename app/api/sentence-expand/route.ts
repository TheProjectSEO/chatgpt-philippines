import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are a professional writing assistant. Expand the following text by adding relevant details, context, and elaboration while maintaining the original meaning and tone. Make it more comprehensive and informative without changing the core message.

Original text: "${text}"

Provide only the expanded version without any introductory phrases or explanations.`
        }
      ],
    });

    const expanded = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ expanded });
  } catch (error: any) {
    console.error('Sentence expansion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to expand text' },
      { status: 500 }
    );
  }
}
