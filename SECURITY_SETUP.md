# Security Implementation Setup Guide

## Quick Start (5 Minutes)

This guide will help you implement the comprehensive security guardrails in your Next.js application.

---

## Step 1: Environment Variables

Add these to your `.env.local` file:

```env
# Redis (Required for production, optional for development)
REDIS_URL=redis://localhost:6379
# OR use Redis Cloud/Upstash:
# REDIS_URL=rediss://default:password@hostname:port

# Make sure these existing variables are set:
ANTHROPIC_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**:
- Without Redis, the system falls back to in-memory storage (not recommended for production)
- For production, use Redis Cloud (free tier) or Upstash

---

## Step 2: Install Redis (Development)

### Option A: Docker (Recommended)
```bash
docker run -d -p 6379:6379 redis:alpine
```

### Option B: Homebrew (macOS)
```bash
brew install redis
brew services start redis
```

### Option C: Skip Redis
The system will work without Redis using in-memory fallback (development only).

---

## Step 3: Update Your API Routes

You have **two options** for securing your API routes:

### Option A: High-Level Wrapper (Easiest)

Replace your existing API route handler:

**Before**:
```typescript
export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  // your logic
}
```

**After**:
```typescript
import { withAPIProtection } from '@/lib/security/api-protection';

export const POST = withAPIProtection(
  async (request, context) => {
    const { messages } = context!.sanitizedPayload;
    // your logic - payload is already validated
  },
  {
    rateLimitType: 'FREE_CHAT',
    checkAbuse: true,
    validatePayload: true,
  }
);
```

### Option B: Manual Protection (More Control)

```typescript
import { protectAPIRoute, createProtectionResponse } from '@/lib/security/api-protection';

export async function POST(request: NextRequest) {
  const securityCheck = await protectAPIRoute(request, {
    rateLimitType: 'FREE_CHAT',
    checkAbuse: true,
    validatePayload: true,
  });

  if (!securityCheck.allowed) {
    return createProtectionResponse(securityCheck);
  }

  const { sanitizedPayload } = securityCheck.metadata!;
  // your logic
}
```

---

## Step 4: Choose Rate Limit Types

Match your endpoint to the appropriate rate limit:

| Endpoint Type | Rate Limit Type | Limit |
|--------------|----------------|-------|
| Chat (free users) | `FREE_CHAT` | 10/day |
| Chat (authenticated) | `AUTH_CHAT` | 100/hour |
| Image generation | `FREE_IMAGE_GEN` | 5/day |
| Research papers | `FREE_RESEARCH` | 3/day |
| Data processing | `FREE_DATA_PROCESSING` | 10/hour |
| General API | `API_ENDPOINT` | 20/minute |
| Global limit | `GLOBAL_IP` | 30/minute |

---

## Step 5: Remove Old Rate Limiting Code

If you have existing rate limiting, remove it:

**Delete these fetch calls**:
```typescript
// DELETE THIS:
const rateLimitResponse = await fetch('/api/rate-limit', {
  method: 'POST',
  body: JSON.stringify({ action: 'increment' })
});
```

The new protection layer handles rate limiting automatically.

---

## Step 6: Test Your Implementation

### Test 1: Valid Request
```bash
curl http://localhost:3000/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```
Should succeed.

### Test 2: Rate Limiting
```bash
# Send 11 requests quickly
for i in {1..11}; do
  curl http://localhost:3000/api/chat \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"test"}]}'
done
```
The 11th request should be blocked with 429 status.

### Test 3: XSS Protection
```bash
curl http://localhost:3000/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"<script>alert(1)</script>"}]}'
```
Script tags should be sanitized.

### Test 4: Invalid Payload
```bash
curl http://localhost:3000/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}'
```
Should return 400 error with validation details.

---

## Step 7: Monitor Security

### View Security Dashboard
```bash
curl http://localhost:3000/api/admin/security-dashboard?details=true | jq
```

Expected response:
```json
{
  "timestamp": "2025-11-16T10:30:00Z",
  "overview": {
    "blockedIPs": 0,
    "recentAbuseAttempts": 0,
    "apiKeysHealthy": 1,
    "apiKeysTotal": 1
  },
  "health": {
    "status": "healthy"
  }
}
```

### View Abuse Logs
```bash
curl "http://localhost:3000/api/admin/abuse-logs?ip=127.0.0.1" | jq
```

---

## Step 8: Production Deployment

### Checklist

- [ ] Set up Redis (Redis Cloud, Upstash, or AWS ElastiCache)
- [ ] Configure environment variables in production
- [ ] Test all protected endpoints
- [ ] Set up monitoring/alerting
- [ ] Configure Auth0 for admin endpoints
- [ ] Review and adjust rate limits if needed
- [ ] Set up log aggregation (optional)

### Redis Setup (Production)

**Option A: Upstash (Recommended)**
1. Sign up at https://upstash.com (free tier available)
2. Create Redis database
3. Copy connection URL
4. Add to Vercel environment variables:
   ```
   REDIS_URL=rediss://default:password@hostname:port
   ```

**Option B: Redis Cloud**
1. Sign up at https://redis.com/try-free
2. Create database
3. Get connection string
4. Add to environment variables

---

## Step 9: Customize Security Rules

### Adjust Rate Limits

Edit `/lib/security/rate-limiter.ts`:

```typescript
export const RATE_LIMITS = {
  FREE_CHAT: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 10, // ← Change this
    message: 'Free chat limit reached.',
  },
  // ... other limits
};
```

### Adjust Abuse Detection

Edit `/lib/security/abuse-detector.ts`:

```typescript
const ABUSE_PATTERNS = {
  RAPID_REQUESTS: {
    weight: 30, // Risk score weight
    threshold: { requests: 10, windowMs: 10000 }, // ← Adjust
  },
  // ... other patterns
};
```

### Adjust Risk Thresholds

```typescript
const RISK_THRESHOLDS = {
  LOW: 20,     // Log only
  MEDIUM: 40,  // Challenge (CAPTCHA)
  HIGH: 60,    // Temporary block
  CRITICAL: 80 // Permanent block
};
```

---

## Step 10: Integrate with Your Routes

### Priority Routes to Protect

1. **High Priority** (protect first):
   - `/api/chat` - Main chat endpoint
   - `/api/research-paper` - Expensive operations
   - `/api/image-generate` - Resource intensive
   - `/api/data-processor` - Large payloads

2. **Medium Priority**:
   - `/api/essay-write`
   - `/api/thesis-generate`
   - `/api/code-generate`
   - All tool endpoints

3. **Low Priority**:
   - Auth endpoints (already protected)
   - Health checks
   - Static endpoints

### Example Migration

**File**: `/app/api/research-paper/route.ts`

**Before**:
```typescript
export async function POST(req: NextRequest) {
  const { topic, researchType } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: 'Topic required' }, { status: 400 });
  }

  // API logic...
}
```

**After**:
```typescript
import { withAPIProtection } from '@/lib/security/api-protection';

export const POST = withAPIProtection(
  async (request, context) => {
    // Payload is already validated
    const { topic, researchType } = context!.sanitizedPayload;

    // API logic (no validation needed)
    // ...
  },
  {
    rateLimitType: 'FREE_RESEARCH',
    checkAbuse: true,
    validatePayload: true,
  }
);
```

---

## Troubleshooting

### Issue: Redis connection errors

**Solution 1**: Check Redis is running
```bash
redis-cli ping
# Should return: PONG
```

**Solution 2**: Use in-memory fallback (dev only)
```bash
# Comment out REDIS_URL in .env.local
# The system will automatically fall back
```

### Issue: Rate limiting not working

**Check**:
1. Redis is connected (check console logs)
2. Environment variables are set
3. Request is going through middleware

**Debug**:
```typescript
console.log('[Debug] Rate limit result:', rateLimitResult);
```

### Issue: All requests blocked

**Solution**: Reset rate limits manually
```typescript
import { getRateLimiter } from '@/lib/security/rate-limiter';

const limiter = getRateLimiter();
await limiter.reset('FREE_CHAT', 'your-ip:fingerprint');
```

### Issue: Abuse detector blocking legitimate traffic

**Solution 1**: Adjust thresholds in `/lib/security/abuse-detector.ts`

**Solution 2**: Whitelist your IP
```typescript
// Add to abuse-detector.ts
const WHITELIST_IPS = ['127.0.0.1', 'your-ip'];

if (WHITELIST_IPS.includes(metadata.ip)) {
  return { isAbusive: false, riskScore: 0, reasons: [], action: 'allow' };
}
```

---

## Performance Impact

Expected performance overhead:

- **Without Redis**: ~5-10ms per request (in-memory)
- **With Redis**: ~15-25ms per request (network call)
- **CPU usage**: Negligible (<1% increase)
- **Memory usage**: ~50MB for in-memory fallback, minimal with Redis

**Optimization tips**:
- Use Redis for production (faster than in-memory at scale)
- Adjust cleanup intervals if needed
- Consider caching validation results for identical payloads

---

## Security Best Practices

1. **Never commit secrets**
   - Add `.env.local` to `.gitignore`
   - Use secret managers in production

2. **Rotate API keys regularly**
   - Every 90 days minimum
   - Immediately if compromised

3. **Monitor abuse logs**
   - Review weekly
   - Set up alerts for critical events

4. **Keep dependencies updated**
   ```bash
   npm audit fix
   npm update
   ```

5. **Test security regularly**
   - Run penetration tests
   - Simulate attacks
   - Review OWASP Top 10

---

## Next Steps

1. **Add authentication to admin endpoints**
   ```typescript
   // In /app/api/admin/security-dashboard/route.ts
   const session = await getSession();
   if (!session?.user?.isAdmin) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

2. **Set up monitoring dashboard UI**
   - Create React component at `/app/admin/security`
   - Display metrics from API
   - Add charts for trends

3. **Implement CAPTCHA for suspicious requests**
   - Add reCAPTCHA or hCaptcha
   - Trigger on medium-risk requests
   - Integrate with abuse detector

4. **Configure alerting**
   - Email on critical events
   - Slack/Discord webhooks
   - PagerDuty integration

---

## Getting Help

- **Documentation**: See `SECURITY.md` for comprehensive guide
- **Examples**: Check `/lib/security/secured-routes-example.ts`
- **Issues**: Review console logs for detailed error messages

---

## Summary

You've implemented:
- ✅ Comprehensive middleware with security headers
- ✅ Redis-backed rate limiting with fallback
- ✅ Real-time abuse detection
- ✅ Input validation and sanitization
- ✅ Security monitoring dashboard
- ✅ API key protection and rotation

Your application is now protected against:
- API key abuse
- Rate limit bypassing
- XSS attacks
- SQL/NoSQL injection
- DDoS attacks
- Bot scraping
- Automated attacks

**Estimated setup time**: 5-10 minutes for basic setup, 30 minutes for full implementation.

---

*Last updated: 2025-11-16*
