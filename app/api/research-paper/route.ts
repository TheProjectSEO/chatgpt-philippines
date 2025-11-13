import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { topic, researchType, citationStyle, additionalInfo } = await req.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Research topic is required' },
        { status: 400 }
      );
    }

    // Create research paper prompt
    const prompt = `You are an academic research paper writer. Generate a well-structured research paper on the following topic:

Topic: ${topic}
Research Type: ${researchType}
Citation Style: ${citationStyle}
${additionalInfo ? `Additional Requirements: ${additionalInfo}` : ''}

Generate a comprehensive research paper that includes:
1. Title
2. Abstract (150-250 words)
3. Introduction with background and research questions
4. Literature Review
5. Methodology
6. Expected Results/Discussion
7. Conclusion
8. References (in ${citationStyle} format)

Make it academically rigorous, well-cited, and properly formatted. The paper should be 1500-2000 words.`;

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

    const paper = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    console.log(`[Research Paper] Generated for topic: ${topic} | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      paper,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Research Paper API Error:', error);

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
