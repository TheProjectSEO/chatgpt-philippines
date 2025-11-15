# SEO System Quick Reference

Fast reference guide for common SEO tasks.

## Quick Links

- [Generate Metadata](#generate-metadata)
- [Add Schema Markup](#add-schema-markup)
- [Validate SEO](#validate-seo)
- [Database Operations](#database-operations)

---

## Generate Metadata

### Basic Page

```typescript
import { getMetadataGenerator } from '@/lib/seo';

export const metadata = getMetadataGenerator().generate({
  pagePath: '/my-page',
  pageType: 'tool',
  data: {
    title: 'My Page Title',
    description: 'My page description (120-160 chars)',
    keywords: ['keyword1', 'keyword2', 'keyword3'],
  },
});
```

### Tool Page

```typescript
import { generateToolMetadata } from '@/lib/seo';

export const metadata = generateToolMetadata({
  toolName: 'Tool Name',
  toolDescription: 'What the tool does',
  toolPath: '/tool-path',
  features: ['feature1', 'feature2'],
});
```

### Article/Blog

```typescript
import { generateArticleMetadata } from '@/lib/seo';

export const metadata = generateArticleMetadata({
  title: 'Article Title',
  description: 'Article excerpt',
  path: '/blog/article-slug',
  author: 'Author Name',
  publishedDate: '2025-01-16',
  keywords: ['topic1', 'topic2'],
});
```

### FAQ Page

```typescript
import { generateFAQMetadata } from '@/lib/seo';

export const metadata = generateFAQMetadata({
  title: 'Frequently Asked Questions',
  description: 'Common questions about...',
  path: '/faq',
  faqs: [
    { question: 'Q1?', answer: 'A1' },
    { question: 'Q2?', answer: 'A2' },
  ],
});
```

---

## Add Schema Markup

### Software/Tool Schema

```typescript
import { ServerSchemaMarkup } from '@/app/components/SchemaMarkup';
import { generateSoftwareApplicationSchema } from '@/lib/seo';

const schema = generateSoftwareApplicationSchema({
  name: 'Tool Name',
  description: 'Tool description',
  url: 'https://yoursite.com/tool',
  category: 'WebApplication',
  price: '0',
  priceCurrency: 'USD',
});

<ServerSchemaMarkup schema={schema} />
```

### Article Schema

```typescript
import { generateArticleSchema } from '@/lib/seo';

const schema = generateArticleSchema({
  headline: 'Article Title',
  description: 'Article description',
  url: 'https://yoursite.com/article',
  authorName: 'Author Name',
  publisherName: 'Site Name',
  publisherLogo: 'https://yoursite.com/logo.png',
  datePublished: '2025-01-16',
  image: 'https://yoursite.com/image.png',
});

<ServerSchemaMarkup schema={schema} />
```

### FAQ Schema

```typescript
import { generateFAQPageSchema } from '@/lib/seo';

const schema = generateFAQPageSchema([
  { question: 'What is X?', answer: 'X is...' },
  { question: 'How to Y?', answer: 'To Y, you...' },
]);

<ServerSchemaMarkup schema={schema} />
```

### Breadcrumb Schema

```typescript
import { generateBreadcrumbSchema } from '@/lib/seo';

const schema = generateBreadcrumbSchema([
  { name: 'Home', url: 'https://yoursite.com' },
  { name: 'Category', url: 'https://yoursite.com/category' },
  { name: 'Page' }, // Current page (no URL)
]);

<ServerSchemaMarkup schema={schema} />
```

### Combine Multiple Schemas

```typescript
import { combineSchemas } from '@/lib/seo';

const combined = combineSchemas([
  softwareSchema,
  faqSchema,
  breadcrumbSchema,
]);

<ServerSchemaMarkup schema={combined} />
```

---

## Validate SEO

### Basic Validation

```typescript
import { validateSEOMetadata } from '@/lib/seo';

const result = validateSEOMetadata({
  title: 'Page Title',
  description: 'Page description',
});

console.log('Valid:', result.valid);
console.log('Score:', result.score);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);
```

### Calculate SEO Score

```typescript
import { calculateSEOScore } from '@/lib/seo';

const score = calculateSEOScore(metadata, [schema1, schema2]);
console.log('SEO Score:', score); // 0-100
```

### Get Recommendations

```typescript
import { getSEORecommendations } from '@/lib/seo';

const tips = getSEORecommendations('tool', currentMetadata);
tips.forEach(tip => console.log(tip));
```

---

## Database Operations

### Fetch SEO Config

```typescript
import { getSEOConfig } from '@/lib/seo';

const config = await getSEOConfig('/page-path');
```

### Save SEO Config

```typescript
import { upsertSEOConfig } from '@/lib/seo';

await upsertSEOConfig({
  page_path: '/page-path',
  page_type: 'tool',
  title: 'Page Title',
  description: 'Page description',
  robots_index: true,
  robots_follow: true,
});
```

### Get All Configs

```typescript
import { getAllSEOConfigs } from '@/lib/seo';

const allConfigs = await getAllSEOConfigs();
```

### Search Configs

```typescript
import { searchSEOConfigs } from '@/lib/seo';

const results = await searchSEOConfigs('keyword');
```

### Delete Config

```typescript
import { deleteSEOConfig } from '@/lib/seo';

await deleteSEOConfig('config-id');
```

---

## Common Patterns

### Dynamic Metadata from Database

```typescript
export async function generateMetadata({ params }) {
  const config = await getSEOConfig(`/${params.slug}`);

  if (config) {
    return getMetadataGenerator().generate({
      pagePath: `/${params.slug}`,
      pageType: config.page_type,
      data: dbConfigToSEOMetadata(config),
    });
  }

  return defaultMetadata;
}
```

### Page with Multiple Schemas

```typescript
export default function Page() {
  const schemas = combineSchemas([
    generateSoftwareApplicationSchema({...}),
    generateFAQPageSchema([...]),
    generateBreadcrumbSchema([...]),
  ]);

  return (
    <>
      <ServerSchemaMarkup schema={schemas} />
      <main>{/* Content */}</main>
    </>
  );
}
```

---

## Best Practices Checklist

### Every Page Must Have:
- [ ] Title (50-60 chars)
- [ ] Description (120-160 chars)
- [ ] Canonical URL
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Appropriate schema markup

### Optimization Tips:
- [ ] Include target keyword in title
- [ ] Add power words (Free, Best, etc.)
- [ ] Include CTA in description
- [ ] Use high-quality OG image (1200x630)
- [ ] Fill all schema required fields
- [ ] Test with Google Rich Results

---

## Testing Tools

1. **Google Rich Results Test**
   - https://search.google.com/test/rich-results

2. **Facebook Sharing Debugger**
   - https://developers.facebook.com/tools/debug/

3. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator

4. **Schema Validator**
   - https://validator.schema.org/

---

## File Locations

```
Key Files:
- /lib/seo/index.ts                    - Main exports
- /lib/seo/metadata-generator.ts       - Metadata generation
- /lib/seo/schema-generators.ts        - Schema markup
- /lib/seo/validation.ts               - Validation & scoring
- /lib/seo/database.ts                 - Database operations
- /app/components/SchemaMarkup.tsx     - Schema component
```

---

## Environment Setup

```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

---

## Common Issues & Fixes

### Metadata Not Showing
```typescript
// ❌ Wrong (client component)
'use client'
export const metadata = {...}

// ✅ Correct (server component)
export const metadata = {...}
```

### Schema Not Validating
```typescript
// ❌ Wrong (missing required fields)
generateArticleSchema({ headline: 'Title' })

// ✅ Correct (all required fields)
generateArticleSchema({
  headline: 'Title',
  authorName: 'Author',
  publisherName: 'Publisher',
  publisherLogo: 'logo.png',
  datePublished: '2025-01-16',
})
```

### OG Image Not Showing
```typescript
// ❌ Wrong (relative URL)
images: [{ url: '/image.png' }]

// ✅ Correct (absolute URL)
images: [{ url: 'https://yoursite.com/image.png' }]
```

---

## Support

Full documentation: [SEO_DOCUMENTATION.md](./SEO_DOCUMENTATION.md)
