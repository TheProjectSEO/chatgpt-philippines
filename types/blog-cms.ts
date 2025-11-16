/**
 * Blog CMS Type Definitions
 * Complete type system for blog management and content creation
 */

import type { ContentBlock, FAQItem } from './blog';

// Re-export types from blog.ts for convenience
export type { ContentBlock, FAQItem };

// ================================================
// BLOG AUTHORS
// ================================================

export interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  role?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogAuthorInput {
  name: string;
  slug: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  role?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface UpdateBlogAuthorInput extends Partial<CreateBlogAuthorInput> {
  id: string;
}

// ================================================
// BLOG CATEGORIES
// ================================================

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string; // Hex color
  icon?: string; // Lucide icon name
  parent_id?: string;
  position: number;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  children?: BlogCategory[]; // For hierarchical display
}

export interface CreateBlogCategoryInput {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parent_id?: string;
  position?: number;
  seo_title?: string;
  seo_description?: string;
}

export interface UpdateBlogCategoryInput extends Partial<CreateBlogCategoryInput> {
  id: string;
}

// ================================================
// BLOG TAGS
// ================================================

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogTagInput {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateBlogTagInput extends Partial<CreateBlogTagInput> {
  id: string;
}

// ================================================
// BLOG POSTS
// ================================================

export type BlogPostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  featured_image_alt?: string;
  content: ContentBlock[]; // Reusing existing ContentBlock type
  table_of_contents?: TableOfContentsItem[];

  // Relations
  author_id: string;
  author?: BlogAuthor;
  category_id?: string;
  category?: BlogCategory;
  tags?: BlogTag[];

  // Publishing
  status: BlogPostStatus;
  published_at?: string;
  scheduled_publish_at?: string;

  // Metrics
  reading_time?: number;
  view_count: number;
  like_count: number;
  share_count: number;

  // Settings
  allow_comments: boolean;
  is_featured: boolean;
  is_indexable: boolean;

  // Version
  version: number;

  // Audit
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;

  // SEO (joined data)
  seo?: BlogPostSEO;

  // FAQs (joined data)
  faqs?: FAQItem[];

  // Related posts
  related_posts?: RelatedBlogPost[];
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: 2 | 3; // H2 or H3
}

export interface RelatedBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  reading_time?: number;
  published_at?: string;
}

// ================================================
// BLOG POST CRUD INPUTS
// ================================================

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  featured_image_alt?: string;
  content: ContentBlock[];
  author_id: string;
  category_id?: string;
  tag_ids?: string[];
  status?: BlogPostStatus;
  published_at?: string;
  scheduled_publish_at?: string;
  allow_comments?: boolean;
  is_featured?: boolean;
  is_indexable?: boolean;

  // SEO data
  seo?: CreateBlogPostSEOInput;

  // FAQs
  faqs?: CreateBlogPostFAQInput[];

  // Related posts
  related_post_ids?: string[];
}

export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
  id: string;
}

// ================================================
// BLOG POST SEO
// ================================================

export interface BlogPostSEO {
  id: string;
  post_id: string;
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
  robots?: string;
  focus_keyword?: string;
  schema_markup?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPostSEOInput {
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
  robots?: string;
  focus_keyword?: string;
}

export interface UpdateBlogPostSEOInput extends Partial<CreateBlogPostSEOInput> {
  id: string;
  post_id: string;
}

// ================================================
// BLOG POST FAQS
// ================================================

export interface CreateBlogPostFAQInput {
  question: string;
  answer: string;
  position?: number;
  is_active?: boolean;
}

export interface UpdateBlogPostFAQInput extends Partial<CreateBlogPostFAQInput> {
  id: string;
}

// ================================================
// BLOG POST VERSIONS
// ================================================

export interface BlogPostVersion {
  id: string;
  post_id: string;
  version_number: number;
  title: string;
  content_snapshot: ContentBlock[];
  seo_snapshot?: BlogPostSEO;
  change_summary?: string;
  changed_by?: string;
  created_at: string;
}

// ================================================
// BLOG POST ANALYTICS
// ================================================

export interface BlogPostAnalytics {
  id: string;
  post_id: string;
  date: string; // YYYY-MM-DD
  page_views: number;
  unique_visitors: number;
  avg_time_on_page?: number; // seconds
  bounce_rate?: number; // percentage
  social_shares: number;
  created_at: string;
  updated_at: string;
}

// ================================================
// LIST/FILTER TYPES
// ================================================

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  author_name: string;
  author_avatar?: string;
  category_name?: string;
  status: BlogPostStatus;
  published_at?: string;
  reading_time?: number;
  view_count: number;
  tags: { id: string; name: string; slug: string }[];
  created_at: string;
  updated_at: string;
}

export interface BlogPostFilters {
  status?: BlogPostStatus | 'all';
  category_id?: string;
  author_id?: string;
  tag_id?: string;
  search?: string;
  is_featured?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface BlogPostPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface BlogPostListResponse {
  posts: BlogPostListItem[];
  pagination: BlogPostPagination;
}

// ================================================
// EDITOR STATE TYPES
// ================================================

export interface BlogEditorState {
  post: Partial<BlogPost>;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: string;
  errors: Record<string, string>;
}

export interface BlogEditorValidation {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  author_id?: string;
  featured_image?: string;
  seo?: {
    meta_title?: string;
    meta_description?: string;
    focus_keyword?: string;
  };
}

// ================================================
// UTILITY TYPES
// ================================================

export interface SlugCheckResponse {
  available: boolean;
  slug: string;
  suggestion?: string;
}

export interface ReadingTimeCalculation {
  minutes: number;
  words: number;
}

export interface ImageUploadResponse {
  url: string;
  public_id?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

// ================================================
// SUPABASE DATABASE TYPES
// ================================================

export interface Database {
  public: {
    Tables: {
      blog_authors: {
        Row: BlogAuthor;
        Insert: Omit<BlogAuthor, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BlogAuthor, 'id' | 'created_at' | 'updated_at'>>;
      };
      blog_categories: {
        Row: BlogCategory;
        Insert: Omit<BlogCategory, 'id' | 'created_at' | 'updated_at' | 'children'>;
        Update: Partial<Omit<BlogCategory, 'id' | 'created_at' | 'updated_at' | 'children'>>;
      };
      blog_tags: {
        Row: BlogTag;
        Insert: Omit<BlogTag, 'id' | 'usage_count' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BlogTag, 'id' | 'usage_count' | 'created_at' | 'updated_at'>>;
      };
      blog_posts: {
        Row: Omit<BlogPost, 'author' | 'category' | 'tags' | 'seo' | 'faqs' | 'related_posts'>;
        Insert: Omit<BlogPost, 'id' | 'view_count' | 'like_count' | 'share_count' | 'version' | 'created_at' | 'updated_at' | 'author' | 'category' | 'tags' | 'seo' | 'faqs' | 'related_posts'>;
        Update: Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'author' | 'category' | 'tags' | 'seo' | 'faqs' | 'related_posts'>>;
      };
      blog_post_seo: {
        Row: BlogPostSEO;
        Insert: Omit<BlogPostSEO, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BlogPostSEO, 'id' | 'created_at' | 'updated_at'>>;
      };
      blog_post_faqs: {
        Row: FAQItem & { id: string; post_id: string; position: number; is_active: boolean; created_at: string; updated_at: string };
        Insert: Omit<FAQItem, 'id' | 'created_at' | 'updated_at'> & { post_id: string; position?: number; is_active?: boolean };
        Update: Partial<Omit<FAQItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      blog_post_analytics: {
        Row: BlogPostAnalytics;
        Insert: Omit<BlogPostAnalytics, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BlogPostAnalytics, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
