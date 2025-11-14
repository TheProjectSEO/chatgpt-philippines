/**
 * Agent Service Layer
 * Wraps Claude Agent SDK with existing infrastructure (API keys, cache, analytics)
 */

import { query as agentQuery } from '@anthropic-ai/claude-agent-sdk';
import { getAPIKeyManager } from './apiKeyManager';
import { getCacheManager } from './cache';
import { trackModelUsage } from './analytics';

export interface AgentConfig {
  tools?: string[];
  workingDirectory?: string;
  autoApprove?: boolean;
  useCache?: boolean;
  userId?: string | null;
}

export interface AgentMessage {
  type: string;
  role?: string;
  content?: any;
  text?: string;
  tool?: string;
  input?: any;
  output?: any;
}

export interface AgentResult {
  messages: AgentMessage[];
  finalResponse: string;
  toolCalls: Array<{ tool: string; input: any; output?: any }>;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
}

/**
 * Agent Service - Execute agentic workflows with Claude Agent SDK
 */
export class AgentService {
  /**
   * Execute an agent task with multi-step reasoning
   */
  async execute(
    prompt: string,
    config: AgentConfig = {}
  ): Promise<AgentResult> {
    const startTime = Date.now();

    // Get API key from existing manager
    const apiKeyManager = getAPIKeyManager();
    const keyData = apiKeyManager.getAvailableKey();

    if (!keyData) {
      throw new Error('No API keys available');
    }

    console.log('[Agent] Starting execution with Agent SDK');
    console.log('[Agent] Prompt:', prompt.substring(0, 100) + '...');

    // Check cache if enabled
    if (config.useCache) {
      const cache = await getCacheManager();
      const cacheKey = JSON.stringify({ prompt, config });
      const cached = await cache.get(cacheKey, 'agent');

      if (cached) {
        console.log('[Agent] Returning cached result');
        return cached.response as AgentResult;
      }
    }

    const result: AgentResult = {
      messages: [],
      finalResponse: '',
      toolCalls: [],
    };

    try {
      // Configure agent options
      const options: any = {
        apiKey: keyData.key,
        cwd: config.workingDirectory || '/tmp/agent-workspace',
      };

      // Add allowed tools if specified
      if (config.tools && config.tools.length > 0) {
        options.allowed_tools = config.tools;
      }

      // Add permission mode
      if (config.autoApprove !== undefined) {
        options.permission_mode = config.autoApprove ? 'acceptEdits' : 'requireApproval';
      }

      console.log('[Agent] Options:', JSON.stringify(options, null, 2));

      // Execute agent query
      let finalText = '';

      for await (const message of agentQuery({
        prompt,
        options,
      })) {
        result.messages.push(message);

        // Extract text content from any message
        const msg = message as any;
        if (msg.text) {
          finalText += msg.text;
        } else if (msg.content && typeof msg.content === 'string') {
          finalText += msg.content;
        }

        // Track tool usage
        if (msg.type === 'tool_use' || msg.tool) {
          const toolCall = {
            tool: msg.tool || msg.type,
            input: msg.input || {},
            output: msg.output,
          };
          result.toolCalls.push(toolCall);
          console.log('[Agent] Tool call:', toolCall.tool);
        }

        // Log progress
        if (msg.type && msg.content) {
          console.log('[Agent] Message:', JSON.stringify(message).substring(0, 200));
        }
      }

      result.finalResponse = finalText;

      // Estimate usage (Agent SDK doesn't always expose token counts)
      const estimatedInputTokens = Math.ceil(prompt.length / 4);
      const estimatedOutputTokens = Math.ceil(finalText.length / 4);
      const estimatedCost = (estimatedInputTokens * 0.003 / 1000) + (estimatedOutputTokens * 0.015 / 1000);

      result.usage = {
        inputTokens: estimatedInputTokens,
        outputTokens: estimatedOutputTokens,
        cost: estimatedCost,
      };

      const executionTime = Date.now() - startTime;
      console.log('[Agent] Execution completed in', executionTime, 'ms');
      console.log('[Agent] Tool calls:', result.toolCalls.length);
      console.log('[Agent] Final response length:', finalText.length);

      // Track usage in analytics
      await trackModelUsage({
        user_id: config.userId || null,
        model: 'claude-agent-sdk',
        input_tokens: estimatedInputTokens,
        output_tokens: estimatedOutputTokens,
        cost_usd: estimatedCost,
      }).catch((error) => {
        console.error('[Agent] Failed to track usage:', error);
      });

      // Cache successful result
      if (config.useCache) {
        const cache = await getCacheManager();
        const cacheKey = JSON.stringify({ prompt, config });
        await cache.set(cacheKey, 'agent', result, {
          input: estimatedInputTokens,
          output: estimatedOutputTokens,
        }).catch((error) => {
          console.error('[Agent] Failed to cache result:', error);
        });
      }

      // Report success to API key manager
      apiKeyManager.reportSuccess(keyData.key);

      return result;
    } catch (error: any) {
      console.error('[Agent] Execution error:', error);

      // Report error to API key manager
      apiKeyManager.reportError(keyData.key, error);

      result.error = error.message || 'Agent execution failed';
      return result;
    }
  }

  /**
   * Stream agent execution (for real-time UI updates)
   */
  async *executeStream(
    prompt: string,
    config: AgentConfig = {}
  ): AsyncGenerator<AgentMessage, void, unknown> {
    const apiKeyManager = getAPIKeyManager();
    const keyData = apiKeyManager.getAvailableKey();

    if (!keyData) {
      throw new Error('No API keys available');
    }

    const options: any = {
      apiKey: keyData.key,
      cwd: config.workingDirectory || '/tmp/agent-workspace',
    };

    if (config.tools && config.tools.length > 0) {
      options.allowed_tools = config.tools;
    }

    if (config.autoApprove !== undefined) {
      options.permission_mode = config.autoApprove ? 'acceptEdits' : 'requireApproval';
    }

    try {
      for await (const message of agentQuery({ prompt, options })) {
        yield message;
      }

      apiKeyManager.reportSuccess(keyData.key);
    } catch (error: any) {
      console.error('[Agent] Stream error:', error);
      apiKeyManager.reportError(keyData.key, error);
      throw error;
    }
  }
}

// Singleton instance
let agentServiceInstance: AgentService | null = null;

/**
 * Get the singleton Agent Service instance
 */
export function getAgentService(): AgentService {
  if (!agentServiceInstance) {
    agentServiceInstance = new AgentService();
  }
  return agentServiceInstance;
}

/**
 * Reset singleton (useful for testing)
 */
export function resetAgentService(): void {
  agentServiceInstance = null;
}
