# Blog System Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ChatGPT Philippines Website                  │
│                  (Next.js 14 App Router)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Navigation                               │
│  Home | Tools | Translator | Blog | Pricing | Login           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ /blog/:slug
┌─────────────────────────────────────────────────────────────────┐
│                   Blog Post Page (Dynamic)                      │
│              /app/blog/[slug]/page.tsx                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Route Params Handler                                    │  │
│  │  • Extract slug from URL                                 │  │
│  │  • Fetch post data from JSON                            │  │
│  │  • Render 404 if not found                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
│          /data/blog-posts/*.json                                │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ example-post   │  │  post-2.json   │  │  post-3.json   │   │
│  │     .json      │  │                │  │                │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                 │
│  Each contains:                                                 │
│  • Metadata (title, author, dates)                            │
│  • Content blocks (text, headings, callouts)                  │
│  • Table of contents                                          │
│  • FAQs, related posts, SEO data                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Type Definitions                             │
│                  /types/blog.ts                                 │
│                                                                 │
│  • BlogPost interface                                           │
│  • Author, ContentBlock, FAQItem                               │
│  • TableOfContentsItem                                         │
│  • CalloutBox, RelatedPost                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Component Library                              │
│            /components/blog/*.tsx                               │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  BlogHeader  │    │TableOfContents│   │ CalloutBox   │
│              │    │              │    │              │
│ • Author     │    │ • Desktop:   │    │ • 4 types:   │
│ • Dates      │    │   Sticky     │    │   info       │
│ • Category   │    │   sidebar    │    │   warning    │
│ • Bio        │    │              │    │   tip        │
│              │    │ • Mobile:    │    │   success    │
│              │    │   Drawer     │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ FAQSection   │    │ BlogSidebar  │    │ ProgressBar  │
│              │    │              │    │              │
│ • Accordion  │    │ • Newsletter │    │ • Top bar    │
│ • Expandable │    │ • Share btns │    │ • Scroll %   │
│ • Schema     │    │ • Tools list │    │ • Gradient   │
│              │    │ • Related    │    │              │
│              │    │ • Ads        │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Page Rendering Flow

```
User Request
    │
    ▼
http://localhost:3000/blog/example-post
    │
    ▼
Next.js Router
    │
    ├─ Extract slug: "example-post"
    │
    ▼
page.tsx Component
    │
    ├─ Import blog post data
    │  • example-post.json
    │
    ├─ Type checking
    │  • Validate against BlogPost interface
    │
    ├─ Render check
    │  • Post exists? → Render
    │  • Not found? → 404 page
    │
    ▼
Component Tree
    │
    ├─ ProgressBar (fixed top)
    │
    ├─ Hero Section
    │  └─ Featured image + gradient
    │
    ├─ Breadcrumb (sticky)
    │  └─ Home > Blog > Post Title
    │
    ├─ Main Grid (12 columns)
    │  │
    │  ├─ Article (8 cols)
    │  │  │
    │  │  ├─ BlogHeader
    │  │  │
    │  │  ├─ Content Blocks (loop)
    │  │  │  ├─ renderContentBlock(block)
    │  │  │  │  ├─ text → <p>
    │  │  │  │  ├─ heading → <h2>/<h3>
    │  │  │  │  ├─ list → <ul>
    │  │  │  │  ├─ callout → <CalloutBox>
    │  │  │  │  ├─ code → <pre><code>
    │  │  │  │  └─ image → <Image>
    │  │  │
    │  │  ├─ Tags
    │  │  │
    │  │  ├─ FAQSection
    │  │  │
    │  │  ├─ CTA Section
    │  │  │
    │  │  └─ Ad Placeholder
    │  │
    │  └─ Sidebar (4 cols)
    │     │
    │     ├─ TableOfContents
    │     │
    │     └─ BlogSidebar
    │
    └─ Schema Markup
       ├─ BlogPosting
       └─ FAQPage
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    JSON Source                          │
│              example-post.json                          │
└─────────────────────────────────────────────────────────┘
                      │
                      │ Import
                      ▼
┌─────────────────────────────────────────────────────────┐
│              TypeScript Type Check                      │
│          (BlogPost interface from /types/blog.ts)       │
└─────────────────────────────────────────────────────────┘
                      │
                      │ Type Assertion
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Component Props                            │
│                                                         │
│  const post = blogPosts[slug];                         │
│                                                         │
│  ┌──────────────────┐                                  │
│  │  Destructuring   │                                  │
│  │  • post.title    │                                  │
│  │  • post.author   │                                  │
│  │  • post.content  │                                  │
│  │  • post.faqs     │                                  │
│  │  • etc...        │                                  │
│  └──────────────────┘                                  │
└─────────────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌─────────────┐ ┌──────────┐ ┌──────────────┐
│BlogHeader   │ │Content   │ │FAQSection    │
│Props        │ │Blocks    │ │Props         │
│             │ │Loop      │ │              │
│{            │ │          │ │{             │
│ title,      │ │{type,    │ │ faqs: [...]  │
│ author,     │ │ content} │ │}             │
│ dates       │ │          │ │              │
│}            │ │          │ │              │
└─────────────┘ └──────────┘ └──────────────┘
```

## Responsive Layout Transformation

```
DESKTOP (> 1024px)
┌────────────────────────────────────────────────────────┐
│                    Progress Bar                        │
├────────────────────────────────────────────────────────┤
│                    Breadcrumb                          │
├────────────────┬───────────────────────────────────────┤
│                │                                       │
│   Article      │          Sidebar                      │
│   (8 cols)     │          (4 cols)                     │
│                │                                       │
│   - Header     │    ┌──────────────────────┐          │
│   - Content    │    │  Table of Contents   │          │
│   - FAQs       │    │  (sticky)            │          │
│                │    └──────────────────────┘          │
│                │    ┌──────────────────────┐          │
│                │    │  Newsletter          │          │
│                │    └──────────────────────┘          │
│                │    ┌──────────────────────┐          │
│                │    │  Share Buttons       │          │
│                │    └──────────────────────┘          │
│                │    ┌──────────────────────┐          │
│                │    │  Popular Tools       │          │
│                │    └──────────────────────┘          │
│                │                                       │
└────────────────┴───────────────────────────────────────┘


MOBILE (< 1024px)
┌────────────────────────────────────┐
│         Progress Bar               │
├────────────────────────────────────┤
│         Breadcrumb                 │
├────────────────────────────────────┤
│                                    │
│         Article                    │
│         (full width)               │
│                                    │
│         - Header                   │
│         - Content                  │
│         - FAQs                     │
│                                    │
├────────────────────────────────────┤
│                                    │
│         Sidebar                    │
│         (stacked below)            │
│                                    │
│    ┌──────────────────────┐       │
│    │  Newsletter          │       │
│    └──────────────────────┘       │
│    ┌──────────────────────┐       │
│    │  Share Buttons       │       │
│    └──────────────────────┘       │
│    ┌──────────────────────┐       │
│    │  Popular Tools       │       │
│    └──────────────────────┘       │
│                                    │
└────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │  TOC Floating   │
         │     Button      │
         │   (bottom-right)│
         └─────────────────┘
              │ Click
              ▼
         ┌─────────────────┐
         │   TOC Drawer    │
         │  (slides up)    │
         └─────────────────┘
```

## State Management

```
┌───────────────────────────────────────────────────────┐
│            Component Local State                      │
└───────────────────────────────────────────────────────┘

TableOfContents.tsx:
    • activeId: string (current section)
    • isOpen: boolean (mobile drawer)
    • IntersectionObserver → updates activeId

ProgressBar.tsx:
    • progress: number (0-100%)
    • scroll listener → updates progress

CalloutBox.tsx:
    • No state (pure presentational)

FAQSection.tsx:
    • No state (uses native <details>)

BlogHeader.tsx:
    • No state (pure presentational)

BlogSidebar.tsx:
    • No state (pure presentational)
```

## SEO Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Page Meta Tags                     │
│           (Generated from post.seo)                 │
│                                                     │
│  <head>                                             │
│    <title>{post.seo.metaTitle}</title>             │
│    <meta name="description"                         │
│          content={post.seo.metaDescription} />      │
│    <meta name="keywords"                            │
│          content={post.seo.keywords.join(',')} />   │
│    <meta property="og:title" ... />                 │
│    <meta property="og:description" ... />           │
│    <meta property="og:image" ... />                 │
│  </head>                                            │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              Structured Data (JSON-LD)              │
│                                                     │
│  1. BlogPosting Schema                              │
│     • headline, description, image                  │
│     • author, publisher                             │
│     • datePublished, dateModified                   │
│     • mainEntityOfPage                              │
│                                                     │
│  2. FAQPage Schema                                  │
│     • mainEntity: [Question[]]                      │
│     • Each question has acceptedAnswer              │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│            Google Search Results                    │
│                                                     │
│  Regular Snippet:                                   │
│  ┌───────────────────────────────────────────┐     │
│  │ How to Use AI Tools... | ChatGPT PH      │     │
│  │ https://chatgpt-philippines.com/blog/... │     │
│  │ Discover the latest AI tools and...      │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  Rich Result (FAQ):                                 │
│  ┌───────────────────────────────────────────┐     │
│  │ ▼ Are these AI tools really free?        │     │
│  │   Yes! ChatGPT Philippines offers...     │     │
│  │                                           │     │
│  │ ▼ Can AI understand Filipino?            │     │
│  │   Absolutely! Our AI tools support...    │     │
│  └───────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

## File Dependencies

```
page.tsx
  │
  ├─ imports BlogHeader from @/components/blog/BlogHeader
  ├─ imports TableOfContents from @/components/blog/TableOfContents
  ├─ imports CalloutBox from @/components/blog/CalloutBox
  ├─ imports FAQSection from @/components/blog/FAQSection
  ├─ imports BlogSidebar from @/components/blog/BlogSidebar
  ├─ imports ProgressBar from @/components/blog/ProgressBar
  │
  ├─ imports types from @/types/blog
  │   ├─ BlogPost
  │   ├─ ContentBlock
  │   └─ CalloutBox (type)
  │
  └─ imports data from @/data/blog-posts/example-post.json

Each component:
  │
  ├─ imports lucide-react icons
  ├─ imports types from @/types/blog
  ├─ imports Next.js components (Link, Image)
  └─ uses Tailwind CSS classes from globals.css
```

## Performance Optimization Flow

```
User Lands on Page
        │
        ▼
    ┌─────────────────────┐
    │  Initial Load       │
    │  • HTML (SSR)       │
    │  • Critical CSS     │
    │  • Above fold JS    │
    └─────────────────────┘
        │
        ▼
    ┌─────────────────────┐
    │  Progressive Load   │
    │  • Images lazy load │
    │  • Below fold CSS   │
    │  • Non-critical JS  │
    └─────────────────────┘
        │
        ▼
    ┌─────────────────────┐
    │  Interactive        │
    │  • TOC scroll track │
    │  • Progress bar     │
    │  • Smooth scroll    │
    └─────────────────────┘
        │
        ▼
    ┌─────────────────────┐
    │  Optimizations      │
    │  • Image sizing     │
    │  • Font preload     │
    │  • Code splitting   │
    │  • Component memo   │
    └─────────────────────┘
```

## Color System Hierarchy

```
┌────────────────────────────────────────┐
│         CSS Custom Properties          │
│         (/app/globals.css)             │
│                                        │
│  --primary-500: #E8844A               │
│  --primary-600: #D46D38               │
│  --neutral-900: #111827               │
│  etc...                               │
└────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│      Tailwind Theme Extension          │
│      (tailwind.config.ts)              │
│                                        │
│  colors: {                             │
│    primary: { ... },                   │
│    neutral: { ... }                    │
│  }                                     │
└────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│      Component Utility Classes         │
│                                        │
│  bg-orange-500                         │
│  text-neutral-900                      │
│  border-neutral-200                    │
│  hover:bg-orange-600                   │
└────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│         Compiled CSS                   │
│         (.next/static/css/)            │
└────────────────────────────────────────┘
```

---

This architecture provides:
- Clear separation of concerns
- Type safety with TypeScript
- Scalable component structure
- SEO-optimized output
- Mobile-first responsive design
- Performance-optimized rendering
