import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { businessIdea, industry, targetMarket, section } = await req.json();

    if (!businessIdea || typeof businessIdea !== 'string') {
      return NextResponse.json(
        { error: 'Business idea is required' },
        { status: 400 }
      );
    }

    const prompt = section === 'full'
      ? `Create a comprehensive business plan for the following business:

Business Idea: ${businessIdea}
Industry: ${industry}
Target Market: ${targetMarket}

Create a complete business plan with these sections:
1. Executive Summary
2. Company Description
3. Market Analysis
4. Organization and Management
5. Products/Services
6. Marketing Strategy
7. Financial Projections

Provide detailed, actionable content for each section.`
      : `Create the ${section} section of a business plan for:

Business Idea: ${businessIdea}
Industry: ${industry}
Target Market: ${targetMarket}

Provide detailed, professional content for the ${section} section only.`;

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

    const businessPlan = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log(`[Business Plan] ${section} | Tokens: ${message.usage.input_tokens}/${message.usage.output_tokens}`);

    return NextResponse.json({
      businessPlan,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Business Plan API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
