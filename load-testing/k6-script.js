/**
 * k6 load testing script for ChatGPT Philippines
 * Run with: k6 run --vus 500 --duration 5m k6-script.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const chatDuration = new Trend('chat_duration');
const rateLimitCounter = new Counter('rate_limit_hits');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 500 },  // Ramp up to 500 users
    { duration: '5m', target: 500 },  // Stay at 500 users
    { duration: '2m', target: 1000 }, // Spike to 1000 users
    { duration: '3m', target: 1000 }, // Stay at 1000 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests should be below 5s
    errors: ['rate<0.1'],               // Error rate should be below 10%
    'chat_duration': ['p(95)<10000'],   // 95% of chat requests below 10s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const prompts = [
  'Write a product description for a smartphone',
  'Create a marketing email',
  'Explain cloud computing',
  'Write SEO-optimized content',
  'Translate: Hello world',
];

export default function () {
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];

  const payload = JSON.stringify({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'claude-3-7-sonnet-20250219',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: '60s',
  };

  const startTime = new Date();
  const response = http.post(`${BASE_URL}/api/chat`, payload, params);
  const duration = new Date() - startTime;

  chatDuration.add(duration);

  const result = check(response, {
    'status is 200': (r) => r.status === 200,
    'status is not 500': (r) => r.status !== 500,
    'response time < 30s': (r) => r.timings.duration < 30000,
  });

  if (!result) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }

  if (response.status === 429) {
    rateLimitCounter.add(1);
  }

  // Random think time between 1-5 seconds
  sleep(Math.random() * 4 + 1);
}

// Health check scenario
export function healthCheck() {
  const response = http.get(`${BASE_URL}/api/health`);

  check(response, {
    'health check status is 200': (r) => r.status === 200,
  });
}

// Metrics check scenario
export function metricsCheck() {
  const response = http.get(`${BASE_URL}/api/metrics`);

  check(response, {
    'metrics status is 200': (r) => r.status === 200,
    'metrics format is text': (r) => r.headers['Content-Type'].includes('text/plain'),
  });
}
