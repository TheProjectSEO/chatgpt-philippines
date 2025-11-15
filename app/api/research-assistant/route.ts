import { NextRequest, NextResponse } from 'next/server';
import { createSDKMessage } from '@/lib/anthropicSDK';
import { getMCPTools } from '@/lib/mcpIntegration';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for complex research queries

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Get MCP tools for research
    const tools = getMCPTools() as any;

    console.log('[Research Assistant] Processing query:', query.substring(0, 100));

    // Create research assistant system prompt
    const systemPrompt = `You are an advanced research assistant with access to web search and documentation lookup tools. Your goal is to provide comprehensive, well-researched answers with proper citations.

When conducting research:
1. Use the webSearch tool to find current information, facts, and diverse perspectives
2. Use the documentationLookup tool for technical topics requiring official documentation
3. Think step-by-step about the research process
4. Synthesize information from multiple sources
5. Always cite your sources clearly
6. Provide balanced, objective analysis

Format your response with:
- Clear, structured answer
- Evidence and citations
- Multiple perspectives when relevant
- Confidence level for claims

Be thorough but concise. Prioritize accuracy and source quality.`;

    // Create message with extended thinking and tools
    const result = await createSDKMessage(
      [
        {
          role: 'user',
          content: query,
        },
      ],
      {
        model: 'claude-sonnet-4-20250514',
        enableThinking: true,
        thinkingBudget: 10000,
        tools: tools,
        systemPromptCaching: true,
        systemPrompt: systemPrompt,
        maxTokens: 16384, // Must be > thinkingBudget (10000 + ~6000 for response)
        temperature: 1.0,
      }
    );

    // Format sources from tool uses
    const sources: Array<{ title: string; url: string; source: string }> = [];

    if (result.toolUses) {
      result.toolUses.forEach(toolUse => {
        if (toolUse.name === 'webSearch' && toolUse.result?.results) {
          toolUse.result.results.forEach((r: any) => {
            sources.push({
              title: r.title,
              url: r.url,
              source: r.source,
            });
          });
        }
        if (toolUse.name === 'documentationLookup' && toolUse.result?.documentation) {
          sources.push({
            title: toolUse.result.documentation.title,
            url: toolUse.result.documentation.url,
            source: `${toolUse.result.library} Documentation`,
          });
        }
      });
    }

    return NextResponse.json({
      answer: result.response,
      thinking: result.thinking,
      sources: sources,
      toolsUsed: result.toolUses?.map(t => ({
        name: t.name,
        input: t.input,
      })),
      usage: result.usage,
    });
  } catch (error: any) {
    console.error('[Research Assistant] Error:', error);

    return NextResponse.json(
      { 
        error: 'Research failed', 
        message: error.message || 'An unexpected error occurred' 
      },
      { status: 500 }
    );
  }
}
