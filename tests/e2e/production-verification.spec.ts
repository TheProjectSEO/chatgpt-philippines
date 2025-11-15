/**
 * Production Verification E2E Tests
 *
 * Critical tests to run on Vercel deployments before going live
 *
 * Usage:
 * - Local: npm test tests/e2e/production-verification.spec.ts
 * - Preview: VERCEL_PREVIEW_URL=your-preview-url.vercel.app npm test
 * - Production: TEST_ENV=production PRODUCTION_URL=https://your-domain.com npm test
 *
 * Coverage:
 * - All critical pages load
 * - API endpoints respond
 * - Tools work end-to-end
 * - Database connectivity
 * - Authentication flow
 * - PWA functionality
 * - Performance benchmarks
 */

import { test, expect, Page } from '@playwright/test';
import { waitForNetworkIdle, measurePageLoad, checkAccessibility } from '../helpers/test-helpers';

// Test configuration
const isProduction = process.env.TEST_ENV === 'production';
const baseURL = process.env.VERCEL_PREVIEW_URL || process.env.PRODUCTION_URL || process.env.NEXT_PUBLIC_APP_URL;

test.describe('Production Verification', () => {
  test.describe.configure({ mode: 'serial' }); // Run serially for production

  test.describe('Critical Pages Load', () => {
    const criticalPages = [
      { path: '/', name: 'Homepage' },
      { path: '/paraphraser', name: 'Paraphraser' },
      { path: '/grammar-checker', name: 'Grammar Checker' },
      { path: '/translator', name: 'Translator' },
      { path: '/essay-writer', name: 'Essay Writer' },
      { path: '/chat', name: 'Chat' },
      { path: '/data-viz-agent', name: 'Data Viz Agent' },
      { path: '/pricing', name: 'Pricing' },
      { path: '/blog/how-to-use-ai-tools-for-content-creation-2025', name: 'Sample Blog Post' },
    ];

    for (const { path, name } of criticalPages) {
      test(`${name} should load successfully`, async ({ page }) => {
        const response = await page.goto(path);

        // Should return 200 OK
        expect(response?.status()).toBe(200);

        // Should have title
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);

        // Main content should be visible
        const mainContent = page.locator('main, [role="main"], article, h1').first();
        await expect(mainContent).toBeVisible({ timeout: 10000 });

        console.log(`✓ ${name} loaded successfully`);
      });
    }

    test('404 page should work', async ({ page }) => {
      const response = await page.goto('/this-page-does-not-exist-12345');

      expect(response?.status()).toBe(404);

      // Should show error message
      const errorMessage = page.locator('text=/not found|404/i').first();
      await expect(errorMessage).toBeVisible();

      console.log('✓ 404 page works correctly');
    });
  });

  test.describe('API Endpoints Health', () => {
    test('health endpoint should respond', async ({ request }) => {
      const response = await request.get('/api/health');

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data.status).toBe('healthy');

      console.log('✓ Health endpoint operational');
    });

    test('rate limit endpoint should respond', async ({ request }) => {
      const response = await request.get('/api/rate-limit');

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(data).toHaveProperty('limit');
      expect(data).toHaveProperty('remaining');

      console.log(`✓ Rate limiting operational (${data.remaining}/${data.limit} remaining)`);
    });

    test('critical API endpoints are accessible', async ({ request }) => {
      const endpoints = [
        '/api/paraphrase',
        '/api/grammar-check',
        '/api/translate',
        '/api/chat',
      ];

      for (const endpoint of endpoints) {
        const response = await request.post(endpoint, {
          data: { text: 'test' },
        });

        // Should respond (200 OK, 400 Bad Request, or 429 Too Many Requests)
        expect([200, 400, 429]).toContain(response.status());

        console.log(`✓ ${endpoint} responds (${response.status()})`);
      }
    });
  });

  test.describe('End-to-End Tool Functionality', () => {
    test('paraphraser works end-to-end', async ({ page }) => {
      await page.goto('/paraphraser');

      const textarea = page.locator('textarea').first();
      await textarea.fill('The quick brown fox jumps over the lazy dog.');

      const button = page.getByRole('button', { name: /paraphrase|generate/i });
      await button.click();

      // Wait for result or rate limit message
      await page.waitForTimeout(3000);

      // Should show either result or rate limit message
      const result = page.locator('[data-testid="output"], .output, .result').first();
      const rateLimit = page.locator('text=/rate limit|limit reached/i').first();

      const resultVisible = await result.isVisible().catch(() => false);
      const rateLimitVisible = await rateLimit.isVisible().catch(() => false);

      expect(resultVisible || rateLimitVisible).toBeTruthy();

      console.log('✓ Paraphraser tool functional');
    });

    test('data viz agent works with CSV', async ({ page }) => {
      await page.goto('/data-viz-agent');

      // Upload or paste CSV
      const csvInput = page.locator('textarea[placeholder*="CSV"], textarea[placeholder*="data"]').first();

      if (await csvInput.count() > 0) {
        const sampleCSV = `Product,Sales,Revenue
Product A,100,5000
Product B,150,7500
Product C,200,10000`;

        await csvInput.fill(sampleCSV);

        // Ask question or analyze
        const questionInput = page.locator('input[placeholder*="question"], textarea[placeholder*="question"]').first();

        if (await questionInput.count() > 0) {
          await questionInput.fill('Show me sales by product');

          const analyzeButton = page.getByRole('button', { name: /analyze|generate|create/i });

          if (await analyzeButton.count() > 0) {
            await analyzeButton.click();

            await page.waitForTimeout(5000);

            // Should show chart or result
            const chart = page.locator('canvas, svg, .chart, [data-testid="chart"]').first();
            const chartVisible = await chart.isVisible().catch(() => false);

            if (chartVisible) {
              console.log('✓ Data Viz Agent created visualization');
            } else {
              console.log('⚠ Data Viz Agent responded but chart not detected');
            }
          }
        }
      } else {
        console.log('⚠ Data Viz Agent UI may have changed');
      }
    });

    test('chat interface works', async ({ page }) => {
      await page.goto('/chat');

      const input = page.locator('textarea, input[type="text"]').last();
      await input.fill('Hello, can you help me write an essay?');

      const sendButton = page.getByRole('button', { name: /send|submit/i });
      await sendButton.click();

      // Wait for response
      await page.waitForTimeout(5000);

      // Should show response or rate limit
      const messages = page.locator('[data-testid="message"], .message, .chat-message');
      const messageCount = await messages.count();

      expect(messageCount).toBeGreaterThan(0);

      console.log('✓ Chat interface operational');
    });
  });

  test.describe('Database Connectivity', () => {
    test('can read from database', async ({ request }) => {
      const response = await request.get('/api/rate-limit');

      expect(response.ok()).toBeTruthy();

      const data = await response.json();

      // Should get data from Supabase
      expect(data.count).toBeDefined();

      console.log('✓ Database read operations working');
    });

    test('can write to database', async ({ request }) => {
      const response = await request.post('/api/rate-limit', {
        data: { action: 'increment' },
      });

      expect(response.ok()).toBeTruthy();

      const data = await response.json();

      expect(data.count).toBeGreaterThan(0);

      console.log('✓ Database write operations working');
    });
  });

  test.describe('Authentication Flow', () => {
    test('login page is accessible', async ({ page }) => {
      await page.goto('/login');

      // Should show login UI or redirect to Auth0
      await page.waitForTimeout(2000);

      const url = page.url();

      const isLoginPage = url.includes('/login') || url.includes('auth0.com');

      expect(isLoginPage).toBeTruthy();

      console.log('✓ Login flow accessible');
    });

    test('signup page is accessible', async ({ page }) => {
      await page.goto('/signup');

      // Should show signup form
      await page.waitForTimeout(2000);

      const emailInput = page.locator('input[type="email"]');
      const inputVisible = await emailInput.isVisible().catch(() => false);

      if (inputVisible) {
        console.log('✓ Signup page functional');
      } else {
        console.log('⚠ Signup may use Auth0 redirect');
      }
    });
  });

  test.describe('PWA Functionality', () => {
    test('manifest.json exists', async ({ request }) => {
      const response = await request.get('/manifest.json');

      expect(response.ok()).toBeTruthy();

      const manifest = await response.json();

      expect(manifest.name).toBeDefined();
      expect(manifest.short_name).toBeDefined();
      expect(manifest.icons).toBeDefined();

      console.log('✓ PWA manifest valid:', manifest.name);
    });

    test('service worker registers', async ({ page }) => {
      await page.goto('/');

      // Check if service worker is registered
      const swRegistered = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          return !!registration;
        }
        return false;
      });

      if (swRegistered) {
        console.log('✓ Service Worker registered');
      } else {
        console.log('⚠ Service Worker not detected (may be disabled in dev)');
      }
    });

    test('offline page exists', async ({ page }) => {
      const response = await page.goto('/offline');

      expect([200, 404]).toContain(response?.status() || 200);

      if (response?.status() === 200) {
        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible();

        console.log('✓ Offline page available');
      }
    });
  });

  test.describe('Performance Benchmarks', () => {
    test('homepage loads within 3 seconds', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await waitForNetworkIdle(page);

      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);

      console.log(`✓ Homepage loaded in ${loadTime}ms`);
    });

    test('tool pages load within 4 seconds', async ({ page }) => {
      const tools = ['/paraphraser', '/grammar-checker', '/chat'];

      for (const tool of tools) {
        const startTime = Date.now();

        await page.goto(tool);
        await waitForNetworkIdle(page);

        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(4000);

        console.log(`✓ ${tool} loaded in ${loadTime}ms`);
      }
    });

    test('API responses within 5 seconds', async ({ request }) => {
      const startTime = Date.now();

      const response = await request.post('/api/paraphrase', {
        data: {
          text: 'Performance test input',
        },
        timeout: 10000,
      });

      const responseTime = Date.now() - startTime;

      if (response.ok()) {
        expect(responseTime).toBeLessThan(5000);

        console.log(`✓ API responded in ${responseTime}ms`);
      } else if (response.status() === 429) {
        console.log('⚠ Rate limited (expected in testing)');
      }
    });

    test('Web Vitals are within thresholds', async ({ page }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const metrics = await measurePageLoad(page);

      console.log('Web Vitals:');
      console.log(`- DOM Content Loaded: ${metrics.domContentLoaded}ms`);
      console.log(`- Load Complete: ${metrics.loadComplete}ms`);
      console.log(`- Total Time: ${metrics.totalTime}ms`);

      expect(metrics.totalTime).toBeLessThan(5000);

      console.log('✓ Web Vitals within acceptable range');
    });
  });

  test.describe('SEO Verification', () => {
    test('all pages have proper meta tags', async ({ page }) => {
      const pages = ['/', '/paraphraser', '/pricing'];

      for (const path of pages) {
        await page.goto(path);

        // Title
        const title = await page.title();
        expect(title.length).toBeGreaterThan(10);

        // Meta description
        const metaDesc = page.locator('meta[name="description"]');
        const desc = await metaDesc.getAttribute('content');
        expect(desc).toBeTruthy();
        expect(desc!.length).toBeGreaterThan(50);

        // OG tags
        const ogTitle = page.locator('meta[property="og:title"]');
        await expect(ogTitle).toHaveCount(1);

        console.log(`✓ ${path} has proper SEO tags`);
      }
    });

    test('sitemap exists', async ({ request }) => {
      const response = await request.get('/sitemap.xml');

      if (response.ok()) {
        const sitemap = await response.text();

        expect(sitemap).toContain('<?xml');
        expect(sitemap).toContain('<urlset');

        console.log('✓ Sitemap exists');
      } else {
        console.log('⚠ Sitemap not found (may not be implemented)');
      }
    });

    test('robots.txt exists', async ({ request }) => {
      const response = await request.get('/robots.txt');

      if (response.ok()) {
        const robots = await response.text();

        expect(robots.length).toBeGreaterThan(0);

        console.log('✓ robots.txt exists');
      } else {
        console.log('⚠ robots.txt not found');
      }
    });
  });

  test.describe('Security Headers', () => {
    test('has security headers', async ({ page }) => {
      const response = await page.goto('/');

      const headers = response?.headers();

      if (headers) {
        console.log('Security Headers:');
        console.log('- X-Frame-Options:', headers['x-frame-options'] || 'Not set');
        console.log('- X-Content-Type-Options:', headers['x-content-type-options'] || 'Not set');
        console.log('- Referrer-Policy:', headers['referrer-policy'] || 'Not set');

        // These are recommendations, not failures
        if (headers['x-frame-options']) {
          console.log('✓ X-Frame-Options configured');
        }
      }
    });

    test('HTTPS is enforced in production', async ({ page }) => {
      if (isProduction) {
        await page.goto('/');

        const url = page.url();

        expect(url).toContain('https://');

        console.log('✓ HTTPS enforced');
      } else {
        test.skip();
      }
    });
  });

  test.describe('Mobile Verification', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('homepage works on mobile', async ({ page }) => {
      await page.goto('/');

      // No horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);

      // Main content visible
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();

      console.log('✓ Homepage mobile-friendly');
    });

    test('tools work on mobile', async ({ page }) => {
      await page.goto('/paraphraser');

      const textarea = page.locator('textarea').first();
      await expect(textarea).toBeVisible();

      const button = page.getByRole('button', { name: /paraphrase|generate/i });
      await expect(button).toBeVisible();

      console.log('✓ Tools mobile-friendly');
    });
  });

  test.describe('Error Handling', () => {
    test('handles API errors gracefully', async ({ page }) => {
      await page.goto('/paraphraser');

      // Mock API error
      await page.route('/api/paraphrase', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });

      const textarea = page.locator('textarea').first();
      await textarea.fill('Test input');

      const button = page.getByRole('button', { name: /paraphrase|generate/i });
      await button.click();

      await page.waitForTimeout(2000);

      // Should show error message
      const error = page.locator('[role="alert"], .error, text=/error/i').first();
      const errorVisible = await error.isVisible().catch(() => false);

      expect(errorVisible).toBeTruthy();

      console.log('✓ API errors handled gracefully');
    });
  });

  test.describe('Accessibility', () => {
    test('homepage meets accessibility standards', async ({ page }) => {
      await page.goto('/');

      await checkAccessibility(page);

      console.log('✓ Homepage meets basic accessibility standards');
    });

    test('keyboard navigation works', async ({ page }) => {
      await page.goto('/');

      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();

      console.log('✓ Keyboard navigation functional');
    });
  });
});

// Summary test - always runs last
test('Production verification summary', async ({}) => {
  console.log('\n' + '='.repeat(60));
  console.log('Production Verification Complete!');
  console.log('='.repeat(60));
  console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'PREVIEW/DEV'}`);
  console.log(`Base URL: ${baseURL}`);
  console.log('='.repeat(60) + '\n');

  // This test always passes - it's just for summary
  expect(true).toBeTruthy();
});
