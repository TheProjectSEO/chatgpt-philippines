## TipTap WYSIWYG Editor Integration

Comprehensive guide for integrating TipTap editor into the CMS for WordPress-like editing experience.

## Installation

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-text-align @tiptap/extension-color @tiptap/extension-highlight
```

## TipTap Editor Component

### `/components/cms/editor/tiptap-editor.tsx`

```typescript
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { EditorToolbar } from './toolbar';
import { BubbleMenu } from './bubble-menu';
import { SlashCommands } from './slash-commands';
import { useCallback } from 'react';

interface TipTapEditorProps {
  content?: any;
  onChange?: (content: any) => void;
  placeholder?: string;
  editable?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  onImageUpload,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      TextStyle,
      Highlight.configure({
        multicolor: true,
      }),
      // Custom extensions
      SlashCommands,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none min-h-[500px] p-6',
      },
    },
  });

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // Upload image and get URL
        const url = onImageUpload
          ? await onImageUpload(file)
          : URL.createObjectURL(file);

        // Insert image into editor
        editor?.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Failed to upload image');
      }
    };

    input.click();
  }, [editor, onImageUpload]);

  if (!editor) {
    return <div className="h-[500px] animate-pulse bg-gray-100 rounded-lg" />;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <EditorToolbar
        editor={editor}
        onImageUpload={handleImageUpload}
      />

      {/* Bubble Menu (floating toolbar on text selection) */}
      <BubbleMenu editor={editor} />

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} />
      </div>

      {/* Character Count */}
      <div className="border-t border-gray-200 px-6 py-2 text-sm text-gray-500 flex justify-between items-center">
        <span>
          {editor.storage.characterCount?.characters() || 0} characters
        </span>
        <span>
          {editor.storage.characterCount?.words() || 0} words
        </span>
      </div>
    </div>
  );
}
```

### `/components/cms/editor/toolbar.tsx`

```typescript
'use client';

import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor;
  onImageUpload: () => void;
}

export function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded hover:bg-gray-100 transition-colors
        ${active ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-gray-300 mx-1" />
  );

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border-b border-gray-200 p-2 flex items-center gap-1 overflow-x-auto sticky top-0 bg-white z-10">
      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive('code')}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Media & Links */}
      <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Add Link">
        <Link className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton onClick={onImageUpload} title="Insert Image">
        <ImageIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
}
```

### `/components/cms/editor/bubble-menu.tsx`

```typescript
'use client';

import { BubbleMenu as TipTapBubbleMenu } from '@tiptap/react';
import { Editor } from '@tiptap/react';
import { Bold, Italic, Strikethrough, Link as LinkIcon } from 'lucide-react';

interface BubbleMenuProps {
  editor: Editor;
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  return (
    <TipTapBubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      className="bg-gray-900 text-white rounded-lg shadow-lg flex items-center gap-1 p-1"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-700 ${
          editor.isActive('bold') ? 'bg-gray-700' : ''
        }`}
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-700 ${
          editor.isActive('italic') ? 'bg-gray-700' : ''
        }`}
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-700 ${
          editor.isActive('strike') ? 'bg-gray-700' : ''
        }`}
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-700 mx-1" />

      <button
        onClick={() => {
          const url = window.prompt('URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`p-2 rounded hover:bg-gray-700 ${
          editor.isActive('link') ? 'bg-gray-700' : ''
        }`}
      >
        <LinkIcon className="w-4 h-4" />
      </button>
    </TipTapBubbleMenu>
  );
}
```

### Custom Slash Commands Extension

```typescript
// /components/cms/editor/extensions/slash-commands.ts
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
```

## Auto-Save Implementation

```typescript
// /lib/cms/hooks/use-autosave.ts
'use client';

import { useEffect, useRef } from 'react';
import { debounce } from 'lodash';

export function useAutoSave(
  data: any,
  onSave: (data: any) => Promise<void>,
  delay: number = 3000
) {
  const saveRef = useRef(
    debounce(async (dataToSave: any) => {
      try {
        await onSave(dataToSave);
        console.log('Auto-saved at', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, delay)
  );

  useEffect(() => {
    if (data) {
      saveRef.current(data);
    }
  }, [data]);

  // Cleanup
  useEffect(() => {
    return () => {
      saveRef.current.cancel();
    };
  }, []);
}

// Usage in page form:
const { mutateAsync: saveRevision } = useMutation({
  mutationFn: (content) => createRevisionAction(pageId, content),
});

useAutoSave(editorContent, async (content) => {
  await saveRevision({ content, is_auto_save: true });
}, 5000); // Auto-save every 5 seconds
```

## Content Serialization

```typescript
// /lib/cms/utils/content-serializer.ts

/**
 * Convert TipTap JSON to HTML
 */
export function tiptapToHTML(json: any): string {
  const { generateHTML } = require('@tiptap/html');
  const StarterKit = require('@tiptap/starter-kit').default;

  return generateHTML(json, [StarterKit, /* other extensions */]);
}

/**
 * Convert HTML to TipTap JSON
 */
export function htmlToTiptap(html: string): any {
  const { generateJSON } = require('@tiptap/html');
  const StarterKit = require('@tiptap/starter-kit').default;

  return generateJSON(html, [StarterKit, /* other extensions */]);
}
```

## Keyboard Shortcuts

TipTap comes with built-in keyboard shortcuts:

- **Bold**: Ctrl/Cmd + B
- **Italic**: Ctrl/Cmd + I
- **Underline**: Ctrl/Cmd + U
- **Undo**: Ctrl/Cmd + Z
- **Redo**: Ctrl/Cmd + Shift + Z
- **Link**: Ctrl/Cmd + K
- **Code**: Ctrl/Cmd + E

## Performance Optimizations

1. **Lazy Loading**: Load editor only when needed
```typescript
const TipTapEditor = dynamic(() => import('./tiptap-editor'), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});
```

2. **Debounced Updates**: Prevent excessive re-renders
```typescript
const debouncedOnChange = useMemo(
  () => debounce((content) => onChange(content), 300),
  [onChange]
);
```

3. **Image Optimization**: Compress images before upload
```typescript
async function compressImage(file: File): Promise<File> {
  // Use browser-image-compression or similar library
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
  });
  return compressed;
}
```
