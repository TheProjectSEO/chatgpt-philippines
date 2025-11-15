import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security headers configuration
const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.auth0.com https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://*.auth0.com https://api.anthropic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy (formerly Feature Policy)
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

  // Force HTTPS (only in production)
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  }),
};

// Maximum request body sizes by endpoint type (in bytes)
const MAX_BODY_SIZES = {
  '/api/chat': 50 * 1024, // 50KB for chat messages
  '/api/image-generate': 10 * 1024, // 10KB for image prompts
  '/api/research-paper': 20 * 1024, // 20KB for research topics
  '/api/essay-write': 20 * 1024, // 20KB for essay prompts
  '/api/code-generate': 30 * 1024, // 30KB for code generation
  '/api/data-processor': 5 * 1024 * 1024, // 5MB for data processing
  '/api/data-viz': 5 * 1024 * 1024, // 5MB for data visualization
  default: 100 * 1024, // 100KB default
};

// Protected API routes that require stricter security
const PROTECTED_ROUTES = [
  '/api/chat',
  '/api/image-generate',
  '/api/research-paper',
  '/api/essay-write',
  '/api/thesis-generate',
  '/api/code-generate',
  '/api/data-processor',
  '/api/data-viz',
];

// Admin routes that require authentication
const ADMIN_ROUTES = [
  '/api/admin',
  '/api/metrics',
  '/api/health',
];

/**
 * Extract client IP address from request headers
 */
function getClientIP(request: NextRequest): string {
  // Priority order: Cloudflare -> X-Forwarded-For -> X-Real-IP -> Vercel
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;

  const vercelIP = request.headers.get('x-vercel-forwarded-for');
  if (vercelIP) return vercelIP.split(',')[0].trim();

  return 'unknown';
}

/**
 * Generate browser fingerprint from request headers
 */
function getBrowserFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLang = request.headers.get('accept-language') || '';
  const acceptEnc = request.headers.get('accept-encoding') || '';
  const secChUa = request.headers.get('sec-ch-ua') || '';
  const secChUaPlatform = request.headers.get('sec-ch-ua-platform') || '';

  const fingerprintString = `${userAgent}|${acceptLang}|${acceptEnc}|${secChUa}|${secChUaPlatform}`;
  return Buffer.from(fingerprintString).toString('base64').slice(0, 40);
}

/**
 * Check if request looks suspicious (basic bot detection)
 */
function isSuspiciousRequest(request: NextRequest): { suspicious: boolean; reason?: string } {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = getClientIP(request);

  // Missing or suspicious user agent
  if (!userAgent || userAgent.length < 10) {
    return { suspicious: true, reason: 'Missing or invalid user agent' };
  }

  // Known bot patterns (basic check)
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /postman/i,
  ];

  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return { suspicious: true, reason: 'Bot-like user agent detected' };
  }

  // Missing critical headers that browsers always send
  const requiredHeaders = ['accept', 'accept-language', 'accept-encoding'];
  for (const header of requiredHeaders) {
    if (!request.headers.get(header)) {
      return { suspicious: true, reason: `Missing required header: ${header}` };
    }
  }

  return { suspicious: false };
}

/**
 * Validate Content-Type header for POST requests
 */
function validateContentType(request: NextRequest): boolean {
  if (request.method !== 'POST' && request.method !== 'PUT' && request.method !== 'PATCH') {
    return true; // Not applicable for GET/DELETE
  }

  const contentType = request.headers.get('content-type');
  if (!contentType) {
    return false;
  }

  // Allow JSON and form data
  const allowedTypes = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
  ];

  return allowedTypes.some(type => contentType.toLowerCase().includes(type));
}

/**
 * Get maximum allowed body size for endpoint
 */
function getMaxBodySize(pathname: string): number {
  for (const [route, size] of Object.entries(MAX_BODY_SIZES)) {
    if (route !== 'default' && pathname.startsWith(route)) {
      return size;
    }
  }
  return MAX_BODY_SIZES.default;
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get client information
  const ip = getClientIP(request);
  const fingerprint = getBrowserFingerprint(request);
  const timestamp = new Date().toISOString();

  // Add security headers to response
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add custom headers for downstream processing
  response.headers.set('X-Client-IP', ip);
  response.headers.set('X-Client-Fingerprint', fingerprint);
  response.headers.set('X-Request-Time', timestamp);

  // API route protection
  if (pathname.startsWith('/api/')) {
    // Validate HTTP method
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
    if (!allowedMethods.includes(request.method)) {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405, headers: Object.fromEntries(Object.entries(securityHeaders)) }
      );
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Content-Type validation for POST/PUT/PATCH
    if (!validateContentType(request)) {
      console.warn(`[Security] Invalid Content-Type from IP: ${ip}`);
      return NextResponse.json(
        { error: 'Invalid Content-Type header' },
        { status: 415, headers: Object.fromEntries(Object.entries(securityHeaders)) }
      );
    }

    // Basic bot detection for protected routes
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      const { suspicious, reason } = isSuspiciousRequest(request);
      if (suspicious) {
        console.warn(`[Security] Suspicious request detected: ${reason} | IP: ${ip} | Path: ${pathname}`);

        // Log but don't block (to avoid false positives)
        // In production, you might want to add CAPTCHA challenge here
      }
    }

    // Request size validation (estimate based on headers)
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const maxSize = getMaxBodySize(pathname);
      const bodySize = parseInt(contentLength, 10);

      if (bodySize > maxSize) {
        console.warn(`[Security] Request size exceeded: ${bodySize} bytes (max: ${maxSize}) | IP: ${ip} | Path: ${pathname}`);
        return NextResponse.json(
          {
            error: 'Request too large',
            maxSize: `${Math.round(maxSize / 1024)}KB`,
            receivedSize: `${Math.round(bodySize / 1024)}KB`
          },
          { status: 413, headers: Object.fromEntries(Object.entries(securityHeaders)) }
        );
      }
    }
  }

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
