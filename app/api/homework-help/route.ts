import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const subjectNames: Record<string, string> = {
  'math': 'Mathematics',
  'science': 'Science',
  'english': 'English',
  'history': 'History',
  'geography': 'Geography',
  'physics': 'Physics',
  'chemistry': 'Chemistry',
  'biology': 'Biology',
  'literature': 'Literature',
  'economics': 'Economics',
};

export async function POST(req: NextRequest) {
  try {
    const { question, subject } = await req.json();

    // Validate input
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    // Check text length (2000 character limit)
    if (question.length > 2000) {
      return NextResponse.json(
        { error: 'Question exceeds maximum length of 2000 characters' },
        { status: 400 }
      );
    }

    // Check rate limit for non-authenticated users
    let rateLimitCount = 0;
    try {
      const rateLimitResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/rate-limit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': req.headers.get('x-forwarded-for') || '',
            'x-real-ip': req.headers.get('x-real-ip') || '',
            'cf-connecting-ip': req.headers.get('cf-connecting-ip') || '',
            'x-vercel-forwarded-for': req.headers.get('x-vercel-forwarded-for') || '',
            'user-agent': req.headers.get('user-agent') || '',
            'accept-language': req.headers.get('accept-language') || '',
            'accept-encoding': req.headers.get('accept-encoding') || '',
            'sec-ch-ua': req.headers.get('sec-ch-ua') || '',
            'sec-ch-ua-platform': req.headers.get('sec-ch-ua-platform') || '',
          },
          body: JSON.stringify({ action: 'increment' })
        }
      );

      if (rateLimitResponse.ok) {
        const rateLimit = await rateLimitResponse.json();
        rateLimitCount = rateLimit.count;

        if (rateLimit.blocked) {
          return NextResponse.json({
            error: 'Rate limit exceeded',
            message: 'You have reached your free usage limit. Please sign up to continue.',
            limit: rateLimit.limit,
            count: rateLimit.count,
            remaining: rateLimit.remaining
          }, { status: 429 });
        }

        console.log(`[Rate Limit] Homework Help: ${rateLimit.count}/${rateLimit.limit} used`);
      }
    } catch (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    // Get subject name
    const subjectName = subjectNames[subject] || subject;

    // Create homework help prompt
    const systemPrompt = `You are an expert tutor helping students understand their homework.
Provide clear, step-by-step explanations that help students learn the concept.
Focus on teaching the "why" and "how", not just giving the answer.
Use simple language appropriate for students.
Break down complex problems into manageable steps.`;

    const userPrompt = `Subject: ${subjectName}\n\nQuestion: ${question}\n\nProvide a detailed explanation that helps the student understand how to solve this problem.`;

    // Call Claude API for homework help using Haiku
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.7, // Higher temperature for more natural explanations
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract answer from response
    const answer = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Log usage for monitoring
    console.log(`[Homework Help] ${subjectName} | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      answer,
      subject: subjectName,
      count: rateLimitCount,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Homework Help API Error:', error);

    // Handle Anthropic API errors
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Homework help failed' },
      { status: 500 }
    );
  }
}
