# HeyGPT.ph UI Components Library
**Version**: 1.0
**Last Updated**: 2025-11-13
**Design System**: Desert Titanium Orange Theme

---

## Table of Contents
1. [Buttons](#buttons)
2. [Input Fields](#input-fields)
3. [Cards](#cards)
4. [Navigation](#navigation)
5. [Modals & Dialogs](#modals--dialogs)
6. [Forms](#forms)
7. [Badges & Tags](#badges--tags)
8. [Alerts & Notifications](#alerts--notifications)
9. [Loading States](#loading-states)
10. [Chat Components](#chat-components)
11. [Feature Sections](#feature-sections)
12. [Pricing Components](#pricing-components)
13. [FAQ Components](#faq-components)
14. [Footer](#footer)

---

## Buttons

### Primary Button
Main call-to-action, highest emphasis

```tsx
// Primary Button Component
export function ButtonPrimary({
  children,
  onClick,
  disabled = false,
  size = 'md',
  fullWidth = false,
  loading = false,
  icon = null,
}: ButtonPrimaryProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        btn-primary
        ${size === 'sm' ? 'btn-sm' : ''}
        ${size === 'lg' ? 'btn-lg' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${loading ? 'loading' : ''}
      `}
    >
      {loading ? (
        <Spinner size={size === 'sm' ? 16 : 20} />
      ) : icon ? (
        <span className="btn-icon">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
```

```css
/* Primary Button Styles */
.btn-primary {
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);

  /* Typography */
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  line-height: 1;
  text-decoration: none;

  /* Colors */
  background: var(--primary-500);
  color: white;
  border: none;

  /* Spacing */
  padding: 14px 24px;

  /* Shape */
  border-radius: var(--radius-lg);

  /* Transitions */
  transition: all var(--duration-base) var(--ease-out);
  cursor: pointer;

  /* Shadow */
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active:not(:disabled) {
  background: var(--primary-700);
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-primary:disabled {
  background: var(--neutral-300);
  color: var(--neutral-500);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Size variants */
.btn-sm {
  padding: 10px 20px;
  font-size: var(--text-sm);
}

.btn-lg {
  padding: 18px 32px;
  font-size: var(--text-lg);
}

/* Loading state */
.btn-primary.loading {
  pointer-events: none;
  opacity: 0.7;
}
```

**Usage Examples**:
```tsx
// Standard
<ButtonPrimary>Start Free Chat</ButtonPrimary>

// With icon
<ButtonPrimary icon={<ArrowRight />}>
  Get Started
</ButtonPrimary>

// Loading state
<ButtonPrimary loading>Processing...</ButtonPrimary>

// Small size
<ButtonPrimary size="sm">Learn More</ButtonPrimary>

// Full width
<ButtonPrimary fullWidth>Continue</ButtonPrimary>
```

### Secondary Button
Alternative actions, medium emphasis

```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);

  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  line-height: 1;

  background: transparent;
  color: var(--primary-600);
  border: 2px solid var(--primary-500);

  padding: 12px 24px;
  border-radius: var(--radius-lg);

  transition: all var(--duration-base) var(--ease-out);
  cursor: pointer;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--primary-500);
  color: white;
  transform: translateY(-1px);
}

.btn-secondary:active:not(:disabled) {
  background: var(--primary-600);
  transform: translateY(0);
}

.btn-secondary:disabled {
  border-color: var(--neutral-300);
  color: var(--neutral-400);
  cursor: not-allowed;
  opacity: 0.6;
}
```

### Ghost Button
Minimal emphasis, tertiary actions

```css
.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);

  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--font-medium);

  background: transparent;
  color: var(--neutral-700);
  border: none;

  padding: 12px 20px;
  border-radius: var(--radius-base);

  transition: all var(--duration-base) var(--ease-out);
  cursor: pointer;
}

.btn-ghost:hover:not(:disabled) {
  background: var(--neutral-100);
  color: var(--primary-600);
}

.btn-ghost:active:not(:disabled) {
  background: var(--neutral-200);
}
```

### Icon Button
Icon-only button

```tsx
export function IconButton({
  icon,
  label,
  onClick,
  variant = 'default',
  size = 'md',
}: IconButtonProps) {
  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 48,
  }

  return (
    <button
      onClick={onClick}
      className={`icon-button icon-button-${variant}`}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
      }}
      aria-label={label}
    >
      {icon}
    </button>
  )
}
```

```css
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: transparent;
  border: none;
  border-radius: var(--radius-base);

  transition: all var(--duration-base) var(--ease-out);
  cursor: pointer;
}

.icon-button:hover {
  background: var(--neutral-100);
}

.icon-button:active {
  background: var(--neutral-200);
}

.icon-button-primary {
  color: var(--primary-600);
}

.icon-button-primary:hover {
  background: var(--primary-50);
}
```

---

## Input Fields

### Text Input
Standard text input field

```tsx
export function TextInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  icon = null,
  type = 'text',
}: TextInputProps) {
  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <div className={`input-container ${error ? 'error' : ''}`}>
        {icon && <span className="input-icon-left">{icon}</span>}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`input ${icon ? 'has-icon' : ''}`}
          required={required}
        />
      </div>

      {(error || helperText) && (
        <p className={`input-helper ${error ? 'error' : ''}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
}
```

```css
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--neutral-700);
}

.input-label .required {
  color: var(--error-500);
  margin-left: var(--space-1);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  height: 48px;

  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--neutral-800);

  background: var(--bg-primary);
  border: 2px solid var(--neutral-200);
  border-radius: var(--radius-base);

  padding: 0 var(--space-4);

  transition: all var(--duration-base) var(--ease-out);
}

.input.has-icon {
  padding-left: 44px;
}

.input:hover:not(:disabled) {
  border-color: var(--neutral-300);
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(232, 132, 74, 0.1);
}

.input:disabled {
  background: var(--neutral-100);
  color: var(--neutral-500);
  cursor: not-allowed;
}

.input::placeholder {
  color: var(--neutral-400);
}

.input-container.error .input {
  border-color: var(--error-500);
}

.input-container.error .input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-icon-left {
  position: absolute;
  left: var(--space-4);
  color: var(--neutral-500);
  display: flex;
  align-items: center;
}

.input-helper {
  font-size: var(--text-sm);
  color: var(--neutral-600);
}

.input-helper.error {
  color: var(--error-600);
}
```

### Textarea
Multi-line text input

```tsx
export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  error,
  helperText,
  required = false,
  disabled = false,
  maxLength,
}: TextareaProps) {
  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`textarea ${error ? 'error' : ''}`}
        required={required}
        maxLength={maxLength}
      />

      <div className="textarea-footer">
        {(error || helperText) && (
          <p className={`input-helper ${error ? 'error' : ''}`}>
            {error || helperText}
          </p>
        )}
        {maxLength && (
          <p className="char-count">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
```

```css
.textarea {
  width: 100%;
  min-height: 120px;

  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--neutral-800);

  background: var(--bg-primary);
  border: 2px solid var(--neutral-200);
  border-radius: var(--radius-base);

  padding: var(--space-3) var(--space-4);

  transition: all var(--duration-base) var(--ease-out);
  resize: vertical;
}

.textarea:hover:not(:disabled) {
  border-color: var(--neutral-300);
}

.textarea:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(232, 132, 74, 0.1);
}

.textarea.error {
  border-color: var(--error-500);
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: var(--text-xs);
  color: var(--neutral-500);
  margin-left: auto;
}
```

---

## Cards

### Basic Card
Foundation for all card variants

```tsx
export function Card({
  children,
  padding = 'md',
  hover = false,
  onClick,
  className = '',
}: CardProps) {
  return (
    <div
      className={`
        card
        card-padding-${padding}
        ${hover ? 'card-hover' : ''}
        ${onClick ? 'card-clickable' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
```

```css
.card {
  background: var(--bg-primary);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-lg);

  transition: all var(--duration-medium) var(--ease-out);
}

.card-padding-sm { padding: var(--space-4); }
.card-padding-md { padding: var(--space-6); }
.card-padding-lg { padding: var(--space-8); }

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-200);
}

.card-clickable {
  cursor: pointer;
}

.card-clickable:active {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### Feature Card
For showcasing features

```tsx
export function FeatureCard({
  icon,
  title,
  description,
  link,
}: FeatureCardProps) {
  return (
    <Card hover padding="lg">
      <div className="feature-card">
        <div className="feature-icon">
          {icon}
        </div>

        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>

        {link && (
          <a href={link.href} className="feature-link">
            {link.text}
            <ArrowRight size={16} />
          </a>
        )}
      </div>
    </Card>
  )
}
```

```css
.feature-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.feature-icon {
  width: 56px;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--gradient-primary-soft);
  border-radius: var(--radius-md);

  color: var(--primary-600);
}

.feature-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--neutral-800);
  margin: 0;
}

.feature-description {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--neutral-600);
  margin: 0;
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);

  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--primary-600);
  text-decoration: none;

  transition: all var(--duration-base) var(--ease-out);
}

.feature-link:hover {
  color: var(--primary-700);
  gap: var(--space-3);
}
```

### Stats Card
For displaying metrics

```tsx
export function StatsCard({
  icon,
  value,
  label,
  trend,
}: StatsCardProps) {
  return (
    <Card padding="lg">
      <div className="stats-card">
        <div className="stats-header">
          <div className="stats-icon">{icon}</div>
          {trend && (
            <span className={`stats-trend ${trend.direction}`}>
              {trend.direction === 'up' ? <TrendingUp /> : <TrendingDown />}
              {trend.value}%
            </span>
          )}
        </div>

        <p className="stats-value">{value}</p>
        <p className="stats-label">{label}</p>
      </div>
    </Card>
  )
}
```

```css
.stats-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-icon {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--primary-50);
  border-radius: var(--radius-base);
  color: var(--primary-600);
}

.stats-trend {
  display: flex;
  align-items: center;
  gap: var(--space-1);

  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}

.stats-trend.up {
  color: var(--success-600);
}

.stats-trend.down {
  color: var(--error-600);
}

.stats-value {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--neutral-900);
  margin: 0;
}

.stats-label {
  font-size: var(--text-sm);
  color: var(--neutral-600);
  margin: 0;
}
```

---

## Navigation

### Top Navigation Bar
Main site navigation

```tsx
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link href="/" className="navbar-logo">
            <Logo />
            <span className="logo-text">HeyGPT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-menu desktop">
            <NavLink href="/chat">Chat</NavLink>
            <NavLink href="/grammar-checker">Grammar Checker</NavLink>
            <NavLink href="/ai-detector">AI Detector</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {user ? (
              <div className="user-menu">
                <UserAvatar user={user} />
              </div>
            ) : (
              <>
                <ButtonGhost href="/api/auth/login">
                  Login
                </ButtonGhost>
                <ButtonPrimary href="/api/auth/login">
                  Sign Up Free
                </ButtonPrimary>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mobile-menu">
            <NavLink href="/chat">Chat</NavLink>
            <NavLink href="/grammar-checker">Grammar Checker</NavLink>
            <NavLink href="/ai-detector">AI Detector</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>

            <div className="mobile-menu-actions">
              {!user && (
                <>
                  <ButtonPrimary fullWidth href="/api/auth/login">
                    Sign Up Free
                  </ButtonPrimary>
                  <ButtonGhost fullWidth href="/api/auth/login">
                    Login
                  </ButtonGhost>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
```

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;

  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--neutral-200);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;

  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--neutral-900);
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.navbar-menu.desktop {
  display: none;
}

@media (min-width: 1024px) {
  .navbar-menu.desktop {
    display: flex;
  }
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.mobile-menu-button {
  display: flex;
  padding: var(--space-2);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--neutral-700);
}

@media (min-width: 1024px) {
  .mobile-menu-button {
    display: none;
  }
}

.mobile-menu {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4) 0;
  border-top: 1px solid var(--neutral-200);
}

@media (min-width: 1024px) {
  .mobile-menu {
    display: none;
  }
}

.mobile-menu-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--neutral-200);
}
```

### Nav Link
Individual navigation link

```tsx
function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`nav-link ${isActive ? 'active' : ''}`}
    >
      {children}
    </Link>
  )
}
```

```css
.nav-link {
  position: relative;

  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--neutral-600);
  text-decoration: none;

  padding: var(--space-2) var(--space-1);

  transition: color var(--duration-base) var(--ease-out);
}

.nav-link:hover {
  color: var(--primary-600);
}

.nav-link.active {
  color: var(--primary-600);
  font-weight: var(--font-semibold);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-500);
  border-radius: var(--radius-full);
}
```

---

## Modals & Dialogs

### Modal Base
Foundation for all modals

```tsx
export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  title,
  closeButton = true,
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || closeButton) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {closeButton && (
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}
```

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);

  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);

  animation: fadeIn var(--duration-medium) var(--ease-out);
}

.modal {
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;

  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);

  animation: scaleUp var(--duration-medium) var(--ease-out);
}

.modal-sm { max-width: 400px; }
.modal-md { max-width: 600px; }
.modal-lg { max-width: 800px; }
.modal-xl { max-width: 1200px; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);

  padding: var(--space-6);
  border-bottom: 1px solid var(--neutral-200);
}

.modal-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--neutral-900);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  background: transparent;
  border: none;
  border-radius: var(--radius-base);

  color: var(--neutral-600);
  cursor: pointer;

  transition: all var(--duration-base) var(--ease-out);
}

.modal-close:hover {
  background: var(--neutral-100);
  color: var(--neutral-900);
}

.modal-body {
  padding: var(--space-6);
}
```

### Login Prompt Modal
Specific modal for guest user limit

```tsx
export function LoginPromptModal({
  isOpen,
  onClose,
}: LoginPromptModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="login-prompt">
        <div className="login-prompt-icon">
          <Lock size={48} />
        </div>

        <h2 className="login-prompt-title">
          You've reached your free chat limit
        </h2>

        <p className="login-prompt-description">
          Sign up for free to continue chatting and unlock:
        </p>

        <ul className="login-prompt-benefits">
          <li>
            <Check size={20} />
            Unlimited AI conversations
          </li>
          <li>
            <Check size={20} />
            Save your chat history
          </li>
          <li>
            <Check size={20} />
            Filipino & English support
          </li>
          <li>
            <Check size={20} />
            Access from any device
          </li>
        </ul>

        <div className="login-prompt-actions">
          <ButtonPrimary
            fullWidth
            onClick={() => window.location.href = '/api/auth/login'}
          >
            Sign Up Free
          </ButtonPrimary>

          <ButtonSecondary
            fullWidth
            onClick={() => window.location.href = '/api/auth/login'}
          >
            Login
          </ButtonSecondary>
        </div>

        <p className="login-prompt-note">
          No credit card required • Free forever
        </p>
      </div>
    </Modal>
  )
}
```

```css
.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  text-align: center;
  padding: var(--space-8) var(--space-6);
}

.login-prompt-icon {
  width: 80px;
  height: 80px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--gradient-primary-soft);
  border-radius: var(--radius-full);
  color: var(--primary-600);
}

.login-prompt-title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--neutral-900);
  margin: 0;
}

.login-prompt-description {
  font-size: var(--text-lg);
  color: var(--neutral-600);
  margin: 0;
}

.login-prompt-benefits {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  width: 100%;
  padding: 0;
  list-style: none;
  text-align: left;
}

.login-prompt-benefits li {
  display: flex;
  align-items: center;
  gap: var(--space-3);

  font-size: var(--text-base);
  color: var(--neutral-700);
}

.login-prompt-benefits li svg {
  flex-shrink: 0;
  color: var(--success-600);
}

.login-prompt-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
}

.login-prompt-note {
  font-size: var(--text-sm);
  color: var(--neutral-500);
  margin: 0;
}
```

---

## Forms

### Complete Form Example

```tsx
export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    const newErrors = {}
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.message) newErrors.message = 'Message is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    // Submit logic here
    await submitForm(formData)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <TextInput
        label="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        error={errors.name}
        required
        icon={<User size={20} />}
      />

      <TextInput
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        error={errors.email}
        required
        icon={<Mail size={20} />}
      />

      <Textarea
        label="Message"
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        error={errors.message}
        rows={6}
        required
        maxLength={500}
      />

      <ButtonPrimary
        type="submit"
        loading={loading}
        fullWidth
      >
        Send Message
      </ButtonPrimary>
    </form>
  )
}
```

```css
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
```

---

## Badges & Tags

### Badge Component
For status indicators and counts

```tsx
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant} badge-${size}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  )
}
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);

  font-family: var(--font-body);
  font-weight: var(--font-medium);

  border-radius: var(--radius-full);
  white-space: nowrap;
}

/* Size variants */
.badge-sm {
  font-size: var(--text-xs);
  padding: 2px 8px;
}

.badge-md {
  font-size: var(--text-sm);
  padding: 4px 12px;
}

.badge-lg {
  font-size: var(--text-base);
  padding: 6px 16px;
}

/* Color variants */
.badge-default {
  background: var(--neutral-100);
  color: var(--neutral-700);
}

.badge-primary {
  background: var(--primary-100);
  color: var(--primary-700);
}

.badge-success {
  background: var(--success-50);
  color: var(--success-700);
}

.badge-error {
  background: var(--error-50);
  color: var(--error-700);
}

.badge-warning {
  background: var(--warning-50);
  color: var(--warning-700);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: currentColor;
}
```

**Usage**:
```tsx
<Badge>New</Badge>
<Badge variant="primary">Popular</Badge>
<Badge variant="success" dot>Active</Badge>
<Badge variant="error">Limited</Badge>
```

### Tag Component
For categorical labels

```tsx
export function Tag({
  children,
  onRemove,
  color = 'default',
}: TagProps) {
  return (
    <span className={`tag tag-${color}`}>
      {children}
      {onRemove && (
        <button
          className="tag-remove"
          onClick={onRemove}
          aria-label="Remove tag"
        >
          <X size={14} />
        </button>
      )}
    </span>
  )
}
```

```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);

  font-size: var(--text-sm);
  font-weight: var(--font-medium);

  padding: 6px 12px;
  border-radius: var(--radius-base);

  background: var(--neutral-100);
  color: var(--neutral-700);

  transition: all var(--duration-base) var(--ease-out);
}

.tag-primary {
  background: var(--primary-50);
  color: var(--primary-700);
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 2px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);

  color: currentColor;
  opacity: 0.6;
  cursor: pointer;

  transition: all var(--duration-base) var(--ease-out);
}

.tag-remove:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}
```

---

## Alerts & Notifications

### Alert Component
For important messages

```tsx
export function Alert({
  type = 'info',
  title,
  message,
  onClose,
  action,
}: AlertProps) {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  }

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div className="alert-icon">{icons[type]}</div>

      <div className="alert-content">
        {title && <p className="alert-title">{title}</p>}
        <p className="alert-message">{message}</p>
        {action && (
          <button className="alert-action" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>

      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close alert">
          <X size={18} />
        </button>
      )}
    </div>
  )
}
```

```css
.alert {
  display: flex;
  gap: var(--space-3);

  padding: var(--space-4);
  border-radius: var(--radius-base);
  border: 1px solid;

  animation: slideInRight var(--duration-medium) var(--ease-out);
}

.alert-success {
  background: var(--success-50);
  border-color: var(--success-200);
  color: var(--success-900);
}

.alert-error {
  background: var(--error-50);
  border-color: var(--error-200);
  color: var(--error-900);
}

.alert-warning {
  background: var(--warning-50);
  border-color: var(--warning-200);
  color: var(--warning-900);
}

.alert-info {
  background: var(--info-50);
  border-color: var(--info-200);
  color: var(--info-900);
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-1) 0;
}

.alert-message {
  font-size: var(--text-sm);
  margin: 0;
  opacity: 0.9;
}

.alert-action {
  margin-top: var(--space-2);
  padding: 0;
  background: transparent;
  border: none;

  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: currentColor;
  text-decoration: underline;
  cursor: pointer;
}

.alert-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  background: transparent;
  border: none;
  border-radius: var(--radius-sm);

  color: currentColor;
  opacity: 0.6;
  cursor: pointer;

  transition: all var(--duration-base) var(--ease-out);
}

.alert-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}
```

### Toast Notification
Pop-up notifications

```tsx
export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className={`toast toast-${type}`}>
      <Alert type={type} message={message} onClose={onClose} />
    </div>
  )
}
```

```css
.toast {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  z-index: 1000;

  min-width: 300px;
  max-width: 500px;

  animation: slideInRight var(--duration-medium) var(--ease-out);
}

@media (max-width: 640px) {
  .toast {
    left: var(--space-4);
    right: var(--space-4);
    min-width: auto;
  }
}
```

---

## Loading States

### Spinner
Simple loading spinner

```tsx
export function Spinner({
  size = 24,
  color = 'primary',
}: SpinnerProps) {
  return (
    <svg
      className={`spinner spinner-${color}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="spinner-track"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <circle
        className="spinner-head"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
```

```css
.spinner {
  animation: spin 1s linear infinite;
}

.spinner-track {
  opacity: 0.25;
}

.spinner-head {
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
  animation: spinner-dash 1.5s ease-in-out infinite;
}

.spinner-primary { color: var(--primary-500); }
.spinner-white { color: white; }
.spinner-neutral { color: var(--neutral-500); }

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes spinner-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
```

### Skeleton Loader
Content placeholder

```tsx
export function Skeleton({
  width,
  height,
  variant = 'rectangular',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton skeleton-${variant}`}
      style={{ width, height }}
    />
  )
}
```

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--neutral-100) 0%,
    var(--neutral-200) 50%,
    var(--neutral-100) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.skeleton-rectangular {
  border-radius: var(--radius-base);
}

.skeleton-circular {
  border-radius: var(--radius-full);
}

.skeleton-text {
  height: 1em;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Progress Bar

```tsx
export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  color = 'primary',
}: ProgressBarProps) {
  const percentage = (value / max) * 100

  return (
    <div className="progress-wrapper">
      {showLabel && (
        <div className="progress-label">
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="progress-track">
        <div
          className={`progress-bar progress-bar-${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
```

```css
.progress-wrapper {
  width: 100%;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-2);

  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--neutral-700);
}

.progress-track {
  width: 100%;
  height: 8px;

  background: var(--neutral-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: var(--radius-full);

  transition: width var(--duration-medium) var(--ease-out);
}

.progress-bar-primary {
  background: var(--gradient-primary);
}

.progress-bar-success {
  background: var(--success-500);
}
```

---

## Chat Components

### Chat Message
Individual chat message bubble

```tsx
export function ChatMessage({
  message,
  isUser,
  timestamp,
  avatar,
}: ChatMessageProps) {
  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && avatar && (
        <div className="message-avatar">
          <img src={avatar} alt="AI" />
        </div>
      )}

      <div className="message-content">
        <div className="message-bubble">
          <p className="message-text">{message}</p>
        </div>
        <span className="message-timestamp">{timestamp}</span>
      </div>

      {isUser && avatar && (
        <div className="message-avatar">
          <img src={avatar} alt="You" />
        </div>
      )}
    </div>
  )
}
```

```css
.chat-message {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) 0;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-width: 70%;
}

.chat-message.user .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);

  background: var(--neutral-100);
  color: var(--neutral-800);
}

.chat-message.user .message-bubble {
  background: var(--gradient-primary);
  color: white;
}

.message-text {
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  margin: 0;
  word-wrap: break-word;
}

.message-timestamp {
  font-size: var(--text-xs);
  color: var(--neutral-500);
  padding: 0 var(--space-2);
}
```

### Chat Input
Message composition area

```tsx
export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !disabled) {
      onSend()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <div className="chat-input-wrapper">
        <textarea
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="chat-input"
          rows={1}
        />

        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="chat-send-button"
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  )
}
```

```css
.chat-input-form {
  width: 100%;
}

.chat-input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);

  padding: var(--space-4);
  background: var(--bg-primary);
  border: 2px solid var(--neutral-200);
  border-radius: var(--radius-lg);

  transition: all var(--duration-base) var(--ease-out);
}

.chat-input-wrapper:focus-within {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(232, 132, 74, 0.1);
}

.chat-input {
  flex: 1;

  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--neutral-800);

  background: transparent;
  border: none;
  outline: none;

  max-height: 150px;
  resize: none;
}

.chat-input::placeholder {
  color: var(--neutral-400);
}

.chat-send-button {
  flex-shrink: 0;
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--primary-500);
  border: none;
  border-radius: var(--radius-base);

  color: white;
  cursor: pointer;

  transition: all var(--duration-base) var(--ease-out);
}

.chat-send-button:hover:not(:disabled) {
  background: var(--primary-600);
  transform: scale(1.05);
}

.chat-send-button:disabled {
  background: var(--neutral-300);
  cursor: not-allowed;
  opacity: 0.5;
}
```

---

## Feature Sections

### Hero Section
Main landing page hero

```tsx
export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <Badge variant="primary">Free Forever</Badge>

          <h1 className="hero-title">
            Your AI Assistant for
            <span className="gradient-text"> Philippines</span>
          </h1>

          <p className="hero-description">
            Chat naturally in Filipino or English. Get instant answers,
            write better, and boost your productivity with AI - absolutely free.
          </p>

          <div className="hero-actions">
            <ButtonPrimary size="lg" icon={<MessageCircle />}>
              Start Free Chat
            </ButtonPrimary>
            <ButtonSecondary size="lg">
              Watch Demo
            </ButtonSecondary>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <p className="stat-value">10,000+</p>
              <p className="stat-label">Happy Users</p>
            </div>
            <div className="stat">
              <p className="stat-value">50,000+</p>
              <p className="stat-label">Chats Daily</p>
            </div>
            <div className="stat">
              <p className="stat-value">4.9/5</p>
              <p className="stat-label">User Rating</p>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="chat-preview">
            {/* Chat interface preview */}
          </div>
        </div>
      </div>
    </section>
  )
}
```

```css
.hero-section {
  padding: var(--space-32) 0;
  background: var(--gradient-bg-warm);
  overflow: hidden;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-6);
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--neutral-900);
  margin: 0;
}

.gradient-text {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: var(--text-xl);
  line-height: var(--leading-relaxed);
  color: var(--neutral-600);
  margin: 0;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  justify-content: center;
}

.hero-stats {
  display: flex;
  gap: var(--space-8);
  margin-top: var(--space-8);
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--primary-600);
  margin: 0;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--neutral-600);
  margin: var(--space-1) 0 0 0;
}

@media (max-width: 640px) {
  .hero-stats {
    flex-direction: column;
    gap: var(--space-4);
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }
}
```

### Features Grid
Feature showcase section

```tsx
export function FeaturesSection() {
  const features = [
    {
      icon: <MessageCircle />,
      title: "Natural Conversations",
      description: "Chat in Filipino or English naturally, just like talking to a friend"
    },
    {
      icon: <Zap />,
      title: "Lightning Fast",
      description: "Get instant responses powered by advanced AI technology"
    },
    {
      icon: <Shield />,
      title: "100% Private",
      description: "Your conversations are secure and never shared with anyone"
    },
    {
      icon: <Globe />,
      title: "Always Available",
      description: "Access your AI assistant 24/7 from any device, anywhere"
    },
    {
      icon: <BookOpen />,
      title: "Learn & Grow",
      description: "Get help with homework, research, and learning new skills"
    },
    {
      icon: <Sparkles />,
      title: "Creative Writing",
      description: "Write emails, essays, stories, and more with AI assistance"
    }
  ]

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <Badge variant="primary">Features</Badge>
          <h2 className="section-title">
            Why Filipinos Love HeyGPT
          </h2>
          <p className="section-description">
            Everything you need in an AI assistant, built specifically
            for the Philippine market
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

```css
.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
  max-width: 700px;
  margin: 0 auto var(--space-12) auto;
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--neutral-900);
  margin: 0;
}

.section-description {
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  color: var(--neutral-600);
  margin: 0;
}
```

---

## Pricing Components

### Pricing Card

```tsx
export function PricingCard({
  tier,
  price,
  period,
  features,
  highlighted = false,
  cta,
}: PricingCardProps) {
  return (
    <Card
      className={`pricing-card ${highlighted ? 'highlighted' : ''}`}
      padding="lg"
    >
      {highlighted && (
        <Badge variant="primary" className="pricing-badge">
          Most Popular
        </Badge>
      )}

      <div className="pricing-header">
        <h3 className="pricing-tier">{tier}</h3>
        <div className="pricing-price">
          <span className="price-currency">₱</span>
          <span className="price-amount">{price}</span>
          <span className="price-period">/{period}</span>
        </div>
      </div>

      <ul className="pricing-features">
        {features.map((feature, index) => (
          <li key={index} className="pricing-feature">
            <Check size={20} />
            {feature}
          </li>
        ))}
      </ul>

      <ButtonPrimary fullWidth size="lg">
        {cta}
      </ButtonPrimary>
    </Card>
  )
}
```

```css
.pricing-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.pricing-card.highlighted {
  border: 2px solid var(--primary-500);
  box-shadow: var(--shadow-lg);
}

.pricing-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
}

.pricing-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.pricing-tier {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--neutral-800);
  margin: 0;
}

.pricing-price {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}

.price-currency {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--primary-600);
}

.price-amount {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  color: var(--neutral-900);
}

.price-period {
  font-size: var(--text-lg);
  color: var(--neutral-600);
}

.pricing-features {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: 0;
  list-style: none;
}

.pricing-feature {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);

  font-size: var(--text-base);
  color: var(--neutral-700);
}

.pricing-feature svg {
  flex-shrink: 0;
  color: var(--success-600);
  margin-top: 2px;
}
```

---

## FAQ Components

### FAQ Accordion

```tsx
export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="faq-accordion">
      {items.map((item, index) => (
        <FAQItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  )
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button className="faq-question" onClick={onClick}>
        <span>{question}</span>
        <ChevronDown className={`faq-icon ${isOpen ? 'rotate' : ''}`} />
      </button>

      {isOpen && (
        <div className="faq-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  )
}
```

```css
.faq-accordion {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.faq-item {
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-lg);
  overflow: hidden;

  transition: all var(--duration-base) var(--ease-out);
}

.faq-item.open {
  border-color: var(--primary-300);
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);

  width: 100%;
  padding: var(--space-4) var(--space-5);

  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  text-align: left;
  color: var(--neutral-800);

  background: transparent;
  border: none;
  cursor: pointer;

  transition: all var(--duration-base) var(--ease-out);
}

.faq-question:hover {
  background: var(--neutral-50);
}

.faq-icon {
  flex-shrink: 0;
  color: var(--primary-500);

  transition: transform var(--duration-base) var(--ease-out);
}

.faq-icon.rotate {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 var(--space-5) var(--space-4) var(--space-5);

  animation: fadeIn var(--duration-medium) var(--ease-out);
}

.faq-answer p {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--neutral-600);
  margin: 0;
}
```

---

## Footer

### Site Footer

```tsx
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand */}
          <div className="footer-brand">
            <Logo />
            <h3 className="footer-brand-name">HeyGPT.ph</h3>
            <p className="footer-brand-tagline">
              Your AI assistant for Philippines
            </p>

            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="footer-links">
            <div className="footer-column">
              <h4 className="footer-heading">Product</h4>
              <ul className="footer-list">
                <li><a href="/chat">AI Chat</a></li>
                <li><a href="/grammar-checker">Grammar Checker</a></li>
                <li><a href="/ai-detector">AI Detector</a></li>
                <li><a href="/pricing">Pricing</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-list">
                <li><a href="/about">About Us</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-heading">Legal</h4>
              <ul className="footer-list">
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="/cookies">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} HeyGPT.ph. All rights reserved.
          </p>

          <div className="footer-badges">
            <Badge variant="success" dot>Secure</Badge>
            <Badge>Made in Philippines 🇵🇭</Badge>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

```css
.footer {
  background: var(--neutral-900);
  color: var(--neutral-300);
  padding: var(--space-16) 0 var(--space-8) 0;
}

.footer-content {
  display: grid;
  gap: var(--space-12);
  grid-template-columns: 1fr;
  margin-bottom: var(--space-12);
}

@media (min-width: 768px) {
  .footer-content {
    grid-template-columns: 2fr 3fr;
  }
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.footer-brand-name {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: white;
  margin: 0;
}

.footer-brand-tagline {
  font-size: var(--text-base);
  color: var(--neutral-400);
  margin: 0;
}

.footer-social {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  background: var(--neutral-800);
  border-radius: var(--radius-base);

  color: var(--neutral-400);
  text-decoration: none;

  transition: all var(--duration-base) var(--ease-out);
}

.social-link:hover {
  background: var(--primary-600);
  color: white;
  transform: translateY(-2px);
}

.footer-links {
  display: grid;
  gap: var(--space-8);
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.footer-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.footer-heading {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: white;
  margin: 0;
}

.footer-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: 0;
  list-style: none;
}

.footer-list a {
  font-size: var(--text-sm);
  color: var(--neutral-400);
  text-decoration: none;

  transition: color var(--duration-base) var(--ease-out);
}

.footer-list a:hover {
  color: var(--primary-400);
}

.footer-bottom {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: center;
  justify-content: space-between;

  padding-top: var(--space-8);
  border-top: 1px solid var(--neutral-800);
}

@media (min-width: 768px) {
  .footer-bottom {
    flex-direction: row;
  }
}

.footer-copyright {
  font-size: var(--text-sm);
  color: var(--neutral-500);
  margin: 0;
}

.footer-badges {
  display: flex;
  gap: var(--space-3);
}
```

---

## Component Usage Guidelines

### Do's ✅
- Use semantic HTML elements
- Maintain consistent spacing
- Follow accessibility guidelines
- Use design tokens for all values
- Keep components modular and reusable
- Add appropriate ARIA labels
- Test on mobile devices
- Optimize for performance

### Don'ts ❌
- Don't use inline styles for color/spacing
- Don't hardcode pixel values
- Don't skip focus states
- Don't forget loading/error states
- Don't ignore mobile responsiveness
- Don't overcomplicate components
- Don't forget keyboard navigation

---

**Version**: 1.0
**Status**: Ready for implementation
**Next**: See UX_PATTERNS.md for user flows and interaction patterns

