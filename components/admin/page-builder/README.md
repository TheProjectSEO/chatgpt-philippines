# Page Builder System

A comprehensive, production-ready visual page builder for ChatGPT PH with support for multiple content section types, live preview, and flexible content management.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Page Builder Architecture                 │
├─────────────────────────────────────────────────────────────┤
│  UI Layer                                                    │
│  ├─ PageBuilder.tsx (Main orchestrator)                     │
│  ├─ SectionWrapper.tsx (Section container with controls)    │
│  └─ Preview panels (Desktop/Tablet/Mobile)                  │
├─────────────────────────────────────────────────────────────┤
│  Section Editors (Modular components)                       │
│  ├─ HeroEditor                                              │
│  ├─ ContentBlockEditor (Rich content with 8 block types)    │
│  ├─ CTAEditor                                               │
│  ├─ FAQEditor                                               │
│  ├─ FeaturesEditor                                          │
│  ├─ TestimonialsEditor                                      │
│  └─ GalleryEditor                                           │
├─────────────────────────────────────────────────────────────┤
│  Type System                                                 │
│  ├─ /types/page-content.ts (Comprehensive TypeScript types) │
│  └─ Version 1.0 JSON schema                                 │
├─────────────────────────────────────────────────────────────┤
│  Data Flow                                                   │
│  ├─ State management (React useState + history)             │
│  ├─ Undo/Redo support                                       │
│  └─ Real-time preview updates                               │
├─────────────────────────────────────────────────────────────┤
│  API Integration                                             │
│  ├─ POST /api/admin/pages (Create)                          │
│  ├─ PATCH /api/admin/pages (Update)                         │
│  └─ DELETE /api/admin/pages (Delete)                        │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Core Functionality

1. **Visual Page Building**
   - Drag-and-drop section reordering
   - Add/remove sections dynamically
   - Duplicate sections
   - Toggle section visibility

2. **Section Types**
   - **Hero**: Headline, subheadline, CTAs, background images with overlay
   - **Content Block**: 8 block types (heading, paragraph, image, list, quote, code, video, divider)
   - **CTA**: Call-to-action with multiple layout options
   - **FAQ**: Question/answer pairs with schema markup support
   - **Features**: Icon-based feature showcases
   - **Testimonials**: Customer testimonials with ratings
   - **Gallery**: Image galleries with lightbox support

3. **Editor Features**
   - Undo/Redo functionality
   - Real-time preview (Desktop/Tablet/Mobile)
   - Split-view editing
   - Auto-save history
   - Section settings (padding, container width, colors)

4. **Mobile-First Design**
   - Responsive preview modes
   - Touch-friendly controls
   - Mobile-optimized UI

## File Structure

```
/components/admin/page-builder/
├── PageBuilder.tsx              # Main component
├── SectionWrapper.tsx           # Section container with controls
├── index.tsx                    # Export barrel
├── sections/
│   ├── HeroEditor.tsx
│   ├── ContentEditor.tsx        # Rich content blocks
│   ├── CTAEditor.tsx
│   ├── FAQEditor.tsx
│   ├── FeaturesEditor.tsx
│   ├── TestimonialsEditor.tsx
│   └── GalleryEditor.tsx
└── README.md                    # This file

/types/
└── page-content.ts              # TypeScript definitions

/app/api/admin/pages/
└── route.ts                     # CRUD API endpoints

/app/admin/pages/
└── page.tsx                     # Pages manager with builder integration
```

## Usage

### Basic Implementation

```tsx
import { PageBuilder } from '@/components/admin/page-builder';
import { PageContent } from '@/types/page-content';

function MyPage() {
  const [content, setContent] = useState<PageContent | undefined>();

  const handleSave = async (content: PageContent) => {
    const response = await fetch('/api/admin/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'My Page',
        slug: '/my-page',
        content,
      }),
    });

    const result = await response.json();
    console.log('Saved:', result);
  };

  return (
    <PageBuilder
      initialContent={content}
      pageTitle="My Page"
      pageSlug="/my-page"
      onSave={handleSave}
      onCancel={() => console.log('Cancelled')}
    />
  );
}
```

### Content Structure

All page content follows this JSON structure:

```json
{
  "version": "1.0",
  "sections": [
    {
      "id": "section-123",
      "type": "hero",
      "order": 0,
      "isVisible": true,
      "settings": {
        "paddingTop": "lg",
        "paddingBottom": "lg",
        "containerWidth": "medium"
      },
      "data": {
        "headline": "Welcome to ChatGPT PH",
        "subheadline": "Your AI-powered assistant",
        "alignment": "center",
        "ctaPrimary": {
          "text": "Get Started",
          "url": "/signup",
          "variant": "primary"
        }
      }
    }
  ]
}
```

## Section Types Reference

### 1. Hero Section

**Purpose**: Large header section with headline, description, and CTAs

**Data Structure**:
```typescript
{
  headline: string;          // Required
  subheadline?: string;
  description?: string;
  ctaPrimary?: CTAButton;
  ctaSecondary?: CTAButton;
  backgroundImage?: MediaItem;
  alignment: 'left' | 'center' | 'right';
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
}
```

**Use Cases**:
- Homepage headers
- Landing page heroes
- Product introductions

### 2. Content Block Section

**Purpose**: Flexible rich content with multiple block types

**Block Types**:
- **Heading**: H1-H6 with alignment
- **Paragraph**: Text with alignment
- **Image**: Images with captions and links
- **List**: Bulleted or numbered lists
- **Quote**: Blockquotes with attribution
- **Code**: Syntax-highlighted code blocks
- **Video**: YouTube, Vimeo, or uploaded videos
- **Divider**: Horizontal rules with styles

**Use Cases**:
- Blog-style content
- Documentation pages
- Article layouts

### 3. CTA Section

**Purpose**: Call-to-action prompts

**Layouts**:
- **Centered**: Text and buttons centered
- **Split**: Text on one side, image on other
- **Banner**: Full-width banner style

**Use Cases**:
- Newsletter signups
- Product demos
- Lead generation

### 4. FAQ Section

**Purpose**: Question and answer pairs

**Features**:
- Schema markup for SEO
- Multiple layout options
- Expandable/collapsible

**Use Cases**:
- Support pages
- Product documentation
- Help centers

### 5. Features Section

**Purpose**: Showcase product/service features

**Features**:
- Icon support (text or image)
- Grid/list/cards layouts
- Configurable columns (2-4)
- Optional links

**Use Cases**:
- Product pages
- Service descriptions
- Feature comparisons

### 6. Testimonials Section

**Purpose**: Customer testimonials and reviews

**Features**:
- Star ratings
- Author photos
- Company attribution
- Multiple layouts (carousel, grid, masonry)

**Use Cases**:
- Social proof
- Customer success stories
- Reviews pages

### 7. Gallery Section

**Purpose**: Image galleries

**Features**:
- Multiple layouts
- Lightbox support
- Captions and links
- Configurable columns (2-5)

**Use Cases**:
- Portfolio showcases
- Product galleries
- Photo albums

## API Endpoints

### Create Page
```bash
POST /api/admin/pages
Content-Type: application/json

{
  "title": "Page Title",
  "slug": "/page-slug",
  "status": "draft",
  "category": "static",
  "content": { ... }
}
```

### Update Page
```bash
PATCH /api/admin/pages
Content-Type: application/json

{
  "id": "page-123",
  "title": "Updated Title",
  "content": { ... }
}
```

### Delete Page
```bash
DELETE /api/admin/pages?id=page-123
```

## TypeScript Types

All types are defined in `/types/page-content.ts`:

- `PageContent` - Root content structure
- `Section` - Union of all section types
- `SectionType` - Available section types
- `HeroSection`, `ContentSection`, etc. - Individual section types
- `MediaItem` - Media/image references
- `CTAButton` - Button configuration
- `SectionSettings` - Section styling options

## Design Patterns

### 1. Section Pattern
Each section follows this pattern:
```typescript
interface BaseSection {
  id: string;              // Unique identifier
  type: SectionType;       // Section type
  order: number;           // Sort order
  isVisible: boolean;      // Visibility toggle
  settings: SectionSettings; // Styling options
}
```

### 2. Editor Pattern
Each section editor:
- Receives `section` and `onChange` props
- Updates section via `onChange`
- Provides specialized UI for its section type
- Handles validation locally

### 3. Preview Pattern
Preview components:
- Read-only rendering
- Match production styling
- Support responsive modes

## Best Practices

### 1. Content Organization
- Use Hero sections for page headers
- Group related content in Content sections
- Place CTAs strategically throughout
- Use FAQs for common questions

### 2. Performance
- Limit number of sections per page (< 20)
- Optimize images before upload
- Use lazy loading for galleries
- Enable schema markup for SEO

### 3. Mobile Optimization
- Always preview in mobile mode
- Use appropriate padding settings
- Test CTA button sizes
- Ensure readable font sizes

### 4. SEO Considerations
- Enable FAQ schema markup
- Use proper heading hierarchy
- Add alt text to all images
- Structure content semantically

## Future Enhancements

Planned features:

1. **Additional Section Types**
   - Stats/Numbers section
   - Team member section
   - Pricing tables
   - Newsletter signup
   - Contact forms

2. **Advanced Features**
   - Drag-and-drop section reordering
   - Section templates/presets
   - Custom CSS per section
   - A/B testing support
   - Version history
   - Collaborative editing

3. **Integrations**
   - Analytics tracking
   - Form submissions
   - Email integrations
   - CRM connections

4. **Editor Improvements**
   - Rich text WYSIWYG editor
   - Image editing tools
   - Video embedding preview
   - Color picker with brand colors
   - Font selector

## Troubleshooting

### Common Issues

**Issue**: Sections not saving
- Check console for API errors
- Verify content structure matches schema
- Ensure required fields are filled

**Issue**: Preview not updating
- Check if section is visible
- Verify onChange is being called
- Clear browser cache

**Issue**: Images not displaying
- Verify image URLs are accessible
- Check CORS settings
- Ensure images are uploaded

## Support & Documentation

For more information:
- See `/types/page-content.ts` for complete type definitions
- Check API routes in `/app/api/admin/pages/route.ts`
- Review component source in `/components/admin/page-builder/`

## License

This page builder is part of the ChatGPT PH project.
