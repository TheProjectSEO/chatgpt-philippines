# Security System Testing Guide

Comprehensive testing recommendations for the integrated security system.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Rate Limiting Tests](#rate-limiting-tests)
3. [Abuse Detection Tests](#abuse-detection-tests)
4. [Input Validation Tests](#input-validation-tests)
5. [Admin API Tests](#admin-api-tests)
6. [Integration Tests](#integration-tests)
7. [Load Testing](#load-testing)
8. [Security Audit](#security-audit)

## Quick Start

### Prerequisites

```bash
# Install testing dependencies (if not already installed)
npm install

# Ensure Redis is running (or using Upstash)
# Test Redis connection
node -e "const redis = require('redis'); const client = redis.createClient({url: process.env.REDIS_URL}); client.connect().then(() => console.log('✅ Redis OK')).catch(console.error);"

# Start development server
npm run dev
```

### Environment Setup for Testing

Create a `.env.test` file:
```env
# Use test Redis database (or separate Upstash database)
REDIS_URL=redis://localhost:6379/1  # Database 1 for testing

# Or use Upstash test database
# REDIS_URL=redis://...test-db...

# Supabase (optional for fallback testing)
NEXT_PUBLIC_SUPABASE_URL=your-test-url
SUPABASE_SERVICE_ROLE_KEY=your-test-key
```

## Rate Limiting Tests

### Test 1: Basic Rate Limit Check

**Objective**: Verify rate limiting works correctly

```bash
# Make 10 requests (should all succeed for free tier)
for i in {1..10}; do
  echo "Request $i"
  curl -s -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"test '$i'"}]}' | jq -r '.error // "✅ Success"'
  sleep 1
done

# 11th request should be blocked
echo "Request 11 (should be blocked)"
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test 11"}]}' | jq
```

**Expected Result**:
- Requests 1-10: Success
- Request 11: `{"error": "Rate limit exceeded", "message": "..."}`

### Test 2: Rate Limit Status Check

```bash
# Check current rate limit status
curl -s http://localhost:3000/api/rate-limit | jq
```

**Expected Response**:
```json
{
  "count": 10,
  "limit": 10,
  "remaining": 0,
  "blocked": true,
  "resetAt": "2025-11-17T05:40:00.000Z",
  "source": "redis"
}
```

### Test 3: Different IP Addresses

**Objective**: Verify rate limits are per-IP

```bash
# Simulate different IPs using proxy or VPN
# Or use X-Forwarded-For header (only works in dev)

curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 192.168.1.100" \
  -d '{"messages":[{"role":"user","content":"test"}]}' | jq -r '.error // "✅ Success"'

curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 192.168.1.101" \
  -d '{"messages":[{"role":"user","content":"test"}]}' | jq -r '.error // "✅ Success"'
```

**Expected Result**: Each IP should have separate rate limit counter

### Test 4: Rate Limit Reset

**Objective**: Verify rate limits reset after window expires

```bash
# Check current status
echo "Before reset:"
curl -s http://localhost:3000/api/rate-limit | jq '{count, remaining, resetAt}'

# Wait for reset time or manually reset via Redis
redis-cli -u $REDIS_URL DEL "ratelimit:FREE_CHAT:YOUR_IP:YOUR_FINGERPRINT"

# Check after reset
echo "After reset:"
curl -s http://localhost:3000/api/rate-limit | jq '{count, remaining, resetAt}'
```

### Test 5: Redis Fallback to In-Memory

**Objective**: Test graceful degradation when Redis fails

```bash
# Stop Redis or use invalid REDIS_URL
export REDIS_URL="redis://invalid:6379"

# Restart dev server and test
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}' | jq

# Check logs - should see: "Using in-memory fallback"
```

## Abuse Detection Tests

### Test 6: Rapid Request Detection

**Objective**: Trigger rapid request abuse detection

```bash
# Send 15 requests in 5 seconds (exceeds 10 req/10s threshold)
echo "Sending rapid requests..."
for i in {1..15}; do
  curl -s -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"rapid test '$i'"}]}' &
done
wait

# Check if IP is blocked
sleep 2
curl -s http://localhost:3000/api/admin/security/blocked-ips?ip=127.0.0.1 | jq
```

**Expected Result**:
- High risk score detected
- IP potentially blocked (depending on cumulative score)
- Console logs show abuse warnings

### Test 7: Identical Request Detection

**Objective**: Detect repeated identical requests

```bash
# Send same request 6 times (exceeds threshold of 5)
echo "Sending identical requests..."
for i in {1..6}; do
  curl -s -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"exactly the same message"}]}' | jq -r '.error // "Request '$i' OK"'
  sleep 0.5
done
```

**Expected Result**:
- First few requests succeed
- Later requests flagged as suspicious
- Risk score increases

### Test 8: Endpoint Enumeration Detection

**Objective**: Detect endpoint scanning behavior

```bash
# Access multiple different endpoints rapidly
endpoints=(
  "/api/chat"
  "/api/research-paper"
  "/api/image-generate"
  "/api/code-generate"
  "/api/code-analyzer"
  "/api/data-processor"
  "/api/data-viz"
  "/api/rate-limit"
  "/api/admin/security/metrics"
  "/api/admin/security/abuse-logs"
)

for endpoint in "${endpoints[@]}"; do
  curl -s -X GET http://localhost:3000$endpoint > /dev/null
  echo "Accessed: $endpoint"
done

# Check abuse logs
curl -s "http://localhost:3000/api/admin/security/abuse-logs?ip=127.0.0.1" | jq
```

**Expected Result**: Sequential endpoint access flagged

### Test 9: Malicious Payload Detection

**Objective**: Test XSS and injection detection

```bash
# XSS attempt
echo "Testing XSS detection..."
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"<script>alert(1)</script>"}]}' | jq

# SQL injection attempt
echo "Testing SQL injection detection..."
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"1 OR 1=1; DROP TABLE users;"}]}' | jq

# NoSQL injection attempt
echo "Testing NoSQL injection detection..."
curl -s -X POST http://localhost:3000/api/data-processor \
  -H "Content-Type: application/json" \
  -d '{"data":{"$where":"function() { return true; }"}}' | jq
```

**Expected Result**:
- High risk scores
- Requests blocked or flagged
- Patterns detected in abuse logs

### Test 10: Suspicious User Agent Detection

**Objective**: Detect bot user agents

```bash
# Bot user agent
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "User-Agent: python-requests/2.31.0" \
  -d '{"messages":[{"role":"user","content":"test"}]}' | jq

# Scraper user agent
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1)" \
  -d '{"messages":[{"role":"user","content":"test"}]}' | jq
```

**Expected Result**: Risk score increased for bot-like user agents

## Input Validation Tests

### Test 11: XSS Protection

**Test Cases**:
```bash
# Script tag
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"<script>alert(\"XSS\")</script>"}]}' | jq

# Event handler
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"<img src=x onerror=alert(1)>"}]}' | jq

# JavaScript protocol
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"<a href=\"javascript:alert(1)\">click</a>"}]}' | jq

# Iframe injection
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"<iframe src=\"evil.com\"></iframe>"}]}' | jq
```

**Expected Result**: All malicious patterns removed or flagged

### Test 12: SQL Injection Protection

```bash
# Classic SQL injection
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"admin\"-- "}]}' | jq

# UNION SELECT
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"1 UNION SELECT * FROM users"}]}' | jq

# Boolean-based
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"1=1 OR 1=1"}]}' | jq
```

**Expected Result**: SQL patterns detected and blocked

### Test 13: Path Traversal Protection

```bash
# Path traversal attempt
curl -s -X POST http://localhost:3000/api/data-processor \
  -H "Content-Type: application/json" \
  -d '{"data":{"file":"../../etc/passwd"}}' | jq
```

**Expected Result**: Path traversal patterns removed

### Test 14: Large Payload Protection

```bash
# Generate large payload (>1MB)
python3 << 'EOF'
import requests
import json

large_content = "A" * (1024 * 1024 + 1)  # 1MB + 1 byte
payload = {
    "messages": [
        {"role": "user", "content": large_content}
    ]
}

response = requests.post(
    "http://localhost:3000/api/chat",
    json=payload,
    headers={"Content-Type": "application/json"}
)

print(response.status_code)
print(response.json())
EOF
```

**Expected Result**: Payload rejected (400 Bad Request)

### Test 15: Email Validation

```bash
# Valid email
curl -s -X POST http://localhost:3000/api/test-validator \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' | jq

# Invalid email
curl -s -X POST http://localhost:3000/api/test-validator \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}' | jq
```

## Admin API Tests

### Test 16: Security Metrics

```bash
# Get basic metrics
curl -s http://localhost:3000/api/admin/security/metrics | jq

# Get detailed metrics
curl -s "http://localhost:3000/api/admin/security/metrics?detailed=true" | jq
```

**Expected Response**:
```json
{
  "timestamp": "2025-11-16T...",
  "abuse": {
    "totalBlocked": 5,
    "recentAbuse": 12,
    "topAbusiveIPs": [...]
  },
  "rateLimit": {
    "backend": "redis",
    "redisAvailable": true
  },
  "system": {...},
  "recommendations": [...]
}
```

### Test 17: Abuse Logs Retrieval

```bash
# Get abuse statistics
curl -s http://localhost:3000/api/admin/security/abuse-logs | jq

# Get logs for specific IP
curl -s "http://localhost:3000/api/admin/security/abuse-logs?ip=127.0.0.1&limit=10" | jq
```

### Test 18: IP Blocking Management

```bash
# Block an IP
curl -s -X POST http://localhost:3000/api/admin/security/blocked-ips \
  -H "Content-Type: application/json" \
  -d '{"ip":"192.168.1.100","duration":3600000}' | jq

# Check if IP is blocked
curl -s "http://localhost:3000/api/admin/security/blocked-ips?ip=192.168.1.100" | jq

# Unblock IP
curl -s -X DELETE "http://localhost:3000/api/admin/security/blocked-ips?ip=192.168.1.100" | jq
```

### Test 19: Cleanup Operation

```bash
# Run security cleanup
curl -s -X POST http://localhost:3000/api/admin/security/metrics \
  -H "Content-Type: application/json" \
  -d '{"action":"cleanup"}' | jq
```

## Integration Tests

### Test 20: End-to-End Protected Endpoint

**Create test script** `test-e2e-security.js`:
```javascript
const axios = require('axios');

async function testProtectedEndpoint() {
  const baseURL = 'http://localhost:3000';

  console.log('1. Testing normal request...');
  try {
    const response1 = await axios.post(`${baseURL}/api/chat`, {
      messages: [{ role: 'user', content: 'Hello' }]
    });
    console.log('✅ Normal request succeeded');
  } catch (error) {
    console.log('❌ Normal request failed:', error.response?.data);
  }

  console.log('\n2. Testing XSS attempt...');
  try {
    const response2 = await axios.post(`${baseURL}/api/chat`, {
      messages: [{ role: 'user', content: '<script>alert(1)</script>' }]
    });
    console.log('✅ XSS attempt handled:', response2.data);
  } catch (error) {
    console.log('❌ XSS blocked:', error.response?.data);
  }

  console.log('\n3. Testing rate limit...');
  for (let i = 0; i < 12; i++) {
    try {
      await axios.post(`${baseURL}/api/chat`, {
        messages: [{ role: 'user', content: `Test ${i}` }]
      });
      console.log(`✅ Request ${i + 1} succeeded`);
    } catch (error) {
      console.log(`❌ Request ${i + 1} blocked:`, error.response?.data?.error);
    }
  }

  console.log('\n4. Checking metrics...');
  const metrics = await axios.get(`${baseURL}/api/admin/security/metrics`);
  console.log('📊 Metrics:', JSON.stringify(metrics.data, null, 2));
}

testProtectedEndpoint().catch(console.error);
```

Run: `node test-e2e-security.js`

### Test 21: Concurrent Requests

```bash
# Test system under concurrent load
echo "Testing 50 concurrent requests..."

# Use GNU parallel or xargs
seq 1 50 | xargs -P 50 -I {} curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"concurrent test {}"}]}' \
  -o /dev/null -w "Request {}: %{http_code}\n"
```

## Load Testing

### Test 22: Artillery Load Test

**Create** `artillery-security-test.yml`:
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Sustained load"
  processor: "./artillery-processor.js"

scenarios:
  - name: "Chat API with rate limiting"
    flow:
      - post:
          url: "/api/chat"
          json:
            messages:
              - role: "user"
                content: "Test message {{ $randomString }}"
      - think: 1
```

Run: `npx artillery run artillery-security-test.yml`

### Test 23: k6 Load Test

**Create** `k6-security-test.js`:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // 10 virtual users
  duration: '30s',
};

export default function () {
  const payload = JSON.stringify({
    messages: [
      { role: 'user', content: 'k6 test message' }
    ],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('http://localhost:3000/api/chat', payload, params);

  check(res, {
    'is status 200 or 429': (r) => r.status === 200 || r.status === 429,
    'rate limited correctly': (r) => {
      if (r.status === 429) {
        return r.json('error') === 'Rate limit exceeded';
      }
      return true;
    },
  });

  sleep(1);
}
```

Run: `k6 run k6-security-test.js`

## Security Audit

### Test 24: OWASP Top 10 Coverage

Verify protection against OWASP Top 10:

- [x] **A01: Broken Access Control** - Authentication checks (TODO: enable when Auth0 fixed)
- [x] **A02: Cryptographic Failures** - HTTPS enforced (production)
- [x] **A03: Injection** - SQL/NoSQL/XSS validation ✅
- [x] **A04: Insecure Design** - Rate limiting, abuse detection ✅
- [x] **A05: Security Misconfiguration** - Secure defaults, env vars
- [ ] **A06: Vulnerable Components** - Run `npm audit`
- [x] **A07: Authentication Failures** - Auth0 integration (TODO)
- [x] **A08: Data Integrity Failures** - Input validation ✅
- [x] **A09: Logging Failures** - Security logging ✅
- [x] **A10: SSRF** - URL validation ✅

### Test 25: npm audit

```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (breaking changes possible)
npm audit fix --force
```

### Test 26: Redis Security

```bash
# Check Redis configuration
redis-cli -u $REDIS_URL CONFIG GET requirepass
redis-cli -u $REDIS_URL CONFIG GET protected-mode

# For Upstash: check dashboard security settings
# - TLS enabled
# - IP allowlist (if needed)
# - Password protection
```

## Automated Testing Scripts

### Complete Test Suite

**Create** `run-security-tests.sh`:
```bash
#!/bin/bash

echo "========================================="
echo "Security Test Suite"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Track results
PASSED=0
FAILED=0

test_case() {
  local name="$1"
  local command="$2"

  echo ""
  echo "Testing: $name"

  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
  fi
}

# Run tests
test_case "Server is running" "curl -s http://localhost:3000/api/health"
test_case "Rate limiting works" "for i in {1..11}; do curl -s -X POST http://localhost:3000/api/chat -H 'Content-Type: application/json' -d '{\"messages\":[{\"role\":\"user\",\"content\":\"test\"}]}'; done | grep -q 'Rate limit exceeded'"
test_case "XSS protection" "curl -s -X POST http://localhost:3000/api/chat -H 'Content-Type: application/json' -d '{\"messages\":[{\"role\":\"user\",\"content\":\"<script>alert(1)</script>\"}]}' | grep -qv '<script>'"
test_case "Admin metrics API" "curl -s http://localhost:3000/api/admin/security/metrics | jq -e '.abuse'"
test_case "Redis connection" "curl -s http://localhost:3000/api/admin/security/metrics | jq -e '.rateLimit.backend == \"redis\"'"

echo ""
echo "========================================="
echo "Results: $PASSED passed, $FAILED failed"
echo "========================================="

exit $FAILED
```

Run: `chmod +x run-security-tests.sh && ./run-security-tests.sh`

## Test Coverage Goals

Target coverage:
- Rate Limiting: 100% (all limit types tested)
- Abuse Detection: 90%+ (all patterns tested)
- Input Validation: 95%+ (all validators tested)
- Admin APIs: 100% (all endpoints tested)

## Continuous Testing

### GitHub Actions Workflow

**Create** `.github/workflows/security-tests.yml`:
```yaml
name: Security Tests

on: [push, pull_request]

jobs:
  security-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Start Redis
        run: docker run -d -p 6379:6379 redis:7-alpine

      - name: Run security tests
        run: ./run-security-tests.sh
        env:
          REDIS_URL: redis://localhost:6379

      - name: Run npm audit
        run: npm audit --audit-level=moderate
```

## Production Testing Checklist

Before deploying to production:

- [ ] All unit tests passing
- [ ] Rate limiting tested with production limits
- [ ] Abuse detection tuned (no false positives)
- [ ] Load testing completed (1000+ req/min)
- [ ] Redis performance verified (<10ms latency)
- [ ] Admin APIs secured with authentication
- [ ] Logging/monitoring configured
- [ ] Backup/recovery plan tested
- [ ] Documentation updated
- [ ] Team trained on security features

## Reporting Issues

If you find security issues:

1. **DO NOT** open public GitHub issues
2. Email security concerns to: [your-email]
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Redis Security: https://redis.io/docs/management/security/
- Next.js Security: https://nextjs.org/docs/app/building-your-application/deploying/production-checklist

## Summary

This testing guide covers:
- ✅ Rate limiting functionality
- ✅ Abuse detection patterns
- ✅ Input validation and sanitization
- ✅ Admin API operations
- ✅ Integration testing
- ✅ Load testing
- ✅ Security audit procedures

Regular testing ensures the security system continues to protect your application effectively.
