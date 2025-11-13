'use client';

import Link from 'next/link';
import { useState } from 'react';
import Navbar from './components/Navbar';
import {
  MessageCircle,
  CheckCircle2,
  SpellCheck,
  ShieldCheck,
  ScanSearch,
  FileCheck,
  Languages,
  Zap,
  Lock,
  Users,
  Star,
  ChevronRight,
  ChevronDown,
  Play,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <MessageCircle size={32} />,
      title: 'Natural Conversations',
      description: 'Chat in Filipino or English naturally. Get instant answers, help with tasks, and creative ideas anytime.',
      link: '/chat',
    },
    {
      icon: <SpellCheck size={32} />,
      title: 'Grammar Checker',
      description: 'Fix errors, improve writing, and ensure your messages are professional in both English and Tagalog.',
      link: '/grammar-checker',
    },
    {
      icon: <ShieldCheck size={32} />,
      title: 'AI Detector',
      description: 'Check if text was written by AI. Perfect for teachers, editors, and content reviewers.',
      link: '/ai-detector',
    },
    {
      icon: <ScanSearch size={32} />,
      title: 'Plagiarism Checker',
      description: 'Verify originality and find copied content. Keep your work authentic and properly cited.',
      link: '/plagiarism-checker',
    },
    {
      icon: <FileCheck size={32} />,
      title: 'AI Humanizer',
      description: 'Make AI-generated text sound more natural and human. Bypass AI detectors with ease.',
      link: '/ai-humanizer',
    },
    {
      icon: <Languages size={32} />,
      title: 'Translator',
      description: 'Translate between Tagalog, English, Spanish, and 100+ languages instantly and accurately.',
      link: '/translator',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Sign Up Free',
      description: 'Create your account in 30 seconds. No credit card required, no hidden fees.',
    },
    {
      number: '2',
      title: 'Choose Your Tool',
      description: 'Pick from our suite of AI tools - chat, translate, check grammar, detect AI, and more.',
    },
    {
      number: '3',
      title: 'Start Creating',
      description: 'Get instant results. Save time, boost productivity, and achieve your goals faster.',
    },
  ];

  const testimonials = [
    {
      name: 'Maria Santos',
      role: 'OFW in Dubai',
      text: 'HeyGPT helps me write emails to my kids back home. The Tagalog translator is perfect, and I can practice my English too!',
      rating: 5,
    },
    {
      name: 'Juan dela Cruz',
      role: 'College Student',
      text: 'Game-changer for research papers! The AI detector helps me check my work, and the grammar checker saves me hours of editing.',
      rating: 5,
    },
    {
      name: 'Sarah Reyes',
      role: 'BPO Employee',
      text: 'I use the grammar checker every day at work. My emails are so much better now, and my boss noticed the improvement!',
      rating: 5,
    },
  ];

  const useCases = [
    {
      title: 'Write Emails Faster',
      description: 'Compose professional emails in seconds. Perfect for work, school, or personal messages.',
      icon: '✉️',
    },
    {
      title: 'Study for Exams',
      description: 'Get explanations, practice questions, and study summaries. Ace your tests with AI help.',
      icon: '📚',
    },
    {
      title: 'Translate Instantly',
      description: 'Break language barriers. Communicate with anyone, anywhere in their language.',
      icon: '🌐',
    },
    {
      title: 'Check Your Work',
      description: 'Ensure your writing is error-free and original before submitting assignments.',
      icon: '✅',
    },
  ];

  const faqs = [
    {
      question: 'Is HeyGPT really free forever?',
      answer: 'Yes! Our core features are completely free with no time limits. You get unlimited conversations, grammar checking, translations, and AI detection. We believe AI should be accessible to all Filipinos.',
    },
    {
      question: 'Do I need a credit card to sign up?',
      answer: 'Not at all! Just sign up with your email or social account. No payment information required, ever.',
    },
    {
      question: 'Can I use this for school work?',
      answer: "Absolutely! Many students use HeyGPT for research, writing help, and study assistance. Just remember to review AI suggestions and follow your school's academic integrity policies.",
    },
    {
      question: 'Does it work in Tagalog?',
      answer: 'Yes! HeyGPT understands and speaks Tagalog fluently. You can chat, translate, and get help in both Filipino and English.',
    },
    {
      question: 'How accurate is the AI detector?',
      answer: 'Our AI detector is highly accurate, using advanced algorithms to identify AI-generated content. However, no detector is 100% perfect, so use it as a helpful guide.',
    },
    {
      question: 'Is my data private and secure?',
      answer: 'Yes! We take privacy seriously. Your conversations are encrypted, never shared with third parties, and you can delete your data anytime.',
    },
    {
      question: 'Can I use this for work?',
      answer: "Definitely! Professionals use HeyGPT for emails, presentations, translations, content creation, and more. It's perfect for BPO, freelancers, and business owners.",
    },
    {
      question: 'What makes HeyGPT different from ChatGPT?',
      answer: 'HeyGPT is built specifically for Filipino users with local language support, peso pricing (when applicable), and tools tailored to Philippine needs. Plus, you get multiple tools in one place!',
    },
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <span className="badge badge-primary">Free Forever</span>

              <h1 className="hero-title">
                Your AI Assistant for
                <span className="gradient-text"> Philippines</span>
              </h1>

              <p className="hero-description">
                Chat naturally in Filipino or English. Get instant answers, write better emails, translate languages, and boost your productivity - all completely free.
              </p>

              <div className="hero-actions">
                <Link href="/signup" className="btn-primary btn-lg">
                  <MessageCircle size={20} />
                  Start Free Chat
                </Link>
                <Link href="#demo" className="btn-secondary btn-lg">
                  <Play size={20} />
                  Watch Demo
                </Link>
              </div>

              <div className="hero-stats">
                <div className="stat">
                  <p className="stat-value">10,000+</p>
                  <p className="stat-label">Filipino Users</p>
                </div>
                <div className="stat">
                  <p className="stat-value">500,000+</p>
                  <p className="stat-label">Chats</p>
                </div>
                <div className="stat">
                  <p className="stat-value">4.8★</p>
                  <p className="stat-label">User Rating</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="overline">Features</span>
              <h2 className="section-title">
                Everything You Need in One Place
              </h2>
              <p className="section-description">
                From AI chat to grammar checking, we've got all the tools Filipino users need to work smarter and faster
              </p>
            </div>

            <div className="features-grid">
              {features.map((feature, index) => (
                <Link href={feature.link} key={index} className="feature-card">
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <span className="feature-link-text">
                    Try it now <ArrowRight size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="section bg-gradient-to-b from-white to-orange-50">
          <div className="container">
            <div className="section-header">
              <span className="overline">How It Works</span>
              <h2 className="section-title">
                Get Started in 3 Simple Steps
              </h2>
              <p className="section-description">
                No technical knowledge needed. Anyone can start using HeyGPT in minutes
              </p>
            </div>

            <div className="steps-grid">
              {steps.map((step, index) => (
                <div key={index} className="step-card">
                  <div className="step-number">{step.number}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="overline">Testimonials</span>
              <h2 className="section-title">
                Loved by Filipinos Worldwide
              </h2>
              <p className="section-description">
                See what our users say about HeyGPT
              </p>
            </div>

            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-stars">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="testimonial-text">"{testimonial.text}"</p>
                  <div className="testimonial-author">
                    <p className="author-name">{testimonial.name}</p>
                    <p className="author-role">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="section bg-gradient-to-b from-white to-orange-50">
          <div className="container">
            <div className="section-header">
              <span className="overline">Use Cases</span>
              <h2 className="section-title">
                Built for Real Filipino Needs
              </h2>
              <p className="section-description">
                Whether you're a student, professional, or OFW - we've got you covered
              </p>
            </div>

            <div className="use-cases-grid">
              {useCases.map((useCase, index) => (
                <div key={index} className="use-case-card">
                  <span className="use-case-icon">{useCase.icon}</span>
                  <h3 className="use-case-title">{useCase.title}</h3>
                  <p className="use-case-description">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Preview Section */}
        <section className="section">
          <div className="container">
            <div className="pricing-preview">
              <div className="pricing-content">
                <span className="overline">Pricing</span>
                <h2 className="pricing-title">
                  Free Tier Has Everything You Need
                </h2>
                <p className="pricing-description">
                  Get unlimited access to AI chat, grammar checker, translator, AI detector, and more. No credit card required.
                </p>
                <ul className="pricing-features">
                  <li>
                    <CheckCircle2 size={20} />
                    <span>Unlimited AI conversations</span>
                  </li>
                  <li>
                    <CheckCircle2 size={20} />
                    <span>Grammar checking in English & Tagalog</span>
                  </li>
                  <li>
                    <CheckCircle2 size={20} />
                    <span>AI detection and plagiarism checking</span>
                  </li>
                  <li>
                    <CheckCircle2 size={20} />
                    <span>Translation in 100+ languages</span>
                  </li>
                  <li>
                    <CheckCircle2 size={20} />
                    <span>Save and export your work</span>
                  </li>
                </ul>
                <Link href="/pricing" className="btn-secondary btn-lg">
                  View All Features <ArrowRight size={20} />
                </Link>
              </div>
              <div className="pricing-visual">
                <div className="pricing-badge">
                  <Zap size={48} />
                  <h3>Free Forever</h3>
                  <p>₱0 per month</p>
                  <span className="pricing-tag">No credit card needed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section bg-gradient-to-b from-white to-orange-50">
          <div className="container-narrow">
            <div className="section-header">
              <span className="overline">FAQ</span>
              <h2 className="section-title">
                Got Questions? We've Got Answers
              </h2>
              <p className="section-description">
                Everything you need to know about HeyGPT
              </p>
            </div>

            <div className="faq-accordion">
              {faqs.map((faq, index) => (
                <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                  <button
                    className="faq-question"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`faq-icon ${openFaq === index ? 'rotate' : ''}`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">
                Ready to Experience AI Made for Filipinos?
              </h2>
              <p className="cta-description">
                Join thousands of happy users who are already working smarter with HeyGPT
              </p>
              <Link href="/signup" className="btn-primary btn-lg">
                Start Free Chat Now <ArrowRight size={20} />
              </Link>
              <p className="cta-note">
                No credit card required • Free forever • Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            {/* Brand */}
            <div className="footer-brand">
              <div className="footer-logo">
                <MessageCircle className="w-8 h-8" />
                <h3 className="footer-brand-name">HeyGPT.ph</h3>
              </div>
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
                  <li><Link href="/chat">AI Chat</Link></li>
                  <li><Link href="/grammar-checker">Grammar Checker</Link></li>
                  <li><Link href="/ai-detector">AI Detector</Link></li>
                  <li><Link href="/pricing">Pricing</Link></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4 className="footer-heading">Company</h4>
                <ul className="footer-list">
                  <li><Link href="/about">About Us</Link></li>
                  <li><Link href="/blog">Blog</Link></li>
                  <li><Link href="/contact">Contact</Link></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4 className="footer-heading">Legal</h4>
                <ul className="footer-list">
                  <li><Link href="/privacy">Privacy Policy</Link></li>
                  <li><Link href="/terms">Terms of Service</Link></li>
                  <li><Link href="/cookies">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2025 HeyGPT.ph. All rights reserved.
            </p>
            <div className="footer-badges">
              <span className="badge badge-success">
                <Lock size={14} />
                Secure
              </span>
              <span className="badge badge-default">Made in Philippines 🇵🇭</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* CSS Variables are in globals.css */

        .hero-section {
          padding: var(--space-32) 0;
          background: linear-gradient(180deg, #FFF4ED 0%, #FFFFFF 100%);
          overflow: hidden;
          position: relative;
        }

        .hero-section::before {
          content: '';
          position: absolute;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(232, 132, 74, 0.1) 0%, transparent 70%);
          border-radius: 50%;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-6);
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: 6px 16px;
          border-radius: var(--radius-full);
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
        }

        .badge-primary {
          background: var(--primary-100);
          color: var(--primary-700);
        }

        .badge-success {
          background: var(--success-50);
          color: var(--success-700);
        }

        .badge-default {
          background: var(--neutral-100);
          color: var(--neutral-700);
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
          background: linear-gradient(135deg, #FFB380 0%, #E8844A 50%, #D46D38 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
        }

        .hero-description {
          font-size: var(--text-xl);
          line-height: var(--leading-relaxed);
          color: var(--neutral-600);
          margin: 0;
          max-width: 700px;
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
          flex-wrap: wrap;
          justify-content: center;
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

        .section {
          padding: var(--space-20) 0;
        }

        .section-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-4);
          max-width: 800px;
          margin: 0 auto var(--space-12) auto;
        }

        .overline {
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          letter-spacing: var(--tracking-wider);
          text-transform: uppercase;
          color: var(--primary-600);
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

        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }

        @media (min-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .feature-card {
          background: white;
          border: 1px solid var(--neutral-200);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          text-decoration: none;
          transition: all var(--duration-medium) var(--ease-out);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-200);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #FFF4ED 0%, #FFE6D5 100%);
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
          flex: 1;
        }

        .feature-link-text {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
          color: var(--primary-600);
          transition: gap var(--duration-base) var(--ease-out);
        }

        .feature-card:hover .feature-link-text {
          gap: var(--space-3);
        }

        .steps-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }

        @media (min-width: 768px) {
          .steps-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .step-card {
          text-align: center;
          padding: var(--space-8);
        }

        .step-number {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #FFB380 0%, #E8844A 100%);
          border-radius: var(--radius-full);
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          color: white;
          margin: 0 auto var(--space-6);
        }

        .step-title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          font-weight: var(--font-semibold);
          color: var(--neutral-800);
          margin: 0 0 var(--space-3) 0;
        }

        .step-description {
          font-size: var(--text-base);
          line-height: var(--leading-relaxed);
          color: var(--neutral-600);
          margin: 0;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }

        @media (min-width: 768px) {
          .testimonials-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .testimonial-card {
          background: white;
          border: 1px solid var(--neutral-200);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .testimonial-stars {
          display: flex;
          gap: var(--space-1);
          color: #F59E0B;
        }

        .testimonial-text {
          font-size: var(--text-base);
          line-height: var(--leading-relaxed);
          color: var(--neutral-700);
          margin: 0;
          flex: 1;
        }

        .testimonial-author {
          border-top: 1px solid var(--neutral-200);
          padding-top: var(--space-4);
        }

        .author-name {
          font-weight: var(--font-semibold);
          color: var(--neutral-900);
          margin: 0;
        }

        .author-role {
          font-size: var(--text-sm);
          color: var(--neutral-500);
          margin: var(--space-1) 0 0 0;
        }

        .use-cases-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
        }

        @media (min-width: 640px) {
          .use-cases-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .use-cases-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .use-case-card {
          background: white;
          border: 1px solid var(--neutral-200);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          text-align: center;
        }

        .use-case-icon {
          font-size: 48px;
          display: block;
          margin-bottom: var(--space-4);
        }

        .use-case-title {
          font-weight: var(--font-semibold);
          font-size: var(--text-lg);
          color: var(--neutral-800);
          margin: 0 0 var(--space-2) 0;
        }

        .use-case-description {
          font-size: var(--text-sm);
          color: var(--neutral-600);
          margin: 0;
        }

        .pricing-preview {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-12);
          align-items: center;
        }

        @media (min-width: 1024px) {
          .pricing-preview {
            grid-template-columns: 1fr 1fr;
          }
        }

        .pricing-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .pricing-title {
          font-family: var(--font-display);
          font-size: var(--text-4xl);
          font-weight: var(--font-bold);
          color: var(--neutral-900);
          margin: 0;
        }

        .pricing-description {
          font-size: var(--text-lg);
          line-height: var(--leading-relaxed);
          color: var(--neutral-600);
          margin: 0;
        }

        .pricing-features {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: 0;
          list-style: none;
        }

        .pricing-features li {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          font-size: var(--text-base);
          color: var(--neutral-700);
        }

        .pricing-features li svg {
          flex-shrink: 0;
          color: var(--success-600);
          margin-top: 2px;
        }

        .pricing-visual {
          display: flex;
          justify-content: center;
        }

        .pricing-badge {
          background: linear-gradient(135deg, #FFB380 0%, #E8844A 100%);
          border-radius: var(--radius-2xl);
          padding: var(--space-12);
          text-align: center;
          color: white;
        }

        .pricing-badge svg {
          margin-bottom: var(--space-4);
        }

        .pricing-badge h3 {
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          margin: 0 0 var(--space-2) 0;
        }

        .pricing-badge p {
          font-size: var(--text-5xl);
          font-weight: var(--font-bold);
          margin: 0 0 var(--space-3) 0;
        }

        .pricing-tag {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
        }

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
          padding: var(--space-5);
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
          padding: 0 var(--space-5) var(--space-5) var(--space-5);
          animation: fadeIn var(--duration-medium) var(--ease-out);
        }

        .faq-answer p {
          font-size: var(--text-base);
          line-height: var(--leading-relaxed);
          color: var(--neutral-600);
          margin: 0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cta-section {
          padding: var(--space-32) 0;
          background: linear-gradient(135deg, #FFB380 0%, #E8844A 50%, #D46D38 100%);
        }

        .cta-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-6);
          max-width: 700px;
          margin: 0 auto;
        }

        .cta-title {
          font-family: var(--font-display);
          font-size: var(--text-4xl);
          font-weight: var(--font-bold);
          color: white;
          margin: 0;
        }

        .cta-description {
          font-size: var(--text-xl);
          line-height: var(--leading-relaxed);
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }

        .cta-note {
          font-size: var(--text-sm);
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

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

        .footer-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          color: var(--primary-500);
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

        @media (max-width: 640px) {
          .hero-stats {
            flex-direction: column;
            gap: var(--space-4);
          }

          .hero-actions {
            flex-direction: column;
            width: 100%;
          }

          .hero-actions a {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
