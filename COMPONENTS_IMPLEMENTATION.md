# Global Components Implementation Guide

Quick guide to implement the new global components in HeyGPT.ph.

---

## Quick Start

### 1. Update Root Layout

File: `app/layout.tsx`

```tsx
import { Navbar, Footer } from '@/components'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar user={null} /> {/* Pass session user when available */}
        <main style={{ minHeight: 'calc(100vh - 128px)' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
```

### 2. Add to Chat Pages

File: `app/chat/page.tsx`

```tsx
import { LoginPromptModal } from '@/components'
import { useState, useEffect } from 'react'

export default function ChatPage() {
  const [chatCount, setChatCount] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    // Check if user has reached free chat limit
    if (chatCount >= 3 && !user) {
      setShowLoginModal(true)
    }
  }, [chatCount, user])

  return (
    <>
      <ChatInterface />
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        chatCount={chatCount}
      />
    </>
  )
}
```

### 3. Use Loading States

```tsx
import { Spinner, SkeletonMessage, LoadingPage } from '@/components'

// Full page loading
if (initialLoading) {
  return <LoadingPage message="Loading your chat..." />
}

// Chat message loading
if (loadingMessages) {
  return (
    <div>
      <SkeletonMessage />
      <SkeletonMessage isUser />
      <SkeletonMessage />
    </div>
  )
}

// Button loading
<button disabled={sending}>
  {sending ? <Spinner size={20} color="white" /> : 'Send'}
</button>
```

### 4. Use Alerts

```tsx
import { Toast, ErrorAlert, SuccessAlert } from '@/components'

// Toast notification
const [showToast, setShowToast] = useState(false)

useEffect(() => {
  if (messageSent) {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }
}, [messageSent])

{showToast && (
  <Toast
    type="success"
    message="Message sent successfully!"
    position="top-right"
    onClose={() => setShowToast(false)}
  />
)}

// Inline alert
{error && (
  <ErrorAlert
    title="Connection Error"
    message={error}
    action={{ label: 'Retry', onClick: handleRetry }}
    onClose={() => setError(null)}
  />
)}
```

---

## Component Imports

### All at Once
```tsx
import {
  Navbar,
  Footer,
  LoginPromptModal,
  Spinner,
  SkeletonText,
  SkeletonCard,
  ProgressBar,
  LoadingPage,
  Alert,
  Toast,
  SuccessAlert,
  ErrorAlert
} from '@/components'
```

### Individual
```tsx
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Spinner } from '@/components/LoadingStates'
import Alert from '@/components/Alert'
```

---

## Key Features

### Navbar Features
- ✅ Sticky positioning (z-index: 1020)
- ✅ Mobile hamburger menu (< 1024px)
- ✅ Smooth drawer animation
- ✅ Active link highlighting (Desert Titanium orange)
- ✅ User avatar placeholder
- ✅ Auth button states

### Footer Features
- ✅ 4-column responsive layout
- ✅ Newsletter signup
- ✅ Social media links
- ✅ Language toggle (EN/FIL)
- ✅ Dark background (neutral-900)
- ✅ Orange hover effects

### LoginPromptModal Features
- ✅ Triggered at 3 free chats
- ✅ Benefits checklist
- ✅ Primary/Secondary CTAs
- ✅ Body scroll lock
- ✅ Backdrop click close
- ✅ Escape key close

### Loading States Features
- ✅ Spinner (3 color variants)
- ✅ Skeleton loaders (text, card, message)
- ✅ Progress bars
- ✅ Loading page
- ✅ Loading overlay
- ✅ Animated dots

### Alert Features
- ✅ 4 variants (success, error, warning, info)
- ✅ Title and message
- ✅ Dismissible
- ✅ Action button
- ✅ Toast positioning
- ✅ Slide-in animation

---

## Mobile Responsiveness

All components are mobile-first:

### Navbar
- Mobile: 56px height, hamburger menu
- Desktop: 72px height, full menu

### Footer
- Mobile: 1 column stack
- Tablet: 2 columns (768px+)
- Desktop: 4 columns grid

### Modals
- Mobile: Full width with padding
- Desktop: Max-width with centering

### Alerts
- Mobile: Full width, stacked
- Desktop: Fixed width, positioned

---

## Accessibility Checklist

### Implemented Features
- [x] Semantic HTML elements
- [x] ARIA labels on interactive elements
- [x] Keyboard navigation support
- [x] Focus indicators (orange ring)
- [x] Screen reader support
- [x] Color contrast (WCAG AA)
- [x] Reduced motion support
- [x] Focus trap in modals

### Testing
```bash
# Test keyboard navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals
- Arrow keys for menu navigation

# Test screen reader
- Turn on VoiceOver (Mac) / NVDA (Windows)
- Navigate through components
- Verify announcements
```

---

## Styling Notes

### CSS Variables
All styling uses CSS custom properties from `app/globals.css`:

```css
/* Primary color */
background: var(--primary-500);
color: var(--primary-600);

/* Spacing */
padding: var(--space-4);
gap: var(--space-6);

/* Typography */
font-size: var(--text-base);
font-weight: var(--font-semibold);

/* Animation */
transition: var(--transition-default);
```

### Responsive Breakpoints
```css
/* Mobile: default styles */
padding: var(--space-4);

/* Tablet: 640px+ */
@media (min-width: 640px) {
  padding: var(--space-6);
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  padding: var(--space-8);
}
```

---

## Performance Tips

1. **Code Splitting**
   - Components auto-split at route level
   - Use dynamic imports for heavy components

2. **Image Optimization**
   - Use Next.js Image component
   - Lazy load images below fold
   - Provide proper alt text

3. **Animation Performance**
   - Use transform and opacity
   - Avoid animating layout properties
   - Enable hardware acceleration

4. **Bundle Size**
   - Tree-shaking enabled
   - Import only used components
   - Icons are lazy-loaded

---

## Common Patterns

### Loading -> Content -> Error

```tsx
const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
const [error, setError] = useState<string | null>(null)

if (status === 'loading') {
  return <LoadingPage message="Loading..." />
}

if (status === 'error') {
  return (
    <ErrorAlert
      message={error || 'Something went wrong'}
      action={{ label: 'Retry', onClick: handleRetry }}
    />
  )
}

return <YourContent />
```

### Form Submission with Toast

```tsx
const [submitting, setSubmitting] = useState(false)
const [showSuccess, setShowSuccess] = useState(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  setSubmitting(true)

  try {
    await submitForm(data)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  } catch (err) {
    setError(err.message)
  } finally {
    setSubmitting(false)
  }
}

return (
  <>
    <form onSubmit={handleSubmit}>
      <button disabled={submitting}>
        {submitting ? <Spinner size={16} color="white" /> : 'Submit'}
      </button>
    </form>

    {showSuccess && (
      <Toast
        type="success"
        message="Form submitted successfully!"
        onClose={() => setShowSuccess(false)}
      />
    )}
  </>
)
```

### Infinite Scroll with Loading

```tsx
const [loading, setLoading] = useState(false)
const [hasMore, setHasMore] = useState(true)

const loadMore = async () => {
  if (loading || !hasMore) return

  setLoading(true)
  const newItems = await fetchItems(page)
  setItems([...items, ...newItems])
  setHasMore(newItems.length > 0)
  setLoading(false)
}

return (
  <>
    {items.map(item => <Item key={item.id} {...item} />)}
    {loading && <Spinner size={32} />}
    {!hasMore && <p>No more items</p>}
  </>
)
```

---

## Troubleshooting

### Navbar not sticky
- Check z-index conflicts
- Verify parent container doesn't have overflow hidden
- Ensure height is set on navbar

### Mobile drawer not appearing
- Verify mobile breakpoint (1024px)
- Check z-index layering
- Confirm backdrop overlay is present

### Styles not applying
- Import `components.css` in component
- Check CSS variable definitions in `globals.css`
- Verify Tailwind isn't overriding styles

### Modal not closing
- Ensure onClose handler is provided
- Check backdrop click event
- Verify Escape key listener

---

## Next Steps

1. ✅ Components created and documented
2. ⏭️ Integrate Navbar and Footer in layout
3. ⏭️ Add LoginPromptModal to chat pages
4. ⏭️ Replace existing loading states
5. ⏭️ Implement toast notifications
6. ⏭️ Test on mobile devices
7. ⏭️ Accessibility audit
8. ⏭️ Performance testing

---

## Resources

- **Design Tokens**: `/app/globals.css`
- **Component Styles**: `/components/components.css`
- **Component Exports**: `/components/index.ts`
- **Full Documentation**: `/components/README.md`
- **Design System**: `/DESIGN_SYSTEM.md`
- **UI Components Library**: `/UI_COMPONENTS.md`

---

**Status**: Ready for implementation
**Version**: 1.0
**Last Updated**: 2025-11-13
