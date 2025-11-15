import Anthropic from '@anthropic-ai/sdk';
import type { Tool } from './anthropicSDK.types';

/**
 * SDK configuration options
 */
export interface SDKOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  enableThinking?: boolean;
  thinkingBudget?: number;
  tools?: Tool[];
  systemPromptCaching?: boolean;
  systemPrompt?: string;
  apiKey?: string;
}

/**
 * SDK response interface
 */
export interface SDKResponse {
  response: string;
  thinking?: string;
  toolUses?: Array<{
    name: string;
    input: any;
    result: any;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
  rawResponse?: Anthropic.Message;
}

/**
 * Tool use block interface
 */
interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: any;
}

/**
 * Thinking block interface
 */
interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
}

/**
 * Text block interface
 */
interface TextBlock {
  type: 'text';
  text: string;
}

/**
 * Advanced Anthropic SDK Wrapper
 * Supports extended thinking, tool calling, and prompt caching
 */
export class AnthropicSDK {
  private client: Anthropic;
  private defaultOptions: Required<Omit<SDKOptions, 'tools' | 'systemPrompt' | 'apiKey'>>;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });

    this.defaultOptions = {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      temperature: 1.0,
      enableThinking: false,
      thinkingBudget: 10000,
      systemPromptCaching: false,
    };
  }

  /**
   * Create a message with advanced features
   */
  async createMessage(
    messages: Anthropic.MessageParam[],
    options: SDKOptions = {}
  ): Promise<SDKResponse> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const tools = options.tools || [];

    // Build system prompt with caching if enabled
    const systemPrompt = this.buildSystemPrompt(
      options.systemPrompt,
      mergedOptions.systemPromptCaching
    );

    // Build request parameters
    const requestParams: Anthropic.MessageCreateParams = {
      model: mergedOptions.model,
      max_tokens: mergedOptions.maxTokens,
      temperature: mergedOptions.temperature,
      messages,
      ...(systemPrompt && { system: systemPrompt }),
      ...(tools.length > 0 && { tools: this.convertToolsToAnthropicFormat(tools) }),
    };

    // Add beta headers for extended thinking
    const headers: Record<string, string> = {};
    if (mergedOptions.enableThinking) {
      headers['anthropic-beta'] = 'max-tokens-3-5-sonnet-2024-07-15';
      // Add thinking budget to request
      (requestParams as any).thinking = {
        type: 'enabled',
        budget_tokens: mergedOptions.thinkingBudget,
      };
    }

    try {
      // Make initial API call
      let response = await this.client.messages.create(requestParams, {
        headers: Object.keys(headers).length > 0 ? headers : undefined,
      });

      // Handle tool calling loop
      const conversationMessages = [...messages];
      const toolUses: Array<{ name: string; input: any; result: any }> = [];
      let thinking: string | undefined;

      while (this.hasToolUse(response)) {
        // Extract thinking if present
        if (!thinking) {
          thinking = this.extractThinking(response);
        }

        // Extract and execute tools
        const toolResults = await this.executeTools(response, tools);
        toolUses.push(...toolResults);

        // Add assistant message and tool results to conversation
        conversationMessages.push({
          role: 'assistant',
          content: response.content,
        });

        conversationMessages.push({
          role: 'user',
          content: toolResults.map(tr => ({
            type: 'tool_result' as const,
            tool_use_id: tr.toolUseId,
            content: JSON.stringify(tr.result),
          })),
        });

        // Continue conversation
        response = await this.client.messages.create(
          {
            ...requestParams,
            messages: conversationMessages,
          },
          {
            headers: Object.keys(headers).length > 0 ? headers : undefined,
          }
        );
      }

      // Extract final thinking if not already extracted
      if (!thinking) {
        thinking = this.extractThinking(response);
      }

      // Extract final text response
      const finalResponse = this.extractTextResponse(response);

      return {
        response: finalResponse,
        thinking,
        toolUses: toolUses.length > 0 ? toolUses : undefined,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          cache_creation_input_tokens: (response.usage as any).cache_creation_input_tokens,
          cache_read_input_tokens: (response.usage as any).cache_read_input_tokens,
        },
        rawResponse: response,
      };
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Anthropic API Error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Build system prompt with optional caching
   */
  private buildSystemPrompt(
    systemPrompt?: string,
    enableCaching: boolean = false
  ): Anthropic.Messages.MessageCreateParams['system'] | undefined {
    if (!systemPrompt) return undefined;

    if (enableCaching) {
      return [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        } as any,
      ];
    }

    return systemPrompt;
  }

  /**
   * Convert tool definitions to Anthropic format
   */
  private convertToolsToAnthropicFormat(tools: Tool[]): Anthropic.Tool[] {
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema as any,
    }));
  }

  /**
   * Check if response contains tool use
   */
  private hasToolUse(response: Anthropic.Message): boolean {
    return response.content.some(block => block.type === 'tool_use');
  }

  /**
   * Extract thinking content from response
   */
  private extractThinking(response: Anthropic.Message): string | undefined {
    // @ts-ignore - Extended thinking may not be in current SDK types
    const thinkingBlocks = response.content.filter(
      (block: any): boolean => block.type === 'thinking'
    ) as unknown as ThinkingBlock[];

    if (thinkingBlocks.length === 0) return undefined;

    return thinkingBlocks.map(block => block.thinking).join('\n\n');
  }

  /**
   * Extract text response from message
   */
  private extractTextResponse(response: Anthropic.Message): string {
    const textBlocks = response.content.filter(
      (block): block is TextBlock => block.type === 'text'
    );

    return textBlocks.map(block => block.text).join('\n\n');
  }

  /**
   * Execute tools from response
   */
  private async executeTools(
    response: Anthropic.Message,
    tools: Tool[]
  ): Promise<Array<{ name: string; input: any; result: any; toolUseId: string }>> {
    const toolUseBlocks = response.content.filter(
      (block): block is ToolUseBlock => block.type === 'tool_use'
    );

    const results = await Promise.all(
      toolUseBlocks.map(async block => {
        const tool = tools.find(t => t.name === block.name);

        if (!tool) {
          return {
            name: block.name,
            input: block.input,
            result: { error: `Tool ${block.name} not found` },
            toolUseId: block.id,
          };
        }

        try {
          const result = await tool.execute(block.input);
          return {
            name: block.name,
            input: block.input,
            result,
            toolUseId: block.id,
          };
        } catch (error) {
          return {
            name: block.name,
            input: block.input,
            result: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
            toolUseId: block.id,
          };
        }
      })
    );

    return results;
  }
}

/**
 * Convenience function to create a message
 */
export async function createSDKMessage(
  messages: Anthropic.MessageParam[],
  options: SDKOptions = {}
): Promise<SDKResponse> {
  const sdk = new AnthropicSDK(options.apiKey);
  return sdk.createMessage(messages, options);
}

/**
 * Create a streaming message (future enhancement)
 */
export async function createStreamingMessage(
  messages: Anthropic.MessageParam[],
  options: SDKOptions = {},
  onChunk?: (chunk: string) => void
): Promise<SDKResponse> {
  // Placeholder for streaming implementation
  throw new Error('Streaming not yet implemented');
}

/**
 * Helper to create tool definition
 */
export function createTool(
  name: string,
  description: string,
  properties: Record<string, any>,
  execute: (input: any) => Promise<any>,
  required?: string[]
): Tool {
  return {
    name,
    description,
    input_schema: {
      type: 'object',
      properties,
      ...(required && { required }),
    },
    execute,
  };
}

/**
 * Example MCP tool adapter
 */
export function mcpToolToSDKTool(
  mcpTool: {
    name: string;
    description: string;
    inputSchema: any;
  },
  executeFunction: (input: any) => Promise<any>
): Tool {
  return {
    name: mcpTool.name,
    description: mcpTool.description,
    input_schema: mcpTool.inputSchema,
    execute: executeFunction,
  };
}
