# SEO Meta Management System

**Comprehensive SEO solution for Next.js CMS applications**

A production-ready, enterprise-grade SEO meta management system with complete metadata generation, schema markup, validation, and database integration.

---

## Features

### Core Functionality
- ✅ **Dynamic Meta Tags** - Automatic title, description, and keyword optimization
- ✅ **Schema Markup** - JSON-LD structured data for 7+ schema types
- ✅ **Open Graph** - Complete Facebook/LinkedIn optimization
- ✅ **Twitter Cards** - Rich Twitter preview cards
- ✅ **Canonical URLs** - Automatic duplicate content prevention
- ✅ **Robots Meta** - Fine-grained search engine control

### Advanced Features
- ✅ **Validation System** - Zod-based validation with SEO scoring (0-100)
- ✅ **Database Integration** - Supabase storage for SEO configurations
- ✅ **Mobile-First** - Optimized for mobile search and sharing
- ✅ **Type Safety** - Complete TypeScript definitions
- ✅ **Preview Mode** - Test metadata before publishing
- ✅ **Bulk Operations** - Batch create/update SEO configs

### Schema Types Supported
1. **WebPage** - Default for all pages
2. **Article** - Blog posts and articles
3. **FAQPage** - FAQ sections with rich results
4. **Organization** - Site-wide company info
5. **BreadcrumbList** - Navigation breadcrumbs
6. **SoftwareApplication** - Tool and app pages
7. **HowTo** - Tutorial and guide pages
8. **Product** - E-commerce products
9. **Person** - Author profiles

---

## Quick Start

### 1. Installation

```bash
# Install dependencies
npm install zod @supabase/supabase-js

# Set up environment variables
echo "NEXT_PUBLIC_SUPABASE_URL=your-url" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key" >> .env.local
```

### 2. Database Setup

Run the SQL schema in Supabase:

```bash
# Execute supabase-seo-schema.sql in your Supabase SQL editor
```

### 3. Basic Usage

```typescript
// app/my-page/page.tsx
import { getMetadataGenerator } from '@/lib/seo';
import { ServerSchemaMarkup } from '@/app/components/SchemaMarkup';

export const metadata = getMetadataGenerator().generate({
  pagePath: '/my-page',
  pageType: 'tool',
  data: {
    title: 'My Awesome Tool',
    description: 'This tool helps you do amazing things.',
  },
});

export default function MyPage() {
  return (
    <>
      <ServerSchemaMarkup schema={...} />
      <main>Content</main>
    </>
  );
}
```

---

## Project Structure

```
/lib/seo/
├── index.ts                 # Main exports
├── types.ts                 # TypeScript type definitions
├── metadata-generator.ts    # Core metadata generation
├── schema-generators.ts     # Schema markup factories
├── validation.ts            # SEO validation & scoring
└── database.ts              # Supabase integration

/app/components/
└── SchemaMarkup.tsx         # Schema injection component

/app/
├── paraphraser/
│   └── metadata.ts          # Example tool metadata
└── metadata-example.ts      # Example implementations

Documentation:
├── SEO_DOCUMENTATION.md     # Complete guide (50+ pages)
├── SEO_QUICK_REFERENCE.md   # Quick reference guide
└── SEO_README.md            # This file

Database:
└── supabase-seo-schema.sql  # Database schema
```

---

## Usage Examples

### Example 1: Tool Page

```typescript
import { generateToolMetadata } from '@/lib/seo';
import { generateSoftwareApplicationSchema } from '@/lib/seo';

export const metadata = generateToolMetadata({
  toolName: 'Free Paraphrasing Tool',
  toolDescription: 'Rewrite text while preserving meaning',
  toolPath: '/paraphraser',
  features: ['paraphrase', 'rewrite', 'AI'],
});

const schema = generateSoftwareApplicationSchema({
  name: 'Free Paraphrasing Tool',
  description: 'AI-powered text rewriting',
  url: 'https://yoursite.com/paraphraser',
  category: 'WebApplication',
  price: '0',
});
```

### Example 2: Blog Article

```typescript
import { generateArticleMetadata, generateArticleSchema } from '@/lib/seo';

export const metadata = generateArticleMetadata({
  title: 'How to Use AI for Content Creation',
  description: 'Complete guide to using AI tools...',
  path: '/blog/ai-content-creation',
  author: 'John Doe',
  publishedDate: '2025-01-16',
  keywords: ['AI', 'content creation', 'writing'],
});

const schema = generateArticleSchema({
  headline: 'How to Use AI for Content Creation',
  authorName: 'John Doe',
  publisherName: 'Your Site',
  publisherLogo: 'https://yoursite.com/logo.png',
  datePublished: '2025-01-16',
});
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

const schema = generateFAQPageSchema(faqs);
```

---

## Key Features Explained

### 1. Metadata Generation

The `MetadataGenerator` class automatically creates optimized metadata:

```typescript
const generator = getMetadataGenerator({
  siteName: 'Your Site',
  siteUrl: 'https://yoursite.com',
  defaultImage: 'https://yoursite.com/og.png',
  twitterHandle: '@yoursite',
});

const metadata = generator.generate({
  pagePath: '/page',
  pageType: 'tool',
  data: { title: 'Page Title', description: 'Description' },
});
```

**Output includes:**
- Optimized title (50-60 chars)
- Meta description (120-160 chars)
- Open Graph tags
- Twitter Card tags
- Canonical URL
- Robots directives

### 2. Schema Markup

Generate structured data for rich search results:

```typescript
import {
  generateSoftwareApplicationSchema,
  generateFAQPageSchema,
  combineSchemas,
} from '@/lib/seo';

const schemas = combineSchemas([
  generateSoftwareApplicationSchema({...}),
  generateFAQPageSchema([...]),
]);
```

**Benefits:**
- Rich snippets in Google
- Enhanced search visibility
- Better click-through rates
- Featured snippets eligibility

### 3. Validation & Scoring

Validate SEO metadata and get actionable insights:

```typescript
import { validateSEOMetadata, calculateSEOScore } from '@/lib/seo';

const result = validateSEOMetadata(metadata);
console.log('Valid:', result.valid);
console.log('Score:', result.score); // 0-100
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);
```

**Score Breakdown:**
- 90-100: Excellent
- 75-89: Good
- 60-74: Needs Improvement
- 0-59: Poor

### 4. Database Integration

Store and manage SEO configurations in Supabase:

```typescript
import { getSEOConfig, upsertSEOConfig } from '@/lib/seo';

// Fetch config
const config = await getSEOConfig('/paraphraser');

// Save config
await upsertSEOConfig({
  page_path: '/paraphraser',
  page_type: 'tool',
  title: 'Free Paraphrasing Tool',
  description: 'Rewrite text instantly',
});
```

---

## SEO Best Practices

### Title Tags
- **Length**: 50-60 characters
- **Format**: `Keyword - Benefit | Brand`
- **Include**: Power words (Free, Best, Ultimate)
- **Unique**: Every page needs unique title

### Meta Descriptions
- **Length**: 120-160 characters
- **Include**: Call-to-action (Learn, Get, Try)
- **Benefit**: What value does the page provide?
- **Keywords**: Primary keyword naturally included

### Open Graph Images
- **Dimensions**: 1200x630px
- **Format**: PNG or JPG
- **Size**: Under 1MB
- **Text**: Readable on mobile

### Schema Markup
- **Complete**: Fill all required fields
- **Validate**: Test with Google Rich Results
- **Combine**: Use multiple relevant schemas
- **Update**: Keep data current

---

## Validation Rules

The system validates:

1. **Title**
   - Minimum 30 characters
   - Maximum 60 characters
   - No keyword stuffing
   - Contains power words

2. **Description**
   - Minimum 120 characters
   - Maximum 160 characters
   - Includes call-to-action
   - Natural keyword usage

3. **Open Graph**
   - Required fields present
   - Image dimensions valid
   - URLs are absolute

4. **Schema**
   - Required fields filled
   - Valid JSON-LD format
   - Type-specific validation

---

## Performance

### Server-Side Generation

All metadata is generated server-side for optimal performance:

```typescript
// Server Component (recommended)
export const metadata: Metadata = {...};
```

### Caching

Cache SEO configurations for better performance:

```typescript
import { unstable_cache } from 'next/cache';

const getCachedSEO = unstable_cache(
  async (path) => await getSEOConfig(path),
  ['seo-config'],
  { revalidate: 3600 } // 1 hour
);
```

---

## Testing

### Google Rich Results Test
https://search.google.com/test/rich-results

### Facebook Sharing Debugger
https://developers.facebook.com/tools/debug/

### Twitter Card Validator
https://cards-dev.twitter.com/validator

### Schema.org Validator
https://validator.schema.org/

---

## Migration Guide

### From Existing SEO Setup

1. **Audit Current Metadata**
   ```typescript
   // Document current titles, descriptions, schemas
   ```

2. **Set Up Database**
   ```sql
   -- Run supabase-seo-schema.sql
   ```

3. **Import Existing Data**
   ```typescript
   import { bulkCreateSEOConfigs } from '@/lib/seo';
   await bulkCreateSEOConfigs(existingConfigs);
   ```

4. **Update Pages**
   ```typescript
   // Replace old metadata with new system
   export const metadata = generateToolMetadata({...});
   ```

5. **Validate & Test**
   ```typescript
   const result = validateSEOMetadata(metadata);
   ```

---

## API Reference

### Metadata Generation
- `getMetadataGenerator()` - Get default generator instance
- `generateToolMetadata()` - Generate tool page metadata
- `generateArticleMetadata()` - Generate article metadata
- `generateFAQMetadata()` - Generate FAQ metadata

### Schema Generation
- `generateOrganizationSchema()` - Organization schema
- `generateWebPageSchema()` - WebPage schema
- `generateArticleSchema()` - Article schema
- `generateFAQPageSchema()` - FAQ schema
- `generateSoftwareApplicationSchema()` - Software schema
- `combineSchemas()` - Combine multiple schemas

### Validation
- `validateSEOMetadata()` - Validate metadata
- `validateSchemaMarkup()` - Validate schema
- `calculateSEOScore()` - Calculate SEO score
- `getSEORecommendations()` - Get recommendations

### Database
- `getSEOConfig()` - Fetch config by path
- `getAllSEOConfigs()` - Fetch all configs
- `upsertSEOConfig()` - Create/update config
- `deleteSEOConfig()` - Delete config
- `searchSEOConfigs()` - Search configs

---

## Support & Documentation

- **Full Documentation**: [SEO_DOCUMENTATION.md](./SEO_DOCUMENTATION.md)
- **Quick Reference**: [SEO_QUICK_REFERENCE.md](./SEO_QUICK_REFERENCE.md)
- **Examples**: [app/metadata-example.ts](./app/metadata-example.ts)

---

## Troubleshooting

### Common Issues

**Metadata not updating:**
- Clear Next.js cache: `rm -rf .next`
- Hard refresh browser: Ctrl+Shift+R
- Verify server component (not client)

**Schema not validating:**
- Check all required fields
- Use Google Rich Results Test
- Verify JSON-LD syntax

**OG image not showing:**
- Use absolute URLs
- Check image dimensions (1200x630)
- Force re-scrape on social platforms

---

## License

MIT

---

## Credits

Built with:
- Next.js 14
- TypeScript
- Zod
- Supabase

---

## Version

Current Version: 1.0.0

Last Updated: January 16, 2025
