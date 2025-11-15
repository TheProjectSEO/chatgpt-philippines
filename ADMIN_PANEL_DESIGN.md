# Admin Panel UI Design Specification
**Project**: ChatGPT Philippines CMS
**Version**: 1.0
**Last Updated**: 2025-11-16
**Design System**: Based on ChatGPT Philippines Design System v1.0

---

## Table of Contents
1. [Overview](#overview)
2. [Layout Architecture](#layout-architecture)
3. [Design System Integration](#design-system-integration)
4. [Component Specifications](#component-specifications)
5. [Wireframes](#wireframes)
6. [Implementation Examples](#implementation-examples)
7. [Accessibility Guidelines](#accessibility-guidelines)
8. [Mobile Responsiveness](#mobile-responsiveness)

---

## Overview

### Design Goals
- **Familiar UX**: WordPress-inspired interface for non-developer comfort
- **Mobile-First**: Fully responsive admin panel for on-the-go content management
- **Performance**: Fast, optimized components with minimal re-renders
- **Accessibility**: WCAG AA compliant for inclusive access
- **Brand Consistency**: Desert Titanium Orange theme throughout

### Target Users
- Content managers (non-technical)
- SEO specialists
- Marketing team members
- Site administrators

---

## Layout Architecture

### Master Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar                                                    │
│  [Logo] [Search] [Notifications] [Quick Actions] [Profile] │
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│  Sidebar   │  Content Area                                 │
│  (240px)   │  (Fluid)                                      │
│            │                                                │
│  Navigation│  - Page Editor (Split View)                   │
│  Menu      │  - List Views                                 │
│            │  - Forms                                       │
│  [Collapse]│  - Settings                                   │
│            │                                                │
└────────────┴────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- **Mobile**: < 768px (Drawer sidebar, stacked layout)
- **Tablet**: 768px - 1024px (Collapsible sidebar)
- **Desktop**: > 1024px (Fixed sidebar, split-screen editor)

### Layout Variants

#### Desktop (> 1024px)
```
┌──────────────────────────────────────────────────────────────────┐
│  Top Bar (64px height)                                           │
├────────────┬─────────────────────────────────────────────────────┤
│            │                                                     │
│  Sidebar   │  Content Area                                      │
│  240px     │  - Max width: calc(100vw - 240px)                  │
│  Fixed     │  - Padding: 32px                                   │
│            │                                                     │
│            │  Page Editor Split View:                           │
│  Nav       │  ┌────────────┬──────────────┐                     │
│  Items     │  │ Editor     │ Preview      │                     │
│            │  │ (60%)      │ (40%)        │                     │
│            │  │            │              │                     │
│  [Collapse]│  └────────────┴──────────────┘                     │
└────────────┴─────────────────────────────────────────────────────┘
```

#### Tablet (768px - 1024px)
```
┌──────────────────────────────────────────────────────────────────┐
│  Top Bar (with hamburger menu)                                   │
├────────────┬─────────────────────────────────────────────────────┤
│ Sidebar    │  Content Area (Stacked Editor)                      │
│ 200px      │  ┌───────────────────────────────┐                  │
│ Collapsible│  │ Editor (Full Width)           │                  │
│            │  │                               │                  │
│ [Toggle]   │  └───────────────────────────────┘                  │
│            │  ┌───────────────────────────────┐                  │
│            │  │ Preview (Below)               │                  │
│            │  │                               │                  │
│            │  └───────────────────────────────┘                  │
└────────────┴─────────────────────────────────────────────────────┘
```

#### Mobile (< 768px)
```
┌──────────────────────────────────┐
│  Top Bar + Hamburger             │
├──────────────────────────────────┤
│                                  │
│  Content Area (Full Width)       │
│                                  │
│  ┌────────────────────────────┐  │
│  │ Editor                     │  │
│  │ (Tabs for preview)         │  │
│  │                            │  │
│  │ [Edit] [Preview] [SEO]     │  │
│  │                            │  │
│  └────────────────────────────┘  │
│                                  │
│  Floating Action Button          │
│  (Save/Publish)                  │
└──────────────────────────────────┘

Sidebar: Drawer (slides from left)
```

---

## Design System Integration

### Color Palette (Admin-Specific)

```css
/* Admin Panel Colors - Extends ChatGPT PH Design System */
:root {
  /* Primary - Desert Titanium Orange (from brand) */
  --admin-primary: #E8844A;
  --admin-primary-hover: #D46D38;
  --admin-primary-light: #FFE6D5;
  --admin-primary-dark: #B85528;

  /* Sidebar Colors */
  --admin-sidebar-bg: #1C1917;           /* neutral-900 */
  --admin-sidebar-text: #F5F5F4;         /* neutral-100 */
  --admin-sidebar-text-muted: #A8A29E;   /* neutral-400 */
  --admin-sidebar-hover: #292524;        /* neutral-800 */
  --admin-sidebar-active: #44403C;       /* neutral-700 */
  --admin-sidebar-border: #44403C;

  /* Content Area */
  --admin-bg-primary: #FFFFFF;
  --admin-bg-secondary: #FAFAF9;         /* neutral-50 */
  --admin-bg-tertiary: #F5F5F4;          /* neutral-100 */

  /* Interactive Elements */
  --admin-input-bg: #FFFFFF;
  --admin-input-border: #E7E5E4;         /* neutral-200 */
  --admin-input-border-focus: #E8844A;   /* primary */
  --admin-input-text: #292524;           /* neutral-800 */

  /* Status Colors */
  --admin-success: #22C55E;
  --admin-error: #EF4444;
  --admin-warning: #F59E0B;
  --admin-info: #3B82F6;

  /* Shadows */
  --admin-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --admin-shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
                       0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --admin-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                     0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --admin-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                     0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

/* Dark Mode Support */
.admin-dark-mode {
  --admin-bg-primary: #1C1917;
  --admin-bg-secondary: #292524;
  --admin-bg-tertiary: #44403C;
  --admin-input-bg: #292524;
  --admin-input-border: #44403C;
  --admin-input-text: #F5F5F4;
}
```

### Typography Scale

```css
/* Admin Panel Typography */
.admin-heading-1 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2.25rem;      /* 36px */
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.025em;
  color: var(--neutral-900);
}

.admin-heading-2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.875rem;     /* 30px */
  font-weight: 600;
  line-height: 1.3;
  color: var(--neutral-800);
}

.admin-heading-3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.5rem;       /* 24px */
  font-weight: 600;
  line-height: 1.375;
  color: var(--neutral-800);
}

.admin-heading-4 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.25rem;      /* 20px */
  font-weight: 600;
  line-height: 1.5;
  color: var(--neutral-700);
}

.admin-body {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;     /* 14px */
  font-weight: 400;
  line-height: 1.5;
  color: var(--neutral-600);
}

.admin-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;     /* 14px */
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.025em;
  color: var(--neutral-700);
}

.admin-caption {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;      /* 12px */
  font-weight: 400;
  line-height: 1.5;
  color: var(--neutral-500);
}
```

### Spacing System

```css
/* Admin Panel Spacing - 8px base unit */
:root {
  --admin-space-1: 0.25rem;   /* 4px */
  --admin-space-2: 0.5rem;    /* 8px */
  --admin-space-3: 0.75rem;   /* 12px */
  --admin-space-4: 1rem;      /* 16px */
  --admin-space-5: 1.25rem;   /* 20px */
  --admin-space-6: 1.5rem;    /* 24px */
  --admin-space-8: 2rem;      /* 32px */
  --admin-space-10: 2.5rem;   /* 40px */
  --admin-space-12: 3rem;     /* 48px */
  --admin-space-16: 4rem;     /* 64px */

  /* Component-specific spacing */
  --admin-sidebar-width: 240px;
  --admin-sidebar-width-collapsed: 64px;
  --admin-topbar-height: 64px;
  --admin-content-padding: 2rem;         /* 32px */
  --admin-content-padding-mobile: 1rem;  /* 16px */
}
```

---

## Component Specifications

### 1. AdminLayout Component

**Purpose**: Master layout wrapper with sidebar and top bar

**Props**:
```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  breadcrumbs?: Breadcrumb[];
  showSidebar?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

interface Breadcrumb {
  label: string;
  href?: string;
}
```

**States**:
- `sidebarOpen` (boolean) - Controls sidebar visibility on mobile
- `sidebarCollapsed` (boolean) - Controls sidebar collapsed state on desktop
- `darkMode` (boolean) - Theme toggle

**Behavior**:
- Desktop: Fixed sidebar, always visible
- Tablet: Collapsible sidebar with toggle
- Mobile: Drawer sidebar, overlay on content
- Auto-collapse sidebar when clicking content area on mobile
- Save collapsed state to localStorage

**Accessibility**:
- Sidebar has `role="navigation"` and `aria-label="Main navigation"`
- Skip link to main content
- Keyboard shortcuts: `Alt + S` to toggle sidebar
- Focus trap in mobile drawer

---

### 2. PageEditorSplitView Component

**Purpose**: Split-screen editor with live preview

**Props**:
```typescript
interface PageEditorSplitViewProps {
  pageId?: string;
  initialContent?: PageContent;
  onSave: (content: PageContent) => Promise<void>;
  onPublish: (content: PageContent) => Promise<void>;
  autosaveInterval?: number; // milliseconds
}

interface PageContent {
  title: string;
  content: string;         // HTML or Markdown
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'scheduled';
  publishDate?: Date;
  seo: SEOMetadata;
  schema?: SchemaMarkup;
}
```

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Page Title Input                                       │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│  Editor Panel (60%)  │  Preview Panel (40%)             │
│                      │                                  │
│  - Content Blocks    │  ┌────────────────────────────┐  │
│  - WYSIWYG Editor    │  │ [Desktop][Tablet][Mobile]  │  │
│  - Featured Image    │  ├────────────────────────────┤  │
│  - Excerpt           │  │                            │  │
│  - Categories/Tags   │  │  Live Preview              │  │
│                      │  │  (Updates as you type)     │  │
│  [Save Draft]        │  │                            │  │
│  [Publish]           │  │                            │  │
│                      │  └────────────────────────────┘  │
│                      │                                  │
└──────────────────────┴──────────────────────────────────┘
```

**Features**:
- Auto-save every 30 seconds
- Manual save/publish buttons
- Revision history
- Preview in different viewport sizes
- SEO preview (Google SERP mockup)
- Schema markup preview

**Mobile Behavior**:
- Tabs: [Edit] [Preview] [SEO]
- Floating action button for save/publish
- Full-width panels

---

### 3. SEOMetaForm Component

**Purpose**: Comprehensive SEO metadata editor

**Props**:
```typescript
interface SEOMetaFormProps {
  pageId?: string;
  initialData?: SEOMetadata;
  onChange: (data: SEOMetadata) => void;
  showPreview?: boolean;
}

interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
}
```

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  SEO Settings                                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Page Title                                              │
│  ┌────────────────────────────────────────────────┐     │
│  │ ChatGPT Philippines | Free AI Chat            │ 45/60│
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  Meta Description                                        │
│  ┌────────────────────────────────────────────────┐     │
│  │ Free ChatGPT for Filipinos. Chat in Filipino  │     │
│  │ or English with AI assistant. No login.       │140/160│
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ▼ Open Graph Tags                                      │
│    ┌──────────────────────────────────────────────┐     │
│    │ OG Title, Description, Image                 │     │
│    └──────────────────────────────────────────────┘     │
│                                                          │
│  ▼ Twitter Card                                         │
│    ┌──────────────────────────────────────────────┐     │
│    │ Twitter Title, Description, Image            │     │
│    └──────────────────────────────────────────────┘     │
│                                                          │
│  ▼ Advanced                                             │
│    ☐ No Index   ☐ No Follow                             │
│    Canonical URL: [_______________________]             │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Preview                                                 │
│  ┌────────────────────────────────────────────────┐     │
│  │ Google Search Result Preview                   │     │
│  │ ┌────────────────────────────────────────────┐ │     │
│  │ │ ChatGPT Philippines | Free AI Chat        │ │     │
│  │ │ https://chatgpt.ph                         │ │     │
│  │ │ Free ChatGPT for Filipinos. Chat in...    │ │     │
│  │ └────────────────────────────────────────────┘ │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Features**:
- Real-time character count with warnings
- Google SERP preview
- Social media preview (Facebook, Twitter)
- Validation warnings (e.g., title too long)
- Auto-fill from page title
- Collapsible sections

---

### 4. FAQBuilder Component

**Purpose**: Drag-and-drop FAQ manager with schema markup

**Props**:
```typescript
interface FAQBuilderProps {
  pageId?: string;
  initialFAQs?: FAQ[];
  onChange: (faqs: FAQ[]) => void;
  maxItems?: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isExpanded?: boolean;
}
```

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  FAQ Manager                           [+ Add FAQ]       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ⋮⋮ How do I use ChatGPT Philippines?      ▼ [×]   │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Answer:                                            │ │
│  │ Simply type your question in Filipino or English  │ │
│  │ and our AI will respond instantly...              │ │
│  │                                                    │ │
│  │ [Edit Answer]                                      │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ⋮⋮ Is ChatGPT Philippines free?           ▲ [×]   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ⋮⋮ What languages are supported?          ▲ [×]   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Bulk Actions ▾]  [Generate Schema]                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Features**:
- Drag handles (⋮⋮) for reordering
- Expand/collapse items
- WYSIWYG editor for answers
- Auto-generate FAQPage schema
- Bulk delete
- Import/export JSON

**Accessibility**:
- Keyboard navigation (Tab, Enter, Arrow keys)
- Screen reader announcements for reordering
- ARIA labels for all controls

---

### 5. InternalLinkManager Component

**Purpose**: Smart internal link insertion tool

**Props**:
```typescript
interface InternalLinkManagerProps {
  onInsert: (link: InternalLink) => void;
  currentPageId?: string;
  excludePages?: string[];
}

interface InternalLink {
  text: string;
  url: string;
  pageTitle: string;
  openInNewTab?: boolean;
  rel?: string;
}
```

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  Insert Internal Link                             [×]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Search Pages                                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 🔍 Search by title, URL, or keyword...            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Results (showing 5 of 243 pages)                        │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ○ Filipino Chat Assistant                         │ │
│  │   /tools/filipino-chat                            │ │
│  │   Last updated: 2025-11-10                        │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ ○ Grammar Checker Tool                            │ │
│  │   /tools/grammar-checker                          │ │
│  │   Last updated: 2025-11-09                        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Link Text                                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Filipino Chat Assistant                            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ☐ Open in new tab                                      │
│                                                          │
│  [Cancel]                             [Insert Link]     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Features**:
- Fuzzy search across pages
- Filter by category/type
- Show last modified date
- Auto-suggest related pages
- Preview link context

---

### 6. MediaLibraryGrid Component

**Purpose**: Image management with upload and organization

**Props**:
```typescript
interface MediaLibraryGridProps {
  onSelect?: (media: MediaItem) => void;
  multiSelect?: boolean;
  allowUpload?: boolean;
  filters?: MediaFilter;
}

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: number;
  dimensions: { width: number; height: number };
  uploadDate: Date;
  alt?: string;
  caption?: string;
}
```

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  Media Library                         [Upload Files]    │
├──────────────────────────────────────────────────────────┤
│  [All] [Images] [Videos] [Documents]    [Grid][List]     │
│                                                          │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐    │
│  │ [Img] │ │ [Img] │ │ [Img] │ │ [Img] │ │ [Img] │    │
│  │       │ │   ✓   │ │       │ │       │ │       │    │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘    │
│  file1.jpg  file2.png  file3.jpg  file4.png  file5.jpg  │
│  120 KB     85 KB      210 KB     95 KB      150 KB     │
│                                                          │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ �───────      │
│  │ [Img] │ │ [Img] │ │ [Img] │ │ [Img] │              │
│  │       │ │       │ │       │ │       │              │
│  └───────┘ └───────┘ └───────┘ └───────┘              │
│                                                          │
│  [Bulk Actions ▾]      Selected: 1        [1][2][3]     │
│                                                          │
└──────────────────────────────────────────────────────────┘

Details Panel (when image selected):
┌──────────────────────────────────────┐
│  file2.png                    [×]    │
├──────────────────────────────────────┤
│  ┌──────────────────────────────┐   │
│  │                              │   │
│  │      [Image Preview]         │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                                      │
│  Filename: file2.png                 │
│  Size: 85 KB                         │
│  Dimensions: 1200x800                │
│  Uploaded: 2025-11-15                │
│                                      │
│  Alt Text                            │
│  ┌────────────────────────────────┐ │
│  │ ChatGPT Philippines logo       │ │
│  └────────────────────────────────┘ │
│                                      │
│  Caption (optional)                  │
│  ┌────────────────────────────────┐ │
│  │                                │ │
│  └────────────────────────────────┘ │
│                                      │
│  [Copy URL]  [Delete]  [Insert]     │
│                                      │
└──────────────────────────────────────┘
```

**Features**:
- Drag-and-drop upload
- Grid/List view toggle
- Multi-select with checkboxes
- Filter by type, date
- Image optimization on upload
- Bulk operations (delete, download)
- Alt text editor

---

### 7. PreviewFrame Component

**Purpose**: Responsive preview with device toggles

**Props**:
```typescript
interface PreviewFrameProps {
  content: string;
  baseUrl?: string;
  initialDevice?: 'desktop' | 'tablet' | 'mobile';
}
```

**Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  Preview                  [🖥️ Desktop][📱 Tablet][📱Mobile]│
├──────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐ │
│  │                                                    │ │
│  │  <iframe>                                          │ │
│  │    Rendered page content...                       │ │
│  │                                                    │ │
│  │                                                    │ │
│  │                                                    │ │
│  │  </iframe>                                         │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Refresh]  [Open in New Tab]         Last sync: 2s ago │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Device Dimensions**:
- Desktop: 1440px width
- Tablet: 768px width
- Mobile: 375px width

**Features**:
- Auto-refresh on content change (debounced)
- Device frame styling (optional)
- Scroll synchronization
- Console error display

---

### 8. PublishPanel Component

**Purpose**: Publishing controls with scheduling

**Props**:
```typescript
interface PublishPanelProps {
  status: 'draft' | 'published' | 'scheduled';
  publishDate?: Date;
  onSave: () => Promise<void>;
  onPublish: (date?: Date) => Promise<void>;
  onUnpublish: () => Promise<void>;
  lastSaved?: Date;
}
```

**Layout**:
```
┌──────────────────────────────────────┐
│  Publish                             │
├──────────────────────────────────────┤
│                                      │
│  Status                              │
│  ┌──────────────────────────────┐   │
│  │ Draft ▾                      │   │
│  └──────────────────────────────┘   │
│  • Draft                             │
│  • Published                         │
│  • Scheduled                         │
│                                      │
│  Visibility                          │
│  ○ Public                            │
│  ○ Private                           │
│  ○ Password Protected                │
│                                      │
│  Publish Date                        │
│  ┌──────────────────────────────┐   │
│  │ 📅 Nov 16, 2025  🕐 2:00 PM  │   │
│  └──────────────────────────────┘   │
│                                      │
│  Last saved: 10 seconds ago          │
│                                      │
│  [Save Draft]       [Publish Now]   │
│                                      │
└──────────────────────────────────────┘
```

**Features**:
- Auto-save indicator
- Schedule publishing
- Visibility controls
- Preview before publish
- Revision history link

---

## Wireframes

### 1. Dashboard View
```
┌──────────────────────────────────────────────────────────────────────┐
│  ChatGPT PH Admin                      🔍 Search    🔔  👤 Admin     │
├────────────┬─────────────────────────────────────────────────────────┤
│            │  Dashboard                                              │
│ 🏠 Dashboard│                                                         │
│            │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ 📄 Pages   │  │ 243      │ │ 8,425    │ │ 94.2%    │ │ 2m 15s   │  │
│   • All    │  │ Pages    │ │ Visits   │ │ Uptime   │ │ Avg Time │  │
│   • Tool   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│   • Static │                                                         │
│            │  Recent Pages                           [View All →]   │
│ 🎯 SEO     │  ┌──────────────────────────────────────────────────┐  │
│   Manager  │  │ Filipino Chat Tool      Draft    Nov 15  [Edit]  │  │
│            │  ├──────────────────────────────────────────────────┤  │
│ ❓ FAQs    │  │ Grammar Checker         Published Nov 14 [Edit]  │  │
│            │  ├──────────────────────────────────────────────────┤  │
│ 🔗 Internal│  │ Home Page Update        Published Nov 13 [Edit]  │  │
│   Links    │  └──────────────────────────────────────────────────┘  │
│            │                                                         │
│ 🖼️ Media   │  Quick Actions                                         │
│   Library  │  [+ New Page]  [SEO Audit]  [View Analytics]          │
│            │                                                         │
│ ⚙️ Settings│                                                         │
│            │                                                         │
│ 🌐 Preview │                                                         │
│   Site     │                                                         │
│            │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
```

### 2. Pages List View
```
┌──────────────────────────────────────────────────────────────────────┐
│  ChatGPT PH Admin                      🔍 Search    🔔  👤 Admin     │
├────────────┬─────────────────────────────────────────────────────────┤
│            │  All Pages                      [+ Add New Page]        │
│ 🏠 Dashboard│                                                         │
│            │  ┌──────────────────────────────────────────────────┐  │
│ 📄 Pages   │  │ 🔍 Search pages...              [All▾] [Sort▾]  │  │
│   • All    │  └──────────────────────────────────────────────────┘  │
│   • Tool   │                                                         │
│   • Static │  ┌──────────────────────────────────────────────────┐  │
│            │  │ ☐ Page Title              Status    Modified      │  │
│ 🎯 SEO     │  ├──────────────────────────────────────────────────┤  │
│   Manager  │  │ ☐ Filipino Chat Tool       Draft    Nov 15 [Edit]│  │
│            │  │   /tools/filipino-chat                            │  │
│ ❓ FAQs    │  ├──────────────────────────────────────────────────┤  │
│            │  │ ☐ Grammar Checker Tool     Published Nov 14 [Edit]│  │
│ 🔗 Internal│  │   /tools/grammar-checker                          │  │
│   Links    │  ├──────────────────────────────────────────────────┤  │
│            │  │ ☐ Home Page               Published Nov 13 [Edit]│  │
│ 🖼️ Media   │  │   /                                               │  │
│   Library  │  ├──────────────────────────────────────────────────┤  │
│            │  │ ☐ About Us                Published Nov 10 [Edit]│  │
│ ⚙️ Settings│  │   /about                                          │  │
│            │  └──────────────────────────────────────────────────┘  │
│ 🌐 Preview │                                                         │
│   Site     │  [Bulk Actions ▾]          Selected: 0    [1][2][3]   │
│            │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
```

### 3. Page Editor (Split View)
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  ChatGPT PH Admin                                 🔍 Search    🔔  👤 Admin      │
├────────────┬─────────────────────────────────────────────────────────────────────┤
│            │  Edit Page: Filipino Chat Tool                                      │
│ 🏠 Dashboard│                                                                     │
│            │  ┌──────────────────────────────────────────────────────────────┐  │
│ 📄 Pages   │  │ Page Title                                                   │  │
│   • All    │  │ Free Filipino ChatGPT - AI Chat Assistant                    │  │
│   • Tool   │  └──────────────────────────────────────────────────────────────┘  │
│   • Static │                                                                     │
│            │  ┌───────────────────────┬─────────────────────────────────────┐  │
│ 🎯 SEO     │  │ Editor                │ Preview                             │  │
│   Manager  │  │                       │ [🖥️][📱][📱]                         │  │
│            │  │ ┌───────────────────┐ │ ┌─────────────────────────────────┐ │  │
│ ❓ FAQs    │  │ │ B I U ≡ • ⊕       │ │ │                                 │ │  │
│            │  │ ├───────────────────┤ │ │  [Rendered Preview]             │ │  │
│ 🔗 Internal│  │ │                   │ │ │                                 │ │  │
│   Links    │  │ │ Chat naturally in │ │ │  Chat naturally in              │ │  │
│            │  │ │ Filipino or       │ │ │  Filipino or English...         │ │  │
│ 🖼️ Media   │  │ │ English with our  │ │ │                                 │ │  │
│   Library  │  │ │ free AI assistant │ │ │                                 │ │  │
│            │  │ │                   │ │ │                                 │ │  │
│ ⚙️ Settings│  │ └───────────────────┘ │ └─────────────────────────────────┘ │  │
│            │  │                       │                                     │  │
│ 🌐 Preview │  │ Featured Image        │ Last synced: 2s ago                 │  │
│   Site     │  │ [Upload]              │                                     │  │
│            │  │                       │                                     │  │
│            │  │ Excerpt               │                                     │  │
│            │  │ ┌───────────────────┐ │                                     │  │
│            │  │ │                   │ │                                     │  │
│            │  │ └───────────────────┘ │                                     │  │
│            │  │                       │                                     │  │
│            │  │ [💾 Save] [📤 Publish]│                                     │  │
│            │  │                       │                                     │  │
│            │  └───────────────────────┴─────────────────────────────────────┘  │
│            │  Last saved: 10 seconds ago                                        │
│            │                                                                     │
└────────────┴─────────────────────────────────────────────────────────────────────┘
```

### 4. SEO Manager
```
┌──────────────────────────────────────────────────────────────────────┐
│  ChatGPT PH Admin                      🔍 Search    🔔  👤 Admin     │
├────────────┬─────────────────────────────────────────────────────────┤
│            │  SEO Manager                                            │
│ 🏠 Dashboard│                                                         │
│            │  Select Page                                            │
│ 📄 Pages   │  ┌──────────────────────────────────────────────────┐  │
│            │  │ Filipino Chat Tool ▾                             │  │
│ 🎯 SEO     │  └──────────────────────────────────────────────────┘  │
│   Manager  │                                                         │
│            │  Title Tag                             [Auto-generate] │
│ ❓ FAQs    │  ┌──────────────────────────────────────────────────┐  │
│            │  │ Free Filipino ChatGPT - AI Chat Assistant       │  │
│ 🔗 Internal│  └──────────────────────────────────────────────────┘  │
│   Links    │  45/60 characters  ✓ Good length                       │
│            │                                                         │
│ 🖼️ Media   │  Meta Description                      [Auto-generate] │
│   Library  │  ┌──────────────────────────────────────────────────┐  │
│            │  │ Chat naturally in Filipino or English with our   │  │
│ ⚙️ Settings│  │ free AI assistant. No login required. Get        │  │
│            │  │ instant responses 24/7.                          │  │
│ 🌐 Preview │  └──────────────────────────────────────────────────┘  │
│   Site     │  140/160 characters  ✓ Good length                     │
│            │                                                         │
│            │  ▼ Open Graph Tags                                     │
│            │    OG Title, Description, Image...                     │
│            │                                                         │
│            │  ▼ Twitter Card                                        │
│            │    Twitter meta tags...                                │
│            │                                                         │
│            │  ▼ Schema Markup                                       │
│            │    ┌────────────────────────────────────────────────┐ │
│            │    │ Type: WebPage ▾                                │ │
│            │    │ [View JSON] [Edit Custom]                      │ │
│            │    └────────────────────────────────────────────────┘ │
│            │                                                         │
│            │  Preview                                               │
│            │  ┌──────────────────────────────────────────────────┐ │
│            │  │ Google Search Result:                            │ │
│            │  │ ┌──────────────────────────────────────────────┐ │ │
│            │  │ │ Free Filipino ChatGPT - AI Chat Assistant   │ │ │
│            │  │ │ https://chatgpt.ph/tools/filipino-chat      │ │ │
│            │  │ │ Chat naturally in Filipino or English...    │ │ │
│            │  │ └──────────────────────────────────────────────┘ │ │
│            │  └──────────────────────────────────────────────────┘ │
│            │                                                         │
│            │  [Save Changes]                                        │
│            │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
```

### 5. Mobile View (Page Editor)
```
┌────────────────────────────────────┐
│  ☰  Filipino Chat Tool    [•••]   │
├────────────────────────────────────┤
│                                    │
│  Page Title                        │
│  ┌──────────────────────────────┐ │
│  │ Free Filipino ChatGPT...     │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Edit] [Preview] [SEO]            │
│  ──────                            │
│                                    │
│  Content                           │
│  ┌──────────────────────────────┐ │
│  │ B I U ≡ • ⊕                  │ │
│  ├──────────────────────────────┤ │
│  │                              │ │
│  │ Chat naturally in Filipino   │ │
│  │ or English with our free     │ │
│  │ AI assistant...              │ │
│  │                              │ │
│  │                              │ │
│  │                              │ │
│  └──────────────────────────────┘ │
│                                    │
│  Featured Image                    │
│  [Upload Image]                    │
│                                    │
│  Excerpt                           │
│  ┌──────────────────────────────┐ │
│  │                              │ │
│  └──────────────────────────────┘ │
│                                    │
│                                    │
│                                    │
│  Last saved: 10s ago               │
│                                    │
│                 ┌────────────────┐ │
│                 │ 💾 Save        │ │
│                 └────────────────┘ │
│                 Floating Action    │
│                                    │
└────────────────────────────────────┘

Sidebar (Drawer - slides from left):
┌────────────────────────────────────┐
│  ChatGPT PH Admin         [×]      │
├────────────────────────────────────┤
│                                    │
│  👤 Admin User                     │
│                                    │
│  🏠 Dashboard                      │
│  📄 Pages                          │
│  🎯 SEO Manager                    │
│  ❓ FAQs                           │
│  🔗 Internal Links                 │
│  🖼️ Media Library                  │
│  ⚙️ Settings                       │
│                                    │
│  🌐 Preview Site                   │
│                                    │
│  🌙 Dark Mode    [Toggle]          │
│                                    │
│  [Logout]                          │
│                                    │
└────────────────────────────────────┘
```

---

## Implementation Examples

### Example 1: AdminLayout Component

```typescript
// /Users/adityaaman/Desktop/ChatGPTPH/components/admin/AdminLayout.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Home,
  FileText,
  Target,
  HelpCircle,
  Link2,
  Image,
  Settings,
  Globe,
  ChevronLeft,
  Search,
  Bell,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  breadcrumbs?: Breadcrumb[];
  showSidebar?: boolean;
}

interface Breadcrumb {
  label: string;
  href?: string;
}

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
  children?: NavItem[];
  badge?: number;
}

export default function AdminLayout({
  children,
  pageTitle,
  breadcrumbs,
  showSidebar = true,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Navigation items
  const navItems: NavItem[] = [
    { icon: Home, label: 'Dashboard', href: '/admin' },
    {
      icon: FileText,
      label: 'Pages',
      href: '/admin/pages',
      children: [
        { icon: FileText, label: 'All Pages', href: '/admin/pages' },
        { icon: FileText, label: 'Tool Pages', href: '/admin/pages/tools' },
        { icon: FileText, label: 'Static Pages', href: '/admin/pages/static' },
      ]
    },
    { icon: Target, label: 'SEO Manager', href: '/admin/seo' },
    { icon: HelpCircle, label: 'FAQs', href: '/admin/faqs' },
    { icon: Link2, label: 'Internal Links', href: '/admin/internal-links' },
    { icon: Image, label: 'Media Library', href: '/admin/media' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when clicking content
  const handleContentClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="admin-layout min-h-screen bg-neutral-50">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 z-40">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {showSidebar && (
              <button
                onClick={() => isMobile ? setSidebarOpen(!sidebarOpen) : setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label={isMobile ? 'Toggle sidebar' : 'Collapse sidebar'}
              >
                {sidebarOpen || !sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
              </button>
            )}
            <h1 className="text-lg font-semibold text-neutral-900">
              ChatGPT PH Admin
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-neutral-600" />
            </button>

            {/* Notifications */}
            <button
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-neutral-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
            </button>

            {/* User menu */}
            <button
              className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-600" />
              </div>
              <span className="hidden sm:inline text-sm font-medium text-neutral-700">
                Admin
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Mobile overlay */}
          <AnimatePresence>
            {isMobile && sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{
              x: isMobile && !sidebarOpen ? '-100%' : 0,
              width: !isMobile && sidebarCollapsed ? '64px' : '240px',
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-16 left-0 bottom-0 bg-neutral-900 text-neutral-100 z-40 overflow-y-auto"
            role="navigation"
            aria-label="Main navigation"
          >
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <NavItemComponent
                  key={item.href}
                  item={item}
                  collapsed={sidebarCollapsed && !isMobile}
                />
              ))}

              {/* Preview Site - Special styling */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors text-primary-400 hover:text-primary-300 mt-8"
              >
                <Globe size={20} />
                {(!sidebarCollapsed || isMobile) && (
                  <span className="text-sm font-medium">Preview Site</span>
                )}
              </a>
            </nav>
          </motion.aside>
        </>
      )}

      {/* Main content */}
      <main
        id="main-content"
        onClick={handleContentClick}
        className={`pt-16 transition-all duration-300 ${
          showSidebar
            ? sidebarCollapsed && !isMobile
              ? 'md:pl-16'
              : 'md:pl-60'
            : ''
        }`}
      >
        <div className="p-4 md:p-8">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center gap-2 text-sm text-neutral-600">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {index > 0 && <span>/</span>}
                    {crumb.href ? (
                      <a href={crumb.href} className="hover:text-primary-600">
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-neutral-900 font-medium">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Page title */}
          {pageTitle && (
            <h1 className="text-3xl font-bold text-neutral-900 mb-6">
              {pageTitle}
            </h1>
          )}

          {/* Page content */}
          {children}
        </div>
      </main>
    </div>
  );
}

// Navigation item component
function NavItemComponent({
  item,
  collapsed
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <a
        href={item.href}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors group"
      >
        <item.icon size={20} className="flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="text-sm font-medium flex-1">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </a>

      {/* Children */}
      {hasChildren && expanded && !collapsed && (
        <div className="ml-8 mt-1 space-y-1">
          {item.children!.map((child) => (
            <a
              key={child.href}
              href={child.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-neutral-100"
            >
              <span className="text-sm">{child.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Example 2: PageEditorSplitView Component

```typescript
// /Users/adityaaman/Desktop/ChatGPTPH/components/admin/PageEditorSplitView.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Save, Send, Eye, EyeOff, Monitor, Tablet, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageEditorSplitViewProps {
  pageId?: string;
  initialContent?: PageContent;
  onSave: (content: PageContent) => Promise<void>;
  onPublish: (content: PageContent) => Promise<void>;
  autosaveInterval?: number;
}

interface PageContent {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'scheduled';
  publishDate?: Date;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function PageEditorSplitView({
  pageId,
  initialContent,
  onSave,
  onPublish,
  autosaveInterval = 30000,
}: PageEditorSplitViewProps) {
  const [content, setContent] = useState<PageContent>(
    initialContent || {
      title: '',
      content: '',
      status: 'draft',
    }
  );
  const [showPreview, setShowPreview] = useState(true);
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      autosaveTimerRef.current = setTimeout(async () => {
        await handleSave(true);
      }, autosaveInterval);
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [content, hasUnsavedChanges]);

  const handleSave = async (isAutosave = false) => {
    setSaving(true);
    try {
      await onSave(content);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      if (!isAutosave) {
        // Show success toast
        console.log('Saved successfully');
      }
    } catch (error) {
      console.error('Save failed:', error);
      // Show error toast
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await onPublish({ ...content, status: 'published' });
      setContent((prev) => ({ ...prev, status: 'published' }));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      // Show success toast
    } catch (error) {
      console.error('Publish failed:', error);
      // Show error toast
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (updates: Partial<PageContent>) => {
    setContent((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  const getPreviewWidth = () => {
    switch (device) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never saved';

    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return lastSaved.toLocaleTimeString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-4 space-y-4">
        {/* Title */}
        <input
          type="text"
          value={content.title}
          onChange={(e) => updateContent({ title: e.target.value })}
          placeholder="Enter page title..."
          className="w-full text-2xl font-bold border-none outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
          aria-label="Page title"
        />

        {/* Actions bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left side - Preview toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors text-sm font-medium"
              aria-label={showPreview ? 'Hide preview' : 'Show preview'}
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="hidden sm:inline">
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </span>
            </button>

            {showPreview && (
              <div className="flex items-center gap-1 border border-neutral-200 rounded-lg p-1">
                <button
                  onClick={() => setDevice('desktop')}
                  className={`p-2 rounded ${device === 'desktop' ? 'bg-primary-100 text-primary-600' : 'hover:bg-neutral-100'}`}
                  aria-label="Desktop preview"
                >
                  <Monitor size={16} />
                </button>
                <button
                  onClick={() => setDevice('tablet')}
                  className={`p-2 rounded ${device === 'tablet' ? 'bg-primary-100 text-primary-600' : 'hover:bg-neutral-100'}`}
                  aria-label="Tablet preview"
                >
                  <Tablet size={16} />
                </button>
                <button
                  onClick={() => setDevice('mobile')}
                  className={`p-2 rounded ${device === 'mobile' ? 'bg-primary-100 text-primary-600' : 'hover:bg-neutral-100'}`}
                  aria-label="Mobile preview"
                >
                  <Smartphone size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Right side - Save/Publish */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">
              {saving ? 'Saving...' : `Last saved: ${formatLastSaved()}`}
            </span>

            <button
              onClick={() => handleSave(false)}
              disabled={saving || !hasUnsavedChanges}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
            >
              <Save size={16} />
              Save Draft
            </button>

            <button
              onClick={handlePublish}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
            >
              <Send size={16} />
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor panel */}
        <div className={`${showPreview ? 'w-full lg:w-3/5' : 'w-full'} overflow-y-auto bg-white border-r border-neutral-200`}>
          <div className="p-6 space-y-6">
            {/* Content editor */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Content
              </label>
              <div className="border border-neutral-300 rounded-lg">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-neutral-200 bg-neutral-50">
                  <button className="p-2 hover:bg-neutral-200 rounded" title="Bold">
                    <strong>B</strong>
                  </button>
                  <button className="p-2 hover:bg-neutral-200 rounded" title="Italic">
                    <em>I</em>
                  </button>
                  <button className="p-2 hover:bg-neutral-200 rounded" title="Underline">
                    <u>U</u>
                  </button>
                  <div className="w-px h-6 bg-neutral-300 mx-1" />
                  <button className="p-2 hover:bg-neutral-200 rounded" title="Heading">H</button>
                  <button className="p-2 hover:bg-neutral-200 rounded" title="List">≡</button>
                  <button className="p-2 hover:bg-neutral-200 rounded" title="Link">🔗</button>
                </div>

                {/* Text area */}
                <textarea
                  value={content.content}
                  onChange={(e) => updateContent({ content: e.target.value })}
                  placeholder="Start writing your content..."
                  className="w-full min-h-[400px] p-4 border-none outline-none resize-none font-body"
                  aria-label="Page content"
                />
              </div>
            </div>

            {/* Featured image */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Featured Image
              </label>
              <button className="w-full p-8 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <div className="text-center">
                  <div className="text-neutral-400 mb-2">📷</div>
                  <div className="text-sm font-medium text-neutral-700">
                    Upload Image
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    PNG, JPG up to 10MB
                  </div>
                </div>
              </button>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={content.excerpt || ''}
                onChange={(e) => updateContent({ excerpt: e.target.value })}
                placeholder="Write a short excerpt..."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                aria-label="Page excerpt"
              />
            </div>
          </div>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="hidden lg:block w-2/5 bg-neutral-100 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-700">Preview</h3>
                <span className="text-xs text-neutral-500">
                  Last synced: 2s ago
                </span>
              </div>

              {/* Preview frame */}
              <motion.div
                animate={{ width: getPreviewWidth() }}
                transition={{ type: 'spring', damping: 20 }}
                className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                    {content.title || 'Untitled Page'}
                  </h1>
                  <div
                    className="prose prose-neutral max-w-none"
                    dangerouslySetInnerHTML={{ __html: content.content || '<p class="text-neutral-400">Start writing to see preview...</p>' }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### Example 3: SEOMetaForm Component

```typescript
// /Users/adityaaman/Desktop/ChatGPTPH/components/admin/SEOMetaForm.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, Wand2 } from 'lucide-react';

interface SEOMetaFormProps {
  pageId?: string;
  initialData?: SEOMetadata;
  onChange: (data: SEOMetadata) => void;
  showPreview?: boolean;
}

interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'success' | 'warning' | 'error';
}

export default function SEOMetaForm({
  pageId,
  initialData,
  onChange,
  showPreview = true,
}: SEOMetaFormProps) {
  const [data, setData] = useState<SEOMetadata>(
    initialData || {
      title: '',
      description: '',
    }
  );
  const [ogExpanded, setOgExpanded] = useState(false);
  const [twitterExpanded, setTwitterExpanded] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  // Update parent when data changes
  useEffect(() => {
    onChange(data);
  }, [data, onChange]);

  const updateData = (updates: Partial<SEOMetadata>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  // Validation functions
  const validateTitle = (title: string): ValidationResult => {
    const length = title.length;
    if (length === 0) {
      return { isValid: false, message: 'Title is required', type: 'error' };
    }
    if (length < 30) {
      return { isValid: false, message: 'Title is too short (min 30 chars)', type: 'warning' };
    }
    if (length > 60) {
      return { isValid: false, message: 'Title is too long (max 60 chars)', type: 'warning' };
    }
    return { isValid: true, message: 'Title length is optimal', type: 'success' };
  };

  const validateDescription = (description: string): ValidationResult => {
    const length = description.length;
    if (length === 0) {
      return { isValid: false, message: 'Description is required', type: 'error' };
    }
    if (length < 120) {
      return { isValid: false, message: 'Description is too short (min 120 chars)', type: 'warning' };
    }
    if (length > 160) {
      return { isValid: false, message: 'Description is too long (max 160 chars)', type: 'warning' };
    }
    return { isValid: true, message: 'Description length is optimal', type: 'success' };
  };

  const titleValidation = validateTitle(data.title);
  const descriptionValidation = validateDescription(data.description);

  // Auto-generate OG tags from main SEO
  const autoFillOGTags = () => {
    updateData({
      ogTitle: data.title,
      ogDescription: data.description,
    });
  };

  // Auto-generate Twitter tags
  const autoFillTwitterTags = () => {
    updateData({
      twitterTitle: data.title,
      twitterDescription: data.description,
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-neutral-700">
            Title Tag
          </label>
          <button
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
            aria-label="Auto-generate title"
          >
            <Wand2 size={12} />
            Auto-generate
          </button>
        </div>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Enter SEO title..."
          maxLength={70}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          aria-label="SEO title"
        />
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            {titleValidation.type === 'success' && (
              <CheckCircle size={14} className="text-success-600" />
            )}
            {titleValidation.type === 'warning' && (
              <AlertCircle size={14} className="text-warning-600" />
            )}
            {titleValidation.type === 'error' && (
              <AlertCircle size={14} className="text-error-600" />
            )}
            <span className={`text-xs ${
              titleValidation.type === 'success' ? 'text-success-600' :
              titleValidation.type === 'warning' ? 'text-warning-600' :
              'text-error-600'
            }`}>
              {titleValidation.message}
            </span>
          </div>
          <span className={`text-xs ${
            data.title.length > 60 ? 'text-error-600' : 'text-neutral-500'
          }`}>
            {data.title.length}/60
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-neutral-700">
            Meta Description
          </label>
          <button
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
            aria-label="Auto-generate description"
          >
            <Wand2 size={12} />
            Auto-generate
          </button>
        </div>
        <textarea
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Enter meta description..."
          rows={3}
          maxLength={170}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          aria-label="Meta description"
        />
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            {descriptionValidation.type === 'success' && (
              <CheckCircle size={14} className="text-success-600" />
            )}
            {descriptionValidation.type === 'warning' && (
              <AlertCircle size={14} className="text-warning-600" />
            )}
            {descriptionValidation.type === 'error' && (
              <AlertCircle size={14} className="text-error-600" />
            )}
            <span className={`text-xs ${
              descriptionValidation.type === 'success' ? 'text-success-600' :
              descriptionValidation.type === 'warning' ? 'text-warning-600' :
              'text-error-600'
            }`}>
              {descriptionValidation.message}
            </span>
          </div>
          <span className={`text-xs ${
            data.description.length > 160 ? 'text-error-600' : 'text-neutral-500'
          }`}>
            {data.description.length}/160
          </span>
        </div>
      </div>

      {/* Open Graph Tags */}
      <div className="border border-neutral-200 rounded-lg">
        <button
          onClick={() => setOgExpanded(!ogExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
        >
          <span className="font-medium text-neutral-900">Open Graph Tags</span>
          {ogExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {ogExpanded && (
          <div className="p-4 border-t border-neutral-200 space-y-4">
            <button
              onClick={autoFillOGTags}
              className="text-sm text-primary-600 hover:text-primary-700 mb-2"
            >
              Auto-fill from SEO fields
            </button>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                OG Title
              </label>
              <input
                type="text"
                value={data.ogTitle || ''}
                onChange={(e) => updateData({ ogTitle: e.target.value })}
                placeholder="Facebook/LinkedIn title"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                OG Description
              </label>
              <textarea
                value={data.ogDescription || ''}
                onChange={(e) => updateData({ ogDescription: e.target.value })}
                placeholder="Facebook/LinkedIn description"
                rows={2}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                OG Image URL
              </label>
              <input
                type="url"
                value={data.ogImage || ''}
                onChange={(e) => updateData({ ogImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Twitter Card */}
      <div className="border border-neutral-200 rounded-lg">
        <button
          onClick={() => setTwitterExpanded(!twitterExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
        >
          <span className="font-medium text-neutral-900">Twitter Card</span>
          {twitterExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {twitterExpanded && (
          <div className="p-4 border-t border-neutral-200 space-y-4">
            <button
              onClick={autoFillTwitterTags}
              className="text-sm text-primary-600 hover:text-primary-700 mb-2"
            >
              Auto-fill from SEO fields
            </button>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Twitter Card Type
              </label>
              <select
                value={data.twitterCard || 'summary'}
                onChange={(e) => updateData({ twitterCard: e.target.value as any })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Twitter Title
              </label>
              <input
                type="text"
                value={data.twitterTitle || ''}
                onChange={(e) => updateData({ twitterTitle: e.target.value })}
                placeholder="Twitter title"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Advanced */}
      <div className="border border-neutral-200 rounded-lg">
        <button
          onClick={() => setAdvancedExpanded(!advancedExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
        >
          <span className="font-medium text-neutral-900">Advanced</span>
          {advancedExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {advancedExpanded && (
          <div className="p-4 border-t border-neutral-200 space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.noindex || false}
                  onChange={(e) => updateData({ noindex: e.target.checked })}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">No Index</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.nofollow || false}
                  onChange={(e) => updateData({ nofollow: e.target.checked })}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">No Follow</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Canonical URL
              </label>
              <input
                type="url"
                value={data.canonicalUrl || ''}
                onChange={(e) => updateData({ canonicalUrl: e.target.value })}
                placeholder="https://example.com/canonical-page"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">
            Google Search Result Preview
          </h3>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-xl text-blue-600 hover:underline cursor-pointer">
              {data.title || 'Page Title'}
            </div>
            <div className="text-sm text-green-700 mt-1">
              https://chatgpt.ph/example-page
            </div>
            <div className="text-sm text-neutral-600 mt-2">
              {data.description || 'Meta description will appear here...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Accessibility Guidelines

### Keyboard Navigation

1. **Tab Order**: Logical flow from top to bottom, left to right
2. **Focus Indicators**: Visible 2px outline on all interactive elements
3. **Keyboard Shortcuts**:
   - `Alt + S`: Toggle sidebar
   - `Ctrl + S` / `Cmd + S`: Save
   - `Ctrl + Enter`: Publish
   - `Esc`: Close modals/drawers
   - `?`: Show keyboard shortcuts help

### Screen Reader Support

1. **Semantic HTML**: Use proper heading hierarchy (h1 → h2 → h3)
2. **ARIA Labels**: All buttons, inputs, and interactive elements
3. **ARIA Live Regions**: For auto-save notifications, status updates
4. **Skip Links**: "Skip to main content" at top of page
5. **Form Labels**: Every input has associated label

### Color Contrast

All text meets **WCAG AA** minimum ratios:
- Normal text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1

### Motion & Animation

1. **Respect `prefers-reduced-motion`**
2. **Disable animations** for users who request it
3. **Functional animations only** (no decorative motion)

---

## Mobile Responsiveness

### Mobile-First Approach

1. **Base styles**: Designed for 320px width
2. **Progressive enhancement**: Add features for larger screens
3. **Touch targets**: Minimum 44x44px for all interactive elements
4. **Readable text**: Minimum 16px font size (no zooming required)

### Breakpoint Strategy

```css
/* Mobile: < 768px (default) */
.sidebar { display: none; }

/* Tablet: 768px - 1024px */
@media (min-width: 768px) {
  .sidebar { display: block; width: 200px; }
  .editor { display: block; }
  .preview { display: none; } /* Tabs instead */
}

/* Desktop: > 1024px */
@media (min-width: 1024px) {
  .sidebar { width: 240px; }
  .editor { width: 60%; }
  .preview { display: block; width: 40%; }
}
```

### Mobile Optimizations

1. **Drawer sidebar**: Overlay navigation
2. **Stacked editor**: Tabs for Edit/Preview/SEO
3. **Floating action button**: Save/Publish always accessible
4. **Simplified toolbar**: Essential actions only
5. **Bottom navigation** (optional): Quick access to key sections

---

## Performance Optimization

### Component Performance

1. **React.memo**: Wrap expensive components
2. **useMemo/useCallback**: Prevent unnecessary re-renders
3. **Lazy loading**: Code-split large components
4. **Debouncing**: Auto-save, search, preview updates

### Example Optimization:

```typescript
// Debounced auto-save
const debouncedSave = useMemo(
  () => debounce(async (content) => {
    await onSave(content);
  }, 500),
  [onSave]
);

// Memoized preview
const previewContent = useMemo(
  () => renderMarkdown(content.content),
  [content.content]
);
```

---

## Next Steps

1. **Install shadcn/ui**: Set up component library
2. **Implement AdminLayout**: Core layout with sidebar
3. **Build PageEditor**: Split-view editor component
4. **Add SEO Manager**: Metadata editing tool
5. **Create FAQ Builder**: Drag-drop FAQ interface
6. **Integrate with backend**: Connect to your Next.js API routes
7. **Testing**: Accessibility audit, mobile testing, browser compatibility
8. **Documentation**: User guide for content managers

---

**End of Admin Panel Design Specification v1.0**
