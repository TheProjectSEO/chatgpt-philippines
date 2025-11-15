# Testing Setup Guide for ChatGPT Philippines

## Overview
This guide will help you set up the complete testing infrastructure for the 7-day launch preparation.

---

## Quick Start (5 Minutes)

### Install Testing Dependencies

```bash
cd /Users/adityaaman/Desktop/ChatGPTPH

# Install Playwright for E2E testing
npm install -D @playwright/test

# Install Playwright browsers
npx playwright install

# Verify installation
npx playwright --version
```

### Run Your First Test

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:critical

# Run with visible browser (headed mode)
npm run test:headed

# Run interactive UI mode
npm run test:ui
```

---

## Complete Testing Stack

### 1. End-to-End Testing (Playwright)

**What it tests**: Complete user journeys across all browsers

**Installation**:
```bash
npm install -D @playwright/test
npx playwright install
```

**Available Test Suites**:
```bash
# Critical paths (authentication, core tools, navigation)
npm run test:critical

# All tool functionality
npm run test:tools

# Rate limiting and security
npm run test:ratelimit

# All tests
npm test

# Interactive mode (recommended for debugging)
npm run test:ui
```

**Configuration**: `playwright.config.ts`
- Tests run on Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- Screenshots and videos on failure
- Automatic retry on failure (in CI)

### 2. Manual Testing

**Manual Test Spreadsheet**: Create a Google Sheet or Excel file with these columns:
- Test ID
- Category
- Test Case
- Steps
- Expected Result
- Actual Result
- Status (Pass/Fail/Blocked)
- Tester
- Date
- Notes

**Import from**: TESTING_CHECKLIST.md (200+ test cases)

### 3. Performance Testing (Lighthouse)

**Installation**: Built into Chrome DevTools

**Command Line**:
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Test home page
lighthouse https://yourdomain.com --view

# Test specific page
lighthouse https://yourdomain.com/paraphraser --view

# Export report
lighthouse https://yourdomain.com --output=html --output-path=./lighthouse-report.html
```

**Automated CI Testing**:
```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse CI
lhci autorun
```

### 4. Load Testing (k6)

**Installation**:
```bash
# macOS
brew install k6

# Or download from https://k6.io/docs/getting-started/installation/
```

**Create Basic Load Test**:
```javascript
// load-testing/basic-load-test.js
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
};

export default function () {
  const res = http.get('https://yourdomain.com');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

**Run Load Test**:
```bash
k6 run load-testing/basic-load-test.js
```

### 5. API Testing (Postman/Insomnia)

**Postman Collection** (create this):
```json
{
  "info": {
    "name": "ChatGPT Philippines API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Check Rate Limit",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/rate-limit"
      }
    },
    {
      "name": "Paraphrase (Guest)",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/paraphrase",
        "body": {
          "mode": "raw",
          "raw": "{\"text\": \"Test sentence\"}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "https://yourdomain.com"
    }
  ]
}
```

**Alternative**: Use Insomnia or Bruno for API testing

---

## Testing Schedule (7 Days)

### Day 1: Setup & Critical Tests
```bash
# Morning: Setup
npm install -D @playwright/test
npx playwright install
npm run test:install

# Afternoon: Run critical tests
npm run test:critical

# Document failures
# Fix critical bugs
```

### Day 2: Tool Testing
```bash
# Test all 52 tools
npm run test:tools

# Manual testing for tools that fail automated tests
# Use manual testing spreadsheet
```

### Day 3: Integration & Security
```bash
# Run rate limiting tests
npm run test:ratelimit

# Manual security testing (see TESTING_CHECKLIST.md)
# API integration testing
```

### Day 4: Performance & Load Testing
```bash
# Lighthouse audit
lighthouse https://yourdomain.com --view

# Load testing
k6 run load-testing/basic-load-test.js

# Database performance testing
```

### Day 5: UAT & Cross-Browser
```bash
# Run all Playwright tests on all browsers
npm test

# User acceptance testing with beta users
# Mobile device testing
```

### Day 6: Final Testing
```bash
# Smoke tests on staging/production
npm run test:critical

# Final manual checklist review
# Final Lighthouse audit
```

### Day 7: Launch Day Testing
```bash
# Post-deployment smoke tests
npm run test:critical

# Monitor error dashboards
# Quick manual testing
```

---

## Creating Custom Tests

### Example: Test a New Tool

```typescript
// tests/e2e/my-new-tool.spec.ts
import { test, expect } from '@playwright/test';

test('new tool works correctly', async ({ page }) => {
  await page.goto('https://yourdomain.com/my-new-tool');

  // Fill input
  await page.fill('textarea', 'Test input');

  // Click submit
  await page.click('button:has-text("Generate")');

  // Wait for result
  await page.waitForSelector('[data-testid="output"]');

  // Verify result exists
  const output = await page.textContent('[data-testid="output"]');
  expect(output).toBeTruthy();
});
```

### Run Your Custom Test

```bash
npx playwright test tests/e2e/my-new-tool.spec.ts
```

---

## Continuous Integration Setup

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run tests
        run: npm test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Manual Testing Templates

### Tool Testing Spreadsheet Template

| Tool Name | Category | Input Used | Output Expected | Output Received | Status | Error Details | Tester | Date |
|-----------|----------|------------|-----------------|-----------------|--------|---------------|--------|------|
| Paraphraser | Writing | "The quick brown fox..." | Paraphrased text | [Actual output] | Pass/Fail | | John | 11/17 |
| Essay Writer | Academic | "AI in Education" | Essay structure | [Actual output] | Pass/Fail | | Jane | 11/17 |

### Authentication Testing Checklist

```
[ ] Sign up with valid email
[ ] Sign up with invalid email (should fail)
[ ] Sign up with duplicate email (should fail)
[ ] Login with valid credentials
[ ] Login with invalid password (should fail)
[ ] Logout clears session
[ ] Password reset sends email
[ ] Password reset link works
[ ] Session persists after page refresh
[ ] Session expires after timeout
```

### Performance Testing Template

| Page | Load Time | LCP | FID | CLS | Score | Status | Notes |
|------|-----------|-----|-----|-----|-------|--------|-------|
| Home | 1.2s | 1.1s | 50ms | 0.05 | 95 | Pass | |
| Paraphraser | 1.5s | 1.3s | 60ms | 0.08 | 92 | Pass | |

---

## Debugging Failed Tests

### Playwright Debugging

```bash
# Run with headed browser (see what's happening)
npm run test:headed

# Run specific test with debugging
npx playwright test tests/e2e/critical-paths.spec.ts --debug

# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### View Test Reports

```bash
# After running tests, view HTML report
npm run test:report

# Or manually
npx playwright show-report
```

### Common Issues

**Issue**: Tests fail on CI but pass locally
- **Solution**: Ensure same Node version, check environment variables

**Issue**: Timeouts on slow operations
- **Solution**: Increase timeout in test:
  ```typescript
  test('slow operation', async ({ page }) => {
    await page.goto('/slow-page', { timeout: 60000 });
  });
  ```

**Issue**: Flaky tests (sometimes pass, sometimes fail)
- **Solution**: Add proper waits:
  ```typescript
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-testid="result"]');
  ```

---

## Test Data Management

### Environment Variables for Testing

Create `.env.test`:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
ANTHROPIC_API_KEY=sk-test-...
```

Load in tests:
```typescript
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
```

### Test Fixtures

Create reusable test data:
```typescript
// tests/fixtures/test-data.ts
export const testArticles = {
  short: "This is a short article.",
  medium: "This is a medium length article...",
  long: "This is a very long article..."
};

export const testUsers = {
  valid: {
    email: "test@example.com",
    password: "ValidPass123!"
  },
  invalid: {
    email: "not-an-email",
    password: "weak"
  }
};
```

---

## Accessibility Testing

### axe DevTools

```bash
# Install axe-playwright
npm install -D @axe-core/playwright

# Use in tests
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('should not have accessibility violations', async ({ page }) => {
  await page.goto('https://yourdomain.com');
  await injectAxe(page);
  await checkA11y(page);
});
```

### Manual Accessibility Testing

1. Test keyboard navigation (Tab, Enter, Escape)
2. Test with screen reader (NVDA, JAWS, VoiceOver)
3. Check color contrast (use browser DevTools)
4. Verify all images have alt text
5. Check form labels are associated with inputs

---

## Security Testing

### OWASP ZAP

```bash
# Install OWASP ZAP
# Download from https://www.zaproxy.org/download/

# Run automated scan
zap-cli quick-scan https://yourdomain.com

# Run full scan (takes longer)
zap-cli active-scan https://yourdomain.com
```

### Manual Security Checks

```
[ ] SQL injection attempts blocked
[ ] XSS attempts blocked
[ ] CSRF protection enabled
[ ] API keys not exposed in client code
[ ] Rate limiting cannot be bypassed
[ ] Authentication cannot be bypassed
[ ] Sensitive data encrypted in transit
[ ] Security headers configured
```

---

## Test Metrics & Reporting

### Key Metrics to Track

- Total tests: [number]
- Tests passing: [number]
- Tests failing: [number]
- Test coverage: [percentage]
- Average test runtime: [time]
- Flaky tests: [number]

### Daily Test Report Template

```markdown
# Test Report - [Date]

## Summary
- Total Tests: 150
- Passed: 145 (97%)
- Failed: 5 (3%)
- Skipped: 0

## Failed Tests
1. Test Name - Reason for failure
2. Test Name - Reason for failure

## Issues Found
- P0 Bugs: 0
- P1 Bugs: 2
- P2 Bugs: 3

## Next Steps
- Fix failing tests by EOD
- Add tests for new feature
- Investigate flaky test in authentication
```

---

## Tools & Resources

### Essential Tools
- **Playwright**: E2E testing (installed)
- **Lighthouse**: Performance testing (Chrome DevTools)
- **k6**: Load testing (install via brew)
- **Postman/Insomnia**: API testing (download)
- **OWASP ZAP**: Security testing (download)

### Browser Testing
- **BrowserStack**: Cross-browser testing (paid)
- **LambdaTest**: Cross-browser testing (paid)
- **Local Devices**: Use actual phones/tablets

### Monitoring Tools (Post-Launch)
- **Sentry**: Error monitoring
- **UptimeRobot**: Uptime monitoring
- **Google Analytics**: User analytics
- **Vercel Analytics**: Performance monitoring

---

## Cheat Sheet

### Quick Commands
```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/e2e/critical-paths.spec.ts

# Run tests in headed mode
npm run test:headed

# Run with UI (interactive)
npm run test:ui

# Run only critical tests
npm run test:critical

# View test report
npm run test:report

# Debug specific test
npx playwright test tests/e2e/critical-paths.spec.ts --debug

# Performance test with Lighthouse
lighthouse https://yourdomain.com --view

# Load test with k6
k6 run load-testing/basic-load-test.js
```

### Useful Playwright Commands
```typescript
// Navigation
await page.goto('https://example.com');

// Locators
await page.locator('button').click();
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByText('Welcome').isVisible();

// Waiting
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="result"]');
await page.waitForTimeout(1000);

// Assertions
await expect(page).toHaveTitle('Page Title');
await expect(element).toBeVisible();
await expect(element).toContainText('Expected text');

// Interactions
await page.fill('input[name="email"]', 'test@example.com');
await page.click('button[type="submit"]');
await page.selectOption('select', 'option-value');
```

---

## Getting Help

### Documentation
- Playwright Docs: https://playwright.dev
- Lighthouse Docs: https://developer.chrome.com/docs/lighthouse
- k6 Docs: https://k6.io/docs/

### Common Questions

**Q: How long should tests take to run?**
A: E2E tests: 5-15 minutes for full suite. Critical tests: 2-3 minutes.

**Q: Should I test on real devices?**
A: Yes, test on at least one real iPhone and one real Android device.

**Q: How often should I run tests?**
A: During development: Before each commit. Pre-launch: Multiple times daily.

**Q: What if a test is flaky?**
A: Add proper waits, check for race conditions, or mark as `test.skip()` and file a bug.

---

## Success Criteria

### Before Launch
- [ ] All P0 tests passing
- [ ] >95% of P1 tests passing
- [ ] No critical security vulnerabilities
- [ ] Lighthouse score >90 on home page
- [ ] All 52 tools manually verified
- [ ] Load test successful at 100 concurrent users
- [ ] Cross-browser tests passing
- [ ] Mobile tests passing

### Post-Launch (Week 1)
- [ ] E2E tests run daily
- [ ] No test regressions
- [ ] Performance tests show stable metrics
- [ ] Manual testing of new features before deploy

---

**Remember**: Testing is not just about finding bugs, it's about having confidence that your platform works for users. Better to catch issues in testing than in production!
