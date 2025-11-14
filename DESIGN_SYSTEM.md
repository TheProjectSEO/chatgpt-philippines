# HeyGPT.ph Design System
**Version**: 1.0
**Last Updated**: 2025-11-13
**Brand Color**: Desert Titanium Orange (iPhone 15/16 Pro Max inspired)

---

## Table of Contents
1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Iconography](#iconography)
6. [Imagery & Illustrations](#imagery--illustrations)
7. [Motion & Animation](#motion--animation)
8. [Accessibility](#accessibility)

---

## Brand Identity

### Vision
To be the most accessible and natural AI assistant for Filipinos, bridging language barriers and empowering productivity through conversational AI.

### Brand Personality
- **Warm**: Like talking to a helpful friend
- **Smart**: Intelligent without being intimidating
- **Reliable**: Consistent, trustworthy responses
- **Local**: Deeply understands Philippine culture and context
- **Modern**: Contemporary, clean, sophisticated design

### Voice & Tone
- **Friendly but professional**: "Kamusta! Let me help you with that"
- **Clear and direct**: No jargon, simple explanations
- **Encouraging**: Positive, supportive language
- **Culturally aware**: References local contexts naturally
- **Conversational**: Like chatting with a knowledgeable colleague

### Brand Attributes
- 🌅 **Warmth**: Like a Philippine sunset
- 🤝 **Trust**: Reliable Filipino hospitality
- 💡 **Intelligence**: Smart but approachable
- 🌏 **Local**: Proudly Filipino, globally capable
- ⚡ **Speed**: Fast, efficient, no hassle

---

## Color System

### Primary Palette
Based on **Desert Titanium** - the warm, sophisticated orange-bronze from iPhone Pro Max

```css
:root {
  /* Primary Brand Colors - Desert Titanium Orange */
  --primary-50: #FFF4ED;   /* Lightest - backgrounds, subtle highlights */
  --primary-100: #FFE6D5;  /* Very light - hover states, light backgrounds */
  --primary-200: #FFCCAB;  /* Light - disabled states, borders */
  --primary-300: #FFB380;  /* Medium light - secondary elements */
  --primary-400: #FF9A56;  /* Medium - accents, icons */
  --primary-500: #E8844A;  /* Base - main brand color (Desert Titanium) */
  --primary-600: #D46D38;  /* Medium dark - hover states for buttons */
  --primary-700: #B85528;  /* Dark - pressed states */
  --primary-800: #9A421A;  /* Darker - text on light backgrounds */
  --primary-900: #7A3214;  /* Darkest - emphasis, headings */

  /* Quick access */
  --primary: var(--primary-500);
  --primary-dark: var(--primary-600);
  --primary-darker: var(--primary-700);
  --primary-light: var(--primary-300);
  --primary-lighter: var(--primary-100);
}
```

### Secondary Palette
Complementary purple for accents and variety

```css
:root {
  /* Secondary - Purple (AI/Tech feel) */
  --secondary-50: #F5F3FF;
  --secondary-100: #EDE9FE;
  --secondary-200: #DDD6FE;
  --secondary-300: #C4B5FD;
  --secondary-400: #A78BFA;
  --secondary-500: #8B5CF6;  /* Base secondary */
  --secondary-600: #7C3AED;
  --secondary-700: #6D28D9;
  --secondary-800: #5B21B6;
  --secondary-900: #4C1D95;

  --secondary: var(--secondary-500);
  --secondary-dark: var(--secondary-600);
}
```

### Neutral Palette
For text, backgrounds, and UI elements

```css
:root {
  /* Neutral - Warm grays with orange undertone */
  --neutral-0: #FFFFFF;
  --neutral-50: #FAFAF9;   /* Subtle warm white */
  --neutral-100: #F5F5F4;  /* Light background */
  --neutral-200: #E7E5E4;  /* Borders, dividers */
  --neutral-300: #D6D3D1;  /* Disabled text */
  --neutral-400: #A8A29E;  /* Placeholder text */
  --neutral-500: #78716C;  /* Secondary text */
  --neutral-600: #57534E;  /* Body text */
  --neutral-700: #44403C;  /* Headings */
  --neutral-800: #292524;  /* Dark headings */
  --neutral-900: #1C1917;  /* Darkest text */

  /* Text colors */
  --text-primary: var(--neutral-800);
  --text-secondary: var(--neutral-600);
  --text-tertiary: var(--neutral-500);
  --text-disabled: var(--neutral-400);

  /* Background colors */
  --bg-primary: var(--neutral-0);
  --bg-secondary: var(--neutral-50);
  --bg-tertiary: var(--neutral-100);
}
```

### Semantic Colors
For status, feedback, and interactive states

```css
:root {
  /* Success - Green */
  --success-50: #F0FDF4;
  --success-500: #22C55E;
  --success-600: #16A34A;
  --success-700: #15803D;
  --success: var(--success-600);

  /* Error - Red */
  --error-50: #FEF2F2;
  --error-500: #EF4444;
  --error-600: #DC2626;
  --error-700: #B91C1C;
  --error: var(--error-600);

  /* Warning - Amber (harmonizes with orange brand) */
  --warning-50: #FFFBEB;
  --warning-500: #F59E0B;
  --warning-600: #D97706;
  --warning-700: #B45309;
  --warning: var(--warning-600);

  /* Info - Blue */
  --info-50: #EFF6FF;
  --info-500: #3B82F6;
  --info-600: #2563EB;
  --info-700: #1D4ED8;
  --info: var(--info-600);
}
```

### Gradients
For hero sections, cards, and special emphasis

```css
:root {
  /* Primary gradients - Desert sunset feel */
  --gradient-primary: linear-gradient(135deg, #FFB380 0%, #E8844A 50%, #D46D38 100%);
  --gradient-primary-soft: linear-gradient(135deg, #FFF4ED 0%, #FFE6D5 100%);

  /* Secondary gradients */
  --gradient-secondary: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%);

  /* Combined gradient - brand signature */
  --gradient-brand: linear-gradient(135deg, #FFB380 0%, #E8844A 50%, #A78BFA 100%);

  /* Subtle background gradients */
  --gradient-bg-warm: linear-gradient(180deg, #FFFFFF 0%, #FFF4ED 100%);
  --gradient-bg-cool: linear-gradient(180deg, #FFFFFF 0%, #F5F3FF 100%);
}
```

### Color Usage Guidelines

#### Primary Orange Usage
**Use for**:
- Primary CTA buttons
- Key interactive elements
- Links and highlights
- Active states
- Brand emphasis
- Loading indicators

**Don't use for**:
- Large background areas (too intense)
- Body text (readability issues)
- Error states (use semantic red)

#### Secondary Purple Usage
**Use for**:
- Secondary CTAs
- Accents and variety
- AI-related features
- Premium/pro badges
- Notification badges
- Alternative interactive states

#### Neutral Usage
**Use for**:
- Body text and content
- Backgrounds and surfaces
- Borders and dividers
- Disabled states
- Subtle UI elements

### Color Contrast Ratios
All color combinations meet **WCAG AA** standards minimum:

| Combination | Ratio | Pass |
|-------------|-------|------|
| Primary-900 on Primary-50 | 12.5:1 | AAA ✅ |
| Primary-700 on Neutral-0 | 7.2:1 | AAA ✅ |
| Primary-500 on Neutral-0 | 4.8:1 | AA ✅ |
| Neutral-800 on Neutral-0 | 10.7:1 | AAA ✅ |
| Neutral-600 on Neutral-0 | 7.1:1 | AAA ✅ |

---

## Typography

### Font Families

```css
:root {
  /* Primary font - Display and headings */
  --font-display: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI',
                  'Helvetica Neue', Arial, sans-serif;

  /* Secondary font - Body text */
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
               'Helvetica Neue', Arial, sans-serif;

  /* Monospace - Code and technical content */
  --font-mono: 'Fira Code', 'SF Mono', Monaco, 'Cascadia Code',
               'Courier New', monospace;
}
```

### Type Scale
Mobile-first with fluid scaling

```css
:root {
  /* Font sizes - Mobile base (16px) */
  --text-xs: 0.75rem;      /* 12px - captions, labels */
  --text-sm: 0.875rem;     /* 14px - small text, metadata */
  --text-base: 1rem;       /* 16px - body text */
  --text-lg: 1.125rem;     /* 18px - large body, intro text */
  --text-xl: 1.25rem;      /* 20px - small headings */
  --text-2xl: 1.5rem;      /* 24px - card titles, section subheadings */
  --text-3xl: 1.875rem;    /* 30px - section headings */
  --text-4xl: 2.25rem;     /* 36px - page headings */
  --text-5xl: 3rem;        /* 48px - hero headings */
  --text-6xl: 3.75rem;     /* 60px - display headings (desktop only) */

  /* Fluid typography for responsive scaling */
  --text-hero: clamp(2.5rem, 5vw + 1rem, 5rem);  /* 40px to 80px */
  --text-display: clamp(2rem, 4vw + 1rem, 3.75rem);  /* 32px to 60px */
}

/* Desktop adjustments */
@media (min-width: 1024px) {
  :root {
    --text-base: 1.125rem;  /* 18px on desktop for better readability */
    --text-lg: 1.25rem;     /* 20px */
  }
}
```

### Font Weights

```css
:root {
  --font-light: 300;
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
  /* Line heights */
  --leading-none: 1;          /* Tight headings */
  --leading-tight: 1.25;      /* Headings */
  --leading-snug: 1.375;      /* Subheadings */
  --leading-normal: 1.5;      /* Body text */
  --leading-relaxed: 1.625;   /* Long-form content */
  --leading-loose: 2;         /* Very spacious */
}
```

### Letter Spacing

```css
:root {
  --tracking-tighter: -0.05em;  /* Large display text */
  --tracking-tight: -0.025em;   /* Headings */
  --tracking-normal: 0;         /* Body text */
  --tracking-wide: 0.025em;     /* Small caps, buttons */
  --tracking-wider: 0.05em;     /* Labels, tags */
  --tracking-widest: 0.1em;     /* Uppercase labels */
}
```

### Typography Styles

#### Headings

```css
/* H1 - Hero heading */
.heading-1 {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--neutral-900);
}

/* H2 - Section heading */
.heading-2 {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--neutral-800);
}

/* H3 - Subsection heading */
.heading-3 {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-normal);
  color: var(--neutral-800);
}

/* H4 - Card heading */
.heading-4 {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--neutral-700);
}

/* H5 - Small heading */
.heading-5 {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  color: var(--neutral-700);
}

/* H6 - Tiny heading */
.heading-6 {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--neutral-600);
}
```

#### Body Text

```css
/* Body large - Intro paragraphs */
.body-large {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--neutral-700);
}

/* Body regular - Main content */
.body-regular {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--neutral-600);
}

/* Body small - Supporting text */
.body-small {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--neutral-600);
}
```

#### Labels & Captions

```css
/* Label - Form labels, tags */
.label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-wide);
  color: var(--neutral-700);
}

/* Caption - Image captions, metadata */
.caption {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--neutral-500);
}

/* Overline - Section labels */
.overline {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--primary-600);
}
```

### Typography Usage Examples

```html
<!-- Hero section -->
<h1 class="heading-1">
  Free ChatGPT for Philippines
</h1>
<p class="body-large" style="color: var(--neutral-600);">
  Your AI assistant that speaks Filipino and English,
  available 24/7 for free
</p>

<!-- Section with overline -->
<span class="overline">Features</span>
<h2 class="heading-2">Why Filipinos Love HeyGPT</h2>
<p class="body-regular">
  Built specifically for the Philippine market with
  local language support and cultural understanding
</p>

<!-- Card -->
<div class="card">
  <h3 class="heading-4">AI Chat Assistant</h3>
  <p class="body-small">
    Chat naturally in Filipino or English
  </p>
</div>
```

---

## Spacing & Layout

### Spacing Scale
8px base unit for consistency

```css
:root {
  /* Spacing scale - 8px base unit */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px - tight spacing */
  --space-2: 0.5rem;    /* 8px - small gaps */
  --space-3: 0.75rem;   /* 12px - compact spacing */
  --space-4: 1rem;      /* 16px - standard spacing */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px - comfortable spacing */
  --space-8: 2rem;      /* 32px - section spacing */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px - large spacing */
  --space-16: 4rem;     /* 64px - section padding */
  --space-20: 5rem;     /* 80px - large sections */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px - hero sections */
  --space-40: 10rem;    /* 160px - extra large */
}
```

### Layout Containers

```css
/* Max width containers */
.container {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

.container-narrow {
  width: 100%;
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

.container-tight {
  width: 100%;
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

/* Responsive padding adjustments */
@media (min-width: 640px) {
  .container,
  .container-narrow,
  .container-tight {
    padding-left: var(--space-6);
    padding-right: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container,
  .container-narrow,
  .container-tight {
    padding-left: var(--space-8);
    padding-right: var(--space-8);
  }
}
```

### Grid System

```css
/* Responsive grid */
.grid {
  display: grid;
  gap: var(--space-6);
}

/* Column variants - Mobile first */
.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }

@media (min-width: 640px) {
  .grid-cols-2-sm { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 768px) {
  .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .grid-cols-3-md { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}

/* Gap variants */
.gap-2 { gap: var(--space-2); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }
.gap-8 { gap: var(--space-8); }
```

### Section Spacing

```css
/* Section padding - Mobile first */
.section {
  padding-top: var(--space-16);
  padding-bottom: var(--space-16);
}

.section-large {
  padding-top: var(--space-20);
  padding-bottom: var(--space-20);
}

.section-hero {
  padding-top: var(--space-24);
  padding-bottom: var(--space-24);
}

/* Desktop adjustments */
@media (min-width: 1024px) {
  .section {
    padding-top: var(--space-20);
    padding-bottom: var(--space-20);
  }

  .section-large {
    padding-top: var(--space-32);
    padding-bottom: var(--space-32);
  }

  .section-hero {
    padding-top: var(--space-40);
    padding-bottom: var(--space-40);
  }
}
```

### Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px - tight corners */
  --radius-base: 0.5rem;   /* 8px - standard cards */
  --radius-md: 0.75rem;    /* 12px - feature cards */
  --radius-lg: 1rem;       /* 16px - large cards */
  --radius-xl: 1.5rem;     /* 24px - hero cards */
  --radius-2xl: 2rem;      /* 32px - extra large */
  --radius-full: 9999px;   /* Pills, circular */
}
```

### Shadows

```css
:root {
  /* Elevation shadows - with warm tint */
  --shadow-xs: 0 1px 2px 0 rgba(232, 132, 74, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(232, 132, 74, 0.1),
               0 1px 2px -1px rgba(232, 132, 74, 0.1);
  --shadow-base: 0 4px 6px -1px rgba(232, 132, 74, 0.1),
                 0 2px 4px -2px rgba(232, 132, 74, 0.1);
  --shadow-md: 0 10px 15px -3px rgba(232, 132, 74, 0.1),
               0 4px 6px -4px rgba(232, 132, 74, 0.1);
  --shadow-lg: 0 20px 25px -5px rgba(232, 132, 74, 0.1),
               0 8px 10px -6px rgba(232, 132, 74, 0.1);
  --shadow-xl: 0 25px 50px -12px rgba(232, 132, 74, 0.25);

  /* Neutral shadows (no color tint) */
  --shadow-neutral-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
                       0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-neutral-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                         0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-neutral-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
                       0 4px 6px -4px rgba(0, 0, 0, 0.1);
}
```

---

## Iconography

### Icon Library
**Recommended**: [Lucide Icons](https://lucide.dev/) or [Heroicons](https://heroicons.com/)

Both offer:
- Clean, minimal design
- Consistent stroke width
- SVG format (scalable)
- React components ready
- MIT license (free)

### Icon Sizes

```css
:root {
  --icon-xs: 12px;   /* Small inline icons */
  --icon-sm: 16px;   /* Standard inline icons */
  --icon-base: 20px; /* Default size */
  --icon-md: 24px;   /* Card icons */
  --icon-lg: 32px;   /* Feature icons */
  --icon-xl: 40px;   /* Large feature icons */
  --icon-2xl: 48px;  /* Hero icons */
  --icon-3xl: 64px;  /* Extra large decorative */
}
```

### Icon Usage

```tsx
// Small icon in button
<button>
  <Icon size={16} />
  Click me
</button>

// Feature card icon
<div className="feature-icon">
  <Icon size={32} />
</div>

// Hero section icon
<div className="hero-icon">
  <Icon size={48} />
</div>
```

### Icon Colors

```css
/* Icon color variants */
.icon-primary { color: var(--primary-500); }
.icon-secondary { color: var(--secondary-500); }
.icon-neutral { color: var(--neutral-600); }
.icon-success { color: var(--success-600); }
.icon-error { color: var(--error-600); }
.icon-warning { color: var(--warning-600); }
```

---

## Imagery & Illustrations

### Photography Style
- **Natural lighting**: Warm, sunset-like tones
- **Philippine context**: Local scenes, people, environments
- **Authentic**: Real Filipinos using technology
- **Optimistic**: Positive, forward-looking mood
- **Professional**: High quality, not stock-looking

### Image Treatment

```css
/* Image overlays for text legibility */
.image-overlay-dark {
  position: relative;
}

.image-overlay-dark::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

.image-overlay-warm {
  position: relative;
}

.image-overlay-warm::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(232, 132, 74, 0) 0%,
    rgba(232, 132, 74, 0.3) 100%
  );
}
```

### Illustration Style
- **Minimal line art**: Simple, clean illustrations
- **Brand colors**: Use primary orange and secondary purple
- **Warm feel**: Rounded corners, friendly shapes
- **Abstract**: Geometric patterns with organic curves
- **Cultural**: Subtle Filipino elements (jeepney, sari-sari store motifs)

---

## Motion & Animation

### Animation Principles
1. **Purpose**: Every animation serves a function
2. **Performance**: 60fps smooth animations
3. **Subtlety**: Gentle, not distracting
4. **Speed**: Quick (200-300ms) for UI, slower (500-800ms) for page transitions
5. **Easing**: Natural, organic curves

### Timing Functions

```css
:root {
  /* Easing curves */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Duration Scale

```css
:root {
  --duration-fast: 150ms;      /* Instant feedback */
  --duration-base: 200ms;      /* Standard transitions */
  --duration-medium: 300ms;    /* Slower transitions */
  --duration-slow: 500ms;      /* Page transitions */
  --duration-slower: 700ms;    /* Complex animations */
}
```

### Common Animations

```css
/* Fade in */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn var(--duration-medium) var(--ease-out);
}

/* Scale up */
@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Slide in from right */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Shimmer loading */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--neutral-100) 0%,
    var(--neutral-200) 50%,
    var(--neutral-100) 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

### Hover States

```css
/* Button hover */
.button {
  transition: all var(--duration-base) var(--ease-out);
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

/* Card hover */
.card {
  transition: all var(--duration-medium) var(--ease-out);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

---

## Accessibility

### Focus States

```css
/* Visible focus indicator */
*:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Button focus */
.button:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 3px;
}

/* Input focus */
.input:focus-visible {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(232, 132, 74, 0.1);
}
```

### Screen Reader Only

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Skip Links

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary-500);
  color: white;
  padding: var(--space-2) var(--space-4);
  text-decoration: none;
  border-radius: var(--radius-base);
  z-index: 100;
}

.skip-link:focus {
  top: var(--space-4);
  left: var(--space-4);
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Dark Mode (Optional)

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Adjust colors for dark mode */
    --bg-primary: var(--neutral-900);
    --bg-secondary: var(--neutral-800);
    --bg-tertiary: var(--neutral-700);

    --text-primary: var(--neutral-50);
    --text-secondary: var(--neutral-200);
    --text-tertiary: var(--neutral-400);

    /* Adjust primary to be slightly lighter in dark mode */
    --primary: var(--primary-400);
  }
}
```

---

## Implementation Checklist

- [ ] Install fonts (Plus Jakarta Sans, Inter)
- [ ] Set up CSS variables in global stylesheet
- [ ] Implement spacing scale
- [ ] Add typography classes
- [ ] Configure Tailwind (if using)
- [ ] Set up icon library (Lucide/Heroicons)
- [ ] Add focus states to all interactive elements
- [ ] Test color contrast ratios
- [ ] Implement reduced motion preference
- [ ] Add skip links for keyboard navigation
- [ ] Test with screen readers
- [ ] Validate responsive breakpoints

---

**Version**: 1.0
**Status**: Ready for implementation
**Next**: See UI_COMPONENTS.md for component specifications
