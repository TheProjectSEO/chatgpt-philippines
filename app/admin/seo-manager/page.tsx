'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  AlertCircle,
  Plus,
  FileText,
  Map,
  Filter,
  Download,
  Upload,
} from 'lucide-react';
import { EnhancedSEOMetaForm } from '../components/EnhancedSEOMetaForm';
import { RobotsTxtEditor } from '../components/RobotsTxtEditor';
import { seoAPI, SEOMetadataDB } from '@/lib/seo/api-client';
import { PageType } from '@/lib/seo/types';

type ViewMode = 'list' | 'edit' | 'create' | 'robots' | 'sitemap';

export default function SEOManagerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPage, setSelectedPage] = useState<SEOMetadataDB | null>(null);
  const [pages, setPages] = useState<SEOMetadataDB[]>([]);
  const [filteredPages, setFilteredPages] = useState<SEOMetadataDB[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<PageType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sitemapEntries, setSitemapEntries] = useState<any[]>([]);

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    filterPages();
  }, [pages, searchQuery, filterType]);

  const loadPages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await seoAPI.getAllMetadata({ limit: 1000 });
      setPages(result.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load SEO metadata');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSitemapEntries = async () => {
    try {
      const entries = await seoAPI.getSitemapEntries();
      setSitemapEntries(entries);
    } catch (err) {
      console.error('Failed to load sitemap entries:', err);
    }
  };

  const filterPages = () => {
    let filtered = [...pages];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (page) =>
          page.page_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.meta_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.page_path.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((page) => page.page_type === filterType);
    }

    setFilteredPages(filtered);
  };

  const handleEdit = (page: SEOMetadataDB) => {
    setSelectedPage(page);
    setViewMode('edit');
  };

  const handleCreate = () => {
    setSelectedPage(null);
    setViewMode('create');
  };

  const handleSave = async (data: any) => {
    try {
      if (viewMode === 'edit' && selectedPage) {
        await seoAPI.updateMetadata(selectedPage.id, data);
      } else {
        await seoAPI.createMetadata({
          ...data,
          page_path: data.page_path || '/',
          page_type: data.page_type || 'custom',
          page_title: data.page_title || data.meta_title,
        });
      }
      await loadPages();
      setViewMode('list');
      setSelectedPage(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save SEO metadata');
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SEO configuration?')) {
      return;
    }

    try {
      await seoAPI.deleteMetadata(id);
      await loadPages();
    } catch (err: any) {
      alert(err.message || 'Failed to delete SEO metadata');
    }
  };

  const handleAutoDiscover = async () => {
    try {
      const result = await seoAPI.autoDiscoverPages();
      alert(`Discovered ${result.discovered} pages. Created ${result.created} new entries.`);
      await loadSitemapEntries();
    } catch (err: any) {
      alert(err.message || 'Failed to auto-discover pages');
    }
  };

  const handleGenerateSitemap = async () => {
    try {
      const xml = await seoAPI.generateSitemap();
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to generate sitemap');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    return score >= 80 ? (
      <CheckCircle className="w-4 h-4" />
    ) : (
      <AlertCircle className="w-4 h-4" />
    );
  };

  if (viewMode === 'robots') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-900">Robots.txt Manager</h1>
          <button
            onClick={() => setViewMode('list')}
            className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            Back to SEO Manager
          </button>
        </div>
        <RobotsTxtEditor />
      </div>
    );
  }

  if (viewMode === 'sitemap') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-900">Sitemap Manager</h1>
          <div className="flex gap-2">
            <button
              onClick={handleAutoDiscover}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Auto-Discover Pages
            </button>
            <button
              onClick={handleGenerateSitemap}
              className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Sitemap
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              Back to SEO Manager
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-neutral-600">
            Sitemap entries are automatically managed based on your SEO metadata. Use the
            Auto-Discover feature to find all pages in your application.
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === 'edit' || viewMode === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-900">
            {viewMode === 'edit' ? 'Edit' : 'Create'} SEO Configuration
          </h1>
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedPage(null);
            }}
            className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            Cancel
          </button>
        </div>
        <EnhancedSEOMetaForm
          initialData={selectedPage || undefined}
          onSave={handleSave}
          pagePath={selectedPage?.page_path || '/'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">SEO Manager</h1>
        <p className="text-neutral-600">Manage SEO metadata, robots.txt, and sitemaps</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={handleCreate}
          className="p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors text-left"
        >
          <Plus className="w-6 h-6 text-orange-600 mb-2" />
          <h3 className="font-medium text-neutral-900">New Page</h3>
          <p className="text-sm text-neutral-600">Add SEO metadata</p>
        </button>

        <button
          onClick={() => setViewMode('robots')}
          className="p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors text-left"
        >
          <FileText className="w-6 h-6 text-blue-600 mb-2" />
          <h3 className="font-medium text-neutral-900">Robots.txt</h3>
          <p className="text-sm text-neutral-600">Edit robots.txt</p>
        </button>

        <button
          onClick={() => {
            setViewMode('sitemap');
            loadSitemapEntries();
          }}
          className="p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors text-left"
        >
          <Map className="w-6 h-6 text-green-600 mb-2" />
          <h3 className="font-medium text-neutral-900">Sitemap</h3>
          <p className="text-sm text-neutral-600">Manage sitemap</p>
        </button>

        <button
          onClick={async () => {
            await seoAPI.recalculateAllScores();
            await loadPages();
          }}
          className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors text-left"
        >
          <CheckCircle className="w-6 h-6 text-purple-600 mb-2" />
          <h3 className="font-medium text-neutral-900">Recalculate</h3>
          <p className="text-sm text-neutral-600">Update all scores</p>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as PageType | 'all')}
              className="pl-10 pr-8 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="home">Home</option>
              <option value="tool">Tool</option>
              <option value="article">Article</option>
              <option value="faq">FAQ</option>
              <option value="landing">Landing</option>
              <option value="category">Category</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-sm text-neutral-600">
          {filteredPages.length} of {pages.length} pages
        </div>
      </div>

      {/* Pages List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-900">{error}</p>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Search className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-1">No pages found</h3>
          <p className="text-neutral-600 mb-4">
            {searchQuery || filterType !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first SEO configuration'}
          </p>
          {!searchQuery && filterType === 'all' && (
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Create SEO Config
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Path
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900">{page.page_title}</div>
                      <div className="text-sm text-neutral-600 line-clamp-1">
                        {page.meta_title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-full">
                        {page.page_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-neutral-600">{page.page_path}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                            page.seo_score
                          )}`}
                        >
                          {getScoreIcon(page.seo_score)}
                          {page.seo_score}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(page)}
                          className="px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
