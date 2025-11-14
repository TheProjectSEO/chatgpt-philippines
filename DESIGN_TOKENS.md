# Design Tokens Reference
## HeyGPT.ph CSS Variables

**Version**: 1.0
**Last Updated**: 2025-11-13
**Purpose**: Complete CSS custom properties reference for consistent implementation

---

## Table of Contents

1. [Installation](#installation)
2. [Colors](#colors)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Layout](#layout)
6. [Borders](#borders)
7. [Shadows](#shadows)
8. [Effects](#effects)
9. [Animation](#animation)
10. [Z-Index](#z-index)
11. [Breakpoints](#breakpoints)
12. [Usage Examples](#usage-examples)

---

## Installation

### 1. Create Global CSS File

**File**: `app/globals.css` (or similar)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

:root {
  /* Copy all tokens from sections below */
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--neutral-900);
  background: var(--neutral-50);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 2. Import in Root Layout

```tsx
// app/layout.tsx
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

---

## Colors

### Desert Titanium Orange (Primary Brand)

```css
:root {
  /* Primary - Desert Titanium Orange */
  --primary-50: #FFF4ED;
  --primary-100: #FFE6D5;
  --primary-200: #FFCCAB;
  --primary-300: #FFB380;
  --primary-400: #FF9A56;
  --primary-500: #E8844A; /* Base - Main brand color */
  --primary-600: #D46D38; /* Hover states */
  --primary-700: #B85528; /* Pressed/active states */
  --primary-800: #9A421A; /* Dark mode emphasis */
  --primary-900: #7A3214; /* Deep shadows */
}
```

### Neutrals (Grays)

```css
:root {
  /* Neutrals */
  --neutral-50: #F9FAFB;   /* Page backgrounds */
  --neutral-100: #F3F4F6;  /* Card backgrounds */
  --neutral-200: #E5E7EB;  /* Borders (light) */
  --neutral-300: #D1D5DB;  /* Borders (medium) */
  --neutral-400: #9CA3AF;  /* Disabled text */
  --neutral-500: #6B7280;  /* Secondary text */
  --neutral-600: #4B5563;  /* Body text (light bg) */
  --neutral-700: #374151;  /* Headings */
  --neutral-800: #1F2937;  /* Strong emphasis */
  --neutral-900: #111827;  /* Maximum contrast */
}
```

### Semantic Colors

```css
:root {
  /* Success */
  --success-50: #ECFDF5;
  --success-100: #D1FAE5;
  --success-500: #10B981; /* Base success */
  --success-600: #059669;
  --success-700: #047857;

  /* Error */
  --error-50: #FEF2F2;
  --error-100: #FEE2E2;
  --error-500: #EF4444; /* Base error */
  --error-600: #DC2626;
  --error-700: #B91C1C;

  /* Warning */
  --warning-50: #FFFBEB;
  --warning-100: #FEF3C7;
  --warning-500: #F59E0B; /* Base warning */
  --warning-600: #D97706;
  --warning-700: #B45309;

  /* Info */
  --info-50: #EFF6FF;
  --info-100: #DBEAFE;
  --info-500: #3B82F6; /* Base info */
  --info-600: #2563EB;
  --info-700: #1D4ED8;
}
```

### Special Effects

```css
:root {
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #FFB380 0%, #E8844A 50%, #D46D38 100%);
  --gradient-brand: linear-gradient(135deg, #FFB380 0%, #E8844A 50%, #A78BFA 100%);
  --gradient-hero: linear-gradient(180deg, #FFF4ED 0%, #FFFFFF 100%);

  /* Text gradients */
  --gradient-text-primary: linear-gradient(135deg, #E8844A 0%, #D46D38 100%);
  --gradient-text-brand: linear-gradient(135deg, #FFB380 0%, #E8844A 50%, #A78BFA 100%);

  /* Overlays */
  --overlay-light: rgba(255, 255, 255, 0.9);
  --overlay-dark: rgba(17, 24, 39, 0.75);
  --overlay-primary: rgba(232, 132, 74, 0.1);
}
```

---

## Typography

### Font Families

```css
:root {
  --font-display: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
}
```

### Font Sizes

```css
:root {
  /* Font sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px - Body text */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px - Hero headings */
  --text-6xl: 3.75rem;    /* 60px - Large displays */
  --text-7xl: 4.5rem;     /* 72px - Extra large */
}
```

### Font Weights

```css
:root {
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

### Line Heights

```css
:root {
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;   /* Default body text */
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### Letter Spacing

```css
:root {
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
}
```

---

## Spacing

### Base Spacing Scale (8px base unit)

```css
:root {
  /* Spacing scale */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
  --space-40: 10rem;    /* 160px */
  --space-48: 12rem;    /* 192px */
  --space-56: 14rem;    /* 224px */
  --space-64: 16rem;    /* 256px */
}
```

### Component-Specific Spacing

```css
:root {
  /* Padding */
  --padding-btn-sm: var(--space-2) var(--space-4);    /* 8px 16px */
  --padding-btn-md: var(--space-3) var(--space-6);    /* 12px 24px */
  --padding-btn-lg: var(--space-4) var(--space-8);    /* 16px 32px */

  --padding-card-sm: var(--space-4);                   /* 16px */
  --padding-card-md: var(--space-6);                   /* 24px */
  --padding-card-lg: var(--space-8);                   /* 32px */

  --padding-input: var(--space-3) var(--space-4);      /* 12px 16px */

  /* Gap */
  --gap-xs: var(--space-2);  /* 8px */
  --gap-sm: var(--space-4);  /* 16px */
  --gap-md: var(--space-6);  /* 24px */
  --gap-lg: var(--space-8);  /* 32px */
  --gap-xl: var(--space-12); /* 48px */
}
```

---

## Layout

### Container Widths

```css
:root {
  /* Max widths */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;

  /* Content widths */
  --content-narrow: 600px;   /* Blog posts */
  --content-medium: 800px;   /* Articles */
  --content-wide: 1000px;    /* Marketing pages */
}
```

### Section Spacing

```css
:root {
  /* Vertical section spacing */
  --section-spacing-mobile: var(--space-16);   /* 64px */
  --section-spacing-desktop: var(--space-24);  /* 96px */

  /* Header heights */
  --header-height-mobile: 56px;
  --header-height-desktop: 72px;

  /* Footer spacing */
  --footer-padding: var(--space-12);           /* 48px */
}
```

---

## Borders

### Border Widths

```css
:root {
  --border-0: 0;
  --border-1: 1px;
  --border-2: 2px;
  --border-4: 4px;
  --border-8: 8px;
}
```

### Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px - Small elements */
  --radius-base: 0.375rem; /* 6px - Default */
  --radius-md: 0.5rem;     /* 8px - Cards, inputs */
  --radius-lg: 0.75rem;    /* 12px - Buttons, modals */
  --radius-xl: 1rem;       /* 16px - Large cards */
  --radius-2xl: 1.5rem;    /* 24px - Hero sections */
  --radius-full: 9999px;   /* Circular - Badges, avatars */
}
```

### Border Colors

```css
:root {
  --border-light: var(--neutral-200);
  --border-medium: var(--neutral-300);
  --border-dark: var(--neutral-400);
  --border-primary: var(--primary-500);
  --border-error: var(--error-500);
  --border-success: var(--success-500);
}
```

---

## Shadows

### Standard Shadows (with warm orange tint)

```css
:root {
  /* Elevation shadows */
  --shadow-xs: 0 1px 2px 0 rgba(232, 132, 74, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(232, 132, 74, 0.1),
               0 1px 2px -1px rgba(232, 132, 74, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(232, 132, 74, 0.1),
               0 2px 4px -2px rgba(232, 132, 74, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(232, 132, 74, 0.1),
               0 4px 6px -4px rgba(232, 132, 74, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(232, 132, 74, 0.1),
               0 8px 10px -6px rgba(232, 132, 74, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(232, 132, 74, 0.25);

  /* Component-specific shadows */
  --shadow-card: var(--shadow-sm);
  --shadow-button: var(--shadow-sm);
  --shadow-modal: var(--shadow-2xl);
  --shadow-dropdown: var(--shadow-lg);
}
```

### Focus Shadows

```css
:root {
  --shadow-focus: 0 0 0 3px rgba(232, 132, 74, 0.25);
  --shadow-focus-error: 0 0 0 3px rgba(239, 68, 68, 0.25);
  --shadow-focus-success: 0 0 0 3px rgba(16, 185, 129, 0.25);
}
```

---

## Effects

### Opacity

```css
:root {
  --opacity-0: 0;
  --opacity-5: 0.05;
  --opacity-10: 0.1;
  --opacity-20: 0.2;
  --opacity-30: 0.3;
  --opacity-40: 0.4;
  --opacity-50: 0.5;
  --opacity-60: 0.6;
  --opacity-70: 0.7;
  --opacity-80: 0.8;
  --opacity-90: 0.9;
  --opacity-95: 0.95;
  --opacity-100: 1;
}
```

### Backdrop Blur

```css
:root {
  --blur-none: 0;
  --blur-sm: 4px;
  --blur-base: 8px;
  --blur-md: 12px;
  --blur-lg: 16px;
  --blur-xl: 24px;
  --blur-2xl: 40px;
  --blur-3xl: 64px;
}
```

---

## Animation

### Durations

```css
:root {
  /* Animation timing */
  --duration-instant: 0ms;
  --duration-fast: 150ms;      /* UI feedback, hover */
  --duration-base: 250ms;      /* Default transitions */
  --duration-slow: 400ms;      /* Complex animations */
  --duration-slower: 600ms;    /* Page transitions */
  --duration-slowest: 1000ms;  /* Loading states */
}
```

### Easing Functions

```css
:root {
  /* Easing curves */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);           /* Default - use this most */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6);
}
```

### Standard Transitions

```css
:root {
  /* Presets */
  --transition-default: all var(--duration-base) var(--ease-out);
  --transition-fast: all var(--duration-fast) var(--ease-out);
  --transition-slow: all var(--duration-slow) var(--ease-out);

  --transition-colors: color var(--duration-base) var(--ease-out),
                       background-color var(--duration-base) var(--ease-out),
                       border-color var(--duration-base) var(--ease-out);

  --transition-transform: transform var(--duration-base) var(--ease-out);

  --transition-opacity: opacity var(--duration-base) var(--ease-out);
}
```

---

## Z-Index

### Layering Scale

```css
:root {
  /* Z-index scale */
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-notification: 1080;
  --z-max: 9999;
}
```

---

## Breakpoints

### Media Query Values

```css
:root {
  /* Breakpoints (for reference, use in @media queries) */
  --screen-sm: 640px;
  --screen-md: 768px;
  --screen-lg: 1024px;
  --screen-xl: 1280px;
  --screen-2xl: 1536px;
}
```

### Usage in Media Queries

```css
/* Mobile first approach */
.element {
  padding: var(--space-4);
}

@media (min-width: 768px) {
  .element {
    padding: var(--space-8);
  }
}

@media (min-width: 1024px) {
  .element {
    padding: var(--space-12);
  }
}
```

---

## Usage Examples

### Button Component

```css
.btn-primary {
  /* Typography */
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);

  /* Colors */
  background: var(--primary-500);
  color: white;

  /* Spacing */
  padding: var(--padding-btn-md);

  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap-xs);

  /* Borders */
  border: none;
  border-radius: var(--radius-lg);

  /* Effects */
  box-shadow: var(--shadow-button);
  transition: var(--transition-default);

  /* Interaction */
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  background: var(--primary-700);
  transform: translateY(0);
}

.btn-primary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}
```

### Card Component

```css
.card {
  /* Colors */
  background: white;

  /* Spacing */
  padding: var(--padding-card-md);

  /* Borders */
  border: var(--border-1) solid var(--border-light);
  border-radius: var(--radius-xl);

  /* Effects */
  box-shadow: var(--shadow-card);
  transition: var(--transition-default);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Input Field

```css
.input {
  /* Typography */
  font-family: var(--font-body);
  font-size: var(--text-base);

  /* Colors */
  background: white;
  color: var(--neutral-900);

  /* Spacing */
  padding: var(--padding-input);

  /* Borders */
  border: var(--border-1) solid var(--border-medium);
  border-radius: var(--radius-md);

  /* Effects */
  transition: var(--transition-colors);
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: var(--shadow-focus);
}

.input:disabled {
  background: var(--neutral-100);
  color: var(--neutral-400);
  cursor: not-allowed;
}

.input.error {
  border-color: var(--error-500);
}

.input.error:focus {
  box-shadow: var(--shadow-focus-error);
}
```

### Modal

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: var(--overlay-dark);
  backdrop-filter: blur(var(--blur-sm));
  z-index: var(--z-modal-backdrop);

  /* Animation */
  animation: fadeIn var(--duration-base) var(--ease-out);
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  /* Colors */
  background: white;

  /* Spacing */
  padding: var(--space-8);

  /* Borders */
  border-radius: var(--radius-2xl);

  /* Effects */
  box-shadow: var(--shadow-modal);
  z-index: var(--z-modal);

  /* Animation */
  animation: slideUp var(--duration-base) var(--ease-out);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, -45%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
```

### Hero Section

```css
.hero {
  /* Spacing */
  padding-top: var(--space-24);
  padding-bottom: var(--space-24);

  /* Background */
  background: var(--gradient-hero);

  /* Layout */
  text-align: center;
}

.hero-title {
  /* Typography */
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-extrabold);
  line-height: var(--leading-tight);

  /* Colors */
  color: var(--neutral-900);

  /* Spacing */
  margin-bottom: var(--space-6);
}

@media (min-width: 768px) {
  .hero-title {
    font-size: var(--text-5xl);
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: var(--text-6xl);
  }
}

.hero .gradient-text {
  background: var(--gradient-text-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## Dark Mode Support (Optional)

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Override specific tokens for dark mode */
    --neutral-50: #111827;
    --neutral-100: #1F2937;
    --neutral-200: #374151;
    --neutral-800: #F3F4F6;
    --neutral-900: #F9FAFB;

    /* Adjust shadows for dark mode */
    --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.4);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
  }
}
```

---

## Token Naming Convention

**Format**: `--{category}-{property}-{variant}`

**Examples**:
- `--primary-500` (category: primary, property: color, variant: 500)
- `--text-2xl` (category: text, property: font-size, variant: 2xl)
- `--space-8` (category: space, property: spacing, variant: 8)
- `--shadow-md` (category: shadow, property: box-shadow, variant: md)

**Benefits**:
- Easy to search/replace
- Auto-completion in IDEs
- Clear hierarchy
- Consistent naming

---

## Migration Guide

### From Hardcoded Values

```css
/* Before */
.button {
  padding: 12px 24px;
  background: #E8844A;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* After */
.button {
  padding: var(--padding-btn-md);
  background: var(--primary-500);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

**Benefits**:
- One place to change all colors
- Automatic dark mode support
- Consistent spacing across app
- Easier to maintain

---

**Version**: 1.0
**Status**: Ready for implementation
**Next**: See IMPLEMENTATION_GUIDE.md for step-by-step implementation instructions
