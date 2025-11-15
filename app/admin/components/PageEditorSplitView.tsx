'use client';

import { useState } from 'react';
import { Eye, Code, Monitor, Smartphone } from 'lucide-react';

interface PageEditorSplitViewProps {
  content: string;
  onContentChange: (content: string) => void;
  previewUrl?: string;
}

type ViewMode = 'split' | 'code' | 'preview';
type DeviceMode = 'desktop' | 'mobile';

export function PageEditorSplitView({
  content,
  onContentChange,
  previewUrl,
}: PageEditorSplitViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-neutral-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-orange-100 text-orange-600'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'code'
                ? 'bg-orange-100 text-orange-600'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Code className="w-4 h-4" />
            Code
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'preview'
                ? 'bg-orange-100 text-orange-600'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {viewMode === 'preview' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-2 rounded-lg transition-colors ${
                deviceMode === 'desktop'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-2 rounded-lg transition-colors ${
                deviceMode === 'mobile'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Editor */}
        {(viewMode === 'split' || viewMode === 'code') && (
          <div
            className={`${
              viewMode === 'split' ? 'w-1/2 border-r border-neutral-200' : 'w-full'
            } flex flex-col`}
          >
            <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 text-sm font-medium text-neutral-700">
              Editor
            </div>
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
              placeholder="Enter your content here..."
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
            <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 text-sm font-medium text-neutral-700">
              Preview
            </div>
            <div className="flex-1 overflow-auto p-4 bg-neutral-50">
              <div
                className={`bg-white shadow-lg mx-auto transition-all duration-300 ${
                  deviceMode === 'mobile' ? 'max-w-sm' : 'max-w-full'
                } rounded-lg p-6`}
              >
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Preview"
                  />
                ) : (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
