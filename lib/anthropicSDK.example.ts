/**
 * Example Usage for Anthropic SDK Wrapper
 *
 * This file demonstrates how to use the advanced SDK features:
 * - Extended thinking
 * - Tool calling
 * - Prompt caching
 * - MCP tool integration
 */

import {
  AnthropicSDK,
  createSDKMessage,
  createTool,
  type Tool,
  type SDKResponse,
} from './anthropicSDK';

// ============================================================================
// Example 1: Basic Message with Extended Thinking
// ============================================================================

async function basicThinkingExample() {
  const sdk = new AnthropicSDK();

  const response = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'Solve this complex problem: What is the derivative of x^3 + 2x^2 - 5x + 7?',
      },
    ],
    {
      enableThinking: true,
      thinkingBudget: 5000, // Allow 5000 tokens for thinking
      maxTokens: 2048,
    }
  );

  console.log('Thinking Process:', response.thinking);
  console.log('Final Answer:', response.response);
  console.log('Token Usage:', response.usage);
}

// ============================================================================
// Example 2: Tool Calling - Calculator
// ============================================================================

async function calculatorToolExample() {
  // Define a calculator tool
  const calculatorTool: Tool = createTool(
    'calculator',
    'Perform basic arithmetic operations',
    {
      operation: {
        type: 'string',
        enum: ['add', 'subtract', 'multiply', 'divide'],
        description: 'The arithmetic operation to perform',
      },
      a: {
        type: 'number',
        description: 'First number',
      },
      b: {
        type: 'number',
        description: 'Second number',
      },
    },
    async (input: { operation: string; a: number; b: number }) => {
      switch (input.operation) {
        case 'add':
          return { result: input.a + input.b };
        case 'subtract':
          return { result: input.a - input.b };
        case 'multiply':
          return { result: input.a * input.b };
        case 'divide':
          return { result: input.a / input.b };
        default:
          throw new Error('Invalid operation');
      }
    },
    ['operation', 'a', 'b']
  );

  const response = await createSDKMessage(
    [
      {
        role: 'user',
        content: 'What is 15 multiplied by 7, then add 23 to the result?',
      },
    ],
    {
      tools: [calculatorTool],
      maxTokens: 2048,
    }
  );

  console.log('Tool Uses:', response.toolUses);
  console.log('Final Answer:', response.response);
}

// ============================================================================
// Example 3: Multiple Tools - Weather & Calculator
// ============================================================================

async function multipleToolsExample() {
  // Mock weather API tool
  const weatherTool: Tool = createTool(
    'get_weather',
    'Get current weather for a location',
    {
      location: {
        type: 'string',
        description: 'City name or coordinates',
      },
      units: {
        type: 'string',
        enum: ['celsius', 'fahrenheit'],
        description: 'Temperature units',
      },
    },
    async (input: { location: string; units: string }) => {
      // Mock weather data
      return {
        location: input.location,
        temperature: input.units === 'celsius' ? 22 : 72,
        condition: 'Sunny',
        humidity: 65,
        units: input.units,
      };
    },
    ['location']
  );

  // Calculator tool
  const calculatorTool: Tool = createTool(
    'calculator',
    'Perform arithmetic calculations',
    {
      expression: {
        type: 'string',
        description: 'Mathematical expression to evaluate',
      },
    },
    async (input: { expression: string }) => {
      // Simple eval (in production, use a safe math parser)
      try {
        const result = eval(input.expression);
        return { result };
      } catch (error) {
        return { error: 'Invalid expression' };
      }
    },
    ['expression']
  );

  const response = await createSDKMessage(
    [
      {
        role: 'user',
        content:
          'What is the weather in Ranchi? If the temperature is above 20°C, calculate 20 * 3.5',
      },
    ],
    {
      tools: [weatherTool, calculatorTool],
      maxTokens: 2048,
    }
  );

  console.log('Tool Uses:', response.toolUses);
  console.log('Final Answer:', response.response);
}

// ============================================================================
// Example 4: Prompt Caching for System Instructions
// ============================================================================

async function promptCachingExample() {
  const systemPrompt = `You are an expert SQL database assistant for TheRanchi.com.

Database Schema:
- businesses (id, name, category, subcategory, city, address, phone, email, website, rating)
- reviews (id, business_id, user_id, rating, comment, created_at)
- categories (id, name, slug, parent_id)
- cities (id, name, state, country)

Always provide optimized PostgreSQL queries with proper indexing suggestions.
Use JSONB fields for flexible category-specific data.
Ensure all queries are properly parameterized to prevent SQL injection.`;

  const sdk = new AnthropicSDK();

  // First request - creates cache
  const response1 = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'Write a query to find all restaurants in Ranchi with rating above 4.0',
      },
    ],
    {
      systemPrompt,
      systemPromptCaching: true,
      maxTokens: 1024,
    }
  );

  console.log('First Request (creates cache):', response1.usage);

  // Second request - uses cache (much cheaper)
  const response2 = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'Write a query to get top 10 most reviewed businesses',
      },
    ],
    {
      systemPrompt,
      systemPromptCaching: true,
      maxTokens: 1024,
    }
  );

  console.log('Second Request (uses cache):', response2.usage);
  console.log('Cache savings:', {
    created: response1.usage.cache_creation_input_tokens,
    read: response2.usage.cache_read_input_tokens,
  });
}

// ============================================================================
// Example 5: Extended Thinking + Tool Calling
// ============================================================================

async function thinkingWithToolsExample() {
  const databaseTool: Tool = createTool(
    'query_database',
    'Execute a read-only SQL query on the database',
    {
      query: {
        type: 'string',
        description: 'SQL SELECT query to execute',
      },
    },
    async (input: { query: string }) => {
      // Mock database query
      console.log('Executing:', input.query);
      return {
        rows: [
          { id: 1, name: 'Restaurant A', rating: 4.5 },
          { id: 2, name: 'Restaurant B', rating: 4.8 },
        ],
        rowCount: 2,
      };
    },
    ['query']
  );

  const response = await createSDKMessage(
    [
      {
        role: 'user',
        content:
          'Find the top-rated restaurants in Ranchi and analyze their rating distribution',
      },
    ],
    {
      enableThinking: true,
      thinkingBudget: 8000,
      tools: [databaseTool],
      maxTokens: 3048,
    }
  );

  console.log('Thinking:', response.thinking);
  console.log('Tool Calls:', response.toolUses);
  console.log('Analysis:', response.response);
}

// ============================================================================
// Example 6: MCP Tool Integration Pattern
// ============================================================================

async function mcpToolIntegrationExample() {
  // Simulate an MCP tool definition
  const mcpWebSearchTool = {
    name: 'web_search',
    description: 'Search the web for information',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
        },
      },
      required: ['query'],
    },
  };

  // Convert MCP tool to SDK tool
  const webSearchTool: Tool = {
    name: mcpWebSearchTool.name,
    description: mcpWebSearchTool.description,
    input_schema: mcpWebSearchTool.inputSchema,
    execute: async (input: { query: string; limit?: number }) => {
      // Mock web search
      return {
        results: [
          {
            title: 'Ranchi - Wikipedia',
            url: 'https://en.wikipedia.org/wiki/Ranchi',
            snippet: 'Ranchi is the capital of Jharkhand...',
          },
        ],
      };
    },
  };

  const response = await createSDKMessage(
    [
      {
        role: 'user',
        content: 'Search for information about Ranchi tourism',
      },
    ],
    {
      tools: [webSearchTool],
    }
  );

  console.log('Search Results:', response.toolUses);
  console.log('Summary:', response.response);
}

// ============================================================================
// Example 7: Error Handling
// ============================================================================

async function errorHandlingExample() {
  const faultyTool: Tool = createTool(
    'risky_operation',
    'An operation that might fail',
    {
      action: {
        type: 'string',
        description: 'Action to perform',
      },
    },
    async (input: { action: string }) => {
      if (input.action === 'fail') {
        throw new Error('Operation failed as requested');
      }
      return { success: true };
    },
    ['action']
  );

  try {
    const response = await createSDKMessage(
      [
        {
          role: 'user',
          content: 'Perform the risky operation with action "fail"',
        },
      ],
      {
        tools: [faultyTool],
      }
    );

    console.log('Response:', response);
    // The SDK captures the error and returns it as a tool result
    console.log('Tool error captured:', response.toolUses);
  } catch (error) {
    console.error('SDK Error:', error);
  }
}

// ============================================================================
// Example 8: Conversation Context with Tools
// ============================================================================

async function conversationContextExample() {
  const sdk = new AnthropicSDK();

  const searchTool: Tool = createTool(
    'search_businesses',
    'Search for businesses by category and location',
    {
      category: { type: 'string', description: 'Business category' },
      city: { type: 'string', description: 'City name' },
      limit: { type: 'number', description: 'Max results' },
    },
    async (input) => {
      return {
        businesses: [
          { name: 'Cafe Coffee Day', category: 'cafe', rating: 4.2 },
          { name: 'Barista', category: 'cafe', rating: 4.5 },
        ],
      };
    }
  );

  // Multi-turn conversation
  let messages: any[] = [
    {
      role: 'user',
      content: 'Find cafes in Ranchi',
    },
  ];

  const response1 = await sdk.createMessage(messages, {
    tools: [searchTool],
  });

  console.log('First response:', response1.response);

  // Add to conversation
  messages.push(
    {
      role: 'assistant',
      content: response1.response,
    },
    {
      role: 'user',
      content: 'Which one has the highest rating?',
    }
  );

  const response2 = await sdk.createMessage(messages, {
    tools: [searchTool],
  });

  console.log('Follow-up response:', response2.response);
}

// ============================================================================
// Run Examples
// ============================================================================

async function runAllExamples() {
  console.log('=== Example 1: Basic Thinking ===');
  await basicThinkingExample();

  console.log('\n=== Example 2: Calculator Tool ===');
  await calculatorToolExample();

  console.log('\n=== Example 3: Multiple Tools ===');
  await multipleToolsExample();

  console.log('\n=== Example 4: Prompt Caching ===');
  await promptCachingExample();

  console.log('\n=== Example 5: Thinking + Tools ===');
  await thinkingWithToolsExample();

  console.log('\n=== Example 6: MCP Integration ===');
  await mcpToolIntegrationExample();

  console.log('\n=== Example 7: Error Handling ===');
  await errorHandlingExample();

  console.log('\n=== Example 8: Conversation Context ===');
  await conversationContextExample();
}

// Export for individual use
export {
  basicThinkingExample,
  calculatorToolExample,
  multipleToolsExample,
  promptCachingExample,
  thinkingWithToolsExample,
  mcpToolIntegrationExample,
  errorHandlingExample,
  conversationContextExample,
};

// Uncomment to run all examples
// runAllExamples().catch(console.error);
