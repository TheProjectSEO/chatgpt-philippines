# Implementation Guide for Enterprise Scaling Features

This guide helps you implement enterprise features appropriately for this architecture.

## Quick Navigation

All paths are absolute from the repository root: `/home/user/chatgpt-philippines/`

### Essential Files You'll Modify

1. **Rate Limiting Enhancement**
   - Primary: `/home/user/chatgpt-philippines/app/api/rate-limit/route.ts`
   - Database: `/home/user/chatgpt-philippines/supabase/migrations/20251113000000_create_rate_limits.sql`
   - Types: `/home/user/chatgpt-philippines/lib/types.ts`

2. **Authentication Fix (CRITICAL)**
   - Primary: `/home/user/chatgpt-philippines/app/api/chat/route.ts` (Line 17-19: TODO)
   - Config: `/home/user/chatgpt-philippines/lib/auth0.ts`
   - Reference: `/home/user/chatgpt-philippines/app/api/auth/sync-user/route.ts`

3. **Cost Management**
   - Analytics: `/home/user/chatgpt-philippines/lib/analytics.ts`
   - Models: `/home/user/chatgpt-philippines/lib/modelSelection.ts`
   - Database: `/home/user/chatgpt-philippines/supabase/migrations/20250113000000_create_model_usage.sql`

4. **Configuration**
   - Environment: `/home/user/chatgpt-philippines/.env.example`
   - Constants: `/home/user/chatgpt-philippines/lib/constants.ts`
   - TypeScript: `/home/user/chatgpt-philippines/tsconfig.json`

## Implementation Priorities

### PHASE 1: Fix Critical Issues (Week 1)

#### 1.1 Fix Auth0 Authentication

**Issue:** Line 17-19 in `/home/user/chatgpt-philippines/app/api/chat/route.ts`
```typescript
// CURRENT (BROKEN):
// const session = await getSession();
// const isAuthenticated = !!session?.user;
const isAuthenticated = false; // TODO: Implement proper auth check
```

**Fix:**
```typescript
// FIXED:
import { getSession } from '@auth0/nextjs-auth0';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const isAuthenticated = !!session?.user;
    const userId = session?.user?.sub || null;
    
    // Use userId in analytics
    if (finalMessage.usage) {
      trackModelUsage({
        user_id: userId,  // NOW WORKS!
        model: selectedModel,
        ...
      });
    }
  }
  // ...
}
```

**Test:**
```bash
# Test authenticated endpoint
curl -H "Authorization: Bearer <auth0_token>" http://localhost:3000/api/chat
```

#### 1.2 Add Budget Limits

**Create:** `/home/user/chatgpt-philippines/lib/billing.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface BudgetLimit {
  user_id: string;
  monthly_budget_usd: number;
  spent_this_month: number;
  reset_date: string;
}

export async function checkBudgetLimit(userId: string): Promise<boolean> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: budget } = await supabase
    .from('budget_limits')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!budget) return true; // No limit set

  const { data: usage } = await supabase
    .from('model_usage')
    .select('cost_usd')
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString());

  const spent = usage?.reduce((sum, row) => sum + row.cost_usd, 0) || 0;
  
  return spent < budget.monthly_budget_usd;
}

export async function setBudgetLimit(
  userId: string,
  monthlyBudgetUsd: number
): Promise<void> {
  await supabase.from('budget_limits').upsert({
    user_id: userId,
    monthly_budget_usd: monthlyBudgetUsd,
    reset_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
  });
}
```

**Create Database Migration:**
File: `/home/user/chatgpt-philippines/supabase/migrations/20250114000000_create_budget_limits.sql`

```sql
CREATE TABLE IF NOT EXISTS budget_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  monthly_budget_usd DECIMAL(10, 2) NOT NULL,
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_budget_limits_user_id ON budget_limits(user_id);
```

#### 1.3 Update Chat API to Check Budget

**Modify:** `/home/user/chatgpt-philippines/app/api/chat/route.ts`

```typescript
import { checkBudgetLimit } from '@/lib/billing';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user?.sub || null;

    // Check budget for authenticated users
    if (userId && !await checkBudgetLimit(userId)) {
      return NextResponse.json({
        error: 'Budget limit exceeded',
        message: 'Your monthly budget limit has been reached'
      }, { status: 429 });
    }

    // Continue with normal chat processing...
  }
}
```

---

### PHASE 2: Enhance Rate Limiting (Week 2)

#### 2.1 Add Tiered Rate Limits

**Modify Database Schema:**
File: `/home/user/chatgpt-philippines/supabase/migrations/20250115000000_add_subscription_tiers.sql`

```sql
-- Add subscription tiers
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  daily_limit INTEGER NOT NULL,
  monthly_limit INTEGER,
  price_monthly_usd DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add tier to users
ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN tier_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Insert default tiers
INSERT INTO subscription_tiers (name, daily_limit, monthly_limit, price_monthly_usd) VALUES
('free', 10, 100, 0),
('pro', 100, 3000, 9.99),
('enterprise', 1000, 100000, 99.99);
```

#### 2.2 Update Rate Limit Logic

**Modify:** `/home/user/chatgpt-philippines/app/api/rate-limit/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const isAuthenticated = !!session?.user;
  
  if (isAuthenticated) {
    // Use subscription tier limits
    const { data: user } = await supabase
      .from('users')
      .select('subscription_tier, message_count, tier_reset_date')
      .eq('auth0_id', session.user.sub)
      .single();

    const { data: tier } = await supabase
      .from('subscription_tiers')
      .select('daily_limit')
      .eq('name', user.subscription_tier)
      .single();

    // Check if tier reset needed (24 hours)
    if (new Date(user.tier_reset_date) < oneDayAgo) {
      await supabase
        .from('users')
        .update({ message_count: 0, tier_reset_date: now })
        .eq('auth0_id', session.user.sub);
      return { count: 0, limit: tier.daily_limit, remaining: tier.daily_limit };
    }

    // Check current usage
    const blocked = user.message_count >= tier.daily_limit;
    return {
      count: user.message_count,
      limit: tier.daily_limit,
      remaining: Math.max(0, tier.daily_limit - user.message_count),
      blocked
    };
  } else {
    // Existing guest rate limiting logic
    // (IP + fingerprint, 10 per 24 hours)
  }
}
```

---

### PHASE 3: Add Redis Caching (Week 3)

#### 3.1 Install Redis Client

```bash
cd /home/user/chatgpt-philippines
npm install redis
```

#### 3.2 Create Redis Client

**Create:** `/home/user/chatgpt-philippines/lib/redis.ts`

```typescript
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

let redis: ReturnType<typeof createClient> | null = null;

export const getRedisClient = async () => {
  if (!redisUrl) return null;
  
  if (!redis) {
    redis = createClient({ url: redisUrl });
    redis.on('error', (err) => console.error('Redis error:', err));
    await redis.connect();
  }
  
  return redis;
};

export const cacheRateLimit = async (key: string, value: any, ttl: number = 60) => {
  const client = await getRedisClient();
  if (!client) return;
  
  await client.setEx(key, ttl, JSON.stringify(value));
};

export const getRateLimitCache = async (key: string) => {
  const client = await getRedisClient();
  if (!client) return null;
  
  const cached = await client.get(key);
  return cached ? JSON.parse(cached) : null;
};
```

#### 3.3 Update Rate Limit API to Use Cache

**Modify:** `/home/user/chatgpt-philippines/app/api/rate-limit/route.ts`

```typescript
import { getRateLimitCache, cacheRateLimit } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  const fingerprint = getBrowserFingerprint(request);
  const cacheKey = `rate-limit:${ip}:${fingerprint}`;
  
  // Try cache first
  const cached = await getRateLimitCache(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }
  
  // Query DB if not cached
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .or(`ip.eq.${ip},fingerprint.eq.${fingerprint}`)
    .maybeSingle();
  
  const result = {
    count: existing?.message_count || 0,
    limit: 10,
    remaining: existing ? Math.max(0, 10 - existing.message_count) : 10,
    blocked: existing ? existing.message_count >= 10 : false
  };
  
  // Cache for 1 minute
  await cacheRateLimit(cacheKey, result, 60);
  
  return NextResponse.json(result);
}
```

---

### PHASE 4: Add Usage Alerts (Week 4)

#### 4.1 Create Alert System

**Create:** `/home/user/chatgpt-philippines/lib/alerts.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkUsageAlerts(userId: string): Promise<void> {
  const { data: stats } = await supabase
    .from('model_usage')
    .select('cost_usd')
    .eq('user_id', userId)
    .gte('created_at', new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const monthlyCost = stats?.reduce((sum, row) => sum + row.cost_usd, 0) || 0;

  const { data: budget } = await supabase
    .from('budget_limits')
    .select('monthly_budget_usd')
    .eq('user_id', userId)
    .single();

  if (!budget) return;

  const percentUsed = (monthlyCost / budget.monthly_budget_usd) * 100;

  // Alert at 50%, 75%, 90%
  if (percentUsed >= 90) {
    await sendAlert(userId, 'critical', `You've used 90% of your monthly budget ($${monthlyCost.toFixed(2)})`);
  } else if (percentUsed >= 75) {
    await sendAlert(userId, 'warning', `You've used 75% of your monthly budget`);
  } else if (percentUsed >= 50) {
    await sendAlert(userId, 'info', `You've used 50% of your monthly budget`);
  }
}

async function sendAlert(userId: string, level: string, message: string) {
  await supabase.from('usage_alerts').insert({
    user_id: userId,
    level,
    message,
    created_at: new Date().toISOString()
  });
  
  // TODO: Send email notification
  // TODO: Send webhook to Slack
}
```

---

### PHASE 5: Multi-Tenancy (Week 5+)

#### 5.1 Add Organization Support

**Create Migration:**
File: `/home/user/chatgpt-philippines/supabase/migrations/20250120000000_add_organizations.sql`

```sql
-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  billing_email TEXT,
  subscription_tier TEXT DEFAULT 'free',
  monthly_budget_usd DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add organization_id to users
ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Add organization_id to chats
ALTER TABLE chats ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Add organization_id to rate_limits
ALTER TABLE rate_limits ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Update indexes
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_chats_organization_id ON chats(organization_id);
CREATE INDEX idx_rate_limits_organization_id ON rate_limits(organization_id);
```

#### 5.2 Create Organization Management API

**Create:** `/home/user/chatgpt-philippines/app/api/organizations/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { name, billingEmail } = await req.json();

  const { data: organization, error } = await supabase
    .from('organizations')
    .insert({
      name,
      owner_id: session.user.sub,
      billing_email: billingEmail || session.user.email
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ organization });
}
```

---

## Database Changes Summary

### New Tables to Add

1. `budget_limits` - Monthly spending limits per user
2. `subscription_tiers` - Pricing tiers and limits
3. `usage_alerts` - User alerts for usage milestones
4. `organizations` - Multi-tenant organization support
5. `api_keys` - User API keys for programmatic access (optional)

### Schema Updates Needed

1. Add `subscription_tier` to `users` table
2. Add `organization_id` to `users`, `chats`, `rate_limits` tables
3. Add `tier_reset_date` to `users` table
4. Add indices for new columns

### Migration Order

1. `/home/user/chatgpt-philippines/supabase/migrations/20250114000000_create_budget_limits.sql`
2. `/home/user/chatgpt-philippines/supabase/migrations/20250115000000_add_subscription_tiers.sql`
3. `/home/user/chatgpt-philippines/supabase/migrations/20250116000000_add_usage_alerts.sql`
4. `/home/user/chatgpt-philippines/supabase/migrations/20250120000000_add_organizations.sql`

---

## Environment Variables to Add

```bash
# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Email notifications (optional)
SENDGRID_API_KEY=your_key_here
SENDGRID_FROM_EMAIL=noreply@example.com

# Webhooks (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
WEBHOOK_SECRET=your_webhook_secret
```

---

## Testing Checklist

- [ ] Auth0 authentication working in chat endpoint
- [ ] Budget limits enforced (test by setting low budget)
- [ ] Rate limiting per subscription tier
- [ ] Redis caching active (measure reduced DB queries)
- [ ] Usage alerts triggered at thresholds
- [ ] Organizations created and isolated
- [ ] Multi-tenant data separation working
- [ ] Cost tracking accurate by organization
- [ ] API key rotation mechanism functional

---

## Performance Targets

After implementation:

- Rate limit check: < 100ms (with Redis cache < 10ms)
- Budget check: < 150ms
- Organization isolation: No leakage between orgs
- Cost tracking accuracy: Within 0.1% of actual
- Alert latency: < 5 seconds from threshold

---

## Monitoring & Alerts

Create monitoring for:

1. API response times (rate limit checks)
2. Database connection pool usage
3. Redis hit rates (should be > 80%)
4. Budget overages (for compliance)
5. Failed authentications (security)
6. High-cost queries (optimization)

---

## Files Not to Modify (to avoid breaking changes)

- `/home/user/chatgpt-philippines/app/api/grammar-check/route.ts` (working)
- `/home/user/chatgpt-philippines/app/api/translate/route.ts` (working)
- `/home/user/chatgpt-philippines/lib/modelSelection.ts` (stable)
- `/home/user/chatgpt-philippines/lib/constants.ts` (stable)
- `/home/user/chatgpt-philippines/tailwind.config.ts` (stable)

---

## Documentation to Update

After implementing each phase:

1. `/home/user/chatgpt-philippines/ARCHITECTURE_OVERVIEW.md` - Update sections
2. `/home/user/chatgpt-philippines/KEY_FILES_REFERENCE.md` - Add new files
3. `/home/user/chatgpt-philippines/.env.example` - Add new variables
4. Create API documentation for new endpoints

