# SEO Meta Management System Documentation

Complete guide to implementing and managing SEO metadata in your Next.js CMS application.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Core Components](#core-components)
5. [Database Setup](#database-setup)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)
8. [Validation & Scoring](#validation--scoring)
9. [Admin UI Integration](#admin-ui-integration)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This SEO meta management system provides:

- **Dynamic Metadata Generation** - Automatic title, description, and meta tag creation
- **Schema Markup** - JSON-LD structured data for 7+ schema types
- **Open Graph & Twitter Cards** - Complete social media optimization
- **Validation System** - Zod-based validation with SEO scoring
- **Database Integration** - Supabase storage for SEO configurations
- **Mobile-First** - Optimized for mobile search and social sharing

### Features

- ✅ Next.js 14 App Router compatible
- ✅ TypeScript with full type safety
- ✅ Automatic canonical URL management
- ✅ Multi-language support (hreflang ready)
- ✅ Rich snippets for Google, Facebook, Twitter
- ✅ FAQ, HowTo, Product, Article schemas
- ✅ SEO health scoring (0-100)
- ✅ Preview mode for testing

---

## Installation

### 1. Install Dependencies

```bash
npm install zod @supabase/supabase-js
```

### 2. Set Up Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. File Structure

The SEO system is organized as follows:

```
/lib/seo/
├── index.ts                 # Main exports
├── types.ts                 # TypeScript types
├── metadata-generator.ts    # Metadata generation
├── schema-generators.ts     # Schema markup generators
├── validation.ts            # Validation & scoring
└── database.ts              # Supabase integration

/app/components/
└── SchemaMarkup.tsx         # Schema injection component
```

---

## Quick Start

### Basic Usage (Server Component)

```typescript
// app/my-page/page.tsx
import { Metadata } from 'next';
import { getMetadataGenerator } from '@/lib/seo';

export const metadata: Metadata = getMetadataGenerator().generate({
  pagePath: '/my-page',
  pageType: 'tool',
  data: {
    title: 'My Awesome Tool',
    description: 'This tool helps you do amazing things.',
    keywords: ['tool', 'awesome', 'productivity'],
  },
});

export default function MyPage() {
  return <div>My Page Content</div>;
}
```

### With Schema Markup

```typescript
import { ServerSchemaMarkup } from '@/app/components/SchemaMarkup';
import { generateSoftwareApplicationSchema } from '@/lib/seo';

export default function MyPage() {
  const schema = generateSoftwareApplicationSchema({
    name: 'My Awesome Tool',
    description: 'Tool description',
    url: 'https://yoursite.com/my-page',
    category: 'WebApplication',
    price: '0',
    priceCurrency: 'USD',
  });

  return (
    <>
      <ServerSchemaMarkup schema={schema} />
      <div>My Page Content</div>
    </>
  );
}
```

---

## Core Components

### 1. MetadataGenerator

Central class for generating Next.js Metadata objects.

```typescript
import { getMetadataGenerator } from '@/lib/seo';

const generator = getMetadataGenerator({
  siteName: 'Your Site Name',
  siteUrl: 'https://yoursite.com',
  defaultImage: 'https://yoursite.com/og-image.png',
  twitterHandle: '@yourhandle',
});

const metadata = generator.generate({
  pagePath: '/page',
  pageType: 'tool',
  data: {
    title: 'Page Title',
    description: 'Page description',
  },
});
```

### 2. Schema Generators

Functions to create various schema types:

```typescript
import {
  generateArticleSchema,
  generateFAQPageSchema,
  generateBreadcrumbSchema,
  generateSoftwareApplicationSchema,
  combineSchemas,
} from '@/lib/seo';

// Article Schema
const article = generateArticleSchema({
  headline: 'My Article Title',
  description: 'Article description',
  url: 'https://yoursite.com/article',
  authorName: 'John Doe',
  publisherName: 'Your Site',
  publisherLogo: 'https://yoursite.com/logo.png',
  datePublished: '2025-01-16',
  image: 'https://yoursite.com/article-image.png',
});

// FAQ Schema
const faqs = generateFAQPageSchema([
  {
    question: 'What is this?',
    answer: 'This is an FAQ answer.',
  },
]);

// Combine multiple schemas
const combined = combineSchemas([article, faqs]);
```

### 3. Validation System

Validate SEO metadata and get recommendations:

```typescript
import {
  validateSEOMetadata,
  calculateSEOScore,
  getSEORecommendations,
} from '@/lib/seo';

const result = validateSEOMetadata({
  title: 'My Page Title',
  description: 'My page description with enough length',
  keywords: ['keyword1', 'keyword2'],
});

console.log(result.valid); // true/false
console.log(result.score); // 0-100
console.log(result.errors); // Array of errors
console.log(result.warnings); // Array of warnings

// Get recommendations
const recommendations = getSEORecommendations('tool', metadata);
```

---

## Database Setup

### Create Supabase Table

Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE seo_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT UNIQUE NOT NULL,
  page_type TEXT NOT NULL,

  -- Meta Tags
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  keywords TEXT[],

  -- Robots
  robots_index BOOLEAN DEFAULT true,
  robots_follow BOOLEAN DEFAULT true,
  robots_advanced JSONB,

  -- URLs
  canonical_url TEXT,

  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',

  -- Twitter
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,

  -- Schema
  schema_types TEXT[],
  schema_data JSONB,

  -- Metadata
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,

  CONSTRAINT valid_page_type CHECK (
    page_type IN ('home', 'tool', 'article', 'faq', 'landing', 'category', 'product', 'about', 'contact', 'custom')
  )
);

-- Create indexes
CREATE INDEX idx_seo_config_page_path ON seo_config(page_path);
CREATE INDEX idx_seo_config_page_type ON seo_config(page_type);
CREATE INDEX idx_seo_config_priority ON seo_config(priority DESC);

-- Enable RLS
ALTER TABLE seo_config ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow read access to everyone" ON seo_config
  FOR SELECT USING (true);
```

### Fetch SEO Config from Database

```typescript
import { getSEOConfig, dbConfigToSEOMetadata } from '@/lib/seo';

// In your page.tsx
export async function generateMetadata({ params }) {
  const config = await getSEOConfig('/paraphraser');

  if (config) {
    const seoData = dbConfigToSEOMetadata(config);
    return getMetadataGenerator().generate({
      pagePath: '/paraphraser',
      pageType: 'tool',
      data: seoData,
    });
  }

  // Fallback to defaults
  return defaultMetadata;
}
```

---

## Usage Examples

### Example 1: Tool Page (Paraphraser)

```typescript
// app/paraphraser/page.tsx
import { Metadata } from 'next';
import { ServerSchemaMarkup } from '@/app/components/SchemaMarkup';
import {
  generateToolMetadata,
  generateSoftwareApplicationSchema,
  generateFAQPageSchema,
  combineSchemas,
} from '@/lib/seo';

export const metadata: Metadata = generateToolMetadata({
  toolName: 'Free Paraphrasing Tool',
  toolDescription: 'Rewrite text while preserving meaning.',
  toolPath: '/paraphraser',
  features: ['paraphrase', 'rewrite', 'AI tool'],
});

export default function ParaphraserPage() {
  const softwareSchema = generateSoftwareApplicationSchema({
    name: 'Free Paraphrasing Tool',
    description: 'AI-powered text rewriting',
    url: 'https://yoursite.com/paraphraser',
    category: 'WebApplication',
    price: '0',
  });

  const faqSchema = generateFAQPageSchema([
    { question: 'Is it free?', answer: 'Yes, completely free.' },
  ]);

  const schema = combineSchemas([softwareSchema, faqSchema]);

  return (
    <>
      <ServerSchemaMarkup schema={schema} />
      <div>{/* Page content */}</div>
    </>
  );
}
```

### Example 2: Blog Article

```typescript
// app/blog/[slug]/page.tsx
import {
  generateArticleMetadata,
  generateArticleSchema,
} from '@/lib/seo';

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);

  return generateArticleMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${params.slug}`,
    author: post.author,
    publishedDate: post.publishedAt,
    image: post.coverImage,
    keywords: post.tags,
  });
}

export default function BlogPost({ params }) {
  const schema = generateArticleSchema({
    headline: post.title,
    description: post.excerpt,
    url: `https://yoursite.com/blog/${params.slug}`,
    authorName: post.author,
    publisherName: 'Your Site',
    publisherLogo: 'https://yoursite.com/logo.png',
    datePublished: post.publishedAt,
    image: post.coverImage,
  });

  return (
    <>
      <ServerSchemaMarkup schema={schema} />
      <article>{/* Article content */}</article>
    </>
  );
}
```

### Example 3: FAQ Page

```typescript
import { generateFAQMetadata, generateFAQPageSchema } from '@/lib/seo';

const faqs = [
  { question: 'What is this?', answer: 'This is...' },
  { question: 'How does it work?', answer: 'It works by...' },
];

export const metadata = generateFAQMetadata({
  title: 'Frequently Asked Questions',
  description: 'Common questions about our service',
  path: '/faq',
  faqs,
});

export default function FAQPage() {
  const schema = generateFAQPageSchema(faqs);

  return (
    <>
      <ServerSchemaMarkup schema={schema} />
      <div>
        {faqs.map((faq, i) => (
          <details key={i}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </>
  );
}
```

---

## Best Practices

### 1. Title Tag Optimization

- **Length**: 50-60 characters (avoid truncation)
- **Format**: `Primary Keyword - Secondary | Brand Name`
- **Include**: Power words (Free, Best, Ultimate, Complete)
- **Unique**: Every page should have a unique title

```typescript
// Good
title: 'Free Paraphrasing Tool - Rewrite Text Instantly | ChatGPT PH'

// Bad (too long)
title: 'Free Online Paraphrasing Tool That Rewrites Your Text While Preserving Meaning and Context'
```

### 2. Meta Description

- **Length**: 120-160 characters
- **Include**: Call-to-action (Learn, Discover, Get, Try)
- **Benefit-focused**: What value does the page provide?
- **Keywords**: Include primary keyword naturally

```typescript
// Good
description: 'Rewrite text instantly with our free AI paraphraser. 4 modes available. Create unique, plagiarism-free content in seconds.'

// Bad (too short, no CTA)
description: 'Paraphrasing tool'
```

### 3. Open Graph Images

- **Dimensions**: 1200x630px (recommended)
- **Format**: PNG or JPG
- **File Size**: Under 1MB
- **Text**: Readable on mobile (large font)
- **Alt Text**: Always provide descriptive alt text

```typescript
openGraph: {
  images: [{
    url: 'https://yoursite.com/og-image.png',
    width: 1200,
    height: 630,
    alt: 'Descriptive alt text for the image',
  }],
}
```

### 4. Schema Markup

- **Multiple Schemas**: Combine related schemas (Article + FAQ)
- **Complete Data**: Fill all recommended fields
- **Validate**: Test with Google Rich Results Test
- **Unique**: Use appropriate schema type for content

```typescript
// Combine related schemas
const schemas = combineSchemas([
  generateArticleSchema(articleData),
  generateFAQPageSchema(faqs),
  generateBreadcrumbSchema(breadcrumbs),
]);
```

### 5. Mobile Optimization

- **Viewport**: Always set in layout.tsx
- **Images**: Use responsive images with srcset
- **Title**: Keep under 55 chars for mobile
- **Test**: Check preview on mobile devices

---

## Validation & Scoring

### SEO Health Score

The system calculates a 0-100 score based on:

- **Title optimization**: 30 points
- **Description quality**: 25 points
- **Open Graph presence**: 20 points
- **Schema markup**: 15 points
- **Keywords**: 10 points

```typescript
import { calculateSEOScore } from '@/lib/seo';

const score = calculateSEOScore(metadata, [schema1, schema2]);
// Returns: 0-100

// Score interpretation:
// 90-100: Excellent
// 75-89: Good
// 60-74: Needs Improvement
// 0-59: Poor
```

### Validation Errors

```typescript
import { validateSEOMetadata } from '@/lib/seo';

const result = validateSEOMetadata({
  title: 'Short', // Error: too short
  description: 'Too short', // Error: too short
});

result.errors.forEach(error => {
  console.log(error.field, error.message, error.severity);
});
```

### SEO Recommendations

```typescript
import { getSEORecommendations } from '@/lib/seo';

const recommendations = getSEORecommendations('tool', currentMetadata);
// Returns array of specific recommendations for the page type
```

---

## Admin UI Integration

Create an admin interface to manage SEO settings:

```typescript
// app/admin/seo/page.tsx
import { getAllSEOConfigs, upsertSEOConfig } from '@/lib/seo';

export default async function SEOAdmin() {
  const configs = await getAllSEOConfigs();

  return (
    <div>
      <h1>SEO Configuration</h1>
      {configs.map(config => (
        <div key={config.id}>
          <h3>{config.page_path}</h3>
          <p>Title: {config.title}</p>
          <p>Score: {calculateSEOScore(config)}/100</p>
          {/* Edit form */}
        </div>
      ))}
    </div>
  );
}
```

---

## Troubleshooting

### Schema Not Showing in Rich Results Test

1. **Validate JSON**: Use JSON validator
2. **Check syntax**: Ensure proper JSON-LD format
3. **Required fields**: Fill all required fields for schema type
4. **Test URL**: Use live URL, not localhost

### Metadata Not Updating

1. **Clear cache**: Clear Next.js build cache
2. **Hard refresh**: Ctrl+Shift+R in browser
3. **Check export**: Ensure metadata is exported correctly
4. **Server vs Client**: Use server components for metadata

### Open Graph Not Showing on Social Media

1. **Wait**: Social platforms cache for 24-48 hours
2. **Debug**: Use Facebook Sharing Debugger
3. **Scrape**: Force re-scrape on social platforms
4. **Verify**: Check og:image URL is accessible

### Low SEO Score

1. **Title length**: Optimize to 50-60 characters
2. **Add power words**: Free, Best, Ultimate, etc.
3. **CTA in description**: Include action verbs
4. **Open Graph**: Add complete OG metadata
5. **Schema markup**: Implement relevant schemas

---

## SEO Checklist

Use this checklist for every page:

### Essential (Must Have)
- [ ] Unique title (50-60 characters)
- [ ] Meta description (120-160 characters)
- [ ] Canonical URL set
- [ ] Robots meta configured
- [ ] Mobile viewport set

### Recommended
- [ ] Keywords defined (5-8 keywords)
- [ ] Open Graph metadata complete
- [ ] Twitter Card metadata
- [ ] Schema markup (appropriate type)
- [ ] Alt text for images

### Advanced
- [ ] FAQ schema (if applicable)
- [ ] Breadcrumb schema
- [ ] Article schema (for content)
- [ ] Aggregate rating (if applicable)
- [ ] Hreflang tags (for multi-language)

---

## Performance Tips

### 1. Server-Side Generation

Always generate metadata on the server:

```typescript
// app/page.tsx
export const metadata: Metadata = {...}; // Server-side
```

### 2. Cache SEO Configs

```typescript
import { unstable_cache } from 'next/cache';

const getCachedSEO = unstable_cache(
  async (path) => await getSEOConfig(path),
  ['seo-config'],
  { revalidate: 3600 } // 1 hour
);
```

### 3. Lazy Load Schemas

Only load schema generators when needed:

```typescript
const { generateArticleSchema } = await import('@/lib/seo');
```

---

## Additional Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org)
- [Open Graph Protocol](https://ogp.me)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

---

## Support

For issues or questions:
1. Check this documentation
2. Review example implementations
3. Validate with Google Rich Results Test
4. Test with SEO tools (Screaming Frog, Ahrefs, etc.)
