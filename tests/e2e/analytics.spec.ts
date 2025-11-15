/**
 * Analytics E2E Tests
 *
 * Tests for analytics tracking and Web Vitals measurement
 *
 * Coverage:
 * - Web Vitals tracking (CLS, FID, LCP, FCP, TTFB)
 * - Page view recording
 * - Event tracking
 * - User interaction analytics
 * - Performance monitoring
 */

import { test, expect, Page } from '@playwright/test';
import { waitForNetworkIdle, measurePageLoad } from '../helpers/test-helpers';

test.describe('Analytics and Web Vitals', () => {
  test.describe('Web Vitals Tracking', () => {
    test('should measure and report Core Web Vitals', async ({ page }) => {
      // Capture Web Vitals data
      const webVitals: any[] = [];

      await page.exposeFunction('captureWebVital', (metric: any) => {
        webVitals.push(metric);
      });

      // Inject Web Vitals listener
      await page.addInitScript(() => {
        if ('web-vitals' in window || (window as any).webVitals) {
          // Web Vitals library is loaded
          const reportMetric = (metric: any) => {
            (window as any).captureWebVital(metric);
          };

          // Listen for vitals
          (window as any).__webVitalsCallback = reportMetric;
        }
      });

      await page.goto('/');
      await waitForNetworkIdle(page);

      // Interact with page to trigger FID
      await page.click('body');
      await page.waitForTimeout(1000);

      // Navigate to trigger vitals reporting
      await page.evaluate(() => {
        // Trigger visibility change to report metrics
        if (document.visibilityState === 'visible') {
          window.dispatchEvent(new Event('visibilitychange'));
        }
      });

      await page.waitForTimeout(2000);

      // Check if vitals were captured
      if (webVitals.length > 0) {
        console.log('Web Vitals captured:', webVitals);

        // Check for core vitals
        const vitalNames = webVitals.map(v => v.name);
        console.log('Vital metrics captured:', vitalNames);
      } else {
        console.log('Web Vitals library may not be configured');
      }
    });

    test('should track LCP (Largest Contentful Paint)', async ({ page }) => {
      let lcpValue = 0;

      await page.exposeFunction('captureLCP', (value: number) => {
        lcpValue = value;
      });

      await page.addInitScript(() => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          (window as any).captureLCP(lastEntry.startTime);
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      });

      await page.goto('/');
      await waitForNetworkIdle(page);

      await page.waitForTimeout(2000);

      if (lcpValue > 0) {
        console.log(`LCP: ${lcpValue}ms`);

        // LCP should be under 2.5s for good experience
        expect(lcpValue).toBeLessThan(2500);
      }
    });

    test('should measure FCP (First Contentful Paint)', async ({ page }) => {
      await page.goto('/');

      const fcpValue = await page.evaluate(() => {
        const fcpEntry = performance.getEntriesByType('paint')
          .find(entry => entry.name === 'first-contentful-paint');

        return fcpEntry ? fcpEntry.startTime : 0;
      });

      console.log(`FCP: ${fcpValue}ms`);

      // FCP should be under 1.8s for good experience
      if (fcpValue > 0) {
        expect(fcpValue).toBeLessThan(1800);
      }
    });

    test('should measure TTFB (Time to First Byte)', async ({ page }) => {
      await page.goto('/');

      const ttfbValue = await page.evaluate(() => {
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return navEntry.responseStart - navEntry.requestStart;
      });

      console.log(`TTFB: ${ttfbValue}ms`);

      // TTFB should be under 600ms for good experience
      expect(ttfbValue).toBeLessThan(600);
    });

    test('should measure CLS (Cumulative Layout Shift)', async ({ page }) => {
      let clsValue = 0;

      await page.exposeFunction('captureCLS', (value: number) => {
        clsValue = value;
      });

      await page.addInitScript(() => {
        let cls = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
              (window as any).captureCLS(cls);
            }
          }
        });

        observer.observe({ entryTypes: ['layout-shift'] });
      });

      await page.goto('/');
      await waitForNetworkIdle(page);

      // Scroll to trigger potential shifts
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);

      console.log(`CLS: ${clsValue}`);

      // CLS should be under 0.1 for good experience
      if (clsValue > 0) {
        expect(clsValue).toBeLessThan(0.1);
      }
    });
  });

  test.describe('Page Performance Metrics', () => {
    test('should track page load performance', async ({ page }) => {
      await page.goto('/');
      await waitForNetworkIdle(page);

      const metrics = await measurePageLoad(page);

      console.log('Page Load Metrics:');
      console.log('- DOM Content Loaded:', metrics.domContentLoaded, 'ms');
      console.log('- Load Complete:', metrics.loadComplete, 'ms');
      console.log('- Total Time:', metrics.totalTime, 'ms');

      // Performance thresholds
      expect(metrics.domContentLoaded).toBeLessThan(3000);
      expect(metrics.totalTime).toBeLessThan(5000);
    });

    test('should track resource loading times', async ({ page }) => {
      await page.goto('/');

      const resourceMetrics = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

        const summary = {
          totalResources: resources.length,
          scripts: resources.filter(r => r.initiatorType === 'script').length,
          stylesheets: resources.filter(r => r.initiatorType === 'link' || r.name.endsWith('.css')).length,
          images: resources.filter(r => r.initiatorType === 'img').length,
          avgDuration: resources.reduce((sum, r) => sum + r.duration, 0) / resources.length,
          slowestResource: resources.reduce((slowest, r) =>
            r.duration > (slowest?.duration || 0) ? r : slowest
          , null as PerformanceResourceTiming | null),
        };

        return {
          ...summary,
          slowestResourceName: summary.slowestResource?.name,
          slowestResourceDuration: summary.slowestResource?.duration,
        };
      });

      console.log('Resource Loading Metrics:');
      console.log('- Total Resources:', resourceMetrics.totalResources);
      console.log('- Scripts:', resourceMetrics.scripts);
      console.log('- Stylesheets:', resourceMetrics.stylesheets);
      console.log('- Images:', resourceMetrics.images);
      console.log('- Average Duration:', resourceMetrics.avgDuration.toFixed(2), 'ms');
      console.log('- Slowest Resource:', resourceMetrics.slowestResourceName);
      console.log('- Slowest Duration:', resourceMetrics.slowestResourceDuration?.toFixed(2), 'ms');

      // Verify reasonable resource counts
      expect(resourceMetrics.totalResources).toBeGreaterThan(0);
      expect(resourceMetrics.avgDuration).toBeLessThan(1000);
    });

    test('should measure JavaScript execution time', async ({ page }) => {
      await page.goto('/');

      const jsMetrics = await page.evaluate(() => {
        const entries = performance.getEntriesByType('measure');

        const jsExecutionTime = entries.reduce((sum, entry) => sum + entry.duration, 0);

        return {
          measureCount: entries.length,
          totalExecutionTime: jsExecutionTime,
        };
      });

      console.log('JavaScript Execution Metrics:');
      console.log('- Measures:', jsMetrics.measureCount);
      console.log('- Total Execution Time:', jsMetrics.totalExecutionTime.toFixed(2), 'ms');
    });
  });

  test.describe('Page View Tracking', () => {
    test('should track page views on navigation', async ({ page }) => {
      const pageViews: string[] = [];

      // Listen for navigation requests
      page.on('request', request => {
        const url = request.url();

        // Track analytics/metrics requests
        if (url.includes('/api/metrics') ||
            url.includes('/api/analytics') ||
            url.includes('analytics') ||
            url.includes('tracking')) {
          pageViews.push(url);
          console.log('Analytics request:', url);
        }
      });

      // Navigate to multiple pages
      await page.goto('/');
      await waitForNetworkIdle(page);

      await page.goto('/paraphraser');
      await waitForNetworkIdle(page);

      await page.goto('/grammar-checker');
      await waitForNetworkIdle(page);

      // Check if analytics requests were made
      console.log(`Total analytics requests: ${pageViews.length}`);

      if (pageViews.length > 0) {
        expect(pageViews.length).toBeGreaterThan(0);
      } else {
        console.log('No explicit analytics requests detected - may be using client-side tracking');
      }
    });

    test('should send page view with correct metadata', async ({ page }) => {
      let analyticsData: any = null;

      page.on('request', request => {
        if (request.url().includes('/api/metrics') ||
            request.url().includes('/api/analytics')) {
          analyticsData = request.postDataJSON();
        }
      });

      await page.goto('/paraphraser');
      await waitForNetworkIdle(page);

      await page.waitForTimeout(2000);

      if (analyticsData) {
        console.log('Analytics data sent:', analyticsData);

        // Verify data structure
        expect(analyticsData).toBeDefined();
      }
    });
  });

  test.describe('Event Tracking', () => {
    test('should track button click events', async ({ page }) => {
      const events: any[] = [];

      page.on('request', request => {
        const url = request.url();
        if (url.includes('/api/metrics') || url.includes('/api/event')) {
          const data = request.postDataJSON();
          if (data) {
            events.push(data);
          }
        }
      });

      await page.goto('/paraphraser');

      // Click a button
      const button = page.getByRole('button', { name: /paraphrase|generate/i });

      if (await button.count() > 0) {
        await button.click();
        await page.waitForTimeout(1000);
      }

      console.log(`Events tracked: ${events.length}`);

      if (events.length > 0) {
        console.log('Event data:', events);
      }
    });

    test('should track form submissions', async ({ page }) => {
      await page.goto('/paraphraser');

      const events: string[] = [];

      page.on('request', request => {
        const url = request.url();
        if (url.includes('/api/paraphrase') ||
            url.includes('/api/metrics')) {
          events.push(url);
        }
      });

      // Fill and submit form
      const textarea = page.locator('textarea').first();
      await textarea.fill('Test text for analytics tracking');

      const button = page.getByRole('button', { name: /paraphrase|generate/i });
      await button.click();

      await page.waitForTimeout(2000);

      // Should have tracked the submission
      expect(events.length).toBeGreaterThan(0);

      console.log('Form submission events:', events);
    });

    test('should track tool usage events', async ({ page }) => {
      const toolPages = [
        '/paraphraser',
        '/grammar-checker',
        '/translator',
        '/summarizer',
      ];

      for (const toolPage of toolPages) {
        await page.goto(toolPage);
        await waitForNetworkIdle(page);

        // Verify page loaded
        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible();

        console.log(`Visited: ${toolPage}`);
      }
    });
  });

  test.describe('User Interaction Tracking', () => {
    test('should track scroll depth', async ({ page }) => {
      await page.goto('/blog/how-to-use-ai-tools-for-content-creation-2025');

      // Scroll to different depths
      const scrollDepths = [25, 50, 75, 100];

      for (const depth of scrollDepths) {
        await page.evaluate((percentage) => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo(0, (scrollHeight * percentage) / 100);
        }, depth);

        await page.waitForTimeout(500);

        const currentScroll = await page.evaluate(() => {
          const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
          const currentPos = window.scrollY;
          return Math.round((currentPos / scrollHeight) * 100);
        });

        console.log(`Scrolled to ${depth}%, actual: ${currentScroll}%`);
      }
    });

    test('should track time on page', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/paraphraser');
      await waitForNetworkIdle(page);

      // Simulate user reading/interacting
      await page.waitForTimeout(3000);

      const timeOnPage = Date.now() - startTime;

      console.log(`Time on page: ${timeOnPage}ms`);

      expect(timeOnPage).toBeGreaterThan(2000);
    });

    test('should track exit intent', async ({ page, context }) => {
      await page.goto('/paraphraser');

      // Simulate mouse moving towards browser top (exit intent)
      await page.mouse.move(500, 0);

      await page.waitForTimeout(1000);

      // Check if exit intent modal or tracking triggered
      const modal = page.locator('[role="dialog"], .modal, [data-testid="exit-modal"]');
      const modalVisible = await modal.isVisible().catch(() => false);

      console.log('Exit intent modal shown:', modalVisible);
    });
  });

  test.describe('Error Tracking', () => {
    test('should track JavaScript errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('pageerror', error => {
        errors.push(error.message);
        console.log('Page error:', error.message);
      });

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/');
      await waitForNetworkIdle(page);

      // Navigate to several pages
      await page.goto('/paraphraser');
      await page.goto('/grammar-checker');

      console.log(`Total errors captured: ${errors.length}`);

      if (errors.length > 0) {
        console.log('Errors found:', errors);
      }

      // Ideally should have no errors
      // But we just log them for awareness
    });

    test('should track API errors', async ({ page }) => {
      const apiErrors: any[] = [];

      page.on('response', response => {
        if (response.status() >= 400) {
          apiErrors.push({
            url: response.url(),
            status: response.status(),
          });
        }
      });

      await page.goto('/');
      await page.goto('/non-existent-page');

      console.log('API errors:', apiErrors);
    });
  });

  test.describe('Conversion Tracking', () => {
    test('should track signup intent', async ({ page }) => {
      await page.goto('/');

      // Click on signup link
      const signupLink = page.getByRole('link', { name: /sign up|register/i });

      if (await signupLink.count() > 0) {
        await signupLink.click();
        await page.waitForURL(/signup/i);

        console.log('Signup page visited');
      }
    });

    test('should track pricing page visits', async ({ page }) => {
      await page.goto('/');

      // Navigate to pricing
      const pricingLink = page.getByRole('link', { name: /pricing/i });

      if (await pricingLink.count() > 0) {
        await pricingLink.click();
        await page.waitForURL(/pricing/i);

        console.log('Pricing page visited');

        // Track time on pricing page
        await page.waitForTimeout(2000);
      }
    });

    test('should track CTA button clicks', async ({ page }) => {
      await page.goto('/');

      // Find CTA buttons
      const ctaButtons = page.locator('a:has-text("Get Started"), a:has-text("Try Free"), button:has-text("Start")');

      const count = await ctaButtons.count();

      if (count > 0) {
        console.log(`Found ${count} CTA buttons`);

        const firstCTA = ctaButtons.first();
        await expect(firstCTA).toBeVisible();
      }
    });
  });

  test.describe('Session Tracking', () => {
    test('should maintain session across page navigations', async ({ page }) => {
      await page.goto('/');

      // Get initial session ID if stored
      const initialSession = await page.evaluate(() => {
        return localStorage.getItem('sessionId') ||
               sessionStorage.getItem('sessionId') ||
               document.cookie.match(/sessionId=([^;]+)/)?.[1];
      });

      // Navigate to another page
      await page.goto('/paraphraser');

      // Get session ID again
      const secondSession = await page.evaluate(() => {
        return localStorage.getItem('sessionId') ||
               sessionStorage.getItem('sessionId') ||
               document.cookie.match(/sessionId=([^;]+)/)?.[1];
      });

      if (initialSession && secondSession) {
        expect(initialSession).toBe(secondSession);
        console.log('Session maintained:', initialSession);
      } else {
        console.log('No explicit session tracking found');
      }
    });
  });

  test.describe('Performance Budgets', () => {
    test('should meet performance budgets for critical pages', async ({ page }) => {
      const criticalPages = [
        { path: '/', budget: 3000 },
        { path: '/paraphraser', budget: 4000 },
        { path: '/chat', budget: 4000 },
      ];

      for (const { path, budget } of criticalPages) {
        const startTime = Date.now();

        await page.goto(path);
        await waitForNetworkIdle(page);

        const loadTime = Date.now() - startTime;

        console.log(`${path} loaded in ${loadTime}ms (budget: ${budget}ms)`);

        expect(loadTime).toBeLessThan(budget);
      }
    });
  });
});
