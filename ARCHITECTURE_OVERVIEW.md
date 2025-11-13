# ChatGPT Philippines - Complete Architecture Overview

## Executive Summary

**chatgpt-philippines** is a Next.js 14 full-stack application providing 20+ AI-powered writing and productivity tools. The architecture emphasizes:
- Cost optimization through intelligent model selection (Haiku vs Sonnet)
- Rate limiting with IP + browser fingerprinting
- Multi-user support with Auth0 authentication
- Usage analytics and billing tracking
- Streaming responses for real-time feedback

---

## 1. PROJECT STRUCTURE & MAIN DIRECTORIES

```
/home/user/chatgpt-philippines/
├── app/
│   ├── api/                          # Next.js API routes
│   │   ├── chat/                     # Main chat endpoint
│   │   ├── rate-limit/               # Rate limiting logic
│   │   ├── grammar-check/            # Grammar checker tool
│   │   ├── essay-write/              # Essay writer tool
│   │   ├── translate/                # Translation tool
│   │   ├── paraphrase/               # Paraphrasing tool
│   │   ├── [19 more AI tools]/       # Other specialized tools
│   │   ├── supabase/                 # Database operations
│   │   │   ├── init-user/
│   │   │   ├── check-rate-limit/
│   │   │   ├── increment-query/
│   │   │   ├── save-chat/
│   │   │   ├── save-message/
│   │   │   └── load-chats/
│   │   └── auth/                     # Authentication routes
│   │       ├── [auth0]/              # Auth0 callback
│   │       └── sync-user/            # User synchronization
│   │
│   ├── chat/                         # Chat page component
│   ├── grammar-checker/              # Grammar checker UI
│   ├── essay-write/                  # Essay writer UI
│   ├── translator/                   # Translator UI
│   └── [19 more UI pages]/           # Other tool UIs
│
├── lib/                              # Shared utilities
│   ├── types.ts                      # TypeScript interfaces
│   ├── constants.ts                  # App constants & models
│   ├── supabaseClient.ts             # Supabase client wrapper
│   ├── supabase.ts                   # Database schema definitions
│   ├── auth0.ts                      # Auth0 client
│   ├── storage.ts                    # Authenticated user storage
│   ├── guestStorage.ts               # Guest user localStorage
│   ├── modelSelection.ts             # Model selection logic
│   └── analytics.ts                  # Usage tracking
│
├── components/                       # Shared React components
├── supabase/
│   └── migrations/                   # Database migrations
│       ├── 20250113000000_create_model_usage.sql
│       └── 20251113000000_create_rate_limits.sql
│
├── hooks/
│   └── useGuestChatLimit.ts          # Rate limiting hook
│
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.js                    # Next.js config
├── tailwind.config.ts                # Tailwind CSS config
├── .env.example                      # Environment variables template
└── README files documenting fixes
```

---

## 2. EXISTING API ENDPOINTS & AI REQUEST HANDLING

### A. Main Endpoints (31 total)

**Chat & General Purpose:**
- `POST /api/chat` - Main chat endpoint with streaming responses

**AI Content Generation Tools (19 endpoints):**
- `POST /api/essay-write` - Generate essays by topic
- `POST /api/grammar-check` - Check grammar and spelling
- `POST /api/translate` - Multi-language translation
- `POST /api/paraphrase` - Paraphrase text
- `POST /api/summarize` - Summarize content
- `POST /api/poem-generate` - Generate poems
- `POST /api/story-generate` - Create stories
- `POST /api/lyrics-generate` - Generate song lyrics
- `POST /api/research-paper` - Generate research papers
- `POST /api/thesis-generate` - Generate thesis content
- `POST /api/email-write` - Compose professional emails
- `POST /api/cover-letter` - Generate cover letters
- `POST /api/resume-build` - Build resumes
- `POST /api/business-plan` - Create business plans
- `POST /api/study-guide` - Generate study guides
- `POST /api/speech-write` - Write speeches
- `POST /api/slogan-generate` - Create marketing slogans
- `POST /api/article-rewrite` - Rewrite articles
- `POST /api/bibliography` - Generate bibliographies
- `POST /api/math-solve` - Solve math problems
- `POST /api/filipino-write` - Filipino language content

**Rate Limiting:**
- `POST /api/rate-limit` - Increment usage counter
- `GET /api/rate-limit` - Check current rate limit status

**Database Operations:**
- `POST /api/supabase/init-user` - Initialize user session
- `POST /api/supabase/check-rate-limit` - Check user rate limit (Supabase)
- `POST /api/supabase/increment-query` - Increment query count
- `POST /api/supabase/save-chat` - Save chat to database
- `POST /api/supabase/save-message` - Save message to database
- `GET /api/supabase/load-chats` - Load user chats

**Authentication:**
- `POST /api/auth/[auth0]` - Auth0 callback handler
- `POST /api/auth/sync-user` - Sync user with Supabase

### B. Request/Response Pattern Examples

**Grammar Checker Example:**
```typescript
// Request
POST /api/grammar-check
Content-Type: application/json
{
  "text": "The student have completed their homwork.",
  "language": "english"  // or "filipino", "auto"
}

// Response
{
  "errors": [
    {
      "id": "error-1234-0",
      "type": "grammar",
      "message": "Subject-verb agreement error",
      "explanation": "'student' is singular, so 'have' should be 'has'",
      "suggestion": "has",
      "start": 12,
      "end": 16,
      "originalText": "have"
    },
    ...
  ],
  "usage": {
    "input_tokens": 145,
    "output_tokens": 328
  }
}
```

**Essay Writer Example:**
```typescript
// Request
POST /api/essay-write
Content-Type: application/json
{
  "topic": "The impact of climate change on agriculture",
  "essayType": "argumentative",
  "wordCount": 1500
}

// Response
{
  "essay": "Climate change represents one of the most pressing challenges...",
  "usage": {
    "inputTokens": 89,
    "outputTokens": 2145
  }
}
```

**Chat Endpoint (Streaming):**
```typescript
// Request
POST /api/chat
Content-Type: application/json
{
  "messages": [
    { "role": "user", "content": "Hello, how are you?" }
  ],
  "model": "claude-3-5-sonnet-20241022"  // optional
}

// Response (Server-Sent Events)
data: {"text":"Hello!"}

data: {"text":" I'm"}

data: {"text":" doing well."}

data: [DONE]
```

---

## 3. CURRENT RATE LIMITING IMPLEMENTATION

### A. Dual-Layer Rate Limiting System

**Layer 1: IP + Browser Fingerprinting (Guest Users)**
- Endpoint: `POST/GET /api/rate-limit`
- Method: HTTP header-based identification
- Storage: Supabase `rate_limits` table

**Layer 2: Session-Based (Authenticated Users)**
- Endpoint: `POST /api/supabase/check-rate-limit`
- Method: Session ID tracking
- Storage: Supabase `users` table

### B. Rate Limit Details

**Guest Users:**
```typescript
// IP extraction with fallback handling:
1. Cloudflare: cf-connecting-ip
2. Proxy headers: x-forwarded-for
3. Real IP: x-real-ip
4. Vercel: x-vercel-forwarded-for

// Browser fingerprinting:
Combined hash from:
- user-agent
- accept-language
- accept-encoding
- sec-ch-ua
- sec-ch-ua-platform

// Limits:
- FREE_LIMIT = 10 messages per 24 hours
- Reset: Automatic after 24 hours from last_reset timestamp
- Database: Upsert with UNIQUE(ip, fingerprint) constraint
```

**Authenticated Users:**
```typescript
// Query from users table:
SELECT query_count FROM users WHERE session_id = ?

// Limits:
- FREE_QUERY_LIMIT = 10
- Checked via: /api/supabase/check-rate-limit
- Incremented via: /api/supabase/increment-query
```

### C. Database Schema

```sql
-- rate_limits table for guests
CREATE TABLE rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ip, fingerprint)
);

-- Indexes for fast lookups
CREATE INDEX idx_rate_limits_ip ON rate_limits(ip);
CREATE INDEX idx_rate_limits_fingerprint ON rate_limits(fingerprint);
CREATE INDEX idx_rate_limits_last_reset ON rate_limits(last_reset);

-- Auto-cleanup function (deletes records > 7 days old)
CREATE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE last_activity < NOW() - INTERVAL '7 days';
END;
$$;
```

### D. Security Measures

✅ **Implemented:**
- Database persistence (survives page refresh)
- IP + fingerprint dual tracking (prevents VPN and device switching bypass)
- 24-hour rolling window
- Upsert with conflict handling
- Service role key (not exposed to client)

⚠️ **Known Limitations:**
- Determined users can switch VPNs to get new IP
- Different browsers = new fingerprint
- Device switching = new IP + fingerprint (acceptable)

---

## 4. API KEY MANAGEMENT

### A. Anthropic API Keys

**Storage Location:**
```
Environment variable: ANTHROPIC_API_KEY
Scope: Server-side only (Next.js API routes)
Type: Secret key (NOT exposed to frontend)
```

**Usage Pattern:**
```typescript
// lib/modelSelection.ts or api routes
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Used for all model calls
const message = await anthropic.messages.create({
  model: 'claude-3-5-haiku-20241022',
  max_tokens: 4000,
  messages: [...]
});
```

**Model Pricing (for cost tracking):**
```typescript
// From lib/modelSelection.ts
haiku: { input: 0.80, output: 4.00 },        // $0.80/$4.00 per MTok
sonnet: { input: 3.00, output: 15.00 },      // $3/$15 per MTok
'sonnet-thinking': { input: 3.00, output: 15.00 }
```

### B. Supabase Keys

**Public Key:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
Scope: Client-side access (browser)
Use: Query public data, row-level security enforced
```

**Service Role Key:**
```
SUPABASE_SERVICE_ROLE_KEY
Scope: Server-side only
Use: Admin operations (bypass RLS), rate limit updates, analytics
```

### C. Auth0 Configuration

```
AUTH0_SECRET
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
AUTH0_ISSUER_BASE_URL
AUTH0_BASE_URL
Scope: Authentication & user management
Type: OAuth 2.0 credentials
```

### D. Key Rotation Recommendations

⚠️ **Not Currently Implemented:**
- No API key rotation strategy
- No key versioning
- No automatic expiration
- No per-user API keys

**Recommended for Production:**
```typescript
// Add to environment management:
- API_KEY_VERSION (track current version)
- ANTHROPIC_API_KEY_BACKUP (for rotation)
- KEY_ROTATION_DATE (when to rotate)
- ROTATION_WARNING_DAYS (alert before expiry)

// Implement rotation endpoint:
POST /api/admin/rotate-keys
POST /api/admin/verify-key-validity
```

---

## 5. DATABASE/CACHING INFRASTRUCTURE

### A. Primary Database: Supabase (PostgreSQL)

**Tables:**

1. **rate_limits** (Guest rate limiting)
   - Tracks IP + fingerprint combinations
   - 10 messages per 24 hours
   - Auto-cleanup after 7 days

2. **model_usage** (Analytics & cost tracking)
   - Tracks every AI request
   - Stores: user_id, model, input_tokens, output_tokens, cost_usd
   - Indexed by: user_id, created_at, model
   - Purpose: Billing and usage analytics

3. **users** (User accounts & session tracking)
   - session_id: Unique per guest session
   - query_count: Free tier usage counter
   - auth0_id: For authenticated users
   - email, name, avatar_url

4. **chats** (Conversation storage)
   - Stores chat metadata
   - Foreign key to users
   - Indexed by: user_id, updated_at

5. **messages** (Chat messages)
   - Stores individual messages
   - role: 'user' or 'assistant'
   - Foreign key to chats
   - Indexed by: chat_id, timestamp

**Performance Optimizations:**
```sql
-- Strategic indexes exist for:
- Session lookups: idx_users_session_id
- User chats: idx_chats_user_id, idx_chats_updated_at
- Message queries: idx_messages_chat_id, idx_messages_timestamp
- Rate limit queries: idx_rate_limits_ip, idx_rate_limits_fingerprint
- Analytics: idx_model_usage_user_created, idx_model_usage_model
```

**Row-Level Security (RLS):**
```sql
-- Currently ALL policies allow all operations
-- Recommendation: Implement per-user RLS for production
CREATE POLICY "Users can access own data" ON chats
FOR ALL USING (user_id = auth.uid());
```

### B. Client-Side Caching: Browser localStorage

**Guest User Storage:**
```typescript
// From lib/guestStorage.ts
- Key: 'guest-chats'
- Stores: Array of Chat objects
- Persists: Across browser sessions
- Auto-migration: Updates invalid model IDs

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: AnthropicModel;
  createdAt: number;
  updatedAt: number;
}
```

**Authenticated User Storage:**
```typescript
// From lib/storage.ts
- Key: 'chatgpt-philippines-chats'
- Same structure as guest storage
- Can sync with Supabase via API
```

**Session Management:**
```typescript
// From lib/supabaseClient.ts
const sessionId = localStorage.getItem('chatgpt-ph-session');
// Generated once per user, persists across sessions
```

### C. Caching Strategy

**Currently Implemented:**
- ✅ Browser localStorage for chat history
- ✅ Database persistence for rate limits
- ✅ Database persistence for analytics

**NOT Implemented:**
- ❌ Redis cache layer
- ❌ HTTP response caching
- ❌ Query result caching
- ❌ Rate limit client-side caching

**Recommended Additions:**
```typescript
// Cache rate limit for 1 minute to reduce DB queries:
const getCachedRateLimit = () => {
  const cached = localStorage.getItem('rate-limit-cache');
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < 60000) return data;
  }
  return null;
};
```

---

## 6. BACKEND FRAMEWORK & ARCHITECTURE

### A. Framework: Next.js 14 with App Router

**Key Configuration:**
```javascript
// next.config.js
{
  reactStrictMode: true,
  output: 'standalone',  // Self-contained deployment
  experimental: {
    isrFlushToDisk: false,
  }
}

// Deploy as: docker run nextjs-app
// Scales horizontally: Stateless design
```

**Dynamic Route Handling:**
```typescript
// All API routes use: export const dynamic = 'force-dynamic'
// Ensures fresh data, no static caching
```

### B. API Route Pattern

**Consistent Pattern Across All Endpoints:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request
    const { topic, essayType, wordCount } = await req.json();
    
    // 2. Validate input
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }
    
    // 3. Call Anthropic API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });
    
    // 4. Process response
    const result = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // 5. Track usage
    console.log(`Input: ${message.usage.input_tokens}, Output: ${message.usage.output_tokens}`);
    
    // 6. Return response
    return NextResponse.json({
      result,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });
    
  } catch (error: any) {
    console.error('API Error:', error);
    
    // Handle Anthropic rate limits
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'API rate limit exceeded' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### C. Streaming Response Pattern

**Used in Chat Endpoint:**
```typescript
// app/api/chat/route.ts
const stream = await anthropic.messages.stream({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  messages: anthropicMessages,
});

const readableStream = new ReadableStream({
  async start(controller) {
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const text = chunk.delta.text;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      }
    }
    
    // Track usage after stream complete
    const finalMessage = await stream.finalMessage();
    trackModelUsage({
      model: selectedModel,
      input_tokens: finalMessage.usage.input_tokens,
      output_tokens: finalMessage.usage.output_tokens,
      cost_usd: estimateCost(...),
    });
    
    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    controller.close();
  },
});

return new NextResponse(readableStream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});
```

### D. Middleware/Utilities

**Authentication Check:**
```typescript
// Currently COMMENTED OUT in chat/route.ts
// const session = await getSession();
// TODO: Fix Auth0 session check

// Instead: Relies on frontend to manage auth state
```

**Rate Limiting Check:**
```typescript
// Every tool endpoint calls:
const rateLimitResponse = await fetch('/api/rate-limit', {
  method: 'POST',
  body: JSON.stringify({ action: 'increment' })
});

const rateLimit = await rateLimitResponse.json();
if (rateLimit.blocked) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  );
}
```

---

## 7. TYPESCRIPT/JAVASCRIPT CONFIGURATION

### A. TypeScript Setup

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,                // Full type safety
    "noEmit": true,               // Type checking only
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",            // Next.js handles JSX
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### B. Type Definitions

**Core Types (lib/types.ts):**
```typescript
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: AnthropicModel;
  createdAt: number;
  updatedAt: number;
}

export type AnthropicModel =
  | 'claude-sonnet-4-20250514'
  | 'claude-3-7-sonnet-20250219'
  | 'claude-opus-4-20250514'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-haiku-20240307';
```

**Model Configuration Types:**
```typescript
// lib/modelSelection.ts
export type ModelType = 'haiku' | 'sonnet' | 'sonnet-thinking';

export interface ModelConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface UsageStats {
  totalCost: number;
  totalTokens: number;
  requestCount: number;
  modelBreakdown: {
    [model: string]: {
      count: number;
      cost: number;
      tokens: number;
    };
  };
}
```

### C. Package Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.32.1",           // Main AI provider
  "@auth0/nextjs-auth0": "^4.12.1",        // Authentication
  "@supabase/supabase-js": "^2.45.0",      // Database client
  "next": "^14.2.0",                       // Framework
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "react-markdown": "^9.1.0",               // Markdown rendering
  "react-syntax-highlighter": "^16.1.0",  // Code highlighting
  "uuid": "^10.0.0",                       // ID generation
  "lucide-react": "^0.553.0"               // Icons
}
```

### D. Build Optimization

**Strict Type Checking:**
- ✅ Strict mode enabled
- ✅ No implicit any
- ✅ All imports typed
- ✅ Proper return types on functions

**Performance:**
- Build command: `next build`
- Standalone output: Optimized for Docker/serverless
- ISR disabled: All routes dynamic
- Type emit disabled: Only bundling, no type files

---

## 8. ENVIRONMENT VARIABLES & CONFIGURATION MANAGEMENT

### A. Required Environment Variables

```bash
# .env.local (never commit this!)

# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Supabase Configuration (Public)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Configuration (Secret)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Auth0 Configuration
AUTH0_SECRET=use_openssl_rand_-base64_32
AUTH0_BASE_URL=http://localhost:3000  # or production URL
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For internal API calls
```

### B. Configuration Access Pattern

**Server-Side (API Routes):**
```typescript
// Can access both NEXT_PUBLIC_* and secret variables
process.env.ANTHROPIC_API_KEY              // ✅ Secret only on server
process.env.SUPABASE_SERVICE_ROLE_KEY      // ✅ Secret only on server
process.env.NEXT_PUBLIC_SUPABASE_URL       // ✅ Public
process.env.AUTH0_SECRET                   // ✅ Secret only on server
```

**Client-Side (React Components):**
```typescript
// Only NEXT_PUBLIC_* variables available
process.env.NEXT_PUBLIC_SUPABASE_URL       // ✅ Available
process.env.NEXT_PUBLIC_APP_URL            // ✅ Available
process.env.ANTHROPIC_API_KEY              // ❌ NOT available
process.env.SUPABASE_SERVICE_ROLE_KEY      // ❌ NOT available
```

### C. Configuration Management Pattern

**Example from app/api/rate-limit/route.ts:**
```typescript
export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  // ... rest of implementation
}
```

### D. Fallback Handling

**For Development/Build Time:**
```typescript
// lib/analytics.ts
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Analytics] Missing Supabase credentials');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};
```

**For Production Deployment:**
```typescript
// app/api/chat/route.ts
const rateLimitResponse = await fetch(
  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/rate-limit`,
  { ... }
);
// Fallback to localhost for local development
```

### E. Best Practices Implemented

✅ **Good:**
- Secret keys NOT prefixed with NEXT_PUBLIC_
- Fallback values for optional config
- Error handling for missing config
- Type-safe environment access
- No hardcoded credentials

⚠️ **Could Improve:**
- No validation schema (e.g., with zod)
- No config versioning
- No feature flags
- No environment-specific config files
- No config hot-reload capability

---

## SCALING CONSIDERATIONS FOR ENTERPRISE

### Critical Issues to Address:

1. **Rate Limiting**
   - Currently: Per IP/fingerprint, not per user
   - Needed: Tiered limits based on subscription
   - Recommended: Add user_id-based limits

2. **Authentication**
   - Status: Auth0 session check is commented out (TODO)
   - Impact: Cannot verify user identity in chat endpoint
   - Fix: Uncomment and test Auth0 integration

3. **Cost Monitoring**
   - Good: Analytics table tracks costs
   - Gap: No budget alerts or spending caps
   - Recommended: Add budget limits per user/tenant

4. **Caching**
   - Gap: No Redis layer
   - Impact: Every request hits Supabase + Anthropic
   - Recommended: Add Redis for rate limit checks, chat history

5. **Database Scaling**
   - Current: Single Supabase instance
   - Issue: Single point of failure
   - Recommended: Connection pooling, read replicas

6. **Multi-Tenancy** (for enterprise)
   - Current: Single tenant design
   - Needed: Organization/account isolation
   - Recommended: Add organization_id to all tables

