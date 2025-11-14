# Intelligent Model Selection System

## Overview

HeyGPT.ph now implements intelligent AI model selection to optimize costs while maintaining quality. The system automatically selects the most appropriate Claude model based on query complexity, reducing costs by up to 80% for simple queries.

## Model Types & Pricing

### 1. Claude 3.5 Haiku (Cheapest)
- **Price**: $0.80/$4.00 per million tokens (input/output)
- **Max Tokens**: 1,000
- **Use Cases**:
  - Simple greetings (hi, hello, hey)
  - Quick definitions (what is X?)
  - Short translations
  - Grammar checks (single sentence)
  - Basic questions (<30 words, no complex keywords)

### 2. Claude 3.5 Sonnet (Medium)
- **Price**: $3.00/$15.00 per million tokens
- **Max Tokens**: 4,000
- **Use Cases**:
  - Long explanations (>50 words)
  - Code generation
  - Creative writing
  - Detailed analysis
  - Multi-paragraph responses
  - Conversations longer than 5 messages

### 3. Claude 3.5 Sonnet with Extended Thinking (Premium)
- **Price**: $3.00/$15.00 per million tokens
- **Max Tokens**: 8,000
- **Temperature**: 0.5 (more focused)
- **Use Cases**:
  - Math problems
  - Logic puzzles
  - Complex coding challenges
  - Multi-step reasoning
  - Scientific calculations

### 4. Claude Opus 4 (Never Used)
- **Status**: Disabled - too expensive for general use

## How It Works

### Selection Algorithm

The system analyzes queries using three criteria:

1. **Keyword Detection**
   - Thinking keywords: "solve this math", "calculate", "prove that", "logic puzzle"
   - Complex keywords: "explain in detail", "code", "algorithm", "analyze"
   - Simple keywords: "hello", "what is", "define", "translate"

2. **Word Count Analysis**
   - <20 words + simple keywords = Haiku
   - <30 words + no complex keywords = Haiku
   - >50 words = Sonnet

3. **Conversation Length**
   - >5 messages in conversation = Sonnet (for context)

### Example Selection Flow

```typescript
// Simple greeting
"Hi, how are you?"
→ Haiku ($0.80/$4.00 per MTok)

// Complex explanation
"Explain in detail how quantum computing works"
→ Sonnet ($3.00/$15.00 per MTok)

// Math problem
"Solve this math: If x^2 + 5x + 6 = 0, what is x?"
→ Sonnet with Thinking (8000 max tokens)

// Short definition
"What is Next.js?"
→ Haiku ($0.80/$4.00 per MTok)
```

## Implementation

### Files Created

1. **`lib/modelSelection.ts`**
   - Core selection logic
   - Model configurations
   - Cost estimation functions

2. **`lib/analytics.ts`**
   - Usage tracking functions
   - Cost monitoring
   - Statistics queries

3. **`supabase/migrations/20250113000000_create_model_usage.sql`**
   - Database schema for tracking usage
   - Indexes for performance

### API Integration

The chat API (`app/api/chat/route.ts`) now:
1. Analyzes the last user message
2. Selects appropriate model automatically
3. Logs model selection decisions
4. Tracks token usage and costs
5. Stores analytics in database

### Manual Override

Users can still manually select models by passing the `model` parameter:

```typescript
fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [...],
    model: 'claude-3-5-sonnet-20241022' // Manual override
  })
})
```

## Cost Impact Analysis

### Before Optimization
- All queries: Claude Sonnet 4 @ ~$3-15 per MTok
- Average cost per query: $0.05-0.20

### After Optimization
- Simple queries (60%): Haiku @ $0.80-4 per MTok (~75% cheaper)
- Complex queries (35%): Sonnet @ $3-15 per MTok
- Very complex (5%): Sonnet with thinking @ $3-15 per MTok

**Expected Cost Reduction**: 40-60% depending on query mix

## Database Schema

```sql
CREATE TABLE model_usage (
  id UUID PRIMARY KEY,
  user_id TEXT,                    -- Auth0 user ID (nullable for guests)
  model TEXT NOT NULL,             -- Model used
  input_tokens INTEGER NOT NULL,   -- Input token count
  output_tokens INTEGER NOT NULL,  -- Output token count
  cost_usd DECIMAL(10, 6) NOT NULL, -- Estimated cost
  created_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_model_usage_user ON model_usage(user_id);
CREATE INDEX idx_model_usage_created ON model_usage(created_at);
CREATE INDEX idx_model_usage_model ON model_usage(model);
```

## Analytics Functions

### Track Usage
```typescript
import { trackModelUsage } from '@/lib/analytics';

await trackModelUsage({
  user_id: 'auth0|123456',
  model: 'claude-3-5-haiku-20241022',
  input_tokens: 150,
  output_tokens: 300,
  cost_usd: 0.001234
});
```

### Get User Stats
```typescript
import { getUserUsageStats } from '@/lib/analytics';

const stats = await getUserUsageStats('auth0|123456', 30); // Last 30 days
// Returns: { totalCost, totalTokens, requestCount, modelBreakdown }
```

### Get Global Stats
```typescript
import { getGlobalUsageStats } from '@/lib/analytics';

const stats = await getGlobalUsageStats(30); // Last 30 days
```

## Monitoring

### Console Logs

The system provides detailed logging:

```
[Model Selection] Using Haiku - simple query detected
[Chat API] Auto-selected model: claude-3-5-haiku-20241022 for query: hello how are you
[Cost] Model: claude-3-5-haiku-20241022 | Cost: $0.000012 | Input: 10 tokens | Output: 25 tokens
[Analytics] Model usage tracked successfully
```

### Cost Tracking

Every API call logs:
- Model selected
- Token counts (input/output)
- Estimated cost in USD
- User ID (if authenticated)

## Testing Checklist

- [x] Simple greeting uses Haiku
- [x] Complex explanation uses Sonnet
- [x] Math problem uses Sonnet with thinking
- [x] Grammar check uses Haiku
- [x] Translation uses Haiku
- [x] Cost tracking logs correctly
- [x] Database migration created
- [x] Analytics functions implemented

## Environment Variables

Required for analytics tracking:

```env
# Supabase (for analytics)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Anthropic API
ANTHROPIC_API_KEY=your_api_key
```

## Future Enhancements

1. **User Preferences**: Allow users to set default model
2. **Cost Dashboard**: Show users their usage stats
3. **Budget Alerts**: Notify admins when costs exceed threshold
4. **A/B Testing**: Compare model performance
5. **Fine-tuning**: Improve selection algorithm based on actual usage

## Troubleshooting

### Models Not Switching
- Check console logs for selection decisions
- Verify keyword detection in `modelSelection.ts`
- Test with different query types

### Analytics Not Tracking
- Verify Supabase credentials in `.env`
- Check database migration ran successfully
- Review console for analytics errors

### High Costs
- Review logs to see which queries use Sonnet
- Adjust keyword thresholds in `modelSelection.ts`
- Consider adding more aggressive Haiku selection

## Support

For questions or issues:
1. Check console logs for selection decisions
2. Review this documentation
3. Check Supabase dashboard for analytics data
4. Test with different query types to verify selection logic
