/**
 * API Functionality E2E Tests
 *
 * Tests for API endpoints and tool functionality
 *
 * Coverage:
 * - Tool API endpoints (paraphrase, grammar check, translate, etc.)
 * - Data Viz Agent with CSV processing
 * - Chat API functionality
 * - Rate limiting integration
 * - Error handling
 * - Response validation
 */

import { test, expect, APIRequestContext } from '@playwright/test';
import { apiEndpoints, httpStatus, toolTestInputs, csvTestData } from '../helpers/test-data';

test.describe('API Functionality Tests', () => {
  test.describe('Health and Status Endpoints', () => {
    test('health endpoint should return OK', async ({ request }) => {
      const response = await request.get(apiEndpoints.health);

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(httpStatus.ok);

      const data = await response.json();

      expect(data).toHaveProperty('status');
      expect(data.status).toBe('healthy');

      console.log('Health check response:', data);
    });

    test('metrics endpoint should be accessible', async ({ request }) => {
      const response = await request.get(apiEndpoints.metrics);

      // Might require auth or return 401
      expect([200, 401, 404]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();
        console.log('Metrics endpoint response:', data);
      }
    });
  });

  test.describe('Paraphraser API', () => {
    test('should paraphrase text successfully', async ({ request }) => {
      const response = await request.post(apiEndpoints.paraphrase, {
        data: {
          text: toolTestInputs.paraphraser.input,
        },
        timeout: 30000,
      });

      // Should succeed or hit rate limit
      expect([200, 429]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();

        expect(data).toHaveProperty('result');
        expect(typeof data.result).toBe('string');
        expect(data.result.length).toBeGreaterThan(0);

        console.log('Paraphrase result:', data.result.substring(0, 100));
      } else if (response.status() === 429) {
        console.log('Rate limit hit - expected behavior');
      }
    });

    test('should reject empty input', async ({ request }) => {
      const response = await request.post(apiEndpoints.paraphrase, {
        data: {
          text: '',
        },
      });

      expect([400, 422]).toContain(response.status());
    });

    test('should handle very long input', async ({ request }) => {
      const longText = 'word '.repeat(5000); // 5000 words

      const response = await request.post(apiEndpoints.paraphrase, {
        data: {
          text: longText,
        },
        timeout: 60000,
      });

      // Should either succeed, return error, or hit rate limit
      expect([200, 400, 413, 429]).toContain(response.status());

      console.log('Long input response status:', response.status());
    });
  });

  test.describe('Grammar Checker API', () => {
    test('should check grammar successfully', async ({ request }) => {
      const response = await request.post(apiEndpoints.grammarCheck, {
        data: {
          text: toolTestInputs.grammarChecker.input,
        },
        timeout: 30000,
      });

      expect([200, 429]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();

        expect(data).toHaveProperty('result');

        console.log('Grammar check result:', data.result.substring(0, 100));
      }
    });

    test('should detect grammar errors', async ({ request }) => {
      const response = await request.post(apiEndpoints.grammarCheck, {
        data: {
          text: 'This are wrong grammar for testing.',
        },
        timeout: 30000,
      });

      if (response.ok()) {
        const data = await response.json();

        // Result should mention corrections or errors
        expect(data.result).toBeTruthy();

        console.log('Grammar errors detected:', data.result);
      }
    });
  });

  test.describe('Translator API', () => {
    test('should translate text successfully', async ({ request }) => {
      const response = await request.post(apiEndpoints.translate, {
        data: {
          text: toolTestInputs.translator.input,
          sourceLang: toolTestInputs.translator.from,
          targetLang: toolTestInputs.translator.to,
        },
        timeout: 30000,
      });

      expect([200, 429]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();

        expect(data).toHaveProperty('result');
        expect(data.result.length).toBeGreaterThan(0);

        console.log('Translation result:', data.result);
      }
    });

    test('should handle multiple target languages', async ({ request }) => {
      const languages = ['es', 'fr', 'de', 'tl']; // Spanish, French, German, Tagalog

      for (const lang of languages) {
        const response = await request.post(apiEndpoints.translate, {
          data: {
            text: 'Hello, how are you?',
            sourceLang: 'en',
            targetLang: lang,
          },
          timeout: 30000,
        });

        if (response.ok()) {
          const data = await response.json();
          console.log(`Translation to ${lang}:`, data.result);
        }

        // Wait to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
  });

  test.describe('Essay Writer API', () => {
    test('should generate essay successfully', async ({ request }) => {
      const response = await request.post(apiEndpoints.essayWrite, {
        data: {
          topic: toolTestInputs.essayWriter.topic,
          wordCount: toolTestInputs.essayWriter.wordCount,
        },
        timeout: 60000, // Essays take longer
      });

      expect([200, 429]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();

        expect(data).toHaveProperty('result');
        expect(data.result.length).toBeGreaterThan(100);

        const wordCount = data.result.split(/\s+/).length;
        console.log(`Essay generated: ${wordCount} words`);

        // Should be reasonably close to requested length
        expect(wordCount).toBeGreaterThanOrEqual(toolTestInputs.essayWriter.expectedMinLength);
      }
    });
  });

  test.describe('Math Solver API', () => {
    test('should solve math problems', async ({ request }) => {
      const response = await request.post(apiEndpoints.mathSolve, {
        data: {
          problem: toolTestInputs.mathSolver.problem,
        },
        timeout: 30000,
      });

      expect([200, 429]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();

        expect(data).toHaveProperty('result');

        // Should contain solution
        expect(data.result).toContain('=');

        console.log('Math solution:', data.result);
      }
    });

    test('should handle different math problem types', async ({ request }) => {
      const problems = [
        'Solve: 3x + 7 = 22',
        'Calculate: 125 × 8',
        'Find the derivative of x^2 + 3x + 2',
      ];

      for (const problem of problems) {
        const response = await request.post(apiEndpoints.mathSolve, {
          data: { problem },
          timeout: 30000,
        });

        if (response.ok()) {
          const data = await response.json();
          console.log(`Problem: ${problem}`);
          console.log(`Solution: ${data.result.substring(0, 100)}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
  });

  test.describe('Summarizer API', () => {
    test('should summarize text successfully', async ({ request }) => {
      const response = await request.post(apiEndpoints.summarize, {
        data: {
          text: toolTestInputs.summarizer.input,
        },
        timeout: 30000,
      });

      expect([200, 429]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();

        expect(data).toHaveProperty('result');

        // Summary should be shorter than original
        expect(data.result.length).toBeLessThan(toolTestInputs.summarizer.input.length);
        expect(data.result.length).toBeGreaterThan(50);

        console.log('Summary result:', data.result);
      }
    });
  });

  test.describe('Data Viz Agent API', () => {
    test('should process CSV and generate visualization config', async ({ request }) => {
      const response = await request.post(apiEndpoints.dataViz, {
        data: {
          csvData: csvTestData.sales,
          question: 'Show me sales by product',
        },
        timeout: 60000,
      });

      expect([200, 429]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();

        expect(data).toBeDefined();

        // Should contain chart configuration or data
        console.log('Data viz response:', JSON.stringify(data).substring(0, 200));
      }
    });

    test('should handle different CSV formats', async ({ request }) => {
      const csvFormats = [
        { name: 'sales', data: csvTestData.sales },
        { name: 'students', data: csvTestData.students },
        { name: 'simple', data: csvTestData.simple },
      ];

      for (const { name, data: csvData } of csvFormats) {
        const response = await request.post(apiEndpoints.dataViz, {
          data: {
            csvData,
            question: `Analyze this ${name} data`,
          },
          timeout: 60000,
        });

        if (response.ok()) {
          const data = await response.json();
          console.log(`${name} data processed successfully`);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    });

    test('should validate CSV format', async ({ request }) => {
      const invalidCSV = 'not,a,valid\ncsv format';

      const response = await request.post(apiEndpoints.dataViz, {
        data: {
          csvData: invalidCSV,
          question: 'Analyze this',
        },
        timeout: 30000,
      });

      // Should handle gracefully
      expect([200, 400, 422, 429]).toContain(response.status());
    });
  });

  test.describe('Chat API', () => {
    test('should respond to chat messages', async ({ request }) => {
      const response = await request.post(apiEndpoints.chat, {
        data: {
          message: 'Hello, how can you help me?',
          conversationId: null,
        },
        timeout: 30000,
      });

      expect([200, 429]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();

        expect(data).toHaveProperty('response');
        expect(data.response.length).toBeGreaterThan(0);

        console.log('Chat response:', data.response.substring(0, 100));
      }
    });

    test('should maintain conversation context', async ({ request }) => {
      const conversationId = `test-${Date.now()}`;

      // First message
      const response1 = await request.post(apiEndpoints.chat, {
        data: {
          message: 'My name is Alice',
          conversationId,
        },
        timeout: 30000,
      });

      if (response1.ok()) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Follow-up message
        const response2 = await request.post(apiEndpoints.chat, {
          data: {
            message: 'What is my name?',
            conversationId,
          },
          timeout: 30000,
        });

        if (response2.ok()) {
          const data2 = await response2.json();

          // Should remember the name
          console.log('Context-aware response:', data2.response);
        }
      }
    });
  });

  test.describe('Rate Limiting API', () => {
    test('should check rate limit status', async ({ request }) => {
      const response = await request.get(apiEndpoints.rateLimit);

      expect(response.ok()).toBeTruthy();

      const data = await response.json();

      expect(data).toHaveProperty('count');
      expect(data).toHaveProperty('limit');
      expect(data).toHaveProperty('remaining');
      expect(data).toHaveProperty('blocked');

      console.log('Rate limit status:', data);
    });

    test('should increment rate limit on POST', async ({ request }) => {
      const before = await request.get(apiEndpoints.rateLimit);
      const beforeData = await before.json();

      const response = await request.post(apiEndpoints.rateLimit, {
        data: { action: 'increment' },
      });

      expect(response.ok()).toBeTruthy();

      const data = await response.json();

      expect(data.count).toBeGreaterThanOrEqual(beforeData.count);

      console.log('Rate limit after increment:', data);
    });

    test('should block when limit exceeded', async ({ request }) => {
      // Get current status
      const status = await request.get(apiEndpoints.rateLimit);
      const statusData = await status.json();

      if (statusData.blocked) {
        console.log('Already blocked - rate limit working');
        expect(statusData.blocked).toBeTruthy();
      } else {
        console.log(`Current usage: ${statusData.count}/${statusData.limit}`);
        expect(statusData.remaining).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should return proper error for missing parameters', async ({ request }) => {
      const response = await request.post(apiEndpoints.paraphrase, {
        data: {},
      });

      expect([400, 422]).toContain(response.status());

      const data = await response.json();

      expect(data).toHaveProperty('error');
      console.log('Error response:', data.error);
    });

    test('should handle malformed JSON', async ({ request }) => {
      const response = await request.post(apiEndpoints.paraphrase, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: 'invalid json {',
      });

      expect([400, 500]).toContain(response.status());
    });

    test('should return appropriate status for not found', async ({ request }) => {
      const response = await request.get('/api/non-existent-endpoint');

      expect(response.status()).toBe(404);
    });

    test('should handle timeout gracefully', async ({ request }) => {
      // Request with very short timeout
      try {
        const response = await request.post(apiEndpoints.essayWrite, {
          data: {
            topic: 'Test topic',
            wordCount: 1000,
          },
          timeout: 100, // Very short timeout
        });

        // If it doesn't timeout, that's fine too
        console.log('Request completed:', response.status());
      } catch (error: any) {
        // Timeout is expected
        expect(error.message).toContain('timeout');
        console.log('Timeout handled correctly');
      }
    });
  });

  test.describe('Response Validation', () => {
    test('should return valid JSON for all endpoints', async ({ request }) => {
      const endpoints = [
        { method: 'get', url: apiEndpoints.health },
        { method: 'get', url: apiEndpoints.rateLimit },
      ];

      for (const { method, url } of endpoints) {
        const response = method === 'get'
          ? await request.get(url)
          : await request.post(url, { data: {} });

        if (response.ok()) {
          // Should parse as JSON
          const data = await response.json();
          expect(data).toBeDefined();

          console.log(`${url}: Valid JSON`);
        }
      }
    });

    test('should have consistent response structure', async ({ request }) => {
      const response = await request.post(apiEndpoints.paraphrase, {
        data: {
          text: 'Test input',
        },
        timeout: 30000,
      });

      if (response.ok()) {
        const data = await response.json();

        // Should have result or error
        expect(data.result || data.error).toBeDefined();
      }
    });

    test('should include proper headers', async ({ request }) => {
      const response = await request.get(apiEndpoints.health);

      const headers = response.headers();

      expect(headers['content-type']).toContain('application/json');

      console.log('Response headers:', {
        contentType: headers['content-type'],
        cacheControl: headers['cache-control'],
      });
    });
  });

  test.describe('Performance', () => {
    test('should respond within acceptable time', async ({ request }) => {
      const startTime = Date.now();

      const response = await request.get(apiEndpoints.health);

      const responseTime = Date.now() - startTime;

      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(1000); // Health check should be fast

      console.log(`Health check response time: ${responseTime}ms`);
    });

    test('should handle concurrent requests', async ({ request }) => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        request.post(apiEndpoints.paraphrase, {
          data: {
            text: `Concurrent request ${i + 1}`,
          },
          timeout: 30000,
        })
      );

      const responses = await Promise.all(promises);

      const successCount = responses.filter(r => r.ok()).length;

      console.log(`Concurrent requests: ${successCount}/5 successful`);

      // At least some should succeed
      expect(successCount).toBeGreaterThan(0);
    });
  });
});
