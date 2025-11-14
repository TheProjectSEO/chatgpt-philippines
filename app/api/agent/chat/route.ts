import { NextRequest, NextResponse } from 'next/server';
import { getAgentService } from '@/lib/agentService';

export const dynamic = 'force-dynamic';

/**
 * Agent Chat API
 * Uses Claude Agent SDK for agentic workflows with tool use
 *
 * This endpoint provides:
 * - Multi-step reasoning
 * - Tool use (Read, Write, Bash, Grep, etc.)
 * - Streaming responses
 * - Integration with existing infrastructure
 */
export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      enableTools = true,
      tools = ['Read', 'Grep', 'WebSearch'],
      autoApprove = false,
      useCache = true
    } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get the last user message as the prompt
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      );
    }

    const prompt = lastUserMessage.content;

    console.log('[Agent Chat] Starting agent execution');
    console.log('[Agent Chat] Tools enabled:', enableTools);
    console.log('[Agent Chat] Auto-approve:', autoApprove);
    console.log('[Agent Chat] Prompt:', prompt.substring(0, 100) + '...');

    // Get agent service
    const agentService = getAgentService();

    // Create streaming response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Stream agent execution
          for await (const message of agentService.executeStream(prompt, {
            tools: enableTools ? tools : [],
            autoApprove,
            useCache,
            workingDirectory: '/tmp/agent-chat',
          })) {
            // Stream different message types
            if (message.type === 'text' || (message.role === 'assistant' && message.text)) {
              const text = message.text || '';
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'text',
                  text,
                })}\n\n`)
              );
            } else if (message.type === 'tool_use' || message.tool) {
              // Stream tool usage info
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'tool_use',
                  tool: message.tool || message.type,
                  input: message.input || {},
                })}\n\n`)
              );
            } else if (message.type === 'tool_result' || message.output) {
              // Stream tool results
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'tool_result',
                  output: message.output,
                })}\n\n`)
              );
            } else if (message.content) {
              // Generic message content
              const content = typeof message.content === 'string'
                ? message.content
                : JSON.stringify(message.content);

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({
                  type: 'message',
                  content,
                })}\n\n`)
              );
            }
          }

          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();

          console.log('[Agent Chat] Stream completed');
        } catch (error: any) {
          console.error('[Agent Chat] Stream error:', error);

          // Send error to client
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: error.message || 'Agent execution failed',
            })}\n\n`)
          );

          controller.close();
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[Agent Chat] API Error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check agent status
 */
export async function GET() {
  return NextResponse.json({
    status: 'operational',
    service: 'Claude Agent SDK Chat',
    version: '1.0.0',
    features: {
      tools: ['Read', 'Write', 'Bash', 'Grep', 'Glob', 'WebSearch'],
      streaming: true,
      caching: true,
      multiStep: true,
    },
  });
}
