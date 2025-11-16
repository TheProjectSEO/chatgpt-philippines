'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Dialog } from '../components/Dialog';
import { PageBuilder } from '@/components/admin/page-builder';
import { PageContent } from '@/types/page-content';

interface Page {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: 'published' | 'draft' | 'archived';
  description?: string;
  lastModified?: string;
  content?: PageContent;
}

export default function PagesManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [isPageBuilderOpen, setIsPageBuilderOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    status: 'published' as 'published' | 'draft' | 'archived',
    category: '',
    description: '',
  });
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pages from API
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/pages?toolsOnly=true');
        if (!response.ok) throw new Error('Failed to fetch pages');

        const data = await response.json();
        const pagesWithDates = data.pages.map((page: Page) => ({
          ...page,
          lastModified: new Date().toISOString().split('T')[0], // Add current date for now
        }));
        setPages(pagesWithDates);
        setError(null);
      } catch (err) {
        console.error('Error fetching pages:', err);
        setError('Failed to load pages');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, []);

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      status: page.status,
      category: page.category,
      description: page.description || '',
    });
    // Open page builder instead of simple form
    setIsPageBuilderOpen(true);
  };

  const handleNewPageClick = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      status: 'draft',
      category: '',
      description: '',
    });
    setIsNewPageModalOpen(true);
  };

  const handleSavePage = () => {
    // TODO: Implement actual save to database
    console.log('Saving page:', formData);
    alert(
      editingPage
        ? `Page "${formData.title}" updated successfully!`
        : `New page "${formData.title}" created successfully!`
    );
    setIsEditModalOpen(false);
    setIsNewPageModalOpen(false);
  };

  const handleSavePageBuilder = (content: PageContent) => {
    // TODO: Implement actual save to database with builder data
    console.log('Saving page builder data:', content);
    console.log('Page info:', formData);
    alert(`Page "${formData.title || editingPage?.title}" saved successfully with ${content.sections.length} sections!`);
    setIsPageBuilderOpen(false);
    setEditingPage(null);
  };

  const handleCancelPageBuilder = () => {
    setIsPageBuilderOpen(false);
    setEditingPage(null);
  };

  const handleDeleteClick = (page: Page) => {
    if (confirm(`Are you sure you want to delete "${page.title}"?`)) {
      // TODO: Implement actual delete from database
      console.log('Deleting page:', page.id);
      alert(`Page "${page.title}" deleted successfully!`);
    }
  };

  // Show page builder if open
  if (isPageBuilderOpen) {
    return (
      <PageBuilder
        initialContent={editingPage?.content}
        pageTitle={formData.title || editingPage?.title || ''}
        pageSlug={formData.slug || editingPage?.slug || ''}
        onSave={handleSavePageBuilder}
        onCancel={handleCancelPageBuilder}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Pages</h1>
          <p className="text-neutral-600">Manage your website pages</p>
        </div>
        <button
          onClick={handleNewPageClick}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Page
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <div className="flex justify-center items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="text-neutral-600">Loading pages...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-semibold">Error loading pages</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && filteredPages.length === 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <p className="text-neutral-600">
            {searchQuery ? `No pages found for "${searchQuery}"` : 'No pages found'}
          </p>
        </div>
      )}

      {/* Pages Table */}
      {!loading && !error && filteredPages.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">
                Title
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-neutral-900">
                Last Modified
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-neutral-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredPages.map((page) => (
              <tr key={page.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                  {page.title}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">{page.slug}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      page.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {page.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">
                  {page.lastModified ? new Date(page.lastModified).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(page)}
                      className="p-2 text-neutral-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      aria-label={`Edit ${page.title}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(page)}
                      className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Delete ${page.title}`}
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
        </div>
      )}

      {/* Edit Page Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Page: ${editingPage?.title || ''}`}
        maxWidth="xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSavePage();
          }}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="edit-title"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Page Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter page title"
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-slug"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Page Slug
            </label>
            <input
              id="edit-slug"
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="/page-slug"
              required
            />
            <p className="mt-1 text-sm text-neutral-500">
              URL path for this page (e.g., /about or /contact)
            </p>
          </div>

          <div>
            <label
              htmlFor="edit-status"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Status
            </label>
            <select
              id="edit-status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'published' | 'draft',
                })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Dialog>

      {/* New Page Modal */}
      <Dialog
        isOpen={isNewPageModalOpen}
        onClose={() => setIsNewPageModalOpen(false)}
        title="Create New Page"
        maxWidth="xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSavePage();
          }}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="new-title"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Page Title
            </label>
            <input
              id="new-title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter page title"
              required
            />
          </div>

          <div>
            <label
              htmlFor="new-slug"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Page Slug
            </label>
            <input
              id="new-slug"
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="/page-slug"
              required
            />
            <p className="mt-1 text-sm text-neutral-500">
              URL path for this page (e.g., /about or /contact)
            </p>
          </div>

          <div>
            <label
              htmlFor="new-status"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Status
            </label>
            <select
              id="new-status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'published' | 'draft',
                })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setIsNewPageModalOpen(false)}
              className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Create Page
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
