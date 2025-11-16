/**
 * Admin Pages Manager E2E Test Suite
 *
 * Tests for /admin/pages functionality including:
 * - Pages listing and loading
 * - Search functionality
 * - Filter by category
 * - Edit page functionality
 * - Delete page confirmation
 * - Page creation
 *
 * Run: npx playwright test tests/e2e/admin-pages.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const ADMIN_PAGES_URL = `${BASE_URL}/admin/pages`;

/**
 * Helper function to wait for pages to load
 */
async function waitForPagesLoad(page: Page) {
  // Wait for loading spinner to disappear
  await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 }).catch(() => {});

  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to get page count
 */
async function getPageCount(page: Page): Promise<number> {
  const rows = page.locator('tbody tr');
  return await rows.count();
}

test.describe('Admin Pages Manager - Page Loading', () => {
  test('should load admin pages manager successfully', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);

    // Check page title
    await expect(page.locator('h1')).toContainText('Pages');

    // Check subtitle
    await expect(page.getByText('Manage your website pages')).toBeVisible();

    // Check New Page button exists
    const newPageButton = page.getByRole('button', { name: /new page/i });
    await expect(newPageButton).toBeVisible();
  });

  test('should load all pages from API', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Should see pages table
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Should have table headers
    await expect(page.getByRole('columnheader', { name: /title/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /slug/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /last modified/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /actions/i })).toBeVisible();
  });

  test('should show at least 52 pages', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Count table rows
    const pageCount = await getPageCount(page);

    // Should have at least 52 pages (as per requirement)
    expect(pageCount).toBeGreaterThanOrEqual(52);

    console.log(`Found ${pageCount} pages`);
  });

  test('should handle loading state properly', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);

    // Should show loading spinner initially
    const loadingSpinner = page.locator('.animate-spin');
    const isLoading = await loadingSpinner.isVisible().catch(() => false);

    // Either loading is visible or data loads so fast we miss it
    if (isLoading) {
      // Wait for loading to complete
      await loadingSpinner.waitFor({ state: 'hidden' });
    }

    // After loading, table should be visible
    await expect(page.locator('table')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API call and return error
    await page.route('**/api/admin/pages*', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto(ADMIN_PAGES_URL);
    await page.waitForLoadState('networkidle');

    // Should show error message
    const errorMessage = page.locator('.bg-red-50, [role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/failed to load/i);
  });
});

test.describe('Admin Pages Manager - Search Functionality', () => {
  test('should have search input', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Search input should be visible
    const searchInput = page.getByPlaceholder(/search pages/i);
    await expect(searchInput).toBeVisible();

    // Search icon should be visible
    const searchIcon = page.locator('svg').filter({ hasText: '' }).first();
    await expect(searchIcon).toBeVisible();
  });

  test('should filter pages by search query', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    const initialCount = await getPageCount(page);

    // Type in search box
    const searchInput = page.getByPlaceholder(/search pages/i);
    await searchInput.fill('paraphrase');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    const filteredCount = await getPageCount(page);

    // Should have fewer results (or same if all contain 'paraphrase')
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // All visible rows should contain search term
    const rows = page.locator('tbody tr');
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const rowText = await rows.nth(i).textContent();
      expect(rowText?.toLowerCase()).toContain('paraphrase');
    }
  });

  test('should show no results message when search has no matches', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Search for something that definitely doesn't exist
    const searchInput = page.getByPlaceholder(/search pages/i);
    await searchInput.fill('xyznonexistentpage123');

    await page.waitForTimeout(300);

    // Should show no results message
    const noResultsMessage = page.getByText(/no pages found/i);
    await expect(noResultsMessage).toBeVisible();

    // Table should not be visible
    const table = page.locator('table');
    await expect(table).not.toBeVisible();
  });

  test('should clear search and show all pages', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    const initialCount = await getPageCount(page);

    // Search
    const searchInput = page.getByPlaceholder(/search pages/i);
    await searchInput.fill('test');
    await page.waitForTimeout(300);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(300);

    const finalCount = await getPageCount(page);

    // Should show all pages again
    expect(finalCount).toBe(initialCount);
  });
});

test.describe('Admin Pages Manager - Page Actions', () => {
  test('should show edit and delete buttons for each page', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Get first row
    const firstRow = page.locator('tbody tr').first();

    // Edit button should exist
    const editButton = firstRow.getByRole('button', { name: /edit/i });
    await expect(editButton).toBeVisible();

    // Delete button should exist
    const deleteButton = firstRow.getByRole('button', { name: /delete/i });
    await expect(deleteButton).toBeVisible();
  });

  test('should open edit modal when edit button is clicked', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Click edit button on first page
    const editButton = page.locator('tbody tr').first().getByRole('button', { name: /edit/i });
    await editButton.click();

    // Modal should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Modal should have title "Edit Page"
    await expect(page.getByText(/edit page/i)).toBeVisible();

    // Should have form fields
    await expect(page.locator('#edit-title')).toBeVisible();
    await expect(page.locator('#edit-slug')).toBeVisible();
    await expect(page.locator('#edit-status')).toBeVisible();

    // Should have save button
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible();
  });

  test('should populate edit form with page data', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Get first page title
    const firstRow = page.locator('tbody tr').first();
    const pageTitle = await firstRow.locator('td').first().textContent();

    // Click edit
    await firstRow.getByRole('button', { name: /edit/i }).click();

    // Form should be populated
    const titleInput = page.locator('#edit-title');
    const titleValue = await titleInput.inputValue();

    expect(titleValue).toBe(pageTitle?.trim());
  });

  test('should close edit modal when cancel is clicked', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Open edit modal
    await page.locator('tbody tr').first().getByRole('button', { name: /edit/i }).click();

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Modal should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should validate required fields in edit form', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Open edit modal
    await page.locator('tbody tr').first().getByRole('button', { name: /edit/i }).click();

    // Clear title field
    const titleInput = page.locator('#edit-title');
    await titleInput.clear();

    // Try to save
    await page.getByRole('button', { name: /save changes/i }).click();

    // Should show validation error (HTML5 validation)
    const isInvalid = await titleInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Set up dialog handler before clicking
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('delete');
      dialog.dismiss();
    });

    // Click delete button
    await page.locator('tbody tr').first().getByRole('button', { name: /delete/i }).click();

    // Wait a bit to ensure dialog was shown
    await page.waitForTimeout(500);
  });

  test('should not delete when confirmation is cancelled', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    const initialCount = await getPageCount(page);

    // Set up dialog handler to dismiss
    page.on('dialog', dialog => dialog.dismiss());

    // Click delete
    await page.locator('tbody tr').first().getByRole('button', { name: /delete/i }).click();

    await page.waitForTimeout(500);

    // Count should remain the same
    const finalCount = await getPageCount(page);
    expect(finalCount).toBe(initialCount);
  });
});

test.describe('Admin Pages Manager - Page Creation', () => {
  test('should open new page modal when New Page button is clicked', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Click New Page button
    const newPageButton = page.getByRole('button', { name: /new page/i });
    await newPageButton.click();

    // Modal should appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Should have title "Create New Page"
    await expect(page.getByText(/create new page/i)).toBeVisible();

    // Form should be empty
    const titleInput = page.locator('#new-title');
    const titleValue = await titleInput.inputValue();
    expect(titleValue).toBe('');
  });

  test('should have all required fields in new page form', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Open new page modal
    await page.getByRole('button', { name: /new page/i }).click();

    // Check all fields exist
    await expect(page.locator('#new-title')).toBeVisible();
    await expect(page.locator('#new-slug')).toBeVisible();
    await expect(page.locator('#new-status')).toBeVisible();

    // Check buttons
    await expect(page.getByRole('button', { name: /create page/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  test('should validate new page form fields', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Open new page modal
    await page.getByRole('button', { name: /new page/i }).click();

    // Try to submit without filling fields
    await page.getByRole('button', { name: /create page/i }).click();

    // Should show validation error
    const titleInput = page.locator('#new-title');
    const isInvalid = await titleInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should close new page modal when cancel is clicked', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Open new page modal
    await page.getByRole('button', { name: /new page/i }).click();

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Modal should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });
});

test.describe('Admin Pages Manager - Status Display', () => {
  test('should display page status badges correctly', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Find a published page
    const publishedBadge = page.locator('.bg-green-100').first();

    if (await publishedBadge.isVisible()) {
      await expect(publishedBadge).toContainText(/published/i);
    }
  });

  test('should show last modified dates', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Get first row's last modified column
    const firstRow = page.locator('tbody tr').first();
    const cells = firstRow.locator('td');

    // Last modified should be 4th column (index 3)
    const lastModified = await cells.nth(3).textContent();

    // Should have some date text
    expect(lastModified).toBeTruthy();
    expect(lastModified!.trim().length).toBeGreaterThan(0);
  });

  test('should display page slugs correctly', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Get first row's slug column
    const firstRow = page.locator('tbody tr').first();
    const cells = firstRow.locator('td');

    // Slug should be 2nd column (index 1)
    const slug = await cells.nth(1).textContent();

    // Should have slug text
    expect(slug).toBeTruthy();
    expect(slug!.trim().length).toBeGreaterThan(0);
  });
});

test.describe('Admin Pages Manager - Responsive Design', () => {
  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Page should load without horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Key elements should be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: /new page/i })).toBeVisible();
  });
});

test.describe('Admin Pages Manager - Accessibility', () => {
  test('should have proper ARIA labels on action buttons', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    const firstRow = page.locator('tbody tr').first();

    // Edit button should have aria-label
    const editButton = firstRow.getByRole('button', { name: /edit/i });
    const editAriaLabel = await editButton.getAttribute('aria-label');
    expect(editAriaLabel).toBeTruthy();

    // Delete button should have aria-label
    const deleteButton = firstRow.getByRole('button', { name: /delete/i });
    const deleteAriaLabel = await deleteButton.getAttribute('aria-label');
    expect(deleteAriaLabel).toBeTruthy();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Tab to search input
    await page.keyboard.press('Tab');

    // Search input should be focused
    const searchInput = page.getByPlaceholder(/search pages/i);
    await expect(searchInput).toBeFocused();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(ADMIN_PAGES_URL);
    await waitForPagesLoad(page);

    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    const h1Text = await h1.textContent();
    expect(h1Text).toContain('Pages');
  });
});
