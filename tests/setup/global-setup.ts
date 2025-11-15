/**
 * Global Test Setup
 *
 * Runs once before all tests to:
 * - Initialize test environment
 * - Set up authentication state
 * - Seed test data if needed
 * - Verify environment configuration
 */

import { chromium, FullConfig } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

async function globalSetup(config: FullConfig) {
  console.log('\n==================================');
  console.log('Global Test Setup Starting...');
  console.log('==================================\n');

  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000';
  console.log(`Testing against: ${baseURL}`);

  // Create directories for test artifacts
  const dirs = [
    'test-results',
    'test-results/videos',
    'test-results/screenshots',
    'test-results/traces',
    'playwright-report',
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });

  // Verify environment variables are set
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'ANTHROPIC_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn('\nWarning: Missing environment variables:');
    missingVars.forEach(varName => console.warn(`  - ${varName}`));
    console.warn('Some tests may fail or be skipped.\n');
  }

  // Test database connectivity (if not in production)
  if (process.env.TEST_ENV !== 'production') {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl) {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
        });

        if (response.ok) {
          console.log('Database connectivity: OK');
        } else {
          console.warn('Database connectivity: Failed', response.status);
        }
      }
    } catch (error) {
      console.warn('Database connectivity check failed:', error);
    }
  }

  // Set up authenticated state for tests that need it
  // This creates a saved auth state that can be reused across tests
  if (!process.env.SKIP_AUTH_SETUP) {
    try {
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      // Navigate to the app
      await page.goto(baseURL);

      // Check if we need to authenticate
      // For now, we'll just save the initial state
      // In a real scenario, you'd perform login here

      // Save storage state for reuse
      const storageStatePath = path.join(
        __dirname,
        '..',
        'auth',
        'storage-state.json'
      );

      const authDir = path.dirname(storageStatePath);
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }

      await context.storageState({ path: storageStatePath });

      await browser.close();
      console.log('Auth state saved successfully');
    } catch (error) {
      console.warn('Auth setup skipped:', error);
    }
  }

  // Wait for server to be fully ready
  console.log('\nWaiting for server to be ready...');
  const maxRetries = 30;
  let retries = 0;
  let serverReady = false;

  while (retries < maxRetries && !serverReady) {
    try {
      const response = await fetch(`${baseURL}/api/health`, {
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        serverReady = true;
        console.log('Server is ready!');
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      retries++;
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.warn('Server health check timed out - continuing anyway');
      }
    }
  }

  console.log('\n==================================');
  console.log('Global Test Setup Complete');
  console.log('==================================\n');
}

export default globalSetup;
