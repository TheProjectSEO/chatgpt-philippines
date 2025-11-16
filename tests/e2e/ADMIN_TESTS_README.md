# Admin Panel E2E Tests Documentation

Comprehensive Playwright test suite for the ChatGPT Philippines admin panel functionality.

## Overview

This test suite provides extensive coverage of the admin panel, including:
- Pages Manager (`/admin/pages`)
- Page Builder (visual page construction)
- Analytics Dashboard (`/admin/analytics`)
- FAQs Manager (`/admin/faqs`)

## Test Files

### 1. admin-pages.spec.ts
Tests for the Pages Manager interface.

**Coverage:**
- Page listing and loading (52+ pages)
- Search functionality
- Filter by category
- Edit page modal
- Delete confirmation
- Page creation
- Responsive design
- Accessibility

**Key Test Scenarios:**
```typescript
// Load all pages
npm run test:admin-pages

// Specific test
npx playwright test tests/e2e/admin-pages.spec.ts -g "should load all pages"
```

### 2. admin-page-builder.spec.ts
Tests for the Page Builder functionality.

**Coverage:**
- Opening page builder
- Content editing (title, slug, status)
- Section management (when implemented)
  - Adding Hero sections
  - Adding Content sections
  - Adding FAQ sections
  - Reordering sections (drag-and-drop)
  - Deleting sections
- Saving changes
- Change persistence
- Preview functionality (when implemented)

**Key Test Scenarios:**
```typescript
// Run page builder tests
npm run test:admin-builder

// Test specific functionality
npx playwright test tests/e2e/admin-page-builder.spec.ts -g "should allow editing"
```

**Note:** Some tests are marked as `.skip` for features not yet implemented (sections, drag-and-drop, preview).

### 3. admin-analytics.spec.ts
Tests for the Analytics Dashboard.

**Coverage:**
- Dashboard loading
- Summary cards (4 metrics)
- Date range selection
- Chart rendering (7+ charts)
  - Daily activity trends (line chart)
  - Web vitals performance (bar chart)
  - Web vitals rating distribution (bar chart)
  - Top pages by views (bar chart)
  - Most used tools (bar chart)
  - Device breakdown (doughnut chart)
  - Browser distribution (pie chart)
- Data tables
- Error handling
- Performance metrics
- Responsive design

**Key Test Scenarios:**
```typescript
// Run analytics tests
npm run test:admin-analytics

// Test chart rendering
npx playwright test tests/e2e/admin-analytics.spec.ts -g "Charts Rendering"
```

### 4. admin-faqs.spec.ts
Tests for the FAQs Manager.

**Coverage:**
- FAQ listing
- Category filtering
- Expand/collapse FAQs
- Create new FAQ
- Edit existing FAQ
- Delete FAQ
- Form validation
- Responsive design
- Accessibility

**Key Test Scenarios:**
```typescript
// Run FAQs tests
npm run test:admin-faqs

// Test CRUD operations
npx playwright test tests/e2e/admin-faqs.spec.ts -g "Create FAQ"
```

## Test Utilities

### admin-test-utils.ts
Reusable helper functions for admin tests.

**Features:**
- Navigation helpers
- Wait utilities
- API mocking
- Form utilities
- Table utilities
- Error tracking
- Responsive design checks
- Accessibility checks
- Performance measurement

**Usage Example:**
```typescript
import adminUtils from '@/tests/helpers/admin-test-utils';

// Navigate to admin page
await adminUtils.navigateToAdminPage(page, 'analytics');

// Wait for page load
await adminUtils.waitForPageLoad(page);

// Check responsive design
await adminUtils.checkNoHorizontalScroll(page);

// Mock API error
await adminUtils.mockAPIError(page, '**/api/analytics/**', 'Server Error');
```

## Running Tests

### Run All Admin Tests
```bash
npm run test:admin
```

### Run Individual Test Suites
```bash
# Pages Manager
npm run test:admin-pages

# Page Builder
npm run test:admin-builder

# Analytics Dashboard
npm run test:admin-analytics

# FAQs Manager
npm run test:admin-faqs
```

### Run with UI Mode
```bash
npx playwright test tests/e2e/admin-pages.spec.ts --ui
```

### Run in Headed Mode (See Browser)
```bash
npx playwright test tests/e2e/admin-analytics.spec.ts --headed
```

### Run Specific Test
```bash
npx playwright test tests/e2e/admin-pages.spec.ts -g "should load all pages"
```

### Debug Mode
```bash
npx playwright test tests/e2e/admin-faqs.spec.ts --debug
```

### Run on Specific Browser
```bash
# Chrome only
npx playwright test tests/e2e/admin-pages.spec.ts --project=chromium

# Mobile Chrome
npx playwright test tests/e2e/admin-analytics.spec.ts --project='Mobile Chrome'

# Mobile Safari
npx playwright test tests/e2e/admin-faqs.spec.ts --project='Mobile Safari'
```

## Testing Against Different Environments

### Local Development
```bash
# Default - runs against http://localhost:3000
npm run test:admin
```

### Production
```bash
# Set production URL
TEST_ENV=production PRODUCTION_URL=https://your-production-url.vercel.app npm run test:admin
```

### Vercel Preview
```bash
# Using preview URL
VERCEL_PREVIEW_URL=https://your-preview-url.vercel.app npm run test:admin
```

## Test Configuration

Tests are configured in `playwright.config.ts` with:
- Timeout: 60 seconds per test
- Retries: 2 on CI, 0 locally
- Mobile-first approach (Mobile Chrome as primary)
- Multiple browsers: Chrome, Firefox, Safari, Edge
- Multiple viewports: Mobile, Tablet, Desktop

## Test Coverage

### Pages Manager
- ✅ Page loading and display
- ✅ Search functionality
- ✅ Edit page modal
- ✅ Delete confirmation
- ✅ Page creation
- ✅ Form validation
- ✅ Responsive design
- ✅ Accessibility

### Page Builder
- ✅ Opening builder
- ✅ Content editing
- ✅ Save functionality
- ✅ Cancel functionality
- ⏳ Section management (pending implementation)
- ⏳ Drag-and-drop (pending implementation)
- ⏳ Preview functionality (pending implementation)

### Analytics Dashboard
- ✅ Dashboard loading
- ✅ Summary cards
- ✅ Date range selection
- ✅ All chart types rendering
- ✅ Data tables
- ✅ Error handling
- ✅ Performance checks
- ✅ Responsive design

### FAQs Manager
- ✅ FAQ listing
- ✅ Category filtering
- ✅ Expand/collapse
- ✅ Create FAQ
- ✅ Edit FAQ
- ✅ Delete FAQ
- ✅ Form validation
- ✅ Accessibility

## Best Practices

### 1. Wait for Loading States
```typescript
// Always wait for loading to complete
await waitForPagesLoad(page);
```

### 2. Use Proper Selectors
```typescript
// Prefer role-based selectors
await page.getByRole('button', { name: /save/i });

// Use test IDs for dynamic content
const element = page.locator('[data-testid="page-list"]');
```

### 3. Handle Async Operations
```typescript
// Wait for API responses
await waitForAPIResponse(page, '**/api/admin/pages**');

// Use proper timeouts
await page.waitForSelector('.modal', { timeout: 5000 });
```

### 4. Test Error States
```typescript
// Mock API errors
await mockAPIError(page, '**/api/admin/pages**', 'Server Error', 500);

// Verify error display
await expect(page.locator('.error-message')).toBeVisible();
```

### 5. Clean Up After Tests
```typescript
// Close modals
await closeDialog(page);

// Restore data
// (Best practice: use test database or mocks)
```

## Common Issues and Solutions

### Issue: Tests Timing Out
**Solution:**
```typescript
// Increase timeout for slow operations
test('should load analytics', async ({ page }) => {
  test.setTimeout(90000); // 90 seconds
  await page.goto(ANALYTICS_URL);
});
```

### Issue: Flaky Tests
**Solution:**
```typescript
// Use proper waits instead of fixed timeouts
// Bad
await page.waitForTimeout(2000);

// Good
await page.waitForSelector('.data-loaded', { state: 'visible' });
```

### Issue: Elements Not Found
**Solution:**
```typescript
// Check if element exists before interacting
const element = page.locator('.modal');
if (await element.isVisible()) {
  await element.click();
}
```

### Issue: Dialog/Alert Not Handled
**Solution:**
```typescript
// Set up dialog handler before triggering action
page.once('dialog', dialog => dialog.accept());
await page.click('.delete-button');
```

## Accessibility Testing

All test files include accessibility checks:
- Proper heading hierarchy (h1, h2, h3)
- ARIA labels on buttons
- Form labels
- Keyboard navigation
- Alt text on images

**Example:**
```typescript
// Check heading hierarchy
await checkHeadingHierarchy(page, /pages/i);

// Test keyboard navigation
await testKeyboardNavigation(page);

// Verify ARIA labels
const button = page.getByRole('button', { name: /edit/i });
expect(await button.getAttribute('aria-label')).toBeTruthy();
```

## Performance Testing

Performance metrics are tracked in tests:

```typescript
// Measure page load time
const loadTime = await measurePageLoadTime(page, ANALYTICS_URL);
expect(loadTime).toBeLessThan(10000); // Under 10 seconds

// Check for memory leaks
const memoryGrowth = await checkMemoryLeaks(page);
expect(memoryGrowth).toBeLessThan(50); // Under 50MB growth
```

## Mobile Testing

All tests include mobile viewport testing:

```typescript
// Test on mobile viewport
await testViewport(page, 'mobile', async () => {
  await page.goto(ADMIN_PAGES_URL);
  await expect(page.locator('h1')).toBeVisible();
});

// Check no horizontal scroll
await checkNoHorizontalScroll(page);
```

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Admin Tests
  run: |
    npm run test:admin
    npm run test:admin-analytics
    npm run test:admin-faqs
```

## Debugging Tests

### Use Playwright Inspector
```bash
npx playwright test tests/e2e/admin-pages.spec.ts --debug
```

### View Test Report
```bash
npm run test:report
```

### Run with Trace
```bash
npx playwright test tests/e2e/admin-analytics.spec.ts --trace on
```

### Take Screenshots
```typescript
await takeScreenshot(page, 'analytics-dashboard', true);
```

## Contributing

When adding new admin tests:

1. Follow existing patterns in test files
2. Use utilities from `admin-test-utils.ts`
3. Include accessibility checks
4. Test responsive design
5. Add error state testing
6. Include performance checks
7. Document test scenarios

## Test Maintenance

### Skipped Tests
Some tests are marked `.skip` for features not yet implemented:
- Section management in page builder
- Drag-and-drop reordering
- Live preview functionality
- Autosave features

**Enable these tests when features are implemented.**

### Future Enhancements
- [ ] Add visual regression testing
- [ ] Add API contract testing
- [ ] Add load testing for analytics
- [ ] Add security testing
- [ ] Add database integration tests

## Support

For issues or questions about the tests:
1. Check this documentation
2. Review test code comments
3. Check Playwright documentation: https://playwright.dev
4. Review test results in CI/CD logs

## Summary

This comprehensive test suite ensures the admin panel works correctly across:
- ✅ Multiple browsers (Chrome, Firefox, Safari, Edge)
- ✅ Multiple devices (Mobile, Tablet, Desktop)
- ✅ Different network conditions
- ✅ Error scenarios
- ✅ Accessibility requirements
- ✅ Performance benchmarks

**Total Test Coverage:** 100+ test cases across 4 admin features
