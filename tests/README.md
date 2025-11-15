# Playwright E2E Testing Guide

Comprehensive end-to-end testing suite for ChatGPT Philippines using Playwright.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Test Suites](#test-suites)
- [Running Tests](#running-tests)
- [Environment Configuration](#environment-configuration)
- [CI/CD Integration](#cicd-integration)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

This testing infrastructure provides comprehensive coverage for:

- **Critical User Paths**: Homepage, authentication, core tools
- **Blog System**: Post rendering, TOC, FAQs, responsive design
- **Security**: Rate limiting, XSS prevention, input validation
- **Analytics**: Web Vitals, performance tracking, event monitoring
- **API Functionality**: All tool endpoints, data processing, error handling
- **Production Verification**: Deployment validation, health checks

### Test Architecture

```
tests/
├── e2e/                          # End-to-end test suites
│   ├── critical-paths.spec.ts    # Critical user journeys
│   ├── blog.spec.ts              # Blog functionality
│   ├── security.spec.ts          # Security features
│   ├── analytics.spec.ts         # Analytics & Web Vitals
│   ├── api-functionality.spec.ts # API endpoints
│   ├── production-verification.spec.ts # Deployment checks
│   ├── tool-functionality.spec.ts # Tool-specific tests
│   └── rate-limiting.spec.ts     # Rate limit enforcement
├── helpers/                       # Test utilities
│   ├── test-helpers.ts           # Reusable functions
│   └── test-data.ts              # Test data factory
├── setup/                         # Global setup/teardown
│   ├── global-setup.ts           # Pre-test initialization
│   └── global-teardown.ts        # Post-test cleanup
└── auth/                          # Authentication state
    └── storage-state.json        # Saved auth tokens
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

```bash
npm run test:install
```

This installs Chromium, Firefox, and WebKit browsers.

### 3. Verify Installation

```bash
npm run test:critical -- --project=chromium
```

## Test Suites

### Critical Paths (`critical-paths.spec.ts`)

Tests essential user journeys that must work:

- Homepage loading
- Authentication flow
- Guest user tool access
- Core tool functionality
- Mobile responsiveness
- Error handling

**Run:**
```bash
npm run test:critical
```

### Blog System (`blog.spec.ts`)

Tests blog post features:

- Post rendering and metadata
- Table of contents navigation
- FAQ expansion/collapse
- Reading progress bar
- SEO and schema markup
- Accessibility

**Run:**
```bash
npm run test:blog
```

### Security (`security.spec.ts`)

Tests security measures:

- Rate limiting enforcement
- XSS prevention
- SQL injection protection
- Input validation
- API security
- Session management

**Run:**
```bash
npm run test:security
```

### Analytics (`analytics.spec.ts`)

Tests analytics and performance:

- Web Vitals (LCP, FCP, CLS, TTFB)
- Page view tracking
- Event tracking
- Performance metrics
- Error tracking

**Run:**
```bash
npm run test:analytics
```

### API Functionality (`api-functionality.spec.ts`)

Tests API endpoints:

- Tool APIs (paraphrase, grammar check, translate, etc.)
- Data Viz Agent with CSV processing
- Chat API
- Rate limiting integration
- Error handling

**Run:**
```bash
npm run test:api
```

### Production Verification (`production-verification.spec.ts`)

Critical checks for deployments:

- All pages load successfully
- API endpoints respond
- Database connectivity
- PWA functionality
- Performance benchmarks
- SEO verification

**Run:**
```bash
npm run test:production
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run specific suite
npm run test:blog
npm run test:security
npm run test:analytics

# Run with UI mode (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Run in debug mode
npm run test:debug
```

### Device-Specific Testing

```bash
# Mobile only (Pixel 5, iPhone 12)
npm run test:mobile

# Desktop only (Chrome, Firefox, Safari)
npm run test:desktop

# Chrome only
npm run test:chrome
```

### Environment-Specific Testing

#### Local Development

```bash
# Uses http://localhost:3000
npm test
```

#### Vercel Preview Deployment

```bash
# Test against preview URL
VERCEL_PREVIEW_URL=your-preview.vercel.app npm run test:preview
```

#### Production

```bash
# Test against production
TEST_ENV=production PRODUCTION_URL=https://yourdomain.com npm run test:production
```

### Filtering Tests

```bash
# Run tests matching pattern
npm test -- --grep "blog"

# Run specific file
npm test tests/e2e/security.spec.ts

# Run specific test
npm test -- --grep "should enforce rate limits"
```

### View Test Reports

```bash
# Open HTML report
npm run test:report
```

## Environment Configuration

### Required Environment Variables

Create `.env.local`:

```bash
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic AI
ANTHROPIC_API_KEY=your-api-key

# Auth0
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=your-auth0-issuer
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

### Test-Specific Variables

```bash
# Set base URL
NEXT_PUBLIC_APP_URL=https://staging.example.com

# Testing production
TEST_ENV=production

# Testing Vercel preview
VERCEL_PREVIEW_URL=preview-abc123.vercel.app

# Custom production URL
PRODUCTION_URL=https://yourdomain.com

# Parallel workers
WORKERS=4

# Skip auth setup
SKIP_AUTH_SETUP=true

# Keep test artifacts
KEEP_ARTIFACTS=true
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm test
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Vercel Integration

Add to Vercel deployment checks:

```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "installCommand": "npm ci && npx playwright install --with-deps",
  "checks": [
    {
      "name": "E2E Tests",
      "path": "npm run test:production"
    }
  ]
}
```

Or add as a GitHub Action triggered by Vercel:

```yaml
name: Test Vercel Preview

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  test-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Wait for Vercel Preview
        uses: patrickedqvist/wait-for-vercel-preview@v1.3.1
        id: wait-for-vercel
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          max_timeout: 300

      - name: Run tests against preview
        run: |
          VERCEL_PREVIEW_URL=${{ steps.wait-for-vercel.outputs.url }} \
          npm run test:preview
```

## Writing Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { waitForNetworkIdle } from '../helpers/test-helpers';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Navigate
    await page.goto('/page-path');
    await waitForNetworkIdle(page);

    // Act
    const button = page.getByRole('button', { name: /submit/i });
    await button.click();

    // Assert
    const result = page.locator('[data-testid="result"]');
    await expect(result).toBeVisible();
    await expect(result).toContainText('Success');
  });
});
```

### Using Test Helpers

```typescript
import {
  waitForNetworkIdle,
  fillAndVerify,
  waitAndClick,
  checkAccessibility,
  measurePageLoad,
} from '../helpers/test-helpers';

test('example with helpers', async ({ page }) => {
  await page.goto('/form');

  // Fill and verify input
  await fillAndVerify(page, 'input[name="email"]', 'test@example.com');

  // Wait and click safely
  await waitAndClick(page, 'button[type="submit"]');

  // Check accessibility
  await checkAccessibility(page);

  // Measure performance
  const metrics = await measurePageLoad(page);
  expect(metrics.totalTime).toBeLessThan(3000);
});
```

### Using Test Data

```typescript
import {
  toolTestInputs,
  csvTestData,
  securityPayloads,
  apiEndpoints,
} from '../helpers/test-data';

test('paraphraser test', async ({ request }) => {
  const response = await request.post(apiEndpoints.paraphrase, {
    data: {
      text: toolTestInputs.paraphraser.input,
    },
  });

  expect(response.ok()).toBeTruthy();
});
```

## Best Practices

### 1. Mobile-First Testing

Always test mobile viewports first:

```typescript
test.describe('Mobile Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile specific test', async ({ page }) => {
    // Test mobile-specific behavior
  });
});
```

### 2. Proper Waiting

```typescript
// ✅ Good - wait for specific condition
await page.waitForSelector('[data-testid="result"]', { state: 'visible' });

// ✅ Good - wait for network idle
await waitForNetworkIdle(page);

// ❌ Bad - arbitrary timeout
await page.waitForTimeout(5000);
```

### 3. Accessibility

```typescript
// Use semantic selectors
await page.getByRole('button', { name: /submit/i });
await page.getByLabel('Email address');
await page.getByPlaceholder('Enter your name');

// Check accessibility
await checkAccessibility(page);
```

### 4. Error Handling

```typescript
test('handles errors gracefully', async ({ page }) => {
  const errors: string[] = [];

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  await page.goto('/');

  // Assert no errors
  expect(errors).toHaveLength(0);
});
```

### 5. Test Isolation

```typescript
test.beforeEach(async ({ page }) => {
  // Clear storage before each test
  await clearAllStorage(page);
});
```

## Troubleshooting

### Tests Fail Locally

```bash
# Update Playwright
npm install -D @playwright/test@latest

# Reinstall browsers
npm run test:install

# Clear test artifacts
rm -rf test-results playwright-report

# Run in headed mode to see what's happening
npm run test:headed
```

### Rate Limiting Issues

```bash
# Tests hitting rate limits - run serially
npm test -- --workers=1

# Or increase wait times between tests
test.setTimeout(120000); // 2 minutes
```

### Flaky Tests

```bash
# Run specific test multiple times
npm test -- --grep "flaky test name" --repeat-each=5

# Enable retries
# Already configured in playwright.config.ts
```

### CI Failures

```bash
# Check CI environment variables
# View CI logs for missing env vars

# Run with CI flag locally
CI=true npm test

# Check timeout settings
# CI tests have longer timeouts configured
```

### Debug Specific Test

```bash
# Run in debug mode
npm run test:debug -- --grep "specific test"

# Or use VSCode debugger
# Set breakpoint and run "Debug Playwright Test"
```

## Performance Guidelines

### Test Execution Time

- **Unit Tests**: < 100ms each
- **Integration Tests**: < 5s each
- **E2E Tests**: < 30s each
- **Full Suite**: < 10 minutes

### Resource Usage

- **Workers**: 1-4 (based on CPU cores)
- **Retries**: 2 on CI, 0 locally
- **Timeout**: 60s per test

### Optimization Tips

```bash
# Run only changed tests
npm test -- --only-changed

# Run specific projects
npm run test:chrome

# Disable videos for faster runs
npm test -- --config playwright.config.ts
# Then set video: 'off' in config
```

## Contributing

When adding new tests:

1. Follow existing patterns in test suites
2. Use helper functions from `test-helpers.ts`
3. Add test data to `test-data.ts`
4. Ensure mobile-first approach
5. Add proper documentation
6. Run full suite before committing

## Support

For issues or questions:

1. Check this README
2. Review existing test files
3. Check Playwright documentation: https://playwright.dev
4. Open an issue with test logs and screenshots

---

Last Updated: 2025-11-16
