import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, mode, preserveKeywords } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Build the prompt based on rewrite mode
    const modeInstructions: Record<string, string> = {
      standard: 'Rewrite the text in a balanced way, maintaining clarity and readability while changing the wording and sentence structure.',
      creative: 'Rewrite the text creatively using varied vocabulary, interesting expressions, and engaging phrasing while maintaining the core message.',
      formal: 'Rewrite the text in a professional, formal, and business-appropriate tone suitable for corporate communications.',
      casual: 'Rewrite the text in a relaxed, conversational, and friendly tone as if speaking to a friend.',
      academic: 'Rewrite the text in a scholarly, academic tone suitable for research papers and formal publications.',
      simple: 'Rewrite the text using simpler words and shorter sentences to make it easier to understand for a general audience.',
    };

    let prompt = `You are a professional article rewriter. Your task is to rewrite the following text while:

1. ${modeInstructions[mode] || modeInstructions.standard}
2. Preserving the original meaning and key information
3. Using different sentence structures and wording
4. Maintaining proper grammar and coherence
${preserveKeywords ? '5. Keeping important keywords and SEO-relevant terms intact' : '5. Feel free to change any terminology as needed'}
6. Making the rewritten version unique and plagiarism-free
7. Ensuring the rewrite is natural and flows well

Original text:
${text}

Provide the rewritten version now:`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      temperature: 0.5,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the rewritten text
    const rewritten = message.content[0].type === 'text' ? message.content[0].text : '';

    console.log('[Article Rewriter] Rewrite successful:', {
      mode,
      originalLength: text.length,
      rewrittenLength: rewritten.length,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    });

    return NextResponse.json({
      rewritten,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    });

  } catch (error: any) {
    console.error('Article rewrite error:', error);

    return NextResponse.json(
      {
        error: 'Failed to rewrite article',
        details: error.message
      },
      { status: 500 }
    );
  }
}
