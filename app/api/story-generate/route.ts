import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, genre, length, characters } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Story prompt is required' },
        { status: 400 }
      );
    }

    const wordCounts: Record<string, string> = {
      short: '300-500',
      medium: '500-800',
      long: '800-1200',
    };

    const targetWords = wordCounts[length] || '500-800';

    const prompt_text = `You are a creative story writer. Write an engaging ${genre} story based on this idea:

${prompt}

${characters ? `Main Characters: ${characters}` : ''}

Requirements:
- Genre: ${genre}
- Length: ${targetWords} words
- Include proper story structure (beginning, middle, end)
- Create engaging characters and dialogue
- Use vivid descriptions
- Make it captivating and well-paced

Write the complete story now.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 3072,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt_text,
        },
      ],
    });

    const story = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log(`[Story Generator] Generated ${genre} story (${length}) | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      story,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Story Generator API Error:', error);

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
