import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for ChatGPT Philippines
 *
 * Enhanced configuration supporting:
 * - Local development testing
 * - Production environment testing
 * - Vercel preview URL testing
 * - Parallel execution with proper resource management
 * - Comprehensive error capture (screenshots, videos, traces)
 *
 * See https://playwright.dev/docs/test-configuration
 */

// Environment configuration
const isCI = !!process.env.CI;
const isProduction = process.env.TEST_ENV === 'production';
const vercelPreviewUrl = process.env.VERCEL_PREVIEW_URL;

// Determine base URL based on environment
function getBaseURL(): string {
  if (vercelPreviewUrl) {
    return vercelPreviewUrl.startsWith('http')
      ? vercelPreviewUrl
      : `https://${vercelPreviewUrl}`;
  }
  if (isProduction) {
    return process.env.PRODUCTION_URL || 'https://chatgpt-philippines.vercel.app';
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export default defineConfig({
  testDir: './tests/e2e',

  /* Maximum time one test can run for */
  timeout: 60 * 1000,

  /* Maximum time for expect() assertions */
  expect: {
    timeout: 10 * 1000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: isCI,

  /* Retry on CI only - production gets more retries due to network variability */
  retries: isCI ? (isProduction ? 3 : 2) : 0,

  /* Parallel execution settings - optimized for different environments */
  workers: isCI
    ? (isProduction ? 2 : 1)  // Limit concurrency in production to avoid rate limits
    : process.env.WORKERS ? parseInt(process.env.WORKERS) : undefined,

  /* Reporter configuration - enhanced for CI and local development */
  reporter: [
    ['html', {
      outputFolder: 'playwright-report',
      open: isCI ? 'never' : 'on-failure'
    }],
    ['list', { printSteps: !isCI }],
    ['json', {
      outputFile: 'test-results/results.json'
    }],
    // GitHub Actions reporter when running in CI
    ...(process.env.GITHUB_ACTIONS ? [['github'] as const] : []),
    // JUnit reporter for CI systems
    ...(isCI ? [['junit', { outputFile: 'test-results/junit.xml' }] as const] : []),
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: getBaseURL(),

    /* Collect trace on first retry and always on CI failures */
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',

    /* Screenshot configuration - capture more in production */
    screenshot: isProduction ? 'on' : 'only-on-failure',

    /* Video configuration - always record in production for debugging */
    video: isProduction ? 'retain-on-failure' : 'on-first-retry',

    /* Maximum time for each action */
    actionTimeout: 15 * 1000,

    /* Maximum time for navigation */
    navigationTimeout: 30 * 1000,

    /* Ignore HTTPS errors when testing preview deployments */
    ignoreHTTPSErrors: !!vercelPreviewUrl,

    /* Collect console logs and network activity */
    contextOptions: {
      recordVideo: isProduction ? {
        dir: 'test-results/videos',
        size: { width: 1280, height: 720 }
      } : undefined,
    },

    /* Extra headers for requests */
    extraHTTPHeaders: {
      // Identify test traffic
      'X-Test-Run': 'playwright',
    },
  },

  /* Global test setup and teardown */
  globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),

  /* Configure projects for major browsers - optimized for mobile-first */
  projects: [
    // Setup project for authentication and data seeding
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },

    // Mobile Chrome - Primary testing target (mobile-first)
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        // Override with higher quality for screenshots
        viewport: { width: 393, height: 851 },
      },
      dependencies: ['setup'],
    },

    // Mobile Safari - iOS testing
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
      dependencies: ['setup'],
    },

    // Desktop Chrome - Secondary target
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['setup'],
    },

    // Desktop Firefox - Cross-browser verification
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['setup'],
    },

    // Desktop Safari - Cross-browser verification
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['setup'],
    },

    // Microsoft Edge - Enterprise browser support
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['setup'],
    },

    // Tablet viewports for responsive testing
    {
      name: 'iPad Pro',
      use: {
        ...devices['iPad Pro'],
      },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: (!isCI && !isProduction && !vercelPreviewUrl) ? {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  } : undefined,

  /* Output folder for test artifacts */
  outputDir: 'test-results',

  /* Folder for snapshots */
  snapshotDir: 'tests/snapshots',
});
