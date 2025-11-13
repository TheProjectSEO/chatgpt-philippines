'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, MessageCircle } from 'lucide-react'
import './components.css'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  onClick?: () => void
}

function NavLink({ href, children, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`nav-link ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

interface NavbarProps {
  user?: {
    name: string
    email: string
    image?: string
  } | null
}

export default function Navbar({ user }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            {/* Logo */}
            <Link href="/" className="navbar-logo" onClick={closeMenu}>
              <MessageCircle size={28} color="#E8844A" />
              <span>HeyGPT</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="navbar-menu">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/chat">Chat</NavLink>

              {/* Tools dropdown - simplified for now */}
              <NavLink href="/grammar-checker">Grammar Checker</NavLink>
              <NavLink href="/ai-detector">AI Detector</NavLink>
              <NavLink href="/plagiarism-checker">Plagiarism Checker</NavLink>
              <NavLink href="/ai-humanizer">AI Humanizer</NavLink>
            </div>

            {/* Actions */}
            <div className="navbar-actions">
              {/* Search button - desktop only */}
              <button className="search-button" style={{ display: 'none' }}>
                <Search size={16} />
                <span style={{ display: 'none', marginRight: '8px' }}>Search</span>
                <span className="search-kbd">⌘K</span>
              </button>

              {user ? (
                <div className="user-menu">
                  {/* User avatar - placeholder for now */}
                  <button
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--primary-100)',
                      color: 'var(--primary-600)',
                      border: 'none',
                      fontWeight: 'var(--font-semibold)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {user.name?.charAt(0) || 'U'}
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/api/auth/login"
                    style={{
                      display: 'none',
                      padding: '10px 20px',
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--neutral-700)',
                      textDecoration: 'none',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      transition: 'all var(--duration-base) var(--ease-out)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'var(--neutral-100)'
                      e.currentTarget.style.color = 'var(--primary-600)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--neutral-700)'
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/api/auth/login"
                    style={{
                      display: 'none',
                      padding: '10px 20px',
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'white',
                      textDecoration: 'none',
                      background: 'var(--primary-500)',
                      border: 'none',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      transition: 'all var(--duration-base) var(--ease-out)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'var(--primary-600)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'var(--primary-500)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                    }}
                  >
                    Sign Up Free
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                className="mobile-menu-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-drawer-overlay ${isOpen ? 'open' : ''}`}
        onClick={closeMenu}
        aria-hidden={!isOpen}
      />

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu">
          <NavLink href="/" onClick={closeMenu}>Home</NavLink>
          <NavLink href="/chat" onClick={closeMenu}>Chat</NavLink>
          <NavLink href="/grammar-checker" onClick={closeMenu}>Grammar Checker</NavLink>
          <NavLink href="/ai-detector" onClick={closeMenu}>AI Detector</NavLink>
          <NavLink href="/plagiarism-checker" onClick={closeMenu}>Plagiarism Checker</NavLink>
          <NavLink href="/ai-humanizer" onClick={closeMenu}>AI Humanizer</NavLink>

          <div className="mobile-menu-actions">
            {!user && (
              <>
                <Link
                  href="/api/auth/login"
                  onClick={closeMenu}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'white',
                    textDecoration: 'none',
                    background: 'var(--primary-500)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                    display: 'block',
                    transition: 'all var(--duration-base) var(--ease-out)'
                  }}
                >
                  Sign Up Free
                </Link>
                <Link
                  href="/api/auth/login"
                  onClick={closeMenu}
                  style={{
                    width: '100%',
                    padding: '12px 24px',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--primary-600)',
                    textDecoration: 'none',
                    background: 'transparent',
                    border: '2px solid var(--primary-500)',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                    display: 'block',
                    transition: 'all var(--duration-base) var(--ease-out)'
                  }}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
