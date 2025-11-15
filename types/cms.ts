/**
 * CMS Type Definitions
 * Central type system for WordPress-like CMS functionality
 */

import { Database } from '../lib/supabase';

// =====================================================
// CORE TYPES FROM DATABASE
// =====================================================

export type Page = Database['public']['Tables']['pages']['Row'];
export type PageInsert = Database['public']['Tables']['pages']['Insert'];
export type PageUpdate = Database['public']['Tables']['pages']['Update'];

export type SEOMetadata = {
  id: string;
  page_id: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
  alternate_urls?: AlternateURL[];
  schema_markup?: Record<string, any>;
  robots_index?: boolean;
  robots_follow?: boolean;
  robots_meta?: string[];
  focus_keyword?: string;
  readability_score?: number;
  seo_score?: number;
  created_at: string;
  updated_at: string;
};

export type FAQ = {
  id: string;
  page_id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_featured: boolean;
  schema_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type Media = {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_url: string;
  file_type: 'image' | 'video' | 'document' | 'audio';
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  is_optimized: boolean;
  optimization_data?: MediaOptimizationData;
  thumbnail_url?: string;
  variants?: MediaVariant[];
  folder: string;
  tags?: string[];
  uploaded_by?: string;
  uploaded_at: string;
  usage_count: number;
  last_used_at?: string;
};

export type PageComponent = {
  id: string;
  page_id: string;
  component_type: ComponentType;
  component_data: Record<string, any>;
  section: 'header' | 'main' | 'sidebar' | 'footer';
  sort_order: number;
  is_visible: boolean;
  visibility_rules?: VisibilityRules;
  created_at: string;
  updated_at: string;
};

export type PageRevision = {
  id: string;
  page_id: string;
  title: string;
  content: Record<string, any>;
  seo_snapshot?: Record<string, any>;
  revision_number: number;
  revision_message?: string;
  created_by?: string;
  created_at: string;
  is_auto_save: boolean;
  restored_from?: string;
};

export type InternalLink = {
  id: string;
  source_page_id: string;
  target_page_id: string;
  anchor_text: string;
  link_url: string;
  position_in_content?: number;
  link_type: 'contextual' | 'navigation' | 'footer' | 'sidebar';
  click_count: number;
  last_clicked_at?: string;
  is_active: boolean;
  is_broken: boolean;
  last_checked_at?: string;
  created_at: string;
  updated_at: string;
};

export type ScheduledPublish = {
  id: string;
  page_id: string;
  scheduled_at: string;
  action: 'publish' | 'unpublish' | 'archive';
  status: 'pending' | 'executed' | 'failed' | 'cancelled';
  executed_at?: string;
  error_message?: string;
  created_by?: string;
  created_at: string;
};

export type AdminPermission = {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  can_create_pages: boolean;
  can_edit_pages: boolean;
  can_delete_pages: boolean;
  can_publish_pages: boolean;
  can_manage_seo: boolean;
  can_manage_media: boolean;
  can_manage_users: boolean;
  allowed_page_types: string[];
  max_pages_per_day: number;
  created_at: string;
  updated_at: string;
};

// =====================================================
// COMPOSITE TYPES
// =====================================================

export interface PageWithRelations extends Page {
  seo_metadata?: SEOMetadata;
  faqs?: FAQ[];
  components?: PageComponent[];
  featured_image_url?: string;
  created_by_session?: string;
  updated_by_session?: string;
  revisions?: PageRevision[];
  internal_links?: InternalLink[];
}

export interface PageFormData {
  title: string;
  slug?: string; // Optional - will be auto-generated from title if not provided
  page_type: PageType;
  content: PageContent;
  status: PageStatus;
  template?: string;
  layout_config?: Record<string, any>;
  featured_image?: string;
  is_homepage?: boolean;
  allow_comments?: boolean;
  is_indexable?: boolean;
  parent_id?: string;
  sort_order?: number;
  scheduled_publish_at?: string;
}

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export type PageType = 'tool' | 'home' | 'static' | 'landing';
export type PageStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export type ComponentType =
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'cta'
  | 'faq'
  | 'gallery'
  | 'form'
  | 'text_block'
  | 'image_text'
  | 'video'
  | 'code_block'
  | 'accordion'
  | 'tabs'
  | 'stats'
  | 'team'
  | 'logos'
  | 'newsletter'
  | 'social_proof';

// =====================================================
// CONTENT STRUCTURE TYPES
// =====================================================

export interface PageContent {
  hero?: HeroContent;
  sections?: SectionContent[];
  components?: string[];
  custom_css?: string;
  custom_js?: string;
}

export interface HeroContent {
  title: string;
  subtitle?: string;
  description?: string;
  cta_primary?: CTAButton;
  cta_secondary?: CTAButton;
  background_image?: string;
  background_video?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface CTAButton {
  text: string;
  url: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: string;
}

export interface SectionContent {
  id: string;
  type: ComponentType;
  data: Record<string, any>;
  settings?: SectionSettings;
}

export interface SectionSettings {
  background_color?: string;
  text_color?: string;
  padding?: string;
  margin?: string;
  container_width?: 'narrow' | 'medium' | 'wide' | 'full';
  animation?: string;
}

// =====================================================
// MEDIA TYPES
// =====================================================

export interface MediaOptimizationData {
  original_size: number;
  optimized_size: number;
  compression_ratio: number;
  formats: string[];
}

export interface MediaVariant {
  size: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
  url: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface MediaUploadOptions {
  folder?: string;
  tags?: string[];
  alt_text?: string;
  caption?: string;
  optimize?: boolean;
  generate_variants?: boolean;
}

// =====================================================
// VISIBILITY & RULES
// =====================================================

export interface VisibilityRules {
  device?: ('desktop' | 'tablet' | 'mobile')[];
  user_type?: ('guest' | 'authenticated' | 'admin')[];
  date_range?: {
    start?: string;
    end?: string;
  };
  custom_conditions?: Record<string, any>;
}

// =====================================================
// SEO TYPES
// =====================================================

export interface AlternateURL {
  hreflang: string;
  url: string;
}

export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface SEOAnalysis {
  score: number;
  issues: SEOIssue[];
  suggestions: string[];
  readability: ReadabilityMetrics;
}

export interface SEOIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  fix?: string;
}

export interface ReadabilityMetrics {
  flesch_reading_ease: number;
  flesch_kincaid_grade: number;
  avg_sentence_length: number;
  avg_word_length: number;
  passive_voice_percentage: number;
}

// =====================================================
// ADMIN UI TYPES
// =====================================================

export interface AdminDashboardStats {
  total_pages: number;
  published_pages: number;
  draft_pages: number;
  total_media: number;
  total_media_size: number;
  total_admins: number;
  pages_this_week: number;
}

export interface PageListFilters {
  status?: PageStatus;
  page_type?: PageType;
  search?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'updated_at' | 'title' | 'view_count';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface MediaLibraryFilters {
  file_type?: 'image' | 'video' | 'document' | 'audio';
  folder?: string;
  tags?: string[];
  search?: string;
  uploaded_by?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'uploaded_at' | 'filename' | 'file_size';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    total_pages?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// =====================================================
// FORM VALIDATION TYPES
// =====================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// =====================================================
// WYSIWYG EDITOR TYPES
// =====================================================

export interface EditorContent {
  type: 'doc';
  content: EditorNode[];
}

export interface EditorNode {
  type: string;
  attrs?: Record<string, any>;
  content?: EditorNode[];
  marks?: EditorMark[];
  text?: string;
}

export interface EditorMark {
  type: string;
  attrs?: Record<string, any>;
}

export interface EditorConfig {
  placeholder?: string;
  extensions?: string[];
  toolbar?: ToolbarConfig;
  image_upload_handler?: (file: File) => Promise<string>;
  link_validation?: (url: string) => boolean;
}

export interface ToolbarConfig {
  items: ToolbarItem[];
  sticky?: boolean;
  position?: 'top' | 'bottom';
}

export type ToolbarItem =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'heading'
  | 'paragraph'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'codeBlock'
  | 'horizontalRule'
  | 'link'
  | 'image'
  | 'video'
  | 'table'
  | 'undo'
  | 'redo'
  | 'align'
  | 'textColor'
  | 'backgroundColor'
  | 'clearFormatting';

// =====================================================
// PREVIEW SYSTEM TYPES
// =====================================================

export interface PreviewConfig {
  device: 'desktop' | 'tablet' | 'mobile';
  theme: 'light' | 'dark' | 'system';
  show_rulers: boolean;
  show_grid: boolean;
  sync_scroll: boolean;
}

export interface PreviewMessage {
  type: 'update' | 'scroll' | 'click' | 'resize';
  payload: any;
}

// =====================================================
// WEBHOOK & INTEGRATION TYPES
// =====================================================

export interface WebhookEvent {
  event: 'page.created' | 'page.updated' | 'page.published' | 'page.deleted';
  timestamp: string;
  data: Page;
  user_id?: string;
}

// =====================================================
// EXPORT TYPES
// =====================================================

export interface ExportOptions {
  format: 'json' | 'csv' | 'xml';
  include_seo?: boolean;
  include_faqs?: boolean;
  include_components?: boolean;
  include_media?: boolean;
}
