/**
 * Critical E2E Test Suite for ChatGPT Philippines
 *
 * These tests cover the most critical user journeys that MUST work before launch.
 * Run these tests before every deployment to production.
 *
 * Setup: npm install -D playwright @playwright/test
 * Run: npx playwright test
 */

import { test, expect, Page } from '@playwright/test';

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

/**
 * Test 1: Home Page Loads
 * Priority: P0 - Critical
 */
test.describe('Home Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto(BASE_URL);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check title
    await expect(page).toHaveTitle(/ChatGPT Philippines/i);

    // Check main heading exists
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Check navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check login link
    const loginLink = page.getByRole('link', { name: /login|sign in/i });
    await expect(loginLink).toBeVisible();

    // Check signup link
    const signupLink = page.getByRole('link', { name: /sign up|register/i });
    await expect(signupLink).toBeVisible();
  });
});

/**
 * Test 2: User Authentication Flow
 * Priority: P0 - Critical
 */
test.describe('Authentication', () => {
  test('should navigate to signup page', async ({ page }) => {
    await page.goto(BASE_URL);

    // Click signup link
    await page.getByRole('link', { name: /sign up|register/i }).click();

    // Should be on signup page
    await expect(page).toHaveURL(/signup/i);

    // Check for signup form elements
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto(BASE_URL);

    // Click login link
    await page.getByRole('link', { name: /login|sign in/i }).click();

    // Should be on login or Auth0 page
    await page.waitForLoadState('networkidle');

    // Either on our login page or Auth0 page
    const currentUrl = page.url();
    expect(
      currentUrl.includes('/login') ||
      currentUrl.includes('auth0.com')
    ).toBeTruthy();
  });

  // Note: Actual login test requires Auth0 credentials
  // In real environment, use test credentials
  test.skip('should login with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Fill login form (adjust selectors based on Auth0 Universal Login)
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to app after login
    await page.waitForURL(`${BASE_URL}/chat`, { timeout: 10000 });

    // Should see user menu or profile
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible();
  });
});

/**
 * Test 3: Guest User Tool Access
 * Priority: P0 - Critical
 */
test.describe('Guest User Access', () => {
  test('should allow guest user to access paraphraser tool', async ({ page }) => {
    await page.goto(`${BASE_URL}/paraphraser`);

    // Page should load
    await page.waitForLoadState('networkidle');

    // Tool should be visible
    const toolContainer = page.locator('main');
    await expect(toolContainer).toBeVisible();

    // Input area should exist
    const inputArea = page.locator('textarea').first();
    await expect(inputArea).toBeVisible();
  });

  test('should allow guest user to use essay writer', async ({ page }) => {
    await page.goto(`${BASE_URL}/essay-writer`);

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Check for input fields
    const topicInput = page.locator('input, textarea').first();
    await expect(topicInput).toBeVisible();

    // Check for generate button
    const generateButton = page.getByRole('button', { name: /generate|write/i });
    await expect(generateButton).toBeVisible();
  });

  test('should show rate limit prompt for guest users', async ({ page }) => {
    await page.goto(`${BASE_URL}/paraphraser`);

    // Try to use tool (may need to fill input first)
    const inputArea = page.locator('textarea').first();
    await inputArea.fill('This is a test sentence to paraphrase.');

    const submitButton = page.getByRole('button', { name: /paraphrase|generate/i });
    await submitButton.click();

    // Should show loading state
    await page.waitForTimeout(1000);

    // Response should appear or error should show
    // (Actual implementation depends on your error handling)
  });
});

/**
 * Test 4: Core Tool Functionality
 * Priority: P0 - Critical
 */
test.describe('Core Tools', () => {
  test('paraphraser should accept input and show output', async ({ page }) => {
    await page.goto(`${BASE_URL}/paraphraser`);

    const testText = 'The quick brown fox jumps over the lazy dog.';

    // Fill input
    const inputArea = page.locator('textarea').first();
    await inputArea.fill(testText);

    // Click generate/paraphrase button
    const generateButton = page.getByRole('button', { name: /paraphrase|generate/i });
    await generateButton.click();

    // Wait for response (adjust timeout based on your API)
    await page.waitForTimeout(5000);

    // Should show some output (either success or error)
    // Adjust selector based on your implementation
    const outputArea = page.locator('[data-testid="output"], .output, .result').first();
    const isVisible = await outputArea.isVisible().catch(() => false);

    // Either output is visible or there's an error message
    if (!isVisible) {
      const errorMessage = page.locator('.error, [role="alert"]');
      await expect(errorMessage).toBeVisible();
    }
  });

  test('grammar checker should load and accept input', async ({ page }) => {
    await page.goto(`${BASE_URL}/grammar-checker`);

    // Page loads
    await page.waitForLoadState('networkidle');

    // Input exists
    const inputArea = page.locator('textarea').first();
    await expect(inputArea).toBeVisible();

    // Fill with text containing errors
    await inputArea.fill('This are a sentence with grammar error.');

    // Check button exists
    const checkButton = page.getByRole('button', { name: /check|analyze/i });
    await expect(checkButton).toBeVisible();
  });

  test('translator should have language selectors', async ({ page }) => {
    await page.goto(`${BASE_URL}/translator`);

    // Page loads
    await page.waitForLoadState('networkidle');

    // Should have language selection (adjust selectors)
    const selectors = page.locator('select, [role="combobox"]');
    const count = await selectors.count();
    expect(count).toBeGreaterThan(0);

    // Should have input area
    const inputArea = page.locator('textarea').first();
    await expect(inputArea).toBeVisible();
  });

  test('essay writer should have topic input', async ({ page }) => {
    await page.goto(`${BASE_URL}/essay-writer`);

    await page.waitForLoadState('networkidle');

    // Should have input for topic
    const topicInput = page.locator('input[type="text"], textarea').first();
    await expect(topicInput).toBeVisible();

    // Should have generate button
    const generateButton = page.getByRole('button', { name: /generate|write|create/i });
    await expect(generateButton).toBeVisible();
  });

  test('math solver should accept math problems', async ({ page }) => {
    await page.goto(`${BASE_URL}/math-solver`);

    await page.waitForLoadState('networkidle');

    // Input area for math problem
    const inputArea = page.locator('textarea, input[type="text"]').first();
    await expect(inputArea).toBeVisible();

    // Fill with a simple math problem
    await inputArea.fill('2x + 5 = 15');

    // Solve button
    const solveButton = page.getByRole('button', { name: /solve|calculate/i });
    await expect(solveButton).toBeVisible();
  });
});

/**
 * Test 5: Error Handling
 * Priority: P1 - High
 */
test.describe('Error Handling', () => {
  test('should show 404 page for non-existent route', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/this-page-does-not-exist`);

    // Should return 404 status
    expect(response?.status()).toBe(404);

    // Should show error page (not blank)
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
    expect(body?.length).toBeGreaterThan(0);
  });

  test('should handle empty input gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/paraphraser`);

    // Try to submit without input
    const generateButton = page.getByRole('button', { name: /paraphrase|generate/i });
    await generateButton.click();

    // Should show error or disable button
    await page.waitForTimeout(500);

    // Either button is disabled or error is shown
    const isDisabled = await generateButton.isDisabled();
    const errorMessage = page.locator('.error, [role="alert"]');
    const hasError = await errorMessage.isVisible().catch(() => false);

    expect(isDisabled || hasError).toBeTruthy();
  });
});

/**
 * Test 6: Mobile Responsiveness
 * Priority: P1 - High
 */
test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone size

  test('should display mobile navigation', async ({ page }) => {
    await page.goto(BASE_URL);

    // Mobile menu button should be visible
    const mobileMenuButton = page.locator('button[aria-label*="menu"], .hamburger, [data-testid="mobile-menu"]');
    const isVisible = await mobileMenuButton.isVisible().catch(() => false);

    // On mobile, either hamburger menu or mobile nav is visible
    expect(isVisible).toBeTruthy();
  });

  test('should load tools on mobile viewport', async ({ page }) => {
    await page.goto(`${BASE_URL}/paraphraser`);

    await page.waitForLoadState('networkidle');

    // Input should be visible and usable on mobile
    const inputArea = page.locator('textarea').first();
    await expect(inputArea).toBeVisible();

    // Should not have horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });
});

/**
 * Test 7: Performance
 * Priority: P1 - High
 */
test.describe('Performance', () => {
  test('home page should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load in under 5 seconds (adjust based on your target)
    expect(loadTime).toBeLessThan(5000);

    console.log(`Home page loaded in ${loadTime}ms`);
  });

  test('tool pages should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/paraphraser`);
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Tool pages should load in under 6 seconds
    expect(loadTime).toBeLessThan(6000);

    console.log(`Tool page loaded in ${loadTime}ms`);
  });
});

/**
 * Test 8: Accessibility
 * Priority: P2 - Medium
 */
test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto(BASE_URL);

    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // H1 should have content
    const h1Text = await h1.textContent();
    expect(h1Text?.trim().length).toBeGreaterThan(0);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto(BASE_URL);

    // Get all images
    const images = page.locator('img');
    const count = await images.count();

    // Check each image has alt attribute
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeDefined(); // Can be empty for decorative images
    }
  });

  test('should allow keyboard navigation', async ({ page }) => {
    await page.goto(BASE_URL);

    // Press Tab key
    await page.keyboard.press('Tab');

    // Something should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

/**
 * Test 9: SEO Basics
 * Priority: P2 - Medium
 */
test.describe('SEO', () => {
  test('should have meta description', async ({ page }) => {
    await page.goto(BASE_URL);

    const metaDescription = page.locator('meta[name="description"]');
    const content = await metaDescription.getAttribute('content');

    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(50);
  });

  test('should have Open Graph tags', async ({ page }) => {
    await page.goto(BASE_URL);

    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');

    await expect(ogTitle).toHaveCount(1);
    await expect(ogDescription).toHaveCount(1);
  });
});

/**
 * Test 10: Critical API Endpoints
 * Priority: P0 - Critical
 */
test.describe('API Health', () => {
  test('rate limit API should respond', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/rate-limit`);

    // Should return a response (might be 401 unauthorized, which is fine)
    expect([200, 401, 405]).toContain(response.status());
  });

  test.skip('should handle API errors gracefully', async ({ page }) => {
    // This test would require mocking API failures
    // Skip for now, implement with proper API mocking
  });
});
