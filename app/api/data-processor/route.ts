import { NextRequest, NextResponse } from 'next/server';
import { createSDKMessage } from '@/lib/anthropicSDK';
import { getMCPTools } from '@/lib/mcpIntegration';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for complex data analysis

export async function POST(req: NextRequest) {
  try {
    const { data, format } = await req.json();

    if (!data || typeof data !== 'string') {
      return NextResponse.json(
        { error: 'Data is required and must be a string' },
        { status: 400 }
      );
    }

    if (!format || !['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Format must be either "json" or "csv"' },
        { status: 400 }
      );
    }

    // Check data length (20,000 character limit)
    if (data.length > 20000) {
      return NextResponse.json(
        { error: 'Data exceeds maximum length of 20,000 characters' },
        { status: 400 }
      );
    }

    // Get database tools for potential data queries
    const tools = getMCPTools({ categories: ['database'] });

    console.log('[Data Processor] Processing data:', format, '| Length:', data.length);

    // Create data analyst system prompt
    const systemPrompt = `You are an expert data analyst and engineer. Analyze the provided structured data and:

1. DATA QUALITY ASSESSMENT:
   - Completeness: Missing values, null handling
   - Consistency: Data type consistency, format standardization
   - Accuracy: Value ranges, constraints, duplicates

2. STRUCTURE ANALYSIS:
   - Schema design and organization
   - Data type appropriateness
   - Relationships and dependencies

3. STATISTICAL INSIGHTS:
   - Key patterns and trends
   - Anomalies and outliers
   - Data distributions

4. OPTIMIZATION RECOMMENDATIONS:
   - Database indexing strategies
   - Normalization opportunities
   - Query optimization suggestions
   - Best practices for data storage

Provide actionable insights with specific examples from the data. Use database tools if you need to query or demonstrate database operations.

Format your response with:
- Data Quality Score (0-100)
- Key Insights (bullet points)
- Issues Found (with severity: Critical/Warning/Info)
- Transformation Suggestions
- Database Optimization Recommendations`;

    // Create message with extended thinking and database tools
    const result = await createSDKMessage(
      [
        {
          role: 'user',
          content: `Analyze this ${format.toUpperCase()} data:\n\n${data}`,
        },
      ],
      {
        model: 'claude-sonnet-4-20250514',
        enableThinking: true,
        thinkingBudget: 12000,
        tools: tools,
        systemPromptCaching: true,
        systemPrompt: systemPrompt,
        maxTokens: 20480, // Must be > thinkingBudget (12000 + ~8000 for analysis)
        temperature: 1, // Required to be 1 when extended thinking is enabled
      }
    );

    // Parse the analysis to extract structured data
    const analysisText = result.response;

    // Extract data quality score (simple regex, fallback to 0)
    const scoreMatch = analysisText.match(/(?:quality\s+score|score)[:\s]+(\d+)/i);
    const qualityScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

    // Extract issues by severity
    const issues = {
      critical: [] as string[],
      warning: [] as string[],
      info: [] as string[],
    };

    const criticalMatches = analysisText.match(/critical[:\s]+(.+?)(?=\n\n|\n-|\nwarning|$)/gis);
    const warningMatches = analysisText.match(/warning[:\s]+(.+?)(?=\n\n|\n-|\ninfo|$)/gis);
    const infoMatches = analysisText.match(/info[:\s]+(.+?)(?=\n\n|\n-|$)/gis);

    if (criticalMatches) issues.critical = criticalMatches.map(m => m.trim());
    if (warningMatches) issues.warning = warningMatches.map(m => m.trim());
    if (infoMatches) issues.info = infoMatches.map(m => m.trim());

    return NextResponse.json({
      analysis: analysisText,
      thinking: result.thinking,
      qualityScore,
      issues,
      toolsUsed: result.toolUses?.map(t => ({
        name: t.name,
        input: t.input,
      })),
      usage: result.usage,
    });
  } catch (error: any) {
    console.error('[Data Processor] Error:', error);

    return NextResponse.json(
      {
        error: 'Data processing failed',
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}
