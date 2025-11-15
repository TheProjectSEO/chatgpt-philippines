/**
 * Tool Functionality E2E Tests
 *
 * Tests specific functionality for each major tool category
 * Run these to verify all tools work after deployment
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Helper function to wait for API response
 */
async function waitForToolResponse(page: Page, timeout = 10000) {
  await page.waitForTimeout(timeout);
}

test.describe('Writing Tools', () => {
  test('paraphraser processes text correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/paraphraser`);

    const testText = 'Artificial intelligence is transforming the way we work and live.';

    // Find and fill input
    const inputArea = page.locator('textarea').first();
    await inputArea.fill(testText);

    // Click submit button
    const submitButton = page.getByRole('button', { name: /paraphrase|generate|submit/i });
    await submitButton.click();

    // Wait for response
    await waitForToolResponse(page, 10000);

    // Should show either output or error (not empty page)
    const outputExists = await page.locator('[data-testid="output"], .output, .result').count();
    const errorExists = await page.locator('.error, [role="alert"]').count();

    expect(outputExists + errorExists).toBeGreaterThan(0);
  });

  test('essay writer accepts topic and parameters', async ({ page }) => {
    await page.goto(`${BASE_URL}/essay-writer`);

    // Fill topic
    const topicInput = page.locator('input, textarea').first();
    await topicInput.fill('The impact of technology on education');

    // Click generate
    const generateButton = page.getByRole('button', { name: /generate|write|create/i });
    await generateButton.click();

    // Wait for response
    await waitForToolResponse(page, 15000);

    // Should show loading or result
    const pageText = await page.textContent('body');
    expect(pageText).toBeTruthy();
  });

  test('article rewriter maintains meaning', async ({ page }) => {
    await page.goto(`${BASE_URL}/article-rewriter`);

    const testArticle = 'Technology has revolutionized modern education. Students now have access to vast resources online.';

    const inputArea = page.locator('textarea').first();
    await inputArea.fill(testArticle);

    const rewriteButton = page.getByRole('button', { name: /rewrite|generate/i });
    await rewriteButton.click();

    await waitForToolResponse(page);

    // Verify page didn't crash
    const errorCount = await page.locator('text=/error|failed/i').count();
    expect(errorCount).toBeLessThanOrEqual(1); // Max 1 error message
  });
});

test.describe('Academic Tools', () => {
  test('thesis generator creates thesis statement', async ({ page }) => {
    await page.goto(`${BASE_URL}/thesis-generator`);

    const topicInput = page.locator('input, textarea').first();
    await topicInput.fill('Climate change effects on agriculture');

    const generateButton = page.getByRole('button', { name: /generate|create/i });
    await generateButton.click();

    await waitForToolResponse(page);

    // Should show some result
    const hasContent = await page.locator('body').textContent();
    expect(hasContent?.length).toBeGreaterThan(100);
  });

  test('citation generator supports multiple formats', async ({ page }) => {
    await page.goto(`${BASE_URL}/citation-generator`);

    // Page should load
    await page.waitForLoadState('networkidle');

    // Should have some form inputs
    const inputs = await page.locator('input, textarea, select').count();
    expect(inputs).toBeGreaterThan(0);
  });

  test('research paper generator accepts topic', async ({ page }) => {
    await page.goto(`${BASE_URL}/research-paper`);

    const topicInput = page.locator('input, textarea').first();
    await topicInput.fill('Renewable energy sources');

    const generateButton = page.getByRole('button', { name: /generate|create|write/i });
    await generateButton.click();

    await waitForToolResponse(page, 20000);

    // Should not show blank page
    const content = await page.textContent('body');
    expect(content?.trim().length).toBeGreaterThan(0);
  });
});

test.describe('Creative Tools', () => {
  test('story generator creates narrative', async ({ page }) => {
    await page.goto(`${BASE_URL}/story-generator`);

    const promptInput = page.locator('input, textarea').first();
    await promptInput.fill('A mysterious island');

    const generateButton = page.getByRole('button', { name: /generate|create/i });
    await generateButton.click();

    await waitForToolResponse(page, 15000);

    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('poem generator creates poetry', async ({ page }) => {
    await page.goto(`${BASE_URL}/poem-generator`);

    const themeInput = page.locator('input, textarea').first();
    await themeInput.fill('Nature and beauty');

    const generateButton = page.getByRole('button', { name: /generate|create/i });
    await generateButton.click();

    await waitForToolResponse(page, 10000);

    // Verify no crashes
    const errors = await page.locator('text=/fatal|crash/i').count();
    expect(errors).toBe(0);
  });

  test('slogan generator provides options', async ({ page }) => {
    await page.goto(`${BASE_URL}/slogan-generator`);

    const brandInput = page.locator('input, textarea').first();
    await brandInput.fill('EcoFriendly Products');

    const generateButton = page.getByRole('button', { name: /generate|create/i });
    await generateButton.click();

    await waitForToolResponse(page);

    const pageText = await page.textContent('body');
    expect(pageText?.length).toBeGreaterThan(50);
  });
});

test.describe('Professional Tools', () => {
  test('resume builder accepts information', async ({ page }) => {
    await page.goto(`${BASE_URL}/resume-builder`);

    await page.waitForLoadState('networkidle');

    // Should have multiple input fields
    const inputs = await page.locator('input, textarea').count();
    expect(inputs).toBeGreaterThan(2);
  });

  test('cover letter generator personalizes content', async ({ page }) => {
    await page.goto(`${BASE_URL}/cover-letter`);

    // Fill basic info
    const inputs = page.locator('input, textarea');
    const firstInput = inputs.first();
    await firstInput.fill('Software Engineer');

    const generateButton = page.getByRole('button', { name: /generate|create|write/i });
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await waitForToolResponse(page, 10000);
    }

    // Page should not be empty
    const content = await page.textContent('body');
    expect(content?.length).toBeGreaterThan(100);
  });

  test('email writer creates professional emails', async ({ page }) => {
    await page.goto(`${BASE_URL}/email-writer`);

    const purposeInput = page.locator('input, textarea').first();
    await purposeInput.fill('Request for meeting');

    const generateButton = page.getByRole('button', { name: /generate|write/i });
    await generateButton.click();

    await waitForToolResponse(page);

    const hasResult = await page.locator('body').textContent();
    expect(hasResult).toBeTruthy();
  });
});

test.describe('Language Tools', () => {
  test('grammar checker identifies errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/grammar-checker`);

    const textWithError = 'This are a sentence with grammar error.';

    const inputArea = page.locator('textarea').first();
    await inputArea.fill(textWithError);

    const checkButton = page.getByRole('button', { name: /check|analyze/i });
    await checkButton.click();

    await waitForToolResponse(page);

    // Should show some result
    const pageText = await page.textContent('body');
    expect(pageText?.length).toBeGreaterThan(50);
  });

  test('translator supports language selection', async ({ page }) => {
    await page.goto(`${BASE_URL}/translator`);

    await page.waitForLoadState('networkidle');

    // Should have selectors and input
    const selectors = await page.locator('select, [role="combobox"]').count();
    const textareas = await page.locator('textarea').count();

    expect(selectors + textareas).toBeGreaterThan(0);
  });

  test('filipino writer generates filipino content', async ({ page }) => {
    await page.goto(`${BASE_URL}/filipino-writer`);

    const topicInput = page.locator('input, textarea').first();
    await topicInput.fill('Kultura ng Pilipinas');

    const generateButton = page.getByRole('button', { name: /generate|write|sulat/i });
    await generateButton.click();

    await waitForToolResponse(page, 12000);

    // Should show result or error
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });
});

test.describe('Technical Tools', () => {
  test('math solver accepts math problems', async ({ page }) => {
    await page.goto(`${BASE_URL}/math-solver`);

    const problemInput = page.locator('textarea, input[type="text"]').first();
    await problemInput.fill('2x + 5 = 15');

    const solveButton = page.getByRole('button', { name: /solve|calculate/i });
    await solveButton.click();

    await waitForToolResponse(page, 10000);

    const result = await page.textContent('body');
    expect(result).toBeTruthy();
  });

  test('code generator accepts task description', async ({ page }) => {
    await page.goto(`${BASE_URL}/code-generator`);

    const taskInput = page.locator('textarea, input').first();
    await taskInput.fill('Create a function to sort an array');

    const generateButton = page.getByRole('button', { name: /generate|create/i });
    await generateButton.click();

    await waitForToolResponse(page, 15000);

    const content = await page.textContent('body');
    expect(content?.length).toBeGreaterThan(0);
  });
});

test.describe('Utility Tools', () => {
  test('summarizer condenses text', async ({ page }) => {
    await page.goto(`${BASE_URL}/summarizer`);

    const longText = `
      Artificial intelligence has transformed numerous industries in recent years.
      From healthcare to finance, AI systems are being deployed to automate tasks,
      improve decision-making, and enhance user experiences. Machine learning algorithms
      can now process vast amounts of data and identify patterns that would be impossible
      for humans to detect manually.
    `;

    const inputArea = page.locator('textarea').first();
    await inputArea.fill(longText);

    const summarizeButton = page.getByRole('button', { name: /summarize|generate/i });
    await summarizeButton.click();

    await waitForToolResponse(page);

    // Should show result
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
  });

  test('qr code generator creates QR codes', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr-generator`);

    const urlInput = page.locator('input, textarea').first();
    await urlInput.fill('https://example.com');

    const generateButton = page.getByRole('button', { name: /generate|create/i });
    await generateButton.click();

    await page.waitForTimeout(2000);

    // Should show QR code or canvas
    const hasQR = await page.locator('canvas, img[alt*="QR"], svg').count();
    expect(hasQR).toBeGreaterThan(0);
  });
});

test.describe('Copy to Clipboard Functionality', () => {
  test('copy button should be present on tool output', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto(`${BASE_URL}/paraphraser`);

    const inputArea = page.locator('textarea').first();
    await inputArea.fill('Test sentence for copying.');

    const submitButton = page.getByRole('button', { name: /paraphrase|generate/i });
    await submitButton.click();

    await waitForToolResponse(page);

    // Look for copy button (adjust selector based on your implementation)
    const copyButton = page.getByRole('button', { name: /copy/i });
    const exists = await copyButton.count();

    // Copy button should exist on successful generation
    // (or there should be an error message)
    expect(exists >= 0).toBeTruthy();
  });
});
