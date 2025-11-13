import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, contentType, tone, wordCount, keywords } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Build the prompt for Filipino content generation
    let prompt = `You are a professional Filipino content writer who creates high-quality content in Tagalog/Filipino language.

Generate a ${contentType} in Filipino (Tagalog) language with the following specifications:

Topic: ${topic}
Content Type: ${contentType}
Tone: ${tone}
Target Word Count: ${wordCount} words
${keywords ? `Keywords to include: ${keywords}` : ''}

Requirements:
1. Write ENTIRELY in Filipino/Tagalog language (not English)
2. Make the content engaging, natural, and culturally appropriate for Filipino audiences
3. Use proper Filipino grammar and vocabulary
4. Make it ${tone} in tone
5. Target approximately ${wordCount} words
${keywords ? `6. Naturally incorporate these keywords: ${keywords}` : ''}
7. Structure the content appropriately for a ${contentType}
8. Make it SEO-friendly if applicable
9. Use conversational Filipino that resonates with local readers

Generate the complete ${contentType} now:`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the generated content
    const content = message.content[0].type === 'text' ? message.content[0].text : '';

    console.log('[Filipino Writer] Generation successful:', {
      topic,
      contentType,
      wordCount: content.split(/\s+/).length,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    });

    return NextResponse.json({
      content,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    });

  } catch (error: any) {
    console.error('Filipino content generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate Filipino content',
        details: error.message
      },
      { status: 500 }
    );
  }
}
