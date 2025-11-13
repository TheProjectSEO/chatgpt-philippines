# Key Files Reference Guide

Quick lookup for important files and their purposes.

## Core Configuration Files

| File | Purpose | Key Details |
|------|---------|------------|
| `package.json` | Dependencies & scripts | Next.js 14, Anthropic SDK, Supabase, Auth0 |
| `tsconfig.json` | TypeScript settings | Strict mode enabled, @ alias for imports |
| `next.config.js` | Next.js configuration | Standalone output, force-dynamic routes |
| `tailwind.config.ts` | Styling configuration | Basic Tailwind setup with CSS variables |
| `.env.example` | Environment template | Lists all required env vars |

## Library Files (lib/)

| File | Purpose | Key Exports |
|------|---------|------------|
| `types.ts` | Core TypeScript interfaces | Message, Chat, AnthropicModel types |
| `constants.ts` | App constants | MODELS, DEFAULT_MODEL, PRESET_PROMPTS |
| `modelSelection.ts` | Intelligent model routing | selectModel(), estimateCost(), pricing |
| `analytics.ts` | Usage tracking | trackModelUsage(), getUserUsageStats() |
| `supabaseClient.ts` | Supabase client wrapper | supabaseClient methods for data ops |
| `supabase.ts` | Database schema | SUPABASE_SCHEMA SQL definition |
| `auth0.ts` | Auth0 client | auth0 instance configuration |
| `storage.ts` | Authenticated user data | localStorage API for authenticated users |
| `guestStorage.ts` | Guest user data | localStorage API for guests |

## API Routes (app/api/)

### Rate Limiting
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/rate-limit` | GET | Check current rate limit status |
| `/api/rate-limit` | POST | Increment usage counter |

**File:** `app/api/rate-limit/route.ts`
- IP + fingerprint extraction
- Supabase rate_limits table operations
- 10 messages per 24 hours limit

### AI Tools (20 endpoints)
**Pattern:** `app/api/[tool-name]/route.ts`

Key tools:
- `/api/chat` - Main conversation endpoint with streaming
- `/api/grammar-check` - Grammar & spell checking
- `/api/essay-write` - Essay generation
- `/api/translate` - Multi-language translation
- `/api/paraphrase` - Text paraphrasing

**Common pattern across all tools:**
1. Validate input
2. Check rate limit
3. Call Anthropic API
4. Track usage in model_usage table
5. Return response

### Database Operations (app/api/supabase/)
| Route | Purpose |
|-------|---------|
| `/api/supabase/init-user` | Create new user session |
| `/api/supabase/check-rate-limit` | Query user rate limit from DB |
| `/api/supabase/increment-query` | Increment user query count |
| `/api/supabase/save-chat` | Store chat to database |
| `/api/supabase/save-message` | Store individual message |
| `/api/supabase/load-chats` | Retrieve user's chats |

### Authentication (app/api/auth/)
| Route | Purpose |
|-------|---------|
| `/api/auth/[auth0]` | Auth0 callback handler |
| `/api/auth/sync-user` | Sync user from Auth0 to Supabase |

## Database Migrations (supabase/migrations/)

| File | Table | Purpose |
|------|-------|---------|
| `20250113000000_create_model_usage.sql` | `model_usage` | Track AI requests & costs |
| `20251113000000_create_rate_limits.sql` | `rate_limits` | Guest user rate limiting |

### Database Tables at a Glance

**rate_limits** (Guest tracking)
- `id` - UUID primary key
- `ip` - Client IP address
- `fingerprint` - Browser fingerprint hash
- `message_count` - Messages sent this period
- `last_reset` - 24-hour reset timestamp
- Indexes: ip, fingerprint, last_reset

**model_usage** (Analytics)
- `id` - UUID primary key
- `user_id` - Auth0 user (nullable for guests)
- `model` - Which Claude model was used
- `input_tokens` - Tokens consumed
- `output_tokens` - Tokens generated
- `cost_usd` - Calculated cost
- `created_at` - Request timestamp
- Indexes: user_id, created_at, model

**users** (User accounts)
- `id` - UUID primary key
- `session_id` - Unique session identifier
- `auth0_id` - Auth0 user ID
- `email`, `name`, `avatar_url` - Profile data
- `query_count` - Free tier usage counter
- `created_at`, `last_query_at` - Timestamps

**chats** (Conversations)
- `id` - UUID primary key
- `user_id` - FK to users
- `title` - Chat title
- `model` - Default model for chat
- `created_at`, `updated_at` - Timestamps

**messages** (Chat messages)
- `id` - UUID primary key
- `chat_id` - FK to chats
- `role` - 'user' or 'assistant'
- `content` - Message text
- `timestamp` - When sent

## Important Code Patterns

### How Rate Limiting Works

1. **Guest Check (app/api/chat/route.ts):**
```typescript
const rateLimitResponse = await fetch('/api/rate-limit', {
  method: 'POST',
  body: JSON.stringify({ action: 'increment' })
});
```

2. **Rate Limit API (app/api/rate-limit/route.ts):**
   - Extract IP from headers (Cloudflare, x-forwarded-for, etc.)
   - Generate fingerprint from user-agent + client hints
   - Query Supabase: `WHERE ip = ? OR fingerprint = ?`
   - Increment message_count
   - Return: { count, limit, remaining, blocked }

### How Model Selection Works

```typescript
// From lib/modelSelection.ts
const modelConfig = getModelConfig(userMessage, conversationLength);
// Returns: { model: 'claude-3-5-haiku-20241022', maxTokens: 1000, temperature: 0.7 }
```

**Selection Logic:**
1. Check for thinking keywords → Use Sonnet with thinking
2. Check for simple keywords + short message → Use Haiku
3. Check for complex keywords or long message → Use Sonnet
4. Default → Use Haiku for cost optimization

### How Usage Tracking Works

```typescript
// From lib/analytics.ts
const cost = estimateCost('haiku', inputTokens, outputTokens);
await trackModelUsage({
  user_id: null,  // TODO: Add auth user ID
  model: 'claude-3-5-haiku-20241022',
  input_tokens: 145,
  output_tokens: 328,
  cost_usd: cost
});
```

## Critical TODOs Found in Code

| File | Issue | Impact |
|------|-------|--------|
| `app/api/chat/route.ts` | Auth0 session check commented out | Cannot identify authenticated users |
| `app/api/chat/route.ts` | user_id always null in analytics | Cannot track per-user costs |
| Multiple files | No API key rotation mechanism | Security risk for key compromise |
| Database | RLS policies allow all operations | Data isolation issue for multi-user |

## Environment Variables Checklist

Required for development/production:

```bash
# Essential
ANTHROPIC_API_KEY                    # Claude API access
NEXT_PUBLIC_SUPABASE_URL            # Database URL
NEXT_PUBLIC_SUPABASE_ANON_KEY       # Public DB key
SUPABASE_SERVICE_ROLE_KEY           # Admin DB key

# Authentication
AUTH0_SECRET                         # Session encryption
AUTH0_CLIENT_ID                      # Auth0 app ID
AUTH0_CLIENT_SECRET                 # Auth0 app secret
AUTH0_ISSUER_BASE_URL               # Auth0 tenant
AUTH0_BASE_URL                      # App URL for OAuth callback

# Configuration
NEXT_PUBLIC_APP_URL                 # For internal API calls
```

## Performance Bottlenecks to Watch

1. **Rate Limit Checks** - Every request hits Supabase
   - Mitigation: Add client-side caching
   - Alternative: Use Redis

2. **Model Usage Tracking** - Every request writes to DB
   - Mitigation: Batch writes
   - Alternative: Async background job

3. **Database Queries** - Multiple round-trips
   - Mitigation: Aggregate queries
   - Alternative: Use RLS to filter at DB level

4. **Auth0 Integration** - Currently bypassed
   - Issue: user_id always null
   - Fix: Uncomment and test session checks

## Testing the System

### Verify Rate Limiting Works:
```bash
# Fresh user should see 10 available
curl http://localhost:3000/api/rate-limit -X GET

# Each request should decrement
curl http://localhost:3000/api/rate-limit -X POST \
  -H "Content-Type: application/json" \
  -d '{"action":"increment"}'

# Verify persistence across browser reload
```

### Verify Model Selection:
```bash
# Should pick Haiku for simple query
POST /api/chat with "hello"

# Should pick Sonnet for complex query
POST /api/chat with "write a detailed analysis of..."

# Check logs for model selection
```

### Verify Cost Tracking:
```sql
-- Check recorded costs in Supabase
SELECT AVG(cost_usd), COUNT(*) FROM model_usage;
SELECT model, SUM(cost_usd) FROM model_usage GROUP BY model;
```

## File Locations for Enterprise Implementation

When adding enterprise features, consider:

1. **API Key Rotation** → `lib/keyManagement.ts` (new)
2. **Budget Limits** → `lib/billing.ts` (new)
3. **Organization Multi-Tenancy** → Modify all DB operations
4. **Redis Cache** → `lib/cache.ts` (new)
5. **Usage Alerts** → `app/api/alerts/` (new)
6. **Admin Dashboard** → `app/admin/` (new)

