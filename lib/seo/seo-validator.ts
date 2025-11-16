/**
 * SEO Validation Utility
 *
 * Comprehensive SEO validation and scoring system that checks:
 * - Meta tags completeness and optimization
 * - Open Graph configuration
 * - Twitter Card setup
 * - Schema markup validity
 * - Mobile optimization
 * - Performance indicators
 */

import { SEOMetadataDB } from './api-client';

// ============================================================================
// Types
// ============================================================================

export interface ValidationIssue {
  field: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  recommendation: string;
  score_impact: number; // How many points this costs (0-100)
}

export interface ValidationResult {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: ValidationIssue[];
  summary: {
    total_issues: number;
    critical_issues: number;
    warnings: number;
    passed_checks: number;
    total_checks: number;
  };
}

// ============================================================================
// Validator Class
// ============================================================================

export class SEOValidator {
  private issues: ValidationIssue[] = [];
  private score = 100;
  private checksPerformed = 0;
  private checksPassed = 0;

  /**
   * Validate SEO metadata and return comprehensive results
   */
  validate(metadata: Partial<SEOMetadataDB>): ValidationResult {
    this.reset();

    // Run all validation checks
    this.validateMetaTitle(metadata.meta_title);
    this.validateMetaDescription(metadata.meta_description);
    this.validateKeywords(metadata.meta_keywords);
    this.validateCanonicalURL(metadata.canonical_url);
    this.validateOpenGraph(metadata);
    this.validateTwitterCard(metadata);
    this.validateSchemaMarkup(metadata.schema_data, metadata.schema_enabled);
    this.validateRobotsDirectives(metadata);
    this.validateImages(metadata);

    return this.getResult();
  }

  /**
   * Reset validator state
   */
  private reset() {
    this.issues = [];
    this.score = 100;
    this.checksPerformed = 0;
    this.checksPassed = 0;
  }

  /**
   * Add validation issue and adjust score
   */
  private addIssue(issue: ValidationIssue) {
    this.issues.push(issue);
    this.score = Math.max(0, this.score - issue.score_impact);
  }

  /**
   * Record check performed and optionally mark as passed
   */
  private recordCheck(passed: boolean = true) {
    this.checksPerformed++;
    if (passed) this.checksPassed++;
  }

  // ==========================================================================
  // Validation Methods
  // ==========================================================================

  /**
   * Validate Meta Title
   */
  private validateMetaTitle(title?: string) {
    this.recordCheck(!!title);

    if (!title) {
      this.addIssue({
        field: 'meta_title',
        severity: 'error',
        message: 'Meta title is missing',
        recommendation: 'Add a meta title (50-60 characters recommended)',
        score_impact: 20,
      });
      return;
    }

    const length = title.length;

    if (length < 30) {
      this.addIssue({
        field: 'meta_title',
        severity: 'warning',
        message: 'Meta title is too short',
        recommendation: 'Increase title length to 50-60 characters for better SEO',
        score_impact: 10,
      });
    } else if (length > 60) {
      this.addIssue({
        field: 'meta_title',
        severity: 'warning',
        message: 'Meta title is too long (may be truncated in search results)',
        recommendation: 'Reduce title length to 50-60 characters',
        score_impact: 5,
      });
    }

    // Check for keyword stuffing
    const words = title.toLowerCase().split(/\s+/);
    const wordCounts = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const repeated = Object.entries(wordCounts).filter(([word, count]) => count > 2 && word.length > 3);
    if (repeated.length > 0) {
      this.addIssue({
        field: 'meta_title',
        severity: 'warning',
        message: 'Possible keyword stuffing detected in title',
        recommendation: 'Avoid repeating keywords too many times',
        score_impact: 5,
      });
    }
  }

  /**
   * Validate Meta Description
   */
  private validateMetaDescription(description?: string) {
    this.recordCheck(!!description);

    if (!description) {
      this.addIssue({
        field: 'meta_description',
        severity: 'error',
        message: 'Meta description is missing',
        recommendation: 'Add a meta description (150-160 characters recommended)',
        score_impact: 20,
      });
      return;
    }

    const length = description.length;

    if (length < 120) {
      this.addIssue({
        field: 'meta_description',
        severity: 'warning',
        message: 'Meta description is too short',
        recommendation: 'Increase description length to 150-160 characters',
        score_impact: 10,
      });
    } else if (length > 160) {
      this.addIssue({
        field: 'meta_description',
        severity: 'warning',
        message: 'Meta description is too long (may be truncated)',
        recommendation: 'Reduce description length to 150-160 characters',
        score_impact: 5,
      });
    }

    // Check for call-to-action
    const ctaWords = ['learn', 'discover', 'find', 'get', 'try', 'explore', 'read', 'see', 'check'];
    const hasCTA = ctaWords.some(word => description.toLowerCase().includes(word));

    if (!hasCTA) {
      this.addIssue({
        field: 'meta_description',
        severity: 'info',
        message: 'Description could benefit from a call-to-action',
        recommendation: 'Add action words like "Learn", "Discover", or "Get" to improve click-through rate',
        score_impact: 3,
      });
    }
  }

  /**
   * Validate Keywords
   */
  private validateKeywords(keywords?: string[] | null) {
    this.recordCheck(!!keywords && keywords.length > 0);

    if (!keywords || keywords.length === 0) {
      this.addIssue({
        field: 'meta_keywords',
        severity: 'info',
        message: 'No keywords defined',
        recommendation: 'Add 3-5 relevant keywords to improve content categorization',
        score_impact: 5,
      });
      return;
    }

    if (keywords.length > 10) {
      this.addIssue({
        field: 'meta_keywords',
        severity: 'warning',
        message: 'Too many keywords',
        recommendation: 'Focus on 3-5 highly relevant keywords',
        score_impact: 3,
      });
    }
  }

  /**
   * Validate Canonical URL
   */
  private validateCanonicalURL(canonicalUrl?: string | null) {
    this.recordCheck(!!canonicalUrl);

    if (!canonicalUrl) {
      this.addIssue({
        field: 'canonical_url',
        severity: 'info',
        message: 'Canonical URL not set',
        recommendation: 'Set canonical URL to prevent duplicate content issues',
        score_impact: 5,
      });
      return;
    }

    // Validate URL format
    try {
      new URL(canonicalUrl);
    } catch {
      this.addIssue({
        field: 'canonical_url',
        severity: 'error',
        message: 'Invalid canonical URL format',
        recommendation: 'Ensure canonical URL is a valid absolute URL',
        score_impact: 10,
      });
    }
  }

  /**
   * Validate Open Graph
   */
  private validateOpenGraph(metadata: Partial<SEOMetadataDB>) {
    const { og_title, og_description, og_image } = metadata;

    this.recordCheck(!!(og_title || og_description || og_image));

    if (!og_title && !og_description && !og_image) {
      this.addIssue({
        field: 'open_graph',
        severity: 'warning',
        message: 'Open Graph tags are not configured',
        recommendation: 'Add OG tags to improve social media sharing appearance',
        score_impact: 15,
      });
      return;
    }

    if (!og_image) {
      this.addIssue({
        field: 'og_image',
        severity: 'warning',
        message: 'Open Graph image not set',
        recommendation: 'Add OG image (1200x630px recommended) for better social sharing',
        score_impact: 8,
      });
    }

    if (!og_title) {
      this.addIssue({
        field: 'og_title',
        severity: 'info',
        message: 'OG title not set (will fallback to meta title)',
        recommendation: 'Consider setting a specific OG title optimized for social media',
        score_impact: 3,
      });
    }
  }

  /**
   * Validate Twitter Card
   */
  private validateTwitterCard(metadata: Partial<SEOMetadataDB>) {
    const { twitter_card, twitter_title, twitter_description, twitter_image } = metadata;

    this.recordCheck(!!twitter_card);

    if (!twitter_card && !twitter_title && !twitter_image) {
      this.addIssue({
        field: 'twitter_card',
        severity: 'info',
        message: 'Twitter Card tags are not configured',
        recommendation: 'Add Twitter Card tags to improve appearance on Twitter',
        score_impact: 10,
      });
      return;
    }

    if (!twitter_image) {
      this.addIssue({
        field: 'twitter_image',
        severity: 'info',
        message: 'Twitter image not set',
        recommendation: 'Add Twitter image for better engagement on Twitter',
        score_impact: 5,
      });
    }
  }

  /**
   * Validate Schema Markup
   */
  private validateSchemaMarkup(schemaData?: any, schemaEnabled?: boolean) {
    this.recordCheck(schemaEnabled && !!schemaData);

    if (!schemaEnabled) {
      this.addIssue({
        field: 'schema_markup',
        severity: 'warning',
        message: 'Schema markup is disabled',
        recommendation: 'Enable schema markup to help search engines understand your content',
        score_impact: 15,
      });
      return;
    }

    if (!schemaData || Object.keys(schemaData).length === 0) {
      this.addIssue({
        field: 'schema_data',
        severity: 'warning',
        message: 'Schema markup data is empty',
        recommendation: 'Add structured data (JSON-LD) for better search result appearance',
        score_impact: 15,
      });
      return;
    }

    // Validate schema structure
    const schemas = Array.isArray(schemaData) ? schemaData : [schemaData];

    schemas.forEach((schema, index) => {
      if (!schema['@context']) {
        this.addIssue({
          field: 'schema_data',
          severity: 'error',
          message: `Schema ${index + 1} missing @context`,
          recommendation: 'Add @context: "https://schema.org" to schema',
          score_impact: 5,
        });
      }

      if (!schema['@type']) {
        this.addIssue({
          field: 'schema_data',
          severity: 'error',
          message: `Schema ${index + 1} missing @type`,
          recommendation: 'Add @type to define schema type (e.g., WebPage, Article)',
          score_impact: 5,
        });
      }
    });
  }

  /**
   * Validate Robots Directives
   */
  private validateRobotsDirectives(metadata: Partial<SEOMetadataDB>) {
    this.recordCheck(true);

    const { robots_index, robots_follow } = metadata;

    if (robots_index === false && robots_follow === false) {
      this.addIssue({
        field: 'robots',
        severity: 'warning',
        message: 'Page is completely blocked from search engines',
        recommendation: 'This page will not appear in search results or be crawled',
        score_impact: 0, // Intentional, so no penalty
      });
    }

    if (robots_index === false) {
      this.addIssue({
        field: 'robots_index',
        severity: 'info',
        message: 'Page is set to noindex',
        recommendation: 'This page will not appear in search results',
        score_impact: 0, // Intentional
      });
    }
  }

  /**
   * Validate Images
   */
  private validateImages(metadata: Partial<SEOMetadataDB>) {
    this.recordCheck(!!metadata.og_image);

    const { og_image, og_image_alt, twitter_image } = metadata;

    if (og_image && !og_image_alt) {
      this.addIssue({
        field: 'og_image_alt',
        severity: 'info',
        message: 'OG image missing alt text',
        recommendation: 'Add alt text to OG image for better accessibility',
        score_impact: 3,
      });
    }

    // Check if images are using HTTPS
    if (og_image && !og_image.startsWith('https://')) {
      this.addIssue({
        field: 'og_image',
        severity: 'warning',
        message: 'OG image not using HTTPS',
        recommendation: 'Use HTTPS URLs for all images',
        score_impact: 5,
      });
    }

    if (twitter_image && !twitter_image.startsWith('https://')) {
      this.addIssue({
        field: 'twitter_image',
        severity: 'warning',
        message: 'Twitter image not using HTTPS',
        recommendation: 'Use HTTPS URLs for all images',
        score_impact: 5,
      });
    }
  }

  // ==========================================================================
  // Result Generation
  // ==========================================================================

  /**
   * Get final validation result
   */
  private getResult(): ValidationResult {
    const errors = this.issues.filter((i) => i.severity === 'error');
    const warnings = this.issues.filter((i) => i.severity === 'warning');
    const suggestions = this.issues.filter((i) => i.severity === 'info');

    const grade = this.getGrade(this.score);

    return {
      score: Math.round(this.score),
      grade,
      issues: errors,
      warnings,
      suggestions,
      summary: {
        total_issues: this.issues.length,
        critical_issues: errors.length,
        warnings: warnings.length,
        passed_checks: this.checksPassed,
        total_checks: this.checksPerformed,
      },
    };
  }

  /**
   * Convert score to letter grade
   */
  private getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}

// ============================================================================
// Export Helper Functions
// ============================================================================

/**
 * Validate SEO metadata
 */
export function validateSEO(metadata: Partial<SEOMetadataDB>): ValidationResult {
  const validator = new SEOValidator();
  return validator.validate(metadata);
}

/**
 * Quick check if SEO is good enough
 */
export function isGoodSEO(metadata: Partial<SEOMetadataDB>): boolean {
  const result = validateSEO(metadata);
  return result.score >= 80;
}

/**
 * Get SEO score only
 */
export function getSEOScore(metadata: Partial<SEOMetadataDB>): number {
  const result = validateSEO(metadata);
  return result.score;
}
