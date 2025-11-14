import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { subject, category } = await request.json();

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    const categoryPrompt = category ? `\nType of content: ${category}` : '';

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1536,
      messages: [
        {
          role: 'user',
          content: `You are a creative topic generator. Generate 15 interesting, engaging, and researchable topic ideas for the following subject area:${categoryPrompt}

Subject: "${subject}"

Requirements:
- Make topics specific and focused enough to write about
- Include a variety of angles and perspectives
- Make topics thought-provoking and current
- Ensure topics are appropriate for academic or professional writing
- Mix different difficulty levels and scopes

Provide ONLY the 15 topic ideas, one per line, without numbering or additional text.`
        }
      ],
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '';
    const topics = response.split('\n').filter(line => line.trim()).slice(0, 15);

    return NextResponse.json({ topics });
  } catch (error: any) {
    console.error('Topic generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate topics' },
      { status: 500 }
    );
  }
}
