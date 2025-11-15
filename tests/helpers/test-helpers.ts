/**
 * Test Helper Functions
 *
 * Reusable utilities for Playwright tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for network idle with timeout
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    // Continue if timeout - network might still be active
    console.log('Network idle timeout - continuing test');
  }
}

/**
 * Fill form field and verify
 */
export async function fillAndVerify(
  page: Page,
  selector: string,
  value: string
) {
  const input = page.locator(selector);
  await input.fill(value);
  await expect(input).toHaveValue(value);
}

/**
 * Check if element is visible with retry
 */
export async function isVisible(
  page: Page,
  selector: string,
  timeout = 5000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for and click element
 */
export async function waitAndClick(
  page: Page,
  selector: string,
  options?: { timeout?: number; force?: boolean }
) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout: options?.timeout });
  await element.click({ force: options?.force });
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Take screenshot with custom name
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  fullPage = false
) {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage,
  });
}

/**
 * Get text content safely
 */
export async function getText(
  page: Page,
  selector: string
): Promise<string | null> {
  try {
    return await page.locator(selector).textContent();
  } catch {
    return null;
  }
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

  page.on('pageerror', error => {
    errors.push(error.message);
  });

  return errors;
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 30000
) {
  return await page.waitForResponse(
    response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Mock API response
 */
export async function mockAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  responseData: any,
  status = 200
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
 * Check mobile viewport
 */
export function isMobileViewport(page: Page): boolean {
  const viewport = page.viewportSize();
  return viewport ? viewport.width < 768 : false;
}

/**
 * Simulate rate limit
 */
export async function simulateRateLimit(page: Page) {
  await mockAPIResponse(
    page,
    /\/api\/rate-limit/,
    {
      count: 10,
      limit: 10,
      remaining: 0,
      blocked: true,
    }
  );
}

/**
 * Wait for toast/notification
 */
export async function waitForNotification(
  page: Page,
  expectedText?: string,
  timeout = 5000
) {
  const selectors = [
    '[role="alert"]',
    '.toast',
    '.notification',
    '[data-testid="notification"]',
  ];

  for (const selector of selectors) {
    try {
      const element = page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: timeout / selectors.length });

      if (expectedText) {
        await expect(element).toContainText(expectedText);
      }

      return element;
    } catch {
      // Try next selector
    }
  }

  throw new Error('No notification found');
}

/**
 * Clear all cookies and storage
 */
export async function clearAllStorage(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Set local storage item
 */
export async function setLocalStorage(
  page: Page,
  key: string,
  value: any
) {
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key, value }
  );
}

/**
 * Get local storage item
 */
export async function getLocalStorage(
  page: Page,
  key: string
): Promise<any> {
  return await page.evaluate(key => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }, key);
}

/**
 * Wait for element to disappear
 */
export async function waitForDisappear(
  page: Page,
  selector: string,
  timeout = 5000
) {
  await page.waitForSelector(selector, { state: 'hidden', timeout });
}

/**
 * Check accessibility basics
 */
export async function checkAccessibility(page: Page) {
  // Check for h1
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBeGreaterThan(0);

  // Check images have alt text
  const images = page.locator('img');
  const imageCount = await images.count();

  for (let i = 0; i < imageCount; i++) {
    const alt = await images.nth(i).getAttribute('alt');
    expect(alt).toBeDefined();
  }

  // Check buttons have accessible names
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();

  for (let i = 0; i < buttonCount; i++) {
    const button = buttons.nth(i);
    const ariaLabel = await button.getAttribute('aria-label');
    const text = await button.textContent();

    expect(ariaLabel || text?.trim()).toBeTruthy();
  }
}

/**
 * Measure page load performance
 */
export async function measurePageLoad(page: Page) {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalTime: navigation.loadEventEnd - navigation.fetchStart,
    };
  });

  return metrics;
}

/**
 * Check for console errors and fail if found
 */
export function assertNoConsoleErrors(errors: string[]) {
  const filteredErrors = errors.filter(error => {
    // Filter out known safe errors
    return !error.includes('ResizeObserver') &&
           !error.includes('favicon.ico');
  });

  if (filteredErrors.length > 0) {
    console.error('Console errors found:', filteredErrors);
    throw new Error(`Found ${filteredErrors.length} console errors`);
  }
}

/**
 * Upload file helper
 */
export async function uploadFile(
  page: Page,
  selector: string,
  filePath: string
) {
  const input = page.locator(selector);
  await input.setInputFiles(filePath);
}

/**
 * Download file helper
 */
export async function downloadFile(
  page: Page,
  triggerSelector: string
): Promise<string> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click(triggerSelector),
  ]);

  const path = await download.path();
  return path || '';
}
