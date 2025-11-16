# Admin Panel Tests - Quick Start Guide

## Run All Admin Tests
```bash
npm run test:admin
```

## Run Individual Test Suites

### Pages Manager Tests
```bash
npm run test:admin-pages
```
Tests: Page listing, search, edit, delete, create

### Page Builder Tests
```bash
npm run test:admin-builder
```
Tests: Content editing, saving, form validation

### Analytics Dashboard Tests
```bash
npm run test:admin-analytics
```
Tests: Charts, tables, date filtering, summary cards

### FAQs Manager Tests
```bash
npm run test:admin-faqs
```
Tests: FAQ CRUD, category filtering, expand/collapse

## Useful Commands

### Run in UI Mode (Interactive)
```bash
npx playwright test tests/e2e/admin-pages.spec.ts --ui
```

### Run in Debug Mode (Step Through)
```bash
npx playwright test tests/e2e/admin-analytics.spec.ts --debug
```

### Run Specific Test
```bash
npx playwright test tests/e2e/admin-pages.spec.ts -g "should load all pages"
```

### Run on Specific Browser
```bash
# Chrome only
npx playwright test tests/e2e/admin-pages.spec.ts --project=chromium

# Mobile Chrome
npx playwright test tests/e2e/admin-faqs.spec.ts --project='Mobile Chrome'
```

### View Test Report
```bash
npm run test:report
```

## Test Against Production
```bash
TEST_ENV=production PRODUCTION_URL=https://your-app.vercel.app npm run test:admin
```

## Common Test Groups

### Run Only Loading Tests
```bash
npx playwright test tests/e2e/admin-*.spec.ts -g "Loading"
```

### Run Only Responsive Tests
```bash
npx playwright test tests/e2e/admin-*.spec.ts -g "Responsive"
```

### Run Only Accessibility Tests
```bash
npx playwright test tests/e2e/admin-*.spec.ts -g "Accessibility"
```

## Test Statistics
- **Total Tests:** 145+
- **Pages Manager:** 30 tests
- **Page Builder:** 15 active + 20 future tests
- **Analytics:** 42 tests
- **FAQs:** 38 tests

## File Locations
- Test files: `/tests/e2e/admin-*.spec.ts`
- Test utilities: `/tests/helpers/admin-test-utils.ts`
- Documentation: `/tests/e2e/ADMIN_TESTS_README.md`
- Summary: `/ADMIN_TESTS_SUMMARY.md`

## Need Help?
See `/tests/e2e/ADMIN_TESTS_README.md` for complete documentation.
