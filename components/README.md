# HeyGPT.ph Global Components

Comprehensive, production-ready React components for HeyGPT.ph following mobile-first design principles with Desert Titanium Orange (#E8844A) branding.

## Table of Contents

1. [Installation](#installation)
2. [Component Overview](#component-overview)
3. [Usage Examples](#usage-examples)
4. [Design System](#design-system)
5. [Accessibility](#accessibility)

---

## Installation

All components are ready to use. Simply import from `/components`:

```tsx
import { Navbar, Footer, Alert, Spinner } from '@/components'
```

### Component Styles

Component styles are automatically imported via `components.css`. The design tokens are defined in `app/globals.css`.

---

## Component Overview

### 1. Navbar (`Navbar.tsx`)

**Sticky navigation bar with mobile drawer**

**Features:**
- Responsive (56px mobile, 72px desktop)
- Mobile hamburger menu with slide-in drawer
- Active link highlighting (Desert Titanium orange)
- User authentication states
- Search button placeholder (⌘K shortcut)
- Smooth animations

**Props:**
```tsx
interface NavbarProps {
  user?: {
    name: string
    email: string
    image?: string
  } | null
}
```

**Usage:**
```tsx
import Navbar from '@/components/Navbar'

export default function Layout({ children }) {
  return (
    <>
      <Navbar user={session?.user} />
      {children}
    </>
  )
}
```

---

### 2. Footer (`Footer.tsx`)

**Comprehensive site footer**

**Features:**
- 4-column responsive layout (1 column on mobile)
- Newsletter signup form
- Social media links (Facebook, Twitter, Instagram)
- Language toggle (English/Filipino)
- Product, Company, and Legal link sections
- Desert Titanium orange hover effects

**Usage:**
```tsx
import Footer from '@/components/Footer'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  )
}
```

---

### 3. LoginPromptModal (`LoginPromptModal.tsx`)

**Modal shown after free chat limit**

**Features:**
- Triggered after 3 free chats
- Lock icon with benefits list
- Primary CTA: "Sign Up Free"
- Secondary CTA: "Login"
- Backdrop click to close
- Body scroll lock when open

**Props:**
```tsx
interface LoginPromptModalProps {
  isOpen: boolean
  onClose: () => void
  chatCount: number
}
```

**Usage:**
```tsx
import LoginPromptModal from '@/components/LoginPromptModal'

const [showModal, setShowModal] = useState(false)
const [chatCount, setChatCount] = useState(0)

useEffect(() => {
  if (chatCount >= 3 && !user) {
    setShowModal(true)
  }
}, [chatCount, user])

return (
  <LoginPromptModal
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    chatCount={chatCount}
  />
)
```

---

### 4. LoadingStates (`LoadingStates.tsx`)

**Comprehensive loading state components**

#### 4.1 Spinner

Animated circular spinner with color variants.

```tsx
import { Spinner } from '@/components'

<Spinner size={24} color="primary" />
<Spinner size={32} color="white" />
<Spinner size={48} color="neutral" />
```

#### 4.2 Skeleton

Content placeholder with shimmer animation.

```tsx
import { Skeleton, SkeletonText, SkeletonCard, SkeletonMessage } from '@/components'

<Skeleton width="100%" height="20px" variant="rectangular" />
<Skeleton width={48} height={48} variant="circular" />
<SkeletonText lines={3} />
<SkeletonCard />
<SkeletonMessage isUser={false} />
```

#### 4.3 ProgressBar

Progress indicator with percentage display.

```tsx
import { ProgressBar } from '@/components'

<ProgressBar value={65} max={100} showLabel color="primary" />
```

#### 4.4 LoadingPage

Full-page loading state.

```tsx
import { LoadingPage } from '@/components'

<LoadingPage message="Loading your chat..." />
```

#### 4.5 LoadingOverlay

Overlay loading state for existing content.

```tsx
import { LoadingOverlay } from '@/components'

<LoadingOverlay isLoading={loading} message="Sending...">
  <YourContent />
</LoadingOverlay>
```

#### 4.6 LoadingDots

Animated dots for inline loading.

```tsx
import { LoadingDots } from '@/components'

<LoadingDots />
```

---

### 5. Alert (`Alert.tsx`)

**Notification and alert system**

#### 5.1 Alert Component

Base alert with 4 variants: success, error, warning, info.

```tsx
import Alert from '@/components/Alert'

<Alert
  type="success"
  title="Success!"
  message="Your changes have been saved."
  onClose={() => {}}
/>

<Alert
  type="error"
  message="Failed to load data."
  action={{ label: 'Retry', onClick: handleRetry }}
  onClose={() => {}}
/>
```

#### 5.2 Toast Notifications

Fixed-position toast notifications with auto-dismiss.

```tsx
import { Toast } from '@/components/Alert'

<Toast
  type="success"
  message="Message sent successfully!"
  position="top-right"
  duration={3000}
  onClose={() => {}}
/>
```

#### 5.3 Pre-built Alert Variants

```tsx
import { SuccessAlert, ErrorAlert, WarningAlert, InfoAlert } from '@/components/Alert'

<SuccessAlert message="Operation completed!" />
<ErrorAlert message="Something went wrong." action={{ label: 'Retry', onClick: retry }} />
<WarningAlert message="Your session is about to expire." />
<InfoAlert message="New feature available!" />
```

#### 5.4 Banner Alert

Full-width banner alert.

```tsx
import { BannerAlert } from '@/components/Alert'

<BannerAlert
  type="warning"
  message="We'll be performing maintenance at 2 AM UTC."
/>
```

---

## Usage Examples

### Complete Layout with Navigation

```tsx
// app/layout.tsx
import { Navbar, Footer } from '@/components'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar user={session?.user} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

### Chat Interface with Loading States

```tsx
import { Spinner, SkeletonMessage, Alert } from '@/components'

export default function ChatPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (loading) {
    return (
      <div className="chat-container">
        <SkeletonMessage />
        <SkeletonMessage isUser />
        <SkeletonMessage />
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Connection Error"
        message={error}
        action={{ label: 'Retry', onClick: retry }}
      />
    )
  }

  return <ChatInterface />
}
```

### Form with Progress

```tsx
import { ProgressBar, SuccessAlert } from '@/components'

export default function UploadForm() {
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)

  return (
    <form>
      {progress > 0 && <ProgressBar value={progress} max={100} />}
      {success && (
        <SuccessAlert
          message="File uploaded successfully!"
          onClose={() => setSuccess(false)}
        />
      )}
    </form>
  )
}
```

---

## Design System

### Color Palette

**Primary (Desert Titanium Orange):**
- `--primary-500`: #E8844A (Base)
- `--primary-600`: #D46D38 (Hover)
- `--primary-700`: #B85528 (Active)

**Semantic Colors:**
- Success: `--success-500` (#10B981)
- Error: `--error-500` (#EF4444)
- Warning: `--warning-500` (#F59E0B)
- Info: `--info-500` (#3B82F6)

### Typography

**Font Families:**
- Display: Plus Jakarta Sans (headings)
- Body: Inter (body text)

**Font Sizes:**
- `--text-xs`: 0.75rem (12px)
- `--text-sm`: 0.875rem (14px)
- `--text-base`: 1rem (16px)
- `--text-lg`: 1.125rem (18px)
- `--text-xl`: 1.25rem (20px)
- `--text-2xl`: 1.5rem (24px)

### Spacing Scale

Based on 8px grid:
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px

### Breakpoints

Mobile-first approach:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

```css
/* Mobile first */
.element {
  padding: var(--space-4);
}

/* Tablet */
@media (min-width: 640px) {
  .element {
    padding: var(--space-6);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .element {
    padding: var(--space-8);
  }
}
```

---

## Accessibility

All components follow WCAG AA standards:

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Proper tab order and focus indicators
- Escape key closes modals and dropdowns

### Screen Readers
- Semantic HTML elements (`<nav>`, `<footer>`, `<main>`)
- ARIA labels for icon buttons
- ARIA roles for alerts and notifications
- Live regions for dynamic content

### Color Contrast
- All text meets WCAG AA contrast ratios
- Focus indicators are clearly visible
- Error states use both color and icons

### Motion
- Respects `prefers-reduced-motion`
- Animations can be disabled
- Smooth scrolling is optional

### Focus Management
- Modal traps focus when open
- Focus returns to trigger on close
- Skip links for navigation

---

## Component Checklist

### Before Using Components

- [ ] Import design tokens via `app/globals.css`
- [ ] Import component styles via `components.css`
- [ ] Install required dependencies (lucide-react for icons)
- [ ] Test on mobile devices (< 640px)
- [ ] Verify keyboard navigation
- [ ] Test with screen reader

### Component Usage

- [ ] Use semantic props and variants
- [ ] Provide accessible labels
- [ ] Handle loading and error states
- [ ] Test responsiveness
- [ ] Verify color contrast
- [ ] Add proper TypeScript types

---

## Technical Details

### Dependencies

```json
{
  "lucide-react": "^0.294.0",
  "next": "14.x",
  "react": "18.x"
}
```

### Performance

- Components use CSS variables for theming
- Animations use transform/opacity for 60fps
- Images lazy load by default
- Code splitting at route level

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## File Structure

```
components/
├── Navbar.tsx              # Main navigation
├── Footer.tsx              # Site footer
├── LoginPromptModal.tsx    # Guest limit modal
├── LoadingStates.tsx       # All loading components
├── Alert.tsx               # Alert system
├── components.css          # Component styles
├── index.ts                # Centralized exports
└── README.md               # This file
```

---

## Contributing

When adding new components:

1. Follow mobile-first design
2. Use design tokens (CSS variables)
3. Add TypeScript interfaces
4. Include accessibility features
5. Document props and usage
6. Add to index.ts exports
7. Update this README

---

## Support

For issues or questions:
- Email: support@heygpt.ph
- Discord: [HeyGPT Community](#)
- Documentation: [docs.heygpt.ph](#)

---

**Version**: 1.0
**Last Updated**: 2025-11-13
**Design System**: Desert Titanium Orange Theme
