/**
 * Metadata Generator Utility
 *
 * Core utility class for generating Next.js Metadata objects
 * with complete SEO optimization including meta tags, Open Graph,
 * Twitter Cards, and Schema markup.
 */

import { Metadata } from 'next';
import {
  SEOMetadata,
  SEOGeneratorConfig,
  MetadataGeneratorOptions,
  PageType,
  OpenGraphImage,
  TwitterImage,
} from './types';
import {
  generateWebPageSchema,
  generateArticleSchema,
  generateFAQPageSchema,
  generateSoftwareApplicationSchema,
  generateOrganizationSchema,
  combineSchemas,
} from './schema-generators';

/**
 * MetadataGenerator - Main class for generating SEO metadata
 */
export class MetadataGenerator {
  private config: SEOGeneratorConfig;

  constructor(config: SEOGeneratorConfig) {
    this.config = config;
  }

  /**
   * Generate complete Next.js Metadata object
   */
  generate(options: MetadataGeneratorOptions): Metadata {
    const { pagePath, pageType, data, includeSchema = true } = options;

    const fullUrl = this.buildFullUrl(pagePath);
    const title = this.buildTitle(data?.title || '', pageType);
    const description = data?.description || this.getDefaultDescription(pageType);

    // Base metadata
    const metadata: Metadata = {
      metadataBase: new URL(this.config.siteUrl),
      title,
      description,
      keywords: data?.keywords,
      authors: data?.author ? [{ name: data.author }] : undefined,

      // Canonical URL
      alternates: {
        canonical: data?.canonical || fullUrl,
      },

      // Robots
      robots: this.buildRobots(data?.robots),

      // Open Graph
      openGraph: this.buildOpenGraph({
        title: data?.openGraph?.title || title,
        description: data?.openGraph?.description || description,
        url: fullUrl,
        type: data?.openGraph?.type || this.getDefaultOGType(pageType),
        images: data?.openGraph?.images || [
          {
            url: this.config.defaultImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),

      // Twitter Cards
      twitter: this.buildTwitter({
        card: data?.twitter?.card || 'summary_large_image',
        title: data?.twitter?.title || title,
        description: data?.twitter?.description || description,
        images: data?.twitter?.images || [{ url: this.config.defaultImage }],
      }),

      // Additional metadata
      ...(data?.publishedTime && {
        other: {
          'article:published_time': data.publishedTime,
          ...(data.modifiedTime && {
            'article:modified_time': data.modifiedTime,
          }),
        },
      }),
    };

    return metadata;
  }

  /**
   * Generate schema markup for a page
   */
  generateSchema(
    pageType: PageType,
    data: Partial<SEOMetadata> & Record<string, any>
  ): string {
    const schemas: any[] = [];

    // Always include Organization schema
    schemas.push(this.config.organizationSchema);

    // Add page-specific schemas
    switch (pageType) {
      case 'home':
        schemas.push(
          generateWebPageSchema({
            name: this.config.siteName,
            description: data.description || '',
            url: this.config.siteUrl,
            siteName: this.config.siteName,
            siteUrl: this.config.siteUrl,
          })
        );
        break;

      case 'tool':
        schemas.push(
          generateSoftwareApplicationSchema({
            name: data.title || '',
            description: data.description || '',
            url: data.canonical || '',
            category: 'WebApplication',
            price: '0',
            priceCurrency: 'USD',
            ratingValue: data.ratingValue,
            reviewCount: data.reviewCount,
          })
        );
        break;

      case 'article':
        schemas.push(
          generateArticleSchema({
            headline: data.title || '',
            description: data.description || '',
            url: data.canonical || '',
            image: data.image,
            authorName: data.author || this.config.siteName,
            publisherName: this.config.siteName,
            publisherLogo: this.config.defaultImage,
            datePublished: data.publishedTime || new Date().toISOString(),
            dateModified: data.modifiedTime,
            section: data.section,
            keywords: data.keywords,
            wordCount: data.wordCount,
          })
        );
        break;

      case 'faq':
        if (data.faqs && data.faqs.length > 0) {
          schemas.push(generateFAQPageSchema(data.faqs));
        }
        break;

      default:
        schemas.push(
          generateWebPageSchema({
            name: data.title || '',
            description: data.description || '',
            url: data.canonical || '',
            siteName: this.config.siteName,
            siteUrl: this.config.siteUrl,
            datePublished: data.publishedTime,
            dateModified: data.modifiedTime,
            author: data.author,
          })
        );
    }

    return combineSchemas(schemas);
  }

  /**
   * Build complete title with site suffix
   */
  private buildTitle(title: string, pageType: PageType): string {
    if (!title) {
      return this.config.siteName;
    }

    if (pageType === 'home') {
      return title;
    }

    const suffix = this.config.titleSuffix || this.config.siteName;
    return `${title} | ${suffix}`;
  }

  /**
   * Build full URL from path
   */
  private buildFullUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.config.siteUrl}${cleanPath}`;
  }

  /**
   * Build robots configuration
   */
  private buildRobots(robotsConfig?: any): Metadata['robots'] {
    const defaultRobots = {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    };

    if (!robotsConfig) {
      return defaultRobots;
    }

    return {
      index: robotsConfig.index !== false,
      follow: robotsConfig.follow !== false,
      noarchive: robotsConfig.noarchive,
      nosnippet: robotsConfig.nosnippet,
      noimageindex: robotsConfig.noimageindex,
      googleBot: {
        index: robotsConfig.index !== false,
        follow: robotsConfig.follow !== false,
        'max-video-preview': robotsConfig.maxVideoPreview || -1,
        'max-image-preview':
          robotsConfig.maxImagePreview || ('large' as const),
        'max-snippet': robotsConfig.maxSnippet || -1,
      },
    };
  }

  /**
   * Build Open Graph metadata
   */
  private buildOpenGraph(config: {
    title: string;
    description: string;
    url: string;
    type: any;
    images: OpenGraphImage[];
  }): Metadata['openGraph'] {
    return {
      type: config.type,
      title: config.title,
      description: config.description,
      url: config.url,
      siteName: this.config.siteName,
      locale: this.config.defaultLocale,
      images: config.images.map((img) => ({
        url: img.url,
        secureUrl: img.secureUrl,
        width: img.width || 1200,
        height: img.height || 630,
        alt: img.alt || config.title,
      })),
    };
  }

  /**
   * Build Twitter Card metadata
   */
  private buildTwitter(config: {
    card: any;
    title: string;
    description: string;
    images: TwitterImage[];
  }): Metadata['twitter'] {
    return {
      card: config.card,
      site: this.config.twitterHandle,
      creator: this.config.twitterHandle,
      title: config.title,
      description: config.description,
      images: config.images.map((img) => ({
        url: img.url,
        alt: img.alt || config.title,
      })),
    };
  }

  /**
   * Get default description based on page type
   */
  private getDefaultDescription(pageType: PageType): string {
    const descriptions: Record<PageType, string> = {
      home: `${this.config.siteName} - AI-powered tools and services`,
      tool: `Free AI tool powered by ${this.config.siteName}`,
      article: `Read this article on ${this.config.siteName}`,
      faq: `Frequently asked questions about ${this.config.siteName}`,
      landing: `Discover ${this.config.siteName}`,
      category: `Browse ${this.config.siteName} categories`,
      product: `Product information on ${this.config.siteName}`,
      about: `Learn more about ${this.config.siteName}`,
      contact: `Get in touch with ${this.config.siteName}`,
      custom: `${this.config.siteName}`,
    };

    return descriptions[pageType] || descriptions.custom;
  }

  /**
   * Get default Open Graph type based on page type
   */
  private getDefaultOGType(pageType: PageType): 'website' | 'article' {
    if (pageType === 'article') {
      return 'article';
    }
    return 'website';
  }
}

// ============================================================================
// Singleton Instance with Default Configuration
// ============================================================================

let defaultGenerator: MetadataGenerator | null = null;

export function getMetadataGenerator(
  config?: Partial<SEOGeneratorConfig>
): MetadataGenerator {
  if (!defaultGenerator) {
    const defaultConfig: SEOGeneratorConfig = {
      siteName: 'ChatGPT Philippines',
      siteUrl: 'https://chatgpt-philippines.com',
      defaultLocale: 'en_PH',
      titleSuffix: 'ChatGPT Philippines',
      defaultImage: 'https://chatgpt-philippines.com/og-image.png',
      twitterHandle: '@chatgptph',
      organizationSchema: generateOrganizationSchema({
        name: 'ChatGPT Philippines',
        url: 'https://chatgpt-philippines.com',
        logo: 'https://chatgpt-philippines.com/logo.png',
        description:
          'Free AI-powered tools for Filipinos: chat, translate, check grammar, detect AI, and more.',
        socialProfiles: [
          'https://facebook.com/chatgptph',
          'https://twitter.com/chatgptph',
        ],
      }),
      ...config,
    };

    defaultGenerator = new MetadataGenerator(defaultConfig);
  }

  return defaultGenerator;
}

// ============================================================================
// Helper Functions for Common Use Cases
// ============================================================================

/**
 * Generate metadata for a tool page
 */
export function generateToolMetadata(config: {
  toolName: string;
  toolDescription: string;
  toolPath: string;
  toolCategory?: string;
  features?: string[];
  image?: string;
}): Metadata {
  const generator = getMetadataGenerator();

  return generator.generate({
    pagePath: config.toolPath,
    pageType: 'tool',
    data: {
      title: config.toolName,
      description: config.toolDescription,
      keywords: config.features,
      openGraph: {
        title: config.toolName,
        description: config.toolDescription,
        url: '',
        type: 'website',
        siteName: '',
        images: config.image ? [{ url: config.image }] : undefined,
      },
    },
  });
}

/**
 * Generate metadata for an article/blog page
 */
export function generateArticleMetadata(config: {
  title: string;
  description: string;
  path: string;
  author?: string;
  publishedDate: string;
  modifiedDate?: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  const generator = getMetadataGenerator();

  return generator.generate({
    pagePath: config.path,
    pageType: 'article',
    data: {
      title: config.title,
      description: config.description,
      keywords: config.keywords,
      author: config.author,
      publishedTime: config.publishedDate,
      modifiedTime: config.modifiedDate,
      openGraph: {
        title: config.title,
        description: config.description,
        url: '',
        type: 'article',
        siteName: '',
        images: config.image ? [{ url: config.image }] : undefined,
      },
    },
  });
}

/**
 * Generate metadata for FAQ page
 */
export function generateFAQMetadata(config: {
  title: string;
  description: string;
  path: string;
  faqs: Array<{ question: string; answer: string }>;
}): Metadata {
  const generator = getMetadataGenerator();

  return generator.generate({
    pagePath: config.path,
    pageType: 'faq',
    data: {
      title: config.title,
      description: config.description,
    },
  });
}
