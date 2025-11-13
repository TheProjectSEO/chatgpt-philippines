'use client'

import './components.css'

interface SpinnerProps {
  size?: number
  color?: 'primary' | 'white' | 'neutral'
  className?: string
}

export function Spinner({ size = 24, color = 'primary', className = '' }: SpinnerProps) {
  return (
    <svg
      className={`spinner spinner-${color} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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

interface SkeletonProps {
  width?: string | number
  height?: string | number
  variant?: 'rectangular' | 'circular' | 'text'
  className?: string
}

export function Skeleton({
  width = '100%',
  height = '20px',
  variant = 'rectangular',
  className = ''
}: SkeletonProps) {
  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }} className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-6)',
        background: 'white',
        border: '1px solid var(--neutral-200)',
        borderRadius: 'var(--radius-lg)',
      }}
      className={className}
    >
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <Skeleton variant="circular" width={48} height={48} />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height="20px" style={{ marginBottom: 'var(--space-2)' }} />
          <Skeleton width="40%" height="16px" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}

export function SkeletonMessage({ isUser = false }: { isUser?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-3)',
        padding: 'var(--space-4) 0',
        flexDirection: isUser ? 'row-reverse' : 'row'
      }}
    >
      <Skeleton variant="circular" width={36} height={36} />
      <div style={{ flex: 1, maxWidth: '70%' }}>
        <Skeleton
          height="60px"
          style={{
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-1)'
          }}
        />
        <Skeleton width="80px" height="12px" />
      </div>
    </div>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  color?: 'primary' | 'success'
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  color = 'primary',
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={`progress-wrapper ${className}`}>
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

interface LoadingPageProps {
  message?: string
  spinner?: boolean
}

export function LoadingPage({ message = 'Loading...', spinner = true }: LoadingPageProps) {
  return (
    <div className="loading-page">
      {spinner && <Spinner size={48} />}
      <p className="loading-text">{message}</p>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  children: React.ReactNode
}

export function LoadingOverlay({ isLoading, message = 'Loading...', children }: LoadingOverlayProps) {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-4)',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            zIndex: 'var(--z-fixed)',
            borderRadius: 'inherit'
          }}
        >
          <Spinner size={36} />
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--neutral-600)' }}>
            {message}
          </p>
        </div>
      )}
    </div>
  )
}

// Pulse loading animation for images
export function ImageSkeleton({
  width = '100%',
  height = '200px',
  className = ''
}: {
  width?: string | number
  height?: string | number
  className?: string
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: 'var(--radius-base)'
      }}
    />
  )
}

// Loading dots animation
export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-2)',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      className={className}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--primary-500)',
            animation: `bounce 1.4s infinite ease-in-out both`,
            animationDelay: `${i * 0.16}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
