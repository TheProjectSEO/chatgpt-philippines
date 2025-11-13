/**
 * k6 Load Testing Script for ChatGPT Philippines
 * Run with: k6 run --vus 100 --duration 5m k6-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Spike to 200 users
    { duration: '5m', target: 100 },  // Back down to 100
    { duration: '2m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests should be below 5s
    http_req_failed: ['rate<0.1'],     // Error rate should be below 10%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const prompts = [
  'What is artificial intelligence?',
  'Explain quantum computing',
  'Write a poem about Manila',
  'Translate Hello to Tagalog',
  'Summarize the history of the Philippines',
];

const models = [
  'claude-3-5-sonnet-20241022',
  'claude-3-7-sonnet-20250219',
  'claude-3-haiku-20240307',
];

export default function () {
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  const randomModel = models[Math.floor(Math.random() * models.length)];

  // Test chat endpoint
  const chatPayload = JSON.stringify({
    messages: [
      { role: 'user', content: randomPrompt }
    ],
    model: randomModel,
  });

  const chatParams = {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: { name: 'ChatAPI' },
  };

  const chatResponse = http.post(`${BASE_URL}/api/chat`, chatPayload, chatParams);

  check(chatResponse, {
    'chat status is 200': (r) => r.status === 200,
    'chat response time < 5s': (r) => r.timings.duration < 5000,
  }) || errorRate.add(1);

  sleep(1);

  // Test health endpoint
  const healthResponse = http.get(`${BASE_URL}/api/monitoring/health`, {
    tags: { name: 'HealthCheck' },
  });

  check(healthResponse, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 1s': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(Math.random() * 3);
}

// Test setup
export function setup() {
  console.log('Starting load test...');
  console.log(`Target: ${BASE_URL}`);
}

// Test teardown
export function teardown(data) {
  console.log('Load test completed');
}
