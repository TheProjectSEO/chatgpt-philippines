'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, MessageCircle, ChevronDown } from 'lucide-react'
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
  const [toolsOpen, setToolsOpen] = useState(false)

  const closeMenu = () => {
    setIsOpen(false)
    setToolsOpen(false)
  }

  // Organized tools by category
  const toolsCategories = {
    'Writing Tools': [
      { name: 'Grammar Checker', href: '/grammar-checker' },
      { name: 'Paraphraser', href: '/paraphraser' },
      { name: 'Summarizer', href: '/summarizer' },
      { name: 'Article Rewriter', href: '/article-rewriter' },
      { name: 'Sentence Expander', href: '/sentence-expander' },
      { name: 'Sentence Simplifier', href: '/sentence-simplifier' },
    ],
    'Academic Tools': [
      { name: 'Essay Writer', href: '/essay-writer' },
      { name: 'Research Paper', href: '/research-paper' },
      { name: 'Thesis Generator', href: '/thesis-generator' },
      { name: 'Homework Helper', href: '/homework-helper' },
      { name: 'Study Guide', href: '/study-guide' },
      { name: 'Math Solver', href: '/math-solver' },
    ],
    'Professional Tools': [
      { name: 'Resume Builder', href: '/resume-builder' },
      { name: 'Cover Letter', href: '/cover-letter' },
      { name: 'Business Plan', href: '/business-plan' },
      { name: 'Email Writer', href: '/email-writer' },
      { name: 'Speech Writer', href: '/speech-writer' },
    ],
    'Creative Tools': [
      { name: 'Story Generator', href: '/story-generator' },
      { name: 'Poem Generator', href: '/poem-generator' },
      { name: 'Slogan Generator', href: '/slogan-generator' },
      { name: 'Song Lyrics Generator', href: '/lyrics-generator' },
      { name: 'Logo Maker', href: '/logo-maker' },
    ],
    'AI Detection & Conversion': [
      { name: 'AI Detector', href: '/ai-detector' },
      { name: 'AI Humanizer', href: '/ai-humanizer' },
      { name: 'Plagiarism Checker', href: '/plagiarism-checker' },
    ],
    'Language Tools': [
      { name: 'Translator', href: '/translator' },
      { name: 'Filipino Writer', href: '/filipino-writer' },
      { name: 'Active to Passive', href: '/active-to-passive' },
      { name: 'Passive to Active', href: '/passive-to-active' },
    ],
    'Content Generators': [
      { name: 'Title Generator', href: '/title-generator' },
      { name: 'Topic Generator', href: '/topic-generator' },
      { name: 'Conclusion Generator', href: '/conclusion-generator' },
      { name: 'Introduction Generator', href: '/introduction-generator' },
      { name: 'Outline Generator', href: '/outline-generator' },
      { name: 'Citation Generator', href: '/citation-generator' },
      { name: 'Bibliography', href: '/bibliography' },
    ],
    'Checkers & Fixers': [
      { name: 'Grammar Fixer', href: '/grammar-fixer' },
      { name: 'Punctuation Checker', href: '/punctuation-checker' },
    ],
    'Media Tools': [
      { name: 'Text to Speech', href: '/text-to-speech' },
      { name: 'Voice Generator', href: '/voice-generator' },
      { name: 'Image Generator', href: '/image-generator' },
      { name: 'QR Code Generator', href: '/qr-generator' },
    ],
    'Development Tools': [
      { name: 'Code Generator', href: '/code-generator' },
    ],
  }

  return (
    <>
      <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="navbar-container">
          <div className="navbar-content">
            {/* Logo - Updated with correct HeyGPT logo */}
            <Link href="/" className="navbar-logo" onClick={closeMenu}>
              <MessageCircle size={28} color="#E8844A" />
              <span>HeyGPT.ph</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="navbar-menu">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/chat">Chat</NavLink>

              {/* Tools Dropdown */}
              <div
                className="tools-dropdown"
                onMouseEnter={() => setToolsOpen(true)}
                onMouseLeave={() => setToolsOpen(false)}
                style={{ position: 'relative' }}
              >
                <button
                  className="nav-link"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                    padding: '8px 0'
                  }}
                >
                  Tools <ChevronDown size={16} />
                </button>

                {toolsOpen && (
                  <div
                    className="tools-mega-menu"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '-200px',
                      width: '900px',
                      maxHeight: '600px',
                      overflowY: 'auto',
                      background: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      padding: '24px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '24px',
                      zIndex: 1000,
                    }}
                  >
                    {Object.entries(toolsCategories).map(([category, tools]) => (
                      <div key={category} style={{ minWidth: '0' }}>
                        <h3 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#E8844A',
                          marginBottom: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {category}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {tools.map((tool) => (
                            <Link
                              key={tool.href}
                              href={tool.href}
                              onClick={closeMenu}
                              style={{
                                fontSize: '14px',
                                color: '#4B5563',
                                textDecoration: 'none',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#FFF5F0'
                                e.currentTarget.style.color = '#E8844A'
                                e.currentTarget.style.paddingLeft = '12px'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = '#4B5563'
                                e.currentTarget.style.paddingLeft = '8px'
                              }}
                            >
                              {tool.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <NavLink href="/pricing">Pricing</NavLink>
            </div>

            {/* Actions */}
            <div className="navbar-actions">
              {user ? (
                <div className="user-menu">
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
                    href="/login"
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
                    href="/signup"
                    style={{
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
          <NavLink href="/pricing" onClick={closeMenu}>Pricing</NavLink>

          {/* Mobile Tools - Organized by Category */}
          <div style={{ marginTop: '16px' }}>
            {Object.entries(toolsCategories).map(([category, tools]) => (
              <div key={category} style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#E8844A',
                  marginBottom: '8px',
                  paddingLeft: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {category}
                </div>
                {tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={closeMenu}
                    style={{
                      display: 'block',
                      padding: '10px 12px',
                      fontSize: '14px',
                      color: '#4B5563',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      marginBottom: '4px'
                    }}
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div className="mobile-menu-actions">
            <Link
              href="/signup"
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
              href="/login"
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
          </div>
        </div>
      </div>
    </>
  )
}
