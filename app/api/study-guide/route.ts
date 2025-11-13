import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { topic, level, format, content } = await req.json();

    if (!topic || !content) {
      return NextResponse.json(
        { error: 'Topic and content are required' },
        { status: 400 }
      );
    }

    const prompt = `Create a ${format} study guide for ${level} students on the following topic:

Topic: ${topic}
Study Material: ${content}

Generate a comprehensive study guide that includes:
- Key concepts and definitions
- Important points to remember
- ${format === 'flashcards' ? 'Question and answer pairs' : format === 'notes' ? 'Organized notes with headings' : 'Practice questions with answers'}
- Summary of main ideas

Format the output clearly for easy studying.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 3072,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const studyGuide = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log(`[Study Guide] ${format} | ${level} | Tokens: ${message.usage.input_tokens}/${message.usage.output_tokens}`);

    return NextResponse.json({
      studyGuide,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Study Guide API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
