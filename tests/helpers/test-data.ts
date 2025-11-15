/**
 * Test Data Factory
 *
 * Generates consistent test data for use across test suites
 */

/**
 * Generate random string
 */
export function randomString(length = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * Generate random email
 */
export function randomEmail(): string {
  return `test-${randomString(8)}@example.com`;
}

/**
 * Test user data
 */
export const testUsers = {
  guest: {
    type: 'guest',
    rateLimit: 10,
  },
  free: {
    email: 'free-user@test.com',
    password: 'TestPassword123!',
    plan: 'free',
    rateLimit: 10,
  },
  premium: {
    email: 'premium-user@test.com',
    password: 'TestPassword123!',
    plan: 'premium',
    rateLimit: -1, // unlimited
  },
};

/**
 * Sample blog post data
 */
export const sampleBlogPost = {
  title: 'Test Blog Post Title',
  slug: 'test-blog-post-title',
  content: `
# Introduction

This is a test blog post with comprehensive content.

## Section 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

## Section 2

Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Conclusion

Final thoughts on the test blog post.
  `.trim(),
  excerpt: 'This is a test blog post with comprehensive content.',
  author: 'Test Author',
  publishedAt: new Date().toISOString(),
  seo: {
    title: 'Test Blog Post Title - SEO Optimized',
    description: 'This is a test blog post meta description for SEO testing.',
    keywords: ['test', 'blog', 'playwright'],
  },
  faqs: [
    {
      question: 'What is this test about?',
      answer: 'This is a test blog post for Playwright testing.',
    },
    {
      question: 'How do I run tests?',
      answer: 'Use npm test to run the Playwright tests.',
    },
  ],
};

/**
 * Sample page data
 */
export const samplePage = {
  title: 'Test Page',
  slug: 'test-page',
  content: '<h1>Test Page</h1><p>This is test content.</p>',
  seo: {
    title: 'Test Page - SEO Title',
    description: 'Test page meta description.',
    keywords: ['test', 'page'],
  },
  status: 'published',
};

/**
 * Sample FAQ data
 */
export const sampleFAQ = {
  question: 'What is the answer to life, the universe, and everything?',
  answer: 'The answer is 42.',
  category: 'general',
};

/**
 * Tool test inputs
 */
export const toolTestInputs = {
  paraphraser: {
    input: 'The quick brown fox jumps over the lazy dog.',
    expectedLength: 30, // Should return similar length text
  },
  grammarChecker: {
    input: 'This are a sentence with grammar error in it.',
    expectedErrors: 1, // At least one error should be found
  },
  translator: {
    input: 'Hello, how are you?',
    from: 'en',
    to: 'es',
    expectedLength: 10, // Translation should be reasonable length
  },
  essayWriter: {
    topic: 'The Impact of Artificial Intelligence on Education',
    wordCount: 500,
    expectedMinLength: 400, // Should be close to requested length
  },
  mathSolver: {
    problem: '2x + 5 = 15',
    expectedAnswer: 'x = 5',
  },
  summarizer: {
    input: `
      Artificial intelligence (AI) is transforming the educational landscape in unprecedented ways.
      From personalized learning experiences to automated grading systems, AI technologies are
      reshaping how students learn and how teachers teach. Machine learning algorithms can now
      adapt to individual student needs, providing customized content and pacing. Natural language
      processing enables intelligent tutoring systems that can answer student questions in real-time.
      Computer vision technology allows for innovative assessment methods. However, these
      advancements also raise important questions about data privacy, equity of access, and the
      role of human teachers in an increasingly automated educational environment.
    `.trim(),
    expectedMaxLength: 200, // Summary should be shorter than original
  },
};

/**
 * CSV test data for data viz agent
 */
export const csvTestData = {
  sales: `Date,Product,Sales,Revenue
2024-01-01,Product A,100,5000
2024-01-01,Product B,150,7500
2024-01-02,Product A,120,6000
2024-01-02,Product B,180,9000`,

  students: `Name,Grade,Score
Alice,A,95
Bob,B,82
Charlie,A,91
David,C,75`,

  simple: `Category,Value
A,10
B,20
C,15
D,25`,
};

/**
 * Security test payloads
 */
export const securityPayloads = {
  xss: [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
  ],
  sqlInjection: [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'--",
  ],
  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
  ],
};

/**
 * Performance test data
 */
export const performanceThresholds = {
  homepage: {
    maxLoadTime: 3000, // 3 seconds
    maxDOMContentLoaded: 2000, // 2 seconds
  },
  toolPage: {
    maxLoadTime: 4000, // 4 seconds
    maxDOMContentLoaded: 2500, // 2.5 seconds
  },
  apiEndpoint: {
    maxResponseTime: 5000, // 5 seconds for AI responses
    maxRateLimitCheck: 500, // 500ms for rate limit check
  },
};

/**
 * Mobile viewport sizes
 */
export const viewports = {
  mobile: {
    width: 375,
    height: 667,
  },
  tablet: {
    width: 768,
    height: 1024,
  },
  desktop: {
    width: 1280,
    height: 720,
  },
};

/**
 * API endpoints
 */
export const apiEndpoints = {
  health: '/api/health',
  rateLimit: '/api/rate-limit',
  paraphrase: '/api/paraphrase',
  grammarCheck: '/api/grammar-check',
  translate: '/api/translate',
  essayWrite: '/api/essay-write',
  mathSolve: '/api/math-solve',
  summarize: '/api/summarize',
  dataViz: '/api/data-viz',
  chat: '/api/chat',
};

/**
 * Expected HTTP status codes
 */
export const httpStatus = {
  ok: 200,
  created: 201,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  tooManyRequests: 429,
  internalError: 500,
};
