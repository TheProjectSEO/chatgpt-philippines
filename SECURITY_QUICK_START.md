# Security System Quick Start Guide

Get your API endpoints secured in 5 minutes.

## Step 1: Set Up Redis (2 minutes)

### Option A: Upstash (Recommended - FREE)

1. Go to [upstash.com](https://upstash.com) and sign up
2. Create a new Redis database:
   - Name: `chatgpt-ph-security`
   - Region: Choose closest to your deployment
   - Type: Regional
3. Copy the connection URL
4. Add to `.env.local`:
   ```env
   REDIS_URL=redis://default:YOUR_PASSWORD@YOUR_HOST:6379
   ```

### Option B: Local Redis (Development)

```bash
# macOS
brew install redis && brew services start redis

# Linux
sudo apt-get install redis-server && sudo service redis-server start

# Docker
docker run -d -p 6379:6379 redis:7-alpine
```

Add to `.env.local`:
```env
REDIS_URL=redis://localhost:6379
```

**Note**: System works without Redis (in-memory fallback), but Redis is highly recommended for production.

## Step 2: Protect Your First API Route (2 minutes)

### Before (Unprotected)
```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Your logic...
  return NextResponse.json({ success: true });
}
```

### After (Protected)
```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAPIProtection } from '@/lib/security/api-protection';

export const POST = withAPIProtection(
  async (request, context) => {
    // Use sanitized payload (XSS/injection filtered)
    const { messages } = context!.sanitizedPayload;

    // Your logic here - already protected from:
    // ✅ Rate limit abuse
    // ✅ XSS attacks
    // ✅ SQL/NoSQL injection
    // ✅ Rapid requests
    // ✅ Malicious payloads

    return NextResponse.json({ success: true });
  },
  {
    rateLimitType: 'FREE_CHAT',  // 10 requests/24h for free users
    checkAbuse: true,            // Enable abuse detection
    validatePayload: true,       // Sanitize and validate input
  }
);
```

That's it! Your API is now protected.

## Step 3: Test It (1 minute)

```bash
# Make 10 requests (should succeed)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"test"}]}'
done

# 11th request should be blocked
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'

# Expected: {"error":"Rate limit exceeded", ...}
```

## What You Get Out of the Box

### Rate Limiting
- **Free users**: 10 chat messages/day, 5 images/day, 3 research papers/day
- **Authenticated users**: 100 chat/hour, 50 images/hour, 20 papers/hour
- **Global IP limit**: 30 requests/minute to prevent abuse
- Automatic reset after time window

### Abuse Detection
Automatically blocks:
- Rapid successive requests (>10 req/10s)
- Burst traffic (>50 req/min)
- Identical repeated requests
- Endpoint scanning/enumeration
- Malicious payloads (XSS, SQL injection)
- Bot user agents

### Input Validation
Protects against:
- XSS attacks (script tags, event handlers)
- SQL injection (UNION SELECT, etc.)
- NoSQL injection ($where, $regex)
- Path traversal (../../)
- Command injection
- Oversized payloads (>1MB)

## Available Rate Limit Types

Choose the appropriate limit for your endpoint:

```typescript
// Free tier (24 hour window)
'FREE_CHAT'            // 10 requests/day
'FREE_IMAGE_GEN'       // 5 requests/day
'FREE_RESEARCH'        // 3 requests/day
'FREE_DATA_PROCESSING' // 10 requests/hour

// Authenticated (1 hour window)
'AUTH_CHAT'            // 100 requests/hour
'AUTH_IMAGE_GEN'       // 50 requests/hour
'AUTH_RESEARCH'        // 20 requests/hour

// Special
'SUSPICIOUS_IP'        // 5 requests/hour (auto-applied to flagged IPs)
'GLOBAL_IP'           // 30 requests/minute (prevents single IP overwhelm)
'API_ENDPOINT'        // 20 requests/minute (general API limit)
```

## Customization Examples

### Custom Rate Limit

```typescript
// lib/security/rate-limiter.ts
export const RATE_LIMITS = {
  // ... existing limits

  MY_PREMIUM_TIER: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 1000,          // 1000 requests
    message: 'Premium rate limit exceeded',
  },
} as const;

// Then use in your route:
export const POST = withAPIProtection(handler, {
  rateLimitType: 'MY_PREMIUM_TIER',
});
```

### Custom Validation

```typescript
export const POST = withAPIProtection(
  async (request, context) => {
    const { customData } = context!.sanitizedPayload;
    // Your logic...
  },
  {
    rateLimitType: 'FREE_CHAT',
    customValidation: async (body: any) => {
      // Your custom validation logic
      if (!body.customField) {
        return {
          valid: false,
          errors: ['customField is required']
        };
      }

      // Sanitize
      const sanitized = {
        customField: body.customField.trim(),
      };

      return { valid: true, sanitized };
    },
  }
);
```

### Whitelist Specific IPs (Development)

```typescript
// lib/security/abuse-detector.ts
// Add at the start of checkRequest method:

const WHITELIST = ['127.0.0.1', '::1', 'your-office-ip'];

if (WHITELIST.includes(metadata.ip)) {
  return {
    isAbusive: false,
    riskScore: 0,
    reasons: [],
    action: 'allow',
  };
}
```

## Admin Monitoring

### View Security Dashboard

```bash
curl http://localhost:3000/api/admin/security/metrics?detailed=true | jq
```

Response:
```json
{
  "timestamp": "2025-11-16T05:40:00.000Z",
  "abuse": {
    "totalBlocked": 5,
    "recentAbuse": 12,
    "topAbusiveIPs": []
  },
  "rateLimit": {
    "backend": "redis",
    "redisAvailable": true
  },
  "recommendations": [
    "All security metrics within normal parameters."
  ]
}
```

### Check Abuse Logs

```bash
# Get abuse stats
curl http://localhost:3000/api/admin/security/abuse-logs

# Get logs for specific IP
curl "http://localhost:3000/api/admin/security/abuse-logs?ip=192.168.1.1"
```

### Block/Unblock IPs Manually

```bash
# Block an IP for 1 hour
curl -X POST http://localhost:3000/api/admin/security/blocked-ips \
  -H "Content-Type: application/json" \
  -d '{"ip":"192.168.1.100","duration":3600000}'

# Check if IP is blocked
curl "http://localhost:3000/api/admin/security/blocked-ips?ip=192.168.1.100"

# Unblock IP
curl -X DELETE "http://localhost:3000/api/admin/security/blocked-ips?ip=192.168.1.100"
```

## Common Use Cases

### 1. Public Free API (High Restrictions)

```typescript
export const POST = withAPIProtection(handler, {
  rateLimitType: 'FREE_CHAT',     // Tight limits
  checkAbuse: true,                // Enable all abuse checks
  validatePayload: true,           // Strict validation
  requireAuth: false,              // No auth required
});
```

### 2. Authenticated Premium API (Relaxed)

```typescript
export const POST = withAPIProtection(handler, {
  rateLimitType: 'AUTH_CHAT',      // Higher limits
  checkAbuse: true,                // Still check abuse
  validatePayload: true,
  requireAuth: true,               // Require login
});
```

### 3. Internal/Admin API (Minimal Protection)

```typescript
export const POST = withAPIProtection(handler, {
  rateLimitType: 'API_ENDPOINT',   // Basic rate limit only
  checkAbuse: false,               // Skip abuse detection
  validatePayload: true,           // Always validate
  requireAuth: true,               // Require admin role
});
```

### 4. Webhook/Callback (No Rate Limit)

```typescript
// Manual protection without rate limiting
export async function POST(request: NextRequest) {
  const { ip } = getClientIdentification(request);

  // Check if IP is blocked
  const abuseDetector = getAbuseDetector();
  if (await abuseDetector.isBlocked(ip)) {
    return NextResponse.json({ error: 'Blocked' }, { status: 403 });
  }

  // Your webhook logic...
}
```

## File Structure

```
/Users/adityaaman/Desktop/ChatGPTPH/
├── lib/
│   └── security/
│       ├── rate-limiter.ts         # Redis-backed rate limiting
│       ├── abuse-detector.ts       # Pattern recognition
│       ├── request-validator.ts    # Input sanitization
│       └── api-protection.ts       # Centralized wrapper
├── app/
│   └── api/
│       ├── admin/
│       │   └── security/
│       │       ├── abuse-logs/route.ts
│       │       ├── blocked-ips/route.ts
│       │       └── metrics/route.ts
│       └── rate-limit/
│           ├── route.ts            # Old Supabase system
│           └── enhanced-route.ts   # New Redis + fallback
├── REDIS_SETUP_GUIDE.md            # Detailed Redis setup
├── SECURITY_IMPLEMENTATION.md      # Comprehensive guide
├── SECURITY_TESTING.md             # Testing guide
└── SECURITY_QUICK_START.md         # This file
```

## Environment Variables Reference

```env
# Required for production
REDIS_URL=redis://default:password@host:6379

# Optional: Supabase fallback
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Optional: Authentication (for admin APIs)
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=your-auth0-domain
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

## Troubleshooting

### "Using in-memory fallback" warning

**Cause**: Redis not configured or unreachable

**Fix**:
1. Check `REDIS_URL` in `.env.local`
2. Verify Redis server is running
3. Test connection: `redis-cli -u $REDIS_URL ping`

**Note**: App still works with in-memory, but not recommended for production.

### Rate limiting not working

**Cause**: Multiple possible issues

**Debug steps**:
```bash
# Check if Redis is configured
curl http://localhost:3000/api/admin/security/metrics | jq '.rateLimit'

# Test rate limit manually
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"test"}]}'
done
```

### False positives (legitimate users blocked)

**Cause**: Abuse detection too strict

**Fix**: Adjust thresholds in `/lib/security/abuse-detector.ts`:
```typescript
const ABUSE_PATTERNS = {
  RAPID_REQUESTS: {
    weight: 20,  // Lower from 30
    threshold: { requests: 15, windowMs: 10000 },  // Increase from 10
  },
};
```

## Next Steps

1. ✅ Set up Redis
2. ✅ Protect your API routes
3. ✅ Test security features
4. ⏭️ Configure rate limits for your use case
5. ⏭️ Set up monitoring alerts
6. ⏭️ Review [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md) for advanced features
7. ⏭️ Run security tests before deployment

## Support

- **Full Documentation**: [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md)
- **Redis Setup**: [REDIS_SETUP_GUIDE.md](./REDIS_SETUP_GUIDE.md)
- **Testing**: [SECURITY_TESTING.md](./SECURITY_TESTING.md)

## Security Best Practices

1. ✅ Always use sanitized payloads from `context.sanitizedPayload`
2. ✅ Never trust user input directly
3. ✅ Use Redis in production (not in-memory)
4. ✅ Monitor abuse logs regularly
5. ✅ Keep rate limits reasonable but protective
6. ✅ Test thoroughly before deploying
7. ✅ Enable authentication for admin APIs
8. ✅ Run `npm audit` regularly

---

**You're all set!** Your API endpoints are now protected with enterprise-grade security.
