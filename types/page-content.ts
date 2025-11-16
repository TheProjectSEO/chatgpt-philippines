/**
 * Page Content Builder Type Definitions
 * Comprehensive type system for the visual page builder
 */

// =====================================================
// SECTION TYPES
// =====================================================

export type SectionType =
  | 'hero'
  | 'content'
  | 'cta'
  | 'faq'
  | 'features'
  | 'testimonials'
  | 'gallery'
  | 'stats'
  | 'team'
  | 'pricing'
  | 'newsletter'
  | 'contact';

export interface BaseSection {
  id: string;
  type: SectionType;
  order: number;
  isVisible: boolean;
  settings: SectionSettings;
}

export interface SectionSettings {
  backgroundColor?: string;
  textColor?: string;
  paddingTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  paddingBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  containerWidth?: 'narrow' | 'medium' | 'wide' | 'full';
  customClass?: string;
}

// =====================================================
// HERO SECTION
// =====================================================

export interface HeroSection extends BaseSection {
  type: 'hero';
  data: HeroData;
}

export interface HeroData {
  headline: string;
  subheadline?: string;
  description?: string;
  ctaPrimary?: CTAButton;
  ctaSecondary?: CTAButton;
  backgroundImage?: MediaItem;
  backgroundVideo?: MediaItem;
  alignment: 'left' | 'center' | 'right';
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
}

export interface CTAButton {
  text: string;
  url: string;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: string;
  openInNewTab?: boolean;
}

// =====================================================
// CONTENT BLOCK SECTION
// =====================================================

export interface ContentSection extends BaseSection {
  type: 'content';
  data: ContentData;
}

export interface ContentData {
  blocks: ContentBlock[];
}

export type ContentBlockType =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'list'
  | 'quote'
  | 'code'
  | 'video'
  | 'divider';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  order: number;
  data: ContentBlockData;
}

export type ContentBlockData =
  | HeadingBlockData
  | ParagraphBlockData
  | ImageBlockData
  | ListBlockData
  | QuoteBlockData
  | CodeBlockData
  | VideoBlockData
  | DividerBlockData;

export interface HeadingBlockData {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface ParagraphBlockData {
  type: 'paragraph';
  text: string;
  alignment?: 'left' | 'center' | 'right';
  // Rich text formatting stored as HTML
  html?: string;
}

export interface ImageBlockData {
  type: 'image';
  image: MediaItem;
  caption?: string;
  alt: string;
  alignment?: 'left' | 'center' | 'right' | 'wide' | 'full';
  link?: string;
}

export interface ListBlockData {
  type: 'list';
  style: 'bulleted' | 'numbered';
  items: string[];
}

export interface QuoteBlockData {
  type: 'quote';
  text: string;
  author?: string;
  role?: string;
  image?: MediaItem;
}

export interface CodeBlockData {
  type: 'code';
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export interface VideoBlockData {
  type: 'video';
  url: string;
  provider: 'youtube' | 'vimeo' | 'upload';
  thumbnail?: MediaItem;
  autoplay?: boolean;
  loop?: boolean;
  controls?: boolean;
}

export interface DividerBlockData {
  type: 'divider';
  style: 'solid' | 'dashed' | 'dotted';
  thickness?: number;
  color?: string;
}

// =====================================================
// CTA SECTION
// =====================================================

export interface CTASection extends BaseSection {
  type: 'cta';
  data: CTAData;
}

export interface CTAData {
  title: string;
  description?: string;
  ctaPrimary: CTAButton;
  ctaSecondary?: CTAButton;
  backgroundImage?: MediaItem;
  layout: 'centered' | 'split' | 'banner';
}

// =====================================================
// FAQ SECTION
// =====================================================

export interface FAQSection extends BaseSection {
  type: 'faq';
  data: FAQData;
}

export interface FAQData {
  title?: string;
  description?: string;
  items: FAQItem[];
  layout: 'accordion' | 'grid' | 'list';
  enableSchema: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  isExpanded?: boolean;
  order: number;
}

// =====================================================
// FEATURES SECTION
// =====================================================

export interface FeaturesSection extends BaseSection {
  type: 'features';
  data: FeaturesData;
}

export interface FeaturesData {
  title?: string;
  description?: string;
  items: FeatureItem[];
  layout: 'grid' | 'list' | 'cards';
  columns: 2 | 3 | 4;
}

export interface FeatureItem {
  id: string;
  icon?: string;
  iconImage?: MediaItem;
  title: string;
  description: string;
  link?: string;
  order: number;
}

// =====================================================
// TESTIMONIALS SECTION
// =====================================================

export interface TestimonialsSection extends BaseSection {
  type: 'testimonials';
  data: TestimonialsData;
}

export interface TestimonialsData {
  title?: string;
  description?: string;
  items: TestimonialItem[];
  layout: 'carousel' | 'grid' | 'masonry';
  showRating?: boolean;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role?: string;
  company?: string;
  image?: MediaItem;
  rating?: number;
  order: number;
}

// =====================================================
// GALLERY SECTION
// =====================================================

export interface GallerySection extends BaseSection {
  type: 'gallery';
  data: GalleryData;
}

export interface GalleryData {
  title?: string;
  description?: string;
  items: GalleryItem[];
  layout: 'grid' | 'masonry' | 'carousel';
  columns: 2 | 3 | 4 | 5;
  enableLightbox?: boolean;
}

export interface GalleryItem {
  id: string;
  image: MediaItem;
  caption?: string;
  link?: string;
  order: number;
}

// =====================================================
// STATS SECTION
// =====================================================

export interface StatsSection extends BaseSection {
  type: 'stats';
  data: StatsData;
}

export interface StatsData {
  title?: string;
  description?: string;
  items: StatItem[];
  layout: 'horizontal' | 'grid';
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  suffix?: string;
  prefix?: string;
  icon?: string;
  order: number;
}

// =====================================================
// TEAM SECTION
// =====================================================

export interface TeamSection extends BaseSection {
  type: 'team';
  data: TeamData;
}

export interface TeamData {
  title?: string;
  description?: string;
  items: TeamMember[];
  layout: 'grid' | 'list';
  columns: 2 | 3 | 4;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image?: MediaItem;
  social?: {
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
  order: number;
}

// =====================================================
// PRICING SECTION
// =====================================================

export interface PricingSection extends BaseSection {
  type: 'pricing';
  data: PricingData;
}

export interface PricingData {
  title?: string;
  description?: string;
  items: PricingTier[];
  layout: 'cards' | 'table';
  billingPeriod?: 'monthly' | 'yearly' | 'both';
}

export interface PricingTier {
  id: string;
  name: string;
  description?: string;
  price: string;
  period?: string;
  features: string[];
  cta: CTAButton;
  isPopular?: boolean;
  order: number;
}

// =====================================================
// NEWSLETTER SECTION
// =====================================================

export interface NewsletterSection extends BaseSection {
  type: 'newsletter';
  data: NewsletterData;
}

export interface NewsletterData {
  title: string;
  description?: string;
  placeholder?: string;
  buttonText: string;
  successMessage?: string;
  layout: 'inline' | 'stacked' | 'centered';
  showPrivacyNote?: boolean;
  privacyText?: string;
}

// =====================================================
// CONTACT SECTION
// =====================================================

export interface ContactSection extends BaseSection {
  type: 'contact';
  data: ContactData;
}

export interface ContactData {
  title?: string;
  description?: string;
  fields: ContactField[];
  submitButtonText: string;
  successMessage?: string;
  showContactInfo?: boolean;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export interface ContactField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
}

// =====================================================
// MEDIA TYPES
// =====================================================

export interface MediaItem {
  id?: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
}

// =====================================================
// PAGE CONTENT STRUCTURE
// =====================================================

export interface PageContent {
  version: '1.0';
  sections: Section[];
  globalSettings?: GlobalSettings;
}

export type Section =
  | HeroSection
  | ContentSection
  | CTASection
  | FAQSection
  | FeaturesSection
  | TestimonialsSection
  | GallerySection
  | StatsSection
  | TeamSection
  | PricingSection
  | NewsletterSection
  | ContactSection;

export interface GlobalSettings {
  customCSS?: string;
  customJS?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
}

// =====================================================
// EDITOR STATE TYPES
// =====================================================

export interface EditorState {
  content: PageContent;
  selectedSectionId: string | null;
  isDirty: boolean;
  history: PageContent[];
  historyIndex: number;
  previewMode: 'desktop' | 'tablet' | 'mobile';
}

export interface EditorActions {
  addSection: (type: SectionType, index?: number) => void;
  updateSection: (id: string, data: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  reorderSection: (id: string, newIndex: number) => void;
  duplicateSection: (id: string) => void;
  selectSection: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  save: () => Promise<void>;
  setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

// =====================================================
// SECTION TEMPLATES
// =====================================================

export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  type: SectionType;
  thumbnail?: string;
  content: Section;
  category: 'header' | 'content' | 'footer' | 'commercial' | 'other';
}

// =====================================================
// VALIDATION TYPES
// =====================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  sectionId: string;
  field: string;
  message: string;
}

export interface ValidationWarning {
  sectionId: string;
  message: string;
}

// =====================================================
// EXPORT/IMPORT TYPES
// =====================================================

export interface ExportFormat {
  format: 'json' | 'html' | 'markdown';
  includeSettings?: boolean;
  minify?: boolean;
}

export interface ImportResult {
  success: boolean;
  content?: PageContent;
  errors?: string[];
}
