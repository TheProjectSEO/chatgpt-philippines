import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { purpose, emailType, recipient, keyPoints } = await req.json();

    if (!purpose || typeof purpose !== 'string') {
      return NextResponse.json(
        { error: 'Email purpose is required' },
        { status: 400 }
      );
    }

    const prompt = `You are a professional email writer. Compose an email with the following details:

Purpose: ${purpose}
Email Type: ${emailType}
${recipient ? `Recipient: ${recipient}` : ''}
${keyPoints ? `Key Points to Include: ${keyPoints}` : ''}

Requirements:
- Use appropriate ${emailType} tone
- Include proper greeting and closing
- Keep it concise and clear
- Make it professional and well-structured
- Include subject line at the top

Generate the complete email ready to send.`;

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

    const email = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log(`[Email Writer] Generated ${emailType} email | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      email,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Email Writer API Error:', error);

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
