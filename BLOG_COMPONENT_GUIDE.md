# Blog Component Visual Guide

## Component Hierarchy

```
BlogPostPage (page.tsx)
│
├── ProgressBar
│   └── Fixed top bar showing reading progress
│
├── Hero Section (optional)
│   └── Featured image with gradient overlay
│
├── Breadcrumb Navigation
│   └── Home > Blog > Article Title
│
└── Main Content Grid (12 columns)
    │
    ├── Article Column (8/12)
    │   │
    │   ├── Back Button
    │   │
    │   ├── BlogHeader
    │   │   ├── Category Badge
    │   │   ├── Title (H1)
    │   │   ├── Author Info
    │   │   │   ├── Avatar
    │   │   │   ├── Name
    │   │   │   └── Role
    │   │   ├── Meta Info
    │   │   │   ├── Published Date
    │   │   │   ├── Updated Date
    │   │   │   └── Reading Time
    │   │   └── Author Bio Box
    │   │       ├── Avatar
    │   │       ├── Bio Text
    │   │       └── Social Links
    │   │
    │   ├── Content Blocks
    │   │   ├── Text Paragraphs
    │   │   ├── Headings (H2, H3)
    │   │   ├── Lists
    │   │   ├── CalloutBox
    │   │   │   ├── Icon
    │   │   │   ├── Title
    │   │   │   └── Content
    │   │   ├── Code Blocks
    │   │   └── Images
    │   │
    │   ├── Tags
    │   │
    │   ├── FAQSection
    │   │   └── Collapsible FAQ Items
    │   │       ├── Question
    │   │       └── Answer (expandable)
    │   │
    │   ├── CTA Section
    │   │   ├── Heading
    │   │   ├── Description
    │   │   └── Action Buttons
    │   │
    │   └── Ad Placeholder (728x90)
    │
    └── Sidebar Column (4/12)
        │
        ├── TableOfContents
        │   ├── Desktop: Sticky Sidebar
        │   └── Mobile: Floating Button + Drawer
        │
        └── BlogSidebar
            ├── Newsletter Widget
            │   ├── Email Input
            │   └── Subscribe Button
            │
            ├── Social Share Widget
            │   ├── Facebook
            │   ├── Twitter
            │   ├── LinkedIn
            │   └── Copy Link
            │
            ├── Popular Tools Widget
            │   └── Tool Cards
            │       ├── Icon
            │       ├── Name
            │       └── Description
            │
            ├── Related Posts Widget
            │   └── Post Cards
            │       ├── Image
            │       ├── Title
            │       ├── Excerpt
            │       └── Read Time
            │
            └── Ad Placeholder (300x250)
```

## Mobile Layout (< 1024px)

```
Stack Order:
1. ProgressBar (fixed top)
2. Hero/Featured Image
3. Breadcrumb (sticky)
4. Back Button
5. BlogHeader
6. Content Blocks
7. Tags
8. FAQSection
9. CTA Section
10. BlogSidebar (all widgets)
11. Ad Placeholder
12. TableOfContents (floating button)
```

## Component Props Reference

### BlogHeader
```typescript
interface BlogHeaderProps {
  title: string;
  author: Author;
  publishedDate: string;     // ISO format
  updatedDate?: string;      // ISO format
  readingTime: number;       // minutes
  category: string;
}
```

### TableOfContents
```typescript
interface TableOfContentsProps {
  items: TableOfContentsItem[];
}

interface TableOfContentsItem {
  id: string;              // HTML element ID
  title: string;           // Display text
  level: 2 | 3;           // H2 or H3
}
```

### CalloutBox
```typescript
interface CalloutBoxProps {
  type: 'info' | 'warning' | 'tip' | 'success';
  title?: string;          // Optional custom title
  content: string;         // Main message
}
```

### FAQSection
```typescript
interface FAQSectionProps {
  faqs: FAQItem[];
}

interface FAQItem {
  question: string;
  answer: string;
}
```

### BlogSidebar
```typescript
interface BlogSidebarProps {
  relatedPosts?: RelatedPost[];
  popularTools?: PopularTool[];
}
```

## Styling Classes Reference

### Container Classes
```css
/* Main container */
.container mx-auto px-4 md:px-6 max-w-7xl

/* Content grid */
.grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12
```

### Typography Classes
```css
/* H1 - Page Title */
.text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900

/* H2 - Section Heading */
.text-2xl md:text-3xl font-bold text-neutral-900

/* H3 - Subsection */
.text-xl md:text-2xl font-semibold text-neutral-900

/* Body Text */
.text-base md:text-lg text-neutral-700 leading-relaxed

/* Small Text */
.text-sm text-neutral-600
```

### Color Classes
```css
/* Primary Orange */
bg-orange-500    /* Buttons, accents */
bg-orange-100    /* Badges, highlights */
bg-orange-50     /* Light backgrounds */
text-orange-600  /* Links, icons */

/* Gradients */
bg-gradient-to-br from-orange-50 via-white to-purple-50
bg-gradient-to-r from-orange-500 to-orange-600
```

### Border & Shadow
```css
/* Borders */
border border-neutral-200
rounded-xl      /* 1rem radius */
rounded-2xl     /* 1.5rem radius */

/* Shadows */
shadow-lg
hover:shadow-xl
transition-shadow duration-200
```

### Interactive States
```css
/* Hover */
hover:bg-orange-50
hover:text-orange-600
hover:scale-105

/* Focus */
focus:outline-none
focus:ring-2
focus:ring-orange-500

/* Transitions */
transition-all duration-200
transition-colors
```

## Responsive Breakpoints

```css
/* Mobile First Approach */

/* Base (Mobile) */
0px - 639px
- Single column
- Full width elements
- Floating TOC button

/* Tablet */
640px - 1023px (sm:, md:)
- 2 columns for some grids
- Larger text
- Side-by-side meta info

/* Desktop */
1024px+ (lg:, xl:)
- 12 column grid
- Sticky sidebar
- Larger containers
```

## Color Palette Quick Reference

### Callout Colors
```typescript
Info:    bg-blue-50    border-blue-200    text-blue-600
Warning: bg-amber-50   border-amber-200   text-amber-600
Tip:     bg-purple-50  border-purple-200  text-purple-600
Success: bg-green-50   border-green-200   text-green-600
```

### Button Colors
```typescript
Primary:   bg-orange-500  hover:bg-orange-600  text-white
Secondary: bg-transparent border-orange-500    text-orange-600
Ghost:     bg-transparent hover:bg-neutral-100  text-neutral-700
```

## Animation Classes

### Progress Bar
```css
/* Smooth width transition */
transition-all duration-150 ease-out
```

### TOC Active State
```css
/* Highlight current section */
bg-orange-100 text-orange-700 font-medium
```

### FAQ Accordion
```css
/* Chevron rotation */
transform group-open:rotate-180 transition-transform duration-200
```

### Hover Effects
```css
/* Cards */
hover:shadow-lg transition-shadow duration-200

/* Images */
group-hover:scale-105 transition-transform duration-200

/* Buttons */
hover:scale-105 transition-all duration-200
```

## Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys in TOC (native browser)

### Screen Reader
- Semantic HTML (article, aside, nav, section)
- ARIA labels on icons
- Proper heading hierarchy

### Focus Management
- Visible focus indicators
- Skip to content via breadcrumb
- Focus trap in mobile TOC drawer

## Content Block Examples

### Text Block
```json
{
  "type": "text",
  "content": "Your paragraph text here..."
}
```

### Heading Block
```json
{
  "type": "heading",
  "level": 2,
  "content": "Section Title"
}
```

### List Block
```json
{
  "type": "list",
  "content": [
    "First item",
    "Second item",
    "Third item"
  ]
}
```

### Callout Block
```json
{
  "type": "callout",
  "content": {
    "type": "info",
    "title": "Optional Title",
    "content": "Important message here"
  }
}
```

### Code Block
```json
{
  "type": "code",
  "language": "javascript",
  "content": "const example = 'code here';"
}
```

### Image Block
```json
{
  "type": "image",
  "content": "/path/to/image.jpg",
  "alt": "Descriptive alt text"
}
```

## Schema Markup Templates

### BlogPosting Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Article Title",
  "description": "Article excerpt",
  "image": "featured-image.jpg",
  "datePublished": "2025-01-15T08:00:00Z",
  "dateModified": "2025-01-20T10:30:00Z",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ChatGPT Philippines"
  }
}
```

### FAQPage Schema
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text"
      }
    }
  ]
}
```

## Performance Tips

1. **Images**: Use Next.js Image component with proper sizes
2. **Lazy Loading**: Images below fold load on scroll
3. **Code Splitting**: Components load only when needed
4. **Memoization**: Expensive calculations cached
5. **Smooth Animations**: Use CSS transforms (GPU)

## Common Customizations

### Change Primary Color
In `/app/globals.css`:
```css
--primary-500: #your-color;
--primary-600: #your-darker-color;
```

### Adjust Reading Progress Color
In `ProgressBar.tsx`:
```tsx
className="bg-gradient-to-r from-your-color to-your-color-600"
```

### Modify TOC Position
In `TableOfContents.tsx`:
```tsx
className="sticky top-24"  // Change top-24 to your value
```

### Change Container Width
In `page.tsx`:
```tsx
className="max-w-7xl"  // Change to max-w-6xl, max-w-5xl, etc.
```

## Testing URLs

### Development
```
http://localhost:3000/blog/how-to-use-ai-tools-for-content-creation-2025
```

### Production
```
https://chatgpt-philippines.com/blog/how-to-use-ai-tools-for-content-creation-2025
```

## Quick Reference Card

| Feature | Desktop | Mobile |
|---------|---------|--------|
| TOC | Sticky Sidebar | Floating Button + Drawer |
| Layout | 2 Columns | 1 Column (stacked) |
| Images | Max-width | Full-width |
| CTA Buttons | Inline | Full-width |
| Font Size | 16px base | 14px base |
| Sidebar | Right side | Below content |

## Component File Sizes

| Component | Lines | Features |
|-----------|-------|----------|
| BlogHeader | 140 | Author, dates, bio, social |
| TableOfContents | 150 | Desktop + mobile, scroll tracking |
| CalloutBox | 80 | 4 variants, icons |
| FAQSection | 45 | Accordion, animations |
| BlogSidebar | 180 | 5 widgets, responsive |
| ProgressBar | 35 | Scroll tracking |
| page.tsx | 380 | Full blog page, routing |

Total: ~1,010 lines of clean, production-ready code
