/**
 * Schema Markup Generators
 *
 * Factory functions to generate various types of Schema.org JSON-LD markup
 * with proper structure and validation.
 */

import {
  WebPageSchema,
  ArticleSchema,
  FAQPageSchema,
  OrganizationSchema,
  BreadcrumbListSchema,
  SoftwareApplicationSchema,
  HowToSchema,
  PersonSchema,
  ProductSchema,
  FAQItem,
  HowToStep,
  BreadcrumbItem,
} from './types';

// ============================================================================
// Organization Schema (Site-wide)
// ============================================================================

export function generateOrganizationSchema(config: {
  name: string;
  url: string;
  logo: string;
  description?: string;
  socialProfiles?: string[];
  contactEmail?: string;
  contactPhone?: string;
}): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.name,
    url: config.url,
    logo: {
      '@type': 'ImageObject',
      url: config.logo,
      width: 600,
      height: 60,
    },
    description: config.description,
    sameAs: config.socialProfiles,
    contactPoint: config.contactEmail || config.contactPhone
      ? [
          {
            '@type': 'ContactPoint',
            telephone: config.contactPhone || '',
            contactType: 'customer support',
            email: config.contactEmail,
            availableLanguage: ['English', 'Tagalog'],
          },
        ]
      : undefined,
  };
}

// ============================================================================
// WebPage Schema (Default for all pages)
// ============================================================================

export function generateWebPageSchema(config: {
  name: string;
  description: string;
  url: string;
  siteName: string;
  siteUrl: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  breadcrumbs?: BreadcrumbItem[];
}): WebPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: config.name,
    description: config.description,
    url: config.url,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: config.siteName,
      url: config.siteUrl,
    },
    datePublished: config.datePublished,
    dateModified: config.dateModified,
    author: config.author
      ? {
          '@type': 'Person',
          name: config.author,
        }
      : undefined,
    breadcrumb: config.breadcrumbs
      ? generateBreadcrumbSchema(config.breadcrumbs)
      : undefined,
  };
}

// ============================================================================
// Article Schema (Blog posts, guides, tutorials)
// ============================================================================

export function generateArticleSchema(config: {
  headline: string;
  description: string;
  url: string;
  image?: string | string[];
  authorName: string;
  authorUrl?: string;
  publisherName: string;
  publisherUrl?: string;
  publisherLogo: string;
  datePublished: string;
  dateModified?: string;
  section?: string;
  keywords?: string[];
  wordCount?: number;
}): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: config.headline,
    description: config.description,
    image: config.image,
    author: {
      '@type': 'Person',
      name: config.authorName,
      url: config.authorUrl,
    },
    publisher: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: config.publisherName,
      url: config.publisherUrl || config.url,
      logo: {
        '@type': 'ImageObject',
        url: config.publisherLogo,
      },
    },
    datePublished: config.datePublished,
    dateModified: config.dateModified || config.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': config.url,
    },
    articleSection: config.section,
    keywords: config.keywords,
    wordCount: config.wordCount,
  };
}

// ============================================================================
// FAQ Page Schema (For pages with Q&A content)
// ============================================================================

export function generateFAQPageSchema(
  faqs: Array<{ question: string; answer: string }>
): FAQPageSchema {
  const faqItems: FAQItem[] = faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  };
}

// ============================================================================
// Breadcrumb Schema (Navigation breadcrumbs)
// ============================================================================

export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url?: string }>
): BreadcrumbListSchema {
  const items: BreadcrumbItem[] = breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.url,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

// ============================================================================
// Software Application Schema (For tool pages)
// ============================================================================

export function generateSoftwareApplicationSchema(config: {
  name: string;
  description: string;
  url: string;
  category: string;
  operatingSystem?: string;
  price?: string;
  priceCurrency?: string;
  ratingValue?: number;
  reviewCount?: number;
  screenshot?: string | string[];
}): SoftwareApplicationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: config.name,
    description: config.description,
    applicationCategory: config.category,
    operatingSystem: config.operatingSystem || 'Any',
    offers: {
      '@type': 'Offer',
      price: config.price || '0',
      priceCurrency: config.priceCurrency || 'USD',
    },
    aggregateRating:
      config.ratingValue && config.reviewCount
        ? {
            '@type': 'AggregateRating',
            ratingValue: config.ratingValue,
            reviewCount: config.reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    screenshot: config.screenshot,
  };
}

// ============================================================================
// HowTo Schema (For tutorial/guide pages)
// ============================================================================

export function generateHowToSchema(config: {
  name: string;
  description: string;
  image?: string | string[];
  totalTime?: string;
  estimatedCost?: { currency: string; value: string };
  steps: Array<{
    name: string;
    text: string;
    url?: string;
    image?: string;
  }>;
  tools?: string[];
  supplies?: string[];
}): HowToSchema {
  const steps: HowToStep[] = config.steps.map((step) => ({
    '@type': 'HowToStep',
    name: step.name,
    text: step.text,
    url: step.url,
    image: step.image,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: config.name,
    description: config.description,
    image: config.image,
    totalTime: config.totalTime,
    estimatedCost: config.estimatedCost
      ? {
          '@type': 'MonetaryAmount',
          currency: config.estimatedCost.currency,
          value: config.estimatedCost.value,
        }
      : undefined,
    step: steps,
    tool: config.tools,
    supply: config.supplies,
  };
}

// ============================================================================
// Product Schema (For product pages)
// ============================================================================

export function generateProductSchema(config: {
  name: string;
  description: string;
  image?: string | string[];
  brandName?: string;
  price?: string;
  priceCurrency?: string;
  availability?: string;
  url?: string;
  ratingValue?: number;
  reviewCount?: number;
}): ProductSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: config.name,
    description: config.description,
    image: config.image,
    brand: config.brandName
      ? {
          '@type': 'Brand',
          name: config.brandName,
        }
      : undefined,
    offers: config.price
      ? {
          '@type': 'Offer',
          price: config.price,
          priceCurrency: config.priceCurrency || 'USD',
          availability: config.availability || 'https://schema.org/InStock',
          url: config.url,
        }
      : undefined,
    aggregateRating:
      config.ratingValue && config.reviewCount
        ? {
            '@type': 'AggregateRating',
            ratingValue: config.ratingValue,
            reviewCount: config.reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };
}

// ============================================================================
// Person Schema (For author pages)
// ============================================================================

export function generatePersonSchema(config: {
  name: string;
  url?: string;
  image?: string;
  jobTitle?: string;
  organization?: string;
  organizationUrl?: string;
  socialProfiles?: string[];
}): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: config.name,
    url: config.url,
    image: config.image,
    sameAs: config.socialProfiles,
    jobTitle: config.jobTitle,
    worksFor: config.organization
      ? {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: config.organization,
          url: config.organizationUrl || config.url || '',
        }
      : undefined,
  };
}

// ============================================================================
// Helper: Combine multiple schemas
// ============================================================================

export function combineSchemas(schemas: any[]): string {
  // If single schema, return as object
  if (schemas.length === 1) {
    return JSON.stringify(schemas[0], null, 0);
  }

  // If multiple schemas, return as graph
  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': schemas,
    },
    null,
    0
  );
}

// ============================================================================
// Helper: Extract FAQs from page content
// ============================================================================

export function extractFAQsFromContent(content: string): Array<{
  question: string;
  answer: string;
}> {
  const faqs: Array<{ question: string; answer: string }> = [];

  // Simple pattern matching for common FAQ formats
  // This is a basic implementation - you might want to enhance it
  const faqPattern = /<details[^>]*>[\s\S]*?<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi;
  const matches = content.matchAll(faqPattern);

  for (const match of matches) {
    const question = match[1].replace(/<[^>]*>/g, '').trim();
    const answer = match[2].replace(/<[^>]*>/g, '').trim();

    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  return faqs;
}
