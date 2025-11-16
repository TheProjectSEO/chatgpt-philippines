/**
 * Centralized Page Registry
 * Source of truth for all pages in the application
 * Used by admin panel, SEO management, sitemap generation, etc.
 */

export interface PageRegistryItem {
  id: string
  title: string
  slug: string
  category: string
  description?: string
  status: 'published' | 'draft' | 'archived'
  isPremium?: boolean
  keywords?: string[]
}

// Tool categories mapped from Navbar + additional tools
export const PAGE_CATEGORIES = {
  WRITING: 'Writing Tools',
  ACADEMIC: 'Academic Tools',
  PROFESSIONAL: 'Professional Tools',
  CREATIVE: 'Creative Tools',
  DETECTION: 'AI Detection & Conversion',
  LANGUAGE: 'Language Tools',
  CONTENT: 'Content Generators',
  CHECKERS: 'Checkers & Fixers',
  MEDIA: 'Media Tools',
  DEVELOPMENT: 'Development Tools',
  ASSISTANT: 'AI Assistants',
  ANALYTICS: 'Data & Analytics',
  OTHER: 'Other Tools',
}

/**
 * Complete registry of all tool pages
 * Extracted from app directory and Navbar navigation
 */
export const PAGE_REGISTRY: PageRegistryItem[] = [
  // Writing Tools
  { id: '1', title: 'Grammar Checker', slug: '/grammar-checker', category: PAGE_CATEGORIES.WRITING, status: 'published', description: 'Check and fix grammar errors in your text' },
  { id: '2', title: 'Paraphraser', slug: '/paraphraser', category: PAGE_CATEGORIES.WRITING, status: 'published', description: 'Rephrase text while maintaining meaning' },
  { id: '3', title: 'Summarizer', slug: '/summarizer', category: PAGE_CATEGORIES.WRITING, status: 'published', description: 'Create concise summaries of long texts' },
  { id: '4', title: 'Article Rewriter', slug: '/article-rewriter', category: PAGE_CATEGORIES.WRITING, status: 'published', description: 'Rewrite articles with different words' },
  { id: '5', title: 'Sentence Expander', slug: '/sentence-expander', category: PAGE_CATEGORIES.WRITING, status: 'published', description: 'Expand short sentences into detailed ones' },
  { id: '6', title: 'Sentence Simplifier', slug: '/sentence-simplifier', category: PAGE_CATEGORIES.WRITING, status: 'published', description: 'Simplify complex sentences' },

  // Academic Tools
  { id: '7', title: 'Essay Writer', slug: '/essay-writer', category: PAGE_CATEGORIES.ACADEMIC, status: 'published', description: 'Write well-structured essays' },
  { id: '8', title: 'Research Paper', slug: '/research-paper', category: PAGE_CATEGORIES.ACADEMIC, status: 'published', description: 'Generate research papers on any topic' },
  { id: '9', title: 'Thesis Generator', slug: '/thesis-generator', category: PAGE_CATEGORIES.ACADEMIC, status: 'published', description: 'Create strong thesis statements' },
  { id: '10', title: 'Homework Helper', slug: '/homework-helper', category: PAGE_CATEGORIES.ACADEMIC, status: 'published', description: 'Get help with homework assignments' },
  { id: '11', title: 'Study Guide', slug: '/study-guide', category: PAGE_CATEGORIES.ACADEMIC, status: 'published', description: 'Create comprehensive study guides' },
  { id: '12', title: 'Math Solver', slug: '/math-solver', category: PAGE_CATEGORIES.ACADEMIC, status: 'published', description: 'Solve complex math problems' },
  { id: '13', title: 'Research Assistant', slug: '/research-assistant', category: PAGE_CATEGORIES.ACADEMIC, status: 'published', description: 'AI-powered research assistance' },

  // Professional Tools
  { id: '14', title: 'Resume Builder', slug: '/resume-builder', category: PAGE_CATEGORIES.PROFESSIONAL, status: 'published', description: 'Build professional resumes' },
  { id: '15', title: 'Cover Letter', slug: '/cover-letter', category: PAGE_CATEGORIES.PROFESSIONAL, status: 'published', description: 'Write compelling cover letters' },
  { id: '16', title: 'Business Plan', slug: '/business-plan', category: PAGE_CATEGORIES.PROFESSIONAL, status: 'published', description: 'Generate comprehensive business plans' },
  { id: '17', title: 'Email Writer', slug: '/email-writer', category: PAGE_CATEGORIES.PROFESSIONAL, status: 'published', description: 'Write professional emails' },
  { id: '18', title: 'Speech Writer', slug: '/speech-writer', category: PAGE_CATEGORIES.PROFESSIONAL, status: 'published', description: 'Create impactful speeches' },

  // Creative Tools
  { id: '19', title: 'Story Generator', slug: '/story-generator', category: PAGE_CATEGORIES.CREATIVE, status: 'published', description: 'Generate creative stories' },
  { id: '20', title: 'Poem Generator', slug: '/poem-generator', category: PAGE_CATEGORIES.CREATIVE, status: 'published', description: 'Create beautiful poems' },
  { id: '21', title: 'Slogan Generator', slug: '/slogan-generator', category: PAGE_CATEGORIES.CREATIVE, status: 'published', description: 'Generate catchy slogans' },
  { id: '22', title: 'Song Lyrics Generator', slug: '/lyrics-generator', category: PAGE_CATEGORIES.CREATIVE, status: 'published', description: 'Write song lyrics' },
  { id: '23', title: 'Logo Maker', slug: '/logo-maker', category: PAGE_CATEGORIES.CREATIVE, status: 'published', description: 'Design logos with AI' },

  // AI Detection & Conversion
  { id: '24', title: 'AI Detector', slug: '/ai-detector', category: PAGE_CATEGORIES.DETECTION, status: 'published', description: 'Detect AI-generated content' },
  { id: '25', title: 'AI Humanizer', slug: '/ai-humanizer', category: PAGE_CATEGORIES.DETECTION, status: 'published', description: 'Make AI text sound human' },
  { id: '26', title: 'Plagiarism Checker', slug: '/plagiarism-checker', category: PAGE_CATEGORIES.DETECTION, status: 'published', description: 'Check for plagiarized content' },

  // Language Tools
  { id: '27', title: 'Translator', slug: '/translator', category: PAGE_CATEGORIES.LANGUAGE, status: 'published', description: 'Translate text between languages' },
  { id: '28', title: 'Filipino Writer', slug: '/filipino-writer', category: PAGE_CATEGORIES.LANGUAGE, status: 'published', description: 'Write in Filipino language' },
  { id: '29', title: 'Active to Passive', slug: '/active-to-passive', category: PAGE_CATEGORIES.LANGUAGE, status: 'published', description: 'Convert active voice to passive' },
  { id: '30', title: 'Passive to Active', slug: '/passive-to-active', category: PAGE_CATEGORIES.LANGUAGE, status: 'published', description: 'Convert passive voice to active' },

  // Content Generators
  { id: '31', title: 'Title Generator', slug: '/title-generator', category: PAGE_CATEGORIES.CONTENT, status: 'published', description: 'Generate catchy titles' },
  { id: '32', title: 'Topic Generator', slug: '/topic-generator', category: PAGE_CATEGORIES.CONTENT, status: 'published', description: 'Generate topic ideas' },
  { id: '33', title: 'Conclusion Generator', slug: '/conclusion-generator', category: PAGE_CATEGORIES.CONTENT, status: 'published', description: 'Write strong conclusions' },
  { id: '34', title: 'Introduction Generator', slug: '/introduction-generator', category: PAGE_CATEGORIES.CONTENT, status: 'published', description: 'Write engaging introductions' },
  { id: '35', title: 'Outline Generator', slug: '/outline-generator', category: PAGE_CATEGORIES.CONTENT, status: 'published', description: 'Create content outlines' },
  { id: '36', title: 'Citation Generator', slug: '/citation-generator', category: PAGE_CATEGORIES.CONTENT, status: 'published', description: 'Generate citations in various formats' },
  { id: '37', title: 'Bibliography', slug: '/bibliography', category: PAGE_CATEGORIES.CONTENT, status: 'published', description: 'Create bibliographies' },

  // Checkers & Fixers
  { id: '38', title: 'Grammar Fixer', slug: '/grammar-fixer', category: PAGE_CATEGORIES.CHECKERS, status: 'published', description: 'Fix grammar errors automatically' },
  { id: '39', title: 'Punctuation Checker', slug: '/punctuation-checker', category: PAGE_CATEGORIES.CHECKERS, status: 'published', description: 'Check punctuation usage' },

  // Media Tools
  { id: '40', title: 'Text to Speech', slug: '/text-to-speech', category: PAGE_CATEGORIES.MEDIA, status: 'published', description: 'Convert text to speech' },
  { id: '41', title: 'Voice Generator', slug: '/voice-generator', category: PAGE_CATEGORIES.MEDIA, status: 'published', description: 'Generate AI voices' },
  { id: '42', title: 'Image Generator', slug: '/image-generator', category: PAGE_CATEGORIES.MEDIA, status: 'published', description: 'Generate images with AI' },
  { id: '43', title: 'QR Code Generator', slug: '/qr-generator', category: PAGE_CATEGORIES.MEDIA, status: 'published', description: 'Create QR codes' },

  // Development Tools
  { id: '44', title: 'Code Generator', slug: '/code-generator', category: PAGE_CATEGORIES.DEVELOPMENT, status: 'published', description: 'Generate code snippets' },
  { id: '45', title: 'Code Analyzer', slug: '/code-analyzer', category: PAGE_CATEGORIES.DEVELOPMENT, status: 'published', description: 'Analyze and review code' },

  // AI Assistants
  { id: '46', title: 'AI Chat Assistant', slug: '/chat', category: PAGE_CATEGORIES.ASSISTANT, status: 'published', description: 'Chat with AI assistant' },

  // Data & Analytics
  { id: '47', title: 'Data Viz Agent', slug: '/data-viz-agent', category: PAGE_CATEGORIES.ANALYTICS, status: 'published', description: 'Visualize data with charts' },
  { id: '48', title: 'Data Processor', slug: '/data-processor', category: PAGE_CATEGORIES.ANALYTICS, status: 'published', description: 'Process and analyze data' },

  // Other pages (non-tool pages)
  { id: '49', title: 'Home', slug: '/', category: PAGE_CATEGORIES.OTHER, status: 'published', description: 'Homepage' },
  { id: '50', title: 'Pricing', slug: '/pricing', category: PAGE_CATEGORIES.OTHER, status: 'published', description: 'Pricing plans' },
  { id: '51', title: 'Login', slug: '/login', category: PAGE_CATEGORIES.OTHER, status: 'published', description: 'User login' },
  { id: '52', title: 'Sign Up', slug: '/signup', category: PAGE_CATEGORIES.OTHER, status: 'published', description: 'Create account' },
]

/**
 * Helper functions
 */

export function getAllPages(): PageRegistryItem[] {
  return PAGE_REGISTRY
}

export function getPageBySlug(slug: string): PageRegistryItem | undefined {
  return PAGE_REGISTRY.find(page => page.slug === slug)
}

export function getPagesByCategory(category: string): PageRegistryItem[] {
  return PAGE_REGISTRY.filter(page => page.category === category)
}

export function getPagesByStatus(status: PageRegistryItem['status']): PageRegistryItem[] {
  return PAGE_REGISTRY.filter(page => page.status === status)
}

export function getPublishedPages(): PageRegistryItem[] {
  return getPagesByStatus('published')
}

export function getToolPages(): PageRegistryItem[] {
  return PAGE_REGISTRY.filter(page => page.category !== PAGE_CATEGORIES.OTHER)
}

export function searchPages(query: string): PageRegistryItem[] {
  const lowercaseQuery = query.toLowerCase()
  return PAGE_REGISTRY.filter(page =>
    page.title.toLowerCase().includes(lowercaseQuery) ||
    page.slug.toLowerCase().includes(lowercaseQuery) ||
    page.description?.toLowerCase().includes(lowercaseQuery) ||
    page.category.toLowerCase().includes(lowercaseQuery)
  )
}

export function getAllCategories(): string[] {
  return Array.from(new Set(PAGE_REGISTRY.map(page => page.category)))
}

export function getPageCount(): number {
  return PAGE_REGISTRY.length
}

export function getToolCount(): number {
  return getToolPages().length
}
