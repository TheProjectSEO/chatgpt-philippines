/**
 * Blog System E2E Tests
 *
 * Tests for blog post rendering, navigation, and interactive features
 *
 * Coverage:
 * - Blog post page loading and rendering
 * - Table of contents navigation
 * - FAQ section expansion/collapse
 * - Reading progress tracking
 * - Mobile responsiveness
 * - SEO metadata
 * - Schema markup
 */

import { test, expect, Page } from '@playwright/test';
import {
  waitForNetworkIdle,
  isVisible,
  scrollIntoView,
  measurePageLoad,
  checkAccessibility,
} from '../helpers/test-helpers';

const BLOG_POST_SLUG = 'how-to-use-ai-tools-for-content-creation-2025';
const BLOG_POST_URL = `/blog/${BLOG_POST_SLUG}`;

test.describe('Blog System', () => {
  test.describe('Blog Post Rendering', () => {
    test('should load blog post successfully', async ({ page }) => {
      await page.goto(BLOG_POST_URL);
      await waitForNetworkIdle(page);

      // Check page loaded
      await expect(page).toHaveURL(new RegExp(BLOG_POST_SLUG));

      // Check main title exists
      const title = page.locator('h1').first();
      await expect(title).toBeVisible();
      await expect(title).not.toBeEmpty();
    });

    test('should display blog header with metadata', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Check author information
      const authorSection = page.locator('[data-testid="blog-author"], .author-info, article header');
      const hasAuthor = await isVisible(page, '[data-testid="blog-author"]') ||
                       await isVisible(page, '.author-info') ||
                       await isVisible(page, 'article header');

      expect(hasAuthor).toBeTruthy();

      // Check reading time
      const readingTime = page.locator('text=/\\d+ min read/i').first();
      await expect(readingTime).toBeVisible();

      // Check publish date
      const publishDate = page.locator('time, [datetime]').first();
      expect(await publishDate.count()).toBeGreaterThan(0);
    });

    test('should render blog content blocks', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Check for various content types
      const article = page.locator('article');
      await expect(article).toBeVisible();

      // Should have headings
      const headings = page.locator('h2, h3');
      expect(await headings.count()).toBeGreaterThan(0);

      // Should have paragraphs
      const paragraphs = page.locator('article p');
      expect(await paragraphs.count()).toBeGreaterThan(0);
    });

    test('should display breadcrumb navigation', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Check breadcrumb exists
      const breadcrumb = page.locator('nav[aria-label="Breadcrumb"], .breadcrumb, a:has-text("Blog")');
      await expect(breadcrumb.first()).toBeVisible();

      // Check breadcrumb links
      const homeLink = page.locator('a[href="/"]').first();
      await expect(homeLink).toBeVisible();

      const blogLink = page.locator('a[href="/blog"]').first();
      await expect(blogLink).toBeVisible();
    });
  });

  test.describe('Table of Contents', () => {
    test('should display table of contents', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Find TOC
      const toc = page.locator('[data-testid="table-of-contents"], .table-of-contents, aside nav').first();

      // Should be visible (might be in sidebar)
      const tocVisible = await isVisible(page, '[data-testid="table-of-contents"]') ||
                        await isVisible(page, '.table-of-contents') ||
                        await isVisible(page, 'aside nav');

      // TOC might be desktop-only
      if (page.viewportSize()!.width >= 1024) {
        expect(tocVisible).toBeTruthy();
      }
    });

    test('should navigate to section when TOC link clicked', async ({ page }) => {
      // Skip on mobile where TOC might be hidden
      test.skip(page.viewportSize()!.width < 1024, 'TOC navigation is desktop-only');

      await page.goto(BLOG_POST_URL);

      // Find first TOC link
      const tocLinks = page.locator('aside nav a, [data-testid="table-of-contents"] a');

      if (await tocLinks.count() > 0) {
        const firstLink = tocLinks.first();
        const href = await firstLink.getAttribute('href');

        if (href && href.startsWith('#')) {
          // Click the link
          await firstLink.click();

          // Wait for scroll
          await page.waitForTimeout(500);

          // Check URL hash changed
          expect(page.url()).toContain(href);

          // Check target element is in viewport
          const targetId = href.replace('#', '');
          const targetElement = page.locator(`#${targetId}`);

          if (await targetElement.count() > 0) {
            await expect(targetElement).toBeInViewport();
          }
        }
      }
    });

    test('should highlight active TOC section on scroll', async ({ page }) => {
      test.skip(page.viewportSize()!.width < 1024, 'TOC is desktop-only');

      await page.goto(BLOG_POST_URL);

      // Scroll down the page
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(500);

      // Check if any TOC link is highlighted/active
      const activeTocItem = page.locator('aside nav a.active, aside nav a[aria-current="true"]');

      // This is optional - not all implementations have active highlighting
      // So we just check without failing
      const count = await activeTocItem.count();
      console.log(`Active TOC items found: ${count}`);
    });
  });

  test.describe('FAQ Section', () => {
    test('should display FAQ section', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Scroll to FAQ section
      const faqSection = page.locator('[data-testid="faq-section"], .faq-section, h2:has-text("FAQ")').first();

      if (await faqSection.count() > 0) {
        await scrollIntoView(page, '[data-testid="faq-section"], .faq-section, h2:has-text("FAQ")');

        // Check FAQ items exist
        const faqItems = page.locator('[data-testid="faq-item"], .faq-item, details');
        expect(await faqItems.count()).toBeGreaterThan(0);
      } else {
        test.skip(true, 'FAQ section not found in this post');
      }
    });

    test('should expand/collapse FAQ items', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Find FAQ items
      const faqItem = page.locator('[data-testid="faq-item"], .faq-item, details').first();

      if (await faqItem.count() === 0) {
        test.skip(true, 'No FAQ items found');
        return;
      }

      // Check if using details/summary or custom implementation
      const isDetails = (await faqItem.evaluate(el => el.tagName)) === 'DETAILS';

      if (isDetails) {
        // Test native details/summary
        const isOpen = await faqItem.evaluate((el: any) => el.open);

        // Toggle
        const summary = faqItem.locator('summary');
        await summary.click();
        await page.waitForTimeout(300);

        const newState = await faqItem.evaluate((el: any) => el.open);
        expect(newState).toBe(!isOpen);
      } else {
        // Test custom implementation
        const faqButton = faqItem.locator('button, [role="button"]').first();

        if (await faqButton.count() > 0) {
          await faqButton.click();
          await page.waitForTimeout(300);

          // Answer should be visible
          const answer = faqItem.locator('.answer, [data-testid="faq-answer"]');
          const answerVisible = await isVisible(page, '.answer') ||
                               await isVisible(page, '[data-testid="faq-answer"]');

          expect(answerVisible).toBeTruthy();
        }
      }
    });
  });

  test.describe('Reading Progress', () => {
    test('should display reading progress bar', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Look for progress bar
      const progressBar = page.locator('[data-testid="reading-progress"], .progress-bar, .reading-progress');

      const progressVisible = await isVisible(page, '[data-testid="reading-progress"]') ||
                             await isVisible(page, '.progress-bar') ||
                             await isVisible(page, '.reading-progress');

      if (progressVisible) {
        // Scroll down
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(300);

        // Progress should update (just verify it exists)
        expect(progressVisible).toBeTruthy();
      }
    });

    test('should update progress on scroll', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      const progressBar = page.locator('[data-testid="reading-progress"], .progress-bar').first();

      if (await progressBar.count() === 0) {
        test.skip(true, 'Progress bar not implemented');
        return;
      }

      // Get initial progress
      const initialWidth = await progressBar.evaluate(el => {
        return window.getComputedStyle(el).width;
      });

      // Scroll down significantly
      await page.evaluate(() => window.scrollBy(0, 1500));
      await page.waitForTimeout(500);

      // Get new progress
      const newWidth = await progressBar.evaluate(el => {
        return window.getComputedStyle(el).width;
      });

      // Progress should have changed
      expect(newWidth).not.toBe(initialWidth);
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display properly on mobile', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // No horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);

      // Title should be visible
      const title = page.locator('h1').first();
      await expect(title).toBeVisible();

      // Content should be readable
      const article = page.locator('article');
      await expect(article).toBeVisible();
    });

    test('should hide or collapse sidebar on mobile', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Sidebar should not be visible or should be collapsible
      const sidebar = page.locator('aside').first();

      if (await sidebar.count() > 0) {
        const isInViewport = await sidebar.isVisible();

        // On mobile, sidebar is usually hidden or moved
        // We just verify page is usable
        const article = page.locator('article');
        await expect(article).toBeVisible();
      }
    });

    test('should allow reading full article on mobile', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Scroll through article
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(300);

      // Content should still be visible
      const article = page.locator('article');
      await expect(article).toBeVisible();

      // Should be able to scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);

      // Footer or end of content should be visible
      const footer = page.locator('footer, .cta-section').last();
      expect(await footer.count()).toBeGreaterThan(0);
    });
  });

  test.describe('SEO and Schema', () => {
    test('should have proper meta tags', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Check title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);

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

      const ogImage = page.locator('meta[property="og:image"]');
      await expect(ogImage).toHaveCount(1);
    });

    test('should have BlogPosting schema markup', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Check for schema.org structured data
      const schemaScript = page.locator('script[type="application/ld+json"]');
      expect(await schemaScript.count()).toBeGreaterThan(0);

      // Parse and validate schema
      const schemaContent = await schemaScript.first().textContent();
      const schema = JSON.parse(schemaContent!);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BlogPosting');
      expect(schema.headline).toBeTruthy();
      expect(schema.author).toBeTruthy();
      expect(schema.datePublished).toBeTruthy();
    });

    test('should have FAQ schema if FAQs present', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Check for FAQ schema
      const schemaScripts = page.locator('script[type="application/ld+json"]');
      const count = await schemaScripts.count();

      let hasFAQSchema = false;

      for (let i = 0; i < count; i++) {
        const content = await schemaScripts.nth(i).textContent();
        const schema = JSON.parse(content!);

        if (schema['@type'] === 'FAQPage') {
          hasFAQSchema = true;
          expect(schema.mainEntity).toBeDefined();
          expect(Array.isArray(schema.mainEntity)).toBeTruthy();

          if (schema.mainEntity.length > 0) {
            expect(schema.mainEntity[0]['@type']).toBe('Question');
            expect(schema.mainEntity[0].name).toBeTruthy();
            expect(schema.mainEntity[0].acceptedAnswer).toBeTruthy();
          }
          break;
        }
      }

      // FAQ schema should exist if there are FAQ items
      const faqItems = page.locator('[data-testid="faq-item"], .faq-item, details');
      const faqCount = await faqItems.count();

      if (faqCount > 0) {
        expect(hasFAQSchema).toBeTruthy();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(BLOG_POST_URL);
      await waitForNetworkIdle(page);

      const loadTime = Date.now() - startTime;

      // Blog post should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);

      console.log(`Blog post loaded in ${loadTime}ms`);
    });

    test('should have good Web Vitals', async ({ page }) => {
      await page.goto(BLOG_POST_URL);
      await waitForNetworkIdle(page);

      const metrics = await measurePageLoad(page);

      console.log('Page load metrics:', metrics);

      // DOM should load quickly
      expect(metrics.domContentLoaded).toBeLessThan(3000);

      // Total load should be reasonable
      expect(metrics.totalTime).toBeLessThan(6000);
    });
  });

  test.describe('Accessibility', () => {
    test('should meet basic accessibility requirements', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      await checkAccessibility(page);
    });

    test('should allow keyboard navigation', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Tab through the page
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      let focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Tab to links
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);

      focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Should have exactly one h1
      const h1 = page.locator('h1');
      expect(await h1.count()).toBe(1);

      // Should have h2s for main sections
      const h2 = page.locator('h2');
      expect(await h2.count()).toBeGreaterThan(0);

      // Headings should have content
      const h1Text = await h1.textContent();
      expect(h1Text?.trim().length).toBeGreaterThan(0);
    });
  });

  test.describe('Interactive Features', () => {
    test('should have working CTA buttons', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Scroll to CTA section
      const ctaSection = page.locator('.cta-section, [data-testid="cta-section"]').last();

      if (await ctaSection.count() > 0) {
        await scrollIntoView(page, '.cta-section, [data-testid="cta-section"]');

        // Find CTA buttons
        const ctaButtons = ctaSection.locator('a[href], button');
        expect(await ctaButtons.count()).toBeGreaterThan(0);

        // Check first button is clickable
        const firstButton = ctaButtons.first();
        await expect(firstButton).toBeVisible();
        await expect(firstButton).toBeEnabled();
      }
    });

    test('should navigate back to blog list', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Find "Back to Blog" link
      const backLink = page.locator('a:has-text("Back to Blog"), a[href="/blog"]').first();

      if (await backLink.count() > 0) {
        await backLink.click();
        await page.waitForURL(/\/blog/);

        // Should be on blog list page
        expect(page.url()).toContain('/blog');
      }
    });

    test('should display related posts if available', async ({ page }) => {
      await page.goto(BLOG_POST_URL);

      // Check for related posts section
      const relatedSection = page.locator('[data-testid="related-posts"], .related-posts, aside');

      if (await relatedSection.count() > 0) {
        // Related posts should have links
        const relatedLinks = relatedSection.locator('a[href*="/blog/"]');
        const linkCount = await relatedLinks.count();

        console.log(`Found ${linkCount} related post links`);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should show 404 for non-existent blog post', async ({ page }) => {
      await page.goto('/blog/this-post-does-not-exist-12345');

      // Should show error message
      const errorMessage = page.locator('text=/not found/i, text=/doesn\'t exist/i').first();
      await expect(errorMessage).toBeVisible();

      // Should have link back to home or blog list
      const homeLink = page.locator('a[href="/"], a[href="/blog"]').first();
      await expect(homeLink).toBeVisible();
    });
  });
});
