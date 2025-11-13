import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, description, industry, style, keywords } = body;

    if (!businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    // Build the prompt for slogan generation
    const styleDescriptions: Record<string, string> = {
      catchy: 'memorable, attention-grabbing, and easy to remember',
      professional: 'business-like, corporate, and trustworthy',
      playful: 'fun, lighthearted, and entertaining',
      inspirational: 'motivating, uplifting, and aspirational',
      modern: 'contemporary, trendy, and forward-thinking',
      classic: 'timeless, traditional, and enduring',
    };

    let prompt = `You are a professional slogan and tagline creator. Generate 10 unique, creative slogans for the following business:

Business Name: ${businessName}
${description ? `Description: ${description}` : ''}
Industry: ${industry}
Style: ${style} (${styleDescriptions[style] || 'catchy and memorable'})
${keywords ? `Keywords to consider: ${keywords}` : ''}

Requirements for each slogan:
1. Short and memorable (3-8 words ideal)
2. ${styleDescriptions[style] || 'Catchy and memorable'}
3. Relevant to the business and industry
4. Easy to understand and pronounce
5. Unique and creative
6. Emotionally resonant
${keywords ? `7. Consider incorporating these keywords naturally: ${keywords}` : ''}

Generate exactly 10 slogans, each on a new line. Provide ONLY the slogans without numbering, bullets, or explanations:`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the generated slogans
    const content = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse slogans from the response
    const slogans = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.match(/^[\d\.\-\*]+/)) // Remove any numbered or bulleted lines
      .slice(0, 10); // Ensure we only return 10 slogans

    console.log('[Slogan Generator] Generation successful:', {
      businessName,
      style,
      sloganCount: slogans.length,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    });

    return NextResponse.json({
      slogans,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    });

  } catch (error: any) {
    console.error('Slogan generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate slogans',
        details: error.message
      },
      { status: 500 }
    );
  }
}
