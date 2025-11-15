'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  lastModified: string;
}

export default function PagesManager() {
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Replace with actual data from database
  const pages: Page[] = [
    {
      id: '1',
      title: 'Paraphraser Tool',
      slug: '/paraphraser',
      status: 'published',
      lastModified: '2025-11-15',
    },
    {
      id: '2',
      title: 'AI Chat Assistant',
      slug: '/chat',
      status: 'published',
      lastModified: '2025-11-14',
    },
    {
      id: '3',
      title: 'Filipino Translator',
      slug: '/translator',
      status: 'published',
      lastModified: '2025-11-13',
    },
    {
      id: '4',
      title: 'Grammar Checker',
      slug: '/grammar-checker',
      status: 'draft',
      lastModified: '2025-11-12',
    },
  ];

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Pages</h1>
          <p className="text-neutral-600">Manage your website pages</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
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

      {/* Pages Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
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
                  {new Date(page.lastModified).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-neutral-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
  );
}
