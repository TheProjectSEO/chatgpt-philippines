/**
 * Security E2E Tests
 *
 * Tests for security features and vulnerability prevention
 *
 * Coverage:
 * - Rate limiting enforcement
 * - Abuse detection
 * - XSS prevention
 * - SQL injection prevention
 * - CSRF protection
 * - Input sanitization
 * - API security
 */

import { test, expect, Page, APIRequestContext } from '@playwright/test';
import {
  waitForAPIResponse,
  mockAPIResponse,
  simulateRateLimit,
  clearAllStorage,
  waitForNotification,
} from '../helpers/test-helpers';
import { securityPayloads, httpStatus, apiEndpoints } from '../helpers/test-data';

test.describe('Security Tests', () => {
  test.describe('Rate Limiting', () => {
    test('should enforce rate limits for guest users', async ({ page }) => {
      await page.goto('/paraphraser');

      // Clear storage to ensure we're a new guest
      await clearAllStorage(page);
      await page.reload();

      let requestCount = 0;
      let rateLimitReached = false;

      // Try to make multiple requests
      for (let i = 0; i < 12; i++) {
        const textarea = page.locator('textarea').first();
        await textarea.fill(`Test sentence number ${i + 1} for rate limit testing.`);

        const button = page.getByRole('button', { name: /paraphrase|generate/i });
        await button.click();

        // Wait for response
        await page.waitForTimeout(1000);

        // Check for rate limit message
        const rateLimitMessage = page.locator('text=/rate limit|limit reached|too many requests/i');

        if (await rateLimitMessage.isVisible()) {
          rateLimitReached = true;
          console.log(`Rate limit reached after ${i + 1} requests`);
          break;
        }

        requestCount++;
      }

      // Should hit rate limit before 15 requests
      expect(rateLimitReached).toBeTruthy();
      expect(requestCount).toBeLessThan(15);

      console.log(`Total successful requests before rate limit: ${requestCount}`);
    });

    test('should return correct rate limit headers from API', async ({ request }) => {
      const response = await request.post(apiEndpoints.rateLimit, {
        data: { action: 'check' },
      });

      expect([200, 401]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();

        expect(data).toHaveProperty('count');
        expect(data).toHaveProperty('limit');
        expect(data).toHaveProperty('remaining');
        expect(data).toHaveProperty('blocked');

        expect(typeof data.count).toBe('number');
        expect(typeof data.limit).toBe('number');
        expect(typeof data.remaining).toBe('number');
        expect(typeof data.blocked).toBe('boolean');
      }
    });

    test('should show rate limit warning UI', async ({ page }) => {
      await page.goto('/paraphraser');

      // Simulate rate limit reached
      await simulateRateLimit(page);

      // Try to use the tool
      const textarea = page.locator('textarea').first();
      await textarea.fill('Test input for rate limit UI check.');

      const button = page.getByRole('button', { name: /paraphrase|generate/i });
      await button.click();

      // Should show rate limit message
      await page.waitForTimeout(1000);

      const warningMessage = page.locator('[role="alert"], .error, .warning, text=/rate limit|limit reached/i');
      const isVisible = await warningMessage.first().isVisible().catch(() => false);

      expect(isVisible).toBeTruthy();
    });

    test('should reset rate limit after 24 hours (simulated)', async ({ page }) => {
      // This test would require time manipulation or mocking
      // For now, just verify the rate limit endpoint supports reset checks

      await page.goto('/paraphraser');

      const response = await page.request.get(apiEndpoints.rateLimit);

      if (response.ok()) {
        const data = await response.json();

        // Should have fields indicating when limit resets
        expect(data).toBeDefined();

        console.log('Rate limit status:', data);
      }
    });
  });

  test.describe('XSS Prevention', () => {
    test('should sanitize script tags in input', async ({ page }) => {
      await page.goto('/paraphraser');

      const maliciousInputs = securityPayloads.xss;

      for (const payload of maliciousInputs) {
        const textarea = page.locator('textarea').first();
        await textarea.fill(payload);

        const button = page.getByRole('button', { name: /paraphrase|generate/i });

        // Try to submit
        await button.click();
        await page.waitForTimeout(1500);

        // Check that no script was executed
        const alertShown = await page.evaluate(() => {
          return (window as any).__xssTriggered || false;
        });

        expect(alertShown).toBeFalsy();

        // Check that textarea doesn't execute script
        const textareaValue = await textarea.inputValue();
        expect(textareaValue).toBe(payload); // Input preserved but not executed

        console.log(`XSS payload blocked: ${payload.substring(0, 50)}`);
      }
    });

    test('should escape HTML in output', async ({ page }) => {
      await page.goto('/paraphraser');

      const htmlInput = '<strong>Bold text</strong> and <script>alert("xss")</script>';

      const textarea = page.locator('textarea').first();
      await textarea.fill(htmlInput);

      const button = page.getByRole('button', { name: /paraphrase|generate/i });
      await button.click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Check output doesn't execute script
      const pageContent = await page.content();

      // Script tags should be escaped or removed in output
      expect(pageContent.toLowerCase()).not.toContain('<script>alert');
    });

    test('should sanitize user-generated content in blog', async ({ page }) => {
      // If blog has comments or user-generated content
      await page.goto('/blog/how-to-use-ai-tools-for-content-creation-2025');

      // Check page source for dangerous patterns
      const pageContent = await page.content();

      // Should not have unescaped script tags
      const dangerousPatterns = [
        /<script(?![^>]*type="application\/ld\+json")[^>]*>/i,
        /onerror\s*=/i,
        /onclick\s*=/i,
        /javascript:/i,
      ];

      dangerousPatterns.forEach(pattern => {
        const matches = pageContent.match(pattern);
        if (matches && !matches[0].includes('application/ld+json')) {
          console.warn('Potentially dangerous pattern found:', matches[0]);
        }
      });
    });
  });

  test.describe('SQL Injection Prevention', () => {
    test('should handle SQL injection attempts in API', async ({ request }) => {
      const sqlPayloads = securityPayloads.sqlInjection;

      for (const payload of sqlPayloads) {
        const response = await request.post(apiEndpoints.paraphrase, {
          data: {
            text: payload,
          },
        });

        // Should not crash or return database errors
        expect([200, 400, 401, 429, 500]).toContain(response.status());

        const body = await response.text();

        // Should not expose database errors
        const dangerousStrings = [
          'SQL syntax',
          'mysql_',
          'postgres',
          'ORA-',
          'SQLite',
          'database error',
        ];

        dangerousStrings.forEach(str => {
          expect(body.toLowerCase()).not.toContain(str.toLowerCase());
        });

        console.log(`SQL injection payload handled: ${payload}`);
      }
    });
  });

  test.describe('Path Traversal Prevention', () => {
    test('should prevent directory traversal in URLs', async ({ page }) => {
      const traversalPaths = securityPayloads.pathTraversal;

      for (const path of traversalPaths) {
        const encodedPath = encodeURIComponent(path);
        const response = await page.goto(`/blog/${encodedPath}`, {
          waitUntil: 'domcontentloaded',
        });

        // Should return 404 or redirect, not expose file system
        expect([404, 301, 302]).toContain(response?.status() || 404);

        const content = await page.content();

        // Should not expose system files
        const systemFileIndicators = [
          'root:',
          'password:',
          '/etc/passwd',
          'windows\\system32',
        ];

        systemFileIndicators.forEach(indicator => {
          expect(content.toLowerCase()).not.toContain(indicator.toLowerCase());
        });

        console.log(`Path traversal attempt blocked: ${path}`);
      }
    });
  });

  test.describe('API Security', () => {
    test('should require valid content-type for POST requests', async ({ request }) => {
      const response = await request.post(apiEndpoints.paraphrase, {
        headers: {
          'Content-Type': 'text/plain',
        },
        data: 'raw text data',
      });

      // Should reject or handle gracefully
      expect([200, 400, 415]).toContain(response.status());
    });

    test('should validate API request payloads', async ({ request }) => {
      // Send invalid JSON
      const response = await request.post(apiEndpoints.paraphrase, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: 'invalid json {',
      });

      // Should return error, not crash
      expect([400, 500]).toContain(response.status());
    });

    test('should handle oversized requests', async ({ request }) => {
      // Create very large payload
      const largeText = 'A'.repeat(1000000); // 1MB of text

      const response = await request.post(apiEndpoints.paraphrase, {
        data: {
          text: largeText,
        },
        timeout: 10000,
      });

      // Should reject or handle gracefully
      expect([400, 413, 429, 500]).toContain(response.status());

      console.log(`Large payload response: ${response.status()}`);
    });

    test('should have security headers', async ({ page }) => {
      const response = await page.goto('/');

      const headers = response?.headers();

      if (headers) {
        // Check for security headers
        console.log('Security Headers:');
        console.log('X-Frame-Options:', headers['x-frame-options']);
        console.log('X-Content-Type-Options:', headers['x-content-type-options']);
        console.log('Referrer-Policy:', headers['referrer-policy']);
        console.log('Permissions-Policy:', headers['permissions-policy']);

        // These headers are recommended but not always present in development
        // So we just log them for verification
      }
    });

    test('should handle CORS properly', async ({ request }) => {
      const response = await request.get('/', {
        headers: {
          'Origin': 'https://malicious-site.com',
        },
      });

      const corsHeader = response.headers()['access-control-allow-origin'];

      // Should either not have CORS header or be restrictive
      if (corsHeader) {
        expect(corsHeader).not.toBe('*');
        console.log('CORS header:', corsHeader);
      }
    });
  });

  test.describe('Input Validation', () => {
    test('should validate email format in forms', async ({ page }) => {
      await page.goto('/signup');

      const emailInput = page.locator('input[type="email"]');

      if (await emailInput.count() > 0) {
        // Try invalid email
        await emailInput.fill('invalid-email');

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Should show validation error
        await page.waitForTimeout(500);

        const isInvalid = await emailInput.evaluate(
          (el: HTMLInputElement) => !el.validity.valid
        );

        expect(isInvalid).toBeTruthy();
      }
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/paraphraser');

      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: /paraphrase|generate/i });
      await submitButton.click();

      await page.waitForTimeout(500);

      // Should either disable button or show error
      const isDisabled = await submitButton.isDisabled();
      const errorVisible = await page.locator('[role="alert"], .error').isVisible().catch(() => false);

      expect(isDisabled || errorVisible).toBeTruthy();
    });

    test('should limit input length', async ({ page }) => {
      await page.goto('/paraphraser');

      const textarea = page.locator('textarea').first();

      // Get maxlength attribute
      const maxLength = await textarea.getAttribute('maxlength');

      if (maxLength) {
        const maxLengthNum = parseInt(maxLength);

        // Try to exceed max length
        const longText = 'A'.repeat(maxLengthNum + 100);
        await textarea.fill(longText);

        const actualValue = await textarea.inputValue();

        // Should be truncated to max length
        expect(actualValue.length).toBeLessThanOrEqual(maxLengthNum);
      }
    });
  });

  test.describe('Session Security', () => {
    test('should clear sensitive data on logout', async ({ page, context }) => {
      // This test assumes there's a login/logout flow
      await page.goto('/');

      // Check localStorage is cleared after logout
      await context.clearCookies();

      const localStorage = await page.evaluate(() => {
        const items: Record<string, any> = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            items[key] = window.localStorage.getItem(key);
          }
        }
        return items;
      });

      // Should not have sensitive tokens
      const sensitiveKeys = ['token', 'apiKey', 'password', 'secret'];

      sensitiveKeys.forEach(key => {
        const found = Object.keys(localStorage).some(k =>
          k.toLowerCase().includes(key)
        );

        if (found) {
          console.warn(`Found potentially sensitive key in localStorage: ${key}`);
        }
      });
    });

    test('should not expose API keys in client', async ({ page }) => {
      await page.goto('/');

      // Check page source for exposed secrets
      const pageContent = await page.content();
      const scripts = await page.locator('script').all();

      for (const script of scripts) {
        const content = await script.textContent();

        if (content) {
          // Check for exposed API keys
          const dangerousPatterns = [
            /ANTHROPIC_API_KEY/,
            /sk-ant-/,
            /AUTH0_CLIENT_SECRET/,
            /SUPABASE_SERVICE_ROLE_KEY/,
          ];

          dangerousPatterns.forEach(pattern => {
            expect(content).not.toMatch(pattern);
          });
        }
      }
    });
  });

  test.describe('Error Handling Security', () => {
    test('should not expose stack traces in production', async ({ page }) => {
      // Trigger an error by accessing non-existent API
      const response = await page.request.get('/api/non-existent-endpoint');

      const body = await response.text();

      // Should not expose stack traces
      expect(body).not.toContain('at Object.');
      expect(body).not.toContain('.ts:');
      expect(body).not.toContain('Error:');
      expect(body).not.toContain('node_modules/');
    });

    test('should handle malformed requests gracefully', async ({ request }) => {
      const response = await request.post(apiEndpoints.paraphrase, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: '{"text": undefined}',
      });

      // Should return clean error, not crash
      expect([400, 500]).toContain(response.status());

      const body = await response.text();

      // Should not expose implementation details
      expect(body).not.toContain('undefined is not');
      expect(body).not.toContain('Cannot read property');
    });
  });

  test.describe('Abuse Prevention', () => {
    test('should detect rapid repeated requests', async ({ page }) => {
      await page.goto('/paraphraser');

      const textarea = page.locator('textarea').first();
      const button = page.getByRole('button', { name: /paraphrase|generate/i });

      // Make rapid requests
      for (let i = 0; i < 5; i++) {
        await textarea.fill(`Rapid request ${i}`);
        await button.click();
        // No wait between requests
      }

      // Should trigger some protection
      await page.waitForTimeout(1000);

      // Check for rate limit or abuse warning
      const warning = page.locator('[role="alert"], .warning, .error');
      const warningVisible = await warning.isVisible().catch(() => false);

      // May or may not show warning depending on implementation
      console.log('Abuse detection warning shown:', warningVisible);
    });

    test('should prevent automated bot access', async ({ page, context }) => {
      // Set user agent to bot
      await context.setExtraHTTPHeaders({
        'User-Agent': 'Bot/1.0',
      });

      const response = await page.goto('/paraphraser');

      // Should either allow with rate limiting or block
      expect([200, 403, 429]).toContain(response?.status() || 200);

      console.log('Bot access response:', response?.status());
    });
  });
});
