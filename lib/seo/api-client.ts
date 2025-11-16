/**
 * SEO Management API Client
 *
 * Client-side utility for interacting with SEO management API endpoints
 */

import { SEOMetadata, PageType } from './types';

// ============================================================================
// Types
// ============================================================================

export interface SEOMetadataDB {
  id: string;
  page_path: string;
  page_type: PageType;
  page_title: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[] | null;
  robots_index: boolean;
  robots_follow: boolean;
  robots_noarchive: boolean;
  robots_nosnippet: boolean;
  robots_noimageindex: boolean;
  robots_max_snippet: number;
  robots_max_image_preview: string;
  robots_max_video_preview: number;
  canonical_url: string | null;
  alternate_links: any[];
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  og_image_width: number;
  og_image_height: number;
  og_image_alt: string | null;
  og_type: string;
  og_url: string | null;
  og_site_name: string | null;
  og_locale: string;
  og_article_published_time: string | null;
  og_article_modified_time: string | null;
  og_article_author: string | null;
  og_article_section: string | null;
  og_article_tags: string[] | null;
  twitter_card: string;
  twitter_site: string | null;
  twitter_creator: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  twitter_image_alt: string | null;
  schema_enabled: boolean;
  schema_types: string[] | null;
  schema_data: any;
  custom_schema: any;
  author: string | null;
  published_date: string | null;
  modified_date: string | null;
  section: string | null;
  tags: string[] | null;
  seo_score: number;
  seo_issues: any[];
  seo_warnings: any[];
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateSEOMetadataRequest {
  page_path: string;
  page_type: PageType;
  page_title: string;
  meta_title: string;
  meta_description: string;
  meta_keywords?: string[];
  robots_index?: boolean;
  robots_follow?: boolean;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  schema_enabled?: boolean;
  schema_types?: string[];
  schema_data?: any;
  author?: string;
  section?: string;
  tags?: string[];
  priority?: number;
}

export interface UpdateSEOMetadataRequest extends Partial<CreateSEOMetadataRequest> {
  id: string;
}

export interface SitemapEntry {
  page_path: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  include_in_sitemap: boolean;
}

export interface RobotsConfig {
  id: string;
  content: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API Client Class
// ============================================================================

class SEOAPIClient {
  private baseUrl = '/api/admin/seo';

  /**
   * Fetch all SEO metadata entries
   */
  async getAllMetadata(params?: {
    page_type?: PageType;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: SEOMetadataDB[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page_type) queryParams.append('page_type', params.page_type);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${this.baseUrl}/metadata${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch SEO metadata');
    }

    return response.json();
  }

  /**
   * Fetch SEO metadata by page path
   */
  async getMetadataByPath(pagePath: string): Promise<SEOMetadataDB | null> {
    const response = await fetch(
      `${this.baseUrl}/metadata?page_path=${encodeURIComponent(pagePath)}`
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch SEO metadata');
    }

    const data = await response.json();
    return data.data[0] || null;
  }

  /**
   * Fetch SEO metadata by ID
   */
  async getMetadataById(id: string): Promise<SEOMetadataDB> {
    const response = await fetch(`${this.baseUrl}/metadata/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch SEO metadata');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Create new SEO metadata
   */
  async createMetadata(data: CreateSEOMetadataRequest): Promise<SEOMetadataDB> {
    const response = await fetch(`${this.baseUrl}/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create SEO metadata');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Update existing SEO metadata
   */
  async updateMetadata(id: string, data: Partial<CreateSEOMetadataRequest>): Promise<SEOMetadataDB> {
    const response = await fetch(`${this.baseUrl}/metadata/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update SEO metadata');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Delete SEO metadata
   */
  async deleteMetadata(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/metadata/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete SEO metadata');
    }
  }

  /**
   * Calculate SEO score for a metadata entry
   */
  async calculateScore(id: string): Promise<number> {
    const response = await fetch(`${this.baseUrl}/metadata/${id}/score`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to calculate SEO score');
    }

    const result = await response.json();
    return result.score;
  }

  // ============================================================================
  // Robots.txt Management
  // ============================================================================

  /**
   * Get active robots.txt configuration
   */
  async getRobotsTxt(): Promise<RobotsConfig> {
    const response = await fetch(`${this.baseUrl}/robots`);

    if (!response.ok) {
      throw new Error('Failed to fetch robots.txt');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Update robots.txt configuration
   */
  async updateRobotsTxt(content: string, notes?: string): Promise<RobotsConfig> {
    const response = await fetch(`${this.baseUrl}/robots`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update robots.txt');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get robots.txt history
   */
  async getRobotsTxtHistory(): Promise<RobotsConfig[]> {
    const response = await fetch(`${this.baseUrl}/robots/history`);

    if (!response.ok) {
      throw new Error('Failed to fetch robots.txt history');
    }

    const data = await response.json();
    return data.data;
  }

  // ============================================================================
  // Sitemap Management
  // ============================================================================

  /**
   * Get all sitemap entries
   */
  async getSitemapEntries(): Promise<SitemapEntry[]> {
    const response = await fetch(`${this.baseUrl}/sitemap`);

    if (!response.ok) {
      throw new Error('Failed to fetch sitemap entries');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Update sitemap entry
   */
  async updateSitemapEntry(
    pagePath: string,
    entry: Partial<SitemapEntry>
  ): Promise<SitemapEntry> {
    const response = await fetch(`${this.baseUrl}/sitemap`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_path: pagePath, ...entry }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update sitemap entry');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Generate sitemap XML
   */
  async generateSitemap(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/sitemap/generate`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to generate sitemap');
    }

    const data = await response.json();
    return data.xml;
  }

  /**
   * Auto-discover pages and create sitemap entries
   */
  async autoDiscoverPages(): Promise<{ discovered: number; created: number }> {
    const response = await fetch(`${this.baseUrl}/sitemap/discover`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to auto-discover pages');
    }

    return response.json();
  }

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  /**
   * Bulk update SEO metadata
   */
  async bulkUpdateMetadata(
    updates: Array<{ id: string; data: Partial<CreateSEOMetadataRequest> }>
  ): Promise<{ updated: number; failed: number }> {
    const response = await fetch(`${this.baseUrl}/metadata/bulk`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates }),
    });

    if (!response.ok) {
      throw new Error('Failed to bulk update metadata');
    }

    return response.json();
  }

  /**
   * Recalculate all SEO scores
   */
  async recalculateAllScores(): Promise<{ updated: number }> {
    const response = await fetch(`${this.baseUrl}/scores/recalculate`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to recalculate scores');
    }

    return response.json();
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const seoAPI = new SEOAPIClient();
export default seoAPI;
