'use client';

import { useState } from 'react';
import { Upload, Image, Trash2, Copy } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  size: string;
  uploadedAt: string;
}

export default function MediaLibrary() {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  // TODO: Replace with actual data from database
  const mediaItems: MediaItem[] = [
    {
      id: '1',
      url: '/images/paraphraser-hero.jpg',
      name: 'paraphraser-hero.jpg',
      size: '245 KB',
      uploadedAt: '2025-11-15',
    },
    {
      id: '2',
      url: '/images/chat-interface.png',
      name: 'chat-interface.png',
      size: '180 KB',
      uploadedAt: '2025-11-14',
    },
    {
      id: '3',
      url: '/images/translator-icon.svg',
      name: 'translator-icon.svg',
      size: '12 KB',
      uploadedAt: '2025-11-13',
    },
  ];

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Media Library</h1>
          <p className="text-neutral-600">Manage your images and files</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          <Upload className="w-5 h-5" />
          Upload Media
        </button>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl border-2 border-dashed border-neutral-300 p-12 text-center hover:border-orange-500 transition-colors cursor-pointer">
        <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Drop files here or click to upload
        </h3>
        <p className="text-sm text-neutral-600">
          Support for JPG, PNG, SVG, GIF (max 5MB)
        </p>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
              selectedMedia === item.id
                ? 'border-orange-500 shadow-lg'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
            onClick={() => setSelectedMedia(item.id)}
          >
            {/* Image Preview */}
            <div className="aspect-square bg-neutral-100 flex items-center justify-center p-4">
              <Image className="w-12 h-12 text-neutral-400" />
              {/* TODO: Replace with actual image preview */}
            </div>

            {/* Media Info */}
            <div className="p-4 border-t border-neutral-200">
              <div className="font-medium text-neutral-900 truncate mb-1">
                {item.name}
              </div>
              <div className="flex items-center justify-between text-sm text-neutral-600">
                <span>{item.size}</span>
                <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyUrl(item.url);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-orange-100 hover:text-orange-700 transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copy URL
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this media item?')) {
                      // TODO: Implement delete
                    }
                  }}
                  className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Media Details */}
      {selectedMedia && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Media Details
          </h3>
          <div className="space-y-3">
            {Object.entries(
              mediaItems.find((item) => item.id === selectedMedia) || {}
            ).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 capitalize">
                  {key}:
                </span>
                <span className="text-sm text-neutral-600">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
