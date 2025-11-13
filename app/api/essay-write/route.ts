import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { topic, essayType, wordCount } = await req.json();

    // Validate input
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    if (!essayType) {
      return NextResponse.json(
        { error: 'Essay type is required' },
        { status: 400 }
      );
    }

    // Create essay writing prompt
    const prompt = `Write a ${wordCount || 500}-word ${essayType} essay on the following topic:

Topic: ${topic}

Requirements:
- Create a well-structured essay with clear introduction, body paragraphs, and conclusion
- Use proper academic writing style
- Include relevant examples and evidence
- Maintain coherent flow and logical arguments
- Target word count: ${wordCount || 500} words

Please write the complete essay now:`;

    // Call Claude API for essay generation using Haiku
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract essay from response
    const essay = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Log usage for monitoring
    console.log(`[Essay Writer] ${essayType} | ${wordCount} words | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      essay,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Essay Writer API Error:', error);

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Essay generation failed' },
      { status: 500 }
    );
  }
}
