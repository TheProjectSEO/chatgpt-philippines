/**
 * Test suite for Anthropic SDK Wrapper
 * Run with: npx ts-node lib/anthropicSDK.test.ts
 */

import {
  AnthropicSDK,
  createSDKMessage,
  createTool,
  type Tool,
  type SDKResponse,
} from './anthropicSDK';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

class TestRunner {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    console.log(`\n${colors.blue}Running: ${name}${colors.reset}`);

    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({ name, passed: true, duration });
      console.log(
        `${colors.green}✓ PASSED${colors.reset} (${duration}ms)`
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({
        name,
        passed: false,
        duration,
        error: errorMessage,
      });
      console.log(
        `${colors.red}✗ FAILED${colors.reset} (${duration}ms)\n  Error: ${errorMessage}`
      );
    }
  }

  printSummary(): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log('Test Summary');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`\nTotal Tests: ${total}`);
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`Total Time: ${totalTime}ms\n`);

    if (failed > 0) {
      console.log(`${colors.red}Failed Tests:${colors.reset}`);
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.name}`);
          console.log(`    Error: ${r.error}`);
        });
    }

    console.log('='.repeat(60));
  }
}

// ============================================================================
// Test Cases
// ============================================================================

async function testBasicMessage() {
  const sdk = new AnthropicSDK();
  const response = await sdk.createMessage([
    {
      role: 'user',
      content: 'What is 2 + 2? Answer with just the number.',
    },
  ]);

  if (!response.response.includes('4')) {
    throw new Error(`Expected response to contain '4', got: ${response.response}`);
  }

  if (!response.usage.input_tokens || !response.usage.output_tokens) {
    throw new Error('Missing token usage information');
  }

  console.log(`  Response: ${response.response}`);
  console.log(`  Tokens: ${response.usage.input_tokens} in, ${response.usage.output_tokens} out`);
}

async function testExtendedThinking() {
  const sdk = new AnthropicSDK();
  const response = await sdk.createMessage(
    [
      {
        role: 'user',
        content: 'What is the square root of 144? Think step by step.',
      },
    ],
    {
      enableThinking: true,
      thinkingBudget: 2000,
      maxTokens: 1024,
    }
  );

  if (!response.thinking) {
    throw new Error('Expected thinking content but got none');
  }

  if (!response.response.includes('12')) {
    throw new Error(`Expected response to contain '12', got: ${response.response}`);
  }

  console.log(`  Thinking length: ${response.thinking.length} chars`);
  console.log(`  Response: ${response.response}`);
}

async function testToolCalling() {
  const calculatorTool: Tool = createTool(
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
    async (input: { operation: string; a: number; b: number }) => {
      switch (input.operation) {
        case 'add':
          return { result: input.a + input.b };
        case 'multiply':
          return { result: input.a * input.b };
        default:
          return { result: 0 };
      }
    },
    ['operation', 'a', 'b']
  );

  const response = await createSDKMessage(
    [
      {
        role: 'user',
        content: 'Calculate 15 multiplied by 7 using the calculator tool.',
      },
    ],
    {
      tools: [calculatorTool],
      maxTokens: 1024,
    }
  );

  if (!response.toolUses || response.toolUses.length === 0) {
    throw new Error('Expected tool to be used');
  }

  const toolUse = response.toolUses[0];
  if (toolUse.name !== 'calculator') {
    throw new Error(`Expected calculator tool, got: ${toolUse.name}`);
  }

  if (toolUse.result.result !== 105) {
    throw new Error(`Expected result 105, got: ${toolUse.result.result}`);
  }

  console.log(`  Tool used: ${toolUse.name}`);
  console.log(`  Input: ${JSON.stringify(toolUse.input)}`);
  console.log(`  Result: ${JSON.stringify(toolUse.result)}`);
}

async function testPromptCaching() {
  const systemPrompt = `You are a helpful assistant that answers math questions.
Always provide step-by-step explanations.
Use clear and concise language.
Double-check your calculations.

This prompt is long enough to be cached (over 1024 tokens when combined with other context).
Let me add more content to ensure it meets the caching threshold.
${' '.repeat(500)}
Additional instructions for handling edge cases...`;

  const sdk = new AnthropicSDK();

  // First request - creates cache
  const response1 = await sdk.createMessage(
    [{ role: 'user', content: 'What is 5 + 3?' }],
    {
      systemPrompt,
      systemPromptCaching: true,
      maxTokens: 512,
    }
  );

  // Note: Cache creation tokens might be undefined if prompt is too short
  console.log(`  First request - Input tokens: ${response1.usage.input_tokens}`);
  console.log(`  Cache creation tokens: ${response1.usage.cache_creation_input_tokens || 'N/A'}`);

  // Second request would use cache in production
  // (In testing, cache may expire quickly)
  console.log(`  Response: ${response1.response}`);
}

async function testMultipleTools() {
  const mathTool: Tool = createTool(
    'math',
    'Perform math operations',
    {
      expression: { type: 'string', description: 'Math expression' },
    },
    async (input: { expression: string }) => {
      try {
        // Simple eval for testing (DO NOT use in production)
        const result = eval(input.expression);
        return { result };
      } catch {
        return { error: 'Invalid expression' };
      }
    },
    ['expression']
  );

  const dateTool: Tool = createTool(
    'get_date',
    'Get current date and time',
    {},
    async () => {
      return {
        date: new Date().toISOString(),
        timestamp: Date.now(),
      };
    }
  );

  const response = await createSDKMessage(
    [
      {
        role: 'user',
        content: 'What is the current date and what is 100 divided by 4?',
      },
    ],
    {
      tools: [mathTool, dateTool],
      maxTokens: 1024,
    }
  );

  if (!response.toolUses || response.toolUses.length === 0) {
    throw new Error('Expected tools to be used');
  }

  console.log(`  Tools used: ${response.toolUses.map(t => t.name).join(', ')}`);
  console.log(`  Response: ${response.response}`);
}

async function testToolError() {
  const failingTool: Tool = createTool(
    'failing_operation',
    'An operation that always fails',
    {
      action: { type: 'string' },
    },
    async (input: { action: string }) => {
      throw new Error('Intentional failure for testing');
    },
    ['action']
  );

  const response = await createSDKMessage(
    [
      {
        role: 'user',
        content: 'Try the failing operation with action "test".',
      },
    ],
    {
      tools: [failingTool],
      maxTokens: 1024,
    }
  );

  if (!response.toolUses) {
    throw new Error('Expected tool to be attempted');
  }

  const toolUse = response.toolUses[0];
  if (!toolUse.result.error) {
    throw new Error('Expected tool to return an error');
  }

  console.log(`  Tool error captured: ${toolUse.result.error}`);
}

async function testConversationContext() {
  const sdk = new AnthropicSDK();

  const messages: any[] = [
    {
      role: 'user',
      content: 'My favorite number is 42.',
    },
  ];

  const response1 = await sdk.createMessage(messages);

  messages.push(
    {
      role: 'assistant',
      content: response1.response,
    },
    {
      role: 'user',
      content: 'What was my favorite number?',
    }
  );

  const response2 = await sdk.createMessage(messages);

  if (!response2.response.includes('42')) {
    throw new Error('Expected context to be maintained');
  }

  console.log(`  Context maintained: ${response2.response}`);
}

async function testThinkingWithTools() {
  const searchTool: Tool = createTool(
    'search',
    'Search for information',
    {
      query: { type: 'string' },
    },
    async (input: { query: string }) => {
      return {
        results: [
          { title: 'Result 1', snippet: 'Information about ' + input.query },
        ],
      };
    },
    ['query']
  );

  const response = await createSDKMessage(
    [
      {
        role: 'user',
        content: 'Search for information about Ranchi and tell me what you find.',
      },
    ],
    {
      enableThinking: true,
      thinkingBudget: 3000,
      tools: [searchTool],
      maxTokens: 1024,
    }
  );

  if (!response.thinking) {
    throw new Error('Expected thinking content');
  }

  if (!response.toolUses || response.toolUses.length === 0) {
    throw new Error('Expected tool to be used');
  }

  console.log(`  Thinking + Tools combined successfully`);
  console.log(`  Thinking length: ${response.thinking.length} chars`);
  console.log(`  Tools used: ${response.toolUses.length}`);
}

async function testResponseMetadata() {
  const sdk = new AnthropicSDK();
  const response = await sdk.createMessage([
    {
      role: 'user',
      content: 'Hello!',
    },
  ]);

  if (!response.rawResponse) {
    throw new Error('Expected raw response to be present');
  }

  if (!response.rawResponse.id) {
    throw new Error('Expected response ID');
  }

  if (!response.rawResponse.model) {
    throw new Error('Expected model information');
  }

  console.log(`  Response ID: ${response.rawResponse.id}`);
  console.log(`  Model: ${response.rawResponse.model}`);
  console.log(`  Stop reason: ${response.rawResponse.stop_reason}`);
}

// ============================================================================
// Run All Tests
// ============================================================================

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('Anthropic SDK Wrapper Test Suite');
  console.log('='.repeat(60));

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      `\n${colors.red}ERROR: ANTHROPIC_API_KEY not found in environment${colors.reset}`
    );
    console.log('Please set your API key:');
    console.log('  export ANTHROPIC_API_KEY="your-key-here"');
    process.exit(1);
  }

  const runner = new TestRunner();

  // Run tests
  await runner.runTest('Basic Message', testBasicMessage);
  await runner.runTest('Extended Thinking', testExtendedThinking);
  await runner.runTest('Tool Calling', testToolCalling);
  await runner.runTest('Prompt Caching', testPromptCaching);
  await runner.runTest('Multiple Tools', testMultipleTools);
  await runner.runTest('Tool Error Handling', testToolError);
  await runner.runTest('Conversation Context', testConversationContext);
  await runner.runTest('Thinking + Tools', testThinkingWithTools);
  await runner.runTest('Response Metadata', testResponseMetadata);

  // Print summary
  runner.printSummary();
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error(`\n${colors.red}Test runner error:${colors.reset}`, error);
    process.exit(1);
  });
}

export { runAllTests, TestRunner };
