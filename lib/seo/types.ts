/**
 * SEO Meta Management System - TypeScript Types
 *
 * Complete type definitions for all SEO metadata, schema markup,
 * and Open Graph properties used throughout the CMS.
 */

import { Metadata } from 'next';

// ============================================================================
// Core SEO Metadata Types
// ============================================================================

export interface SEOMetadata {
  // Basic Meta Tags
  title: string;
  description: string;
  keywords?: string[];

  // Robots Directives
  robots?: RobotsConfig;

  // Canonical & Alternates
  canonical?: string;
  alternates?: AlternateLinks[];

  // Open Graph
  openGraph?: OpenGraphMetadata;

  // Twitter Cards
  twitter?: TwitterMetadata;

  // Schema Markup
  schema?: SchemaMarkup[];

  // Additional Meta
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface RobotsConfig {
  index?: boolean;
  follow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
  maxSnippet?: number;
  maxImagePreview?: 'none' | 'standard' | 'large';
  maxVideoPreview?: number;
}

export interface AlternateLinks {
  hreflang: string;
  href: string;
}

// ============================================================================
// Open Graph Types
// ============================================================================

export interface OpenGraphMetadata {
  type: OpenGraphType;
  title: string;
  description: string;
  url: string;
  siteName: string;
  locale?: string;
  images?: OpenGraphImage[];
  videos?: OpenGraphVideo[];
  article?: OpenGraphArticle;
}

export type OpenGraphType =
  | 'website'
  | 'article'
  | 'profile'
  | 'book'
  | 'video.movie'
  | 'video.episode'
  | 'video.tv_show'
  | 'video.other';

export interface OpenGraphImage {
  url: string;
  secureUrl?: string;
  type?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface OpenGraphVideo {
  url: string;
  secureUrl?: string;
  type?: string;
  width?: number;
  height?: number;
}

export interface OpenGraphArticle {
  publishedTime?: string;
  modifiedTime?: string;
  expirationTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
}

// ============================================================================
// Twitter Card Types
// ============================================================================

export interface TwitterMetadata {
  card: TwitterCardType;
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  images?: TwitterImage[];
}

export type TwitterCardType =
  | 'summary'
  | 'summary_large_image'
  | 'app'
  | 'player';

export interface TwitterImage {
  url: string;
  alt?: string;
}

// ============================================================================
// Schema Markup Types
// ============================================================================

export type SchemaMarkup =
  | WebPageSchema
  | ArticleSchema
  | FAQPageSchema
  | OrganizationSchema
  | BreadcrumbListSchema
  | SoftwareApplicationSchema
  | HowToSchema
  | PersonSchema
  | ProductSchema
  | ReviewSchema;

export interface BaseSchema {
  '@context': 'https://schema.org';
  '@type': string;
}

export interface WebPageSchema extends BaseSchema {
  '@type': 'WebPage';
  name: string;
  description: string;
  url: string;
  inLanguage?: string;
  isPartOf?: {
    '@type': 'WebSite';
    name: string;
    url: string;
  };
  datePublished?: string;
  dateModified?: string;
  author?: PersonOrOrganization;
  breadcrumb?: BreadcrumbListSchema;
}

export interface ArticleSchema extends BaseSchema {
  '@type': 'Article' | 'BlogPosting' | 'NewsArticle';
  headline: string;
  description: string;
  image?: string | string[];
  author: PersonOrOrganization;
  publisher: OrganizationSchema;
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage?: {
    '@type': 'WebPage';
    '@id': string;
  };
  articleSection?: string;
  keywords?: string[];
  wordCount?: number;
}

export interface FAQPageSchema extends BaseSchema {
  '@type': 'FAQPage';
  mainEntity: FAQItem[];
}

export interface FAQItem {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
  };
}

export interface OrganizationSchema extends BaseSchema {
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: {
    '@type': 'ImageObject';
    url: string;
    width?: number;
    height?: number;
  };
  description?: string;
  sameAs?: string[];
  contactPoint?: ContactPoint[];
  address?: PostalAddress;
}

export interface ContactPoint {
  '@type': 'ContactPoint';
  telephone: string;
  contactType: string;
  email?: string;
  availableLanguage?: string[];
}

export interface PostalAddress {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

export interface BreadcrumbListSchema extends BaseSchema {
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

export interface SoftwareApplicationSchema extends BaseSchema {
  '@type': 'SoftwareApplication';
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem?: string;
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: AggregateRating;
  screenshot?: string | string[];
}

export interface HowToSchema extends BaseSchema {
  '@type': 'HowTo';
  name: string;
  description: string;
  image?: string | string[];
  totalTime?: string;
  estimatedCost?: {
    '@type': 'MonetaryAmount';
    currency: string;
    value: string;
  };
  step: HowToStep[];
  tool?: string[];
  supply?: string[];
}

export interface HowToStep {
  '@type': 'HowToStep';
  name: string;
  text: string;
  url?: string;
  image?: string;
}

export interface PersonSchema extends BaseSchema {
  '@type': 'Person';
  name: string;
  url?: string;
  image?: string;
  sameAs?: string[];
  jobTitle?: string;
  worksFor?: OrganizationSchema;
}

export interface ProductSchema extends BaseSchema {
  '@type': 'Product';
  name: string;
  description: string;
  image?: string | string[];
  brand?: {
    '@type': 'Brand';
    name: string;
  };
  offers?: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability: string;
    url?: string;
  };
  aggregateRating?: AggregateRating;
  review?: ReviewSchema[];
}

export interface ReviewSchema extends BaseSchema {
  '@type': 'Review';
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
  author: PersonOrOrganization;
  reviewBody?: string;
  datePublished?: string;
}

export interface AggregateRating {
  '@type': 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export type PersonOrOrganization = PersonSchema | OrganizationSchema | {
  '@type': 'Person' | 'Organization';
  name: string;
  url?: string;
};

// ============================================================================
// Database Models
// ============================================================================

export interface SEOConfigDB {
  id: string;
  page_path: string;
  page_type: PageType;

  // Meta Tags
  title: string;
  description: string;
  keywords?: string[];

  // Robots
  robots_index: boolean;
  robots_follow: boolean;
  robots_advanced?: RobotsConfig;

  // URLs
  canonical_url?: string;

  // Open Graph
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: OpenGraphType;

  // Twitter
  twitter_card?: TwitterCardType;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;

  // Schema
  schema_types?: string[];
  schema_data?: Record<string, any>;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  priority?: number;
}

export type PageType =
  | 'home'
  | 'tool'
  | 'article'
  | 'faq'
  | 'landing'
  | 'category'
  | 'product'
  | 'about'
  | 'contact'
  | 'custom';

// ============================================================================
// Generator Configuration
// ============================================================================

export interface SEOGeneratorConfig {
  siteName: string;
  siteUrl: string;
  defaultLocale: string;
  titleSuffix?: string;
  defaultImage: string;
  twitterHandle?: string;
  organizationSchema: OrganizationSchema;
}

export interface MetadataGeneratorOptions {
  pagePath: string;
  pageType: PageType;
  data?: Partial<SEOMetadata>;
  includeSchema?: boolean;
  includeOpenGraph?: boolean;
  includeTwitter?: boolean;
}

// ============================================================================
// Validation Schemas (for Zod)
// ============================================================================

export interface SEOValidationResult {
  valid: boolean;
  errors: SEOValidationError[];
  warnings: SEOValidationWarning[];
  score: number;
}

export interface SEOValidationError {
  field: string;
  message: string;
  severity: 'error' | 'critical';
}

export interface SEOValidationWarning {
  field: string;
  message: string;
  recommendation: string;
}

// ============================================================================
// Admin UI Types
// ============================================================================

export interface SEOFormData {
  // Basic Info
  pageType: PageType;
  pagePath: string;

  // Meta Tags
  title: string;
  description: string;
  keywords: string;

  // Robots
  indexPage: boolean;
  followLinks: boolean;

  // URLs
  canonicalUrl: string;

  // Open Graph
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: OpenGraphType;

  // Twitter
  twitterCard: TwitterCardType;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;

  // Schema
  enabledSchemas: string[];
  schemaData: Record<string, any>;
}

export interface SEOPreview {
  google: GooglePreview;
  facebook: FacebookPreview;
  twitter: TwitterPreview;
}

export interface GooglePreview {
  title: string;
  url: string;
  description: string;
  breadcrumbs?: string[];
}

export interface FacebookPreview {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
}

export interface TwitterPreview {
  card: TwitterCardType;
  title: string;
  description: string;
  image?: string;
  handle?: string;
}
