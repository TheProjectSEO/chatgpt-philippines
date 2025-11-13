export type ModelType = 'haiku' | 'sonnet' | 'sonnet-thinking';

export interface ModelConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

// Model configurations
export const MODELS: Record<ModelType, ModelConfig> = {
  haiku: {
    model: 'claude-3-5-haiku-20241022',
    maxTokens: 1000,
    temperature: 0.7,
  },
  sonnet: {
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 4000,
    temperature: 0.7,
  },
  'sonnet-thinking': {
    model: 'claude-3-5-sonnet-20241022',
    maxTokens: 8000,
    temperature: 0.5,
  },
};

// Keywords that indicate complex reasoning needed
const COMPLEX_KEYWORDS = [
  'explain in detail',
  'step by step',
  'analyze',
  'compare and contrast',
  'code',
  'program',
  'algorithm',
  'calculate',
  'solve',
  'proof',
  'mathematical',
  'logic',
  'debug',
  'optimize',
  'architecture',
  'design pattern',
  'write',
  'create',
  'build',
  'develop',
  'implement',
];

// Keywords that indicate thinking model needed
const THINKING_KEYWORDS = [
  'solve this math',
  'calculate',
  'prove that',
  'logic puzzle',
  'reasoning',
  'mathematical proof',
  'complex algorithm',
  'optimization problem',
  'game theory',
  'probability',
];

// Simple queries that can use Haiku
const SIMPLE_KEYWORDS = [
  'hello',
  'hi',
  'hey',
  'what is',
  'define',
  'meaning of',
  'translate',
  'grammar check',
  'correct this',
  'yes or no',
  'summarize',
  'summary',
];

export function selectModel(message: string, conversationLength: number = 0): ModelType {
  const lowerMessage = message.toLowerCase();
  const wordCount = message.split(/\s+/).length;

  // 1. Check for thinking model needs (highest priority)
  if (THINKING_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
    console.log('[Model Selection] Using Sonnet with thinking - detected complex reasoning');
    return 'sonnet-thinking';
  }

  // 2. Check for simple queries (use cheap Haiku)
  if (
    wordCount < 20 &&
    SIMPLE_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
  ) {
    console.log('[Model Selection] Using Haiku - simple query detected');
    return 'haiku';
  }

  // 3. Short messages with no complex keywords = Haiku
  if (wordCount < 30 && !COMPLEX_KEYWORDS.some(k => lowerMessage.includes(k))) {
    console.log('[Model Selection] Using Haiku - short message');
    return 'haiku';
  }

  // 4. Complex queries or long messages = Sonnet
  if (
    wordCount > 50 ||
    COMPLEX_KEYWORDS.some(keyword => lowerMessage.includes(keyword)) ||
    conversationLength > 5
  ) {
    console.log('[Model Selection] Using Sonnet - complex or long query');
    return 'sonnet';
  }

  // 5. Default to Haiku for cost optimization
  console.log('[Model Selection] Using Haiku - default');
  return 'haiku';
}

// Get model configuration
export function getModelConfig(message: string, conversationLength: number = 0): ModelConfig {
  const modelType = selectModel(message, conversationLength);
  return MODELS[modelType];
}

// Calculate cost estimate (for monitoring)
export function estimateCost(modelType: ModelType, inputTokens: number, outputTokens: number): number {
  // Pricing per million tokens (as of 2024)
  const pricing: Record<ModelType, { input: number; output: number }> = {
    haiku: { input: 0.80, output: 4.00 },        // $0.80/$4.00 per MTok
    sonnet: { input: 3.00, output: 15.00 },      // $3/$15 per MTok
    'sonnet-thinking': { input: 3.00, output: 15.00 },
  };

  const rates = pricing[modelType];
  const inputCost = (inputTokens / 1_000_000) * rates.input;
  const outputCost = (outputTokens / 1_000_000) * rates.output;

  return inputCost + outputCost;
}

// Get model type from model string (for usage tracking)
export function getModelTypeFromString(modelString: string): ModelType {
  if (modelString.includes('haiku')) {
    return 'haiku';
  } else if (modelString.includes('sonnet')) {
    return 'sonnet';
  }
  return 'sonnet';
}
