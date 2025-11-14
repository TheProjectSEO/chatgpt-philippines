# Testing the Model Selection System

## Manual Testing Guide

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test Different Query Types

Open the chat interface at `http://localhost:3002` and test these queries:

#### Simple Queries (Should Use Haiku - Cheapest)

1. **Greeting**: "Hello!" or "Hi there!"
   - Check console: `[Model Selection] Using Haiku - simple query detected`

2. **Definition**: "What is React?"
   - Check console: `[Model Selection] Using Haiku - short message`

3. **Translation**: "Translate 'hello' to Tagalog"
   - Check console: `[Model Selection] Using Haiku - simple query detected`

4. **Grammar Check**: "correct this: He go to store"
   - Check console: `[Model Selection] Using Haiku - simple query detected`

#### Complex Queries (Should Use Sonnet - Medium Cost)

1. **Code Generation**: "Write a React component for a todo list with add/delete functionality"
   - Check console: `[Model Selection] Using Sonnet - complex or long query`

2. **Long Explanation**: "Explain in detail how machine learning algorithms work, including examples"
   - Check console: `[Model Selection] Using Sonnet - complex or long query`

3. **Analysis**: "Analyze the pros and cons of using TypeScript vs JavaScript"
   - Check console: `[Model Selection] Using Sonnet - complex or long query`

#### Very Complex Queries (Should Use Sonnet with Thinking)

1. **Math Problem**: "Solve this math: If f(x) = x^2 + 3x - 5, find f'(2)"
   - Check console: `[Model Selection] Using Sonnet with thinking - detected complex reasoning`

2. **Logic Puzzle**: "Logic puzzle: If all A are B, and some B are C, prove what we can conclude"
   - Check console: `[Model Selection] Using Sonnet with thinking - detected complex reasoning`

3. **Calculation**: "Calculate the optimal path for visiting these 5 cities"
   - Check console: `[Model Selection] Using Sonnet with thinking - detected complex reasoning`

### 3. Check Console Logs

Open browser DevTools (F12) and look for:

```
[Model Selection] Using Haiku - simple query detected
[Chat API] Auto-selected model: claude-3-5-haiku-20241022 for query: hello
[Cost] Model: claude-3-5-haiku-20241022 | Cost: $0.000012 | Input: 10 tokens | Output: 25 tokens
[Analytics] Model usage tracked successfully
```

### 4. Verify Cost Tracking

Check your server console (terminal where `npm run dev` is running) for:

```
[Cost] Model: claude-3-5-haiku-20241022 | Cost: $0.000012 | Input: 10 tokens | Output: 25 tokens
```

### 5. Check Database (If Supabase Configured)

Run this query in Supabase SQL Editor:

```sql
SELECT
  model,
  COUNT(*) as requests,
  SUM(input_tokens) as total_input,
  SUM(output_tokens) as total_output,
  SUM(cost_usd) as total_cost
FROM model_usage
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY model
ORDER BY total_cost DESC;
```

Expected results:
- `claude-3-5-haiku-20241022` - Most requests, lowest cost
- `claude-3-5-sonnet-20241022` - Fewer requests, higher cost

## Expected Cost Comparison

### Before Optimization (All Sonnet)
- Simple query: ~$0.00005 (50 tokens × $3/$15 per MTok)
- Complex query: ~$0.00150 (500 tokens × $3/$15 per MTok)

### After Optimization
- Simple query (Haiku): ~$0.00001 (50 tokens × $0.80/$4 per MTok) - **80% cheaper**
- Complex query (Sonnet): ~$0.00150 (500 tokens × $3/$15 per MTok) - Same
- Very complex (Sonnet+): ~$0.00300 (1000 tokens × $3/$15 per MTok)

## Troubleshooting

### Model Not Switching

1. **Check Console Logs**: Look for `[Model Selection]` messages
2. **Verify Keywords**: Review `lib/modelSelection.ts` keyword lists
3. **Test Word Count**: Try queries with different lengths

### Analytics Not Working

1. **Check Env Variables**:
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```

2. **Run Migration**:
   ```bash
   # In Supabase SQL Editor
   \i supabase/migrations/20250113000000_create_model_usage.sql
   ```

3. **Check Logs**: Look for `[Analytics]` messages

### High Costs

1. **Review Logs**: Check which queries use Sonnet
2. **Adjust Thresholds**: Edit `lib/modelSelection.ts`:
   ```typescript
   // Make Haiku more aggressive
   if (wordCount < 40 && !COMPLEX_KEYWORDS.some(...))
   ```

## Testing Checklist

- [ ] Simple greeting uses Haiku
- [ ] Definition query uses Haiku
- [ ] Translation uses Haiku
- [ ] Grammar check uses Haiku
- [ ] Code generation uses Sonnet
- [ ] Long explanation uses Sonnet
- [ ] Math problem uses Sonnet with thinking
- [ ] Logic puzzle uses Sonnet with thinking
- [ ] Cost tracking logs correctly
- [ ] Database stores usage (if configured)
- [ ] Console shows model selection reasons
- [ ] Longer conversations (>5 msgs) use Sonnet

## Performance Benchmarks

### Response Times (Expected)
- Haiku: 0.5-1.5 seconds
- Sonnet: 1-3 seconds
- Sonnet (thinking): 2-5 seconds

### Token Usage (Typical)
- Simple query: 10-50 input, 20-100 output
- Complex query: 100-500 input, 500-2000 output
- Very complex: 200-1000 input, 1000-4000 output

## Next Steps

1. **Monitor for 24 hours**: Track actual usage patterns
2. **Review costs**: Compare before/after in Supabase
3. **Adjust thresholds**: Fine-tune based on real data
4. **Add user feedback**: Let users report incorrect model selection
5. **Create dashboard**: Build admin panel to view stats
