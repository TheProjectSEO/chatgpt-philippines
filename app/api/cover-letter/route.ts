import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, companyName, experience, whyInterested } = await req.json();

    // Validate input
    if (!jobTitle || typeof jobTitle !== 'string') {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    if (!companyName || typeof companyName !== 'string') {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Create cover letter generation prompt
    const prompt = `Write a professional cover letter for the following job application:

Job Title: ${jobTitle}
Company Name: ${companyName}
${experience ? `Relevant Experience: ${experience}` : ''}
${whyInterested ? `Why Interested in Role: ${whyInterested}` : ''}

Requirements:
- Use a professional business letter format
- Write a compelling opening that grabs attention
- Highlight relevant experience and skills that match the job
- Show enthusiasm for the role and company
- Include specific examples of achievements
- Close with a strong call to action
- Keep it concise (250-350 words)
- Use professional but personable tone

Structure:
1. Opening paragraph - State the position and express interest
2. Body paragraphs - Highlight qualifications and relevant experience
3. Closing paragraph - Express enthusiasm and request an interview

Write the complete cover letter now (without address fields, just the letter content):`;

    // Call Claude API for cover letter generation using Haiku
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      temperature: 0.5, // Slightly higher for more creative/personable writing
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract cover letter from response
    const coverLetter = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Log usage for monitoring
    console.log(`[Cover Letter] ${jobTitle} at ${companyName} | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      coverLetter,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Cover Letter API Error:', error);

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Cover letter generation failed' },
      { status: 500 }
    );
  }
}
