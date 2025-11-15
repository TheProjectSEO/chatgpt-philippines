# WordPress-Style Preview System

Complete architecture for implementing a split-view preview system similar to WordPress.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Edit Page                       │
├──────────────────────────┬──────────────────────────────┤
│                          │                               │
│   WYSIWYG Editor Panel   │    Live Preview Panel        │
│   (Client Component)     │    (iframe)                  │
│                          │                               │
│   - TipTap Editor        │    - Real-time updates       │
│   - Form inputs          │    - Device selector         │
│   - Auto-save            │    - Scroll sync             │
│                          │                               │
│          ↓               │            ↑                  │
│    onChange event  ──────┼───────> postMessage          │
│                          │       (iframe comm)           │
└──────────────────────────┴──────────────────────────────┘
```

## Split-View Layout Component

### `/components/cms/preview/split-view.tsx`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { TipTapEditor } from '../editor/tiptap-editor';
import { PreviewFrame } from './preview-frame';
import { DeviceSelector } from './device-selector';
import { PreviewToolbar } from './preview-toolbar';
import { PageFormData } from '@/lib/cms/types';

interface SplitViewProps {
  pageId?: string;
  initialContent?: any;
  onSave?: (data: PageFormData) => void;
}

export function SplitView({ pageId, initialContent, onSave }: SplitViewProps) {
  const [content, setContent] = useState(initialContent);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [syncScroll, setSyncScroll] = useState(true);
  const [showPreview, setShowPreview] = useState(true);

  const handleContentChange = useCallback((newContent: any) => {
    setContent(newContent);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Toolbar */}
      <PreviewToolbar
        device={device}
        onDeviceChange={setDevice}
        syncScroll={syncScroll}
        onSyncScrollChange={setSyncScroll}
        showPreview={showPreview}
        onShowPreviewChange={setShowPreview}
      />

      {/* Split View Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div
          className={`
            ${showPreview ? 'w-1/2' : 'w-full'}
            border-r border-gray-200 overflow-y-auto transition-all duration-300
          `}
        >
          <div className="p-6">
            <TipTapEditor
              content={content}
              onChange={handleContentChange}
              placeholder="Start writing your content..."
            />
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 bg-gray-100 overflow-hidden">
            <PreviewFrame
              content={content}
              device={device}
              pageId={pageId}
              syncScroll={syncScroll}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

### `/components/cms/preview/preview-frame.tsx`

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { PreviewConfig } from '@/lib/cms/types';

interface PreviewFrameProps {
  content: any;
  device: 'desktop' | 'tablet' | 'mobile';
  pageId?: string;
  syncScroll?: boolean;
}

export function PreviewFrame({
  content,
  device,
  pageId,
  syncScroll = true,
}: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Device dimensions
  const dimensions = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' },
  };

  useEffect(() => {
    if (!iframeRef.current) return;

    // Send updated content to iframe via postMessage
    const iframe = iframeRef.current;
    iframe.addEventListener('load', () => {
      setIsLoading(false);
      updatePreview();
    });

    function updatePreview() {
      if (!iframe.contentWindow) return;

      iframe.contentWindow.postMessage(
        {
          type: 'UPDATE_CONTENT',
          content,
        },
        '*'
      );
    }

    // Update preview when content changes
    if (!isLoading) {
      updatePreview();
    }
  }, [content, isLoading]);

  // Generate preview URL
  const previewUrl = pageId
    ? `/api/admin/pages/${pageId}/preview`
    : `/api/admin/preview`;

  return (
    <div className="h-full flex items-center justify-center p-4">
      {/* Device Frame */}
      <div
        className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
        style={{
          width: dimensions[device].width,
          height: dimensions[device].height,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {/* Device Header (for mobile/tablet) */}
        {device !== 'desktop' && (
          <div className="h-12 bg-gray-900 flex items-center justify-center gap-2">
            <div className="w-16 h-1 bg-gray-700 rounded-full" />
            <div className="w-2 h-2 bg-gray-700 rounded-full" />
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        )}

        {/* iframe */}
        <iframe
          ref={iframeRef}
          src={previewUrl}
          className="w-full h-full border-0"
          title="Preview"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}
```

### `/components/cms/preview/preview-toolbar.tsx`

```typescript
'use client';

import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';

interface PreviewToolbarProps {
  device: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  syncScroll: boolean;
  onSyncScrollChange: (sync: boolean) => void;
  showPreview: boolean;
  onShowPreviewChange: (show: boolean) => void;
}

export function PreviewToolbar({
  device,
  onDeviceChange,
  syncScroll,
  onSyncScrollChange,
  showPreview,
  onShowPreviewChange,
}: PreviewToolbarProps) {
  return (
    <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      {/* Left: Device Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDeviceChange('desktop')}
          className={`
            p-2 rounded-lg transition-colors
            ${device === 'desktop' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}
          `}
          title="Desktop view"
        >
          <Monitor className="w-5 h-5" />
        </button>

        <button
          onClick={() => onDeviceChange('tablet')}
          className={`
            p-2 rounded-lg transition-colors
            ${device === 'tablet' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}
          `}
          title="Tablet view"
        >
          <Tablet className="w-5 h-5" />
        </button>

        <button
          onClick={() => onDeviceChange('mobile')}
          className={`
            p-2 rounded-lg transition-colors
            ${device === 'mobile' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}
          `}
          title="Mobile view"
        >
          <Smartphone className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <span className="text-sm text-gray-600 font-medium">
          {device === 'desktop' && 'Desktop'}
          {device === 'tablet' && 'Tablet (768px)'}
          {device === 'mobile' && 'Mobile (375px)'}
        </span>
      </div>

      {/* Right: Preview Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSyncScrollChange(!syncScroll)}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${syncScroll ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
          `}
          title="Sync scroll between editor and preview"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={() => onShowPreviewChange(!showPreview)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Show Preview
            </>
          )}
        </button>
      </div>
    </div>
  );
}
```

## Preview API Route

### `/app/api/admin/pages/[id]/preview/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { pageService } from '@/lib/cms/services/page.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch page data
    const result = await pageService.getPageById(id);

    if (!result.success || !result.data) {
      return new NextResponse('Page not found', { status: 404 });
    }

    const page = result.data;

    // Generate preview HTML
    const html = generatePreviewHTML(page);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Preview error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function generatePreviewHTML(page: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview: ${page.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  <div id="preview-content" class="max-w-4xl mx-auto p-6 prose prose-lg">
    ${renderContent(page.content)}
  </div>

  <script>
    // Listen for content updates from parent window
    window.addEventListener('message', (event) => {
      if (event.data.type === 'UPDATE_CONTENT') {
        const contentEl = document.getElementById('preview-content');
        if (contentEl) {
          contentEl.innerHTML = renderContent(event.data.content);
        }
      }
    });

    function renderContent(content) {
      // Convert TipTap JSON to HTML
      // This is a simplified version - use proper rendering logic
      if (!content) return '';

      let html = '';

      if (content.hero) {
        html += \`
          <div class="hero mb-8">
            <h1 class="text-4xl font-bold mb-4">\${content.hero.title}</h1>
            <p class="text-xl text-gray-600">\${content.hero.subtitle || ''}</p>
          </div>
        \`;
      }

      // Render sections
      if (content.sections) {
        content.sections.forEach(section => {
          html += renderSection(section);
        });
      }

      return html;
    }

    function renderSection(section) {
      // Implement section rendering logic
      return \`<div class="section mb-6">\${JSON.stringify(section)}</div>\`;
    }
  </script>
</body>
</html>
  `;
}

function renderContent(content: any): string {
  if (!content) return '';

  let html = '';

  if (content.hero) {
    html += `
      <div class="hero mb-8">
        <h1 class="text-4xl font-bold mb-4">${content.hero.title}</h1>
        ${content.hero.subtitle ? `<p class="text-xl text-gray-600">${content.hero.subtitle}</p>` : ''}
      </div>
    `;
  }

  return html;
}
```

## Real-time Collaboration (Optional)

For advanced use cases, implement real-time collaboration using WebSockets:

```typescript
// /lib/cms/hooks/use-collaboration.ts
'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useCollaboration(pageId: string) {
  const [socket, setSocket] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      query: { pageId },
    });

    newSocket.on('active-users', (users: string[]) => {
      setActiveUsers(users);
    });

    newSocket.on('content-update', (data: any) => {
      // Handle real-time content updates from other users
      console.log('Content updated by another user:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [pageId]);

  const broadcastUpdate = (content: any) => {
    socket?.emit('update-content', { pageId, content });
  };

  return {
    activeUsers,
    broadcastUpdate,
  };
}
```

## Mobile Responsive Preview

Ensure preview works on mobile devices for the admin panel:

```typescript
// Mobile-specific adjustments
<div className="flex flex-col lg:flex-row">
  {/* On mobile, show tabs instead of split view */}
  <div className="lg:hidden">
    <Tabs defaultValue="editor">
      <TabsList>
        <TabsTrigger value="editor">Editor</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="editor">
        <TipTapEditor {...editorProps} />
      </TabsContent>

      <TabsContent value="preview">
        <PreviewFrame {...previewProps} />
      </TabsContent>
    </Tabs>
  </div>

  {/* On desktop, show split view */}
  <div className="hidden lg:flex lg:flex-1">
    <SplitView {...splitViewProps} />
  </div>
</div>
```

## Performance Considerations

1. **Debounced Updates**: Prevent excessive iframe refreshes
```typescript
const debouncedUpdate = useMemo(
  () => debounce((content) => updatePreview(content), 500),
  []
);
```

2. **Virtual Scrolling**: For long content
```typescript
import { FixedSizeList } from 'react-window';
```

3. **Lazy Loading**: Load preview only when visible
```typescript
const [showPreview, setShowPreview] = useState(false);

useEffect(() => {
  if (showPreview && !previewLoaded) {
    loadPreview();
  }
}, [showPreview]);
```
