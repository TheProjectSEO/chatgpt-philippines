# Anthropic SDK Quick Start Guide

## Installation

```bash
npm install @anthropic-ai/sdk
```

## Setup

```typescript
import { AnthropicSDK, createTool } from './lib/anthropicSDK';

// Set API key
export ANTHROPIC_API_KEY='your-key-here'
```

## Common Patterns

### 1. Simple Question

```typescript
const sdk = new AnthropicSDK();
const response = await sdk.createMessage([
  { role: 'user', content: 'What is the capital of France?' }
]);
console.log(response.response);
```

### 2. With Thinking (Complex Problems)

```typescript
const response = await sdk.createMessage(
  [{ role: 'user', content: 'Solve this complex math problem...' }],
  { enableThinking: true, thinkingBudget: 5000 }
);

console.log('Thinking:', response.thinking);
console.log('Answer:', response.response);
```

### 3. Single Tool

```typescript
const weatherTool = createTool(
  'get_weather',
  'Get weather for a location',
  {
    location: { type: 'string', description: 'City name' },
    units: { type: 'string', enum: ['celsius', 'fahrenheit'] }
  },
  async (input) => {
    // Your weather API call
    return { temp: 22, condition: 'Sunny' };
  },
  ['location']
);

const response = await sdk.createMessage(
  [{ role: 'user', content: 'What is the weather in Paris?' }],
  { tools: [weatherTool] }
);
```

### 4. Multiple Tools

```typescript
const tools = [
  createTool('calculator', '...', {...}, calcFn),
  createTool('database', '...', {...}, dbFn),
  createTool('search', '...', {...}, searchFn),
];

const response = await sdk.createMessage(messages, { tools });
```

### 5. Cached System Prompt

```typescript
const systemPrompt = `Long database schema or documentation...`;

const response = await sdk.createMessage(
  [{ role: 'user', content: 'Query...' }],
  {
    systemPrompt,
    systemPromptCaching: true  // Cache for 5 mins
  }
);
```

### 6. All Features Combined

```typescript
const response = await sdk.createMessage(
  messages,
  {
    enableThinking: true,
    thinkingBudget: 8000,
    tools: [tool1, tool2],
    systemPrompt: longPrompt,
    systemPromptCaching: true,
    maxTokens: 4096,
    temperature: 0.7,
  }
);
```

### 7. Multi-turn Conversation

```typescript
const messages = [
  { role: 'user', content: 'First question' }
];

const r1 = await sdk.createMessage(messages);

messages.push(
  { role: 'assistant', content: r1.response },
  { role: 'user', content: 'Follow-up question' }
);

const r2 = await sdk.createMessage(messages);
```

## Tool Definition Template

```typescript
const myTool = createTool(
  'tool_name',              // Name (snake_case)
  'Tool description',        // Clear description
  {
    param1: {                // Parameters
      type: 'string',
      description: '...',
    },
    param2: {
      type: 'number',
      description: '...',
    }
  },
  async (input) => {         // Executor function
    // Your logic here
    return { result: '...' };
  },
  ['param1']                 // Required parameters
);
```

## Response Structure

```typescript
{
  response: string,          // Final text answer
  thinking?: string,         // Thinking process
  toolUses?: [{              // Tool execution results
    name: string,
    input: any,
    result: any
  }],
  usage: {                   // Token usage
    input_tokens: number,
    output_tokens: number,
    cache_creation_input_tokens?: number,
    cache_read_input_tokens?: number
  },
  rawResponse: {...}         // Full Anthropic response
}
```

## Cost Optimization

### Prompt Caching
- Minimum 1024 tokens to cache
- Lasts 5 minutes
- 90% cost reduction on cached tokens
- Best for: DB schemas, docs, long instructions

```typescript
const schema = `...2000+ tokens...`;  // Must be long enough
const response = await sdk.createMessage(
  messages,
  { systemPrompt: schema, systemPromptCaching: true }
);
```

### Thinking Budget
- More tokens = deeper thinking
- Balance cost vs quality
- Typical: 5000-10000 tokens

```typescript
{
  enableThinking: true,
  thinkingBudget: 5000  // Adjust based on complexity
}
```

## Error Handling

```typescript
try {
  const response = await sdk.createMessage(messages, options);
} catch (error) {
  console.error('SDK Error:', error.message);
}

// Tool errors are captured in results:
if (response.toolUses) {
  response.toolUses.forEach(tool => {
    if (tool.result.error) {
      console.error(`Tool ${tool.name} failed:`, tool.result.error);
    }
  });
}
```

## Testing

```bash
# Run test suite
npx ts-node lib/anthropicSDK.test.ts

# Run examples
npx ts-node lib/anthropicSDK.example.ts
```

## Common Use Cases

### SQL Assistant
```typescript
const sqlTool = createTool('execute_sql', '...', {...}, async (q) => {
  return await db.query(q.sql);
});

const response = await sdk.createMessage(
  [{ role: 'user', content: 'Get top 10 customers' }],
  {
    tools: [sqlTool],
    systemPrompt: dbSchema,
    systemPromptCaching: true
  }
);
```

### Data Analysis
```typescript
const response = await sdk.createMessage(
  [{ role: 'user', content: 'Analyze sales data...' }],
  {
    enableThinking: true,
    thinkingBudget: 10000,
    tools: [queryTool, chartTool, statsTools]
  }
);
```

### Web Automation
```typescript
const tools = [
  createTool('navigate', '...', {...}, navigateFn),
  createTool('click', '...', {...}, clickFn),
  createTool('extract', '...', {...}, extractFn),
];

const response = await sdk.createMessage(
  [{ role: 'user', content: 'Go to example.com and get prices' }],
  { tools }
);
```

## Best Practices

1. **Use Thinking for Complex Tasks**
   - Math problems, analysis, planning
   - Set appropriate budget (5k-10k tokens)

2. **Cache Long System Prompts**
   - DB schemas, API docs, long instructions
   - Ensure >1024 tokens for caching

3. **Define Tools Clearly**
   - Clear descriptions
   - Specific parameter types
   - Handle errors in executor

4. **Monitor Token Usage**
   - Check response.usage
   - Optimize prompts
   - Use caching when possible

5. **Handle Tool Errors**
   - Check toolUses for errors
   - Provide fallback logic
   - Log failures for debugging

## Debug Tips

```typescript
// Enable raw response
const response = await sdk.createMessage(messages, options);
console.log('Raw response:', response.rawResponse);

// Check token usage
console.log('Tokens:', response.usage);

// Inspect tool calls
console.log('Tools:', response.toolUses);

// View thinking process
console.log('Thinking:', response.thinking);
```

## Resources

- Full docs: `lib/ANTHROPIC_SDK_README.md`
- Examples: `lib/anthropicSDK.example.ts`
- Tests: `lib/anthropicSDK.test.ts`
- Types: `lib/anthropicSDK.types.ts`
- Anthropic docs: https://docs.anthropic.com
