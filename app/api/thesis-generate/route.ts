import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { topic, essayType, stance } = await req.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const prompt = `You are an academic writing expert. Generate 3 strong, clear thesis statements for the following:

Topic: ${topic}
Essay Type: ${essayType}
${stance ? `Stance/Position: ${stance}` : ''}

Requirements:
- Each thesis should be specific, arguable, and focused
- Each should be 1-2 sentences maximum
- Make them different in approach or emphasis
- Follow best practices for ${essayType} essays

Return ONLY the 3 thesis statements, numbered 1-3, with no additional explanation.`;

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

    const response = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse the response to extract the 3 thesis statements
    const thesisStatements = response
      .split(/\d+\./)
      .filter(s => s.trim())
      .map(s => s.trim())
      .slice(0, 3);

    console.log(`[Thesis Generator] Generated for topic: ${topic} | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      thesisStatements,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Thesis Generator API Error:', error);

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
