import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { sourceType, citationStyle, sourceInfo } = await request.json();

    if (!sourceType || !citationStyle || !sourceInfo) {
      return NextResponse.json(
        { error: 'Source type, citation style, and source info are required' },
        { status: 400 }
      );
    }

    if (!sourceInfo.title || !sourceInfo.author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a citation formatting expert. Generate a properly formatted ${citationStyle} style citation for the following source:

Source Type: ${sourceType}
Title: ${sourceInfo.title}
Author(s): ${sourceInfo.author}
${sourceInfo.url ? `URL: ${sourceInfo.url}` : ''}
${sourceInfo.date ? `Publication Date: ${sourceInfo.date}` : ''}
${sourceInfo.publisher ? `Publisher/Journal: ${sourceInfo.publisher}` : ''}

Requirements:
- Follow ${citationStyle} style guide rules exactly
- Format all elements correctly (punctuation, capitalization, italics)
- Include all provided information
- Use proper spacing and ordering

Provide ONLY the formatted citation without any introductory text or explanations.`
        }
      ],
    });

    const citation = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ citation });
  } catch (error: any) {
    console.error('Citation generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate citation' },
      { status: 500 }
    );
  }
}
