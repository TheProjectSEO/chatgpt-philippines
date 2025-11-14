/**
 * Test Script for Model Selection Logic
 *
 * Run this to verify the model selection algorithm works correctly:
 * npx ts-node test-model-selection.ts
 */

import { selectModel, getModelConfig, estimateCost, getModelTypeFromString } from './lib/modelSelection.js';

interface TestCase {
  query: string;
  conversationLength: number;
  expectedModel: string;
  description: string;
}

const testCases: TestCase[] = [
  // Simple queries (should use Haiku)
  {
    query: "Hello!",
    conversationLength: 0,
    expectedModel: 'haiku',
    description: "Simple greeting"
  },
  {
    query: "What is Next.js?",
    conversationLength: 0,
    expectedModel: 'haiku',
    description: "Simple definition"
  },
  {
    query: "Translate this to Tagalog: Hello World",
    conversationLength: 0,
    expectedModel: 'haiku',
    description: "Simple translation"
  },
  {
    query: "correct this grammar: He go to store",
    conversationLength: 0,
    expectedModel: 'haiku',
    description: "Grammar check"
  },

  // Complex queries (should use Sonnet)
  {
    query: "Explain in detail how neural networks work and provide code examples",
    conversationLength: 0,
    expectedModel: 'sonnet',
    description: "Complex explanation with code"
  },
  {
    query: "Write a Python script to analyze CSV data and create visualizations",
    conversationLength: 0,
    expectedModel: 'sonnet',
    description: "Code generation"
  },
  {
    query: "Compare and contrast React and Vue.js, including their pros and cons for enterprise applications",
    conversationLength: 0,
    expectedModel: 'sonnet',
    description: "Detailed comparison"
  },
  {
    query: "This is a very long message with many words that goes on and on explaining various concepts and ideas in great detail covering multiple aspects of the topic at hand with thorough explanations",
    conversationLength: 0,
    expectedModel: 'sonnet',
    description: "Long message (>50 words)"
  },

  // Thinking queries (should use Sonnet with thinking)
  {
    query: "Solve this math problem: If f(x) = x^2 + 3x - 5, what is f'(2)?",
    conversationLength: 0,
    expectedModel: 'sonnet-thinking',
    description: "Math problem"
  },
  {
    query: "Logic puzzle: If all A are B, and some B are C, what can we conclude?",
    conversationLength: 0,
    expectedModel: 'sonnet-thinking',
    description: "Logic puzzle"
  },
  {
    query: "Calculate the optimal solution for this traveling salesman problem",
    conversationLength: 0,
    expectedModel: 'sonnet-thinking',
    description: "Optimization problem"
  },

  // Conversation length tests
  {
    query: "Hello",
    conversationLength: 6,
    expectedModel: 'sonnet',
    description: "Simple query but long conversation"
  }
];

console.log('\n🧪 Testing Model Selection Logic\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = selectModel(test.query, test.conversationLength);
  const config = getModelConfig(test.query, test.conversationLength);
  const isCorrect = result === test.expectedModel;

  const status = isCorrect ? '✅ PASS' : '❌ FAIL';
  const statusColor = isCorrect ? '\x1b[32m' : '\x1b[31m';
  const resetColor = '\x1b[0m';

  console.log(`\n${statusColor}${status}${resetColor} Test ${index + 1}: ${test.description}`);
  console.log(`Query: "${test.query.substring(0, 60)}${test.query.length > 60 ? '...' : ''}"`);
  console.log(`Expected: ${test.expectedModel} | Got: ${result}`);
  console.log(`Model: ${config.model}`);
  console.log(`Max Tokens: ${config.maxTokens} | Temp: ${config.temperature}`);

  if (isCorrect) {
    passed++;
  } else {
    failed++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

// Test cost estimation
console.log('\n💰 Cost Estimation Tests\n');
console.log('='.repeat(80));

const costTests = [
  { model: 'haiku', input: 100, output: 200, expectedRange: [0.0001, 0.001] },
  { model: 'sonnet', input: 1000, output: 2000, expectedRange: [0.03, 0.04] },
  { model: 'sonnet-thinking', input: 2000, output: 4000, expectedRange: [0.06, 0.07] },
];

costTests.forEach((test) => {
  const cost = estimateCost(test.model as any, test.input, test.output);
  const inRange = cost >= test.expectedRange[0] && cost <= test.expectedRange[1];
  const status = inRange ? '✅' : '❌';

  console.log(`\n${status} ${test.model.toUpperCase()}`);
  console.log(`Input: ${test.input} tokens | Output: ${test.output} tokens`);
  console.log(`Cost: $${cost.toFixed(6)} (expected: $${test.expectedRange[0].toFixed(6)} - $${test.expectedRange[1].toFixed(6)})`);
});

// Test model type detection
console.log('\n🔍 Model Type Detection Tests\n');
console.log('='.repeat(80));

const modelTypeTests = [
  { input: 'claude-3-5-haiku-20241022', expected: 'haiku' },
  { input: 'claude-3-5-sonnet-20241022', expected: 'sonnet' },
  { input: 'claude-3-7-sonnet-20250219', expected: 'sonnet' },
];

modelTypeTests.forEach((test) => {
  const result = getModelTypeFromString(test.input);
  const status = result === test.expected ? '✅' : '❌';
  console.log(`\n${status} ${test.input}`);
  console.log(`Expected: ${test.expected} | Got: ${result}`);
});

console.log('\n' + '='.repeat(80));
console.log('\n✨ Testing Complete!\n');

if (failed === 0) {
  console.log('🎉 All tests passed! The model selection system is working correctly.\n');
  process.exit(0);
} else {
  console.log(`⚠️  ${failed} test(s) failed. Please review the selection logic.\n`);
  process.exit(1);
}
