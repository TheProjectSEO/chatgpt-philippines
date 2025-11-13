import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { problem, problemType } = await req.json();

    if (!problem || typeof problem !== 'string') {
      return NextResponse.json(
        { error: 'Math problem is required' },
        { status: 400 }
      );
    }

    const prompt = `You are a math tutor. Solve the following ${problemType} problem with clear, step-by-step explanations.

Problem: ${problem}

Provide:
1. A clear breakdown of the problem
2. Step-by-step solution with explanations
3. Final answer
4. Any relevant formulas or concepts used

Make it educational and easy to understand.`;

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

    const solution = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log(`[Math Solver] Solved ${problemType} problem | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      solution,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Math Solver API Error:', error);

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Solving failed' },
      { status: 500 }
    );
  }
}
