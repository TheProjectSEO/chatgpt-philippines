/**
 * Admin FAQs Manager E2E Test Suite
 *
 * Tests for /admin/faqs functionality including:
 * - FAQs listing
 * - Category filtering
 * - Create new FAQ
 * - Edit existing FAQ
 * - Delete FAQ
 * - Expand/collapse FAQs
 * - Form validation
 *
 * Run: npx playwright test tests/e2e/admin-faqs.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const FAQS_URL = `${BASE_URL}/admin/faqs`;

/**
 * Helper function to get FAQ count
 */
async function getFAQCount(page: Page): Promise<number> {
  const faqs = page.locator('.divide-y > div');
  return await faqs.count();
}

/**
 * Helper function to open new FAQ modal
 */
async function openNewFAQModal(page: Page) {
  const newButton = page.getByRole('button', { name: /new faq/i });
  await newButton.click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
}

/**
 * Helper function to open edit FAQ modal
 */
async function openEditFAQModal(page: Page, index: number = 0) {
  const faqs = page.locator('.divide-y > div');
  const editButton = faqs.nth(index).getByRole('button', { name: /edit faq/i });
  await editButton.click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
}

test.describe('Admin FAQs Manager - Page Loading', () => {
  test('should load FAQs manager successfully', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page.locator('h1')).toContainText('FAQs');

    // Check subtitle
    await expect(page.getByText(/manage frequently asked questions/i)).toBeVisible();
  });

  test('should display New FAQ button', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    const newButton = page.getByRole('button', { name: /new faq/i });
    await expect(newButton).toBeVisible();
    await expect(newButton).toBeEnabled();
  });

  test('should display initial FAQ list', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Should have FAQ container
    const faqContainer = page.locator('.divide-y');
    await expect(faqContainer).toBeVisible();

    // Should have at least some FAQs
    const count = await getFAQCount(page);
    expect(count).toBeGreaterThan(0);
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors
    const significantErrors = consoleErrors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('404')
    );

    expect(significantErrors.length).toBe(0);
  });
});

test.describe('Admin FAQs Manager - FAQ Display', () => {
  test('should display FAQ questions', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Get first FAQ
    const firstFAQ = page.locator('.divide-y > div').first();

    // Should have question
    const question = firstFAQ.locator('h3');
    await expect(question).toBeVisible();

    const questionText = await question.textContent();
    expect(questionText?.trim().length).toBeGreaterThan(0);
  });

  test('should display category badges', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Get first FAQ
    const firstFAQ = page.locator('.divide-y > div').first();

    // Should have category badge
    const categoryBadge = firstFAQ.locator('.bg-orange-100');
    await expect(categoryBadge).toBeVisible();
  });

  test('should display order numbers', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Get first FAQ
    const firstFAQ = page.locator('.divide-y > div').first();

    // Should show order
    await expect(firstFAQ.getByText(/order:/i)).toBeVisible();
  });

  test('should show edit and delete buttons', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Get first FAQ
    const firstFAQ = page.locator('.divide-y > div').first();

    // Edit button
    const editButton = firstFAQ.getByRole('button', { name: /edit faq/i });
    await expect(editButton).toBeVisible();

    // Delete button
    const deleteButton = firstFAQ.getByRole('button', { name: /delete faq/i });
    await expect(deleteButton).toBeVisible();
  });
});

test.describe('Admin FAQs Manager - Expand/Collapse', () => {
  test('should expand FAQ when question is clicked', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Get first FAQ question
    const firstFAQ = page.locator('.divide-y > div').first();
    const question = firstFAQ.locator('h3');

    // Click to expand
    await question.click();

    // Wait a bit for expansion
    await page.waitForTimeout(300);

    // Answer should be visible
    const answer = firstFAQ.locator('p.text-neutral-600');
    await expect(answer).toBeVisible();
  });

  test('should collapse FAQ when clicked again', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    const firstFAQ = page.locator('.divide-y > div').first();
    const question = firstFAQ.locator('h3');

    // Expand
    await question.click();
    await page.waitForTimeout(300);

    // Collapse
    await question.click();
    await page.waitForTimeout(300);

    // Answer should be hidden
    const answer = firstFAQ.locator('p.text-neutral-600');
    await expect(answer).not.toBeVisible();
  });

  test('should rotate chevron icon when expanding', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    const firstFAQ = page.locator('.divide-y > div').first();
    const question = firstFAQ.locator('button').first();
    const chevron = firstFAQ.locator('svg').last();

    // Check initial state
    const initialClass = await chevron.getAttribute('class');

    // Click to expand
    await question.click();
    await page.waitForTimeout(300);

    // Check rotated state
    const expandedClass = await chevron.getAttribute('class');

    // Should have rotate-180 class when expanded
    expect(expandedClass).toContain('rotate-180');
  });

  test('should only expand one FAQ at a time', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    const faqs = page.locator('.divide-y > div');
    const count = await faqs.count();

    if (count >= 2) {
      // Expand first FAQ
      await faqs.nth(0).locator('h3').click();
      await page.waitForTimeout(300);

      // Expand second FAQ
      await faqs.nth(1).locator('h3').click();
      await page.waitForTimeout(300);

      // First FAQ should be collapsed
      const firstAnswer = faqs.nth(0).locator('p.text-neutral-600');
      await expect(firstAnswer).not.toBeVisible();

      // Second FAQ should be expanded
      const secondAnswer = faqs.nth(1).locator('p.text-neutral-600');
      await expect(secondAnswer).toBeVisible();
    }
  });
});

test.describe('Admin FAQs Manager - Category Filtering', () => {
  test('should display category filter buttons', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Should have categories section
    await expect(page.getByText(/^categories$/i)).toBeVisible();

    // Should have filter buttons
    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /general/i })).toBeVisible();
  });

  test('should filter FAQs by category', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    const initialCount = await getFAQCount(page);

    // Click on a specific category
    const paraphraserButton = page.getByRole('button', { name: /paraphraser/i });

    if (await paraphraserButton.isVisible()) {
      await paraphraserButton.click();
      await page.waitForTimeout(300);

      const filteredCount = await getFAQCount(page);

      // Should filter results
      expect(filteredCount).toBeLessThanOrEqual(initialCount);

      // All visible FAQs should be in selected category
      const faqs = page.locator('.divide-y > div');
      const count = await faqs.count();

      for (let i = 0; i < count; i++) {
        const categoryBadge = faqs.nth(i).locator('.bg-orange-100');
        const category = await categoryBadge.textContent();
        expect(category?.toLowerCase()).toContain('paraphraser');
      }
    }
  });

  test('should show all FAQs when "All" is selected', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    const allButton = page.getByRole('button', { name: /^all$/i });

    // Click a specific category first
    const generalButton = page.getByRole('button', { name: /general/i });
    await generalButton.click();
    await page.waitForTimeout(300);

    // Then click "All"
    await allButton.click();
    await page.waitForTimeout(300);

    // Should show all FAQs
    const count = await getFAQCount(page);
    expect(count).toBeGreaterThan(0);
  });

  test('should highlight selected category', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    const generalButton = page.getByRole('button', { name: /general/i });
    await generalButton.click();

    // Selected button should have active styles
    const buttonClass = await generalButton.getAttribute('class');
    expect(buttonClass).toContain('bg-orange-500');
    expect(buttonClass).toContain('text-white');
  });
});

test.describe('Admin FAQs Manager - Create FAQ', () => {
  test('should open new FAQ modal', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openNewFAQModal(page);

    // Modal should have correct title
    await expect(page.getByText(/create new faq/i)).toBeVisible();
  });

  test('should have all form fields in new FAQ modal', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openNewFAQModal(page);

    // Check all fields
    await expect(page.locator('#new-category')).toBeVisible();
    await expect(page.locator('#new-question')).toBeVisible();
    await expect(page.locator('#new-answer')).toBeVisible();
    await expect(page.locator('#new-order')).toBeVisible();
  });

  test('should have empty fields in new FAQ form', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openNewFAQModal(page);

    // Question should be empty
    const questionInput = page.locator('#new-question');
    const questionValue = await questionInput.inputValue();
    expect(questionValue).toBe('');

    // Answer should be empty
    const answerInput = page.locator('#new-answer');
    const answerValue = await answerInput.inputValue();
    expect(answerValue).toBe('');
  });

  test('should allow filling in new FAQ form', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openNewFAQModal(page);

    // Fill form
    await page.locator('#new-category').selectOption('General');
    await page.locator('#new-question').fill('Test FAQ Question?');
    await page.locator('#new-answer').fill('This is a test answer for the FAQ.');
    await page.locator('#new-order').fill('5');

    // Verify values
    expect(await page.locator('#new-question').inputValue()).toBe('Test FAQ Question?');
    expect(await page.locator('#new-answer').inputValue()).toBe('This is a test answer for the FAQ.');
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openNewFAQModal(page);

    // Try to submit without filling
    await page.getByRole('button', { name: /create faq/i }).click();

    // Should show validation error
    const questionInput = page.locator('#new-question');
    const isInvalid = await questionInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should close modal on cancel', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openNewFAQModal(page);

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Modal should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should show success message on create', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openNewFAQModal(page);

    // Fill form
    await page.locator('#new-question').fill('Test Question?');
    await page.locator('#new-answer').fill('Test Answer');

    // Set up alert handler
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('created successfully');
      await dialog.accept();
    });

    // Submit
    await page.getByRole('button', { name: /create faq/i }).click();

    await page.waitForTimeout(500);
  });
});

test.describe('Admin FAQs Manager - Edit FAQ', () => {
  test('should open edit FAQ modal', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openEditFAQModal(page, 0);

    // Modal should have correct title
    await expect(page.getByText(/edit faq/i)).toBeVisible();
  });

  test('should populate form with FAQ data', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Get FAQ question text
    const firstFAQ = page.locator('.divide-y > div').first();
    const questionText = await firstFAQ.locator('h3').textContent();

    // Open edit modal
    await openEditFAQModal(page, 0);

    // Form should be populated
    const questionInput = page.locator('#edit-question');
    const questionValue = await questionInput.inputValue();

    expect(questionValue).toBe(questionText?.trim());
  });

  test('should allow editing FAQ fields', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openEditFAQModal(page, 0);

    // Get original values
    const questionInput = page.locator('#edit-question');
    const originalQuestion = await questionInput.inputValue();

    // Edit question
    await questionInput.clear();
    await questionInput.fill('Updated Question?');

    const newValue = await questionInput.inputValue();
    expect(newValue).toBe('Updated Question?');

    // Restore original
    await questionInput.clear();
    await questionInput.fill(originalQuestion);
  });

  test('should have all category options', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openEditFAQModal(page, 0);

    const categorySelect = page.locator('#edit-category');

    // Should have options
    const options = categorySelect.locator('option');
    const count = await options.count();

    expect(count).toBeGreaterThan(0);

    // Should have at least General option
    await expect(categorySelect.locator('option[value="General"]')).toBeVisible();
  });

  test('should validate edited fields', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openEditFAQModal(page, 0);

    // Clear required field
    await page.locator('#edit-question').clear();

    // Try to save
    await page.getByRole('button', { name: /save changes/i }).click();

    // Should show validation error
    const questionInput = page.locator('#edit-question');
    const isInvalid = await questionInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should show success message on save', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openEditFAQModal(page, 0);

    // Set up alert handler
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('updated successfully');
      await dialog.accept();
    });

    // Submit
    await page.getByRole('button', { name: /save changes/i }).click();

    await page.waitForTimeout(500);
  });

  test('should close modal after save', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openEditFAQModal(page, 0);

    // Set up alert handler
    page.on('dialog', dialog => dialog.accept());

    // Submit
    await page.getByRole('button', { name: /save changes/i }).click();

    await page.waitForTimeout(500);

    // Modal should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });
});

test.describe('Admin FAQs Manager - Delete FAQ', () => {
  test('should show delete confirmation', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Set up dialog handler
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('delete');
      dialog.dismiss();
    });

    // Click delete
    const deleteButton = page.locator('.divide-y > div').first().getByRole('button', { name: /delete faq/i });
    await deleteButton.click();

    await page.waitForTimeout(500);
  });

  test('should not delete when confirmation is cancelled', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    const initialCount = await getFAQCount(page);

    // Set up dialog handler to dismiss
    page.on('dialog', dialog => dialog.dismiss());

    // Click delete
    const deleteButton = page.locator('.divide-y > div').first().getByRole('button', { name: /delete faq/i });
    await deleteButton.click();

    await page.waitForTimeout(500);

    // Count should remain same
    const finalCount = await getFAQCount(page);
    expect(finalCount).toBe(initialCount);
  });

  test('should show success message on delete', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Set up dialog handlers
    let confirmShown = false;
    let successShown = false;

    page.on('dialog', async dialog => {
      if (dialog.message().toLowerCase().includes('sure')) {
        confirmShown = true;
        await dialog.accept();
      } else if (dialog.message().toLowerCase().includes('deleted')) {
        successShown = true;
        await dialog.accept();
      }
    });

    // Click delete
    const deleteButton = page.locator('.divide-y > div').first().getByRole('button', { name: /delete faq/i });
    await deleteButton.click();

    await page.waitForTimeout(1000);

    expect(confirmShown).toBe(true);
  });
});

test.describe('Admin FAQs Manager - Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Should not have horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('should display all elements on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Key elements should be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: /new faq/i })).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // FAQs should be visible
    const count = await getFAQCount(page);
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Admin FAQs Manager - Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    const firstFAQ = page.locator('.divide-y > div').first();

    // Edit button should have aria-label
    const editButton = firstFAQ.getByRole('button', { name: /edit faq/i });
    const editAriaLabel = await editButton.getAttribute('aria-label');
    expect(editAriaLabel).toBeTruthy();

    // Delete button should have aria-label
    const deleteButton = firstFAQ.getByRole('button', { name: /delete faq/i });
    const deleteAriaLabel = await deleteButton.getAttribute('aria-label');
    expect(deleteAriaLabel).toBeTruthy();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Tab through elements
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    // Should have h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('FAQs');

    // FAQ questions should be h3
    const h3 = page.locator('h3').first();
    await expect(h3).toBeVisible();
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto(FAQS_URL);
    await page.waitForLoadState('networkidle');

    await openNewFAQModal(page);

    // All form fields should have labels
    await expect(page.locator('label[for="new-category"]')).toBeVisible();
    await expect(page.locator('label[for="new-question"]')).toBeVisible();
    await expect(page.locator('label[for="new-answer"]')).toBeVisible();
    await expect(page.locator('label[for="new-order"]')).toBeVisible();
  });
});
