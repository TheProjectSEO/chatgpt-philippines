'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link href="/" className="navbar-logo">
            <MessageCircle className="w-8 h-8" style={{ color: 'var(--primary-500)' }} />
            <span className="logo-text">HeyGPT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-menu desktop">
            <Link href="/chat" className="nav-link">
              Chat
            </Link>
            <Link href="/grammar-checker" className="nav-link">
              Grammar Checker
            </Link>
            <Link href="/ai-detector" className="nav-link">
              AI Detector
            </Link>
            <Link href="/pricing" className="nav-link">
              Pricing
            </Link>
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            <Link href="/login" className="btn-ghost desktop-only">
              Login
            </Link>
            <Link href="/signup" className="btn-primary">
              Sign Up Free
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mobile-menu">
            <Link href="/chat" className="nav-link" onClick={() => setIsOpen(false)}>
              Chat
            </Link>
            <Link href="/grammar-checker" className="nav-link" onClick={() => setIsOpen(false)}>
              Grammar Checker
            </Link>
            <Link href="/ai-detector" className="nav-link" onClick={() => setIsOpen(false)}>
              AI Detector
            </Link>
            <Link href="/pricing" className="nav-link" onClick={() => setIsOpen(false)}>
              Pricing
            </Link>

            <div className="mobile-menu-actions">
              <Link href="/signup" className="btn-primary" style={{ width: '100%' }}>
                Sign Up Free
              </Link>
              <Link href="/login" className="btn-ghost" style={{ width: '100%' }}>
                Login
              </Link>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--neutral-200);
        }

        .container {
          width: 100%;
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
          padding-left: var(--space-4);
          padding-right: var(--space-4);
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
          display: none;
        }

        @media (min-width: 1024px) {
          .navbar-menu.desktop {
            display: flex;
            align-items: center;
            gap: var(--space-6);
          }
        }

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

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .desktop-only {
          display: none;
        }

        @media (min-width: 640px) {
          .desktop-only {
            display: inline-flex;
          }
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

        .mobile-menu .nav-link {
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-base);
        }

        .mobile-menu .nav-link:hover {
          background: var(--neutral-50);
        }

        .mobile-menu-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--neutral-200);
        }
      `}</style>
    </nav>
  );
}
