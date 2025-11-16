'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  TrendingUp,
  MoreVertical,
  BookOpen,
} from 'lucide-react';
import { BlogPostListItem, BlogPostFilters, BlogPostStatus } from '@/types/blog-cms';

export default function BlogPostsPage() {
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch blog posts
  useEffect(() => {
    fetchPosts();
  }, [page, statusFilter, searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: statusFilter,
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/blog/posts?${params}`);
      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts);
        setTotalPages(data.pagination.total_pages);
      } else {
        console.error('Failed to fetch posts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPosts();
      } else {
        alert('Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete blog post');
    }
  };

  const getStatusBadge = (status: BlogPostStatus) => {
    const badges: Record<BlogPostStatus, { bg: string; text: string }> = {
      draft: { bg: 'bg-neutral-100', text: 'text-neutral-700' },
      published: { bg: 'bg-green-100', text: 'text-green-700' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
      archived: { bg: 'bg-orange-100', text: 'text-orange-700' },
    };

    const badge = badges[status];

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex-1 overflow-auto bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Blog Posts</h1>
              <p className="text-neutral-600 mt-1">
                Manage your blog content and publications
              </p>
            </div>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              New Post
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BlogPostStatus | 'all')}
                className="px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Table */}
      <div className="p-8">
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No blog posts found</h3>
              <p className="text-neutral-600 mb-6">
                Get started by creating your first blog post
              </p>
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Blog Post
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {post.featured_image ? (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={post.featured_image}
                                alt={post.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-6 h-6 text-neutral-400" />
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/admin/blog/${post.id}`}
                              className="font-medium text-neutral-900 hover:text-orange-600 line-clamp-1"
                            >
                              {post.title}
                            </Link>
                            {post.excerpt && (
                              <p className="text-sm text-neutral-600 line-clamp-1 mt-0.5">
                                {post.excerpt}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {post.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag.id}
                                  className="inline-block px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded"
                                >
                                  {tag.name}
                                </span>
                              ))}
                              {post.tags.length > 2 && (
                                <span className="text-xs text-neutral-500">
                                  +{post.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {post.author_avatar ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                              <Image
                                src={post.author_avatar}
                                alt={post.author_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-orange-600">
                                {post.author_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-neutral-700">{post.author_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-700">
                          {post.category_name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-neutral-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.published_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-neutral-600">
                          <TrendingUp className="w-4 h-4" />
                          {post.view_count.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 text-neutral-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="View post"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="p-2 text-neutral-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit post"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="border-t border-neutral-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-neutral-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
