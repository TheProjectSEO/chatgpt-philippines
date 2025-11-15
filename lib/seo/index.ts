/**
 * SEO Library - Main Export File
 *
 * Central export point for all SEO-related utilities, generators,
 * and validation functions.
 */

// Metadata Generator
export {
  MetadataGenerator,
  getMetadataGenerator,
  generateToolMetadata,
  generateArticleMetadata,
  generateFAQMetadata,
} from './metadata-generator';

// Schema Generators
export {
  generateOrganizationSchema,
  generateWebPageSchema,
  generateArticleSchema,
  generateFAQPageSchema,
  generateBreadcrumbSchema,
  generateSoftwareApplicationSchema,
  generateHowToSchema,
  generateProductSchema,
  generatePersonSchema,
  combineSchemas,
  extractFAQsFromContent,
} from './schema-generators';

// Validation
export {
  validateSEOMetadata,
  validateSchemaMarkup,
  calculateSEOScore,
  getSEORecommendations,
  SEOMetadataSchema,
  OpenGraphMetadataSchema,
  TwitterMetadataSchema,
  RobotsConfigSchema,
} from './validation';

// Types
export type {
  SEOMetadata,
  RobotsConfig,
  OpenGraphMetadata,
  OpenGraphImage,
  TwitterMetadata,
  TwitterImage,
  SchemaMarkup,
  WebPageSchema,
  ArticleSchema,
  FAQPageSchema,
  OrganizationSchema,
  BreadcrumbListSchema,
  SoftwareApplicationSchema,
  HowToSchema,
  PersonSchema,
  ProductSchema,
  PageType,
  SEOGeneratorConfig,
  MetadataGeneratorOptions,
  SEOValidationResult,
  SEOFormData,
  SEOPreview,
} from './types';
