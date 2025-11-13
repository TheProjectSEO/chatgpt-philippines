import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text, length } = await req.json();

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum length of 10,000 characters' },
        { status: 400 }
      );
    }

    // Define length instructions
    const lengthInstructions: Record<string, string> = {
      short: 'Create a very brief summary in 2-3 sentences that captures the main idea.',
      medium: 'Create a concise summary in one paragraph (4-6 sentences) covering the key points.',
      long: 'Create a detailed summary in multiple paragraphs that covers all important points and details.',
      bullet: 'Create a bullet-point summary with 5-7 key takeaways from the text.',
    };

    const instruction = lengthInstructions[length] || lengthInstructions.medium;

    // Create summarization prompt
    const prompt = `${instruction}

Text to summarize:
${text}

Provide ONLY the summary, no preamble or additional commentary.`;

    // Call Claude API for summarization using Haiku
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract summary from response
    const summary = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Log usage for monitoring
    console.log(`[Summarizer] ${length} length | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      summary,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Summarizer API Error:', error);

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Summarization failed' },
      { status: 500 }
    );
  }
}
