# Playwright Testing Quick Reference

Fast reference for common testing commands and patterns.

## Quick Commands

```bash
# Run all tests
npm test

# Run specific suite
npm run test:blog
npm run test:security
npm run test:analytics
npm run test:api
npm run test:production

# Run with UI
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug specific test
npm run test:debug -- --grep "test name"

# Mobile only
npm run test:mobile

# Desktop only
npm run test:desktop

# Chrome only
npm run test:chrome

# View report
npm run test:report
```

## Test Environments

```bash
# Local development
npm test

# Vercel preview
VERCEL_PREVIEW_URL=your-preview.vercel.app npm run test:preview

# Production
TEST_ENV=production PRODUCTION_URL=https://yourdomain.com npm test
```

## Common Patterns

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('test name', async ({ page }) => {
  await page.goto('/path');

  const element = page.locator('selector');
  await expect(element).toBeVisible();
});
```

### Using Helpers

```typescript
import { waitForNetworkIdle, fillAndVerify } from '../helpers/test-helpers';

await page.goto('/');
await waitForNetworkIdle(page);

await fillAndVerify(page, 'input[name="email"]', 'test@example.com');
```

### Mobile Testing

```typescript
test.describe('Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile test', async ({ page }) => {
    // Test mobile-specific behavior
  });
});
```

### API Testing

```typescript
test('API test', async ({ request }) => {
  const response = await request.post('/api/endpoint', {
    data: { key: 'value' },
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data).toHaveProperty('result');
});
```

## Useful Selectors

```typescript
// By role (best for accessibility)
page.getByRole('button', { name: /submit/i })
page.getByRole('link', { name: 'Home' })

// By label
page.getByLabel('Email address')

// By placeholder
page.getByPlaceholder('Enter your name')

// By test ID
page.locator('[data-testid="element"]')

// CSS selectors
page.locator('.className')
page.locator('#id')
```

## Assertions

```typescript
// Visibility
await expect(element).toBeVisible()
await expect(element).toBeHidden()

// Text content
await expect(element).toHaveText('Expected text')
await expect(element).toContainText('partial text')

// Attributes
await expect(element).toHaveAttribute('href', '/path')
await expect(element).toHaveClass(/active/)

// Count
await expect(elements).toHaveCount(5)

// Values
await expect(input).toHaveValue('value')

// URL
await expect(page).toHaveURL(/pattern/)
await expect(page).toHaveTitle(/Title/)
```

## Waiting

```typescript
// Wait for element
await page.waitForSelector('selector')
await page.waitForSelector('selector', { state: 'visible' })

// Wait for network
await page.waitForLoadState('networkidle')

// Wait for response
await page.waitForResponse(response => response.url().includes('/api'))

// Wait for timeout (avoid if possible)
await page.waitForTimeout(1000)
```

## Navigation

```typescript
// Basic navigation
await page.goto('/path')

// Wait for navigation
await page.click('a[href="/next"]')
await page.waitForURL('/next')

// Go back
await page.goBack()

// Reload
await page.reload()
```

## Interactions

```typescript
// Click
await page.click('selector')
await page.locator('selector').click()

// Fill input
await page.fill('input', 'value')
await page.locator('input').fill('value')

// Select option
await page.selectOption('select', 'value')

// Check/uncheck
await page.check('input[type="checkbox"]')
await page.uncheck('input[type="checkbox"]')

// Upload file
await page.setInputFiles('input[type="file"]', 'path/to/file')

// Hover
await page.hover('selector')

// Keyboard
await page.keyboard.press('Enter')
await page.keyboard.type('text')
```

## Debugging

```typescript
// Take screenshot
await page.screenshot({ path: 'screenshot.png' })

// Pause execution
await page.pause()

// Console log
console.log(await page.title())

// Get text content
const text = await page.textContent('selector')
console.log(text)
```

## Test Configuration

```typescript
// Set timeout for specific test
test('slow test', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes

  // Test code...
});

// Skip test
test.skip('not implemented', async ({ page }) => {
  // Skipped
});

// Only run this test
test.only('debug this', async ({ page }) => {
  // Only this runs
});

// Conditional skip
test('conditional', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Not supported in Safari');

  // Test code...
});
```

## File Paths Reference

```
tests/
├── e2e/
│   ├── critical-paths.spec.ts       # Essential user journeys
│   ├── blog.spec.ts                 # Blog functionality
│   ├── security.spec.ts             # Security tests
│   ├── analytics.spec.ts            # Analytics & Web Vitals
│   ├── api-functionality.spec.ts    # API endpoint tests
│   ├── production-verification.spec.ts  # Deployment checks
│   ├── tool-functionality.spec.ts   # Tool-specific tests
│   └── rate-limiting.spec.ts        # Rate limit tests
├── helpers/
│   ├── test-helpers.ts              # Utility functions
│   └── test-data.ts                 # Test data factory
├── setup/
│   ├── global-setup.ts              # Pre-test setup
│   └── global-teardown.ts           # Post-test cleanup
└── auth/
    └── storage-state.json           # Saved auth state
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY

# Optional
NEXT_PUBLIC_APP_URL
TEST_ENV
PRODUCTION_URL
VERCEL_PREVIEW_URL
WORKERS
SKIP_AUTH_SETUP
KEEP_ARTIFACTS
```

## Troubleshooting

```bash
# Update Playwright
npm install -D @playwright/test@latest

# Reinstall browsers
npm run test:install

# Clear artifacts
rm -rf test-results playwright-report

# Run in debug mode
npm run test:debug

# Run with verbose output
DEBUG=pw:api npm test

# Check Playwright version
npx playwright --version
```

## CI/CD Quick Setup

```yaml
# GitHub Actions
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 18
- run: npm ci
- run: npx playwright install --with-deps
- run: npm test
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    # Add other secrets...
```

## Performance Tips

```bash
# Run specific project only
npm test -- --project=chromium

# Limit workers
npm test -- --workers=1

# Run serially
npm test -- --workers=1 --retries=0

# Skip slow tests
npm test -- --grep-invert "@slow"
```

## Test Data Examples

```typescript
import { toolTestInputs, csvTestData } from '../helpers/test-data';

// Use predefined test data
const input = toolTestInputs.paraphraser.input;
const csv = csvTestData.sales;
```

---

**Need more help?** Check `tests/README.md` for full documentation.
