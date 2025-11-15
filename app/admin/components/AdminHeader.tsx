'use client';

import { Bell, Search, User } from 'lucide-react';
import { useState } from 'react';

export function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search pages, content, settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 ml-6">
        {/* Notifications */}
        <button className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
          <div className="text-right">
            <div className="text-sm font-medium text-neutral-900">Admin User</div>
            <div className="text-xs text-neutral-500">admin@chatgpt-ph.com</div>
          </div>
          <button className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-200 transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
