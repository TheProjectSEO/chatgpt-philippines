/**
 * Global Test Teardown
 *
 * Runs once after all tests to:
 * - Clean up test data
 * - Generate test reports
 * - Archive test artifacts
 */

import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('\n==================================');
  console.log('Global Test Teardown Starting...');
  console.log('==================================\n');

  // Generate test summary
  const resultsPath = path.join('test-results', 'results.json');

  if (fs.existsSync(resultsPath)) {
    try {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

      console.log('\nTest Results Summary:');
      console.log('--------------------');
      console.log(`Total Suites: ${results.suites?.length || 0}`);

      // Count test results
      let passed = 0;
      let failed = 0;
      let skipped = 0;

      function countTests(suite: any) {
        if (suite.specs) {
          suite.specs.forEach((spec: any) => {
            spec.tests?.forEach((test: any) => {
              test.results?.forEach((result: any) => {
                if (result.status === 'passed') passed++;
                else if (result.status === 'failed') failed++;
                else if (result.status === 'skipped') skipped++;
              });
            });
          });
        }
        if (suite.suites) {
          suite.suites.forEach(countTests);
        }
      }

      results.suites?.forEach(countTests);

      console.log(`Passed: ${passed}`);
      console.log(`Failed: ${failed}`);
      console.log(`Skipped: ${skipped}`);
      console.log(`Total: ${passed + failed + skipped}`);

      if (failed > 0) {
        console.log(`\nSuccess Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
      } else {
        console.log('\nAll tests passed!');
      }
    } catch (error) {
      console.warn('Could not parse test results:', error);
    }
  }

  // Clean up old artifacts if not in CI
  if (!process.env.CI && !process.env.KEEP_ARTIFACTS) {
    const artifactDirs = [
      'test-results/videos',
      'test-results/screenshots',
      'test-results/traces',
    ];

    // Keep only the last 5 test runs worth of artifacts
    artifactDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
          .map(file => ({
            name: file,
            path: path.join(dir, file),
            time: fs.statSync(path.join(dir, file)).mtime.getTime(),
          }))
          .sort((a, b) => b.time - a.time);

        // Remove old files (keep newest 10)
        files.slice(10).forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            // Ignore errors during cleanup
          }
        });
      }
    });

    console.log('\nOld test artifacts cleaned up');
  }

  console.log('\n==================================');
  console.log('Global Test Teardown Complete');
  console.log('==================================\n');
}

export default globalTeardown;
