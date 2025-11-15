# Anthropic SDK Wrapper

Advanced TypeScript wrapper for the Anthropic Claude API with extended thinking, tool calling, and prompt caching support.

## Features

### 1. Extended Thinking
Enable Claude to think through complex problems before responding:
- Configurable thinking budget (token allocation)
- Automatic thinking extraction from responses
- Support for complex reasoning tasks

### 2. Tool Calling
Define and execute custom tools:
- Type-safe tool definitions
- Automatic tool execution loop
- Error handling for tool failures
- Support for multiple tools per request

### 3. Prompt Caching
Reduce API costs with prompt caching:
- Automatic cache control for system prompts
- Cache statistics in response
- Significant cost savings for repeated queries

### 4. MCP Tool Integration
Easy integration with Model Context Protocol tools:
- Adapter functions for MCP tools
- Dynamic tool registration
- Compatible with existing MCP infrastructure

## Installation

```bash
npm install @anthropic-ai/sdk
```

Set your API key:
```bash
export ANTHROPIC_API_KEY='your-api-key'
```

## Quick Start

### Basic Message

```typescript
import { AnthropicSDK } from './lib/anthropicSDK';

const sdk = new AnthropicSDK();

const response = await sdk.createMessage([
  {
    role: 'user',
    content: 'What is the capital of France?',
  },
]);

console.log(response.response);
```

### With Extended Thinking

```typescript
const response = await sdk.createMessage(
  [
    {
      role: 'user',
      content: 'Solve: What is the derivative of x^3 + 2x^2 - 5x + 7?',
    },
  ],
  {
    enableThinking: true,
    thinkingBudget: 5000, // 5000 tokens for thinking
  }
);

console.log('Thinking:', response.thinking);
console.log('Answer:', response.response);
```

### With Tool Calling

```typescript
import { createTool } from './lib/anthropicSDK';

const calculatorTool = createTool(
  'calculator',
  'Perform arithmetic operations',
  {
    operation: {
      type: 'string',
      enum: ['add', 'subtract', 'multiply', 'divide'],
    },
    a: { type: 'number' },
    b: { type: 'number' },
  },
  async (input) => {
    const { operation, a, b } = input;
    switch (operation) {
      case 'add': return { result: a + b };
      case 'subtract': return { result: a - b };
      case 'multiply': return { result: a * b };
      case 'divide': return { result: a / b };
    }
  },
  ['operation', 'a', 'b']
);

const response = await sdk.createMessage(
  [
    {
      role: 'user',
      content: 'What is 15 multiplied by 7?',
    },
  ],
  {
    tools: [calculatorTool],
  }
);

console.log('Tool uses:', response.toolUses);
console.log('Answer:', response.response);
```

### With Prompt Caching

```typescript
const systemPrompt = `You are an expert SQL assistant.
Database schema:
- users (id, name, email)
- posts (id, user_id, title, content)
- comments (id, post_id, user_id, text)`;

// First request creates cache
const response1 = await sdk.createMessage(
  [{ role: 'user', content: 'Write a query to get all users' }],
  {
    systemPrompt,
    systemPromptCaching: true,
  }
);

// Second request uses cache (cheaper!)
const response2 = await sdk.createMessage(
  [{ role: 'user', content: 'Write a query to get posts with comments' }],
  {
    systemPrompt,
    systemPromptCaching: true,
  }
);

console.log('Cache created:', response1.usage.cache_creation_input_tokens);
console.log('Cache read:', response2.usage.cache_read_input_tokens);
```

## API Reference

### `AnthropicSDK`

Main SDK class for interacting with Anthropic API.

#### Constructor

```typescript
new AnthropicSDK(apiKey?: string)
```

Creates a new SDK instance. If `apiKey` is not provided, it will use the `ANTHROPIC_API_KEY` environment variable.

#### Methods

##### `createMessage(messages, options)`

Creates a message with advanced features.

**Parameters:**
- `messages`: Array of message objects with `role` and `content`
- `options`: Configuration options (see below)

**Returns:** `Promise<SDKResponse>`

### `SDKOptions`

Configuration options for message creation.

```typescript
interface SDKOptions {
  model?: string;                    // Default: 'claude-sonnet-4-20250514'
  maxTokens?: number;                // Default: 4096
  temperature?: number;              // Default: 1.0
  enableThinking?: boolean;          // Default: false
  thinkingBudget?: number;           // Default: 10000
  tools?: Tool[];                    // Default: []
  systemPromptCaching?: boolean;     // Default: false
  systemPrompt?: string;             // Default: undefined
  apiKey?: string;                   // Override default API key
}
```

### `SDKResponse`

Response object from the SDK.

```typescript
interface SDKResponse {
  response: string;                  // Final text response
  thinking?: string;                 // Thinking process (if enabled)
  toolUses?: Array<{                // Tool execution results
    name: string;
    input: any;
    result: any;
  }>;
  usage: {                          // Token usage statistics
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
  rawResponse?: Anthropic.Message;  // Raw Anthropic response
}
```

### `Tool`

Tool definition interface.

```typescript
interface Tool {
  name: string;                     // Tool name
  description: string;              // Tool description
  input_schema: {                   // JSON schema for inputs
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (input: any) => Promise<any>; // Execution function
}
```

### Helper Functions

#### `createTool()`

Helper to create a tool definition.

```typescript
createTool(
  name: string,
  description: string,
  properties: Record<string, any>,
  execute: (input: any) => Promise<any>,
  required?: string[]
): Tool
```

#### `createSDKMessage()`

Convenience function for one-off messages.

```typescript
createSDKMessage(
  messages: MessageParam[],
  options?: SDKOptions
): Promise<SDKResponse>
```

#### `mcpToolToSDKTool()`

Convert MCP tool to SDK tool format.

```typescript
mcpToolToSDKTool(
  mcpTool: {
    name: string;
    description: string;
    inputSchema: any;
  },
  executeFunction: (input: any) => Promise<any>
): Tool
```

## Advanced Usage

### Multiple Tools

```typescript
const tools = [
  createTool('weather', 'Get weather', { location: { type: 'string' } }, getWeather),
  createTool('calculator', 'Calculate', { expression: { type: 'string' } }, calculate),
  createTool('database', 'Query DB', { query: { type: 'string' } }, queryDB),
];

const response = await sdk.createMessage(messages, { tools });
```

### Thinking + Tools + Caching

```typescript
const response = await sdk.createMessage(
  messages,
  {
    enableThinking: true,
    thinkingBudget: 8000,
    tools: [databaseTool, analysisTool],
    systemPrompt: longSystemPrompt,
    systemPromptCaching: true,
  }
);
```

### Multi-turn Conversations

```typescript
const messages = [
  { role: 'user', content: 'Find restaurants in Ranchi' },
];

const response1 = await sdk.createMessage(messages, { tools });

messages.push(
  { role: 'assistant', content: response1.response },
  { role: 'user', content: 'Which one is highest rated?' }
);

const response2 = await sdk.createMessage(messages, { tools });
```

## Cost Optimization

### Prompt Caching Best Practices

1. **Cache Static Content**: Cache system prompts, database schemas, API documentation
2. **Minimum Size**: Cached content must be at least 1024 tokens
3. **TTL**: Caches last 5 minutes
4. **Placement**: Place cache control on the last eligible block

Example:
```typescript
const systemPrompt = `
  ${longDatabaseSchema}        // 2000+ tokens
  ${apiDocumentation}          // 3000+ tokens
  ${exampleQueries}            // 1000+ tokens
`;  // Total > 1024 tokens, perfect for caching!
```

### Token Budget Management

Extended thinking uses additional tokens:
```typescript
{
  enableThinking: true,
  thinkingBudget: 5000,  // Balance between quality and cost
  maxTokens: 2048,       // Separate from thinking budget
}
```

## Error Handling

The SDK handles errors gracefully:

```typescript
try {
  const response = await sdk.createMessage(messages, options);
  console.log(response);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

Tool errors are captured in results:
```typescript
{
  name: 'failing_tool',
  input: { action: 'fail' },
  result: { error: 'Operation failed' }
}
```

## Use Cases

### 1. SQL Query Assistant
```typescript
const sqlTool = createTool('execute_query', 'Run SQL', ...);
const response = await sdk.createMessage(
  [{ role: 'user', content: 'Get top 10 customers' }],
  {
    tools: [sqlTool],
    systemPrompt: databaseSchema,
    systemPromptCaching: true,
  }
);
```

### 2. Data Analysis
```typescript
const response = await sdk.createMessage(
  [{ role: 'user', content: 'Analyze sales trends' }],
  {
    enableThinking: true,
    thinkingBudget: 10000,
    tools: [queryTool, chartTool],
  }
);
```

### 3. Web Research
```typescript
const tools = [
  searchTool,
  scrapeTool,
  summarizeTool,
];

const response = await sdk.createMessage(
  [{ role: 'user', content: 'Research AI trends in 2025' }],
  {
    enableThinking: true,
    tools,
  }
);
```

## Testing

See `anthropicSDK.example.ts` for comprehensive examples:

```bash
npx ts-node lib/anthropicSDK.example.ts
```

## TypeScript Support

Full TypeScript support with type definitions:
- Type-safe tool definitions
- Autocomplete for options
- Strict typing for responses

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- TypeScript types are maintained
- Examples are updated
- Tests pass

## Support

For issues or questions:
- Check examples in `anthropicSDK.example.ts`
- Review Anthropic API documentation
- Open an issue on GitHub
