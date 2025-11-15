# Security Documentation

## Overview

This Next.js application implements comprehensive security measures to protect against API key abuse, platform misuse, and common web vulnerabilities. This document outlines the security architecture, best practices, and implementation guidelines.

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Protection Layers](#protection-layers)
3. [API Key Security](#api-key-security)
4. [Rate Limiting](#rate-limiting)
5. [Abuse Detection](#abuse-detection)
6. [Request Validation](#request-validation)
7. [Security Headers](#security-headers)
8. [Monitoring & Alerting](#monitoring--alerting)
9. [Environment Variables](#environment-variables)
10. [Best Practices](#best-practices)
11. [Incident Response](#incident-response)

---

## Security Architecture

### Defense in Depth

The application implements multiple layers of security:

```
Request Flow:
1. Edge Middleware (middleware.ts)
   - Security headers
   - Request size validation
   - Bot detection
   - Content-Type validation

2. API Protection Layer (lib/security/api-protection.ts)
   - Rate limiting
   - Abuse detection
   - Request validation
   - Authentication checks

3. Business Logic
   - Application-specific validation
   - Data processing
```

### Key Components

- **Middleware** (`/middleware.ts`): Global security headers and request validation
- **Rate Limiter** (`/lib/security/rate-limiter.ts`): Redis-backed rate limiting with multiple strategies
- **Abuse Detector** (`/lib/security/abuse-detector.ts`): Pattern recognition and automated threat detection
- **Request Validator** (`/lib/security/request-validator.ts`): Input sanitization and validation
- **API Protection** (`/lib/security/api-protection.ts`): Centralized security wrapper for API routes

---

## Protection Layers

### Layer 1: Edge Middleware

All requests pass through Next.js middleware which applies:

- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Request Size Limits**: Prevents payload-based DoS attacks
- **Content-Type Validation**: Ensures proper request formatting
- **Basic Bot Detection**: Filters out obvious automated requests

**Location**: `/middleware.ts`

### Layer 2: Rate Limiting

Redis-backed sliding window rate limiting with:

- **IP-based limiting**: Prevents single IP from overwhelming the system
- **Fingerprint-based limiting**: Tracks browser fingerprints to prevent VPN bypass
- **Tiered limits**: Different limits for free users, authenticated users, and suspicious IPs
- **Automatic fallback**: Uses in-memory storage if Redis is unavailable

**Location**: `/lib/security/rate-limiter.ts`

**Rate Limits**:
```typescript
FREE_CHAT: 10 requests / 24 hours
FREE_IMAGE_GEN: 5 requests / 24 hours
FREE_RESEARCH: 3 requests / 24 hours
AUTH_CHAT: 100 requests / hour
GLOBAL_IP: 30 requests / minute
```

### Layer 3: Abuse Detection

Real-time pattern analysis detects:

- **Rapid requests**: Too many requests in short timeframe
- **Identical requests**: Same request repeated multiple times
- **Burst traffic**: Sudden traffic spikes
- **Endpoint enumeration**: Scanning for available endpoints
- **Malicious payloads**: Script injection, SQL injection attempts
- **Suspicious user agents**: Bot-like behavior

**Risk Scoring**:
- 0-20: Low risk (log only)
- 20-40: Medium risk (CAPTCHA challenge)
- 40-60: High risk (temporary block)
- 60-100: Critical risk (permanent block)

**Location**: `/lib/security/abuse-detector.ts`

### Layer 4: Request Validation

All incoming payloads are:

- **Sanitized**: Removes dangerous patterns and control characters
- **Validated**: Checks data types, formats, and constraints
- **Size-limited**: Prevents oversized payloads
- **Depth-checked**: Prevents deeply nested objects
- **Injection-protected**: Detects SQL/NoSQL injection attempts

**Location**: `/lib/security/request-validator.ts`

---

## API Key Security

### Storage

- **Environment Variables Only**: API keys stored in `.env.local` or environment config
- **Never in Client Code**: Keys only accessible server-side
- **Service Role Keys**: Supabase service role key kept separate from anon key

### Rotation & Management

The API Key Manager (`/lib/apiKeyManager.ts`) provides:

- **Multi-key support**: Use multiple Anthropic API keys for load balancing
- **Automatic rotation**: Round-robin key selection
- **Circuit breaker**: Automatically disables failing keys
- **Health monitoring**: Tracks errors and success rates
- **Automatic recovery**: Re-enables keys after cooldown period

**Configuration**:
```env
ANTHROPIC_API_KEY=primary_key_here
ANTHROPIC_API_KEY_2=secondary_key_here
ANTHROPIC_API_KEY_3=tertiary_key_here
```

### Usage Monitoring

- Track token usage per request
- Calculate costs in real-time
- Alert on unusual usage patterns
- Automatic shutoff when approaching limits

---

## Rate Limiting

### Implementation

Rate limiting uses a **sliding window algorithm** with Redis backend:

```typescript
import { getRateLimiter } from '@/lib/security/rate-limiter';

const limiter = getRateLimiter();
const result = await limiter.checkLimit({
  type: 'FREE_CHAT',
  identifier: `${ip}:${fingerprint}`,
  cost: 1,
});

if (!result.allowed) {
  // Return 429 error
}
```

### Strategies

1. **IP-based**: Primary identifier
2. **Fingerprint-based**: Browser fingerprint from headers
3. **Combination**: IP + fingerprint to prevent VPN bypass
4. **User-based**: Track authenticated users separately

### Bypass Prevention

- **Multiple identifiers**: Use both IP and fingerprint
- **VPN detection**: Fingerprint persists across VPN changes
- **Cookie tracking**: Additional layer for repeat offenders
- **Exponential backoff**: Increase penalties for repeated violations

---

## Abuse Detection

### Patterns Detected

#### 1. Timing-based Attacks
- Rapid successive requests (10 in 10 seconds)
- Burst traffic (50 in 1 minute)

#### 2. Behavioral Attacks
- Identical repeated requests
- Sequential endpoint scanning
- Missing standard headers

#### 3. Content-based Attacks
- XSS injection attempts
- SQL/NoSQL injection
- Path traversal
- Command injection
- Large payloads

#### 4. Bot Detection
- Missing or suspicious user agents
- Automated tool signatures (curl, wget, postman)
- Missing browser headers

### Response Actions

Based on risk score:

1. **Log Only** (0-20): Record for analysis
2. **Challenge** (20-40): Require CAPTCHA (future implementation)
3. **Temporary Block** (40-60): Block for 1 hour
4. **Permanent Block** (60-100): Block until manual review

### False Positive Mitigation

- **Gradual penalties**: Build up to blocking
- **Whitelist capability**: Allow trusted IPs
- **Manual override**: Admin can unblock
- **Appeal process**: Users can request review

---

## Request Validation

### Input Sanitization

All user input is sanitized to prevent:

- **XSS attacks**: Remove script tags, event handlers
- **SQL injection**: Detect and block SQL patterns
- **NoSQL injection**: Block MongoDB operator patterns
- **Path traversal**: Remove `../` sequences
- **Control characters**: Strip non-printable characters

### Validation Rules

#### Chat Requests
```typescript
{
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  model?: string
}
```
- Max 100 messages per request
- Max 50KB per message
- Content sanitized for XSS

#### Research Paper Requests
```typescript
{
  topic: string (3-1000 chars),
  researchType: enum,
  citationStyle: enum,
  additionalInfo?: string (max 5000 chars)
}
```

#### Image Generation Requests
```typescript
{
  prompt: string (3-2000 chars),
  style?: enum,
  size?: enum
}
```

### Payload Size Limits

- Chat: 50KB
- Image generation: 10KB
- Research papers: 20KB
- Code generation: 30KB
- Data processing: 5MB
- Default: 100KB

---

## Security Headers

### Implemented Headers

```typescript
Content-Security-Policy: [restrictive policy]
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.auth0.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: blob:;
connect-src 'self' https://*.supabase.co https://*.auth0.com https://api.anthropic.com;
frame-ancestors 'none';
```

---

## Monitoring & Alerting

### Security Dashboard

Access at: `/api/admin/security-dashboard`

**Metrics Provided**:
- Blocked IPs count
- Recent abuse attempts (last hour)
- API key health status
- Rate limiting statistics
- Top abusive IPs

**Example Request**:
```bash
curl http://localhost:3000/api/admin/security-dashboard?details=true
```

**Example Response**:
```json
{
  "timestamp": "2025-11-16T10:30:00Z",
  "overview": {
    "blockedIPs": 5,
    "recentAbuseAttempts": 23,
    "apiKeysHealthy": 3,
    "apiKeysTotal": 3
  },
  "apiKeys": {
    "status": {
      "healthy": 3,
      "circuitOpen": 0,
      "total": 3
    },
    "alerts": []
  },
  "health": {
    "status": "healthy",
    "issues": []
  }
}
```

### Abuse Logs

Access at: `/api/admin/abuse-logs?ip=<address>`

**Example Request**:
```bash
curl http://localhost:3000/api/admin/abuse-logs?ip=192.168.1.1&limit=10
```

### Real-time Monitoring

Console logs include:
```
[Security] Suspicious request detected: <reason> | IP: <ip> | Path: <path>
[Rate Limiter] User blocked: <ip> (10/10 limit reached)
[Abuse Detector] IP blocked: <ip> for <duration>
[API Key Manager] Circuit breaker opened for key <masked_key>
```

### Alerts

API Key Manager alerts on:
- Circuit breaker opened
- Only 1 healthy key remaining
- All keys circuit-broken (critical)
- Approaching error threshold

---

## Environment Variables

### Required Variables

```env
# Anthropic API Keys (Required)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_API_KEY_2=sk-ant-...  # Optional: for load balancing

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # NEVER expose to client

# Auth0 (Required)
AUTH0_SECRET=<generate with: openssl rand -base64 32>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Redis (Optional but Recommended)
REDIS_URL=redis://localhost:6379
# Without Redis, in-memory fallback is used (not suitable for production)
```

### Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly** (every 90 days)
4. **Use secret management** (AWS Secrets Manager, Vercel Secrets)
5. **Monitor key usage** in provider dashboards
6. **Set up billing alerts** to prevent cost overruns

---

## Best Practices

### For Developers

1. **Always use protection wrappers**:
   ```typescript
   export const POST = withAPIProtection(handler, options);
   ```

2. **Never trust client input**:
   ```typescript
   const { sanitizedPayload } = context;
   // Use sanitizedPayload, not raw request body
   ```

3. **Log security events**:
   ```typescript
   console.warn('[Security] Event:', details);
   ```

4. **Handle errors gracefully**:
   ```typescript
   // Fail open on non-critical errors
   // Fail closed on security violations
   ```

5. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```

### For Production Deployment

1. **Enable Redis**: In-memory fallback is not suitable for production
2. **Set up monitoring**: Configure log aggregation (Datadog, Sentry)
3. **Configure CORS properly**: Restrict allowed origins
4. **Use HTTPS only**: Enable HSTS header
5. **Regular security audits**: Review logs weekly
6. **Backup security data**: Export abuse logs regularly
7. **Test fail scenarios**: Ensure graceful degradation

### For API Route Migration

Follow the migration guide in `/lib/security/secured-routes-example.ts`:

1. Import protection utilities
2. Wrap handler with `withAPIProtection`
3. Use `context.sanitizedPayload` instead of `request.json()`
4. Remove manual rate limiting code
5. Test thoroughly

---

## Incident Response

### If API Keys Are Compromised

1. **Immediate Actions**:
   - Revoke compromised keys in Anthropic dashboard
   - Generate new keys
   - Update environment variables
   - Restart application

2. **Investigation**:
   - Check abuse logs: `/api/admin/abuse-logs`
   - Review recent usage in Anthropic dashboard
   - Identify affected time window
   - Determine attack vector

3. **Prevention**:
   - Rotate all remaining keys
   - Strengthen rate limits temporarily
   - Review access logs
   - Update security policies

### If Under DDoS Attack

1. **Immediate Actions**:
   - Enable Cloudflare DDoS protection (if available)
   - Reduce rate limits: Edit `RATE_LIMITS` in `rate-limiter.ts`
   - Block suspicious IPs manually

2. **Monitoring**:
   - Watch security dashboard
   - Monitor Redis memory usage
   - Check application performance

3. **Escalation**:
   - Contact hosting provider (Vercel)
   - Enable additional protection layers
   - Consider temporary maintenance mode

### If Abuse Detected

1. **Review Abuse Logs**:
   ```bash
   curl http://localhost:3000/api/admin/abuse-logs?ip=<suspicious_ip>
   ```

2. **Block If Confirmed**:
   ```bash
   curl -X DELETE http://localhost:3000/api/admin/security-dashboard/block \
     -H "Content-Type: application/json" \
     -d '{"ip":"192.168.1.1","duration":86400000}'
   ```

3. **Analyze Pattern**:
   - Update abuse detection rules if new pattern found
   - Adjust risk scoring weights
   - Add to honeypot endpoints

---

## Testing Security

### Manual Testing

1. **Rate Limiting**:
   ```bash
   # Send 11 requests quickly
   for i in {1..11}; do curl http://localhost:3000/api/chat -X POST; done
   # 11th request should be blocked
   ```

2. **XSS Protection**:
   ```bash
   curl http://localhost:3000/api/chat -X POST \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"<script>alert(1)</script>"}]}'
   # Should be sanitized
   ```

3. **SQL Injection**:
   ```bash
   curl http://localhost:3000/api/research-paper -X POST \
     -H "Content-Type: application/json" \
     -d '{"topic":"test OR 1=1"}'
   # Should be detected and blocked
   ```

### Automated Testing

```bash
# Run security audit
npm audit

# Check for vulnerable dependencies
npm outdated

# Run tests (if implemented)
npm test
```

---

## Updates & Maintenance

### Regular Tasks

**Daily**:
- Monitor security dashboard
- Review error logs

**Weekly**:
- Export abuse logs
- Review blocked IPs
- Check API key health

**Monthly**:
- Update dependencies
- Review rate limit effectiveness
- Analyze abuse patterns
- Adjust detection rules

**Quarterly**:
- Rotate API keys
- Security audit
- Penetration testing (if budget allows)
- Review and update documentation

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Anthropic API Best Practices](https://docs.anthropic.com/claude/docs/intro-to-claude)
- [Redis Security](https://redis.io/docs/management/security/)
- [Auth0 Security](https://auth0.com/docs/secure)

---

## Contact

For security concerns or to report vulnerabilities:
- **Email**: security@yourdomain.com
- **Bug Bounty**: (if applicable)

**IMPORTANT**: Never share security vulnerabilities publicly. Use responsible disclosure.

---

## Changelog

### 2025-11-16
- Initial security implementation
- Added comprehensive middleware
- Implemented Redis-backed rate limiting
- Added abuse detection system
- Created request validation layer
- Built security monitoring dashboard
- Documented security architecture

---

*Last updated: 2025-11-16*
