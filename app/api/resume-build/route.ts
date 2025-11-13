import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, experience, skills, education } = await req.json();

    // Validate input
    if (!jobTitle || typeof jobTitle !== 'string') {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    if (!experience || typeof experience !== 'string') {
      return NextResponse.json(
        { error: 'Work experience is required' },
        { status: 400 }
      );
    }

    // Create resume building prompt
    const prompt = `Create a professional, ATS-optimized resume for the following candidate:

Job Title: ${jobTitle}
Work Experience: ${experience}
${skills ? `Skills: ${skills}` : ''}
${education ? `Education: ${education}` : ''}

Requirements:
- Use a professional format with clear sections
- Include a compelling professional summary
- Highlight achievements and quantifiable results
- Use action verbs and industry keywords
- Make it ATS-friendly (Applicant Tracking System)
- Keep it concise (1-2 pages worth of content)
- Format should be clean and easy to read

Sections to include:
1. Professional Summary
2. Work Experience (with bullet points of achievements)
3. Skills (if provided)
4. Education (if provided)

Write the complete resume now:`;

    // Call Claude API for resume generation using Haiku
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

    // Extract resume from response
    const resume = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Log usage for monitoring
    console.log(`[Resume Builder] ${jobTitle} | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      resume,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Resume Builder API Error:', error);

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Resume generation failed' },
      { status: 500 }
    );
  }
}
