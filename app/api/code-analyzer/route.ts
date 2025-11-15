import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert code security and quality analyst with deep expertise in software engineering best practices. Analyze code for:

1. **Security Vulnerabilities**:
   - SQL injection, XSS, CSRF vulnerabilities
   - Authentication and authorization issues
   - Insecure data handling
   - Exposed secrets or credentials
   - Unsafe deserialization

2. **Performance Issues**:
   - N+1 queries
   - Memory leaks
   - Inefficient algorithms
   - Unnecessary computations
   - Poor caching strategies

3. **Best Practices Violations**:
   - Code organization and structure
   - Naming conventions
   - Error handling
   - Documentation gaps
   - SOLID principles violations

4. **Code Smells**:
   - Duplicated code
   - Long methods/classes
   - Dead code
   - God objects
   - Tight coupling

5. **Potential Bugs**:
   - Race conditions
   - Null pointer issues
   - Off-by-one errors
   - Type mismatches
   - Edge case handling

Use extended thinking to reason through complex code patterns and their implications. Provide actionable recommendations with code examples where helpful.

Format your response in clear sections for each category, with severity levels (Critical, Warning, Info) for each finding.`;

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json();

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: 'Programming language is required' },
        { status: 400 }
      );
    }

    // Check code length (10000 character limit for analysis)
    if (code.length > 10000) {
      return NextResponse.json(
        { error: 'Code exceeds maximum length of 10,000 characters' },
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

        console.log(`[Rate Limit] Code Analyzer: ${rateLimit.count}/${rateLimit.limit} used`);
      }
    } catch (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
    }

    // Create analysis prompt
    const userPrompt = `Analyze this ${language} code for security vulnerabilities, performance issues, best practices violations, code smells, and potential bugs:

\`\`\`${language}
${code}
\`\`\`

Provide a comprehensive analysis with:
- Severity level for each issue (Critical/Warning/Info)
- Line numbers where applicable
- Specific recommendations
- Code examples for fixes when relevant`;

    // Call Claude API with extended thinking
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 24576, // Must be > budget_tokens (15000 + ~9500 for analysis)
      temperature: 1, // Required to be 1 when extended thinking is enabled
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      thinking: {
        type: 'enabled',
        budget_tokens: 15000
      }
    });

    // Extract thinking and analysis from response
    let thinkingContent = '';
    let analysisContent = '';

    for (const block of message.content) {
      if (block.type === 'thinking') {
        thinkingContent = block.thinking;
      } else if (block.type === 'text') {
        analysisContent = block.text;
      }
    }

    // Log usage for monitoring
    console.log(`[Code Analyzer] ${language} | Input: ${message.usage.input_tokens} tokens | Output: ${message.usage.output_tokens} tokens`);

    return NextResponse.json({
      analysis: analysisContent,
      thinking: thinkingContent,
      language,
      count: rateLimitCount,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (error: any) {
    console.error('Code Analyzer API Error:', error);

    // Handle Anthropic API errors
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Code analysis failed' },
      { status: 500 }
    );
  }
}
