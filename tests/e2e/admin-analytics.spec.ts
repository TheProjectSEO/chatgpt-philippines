/**
 * Admin Analytics Dashboard E2E Test Suite
 *
 * Tests for /admin/analytics functionality including:
 * - Dashboard loading
 * - Summary cards display
 * - Chart rendering (all chart types)
 * - Date range selection
 * - Data tables
 * - Error handling
 * - Responsive design
 *
 * Run: npx playwright test tests/e2e/admin-analytics.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const ANALYTICS_URL = `${BASE_URL}/admin/analytics`;

/**
 * Helper function to wait for analytics to load
 */
async function waitForAnalyticsLoad(page: Page) {
  // Wait for loading spinner to disappear
  await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 15000 }).catch(() => {});

  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to check if charts library loaded
 */
async function isChartJSLoaded(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return typeof (window as any).Chart !== 'undefined';
  });
}

test.describe('Analytics Dashboard - Page Loading', () => {
  test('should load analytics dashboard successfully', async ({ page }) => {
    await page.goto(ANALYTICS_URL);

    // Should show title
    await expect(page.locator('h1')).toContainText(/analytics dashboard/i);
  });

  test('should display loading state initially', async ({ page }) => {
    await page.goto(ANALYTICS_URL);

    // Check if loading spinner appears (might be very fast)
    const loadingSpinner = page.locator('.animate-spin');
    const isLoading = await loadingSpinner.isVisible().catch(() => false);

    // Either shows loading or loads so fast we miss it
    if (isLoading) {
      await expect(loadingSpinner).toBeVisible();
      await expect(page.getByText(/loading analytics/i)).toBeVisible();
    }
  });

  test('should load completely without errors', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Should not show error message
    const errorMessage = page.locator('.bg-red-50, [role="alert"]').filter({ hasText: /error/i });
    await expect(errorMessage).not.toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API and return error
    await page.route('**/api/analytics/dashboard**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto(ANALYTICS_URL);
    await page.waitForLoadState('networkidle');

    // Should show error state
    const errorMessage = page.locator('.bg-red-50');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/error|failed/i);
  });

  test('should load with default date range', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Should have date inputs with values
    const startDateInput = page.locator('input[type="date"]').first();
    const endDateInput = page.locator('input[type="date"]').last();

    const startDate = await startDateInput.inputValue();
    const endDate = await endDateInput.inputValue();

    expect(startDate).toBeTruthy();
    expect(endDate).toBeTruthy();
  });
});

test.describe('Analytics Dashboard - Summary Cards', () => {
  test('should display all four summary cards', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Check for summary cards
    await expect(page.getByText(/total page views/i)).toBeVisible();
    await expect(page.getByText(/unique visitors/i)).toBeVisible();
    await expect(page.getByText(/tool usage/i)).toBeVisible();
    await expect(page.getByText(/total events/i)).toBeVisible();
  });

  test('should display numeric values in summary cards', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Get all summary card values (they have text-3xl class)
    const values = page.locator('.text-3xl.font-bold');
    const count = await values.count();

    // Should have 4 summary cards
    expect(count).toBeGreaterThanOrEqual(4);

    // Each should have a value
    for (let i = 0; i < Math.min(count, 4); i++) {
      const text = await values.nth(i).textContent();
      expect(text).toBeTruthy();
      expect(text!.trim().length).toBeGreaterThan(0);
    }
  });

  test('should show formatted numbers in summary cards', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Get page views value
    const pageViewsCard = page.locator('.text-3xl.font-bold').first();
    const value = await pageViewsCard.textContent();

    // Should be a number (with possible comma separators)
    expect(value).toMatch(/^[\d,]+$/);
  });

  test('should display icons in summary cards', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Summary cards have emoji icons
    const emojiIcons = page.locator('.text-3xl').filter({ hasText: /[👁️👥🛠️⚡]/ });
    const count = await emojiIcons.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should have colored gradient backgrounds', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Cards should have gradient backgrounds
    const gradientCards = page.locator('.bg-gradient-to-br');
    const count = await gradientCards.count();

    expect(count).toBeGreaterThanOrEqual(4);
  });
});

test.describe('Analytics Dashboard - Date Range Selector', () => {
  test('should have date range inputs', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Should have start date input
    const startDateLabel = page.getByText(/from:/i);
    await expect(startDateLabel).toBeVisible();

    // Should have end date input
    const endDateLabel = page.getByText(/to:/i);
    await expect(endDateLabel).toBeVisible();

    // Both inputs should be visible
    const dateInputs = page.locator('input[type="date"]');
    const count = await dateInputs.count();
    expect(count).toBe(2);
  });

  test('should allow changing start date', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    const startDateInput = page.locator('input[type="date"]').first();
    const originalDate = await startDateInput.inputValue();

    // Change date
    await startDateInput.fill('2024-01-01');

    const newDate = await startDateInput.inputValue();
    expect(newDate).toBe('2024-01-01');
  });

  test('should allow changing end date', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    const endDateInput = page.locator('input[type="date"]').last();

    // Change date
    await endDateInput.fill('2024-12-31');

    const newDate = await endDateInput.inputValue();
    expect(newDate).toBe('2024-12-31');
  });

  test('should reload data when date range changes', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Set up API interception to track requests
    let requestCount = 0;
    await page.route('**/api/analytics/dashboard**', route => {
      requestCount++;
      route.continue();
    });

    // Change date
    const startDateInput = page.locator('input[type="date"]').first();
    await startDateInput.fill('2024-01-01');

    // Wait for new data to load
    await page.waitForTimeout(1000);

    // Should have made at least one new request
    expect(requestCount).toBeGreaterThan(0);
  });
});

test.describe('Analytics Dashboard - Charts Rendering', () => {
  test('should render daily activity trends chart', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Check for chart title
    await expect(page.getByText(/daily activity trends/i)).toBeVisible();

    // Check for canvas element (Chart.js renders to canvas)
    const canvases = page.locator('canvas');
    const count = await canvases.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should render web vitals performance chart', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    await expect(page.getByText(/web vitals performance/i)).toBeVisible();
  });

  test('should render web vitals rating distribution chart', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    await expect(page.getByText(/web vitals rating distribution/i)).toBeVisible();
  });

  test('should render top pages chart', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    await expect(page.getByText(/top pages by views/i)).toBeVisible();
  });

  test('should render most used tools chart', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    await expect(page.getByText(/most used tools/i)).toBeVisible();
  });

  test('should render device breakdown chart', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    await expect(page.getByText(/device breakdown/i)).toBeVisible();
  });

  test('should render browser distribution chart', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    await expect(page.getByText(/browser distribution/i)).toBeVisible();
  });

  test('should have multiple canvas elements for charts', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Should have multiple charts (7 charts total)
    const canvases = page.locator('canvas');
    const count = await canvases.count();

    // Should have at least 5 charts
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('should render charts without errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Should not have Chart.js errors
    const chartErrors = consoleErrors.filter(err =>
      err.toLowerCase().includes('chart') ||
      err.toLowerCase().includes('canvas')
    );

    expect(chartErrors.length).toBe(0);
  });
});

test.describe('Analytics Dashboard - Data Tables', () => {
  test('should render top pages data table', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Check for table title
    await expect(page.getByText(/top pages details/i)).toBeVisible();

    // Check for table headers
    await expect(page.getByText(/^page$/i)).toBeVisible();
    await expect(page.getByText(/views/i)).toBeVisible();
  });

  test('should render tool performance table', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Check for table title
    await expect(page.getByText(/tool performance/i)).toBeVisible();

    // Check for table headers
    await expect(page.getByText(/^tool$/i)).toBeVisible();
    await expect(page.getByText(/uses/i)).toBeVisible();
  });

  test('should display data in tables', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Get all table rows
    const tableRows = page.locator('table tbody tr');
    const count = await tableRows.count();

    // Should have some data rows
    expect(count).toBeGreaterThan(0);
  });

  test('should format table data correctly', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Get first table row
    const firstRow = page.locator('table tbody tr').first();
    const cells = firstRow.locator('td');
    const cellCount = await cells.count();

    // Should have multiple columns
    expect(cellCount).toBeGreaterThan(0);

    // Each cell should have content
    for (let i = 0; i < cellCount; i++) {
      const text = await cells.nth(i).textContent();
      expect(text?.trim()).toBeTruthy();
    }
  });

  test('should have hover effects on table rows', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    const firstRow = page.locator('table tbody tr').first();

    // Hover over row
    await firstRow.hover();

    // Row should have hover class
    const hasHoverClass = await firstRow.evaluate(el => {
      return el.classList.contains('hover:bg-gray-50') ||
             el.classList.contains('hover:bg-gray-700/50');
    });

    expect(hasHoverClass).toBe(true);
  });
});

test.describe('Analytics Dashboard - Responsive Design', () => {
  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Page should load without horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('should stack summary cards on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Summary cards should be visible
    await expect(page.getByText(/total page views/i)).toBeVisible();

    // Grid should adapt to mobile
    const grid = page.locator('.grid').first();
    const gridClass = await grid.getAttribute('class');

    expect(gridClass).toContain('grid-cols-1');
  });

  test('should make charts responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Charts should be visible
    const canvases = page.locator('canvas');
    const count = await canvases.count();

    expect(count).toBeGreaterThan(0);

    // Each canvas should fit within viewport
    for (let i = 0; i < Math.min(count, 3); i++) {
      const canvas = canvases.nth(i);
      const box = await canvas.boundingBox();

      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('should display date range selector on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Date inputs should be visible
    const dateInputs = page.locator('input[type="date"]');
    await expect(dateInputs.first()).toBeVisible();
    await expect(dateInputs.last()).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // All elements should be visible and functional
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/total page views/i)).toBeVisible();
  });
});

test.describe('Analytics Dashboard - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    const loadTime = Date.now() - startTime;

    // Should load in under 10 seconds (analytics can be data-heavy)
    expect(loadTime).toBeLessThan(10000);

    console.log(`Analytics dashboard loaded in ${loadTime}ms`);
  });

  test('should not cause memory leaks', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Get initial metrics
    const metrics1 = await page.metrics();

    // Reload page
    await page.reload();
    await waitForAnalyticsLoad(page);

    const metrics2 = await page.metrics();

    // Memory should not grow excessively
    const memoryGrowth = (metrics2.JSHeapUsedSize - metrics1.JSHeapUsedSize) / 1024 / 1024;

    console.log(`Memory growth: ${memoryGrowth.toFixed(2)} MB`);

    // Allow up to 50MB growth for charts and data
    expect(memoryGrowth).toBeLessThan(50);
  });
});

test.describe('Analytics Dashboard - Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/analytics dashboard/i);
  });

  test('should have accessible date inputs', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Date inputs should have labels
    const startLabel = page.getByText(/from:/i);
    const endLabel = page.getByText(/to:/i);

    await expect(startLabel).toBeVisible();
    await expect(endLabel).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Tab to first date input
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have descriptive chart titles', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Each chart section should have a title
    const chartTitles = [
      /daily activity trends/i,
      /web vitals/i,
      /top pages/i,
      /device breakdown/i,
      /browser distribution/i
    ];

    for (const titlePattern of chartTitles) {
      await expect(page.getByText(titlePattern).first()).toBeVisible();
    }
  });
});

test.describe('Analytics Dashboard - Data Accuracy', () => {
  test('should display consistent data across views', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Get page views from summary card
    const summaryValue = await page.locator('.text-3xl.font-bold').first().textContent();

    // Data should be consistent (this is a basic check)
    expect(summaryValue).toBeTruthy();
    expect(summaryValue).toMatch(/^\d/);
  });

  test('should show realistic data ranges', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Get all summary card values
    const values = page.locator('.text-3xl.font-bold');
    const count = await values.count();

    for (let i = 0; i < count; i++) {
      const text = await values.nth(i).textContent();
      const number = parseInt(text?.replace(/,/g, '') || '0');

      // Should be non-negative
      expect(number).toBeGreaterThanOrEqual(0);

      // Should be reasonable (not infinity or extremely large)
      expect(number).toBeLessThan(10000000000);
    }
  });
});

test.describe('Analytics Dashboard - Dark Mode Support', () => {
  test('should support dark mode classes', async ({ page }) => {
    await page.goto(ANALYTICS_URL);
    await waitForAnalyticsLoad(page);

    // Check for dark mode classes
    const darkModeElements = page.locator('.dark\\:bg-gray-900, .dark\\:bg-gray-800, .dark\\:text-white');
    const count = await darkModeElements.count();

    // Should have dark mode support
    expect(count).toBeGreaterThan(0);
  });
});
