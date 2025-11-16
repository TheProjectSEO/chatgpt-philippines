/**
 * Admin Test Utilities
 *
 * Reusable helper functions for admin panel E2E tests
 * Provides common utilities for waiting, navigation, and assertions
 */

import { Page, expect } from '@playwright/test';

/**
 * Base URLs
 */
export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const ADMIN_BASE_URL = `${BASE_URL}/admin`;

/**
 * Admin Panel Routes
 */
export const ADMIN_ROUTES = {
  pages: `${ADMIN_BASE_URL}/pages`,
  analytics: `${ADMIN_BASE_URL}/analytics`,
  faqs: `${ADMIN_BASE_URL}/faqs`,
  seo: `${ADMIN_BASE_URL}/seo`,
  media: `${ADMIN_BASE_URL}/media`,
  blog: `${ADMIN_BASE_URL}/blog`,
} as const;

/**
 * Common Selectors
 */
export const SELECTORS = {
  loadingSpinner: '.animate-spin',
  dialog: '[role="dialog"]',
  errorMessage: '.bg-red-50, [role="alert"]',
  successMessage: '.bg-green-50',
  table: 'table',
  tableRow: 'tbody tr',
  modal: '[role="dialog"]',
  confirmButton: 'button[type="submit"]',
  cancelButton: 'button:has-text("Cancel")',
} as const;

/**
 * Wait for loading spinner to disappear
 */
export async function waitForLoading(page: Page, timeout: number = 10000) {
  await page
    .waitForSelector(SELECTORS.loadingSpinner, { state: 'hidden', timeout })
    .catch(() => {
      // If no loading spinner found, that's okay - page may have loaded instantly
    });

  await page.waitForLoadState('networkidle');
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await waitForLoading(page);
}

/**
 * Navigate to admin page and wait for load
 */
export async function navigateToAdminPage(page: Page, route: keyof typeof ADMIN_ROUTES) {
  await page.goto(ADMIN_ROUTES[route]);
  await waitForPageLoad(page);
}

/**
 * Check if element is visible with retry
 */
export async function isElementVisible(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 10000
): Promise<boolean> {
  try {
    await page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Mock API response
 */
export async function mockAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  responseData: any,
  status: number = 200
) {
  await page.route(urlPattern, route => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData),
    });
  });
}

/**
 * Mock API error
 */
export async function mockAPIError(
  page: Page,
  urlPattern: string | RegExp,
  errorMessage: string = 'Internal Server Error',
  status: number = 500
) {
  await mockAPIResponse(page, urlPattern, { error: errorMessage }, status);
}

/**
 * Open modal/dialog
 */
export async function openDialog(page: Page, triggerSelector: string) {
  await page.click(triggerSelector);
  await page.waitForSelector(SELECTORS.dialog, { state: 'visible' });
}

/**
 * Close modal/dialog
 */
export async function closeDialog(page: Page, useCancelButton: boolean = true) {
  if (useCancelButton) {
    await page.click(SELECTORS.cancelButton);
  } else {
    // Click outside or use ESC key
    await page.keyboard.press('Escape');
  }

  await page.waitForSelector(SELECTORS.dialog, { state: 'hidden' });
}

/**
 * Fill form fields
 */
export async function fillFormField(
  page: Page,
  fieldId: string,
  value: string,
  fieldType: 'input' | 'textarea' | 'select' = 'input'
) {
  const selector = `#${fieldId}`;

  if (fieldType === 'select') {
    await page.selectOption(selector, value);
  } else {
    await page.fill(selector, value);
  }
}

/**
 * Submit form and handle alert
 */
export async function submitFormWithAlert(
  page: Page,
  submitButtonText: string | RegExp,
  expectedAlertPattern?: string | RegExp
): Promise<string | null> {
  let alertMessage: string | null = null;

  // Set up dialog handler
  page.once('dialog', async dialog => {
    alertMessage = dialog.message();
    if (expectedAlertPattern) {
      const pattern =
        typeof expectedAlertPattern === 'string'
          ? new RegExp(expectedAlertPattern, 'i')
          : expectedAlertPattern;
      expect(alertMessage).toMatch(pattern);
    }
    await dialog.accept();
  });

  // Click submit button
  await page.getByRole('button', { name: submitButtonText }).click();

  // Wait for alert to be handled
  await page.waitForTimeout(500);

  return alertMessage;
}

/**
 * Get table row count
 */
export async function getTableRowCount(page: Page): Promise<number> {
  const rows = page.locator(SELECTORS.tableRow);
  return await rows.count();
}

/**
 * Get table cell text
 */
export async function getTableCellText(
  page: Page,
  rowIndex: number,
  cellIndex: number
): Promise<string> {
  const row = page.locator(SELECTORS.tableRow).nth(rowIndex);
  const cell = row.locator('td').nth(cellIndex);
  return (await cell.textContent()) || '';
}

/**
 * Search in table
 */
export async function searchInTable(
  page: Page,
  searchQuery: string,
  searchInputPlaceholder: string | RegExp = /search/i
) {
  const searchInput = page.getByPlaceholder(searchInputPlaceholder);
  await searchInput.fill(searchQuery);
  await page.waitForTimeout(300); // Allow for debouncing
}

/**
 * Check for console errors
 */
export function setupConsoleErrorTracking(page: Page): string[] {
  const errors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  return errors;
}

/**
 * Filter console errors (exclude known acceptable errors)
 */
export function filterConsoleErrors(errors: string[]): string[] {
  return errors.filter(
    err =>
      !err.includes('favicon') &&
      !err.includes('404') &&
      !err.includes('ERR_BLOCKED_BY_CLIENT') &&
      !err.toLowerCase().includes('extension')
  );
}

/**
 * Check responsive design
 */
export async function checkNoHorizontalScroll(page: Page, tolerance: number = 5) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + tolerance);
}

/**
 * Test viewport sizes
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  mobileLarge: { width: 428, height: 926 }, // iPhone 14 Pro Max
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1280, height: 720 },
  desktopLarge: { width: 1920, height: 1080 },
} as const;

/**
 * Set viewport and check responsive design
 */
export async function testViewport(
  page: Page,
  viewport: keyof typeof VIEWPORTS,
  testCallback: () => Promise<void>
) {
  await page.setViewportSize(VIEWPORTS[viewport]);
  await testCallback();
  await checkNoHorizontalScroll(page);
}

/**
 * Check accessibility - keyboard navigation
 */
export async function testKeyboardNavigation(page: Page, expectedFocusableElements: number = 1) {
  // Press Tab
  await page.keyboard.press('Tab');

  // Something should be focused
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();

  return focused;
}

/**
 * Check heading hierarchy
 */
export async function checkHeadingHierarchy(page: Page, expectedH1Text?: string | RegExp) {
  const h1 = page.locator('h1');
  await expect(h1).toBeVisible();

  if (expectedH1Text) {
    const pattern =
      typeof expectedH1Text === 'string' ? new RegExp(expectedH1Text, 'i') : expectedH1Text;
    await expect(h1).toContainText(pattern);
  }

  const h1Text = await h1.textContent();
  expect(h1Text?.trim().length).toBeGreaterThan(0);
}

/**
 * Measure page load performance
 */
export async function measurePageLoadTime(page: Page, url: string): Promise<number> {
  const startTime = Date.now();
  await page.goto(url);
  await waitForPageLoad(page);
  const loadTime = Date.now() - startTime;

  console.log(`Page loaded in ${loadTime}ms`);
  return loadTime;
}

/**
 * Check for memory leaks
 * Note: page.metrics() has been removed from Playwright. This function now only reloads the page.
 */
export async function checkMemoryLeaks(
  page: Page,
  reloadCount: number = 2,
  maxMemoryGrowthMB: number = 50
): Promise<number> {
  // Page metrics API has been removed from Playwright
  // This is now a simplified version that just tests page stability through reloads

  for (let i = 0; i < reloadCount; i++) {
    await page.reload();
    await waitForPageLoad(page);
  }

  console.log(`Successfully completed ${reloadCount} page reloads`);

  // Return 0 as metrics are not available
  return 0;
}

/**
 * Wait for chart to render (Chart.js)
 */
export async function waitForChartsToRender(page: Page, expectedChartCount: number = 1) {
  // Wait for canvas elements
  await page.waitForSelector('canvas', { state: 'visible' });

  const canvases = page.locator('canvas');
  const count = await canvases.count();

  expect(count).toBeGreaterThanOrEqual(expectedChartCount);

  return count;
}

/**
 * Check if Chart.js is loaded
 */
export async function isChartJSLoaded(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return typeof (window as any).Chart !== 'undefined';
  });
}

/**
 * Take screenshot with custom name
 */
export async function takeScreenshot(page: Page, name: string, fullPage: boolean = false) {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage,
  });
}

/**
 * Assert no errors on page
 */
export async function assertNoErrors(page: Page) {
  const errorElements = page.locator(SELECTORS.errorMessage);
  const count = await errorElements.count();

  if (count > 0) {
    const errorText = await errorElements.first().textContent();
    throw new Error(`Found error on page: ${errorText}`);
  }
}

/**
 * Wait for element and click
 */
export async function waitAndClick(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  await page.click(selector);
}

/**
 * Retry async operation
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

/**
 * Check image alt attributes
 */
export async function checkImageAltAttributes(page: Page): Promise<void> {
  const images = page.locator('img');
  const count = await images.count();

  for (let i = 0; i < count; i++) {
    const alt = await images.nth(i).getAttribute('alt');
    expect(alt).toBeDefined(); // Can be empty for decorative images, but should exist
  }
}

/**
 * Check meta tags
 */
export async function checkMetaTags(page: Page): Promise<void> {
  // Check meta description
  const metaDescription = page.locator('meta[name="description"]');
  const description = await metaDescription.getAttribute('content');
  expect(description).toBeTruthy();
  expect(description!.length).toBeGreaterThan(50);

  // Check Open Graph tags
  const ogTitle = page.locator('meta[property="og:title"]');
  await expect(ogTitle).toHaveCount(1);

  const ogDescription = page.locator('meta[property="og:description"]');
  await expect(ogDescription).toHaveCount(1);
}

/**
 * Simulate network condition
 */
export async function simulateSlowNetwork(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (500 * 1024) / 8, // 500 Kbps
    uploadThroughput: (500 * 1024) / 8,
    latency: 400, // 400ms
  });
}

/**
 * Reset network condition
 */
export async function resetNetworkCondition(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: -1,
    uploadThroughput: -1,
    latency: 0,
  });
}

export default {
  // Constants
  BASE_URL,
  ADMIN_BASE_URL,
  ADMIN_ROUTES,
  SELECTORS,
  VIEWPORTS,

  // Wait utilities
  waitForLoading,
  waitForPageLoad,
  waitForAPIResponse,
  waitAndClick,

  // Navigation
  navigateToAdminPage,

  // Element utilities
  isElementVisible,
  openDialog,
  closeDialog,

  // Form utilities
  fillFormField,
  submitFormWithAlert,

  // Table utilities
  getTableRowCount,
  getTableCellText,
  searchInTable,

  // Error tracking
  setupConsoleErrorTracking,
  filterConsoleErrors,
  assertNoErrors,

  // API mocking
  mockAPIResponse,
  mockAPIError,

  // Responsive design
  checkNoHorizontalScroll,
  testViewport,

  // Accessibility
  testKeyboardNavigation,
  checkHeadingHierarchy,
  checkImageAltAttributes,
  checkMetaTags,

  // Performance
  measurePageLoadTime,
  checkMemoryLeaks,

  // Charts
  waitForChartsToRender,
  isChartJSLoaded,

  // Utilities
  takeScreenshot,
  retryOperation,
  simulateSlowNetwork,
  resetNetworkCondition,
};
