# UX Patterns & User Flows
## HeyGPT.ph Design System

**Version**: 1.0
**Last Updated**: 2025-11-13
**Dependencies**: DESIGN_SYSTEM.md, UI_COMPONENTS.md

---

## Table of Contents

1. [User Journey Maps](#user-journey-maps)
2. [Core Interaction Patterns](#core-interaction-patterns)
3. [Navigation Patterns](#navigation-patterns)
4. [Content Patterns](#content-patterns)
5. [Conversion Patterns](#conversion-patterns)
6. [Error Handling](#error-handling)
7. [Loading States](#loading-states)
8. [Mobile Patterns](#mobile-patterns)
9. [Accessibility Patterns](#accessibility-patterns)
10. [Feedback & Confirmation](#feedback--confirmation)

---

## User Journey Maps

### 1. First-Time Visitor Journey

#### Entry Points
- **Search**: "free chatgpt philippines" → Landing page
- **Social**: Facebook/TikTok ad → Landing page
- **Direct**: heygpt.ph → Landing page
- **Referral**: Friend's recommendation → Landing page

#### User Flow: Guest User (First 3 Free Chats)

```
Landing Page
    ↓
[See Hero: "Free AI Chat in Filipino & English"]
    ↓
[Click "Start Free Chat" CTA]
    ↓
Chat Page (Guest Mode)
    ↓
[Type first message]
    ↓
[Receive instant AI response]
    ↓
[Continue chatting - 2/3 chats remaining]
    ↓
[Chat #3 - Warning banner appears]
"This is your last free chat. Sign up to continue!"
    ↓
[Try to start Chat #4]
    ↓
[Login Prompt Modal]
"You've reached your free chat limit"
    ↓
[Click "Sign Up Free"]
    ↓
Auth0 Login Screen
    ↓
[Complete signup]
    ↓
Chat Page (Authenticated)
    ↓
[Unlimited chats unlocked ✓]
```

#### Key Moments
1. **First Impression** (0-3 seconds): Hero section must communicate value instantly
2. **Aha Moment** (10-30 seconds): First AI response shows quality
3. **Friction Point** (Chat #3): Must feel fair, not frustrating
4. **Conversion Moment**: Login prompt must emphasize value, not pressure

---

### 2. Returning User Journey

```
[User visits heygpt.ph]
    ↓
[Detects existing session]
    ↓
Auto-redirect to /chat
    ↓
[Show: "Welcome back! Continue your conversation"]
    ↓
[Load recent chat history in sidebar]
    ↓
[User can continue or start new chat]
```

**Pattern**: No unnecessary steps. Get users to value fast.

---

### 3. Tool Discovery Journey

```
[User on home page]
    ↓
[Scroll down - sees feature cards]
"Grammar Checker" | "AI Detector" | "Humanizer"
    ↓
[Clicks "Grammar Checker"]
    ↓
Grammar Checker Page
    ↓
[Sees: Input area + "Check Grammar" button]
    ↓
[Pastes text]
    ↓
[Clicks "Check Grammar"]
    ↓
[If guest & used 3 free checks → Login prompt]
[If authenticated → Show results]
```

**Pattern**: Every tool follows same structure:
1. Hero with tool explanation
2. Try it section (immediate access)
3. Results display
4. Upsell to related features

---

## Core Interaction Patterns

### Chat Interaction Pattern

#### Pattern: Progressive Disclosure

```tsx
// Initial State: Clean, inviting
<ChatInterface>
  <EmptyState>
    <Icon>💬</Icon>
    <Heading>What can I help you with today?</Heading>
    <SuggestedPrompts>
      "Write an email in Filipino"
      "Explain quantum physics simply"
      "Help me study for exams"
    </SuggestedPrompts>
  </EmptyState>

  <ChatInput placeholder="Ask me anything..." />
</ChatInterface>

// Active State: Focused on conversation
<ChatInterface>
  <MessageList>
    {messages.map(msg => <Message {...msg} />)}
  </MessageList>

  <ChatInput
    placeholder="Continue the conversation..."
    autoFocus
  />
</ChatInterface>
```

#### Typing Indicators

**Pattern**: Show AI is "thinking"

```tsx
// User sends message
User: "What is photosynthesis?"

// Immediate feedback (< 100ms)
<TypingIndicator>
  <Avatar src="/ai-avatar.png" />
  <DotAnimation />
  <Text>HeyGPT is typing...</Text>
</TypingIndicator>

// Response appears (streaming)
<Message isStreaming>
  Photosynthesis is the process where plants convert...
  {cursor}
</Message>
```

**Timing**:
- Show typing indicator immediately on send
- Stream response as it arrives (feels faster)
- Never show "loading" for > 5 seconds without update

---

### Form Interaction Pattern

#### Pattern: Inline Validation

```tsx
// Good: Immediate, helpful feedback
<Input
  label="Email"
  error={!isValid && touched ? "Please enter a valid email" : null}
  success={isValid && touched}
  helpText="We'll never share your email"
/>

// Progress indication for multi-step
<FormProgress current={2} total={4}>
  <Step status="completed">Personal Info</Step>
  <Step status="active">Preferences</Step>
  <Step status="pending">Payment</Step>
  <Step status="pending">Confirm</Step>
</FormProgress>
```

**Rules**:
1. Validate on blur, not on every keystroke (less annoying)
2. Show success states, not just errors
3. Use positive language: "Email looks good!" not "No errors detected"
4. For Philippine phone numbers: Support both +63 and 09xx formats

---

### Search Interaction Pattern

#### Pattern: Instant Results

```tsx
// As user types: Show results immediately
<SearchBar
  placeholder="Search chats, tools, help..."
  onInput={handleSearch}
/>

<SearchResults>
  {query.length === 0 ? (
    <RecentSearches />
  ) : (
    <>
      <ResultSection title="Chats" count={chatResults.length}>
        {chatResults.map(chat => <ChatResult {...chat} />)}
      </ResultSection>

      <ResultSection title="Tools" count={toolResults.length}>
        {toolResults.map(tool => <ToolResult {...tool} />)}
      </ResultSection>

      {results.length === 0 && (
        <EmptyState>
          <Text>No results for "{query}"</Text>
          <Suggestions>Try: "grammar", "translate", or "chat"</Suggestions>
        </EmptyState>
      )}
    </>
  )}
</SearchResults>
```

**Timing**:
- Debounce input: 300ms
- Show "Searching..." after 500ms of no results
- Highlight matching text in results

---

## Navigation Patterns

### Primary Navigation

#### Pattern: Persistent Top Bar

```
┌─────────────────────────────────────────────────┐
│ [Logo] HeyGPT    Chat | Tools ▾ | Pricing    [🔔][👤] │
└─────────────────────────────────────────────────┘
```

**Desktop** (≥ 1024px):
- Always visible top bar
- Dropdown menus for "Tools"
- User avatar with dropdown menu

**Mobile** (< 1024px):
- Hamburger menu (left)
- Logo (center)
- User avatar (right)

#### Mobile Menu Pattern

```
[≡] Tap hamburger
    ↓
[Drawer slides in from left - 85% width]
    ↓
Menu Contents:
  ┌────────────────┐
  │ [Avatar] Name  │
  │ Pro Badge      │
  ├────────────────┤
  │ 💬 Chat        │
  │ 📝 Tools ▾     │
  │   • Grammar    │
  │   • AI Detect  │
  │   • Humanizer  │
  │ 💎 Pricing     │
  │ ❓ Help        │
  ├────────────────┤
  │ ⚙️ Settings    │
  │ 🚪 Logout      │
  └────────────────┘
```

**Interaction**:
- Tap outside drawer → Close
- Swipe left → Close
- Press ESC → Close
- Smooth 300ms ease-out animation

---

### Breadcrumb Pattern

**When to use**: Deep pages (tool results, settings, profile)

```tsx
<Breadcrumbs>
  <Link href="/">Home</Link>
  <Separator>/</Separator>
  <Link href="/tools">Tools</Link>
  <Separator>/</Separator>
  <Current>Grammar Checker</Current>
</Breadcrumbs>
```

**Style**: Subtle (neutral-600), with orange hover

---

## Content Patterns

### Hero Section Pattern

#### Formula: Headline → Subheadline → CTA → Social Proof

```tsx
<HeroSection>
  {/* Attention grabber (2-3 seconds to read) */}
  <Headline>
    Your AI Assistant for <GradientText>Philippines</GradientText>
  </Headline>

  {/* Value proposition (5-7 seconds to read) */}
  <Subheadline>
    Chat naturally in Filipino or English. Get instant answers,
    write better, and boost productivity - absolutely free.
  </Subheadline>

  {/* Clear action (< 1 second to understand) */}
  <CTAGroup>
    <PrimaryButton size="lg">Start Free Chat</PrimaryButton>
    <SecondaryButton size="lg">See How It Works</SecondaryButton>
  </CTAGroup>

  {/* Trust indicator */}
  <SocialProof>
    <Stat>10,000+ Filipino users</Stat>
    <Stat>500,000+ chats</Stat>
    <Stat>4.8★ rating</Stat>
  </SocialProof>
</HeroSection>
```

**Copy Guidelines**:
- Headline: 5-8 words, benefit-focused
- Subheadline: 15-25 words, specific value
- CTA: Action verb + benefit ("Start Free Chat", not "Get Started")

---

### Feature Card Pattern

#### Pattern: Icon → Title → Description → CTA

```tsx
<FeatureCard>
  <Icon>
    <MessageCircle size={32} color="var(--primary-500)" />
  </Icon>

  <Title>Natural Conversations</Title>

  <Description>
    Chat in Filipino or English. HeyGPT understands context
    and responds like a real person, not a robot.
  </Description>

  <LearnMoreLink href="/features/chat">
    Try it free →
  </LearnMoreLink>
</FeatureCard>
```

**Layout**:
- Desktop: 3 cards per row
- Tablet: 2 cards per row
- Mobile: 1 card per row (full width)
- Gap: var(--space-6)

---

### FAQ Pattern

#### Pattern: Question-first, Scannable

```tsx
<FAQSection>
  <SectionHeader>
    <Badge>FAQ</Badge>
    <Heading>Frequently Asked Questions</Heading>
    <Subheading>Everything you need to know</Subheading>
  </SectionHeader>

  <FAQAccordion>
    {[
      {
        q: "Is HeyGPT really free?",
        a: "Yes! HeyGPT is 100% free for unlimited chats..."
      },
      {
        q: "Can I use HeyGPT in Filipino?",
        a: "Absolutely! HeyGPT understands and responds in both..."
      },
      // 6-8 more questions
    ]}
  </FAQAccordion>

  <CTAFooter>
    <Text>Still have questions?</Text>
    <Link href="/contact">Contact Support →</Link>
  </CTAFooter>
</FAQSection>
```

**Content Rules**:
- 8-10 questions maximum
- Start with most common questions
- Keep answers under 3 sentences
- Link to detailed docs for complex topics

---

## Conversion Patterns

### Guest → User Conversion

#### Pattern: Value First, Ask Later

```tsx
// Step 1: Let them try (no signup)
<GuestExperience>
  ✅ 3 free chats
  ✅ Full AI responses
  ✅ All features unlocked
  ❌ No chat history saved
  ❌ Can't access from other devices
</GuestExperience>

// Step 2: Show value accumulating
<ChatHeader>
  <ProgressBar value={2} max={3} />
  <Text>2 of 3 free chats used</Text>
</ChatHeader>

// Step 3: Friendly prompt at limit
<LoginPromptModal>
  <Icon>🎉</Icon>
  <Heading>You've used all 3 free chats!</Heading>
  <Subheading>
    Sign up free to continue chatting and unlock:
  </Subheading>
  <BenefitsList>
    ✓ Unlimited conversations
    ✓ Save your chat history
    ✓ Access from any device
    ✓ Priority support
  </BenefitsList>
  <CTAGroup>
    <PrimaryButton fullWidth>Sign Up Free</PrimaryButton>
    <GhostButton fullWidth>Maybe Later</GhostButton>
  </CTAGroup>
  <Disclaimer>No credit card required</Disclaimer>
</LoginPromptModal>
```

**Psychology**:
- "You've used" (achievement) not "You've run out" (failure)
- "Sign up" (neutral) not "Upgrade" (pressure)
- "Free" repeated 3x for emphasis
- Exit option always available (not a trap)

---

### Free → Premium Conversion

#### Pattern: Feature Gating, Not Paywalls

```tsx
// Show premium features with soft gate
<FeatureCard isPremium>
  <Badge variant="primary">Pro</Badge>
  <Title>Priority Responses</Title>
  <Description>
    Get instant responses even during peak hours.
    No waiting, ever.
  </Description>
  <CTAButton onClick={showUpgradeModal}>
    Upgrade to Pro →
  </CTAButton>
</FeatureCard>

// When clicked:
<UpgradeModal>
  <Heading>Unlock Pro Features</Heading>

  <ComparisonTable>
    <Column title="Free">
      ✓ Unlimited chats
      ✓ All tools
      ⏱️ Standard speed
      ❌ Priority support
    </Column>

    <Column title="Pro" highlighted>
      ✓ Everything in Free
      ⚡ Lightning fast
      ✓ Priority support
      ✓ Advanced features
    </Column>
  </ComparisonTable>

  <Pricing>
    <PriceTag>
      ₱549.95 <Small>/month</Small>
    </PriceTag>
    <Discount>Save 40% with annual</Discount>
  </Pricing>

  <CTAButton size="lg" fullWidth>
    Start 7-Day Free Trial
  </CTAButton>
</UpgradeModal>
```

**Timing**:
- Show Pro badge on features, but don't block
- Suggest upgrade after 10+ successful chats
- Offer trial during high-engagement moments

---

## Error Handling

### Error States Hierarchy

#### Level 1: Inline Errors (Minor)

**Example**: Invalid email format

```tsx
<Input
  label="Email"
  value={email}
  error="Please enter a valid email address"
  icon={<AlertCircle />}
/>
```

**Style**: Red text, red border, icon

---

#### Level 2: Form-level Errors (Moderate)

**Example**: Form submission failed

```tsx
<Alert variant="error">
  <AlertIcon><AlertTriangle /></AlertIcon>
  <AlertContent>
    <AlertTitle>Could not create account</AlertTitle>
    <AlertDescription>
      This email is already registered. Try logging in instead.
    </AlertDescription>
  </AlertContent>
  <AlertAction>
    <Link href="/api/auth/login">Go to Login</Link>
  </AlertAction>
</Alert>
```

**Placement**: Top of form, before fields

---

#### Level 3: Page-level Errors (Major)

**Example**: 404 Not Found

```tsx
<ErrorPage>
  <ErrorCode>404</ErrorCode>
  <ErrorHeading>Page not found</ErrorHeading>
  <ErrorDescription>
    The page you're looking for doesn't exist or has been moved.
  </ErrorDescription>
  <ErrorActions>
    <PrimaryButton href="/">Go Home</PrimaryButton>
    <SecondaryButton href="/chat">Start Chatting</SecondaryButton>
  </ErrorActions>
  <ErrorHelp>
    <Text>Need help?</Text>
    <Link href="/contact">Contact Support →</Link>
  </ErrorHelp>
</ErrorPage>
```

**Design**: Centered, friendly, actionable

---

#### Level 4: System Errors (Critical)

**Example**: API down, database error

```tsx
<ErrorBoundary>
  <SystemError>
    <Icon>⚠️</Icon>
    <Heading>Something went wrong</Heading>
    <Description>
      We're experiencing technical difficulties. Our team has been notified
      and we're working on a fix.
    </Description>
    <Timestamp>Error ID: {errorId}</Timestamp>
    <CTAGroup>
      <PrimaryButton onClick={retry}>Try Again</PrimaryButton>
      <GhostButton href="/">Go Home</GhostButton>
    </CTAGroup>
  </SystemError>
</ErrorBoundary>
```

**Pattern**: Always provide retry option and escape route

---

### Error Message Writing

#### Bad Examples ❌
- "Error 500: Internal Server Error" (too technical)
- "Invalid input" (not specific)
- "Something went wrong" (no action)
- "Failed to load data" (no context)

#### Good Examples ✅
- "We couldn't save your message. Please check your connection and try again."
- "Your email address needs an @ symbol. Example: name@email.com"
- "This username is already taken. Try adding numbers or underscores."
- "We're updating our servers. Please wait 2-3 minutes and refresh the page."

**Formula**: What happened + Why + What to do

---

## Loading States

### Skeleton Screens

**Pattern**: Show structure while loading

```tsx
// Chat loading
<ChatSkeleton>
  <MessageSkeleton align="left" />
  <MessageSkeleton align="right" />
  <MessageSkeleton align="left" />
</ChatSkeleton>

// Card grid loading
<CardGridSkeleton columns={3}>
  <CardSkeleton />
  <CardSkeleton />
  <CardSkeleton />
</CardGridSkeleton>
```

**Animation**: Shimmer effect (subtle, 1.5s loop)

---

### Progress Indicators

#### Determinate Progress (Known duration)

```tsx
<ProgressBar
  value={75}
  max={100}
  label="Analyzing text... 75%"
/>
```

**Use when**: File upload, text processing, report generation

---

#### Indeterminate Progress (Unknown duration)

```tsx
<Spinner size="md" />
<LoadingText>Processing your request...</LoadingText>
```

**Use when**: API calls, authentication, general waiting

---

### Optimistic UI Updates

**Pattern**: Show success immediately, roll back on error

```tsx
// User sends chat message
const sendMessage = async (text) => {
  // 1. Add message to UI immediately
  addMessageToUI({
    id: tempId,
    text,
    status: 'sending'
  })

  try {
    // 2. Send to server
    const response = await api.sendMessage(text)

    // 3. Update with real ID
    updateMessageStatus(tempId, {
      id: response.id,
      status: 'sent'
    })
  } catch (error) {
    // 4. On error: show failed state
    updateMessageStatus(tempId, {
      status: 'failed',
      error: 'Message not sent'
    })
  }
}
```

**Benefits**: Feels instant (no waiting for server)

---

## Mobile Patterns

### Mobile-First Approach

#### Touch Target Sizes

```css
/* Minimum touch target: 44x44px (Apple) / 48x48px (Android) */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 20px;
}

/* Spacing between interactive elements */
.button + .button {
  margin-top: var(--space-3); /* 12px minimum */
}
```

---

### Mobile Navigation Pattern

#### Bottom Tab Bar (Native App Feel)

```tsx
<BottomTabBar>
  <Tab href="/chat" icon={<MessageCircle />} label="Chat" />
  <Tab href="/tools" icon={<Tool />} label="Tools" />
  <Tab href="/history" icon={<Clock />} label="History" />
  <Tab href="/profile" icon={<User />} label="Profile" />
</BottomTabBar>
```

**Position**: Fixed bottom (always visible)
**Height**: 56px
**Safe area**: Respect iOS notch/home indicator

---

### Pull-to-Refresh Pattern

```tsx
<PullToRefresh onRefresh={loadNewMessages}>
  <MessageList>
    {messages.map(msg => <Message {...msg} />)}
  </MessageList>
</PullToRefresh>
```

**Behavior**:
1. Pull down > 80px → Show loading indicator
2. Release → Trigger refresh
3. Complete → Animate back to top

---

### Mobile Input Pattern

#### Pattern: Expand on Focus

```tsx
// Default state: Compact
<MobileChatInput>
  <Input placeholder="Type a message..." onFocus={expand} />
  <SendButton />
</MobileChatInput>

// Focused state: Expanded
<MobileChatInputExpanded>
  <Toolbar>
    <IconButton><Paperclip /></IconButton>
    <IconButton><Mic /></IconButton>
  </Toolbar>
  <TextArea autoFocus rows={4} />
  <ActionBar>
    <CancelButton>Cancel</CancelButton>
    <SendButton>Send</SendButton>
  </ActionBar>
</MobileChatInputExpanded>
```

**Animation**: Smooth 300ms expansion

---

## Accessibility Patterns

### Keyboard Navigation

#### Tab Order Logic

```html
<!-- Main navigation: Tab stops -->
<header>
  <a href="/" tabindex="0">Logo</a>
  <nav>
    <a href="/chat" tabindex="0">Chat</a>
    <a href="/tools" tabindex="0">Tools</a>
    <a href="/pricing" tabindex="0">Pricing</a>
  </nav>
  <button tabindex="0">Profile</button>
</header>

<!-- Content: Skip to main -->
<a href="#main" class="skip-link">Skip to main content</a>

<main id="main" tabindex="-1">
  <!-- Page content -->
</main>
```

**Keyboard Shortcuts**:
- `Tab`: Next element
- `Shift + Tab`: Previous element
- `Enter/Space`: Activate button/link
- `Esc`: Close modal/dropdown
- `/`: Focus search (global)
- `Ctrl/Cmd + K`: Command palette

---

### Screen Reader Patterns

#### ARIA Labels

```tsx
// Good: Descriptive labels
<button aria-label="Send message">
  <SendIcon aria-hidden="true" />
</button>

<input
  type="search"
  placeholder="Search chats..."
  aria-label="Search your chat history"
  role="searchbox"
/>

// Live regions for dynamic content
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {successMessage}
</div>
```

**Rules**:
- Every interactive element needs accessible name
- Use `aria-live` for dynamic updates
- Hide decorative icons with `aria-hidden="true"`

---

### Focus Management

#### Pattern: Trap Focus in Modals

```tsx
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      const previousFocus = document.activeElement

      // Focus first element in modal
      const firstFocusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()

      // Trap focus
      const handleTab = (e) => {
        if (e.key === 'Tab') {
          trapFocus(e, modalRef.current)
        }
        if (e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleTab)

      // Restore focus on close
      return () => {
        document.removeEventListener('keydown', handleTab)
        previousFocus?.focus()
      }
    }
  }, [isOpen])

  return <div ref={modalRef}>{children}</div>
}
```

---

## Feedback & Confirmation

### Success Feedback

#### Pattern: Toast Notifications

```tsx
// Temporary success message
<Toast variant="success" duration={3000}>
  <CheckCircle />
  <Text>Message sent successfully!</Text>
</Toast>

// Persistent success state
<Alert variant="success">
  <CheckCircle />
  <AlertContent>
    <AlertTitle>Account created!</AlertTitle>
    <AlertDescription>
      Check your email to verify your account.
    </AlertDescription>
  </AlertContent>
</Alert>
```

**Timing**:
- Toast: 3 seconds (auto-dismiss)
- Alert: Manual dismiss (user closes)

---

### Confirmation Dialogs

#### Pattern: Destructive Actions Need Confirmation

```tsx
// Deleting a chat
<ConfirmDialog
  variant="danger"
  title="Delete this chat?"
  description="This action cannot be undone. All messages will be permanently deleted."
  confirmText="Delete Chat"
  cancelText="Cancel"
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

**When to use**:
- ✅ Deleting data
- ✅ Leaving without saving
- ✅ Irreversible actions
- ❌ Simple navigation
- ❌ Cancellable actions

---

### Empty States

#### Pattern: Helpful, Not Sad

```tsx
// Bad: Just says "no data"
<EmptyState>
  <Text>No chats found</Text>
</EmptyState>

// Good: Shows next action
<EmptyState>
  <Icon>💬</Icon>
  <Heading>Start your first conversation</Heading>
  <Description>
    HeyGPT is ready to help you with anything - from
    answering questions to writing content.
  </Description>
  <CTAButton>Start Chatting</CTAButton>
</EmptyState>
```

**Formula**: Icon + Heading + Description + CTA

---

## Implementation Notes

### Animation Timing

```css
/* Fast: UI feedback */
--duration-fast: 150ms;

/* Base: Most transitions */
--duration-base: 250ms;

/* Slow: Complex animations */
--duration-slow: 400ms;

/* Page transitions */
--duration-page: 600ms;
```

### Easing Functions

```css
/* Entering elements */
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);

/* Exiting elements */
--ease-in: cubic-bezier(0.32, 0, 0.67, 0);

/* Moving elements */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

/* Bouncy (use sparingly) */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## User Testing Checklist

Before launching any page:

### Functionality
- [ ] All buttons and links work
- [ ] Forms validate correctly
- [ ] Error states display properly
- [ ] Loading states show correctly
- [ ] Success feedback appears

### Accessibility
- [ ] Can navigate entire page with keyboard
- [ ] Screen reader announces all content correctly
- [ ] Focus indicators are visible
- [ ] Color contrast passes WCAG AA
- [ ] Text can be resized to 200%

### Mobile
- [ ] Touch targets are minimum 44x44px
- [ ] Text is readable (minimum 16px body)
- [ ] Horizontal scrolling not required
- [ ] Forms work with mobile keyboards
- [ ] Navigation is thumb-friendly

### Performance
- [ ] Page loads in < 3 seconds on 3G
- [ ] Images are optimized
- [ ] No layout shift (CLS < 0.1)
- [ ] Animations are 60fps
- [ ] No blocking resources

### Filipino Users
- [ ] Content makes sense in Filipino context
- [ ] Pricing in Philippine Pesos (₱)
- [ ] Phone number format accepts 09xx
- [ ] Time zones handled correctly (GMT+8)
- [ ] Language toggle works (English ↔ Filipino)

---

**Version**: 1.0
**Status**: Ready for implementation
**Next**: See CONTENT_GUIDELINES.md for writing natural, engaging content
