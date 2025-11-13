'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Facebook, Twitter, Instagram } from 'lucide-react'
import './components.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [language, setLanguage] = useState<'en' | 'fil'>('en')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    console.log('Newsletter signup:', email)
    setEmail('')
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Column */}
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <MessageCircle size={32} color="#E8844A" />
              <h3 className="footer-brand-name">HeyGPT.ph</h3>
            </div>

            <p className="footer-tagline">
              Your AI assistant for Philippines. Chat naturally in Filipino or English with advanced AI technology.
            </p>

            {/* Newsletter */}
            <div className="footer-newsletter">
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-400)', margin: 0 }}>
                Stay updated with AI news
              </p>
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="newsletter-input"
                  required
                />
                <button
                  type="submit"
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'white',
                    background: 'var(--primary-500)',
                    border: 'none',
                    borderRadius: 'var(--radius-base)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-base) var(--ease-out)',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--primary-600)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'var(--primary-500)'
                  }}
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div className="footer-social">
              <a href="https://facebook.com" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" className="social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="footer-links">
            {/* Product Column */}
            <div className="footer-column">
              <h4 className="footer-heading">Product</h4>
              <ul className="footer-list">
                <li><Link href="/chat">AI Chat</Link></li>
                <li><Link href="/grammar-checker">Grammar Checker</Link></li>
                <li><Link href="/ai-detector">AI Detector</Link></li>
                <li><Link href="/plagiarism-checker">Plagiarism Checker</Link></li>
                <li><Link href="/ai-humanizer">AI Humanizer</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="footer-column">
              <h4 className="footer-heading">Company</h4>
              <ul className="footer-list">
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="footer-column">
              <h4 className="footer-heading">Legal</h4>
              <ul className="footer-list">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/security">Security</Link></li>
                <li><Link href="/cookies">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} HeyGPT.ph | Made with 🧡 in Philippines
          </p>

          {/* Language Toggle */}
          <div className="language-toggle">
            <button
              className={`language-button ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button
              className={`language-button ${language === 'fil' ? 'active' : ''}`}
              onClick={() => setLanguage('fil')}
            >
              Filipino
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
