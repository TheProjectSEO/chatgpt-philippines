'use client'

import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import './components.css'

type AlertType = 'success' | 'error' | 'warning' | 'info'

interface AlertAction {
  label: string
  onClick: () => void
}

interface AlertProps {
  type?: AlertType
  title?: string
  message: string
  onClose?: () => void
  action?: AlertAction
  className?: string
}

export default function Alert({
  type = 'info',
  title,
  message,
  onClose,
  action,
  className = ''
}: AlertProps) {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />
  }

  return (
    <div className={`alert alert-${type} ${className}`} role="alert">
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
        <button
          className="alert-close"
          onClick={onClose}
          aria-label="Close alert"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}

// Toast notification container (position fixed)
interface ToastProps extends AlertProps {
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export function Toast({
  type = 'info',
  title,
  message,
  onClose,
  action,
  duration,
  position = 'top-right',
  className = ''
}: ToastProps) {
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: 'var(--space-4)', right: 'var(--space-4)' },
    'top-left': { top: 'var(--space-4)', left: 'var(--space-4)' },
    'bottom-right': { bottom: 'var(--space-4)', right: 'var(--space-4)' },
    'bottom-left': { bottom: 'var(--space-4)', left: 'var(--space-4)' },
    'top-center': { top: 'var(--space-4)', left: '50%', transform: 'translateX(-50%)' },
    'bottom-center': { bottom: 'var(--space-4)', left: '50%', transform: 'translateX(-50%)' }
  }

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 'var(--z-notification)',
        minWidth: '300px',
        maxWidth: '500px'
      }}
      className={className}
    >
      <Alert
        type={type}
        title={title}
        message={message}
        onClose={onClose}
        action={action}
      />
    </div>
  )
}

// Alert variants for common use cases
export function SuccessAlert({
  title = 'Success',
  message,
  onClose,
  className = ''
}: Omit<AlertProps, 'type'>) {
  return (
    <Alert
      type="success"
      title={title}
      message={message}
      onClose={onClose}
      className={className}
    />
  )
}

export function ErrorAlert({
  title = 'Error',
  message,
  onClose,
  action,
  className = ''
}: Omit<AlertProps, 'type'>) {
  return (
    <Alert
      type="error"
      title={title}
      message={message}
      onClose={onClose}
      action={action}
      className={className}
    />
  )
}

export function WarningAlert({
  title = 'Warning',
  message,
  onClose,
  action,
  className = ''
}: Omit<AlertProps, 'type'>) {
  return (
    <Alert
      type="warning"
      title={title}
      message={message}
      onClose={onClose}
      action={action}
      className={className}
    />
  )
}

export function InfoAlert({
  title,
  message,
  onClose,
  action,
  className = ''
}: Omit<AlertProps, 'type'>) {
  return (
    <Alert
      type="info"
      title={title}
      message={message}
      onClose={onClose}
      action={action}
      className={className}
    />
  )
}

// Inline banner alert (full width)
export function BannerAlert({
  type = 'info',
  message,
  onClose,
  action,
  className = ''
}: Omit<AlertProps, 'title'>) {
  return (
    <div style={{ width: '100%' }}>
      <Alert
        type={type}
        message={message}
        onClose={onClose}
        action={action}
        className={className}
      />
    </div>
  )
}
