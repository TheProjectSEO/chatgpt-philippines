/**
 * Blog Service Layer
 * Handles all blog-related database operations with Supabase
 */

import { createClient } from '@supabase/supabase-js';
import {
  BlogPost,
  BlogPostListItem,
  BlogPostFilters,
  BlogPostListResponse,
  CreateBlogPostInput,
  UpdateBlogPostInput,
  BlogPostSEO,
  CreateBlogPostSEOInput,
  UpdateBlogPostSEOInput,
  BlogAuthor,
  CreateBlogAuthorInput,
  UpdateBlogAuthorInput,
  BlogCategory,
  CreateBlogCategoryInput,
  UpdateBlogCategoryInput,
  BlogTag,
  CreateBlogTagInput,
  UpdateBlogTagInput,
  SlugCheckResponse,
  ReadingTimeCalculation,
  BlogPostVersion,
  ContentBlock,
} from '@/types/blog-cms';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ================================================
// BLOG POST OPERATIONS
// ================================================

export class BlogService {
  /**
   * Fetch all blog posts with filters and pagination
   */
  static async listPosts(
    filters: BlogPostFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<BlogPostListResponse> {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('blog_posts')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        featured_image,
        status,
        published_at,
        reading_time,
        view_count,
        created_at,
        updated_at,
        author:blog_authors (
          name,
          avatar_url
        ),
        category:blog_categories (
          name
        ),
        tags:blog_post_tags (
          tag:blog_tags (
            id,
            name,
            slug
          )
        )
      `,
        { count: 'exact' }
      );

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters.author_id) {
      query = query.eq('author_id', filters.author_id);
    }

    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
    }

    if (filters.date_from) {
      query = query.gte('published_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('published_at', filters.date_to);
    }

    // Order and paginate
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch blog posts: ${error.message}`);
    }

    // Transform data to match BlogPostListItem
    const posts: BlogPostListItem[] = (data || []).map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featured_image: post.featured_image,
      author_name: post.author?.name || 'Unknown',
      author_avatar: post.author?.avatar_url,
      category_name: post.category?.name,
      status: post.status,
      published_at: post.published_at,
      reading_time: post.reading_time,
      view_count: post.view_count,
      tags: post.tags?.map((t: any) => t.tag) || [],
      created_at: post.created_at,
      updated_at: post.updated_at,
    }));

    const total = count || 0;
    const total_pages = Math.ceil(total / limit);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        total_pages,
      },
    };
  }

  /**
   * Get a single blog post by ID with all relations
   */
  static async getPostById(id: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(
        `
        *,
        author:blog_authors (*),
        category:blog_categories (*),
        tags:blog_post_tags (
          tag:blog_tags (*)
        ),
        seo:blog_post_seo (*),
        faqs:blog_post_faqs (
          id,
          question,
          answer,
          position,
          is_active
        ),
        related_posts:blog_post_related (
          related_post:blog_posts (
            id,
            title,
            slug,
            excerpt,
            featured_image,
            reading_time,
            published_at
          )
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch blog post: ${error.message}`);
    }

    if (!data) return null;

    // Transform data to match BlogPost type
    return {
      ...data,
      tags: data.tags?.map((t: any) => t.tag) || [],
      seo: data.seo || undefined,
      faqs: data.faqs || [],
      related_posts: data.related_posts?.map((r: any) => r.related_post) || [],
    };
  }

  /**
   * Get a single blog post by slug
   */
  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(
        `
        *,
        author:blog_authors (*),
        category:blog_categories (*),
        tags:blog_post_tags (
          tag:blog_tags (*)
        ),
        seo:blog_post_seo (*),
        faqs:blog_post_faqs (
          id,
          question,
          answer,
          position,
          is_active
        ),
        related_posts:blog_post_related (
          related_post:blog_posts (
            id,
            title,
            slug,
            excerpt,
            featured_image,
            reading_time,
            published_at
          )
        )
      `
      )
      .eq('slug', slug)
      .single();

    if (error) {
      throw new Error(`Failed to fetch blog post: ${error.message}`);
    }

    if (!data) return null;

    return {
      ...data,
      tags: data.tags?.map((t: any) => t.tag) || [],
      seo: data.seo || undefined,
      faqs: data.faqs || [],
      related_posts: data.related_posts?.map((r: any) => r.related_post) || [],
    };
  }

  /**
   * Create a new blog post
   */
  static async createPost(input: CreateBlogPostInput, userId?: string): Promise<BlogPost> {
    // Calculate reading time
    const reading_time = this.calculateReadingTime(input.content).minutes;

    // Extract table of contents from content
    const table_of_contents = this.extractTableOfContents(input.content);

    // Insert blog post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .insert({
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        featured_image: input.featured_image,
        featured_image_alt: input.featured_image_alt,
        content: input.content,
        table_of_contents,
        author_id: input.author_id,
        category_id: input.category_id,
        status: input.status || 'draft',
        published_at: input.published_at,
        scheduled_publish_at: input.scheduled_publish_at,
        reading_time,
        allow_comments: input.allow_comments ?? true,
        is_featured: input.is_featured ?? false,
        is_indexable: input.is_indexable ?? true,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (postError) {
      throw new Error(`Failed to create blog post: ${postError.message}`);
    }

    // Create SEO metadata if provided
    if (input.seo) {
      await this.createOrUpdateSEO(post.id, input.seo);
    }

    // Create tags association
    if (input.tag_ids && input.tag_ids.length > 0) {
      await this.updatePostTags(post.id, input.tag_ids);
    }

    // Create FAQs if provided
    if (input.faqs && input.faqs.length > 0) {
      await this.updatePostFAQs(post.id, input.faqs);
    }

    // Create related posts association
    if (input.related_post_ids && input.related_post_ids.length > 0) {
      await this.updateRelatedPosts(post.id, input.related_post_ids);
    }

    // Create initial version
    await this.createVersion(post.id, 1, input.content, userId, 'Initial version');

    return this.getPostById(post.id) as Promise<BlogPost>;
  }

  /**
   * Update an existing blog post
   */
  static async updatePost(input: UpdateBlogPostInput, userId?: string): Promise<BlogPost> {
    const { id, tag_ids, faqs, related_post_ids, seo, ...updateData } = input;

    // Prepare update object with calculated fields
    const updateFields: any = { ...updateData };

    // Recalculate reading time if content changed
    if (updateData.content) {
      updateFields.reading_time = this.calculateReadingTime(updateData.content).minutes;
      updateFields.table_of_contents = this.extractTableOfContents(updateData.content);
    }

    // Update blog post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .update({
        ...updateFields,
        updated_by: userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (postError) {
      throw new Error(`Failed to update blog post: ${postError.message}`);
    }

    // Update SEO if provided
    if (seo) {
      await this.createOrUpdateSEO(id, seo);
    }

    // Update tags if provided
    if (tag_ids) {
      await this.updatePostTags(id, tag_ids);
    }

    // Update FAQs if provided
    if (faqs) {
      await this.updatePostFAQs(id, faqs);
    }

    // Update related posts if provided
    if (related_post_ids) {
      await this.updateRelatedPosts(id, related_post_ids);
    }

    // Create new version
    if (updateData.content) {
      const currentPost = await this.getPostById(id);
      if (currentPost) {
        await this.createVersion(
          id,
          currentPost.version + 1,
          updateData.content,
          userId,
          'Content updated'
        );
      }
    }

    return this.getPostById(id) as Promise<BlogPost>;
  }

  /**
   * Delete a blog post
   */
  static async deletePost(id: string): Promise<void> {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete blog post: ${error.message}`);
    }
  }

  /**
   * Check if slug is available
   */
  static async checkSlug(slug: string, excludeId?: string): Promise<SlugCheckResponse> {
    let query = supabase.from('blog_posts').select('id').eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (slug is available)
      throw new Error(`Failed to check slug: ${error.message}`);
    }

    const available = !data;

    return {
      available,
      slug,
      suggestion: available ? undefined : `${slug}-${Date.now()}`,
    };
  }

  /**
   * Increment view count
   */
  static async incrementViewCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_blog_post_views', { post_id: id });

    if (error) {
      console.error('Failed to increment view count:', error);
    }
  }

  // ================================================
  // HELPER METHODS
  // ================================================

  private static async createOrUpdateSEO(
    postId: string,
    seoData: CreateBlogPostSEOInput
  ): Promise<void> {
    const { data: existing } = await supabase
      .from('blog_post_seo')
      .select('id')
      .eq('post_id', postId)
      .single();

    if (existing) {
      await supabase.from('blog_post_seo').update(seoData).eq('post_id', postId);
    } else {
      await supabase.from('blog_post_seo').insert({ ...seoData, post_id: postId });
    }
  }

  private static async updatePostTags(postId: string, tagIds: string[]): Promise<void> {
    // Delete existing tags
    await supabase.from('blog_post_tags').delete().eq('post_id', postId);

    // Insert new tags
    if (tagIds.length > 0) {
      await supabase
        .from('blog_post_tags')
        .insert(tagIds.map((tag_id) => ({ post_id: postId, tag_id })));
    }
  }

  private static async updatePostFAQs(
    postId: string,
    faqs: { question: string; answer: string; position?: number }[]
  ): Promise<void> {
    // Delete existing FAQs
    await supabase.from('blog_post_faqs').delete().eq('post_id', postId);

    // Insert new FAQs
    if (faqs.length > 0) {
      await supabase
        .from('blog_post_faqs')
        .insert(
          faqs.map((faq, index) => ({
            post_id: postId,
            question: faq.question,
            answer: faq.answer,
            position: faq.position ?? index,
          }))
        );
    }
  }

  private static async updateRelatedPosts(postId: string, relatedIds: string[]): Promise<void> {
    // Delete existing relations
    await supabase.from('blog_post_related').delete().eq('post_id', postId);

    // Insert new relations
    if (relatedIds.length > 0) {
      await supabase
        .from('blog_post_related')
        .insert(
          relatedIds.map((related_post_id, index) => ({
            post_id: postId,
            related_post_id,
            position: index,
          }))
        );
    }
  }

  private static async createVersion(
    postId: string,
    versionNumber: number,
    content: ContentBlock[],
    userId?: string,
    changeSummary?: string
  ): Promise<void> {
    await supabase.from('blog_post_versions').insert({
      post_id: postId,
      version_number: versionNumber,
      title: `Version ${versionNumber}`,
      content_snapshot: content,
      change_summary: changeSummary,
      changed_by: userId,
    });
  }

  static calculateReadingTime(content: ContentBlock[]): ReadingTimeCalculation {
    const wordsPerMinute = 200;
    let totalWords = 0;

    content.forEach((block) => {
      if (block.type === 'text' || block.type === 'heading') {
        const text = Array.isArray(block.content) ? block.content.join(' ') : String(block.content);
        totalWords += text.split(/\s+/).length;
      } else if (block.type === 'list' && Array.isArray(block.content)) {
        totalWords += block.content.join(' ').split(/\s+/).length;
      }
    });

    const minutes = Math.ceil(totalWords / wordsPerMinute);

    return { minutes, words: totalWords };
  }

  static extractTableOfContents(content: ContentBlock[]) {
    return content
      .filter((block) => block.type === 'heading' && (block.level === 2 || block.level === 3))
      .map((block, index) => {
        const title = String(block.content);
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return {
          id,
          title,
          level: block.level!,
        };
      });
  }
}

// ================================================
// BLOG AUTHOR OPERATIONS
// ================================================

export class BlogAuthorService {
  static async listAuthors(): Promise<BlogAuthor[]> {
    const { data, error } = await supabase
      .from('blog_authors')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch blog authors: ${error.message}`);
    }

    return data || [];
  }

  static async createAuthor(input: CreateBlogAuthorInput): Promise<BlogAuthor> {
    const { data, error } = await supabase.from('blog_authors').insert(input).select().single();

    if (error) {
      throw new Error(`Failed to create blog author: ${error.message}`);
    }

    return data;
  }

  static async updateAuthor(input: UpdateBlogAuthorInput): Promise<BlogAuthor> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('blog_authors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update blog author: ${error.message}`);
    }

    return data;
  }
}

// ================================================
// BLOG CATEGORY OPERATIONS
// ================================================

export class BlogCategoryService {
  static async listCategories(): Promise<BlogCategory[]> {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .eq('is_active', true)
      .order('position');

    if (error) {
      throw new Error(`Failed to fetch blog categories: ${error.message}`);
    }

    return data || [];
  }

  static async createCategory(input: CreateBlogCategoryInput): Promise<BlogCategory> {
    const { data, error } = await supabase.from('blog_categories').insert(input).select().single();

    if (error) {
      throw new Error(`Failed to create blog category: ${error.message}`);
    }

    return data;
  }

  static async updateCategory(input: UpdateBlogCategoryInput): Promise<BlogCategory> {
    const { id, ...updateData } = input;

    const { data, error } = await supabase
      .from('blog_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update blog category: ${error.message}`);
    }

    return data;
  }
}

// ================================================
// BLOG TAG OPERATIONS
// ================================================

export class BlogTagService {
  static async listTags(): Promise<BlogTag[]> {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch blog tags: ${error.message}`);
    }

    return data || [];
  }

  static async createTag(input: CreateBlogTagInput): Promise<BlogTag> {
    const { data, error } = await supabase.from('blog_tags').insert(input).select().single();

    if (error) {
      throw new Error(`Failed to create blog tag: ${error.message}`);
    }

    return data;
  }

  static async searchTags(query: string): Promise<BlogTag[]> {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .limit(10);

    if (error) {
      throw new Error(`Failed to search blog tags: ${error.message}`);
    }

    return data || [];
  }
}
