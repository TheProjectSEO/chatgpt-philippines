'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');

  const pricingTiers = {
    free: {
      name: 'Free Forever',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'Perfect for getting started',
      features: [
        'Unlimited AI chat',
        'Grammar checker',
        'AI detector',
        '3 plagiarism checks/day',
        'Filipino & English support',
        'Save chat history'
      ],
      cta: 'Start Free',
      ctaStyle: 'secondary',
      popular: false
    },
    pro: {
      name: 'Pro',
      priceMonthly: 549.95,
      priceAnnual: 329.95,
      description: 'Best for power users',
      features: [
        'Everything in Free',
        'Priority responses (faster)',
        'Unlimited plagiarism checks',
        'Advanced AI models',
        'Priority support',
        'Export chat transcripts',
        'Custom AI personality'
      ],
      cta: 'Start 7-Day Free Trial',
      ctaStyle: 'primary',
      popular: true,
      badge: 'Most Popular',
      savings: 2639.40
    },
    teams: {
      name: 'Teams',
      priceMonthly: 2499.95,
      priceAnnual: 1499,
      description: 'For 5 users',
      features: [
        'Everything in Pro',
        '5 team members',
        'Shared chat workspace',
        'Admin dashboard',
        'Usage analytics',
        'Priority onboarding',
        'Dedicated support'
      ],
      cta: 'Contact Sales',
      ctaStyle: 'secondary',
      popular: false
    }
  };

  const faqData = [
    {
      question: 'Can I switch plans anytime?',
      answer: "Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately, and we'll prorate any charges or credits."
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), GCash, Maya (formerly PayMaya), and bank transfers for annual plans.'
    },
    {
      question: 'Is there a contract or commitment?',
      answer: 'No! All plans are month-to-month or annual with no long-term commitment. You can cancel anytime with no penalties or fees.'
    },
    {
      question: 'Can I try Pro for free?',
      answer: 'Yes! We offer a 7-day free trial of Pro with full access to all features. No credit card required to start.'
    },
    {
      question: 'Do you offer refunds?',
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us within 30 days for a full refund."
    },
    {
      question: "What's the difference between Pro and Free?",
      answer: "Pro includes faster response times, unlimited plagiarism checks, advanced AI models, priority support, and the ability to export conversations and customize your AI personality."
    },
    {
      question: 'How many users can use the Teams plan?',
      answer: 'The Teams plan includes 5 users. Need more? Contact us for custom enterprise pricing for larger teams.'
    },
    {
      question: 'What happens to my data if I cancel?',
      answer: 'Your data remains accessible for 30 days after cancellation. You can export your conversations before your account is permanently deleted.'
    },
    {
      question: 'Can I use HeyGPT for commercial purposes?',
      answer: 'Yes! All paid plans include commercial use rights. The Free plan is for personal use only.'
    },
    {
      question: 'Do you offer student or educational discounts?',
      answer: 'Yes! We offer 40% off Pro plans for students and educators with valid ID. Contact support@heygpt.ph to apply.'
    }
  ];

  const testimonials = [
    {
      name: 'Maria Santos',
      role: 'University Student, UP Diliman',
      image: '👩‍🎓',
      quote: 'HeyGPT Pro has been a lifesaver for my thesis research. The unlimited plagiarism checks and fast responses help me work more efficiently.'
    },
    {
      name: 'Carlos Reyes',
      role: 'Content Creator, Manila',
      image: '👨‍💻',
      quote: 'The Filipino language support is incredible. I can brainstorm content ideas in Tagalog and get instant suggestions. Worth every peso!'
    },
    {
      name: 'Jennifer Lim',
      role: 'Marketing Manager, Makati',
      image: '👩‍💼',
      quote: 'Our team uses HeyGPT Teams daily for content creation and market research. The shared workspace makes collaboration seamless.'
    }
  ];

  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'GCash', icon: '💰' },
    { name: 'Maya', icon: '💵' },
    { name: 'Bank Transfer', icon: '🏦' }
  ];

  const comparisonFeatures = [
    {
      category: 'Chat Features',
      features: [
        { name: 'AI Chat Messages', free: 'Unlimited', pro: 'Unlimited', teams: 'Unlimited' },
        { name: 'Response Speed', free: 'Standard', pro: 'Priority (2x faster)', teams: 'Priority (2x faster)' },
        { name: 'Chat History', free: '30 days', pro: 'Unlimited', teams: 'Unlimited' },
        { name: 'Export Conversations', free: '✗', pro: '✓', teams: '✓' },
        { name: 'Custom AI Personality', free: '✗', pro: '✓', teams: '✓' }
      ]
    },
    {
      category: 'AI Tools',
      features: [
        { name: 'Grammar Checker', free: '✓', pro: '✓', teams: '✓' },
        { name: 'AI Detector', free: '✓', pro: '✓', teams: '✓' },
        { name: 'Plagiarism Checks', free: '3/day', pro: 'Unlimited', teams: 'Unlimited' },
        { name: 'Advanced AI Models', free: '✗', pro: '✓', teams: '✓' },
        { name: 'Image Generation', free: 'Coming soon', pro: 'Coming soon', teams: 'Coming soon' }
      ]
    },
    {
      category: 'Limits',
      features: [
        { name: 'Messages per day', free: 'Unlimited', pro: 'Unlimited', teams: 'Unlimited' },
        { name: 'Words per message', free: '1,000', pro: '25,000', teams: '25,000' },
        { name: 'File uploads', free: '✗', pro: 'Coming soon', teams: 'Coming soon' }
      ]
    },
    {
      category: 'Support',
      features: [
        { name: 'Email Support', free: '48 hours', pro: '24 hours', teams: '4 hours' },
        { name: 'Priority Support', free: '✗', pro: '✓', teams: '✓' },
        { name: 'Dedicated Account Manager', free: '✗', pro: '✗', teams: '✓' }
      ]
    },
    {
      category: 'Team Features',
      features: [
        { name: 'Team Members', free: '1', pro: '1', teams: '5' },
        { name: 'Shared Workspace', free: '✗', pro: '✗', teams: '✓' },
        { name: 'Admin Dashboard', free: '✗', pro: '✗', teams: '✓' },
        { name: 'Usage Analytics', free: '✗', pro: '✗', teams: '✓' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6">
            <svg className="w-5 h-5 text-[#E8844A]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-[#7A3214]">No credit card required for free tier</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12">
            Start free, upgrade when you're ready
          </p>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-8 w-16 items-center rounded-full bg-[#E8844A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8844A] focus:ring-offset-2"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'annual' ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-medium ${billingPeriod === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
                Annual
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-[#FFB380] to-[#E8844A] text-white text-xs font-bold rounded-full">
                SAVE 40%
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pricingTiers.free.name}</h3>
                <p className="text-gray-600 mb-6">{pricingTiers.free.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-gray-900">₱0</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pricingTiers.free.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/api/auth/login"
                  className="block w-full text-center bg-white border-2 border-[#E8844A] text-[#E8844A] py-3 px-6 rounded-lg font-semibold hover:bg-orange-50 transition-all duration-200"
                >
                  {pricingTiers.free.cta}
                </Link>
                <p className="text-sm text-center text-gray-500 mt-3">No credit card required</p>
              </div>
            </div>

            {/* Pro Tier - Most Popular */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#E8844A] overflow-hidden relative transform md:scale-105 hover:shadow-3xl transition-all duration-300">
              {/* Most Popular Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-[#FFB380] to-[#E8844A] text-white px-4 py-2 rounded-bl-lg font-bold text-sm">
                {pricingTiers.pro.badge}
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-6">{pricingTiers.pro.name}</h3>
                <p className="text-gray-600 mb-6">{pricingTiers.pro.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-gray-900">
                      ₱{billingPeriod === 'monthly' ? pricingTiers.pro.priceMonthly : pricingTiers.pro.priceAnnual}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  {billingPeriod === 'annual' && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500 line-through">₱{pricingTiers.pro.priceMonthly}/mo</span>
                      <span className="ml-2 text-sm font-semibold text-green-600">
                        Save ₱{pricingTiers.pro.savings.toFixed(2)}/year
                      </span>
                    </div>
                  )}
                  {billingPeriod === 'annual' && (
                    <p className="text-sm text-gray-500 mt-1">
                      ₱{(pricingTiers.pro.priceAnnual * 12).toFixed(2)} billed annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {pricingTiers.pro.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#E8844A] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/api/auth/login"
                  className="block w-full text-center bg-gradient-to-r from-[#FFB380] to-[#E8844A] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#E8844A] hover:to-[#D46D38] transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {pricingTiers.pro.cta}
                </Link>
              </div>
            </div>

            {/* Teams Tier */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pricingTiers.teams.name}</h3>
                <p className="text-gray-600 mb-6">{pricingTiers.teams.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-gray-900">
                      ₱{billingPeriod === 'monthly' ? pricingTiers.teams.priceMonthly : pricingTiers.teams.priceAnnual}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  {billingPeriod === 'annual' && (
                    <p className="text-sm text-gray-500 mt-2">
                      ₱{(pricingTiers.teams.priceAnnual * 12).toFixed(2)} billed annually
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {pricingTiers.teams.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="mailto:sales@heygpt.ph"
                  className="block w-full text-center bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  {pricingTiers.teams.cta}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <details className="group">
            <summary className="flex items-center justify-center gap-2 cursor-pointer text-lg font-semibold text-gray-900 hover:text-[#E8844A] transition-colors mb-8">
              <span>Compare all features</span>
              <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Features</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Free</th>
                    <th className="text-center py-4 px-4 font-semibold text-[#E8844A]">Pro</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Teams</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((category, categoryIndex) => (
                    <>
                      <tr key={`category-${categoryIndex}`} className="bg-orange-50">
                        <td colSpan={4} className="py-3 px-4 font-bold text-gray-900 text-sm uppercase tracking-wide">
                          {category.category}
                        </td>
                      </tr>
                      {category.features.map((feature, featureIndex) => (
                        <tr key={`feature-${categoryIndex}-${featureIndex}`} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-4 px-4 text-gray-700">{feature.name}</td>
                          <td className="py-4 px-4 text-center text-gray-700">{feature.free}</td>
                          <td className="py-4 px-4 text-center text-gray-700 font-medium">{feature.pro}</td>
                          <td className="py-4 px-4 text-center text-gray-700">{feature.teams}</td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </section>

      {/* Philippine Payment Methods */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">We support Philippine payment methods</h3>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700">
                <span className="text-3xl">{method.icon}</span>
                <span className="font-medium">{method.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            What users are saying about HeyGPT Pro
          </h2>
          <p className="text-gray-600 text-center mb-12">Join thousands of satisfied Filipino users</p>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{testimonial.image}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Money-Back Guarantee */}
      <section className="py-12 px-4 bg-gradient-to-r from-orange-100 to-orange-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-[#E8844A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">30-Day Money-Back Guarantee</h2>
          <p className="text-xl text-gray-700 mb-6">
            Try HeyGPT Pro risk-free. If you're not completely satisfied within 30 days, we'll refund your money. No questions asked.
          </p>
          <p className="text-gray-600">
            We're confident you'll love HeyGPT, but if not, getting your money back is easy.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <details key={index} className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:border-[#E8844A] transition-colors">
                <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900 hover:text-[#E8844A] transition-colors">
                  <span>{faq.question}</span>
                  <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-gray-700">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#FFB380] via-[#E8844A] to-[#D46D38] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl md:text-2xl text-orange-50 mb-10">
            Start your free trial today and experience the power of AI
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/api/auth/login"
              className="inline-block bg-white text-[#E8844A] py-4 px-8 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              Try Pro Free for 7 Days
            </Link>
            <Link
              href="/api/auth/login"
              className="inline-block bg-transparent border-2 border-white text-white py-4 px-8 rounded-lg font-bold text-lg hover:bg-white hover:text-[#E8844A] transition-all duration-200"
            >
              Start Free Forever
            </Link>
          </div>

          <p className="text-orange-100 mt-6">
            No credit card required • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Sticky Mobile CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E8844A] p-4 shadow-2xl md:hidden z-50">
        <div className="flex gap-3">
          <Link
            href="/api/auth/login"
            className="flex-1 text-center bg-gradient-to-r from-[#FFB380] to-[#E8844A] text-white py-3 px-4 rounded-lg font-bold hover:from-[#E8844A] hover:to-[#D46D38] transition-all duration-200"
          >
            Start Free Trial
          </Link>
          <Link
            href="/api/auth/login"
            className="flex-1 text-center bg-white border-2 border-[#E8844A] text-[#E8844A] py-3 px-4 rounded-lg font-bold hover:bg-orange-50 transition-all duration-200"
          >
            Sign Up Free
          </Link>
        </div>
      </div>
    </div>
  );
}
