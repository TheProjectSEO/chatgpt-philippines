/**
 * Type definitions for Anthropic SDK Wrapper
 * Provides strict typing for all SDK features
 */

import type Anthropic from '@anthropic-ai/sdk';

/**
 * JSON Schema property definition
 */
export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  enum?: string[] | number[];
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  default?: any;
  minimum?: number;
  maximum?: number;
  pattern?: string;
}

/**
 * Tool input schema following JSON Schema format
 */
export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * Tool definition interface
 */
export interface Tool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  input_schema: ToolInputSchema;
  execute: (input: TInput) => Promise<TOutput>;
}

/**
 * Extended thinking configuration
 */
export interface ThinkingConfig {
  enabled: boolean;
  budget_tokens: number;
}

/**
 * Cache control configuration
 */
export interface CacheControl {
  type: 'ephemeral';
}

/**
 * System prompt with cache control
 */
export interface CachedSystemPrompt {
  type: 'text';
  text: string;
  cache_control?: CacheControl;
}

/**
 * SDK configuration options
 */
export interface SDKOptions {
  /** Model to use (default: claude-sonnet-4-20250514) */
  model?: string;

  /** Maximum tokens in response (default: 4096) */
  maxTokens?: number;

  /** Temperature for randomness 0-1 (default: 1.0) */
  temperature?: number;

  /** Enable extended thinking (default: false) */
  enableThinking?: boolean;

  /** Token budget for thinking (default: 10000) */
  thinkingBudget?: number;

  /** Array of tools to make available */
  tools?: Tool[];

  /** Enable prompt caching for system message (default: false) */
  systemPromptCaching?: boolean;

  /** System prompt text */
  systemPrompt?: string;

  /** Override API key */
  apiKey?: string;

  /** Additional metadata */
  metadata?: {
    user_id?: string;
    [key: string]: any;
  };

  /** Stop sequences */
  stopSequences?: string[];

  /** Top K sampling */
  topK?: number;

  /** Top P sampling */
  topP?: number;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  name: string;
  input: any;
  result: any;
  toolUseId: string;
  executionTime?: number;
  error?: string;
}

/**
 * Token usage statistics
 */
export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  thinking_tokens?: number;
}

/**
 * Cost estimation based on token usage
 */
export interface CostEstimate {
  input_cost: number;
  output_cost: number;
  cache_creation_cost?: number;
  cache_read_cost?: number;
  total_cost: number;
  currency: string;
}

/**
 * SDK response interface
 */
export interface SDKResponse {
  /** Final text response from Claude */
  response: string;

  /** Thinking process (if extended thinking enabled) */
  thinking?: string;

  /** Tool execution results (if tools used) */
  toolUses?: ToolExecutionResult[];

  /** Token usage statistics */
  usage: TokenUsage;

  /** Cost estimate */
  cost?: CostEstimate;

  /** Raw Anthropic API response */
  rawResponse?: Anthropic.Message;

  /** Stop reason */
  stopReason?: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';

  /** Model used */
  model?: string;

  /** Request ID for debugging */
  requestId?: string;
}

/**
 * Streaming chunk interface (for future streaming support)
 */
export interface StreamChunk {
  type: 'text' | 'thinking' | 'tool_use' | 'tool_result';
  content: string;
  delta?: string;
  snapshot?: string;
}

/**
 * MCP tool definition (for integration)
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
}

/**
 * Tool builder interface for fluent API
 */
export interface ToolBuilder {
  withName(name: string): ToolBuilder;
  withDescription(description: string): ToolBuilder;
  withProperty(name: string, property: JSONSchemaProperty): ToolBuilder;
  withRequired(...fields: string[]): ToolBuilder;
  withExecutor<TInput, TOutput>(
    executor: (input: TInput) => Promise<TOutput>
  ): Tool<TInput, TOutput>;
  build(): Tool;
}

/**
 * Conversation message types
 */
export type MessageRole = 'user' | 'assistant';

export interface Message {
  role: MessageRole;
  content: string | Anthropic.MessageParam['content'];
}

/**
 * Conversation context
 */
export interface ConversationContext {
  messages: Message[];
  systemPrompt?: string;
  tools?: Tool[];
  metadata?: Record<string, any>;
}

/**
 * SDK error types
 */
export class SDKError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'SDKError';
  }
}

export class ToolExecutionError extends SDKError {
  constructor(
    message: string,
    public toolName: string,
    public input: any,
    public originalError?: Error
  ) {
    super(message, 'TOOL_EXECUTION_ERROR');
    this.name = 'ToolExecutionError';
  }
}

export class APIError extends SDKError {
  constructor(
    message: string,
    statusCode?: number,
    public response?: any
  ) {
    super(message, 'API_ERROR', statusCode);
    this.name = 'APIError';
  }
}

/**
 * Model pricing (tokens per million)
 */
export interface ModelPricing {
  input: number;
  output: number;
  cacheCreation?: number;
  cacheRead?: number;
}

/**
 * Available models and their pricing
 */
export const MODEL_PRICING: Record<string, ModelPricing> = {
  'claude-sonnet-4-20250514': {
    input: 3.0,
    output: 15.0,
    cacheCreation: 3.75,
    cacheRead: 0.30,
  },
  'claude-3-5-sonnet-20241022': {
    input: 3.0,
    output: 15.0,
    cacheCreation: 3.75,
    cacheRead: 0.30,
  },
  'claude-3-opus-20240229': {
    input: 15.0,
    output: 75.0,
    cacheCreation: 18.75,
    cacheRead: 1.50,
  },
};

/**
 * Thinking block interface
 */
export interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
}

/**
 * Text block interface
 */
export interface TextBlock {
  type: 'text';
  text: string;
}

/**
 * Tool use block interface
 */
export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: any;
}

/**
 * Tool result block interface
 */
export interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string | any;
  is_error?: boolean;
}

/**
 * Content block types
 */
export type ContentBlock = ThinkingBlock | TextBlock | ToolUseBlock | ToolResultBlock;

/**
 * Response statistics
 */
export interface ResponseStats {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  thinkingTokens?: number;
  cachedTokens?: number;
  toolCallCount: number;
  responseTime: number;
  cost?: CostEstimate;
}

/**
 * Tool performance metrics
 */
export interface ToolMetrics {
  toolName: string;
  executionCount: number;
  successCount: number;
  errorCount: number;
  avgExecutionTime: number;
  totalExecutionTime: number;
}

/**
 * SDK configuration
 */
export interface SDKConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  defaultMaxTokens?: number;
  defaultTemperature?: number;
  timeout?: number;
  maxRetries?: number;
  enableMetrics?: boolean;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

/**
 * Type guard for checking if a content block is a thinking block
 */
export function isThinkingBlock(block: ContentBlock): block is ThinkingBlock {
  return block.type === 'thinking';
}

/**
 * Type guard for checking if a content block is a text block
 */
export function isTextBlock(block: ContentBlock): block is TextBlock {
  return block.type === 'text';
}

/**
 * Type guard for checking if a content block is a tool use block
 */
export function isToolUseBlock(block: ContentBlock): block is ToolUseBlock {
  return block.type === 'tool_use';
}

/**
 * Type guard for checking if a content block is a tool result block
 */
export function isToolResultBlock(block: ContentBlock): block is ToolResultBlock {
  return block.type === 'tool_result';
}

/**
 * Utility type for extracting input type from a tool
 */
export type ToolInput<T extends Tool> = T extends Tool<infer I, any> ? I : never;

/**
 * Utility type for extracting output type from a tool
 */
export type ToolOutput<T extends Tool> = T extends Tool<any, infer O> ? O : never;

/**
 * Type-safe tool executor function
 */
export type ToolExecutor<TInput = any, TOutput = any> = (
  input: TInput
) => Promise<TOutput>;
