# Security Deployment Checklist

Use this checklist to ensure proper security implementation before deploying to production.

---

## Pre-Deployment Checklist

### Phase 1: Environment Setup (5 minutes)

- [ ] **Redis Setup**
  - [ ] Choose Redis provider (Upstash recommended)
  - [ ] Create Redis database
  - [ ] Copy connection URL
  - [ ] Add `REDIS_URL` to environment variables
  - [ ] Test Redis connection (`redis-cli ping`)

- [ ] **Environment Variables**
  - [ ] Copy `.env.security.example` values to `.env.local`
  - [ ] Verify all required variables are set
  - [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is NOT public
  - [ ] Rotate any exposed API keys
  - [ ] Different keys for dev/staging/production

- [ ] **Dependencies**
  - [ ] Run `npm install` (Redis already in package.json)
  - [ ] Run `npm audit` and fix vulnerabilities
  - [ ] Update outdated packages (`npm update`)

---

### Phase 2: Testing (15 minutes)

- [ ] **Basic Functionality**
  - [ ] Start dev server (`npm run dev`)
  - [ ] Test existing endpoints still work
  - [ ] Verify chat functionality works
  - [ ] Check no console errors

- [ ] **Rate Limiting Tests**
  ```bash
  # Test: Send 11 requests quickly
  for i in {1..11}; do
    curl http://localhost:3000/api/chat \
      -X POST \
      -H "Content-Type: application/json" \
      -d '{"messages":[{"role":"user","content":"test"}]}'
  done
  # Expected: 11th request returns 429 error
  ```
  - [ ] 11th request is blocked with 429 status
  - [ ] Error message includes retry-after header
  - [ ] Rate limit resets after time window

- [ ] **XSS Protection Tests**
  ```bash
  # Test: XSS attempt
  curl http://localhost:3000/api/chat \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"<script>alert(1)</script>"}]}'
  # Expected: Script tags removed or sanitized
  ```
  - [ ] Script tags are sanitized
  - [ ] Response doesn't contain executable scripts
  - [ ] Request is logged as suspicious

- [ ] **Injection Protection Tests**
  ```bash
  # Test: SQL injection attempt
  curl http://localhost:3000/api/research-paper \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"topic":"test OR 1=1"}'
  # Expected: Detected and blocked or sanitized
  ```
  - [ ] SQL patterns are detected
  - [ ] Request is blocked or sanitized
  - [ ] Abuse score increases

---

### Phase 3: Monitoring Setup (10 minutes)

- [ ] **Security Dashboard**
  ```bash
  curl http://localhost:3000/api/admin/security-dashboard?details=true | jq
  ```
  - [ ] Dashboard returns valid JSON
  - [ ] Metrics are accurate
  - [ ] API key health shown
  - [ ] No errors in response

- [ ] **Abuse Logs**
  ```bash
  curl http://localhost:3000/api/admin/abuse-logs | jq
  ```
  - [ ] Logs endpoint accessible
  - [ ] Previous abuse attempts logged
  - [ ] IP filtering works (`?ip=<address>`)

---

### Phase 4: Production Deployment

- [ ] **Vercel Environment Variables**
  - [ ] Add `REDIS_URL` to Vercel
  - [ ] Verify all other env vars are set
  - [ ] Use production Redis instance
  - [ ] Enable "Encrypted" for sensitive variables

- [ ] **Security Headers**
  - [ ] Verify `middleware.ts` is deployed
  - [ ] Check headers in production response

- [ ] **Performance Tests**
  ```bash
  # Test response times
  time curl https://your-domain.com/api/chat \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"test"}]}'
  ```
  - [ ] Response time < 2 seconds
  - [ ] No timeout errors
  - [ ] Redis latency acceptable

---

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor error rates every 2 hours
- [ ] Check abuse detection logs
- [ ] Verify rate limits working
- [ ] Monitor Redis performance
- [ ] Check API costs

### First Week
- [ ] Daily review of security dashboard
- [ ] Weekly review of abuse patterns
- [ ] Adjust rate limits if needed
- [ ] Fine-tune abuse detection
- [ ] Export logs for analysis

---

**Total Deployment Time**: 1.5 - 2.5 hours

*Last Updated: 2025-11-16*
