/**
 * SEO Validation Rules using Zod
 *
 * Comprehensive validation for all SEO metadata with
 * best practice recommendations and scoring.
 */

import { z } from 'zod';
import {
  SEOValidationResult,
  SEOValidationError,
  SEOValidationWarning,
} from './types';

// ============================================================================
// Zod Schemas
// ============================================================================

export const RobotsConfigSchema = z.object({
  index: z.boolean().optional(),
  follow: z.boolean().optional(),
  noarchive: z.boolean().optional(),
  nosnippet: z.boolean().optional(),
  noimageindex: z.boolean().optional(),
  maxSnippet: z.number().int().min(-1).max(320).optional(),
  maxImagePreview: z.enum(['none', 'standard', 'large']).optional(),
  maxVideoPreview: z.number().int().min(-1).max(3600).optional(),
});

export const OpenGraphImageSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  secureUrl: z.string().url().optional(),
  type: z.string().optional(),
  width: z.number().int().min(200).max(2000).optional(),
  height: z.number().int().min(200).max(2000).optional(),
  alt: z.string().max(420).optional(),
});

export const OpenGraphMetadataSchema = z.object({
  type: z.enum([
    'website',
    'article',
    'profile',
    'book',
    'video.movie',
    'video.episode',
    'video.tv_show',
    'video.other',
  ]),
  title: z
    .string()
    .min(10, 'OG title should be at least 10 characters')
    .max(95, 'OG title should not exceed 95 characters'),
  description: z
    .string()
    .min(50, 'OG description should be at least 50 characters')
    .max(300, 'OG description should not exceed 300 characters'),
  url: z.string().url('Must be a valid URL'),
  siteName: z.string().min(1),
  locale: z.string().regex(/^[a-z]{2}_[A-Z]{2}$/).optional(),
  images: z.array(OpenGraphImageSchema).min(1, 'At least one OG image required').optional(),
});

export const TwitterMetadataSchema = z.object({
  card: z.enum(['summary', 'summary_large_image', 'app', 'player']),
  site: z.string().regex(/^@[A-Za-z0-9_]{1,15}$/).optional(),
  creator: z.string().regex(/^@[A-Za-z0-9_]{1,15}$/).optional(),
  title: z.string().max(70, 'Twitter title should not exceed 70 characters').optional(),
  description: z
    .string()
    .max(200, 'Twitter description should not exceed 200 characters')
    .optional(),
});

export const SEOMetadataSchema = z.object({
  title: z
    .string()
    .min(30, 'Title should be at least 30 characters for SEO')
    .max(60, 'Title should not exceed 60 characters to avoid truncation'),
  description: z
    .string()
    .min(120, 'Meta description should be at least 120 characters')
    .max(160, 'Meta description should not exceed 160 characters'),
  keywords: z
    .array(z.string())
    .max(10, 'Maximum 10 keywords recommended')
    .optional(),
  robots: RobotsConfigSchema.optional(),
  canonical: z.string().url('Canonical URL must be valid').optional(),
  openGraph: OpenGraphMetadataSchema.optional(),
  twitter: TwitterMetadataSchema.optional(),
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates SEO metadata and provides comprehensive feedback
 */
export function validateSEOMetadata(data: any): SEOValidationResult {
  const errors: SEOValidationError[] = [];
  const warnings: SEOValidationWarning[] = [];
  let score = 100;

  try {
    // Run Zod validation
    SEOMetadataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError<any>;
      zodError.issues.forEach((err) => {
        errors.push({
          field: err.path.join('.'),
          message: err.message,
          severity: 'error',
        });
        score -= 10;
      });
    }
  }

  // Advanced validation checks
  if (data.title) {
    // Check for title optimization
    if (data.title.length < 40) {
      warnings.push({
        field: 'title',
        message: 'Title is short',
        recommendation:
          'Titles between 50-60 characters perform better in search results',
      });
      score -= 3;
    }

    // Check for keyword stuffing
    const words = data.title.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length - uniqueWords.size > 2) {
      warnings.push({
        field: 'title',
        message: 'Potential keyword stuffing detected',
        recommendation:
          'Avoid repeating the same words too many times in the title',
      });
      score -= 5;
    }

    // Check for power words
    const powerWords = [
      'free',
      'best',
      'ultimate',
      'guide',
      'complete',
      'proven',
      'easy',
      'simple',
    ];
    const hasPowerWord = powerWords.some((word) =>
      data.title.toLowerCase().includes(word)
    );
    if (!hasPowerWord) {
      warnings.push({
        field: 'title',
        message: 'Title could be more compelling',
        recommendation:
          'Consider adding power words like "Free", "Best", "Ultimate", or "Complete"',
      });
      score -= 2;
    }
  }

  if (data.description) {
    // Check for call-to-action
    const ctaWords = [
      'learn',
      'discover',
      'get',
      'try',
      'start',
      'find',
      'explore',
      'download',
    ];
    const hasCTA = ctaWords.some((word) =>
      data.description.toLowerCase().includes(word)
    );
    if (!hasCTA) {
      warnings.push({
        field: 'description',
        message: 'Description lacks a call-to-action',
        recommendation:
          'Include action verbs like "Learn", "Discover", "Get", or "Try"',
      });
      score -= 3;
    }

    // Check for optimal length
    if (data.description.length > 155) {
      warnings.push({
        field: 'description',
        message: 'Description may be truncated',
        recommendation:
          'Keep descriptions under 155 characters to avoid truncation in search results',
      });
      score -= 2;
    }
  }

  // Check Open Graph
  if (!data.openGraph) {
    warnings.push({
      field: 'openGraph',
      message: 'Missing Open Graph metadata',
      recommendation:
        'Add Open Graph tags to control how your page appears when shared on social media',
    });
    score -= 5;
  } else {
    if (!data.openGraph.images || data.openGraph.images.length === 0) {
      warnings.push({
        field: 'openGraph.images',
        message: 'No Open Graph image specified',
        recommendation:
          'Add an Open Graph image (1200x630px recommended) for better social sharing',
      });
      score -= 5;
    }
  }

  // Check Twitter Cards
  if (!data.twitter) {
    warnings.push({
      field: 'twitter',
      message: 'Missing Twitter Card metadata',
      recommendation:
        'Add Twitter Card tags to optimize how your page appears on Twitter',
    });
    score -= 3;
  }

  // Check canonical URL
  if (!data.canonical) {
    warnings.push({
      field: 'canonical',
      message: 'No canonical URL specified',
      recommendation:
        'Add a canonical URL to prevent duplicate content issues',
    });
    score -= 5;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

/**
 * Validates schema markup structure
 */
export function validateSchemaMarkup(schema: any): SEOValidationResult {
  const errors: SEOValidationError[] = [];
  const warnings: SEOValidationWarning[] = [];
  let score = 100;

  // Check required fields
  if (!schema['@context']) {
    errors.push({
      field: '@context',
      message: '@context is required and should be "https://schema.org"',
      severity: 'critical',
    });
    score -= 20;
  }

  if (!schema['@type']) {
    errors.push({
      field: '@type',
      message: '@type is required',
      severity: 'critical',
    });
    score -= 20;
  }

  // Type-specific validation
  if (schema['@type'] === 'Article') {
    const requiredFields = ['headline', 'author', 'datePublished', 'publisher'];
    requiredFields.forEach((field) => {
      if (!schema[field]) {
        errors.push({
          field,
          message: `${field} is required for Article schema`,
          severity: 'error',
        });
        score -= 10;
      }
    });

    if (!schema.image || (Array.isArray(schema.image) && schema.image.length === 0)) {
      warnings.push({
        field: 'image',
        message: 'Article schema should include an image',
        recommendation: 'Add at least one image to improve rich results eligibility',
      });
      score -= 5;
    }
  }

  if (schema['@type'] === 'Organization') {
    if (!schema.logo) {
      warnings.push({
        field: 'logo',
        message: 'Organization schema should include a logo',
        recommendation: 'Add a logo URL to display in Knowledge Graph',
      });
      score -= 5;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, Math.min(100, score)),
  };
}

/**
 * Calculates an overall SEO health score
 */
export function calculateSEOScore(metadata: any, schemas: any[] = []): number {
  const metadataResult = validateSEOMetadata(metadata);
  let totalScore = metadataResult.score;

  // Bonus for having schema markup
  if (schemas.length > 0) {
    totalScore += 5;
    schemas.forEach((schema) => {
      const schemaResult = validateSchemaMarkup(schema);
      totalScore += schemaResult.score * 0.1; // Schema contributes 10% weight
    });
  }

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, totalScore));
}

/**
 * Provides SEO recommendations based on page type
 */
export function getSEORecommendations(
  pageType: string,
  currentMetadata: any
): string[] {
  const recommendations: string[] = [];

  switch (pageType) {
    case 'tool':
      recommendations.push('Add SoftwareApplication schema markup');
      recommendations.push('Include features and benefits in the description');
      recommendations.push('Add screenshot images for better previews');
      if (!currentMetadata.openGraph?.images) {
        recommendations.push('Add tool preview image for social sharing');
      }
      break;

    case 'article':
      recommendations.push('Add Article schema with author and publish date');
      recommendations.push('Include target keywords naturally in title and description');
      recommendations.push('Add FAQ schema if article includes Q&A content');
      if (!currentMetadata.keywords || currentMetadata.keywords.length < 3) {
        recommendations.push('Add 5-8 relevant keywords');
      }
      break;

    case 'faq':
      recommendations.push('Add FAQPage schema for rich results');
      recommendations.push('Structure title as a question when possible');
      recommendations.push('Make description answer the main question');
      break;

    case 'landing':
      recommendations.push('Focus title on primary conversion goal');
      recommendations.push('Include strong call-to-action in description');
      recommendations.push('Add Product or Service schema if applicable');
      break;

    case 'home':
      recommendations.push('Add Organization schema with complete info');
      recommendations.push('Include brand name in title');
      recommendations.push('Add sitelinks search box schema');
      break;

    default:
      recommendations.push('Ensure title includes target keyword');
      recommendations.push('Write compelling meta description with CTA');
      recommendations.push('Add appropriate schema markup for page type');
  }

  return recommendations;
}
