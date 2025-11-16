'use client';

import { useState } from 'react';
import { ContentSection, ContentBlock, ContentBlockType } from '@/types/page-content';
import {
  Type,
  Image,
  List,
  Quote,
  Code,
  Video,
  Minus,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { ImageUploader } from '../../ImageUploader';

interface ContentEditorProps {
  section: ContentSection;
  onChange: (section: ContentSection) => void;
}

export function ContentEditor({ section, onChange }: ContentEditorProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(
    new Set(section.data.blocks.map((b) => b.id))
  );

  const addBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      order: section.data.blocks.length,
      data: getDefaultBlockData(type),
    };

    onChange({
      ...section,
      data: {
        blocks: [...section.data.blocks, newBlock],
      },
    });

    setExpandedBlocks((prev) => new Set([...prev, newBlock.id]));
  };

  const updateBlock = (blockId: string, data: any) => {
    onChange({
      ...section,
      data: {
        blocks: section.data.blocks.map((block) =>
          block.id === blockId ? { ...block, data } : block
        ),
      },
    });
  };

  const deleteBlock = (blockId: string) => {
    onChange({
      ...section,
      data: {
        blocks: section.data.blocks.filter((block) => block.id !== blockId),
      },
    });
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blocks = [...section.data.blocks];
    const index = blocks.findIndex((b) => b.id === blockId);

    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < blocks.length - 1)
    ) {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];

      onChange({
        ...section,
        data: { blocks },
      });
    }
  };

  const toggleBlockExpanded = (blockId: string) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) {
        next.delete(blockId);
      } else {
        next.add(blockId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Add Block Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
        <span className="text-sm font-medium text-neutral-700 mr-2">Add Block:</span>
        <BlockTypeButton icon={Type} label="Heading" onClick={() => addBlock('heading')} />
        <BlockTypeButton icon={Type} label="Paragraph" onClick={() => addBlock('paragraph')} />
        <BlockTypeButton icon={Image} label="Image" onClick={() => addBlock('image')} />
        <BlockTypeButton icon={List} label="List" onClick={() => addBlock('list')} />
        <BlockTypeButton icon={Quote} label="Quote" onClick={() => addBlock('quote')} />
        <BlockTypeButton icon={Code} label="Code" onClick={() => addBlock('code')} />
        <BlockTypeButton icon={Video} label="Video" onClick={() => addBlock('video')} />
        <BlockTypeButton icon={Minus} label="Divider" onClick={() => addBlock('divider')} />
      </div>

      {/* Content Blocks */}
      {section.data.blocks.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          <p>No content blocks yet. Add one from the toolbar above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {section.data.blocks.map((block, index) => (
            <div
              key={block.id}
              className="border border-neutral-200 rounded-lg bg-white overflow-hidden"
            >
              {/* Block Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 border-b border-neutral-200">
                <button
                  onClick={() => toggleBlockExpanded(block.id)}
                  className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
                >
                  {getBlockIcon(block.type)}
                  <span>{getBlockLabel(block.type)}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveBlock(block.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-neutral-600 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveBlock(block.id, 'down')}
                    disabled={index === section.data.blocks.length - 1}
                    className="p-1 text-neutral-600 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="p-1 text-neutral-600 hover:text-red-600"
                    aria-label="Delete block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Block Content */}
              {expandedBlocks.has(block.id) && (
                <div className="p-4">
                  <BlockEditor block={block} onChange={(data) => updateBlock(block.id, data)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BlockTypeButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-700 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600 transition-colors"
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}

function BlockEditor({ block, onChange }: { block: ContentBlock; onChange: (data: any) => void }) {
  switch (block.type) {
    case 'heading':
      return <HeadingBlockEditor data={block.data as any} onChange={onChange} />;
    case 'paragraph':
      return <ParagraphBlockEditor data={block.data as any} onChange={onChange} />;
    case 'image':
      return <ImageBlockEditor data={block.data as any} onChange={onChange} />;
    case 'list':
      return <ListBlockEditor data={block.data as any} onChange={onChange} />;
    case 'quote':
      return <QuoteBlockEditor data={block.data as any} onChange={onChange} />;
    case 'code':
      return <CodeBlockEditor data={block.data as any} onChange={onChange} />;
    case 'video':
      return <VideoBlockEditor data={block.data as any} onChange={onChange} />;
    case 'divider':
      return <DividerBlockEditor data={block.data as any} onChange={onChange} />;
    default:
      return <div>Unknown block type</div>;
  }
}

function HeadingBlockEditor({ data, onChange }: any) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <select
          value={data.level || 2}
          onChange={(e) => onChange({ ...data, level: parseInt(e.target.value) })}
          className="px-3 py-2 border border-neutral-300 rounded-lg"
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
          <option value={4}>H4</option>
          <option value={5}>H5</option>
          <option value={6}>H6</option>
        </select>

        <select
          value={data.alignment || 'left'}
          onChange={(e) => onChange({ ...data, alignment: e.target.value })}
          className="px-3 py-2 border border-neutral-300 rounded-lg"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      <input
        type="text"
        value={data.text || ''}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Enter heading text"
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
      />
    </div>
  );
}

function ParagraphBlockEditor({ data, onChange }: any) {
  return (
    <div className="space-y-3">
      <select
        value={data.alignment || 'left'}
        onChange={(e) => onChange({ ...data, alignment: e.target.value })}
        className="px-3 py-2 border border-neutral-300 rounded-lg"
      >
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
      </select>

      <textarea
        value={data.text || ''}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        rows={4}
        placeholder="Enter paragraph text"
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
      />
    </div>
  );
}

function ImageBlockEditor({ data, onChange }: any) {
  return (
    <div className="space-y-3">
      {data.image?.url ? (
        <div className="relative">
          <img src={data.image.url} alt={data.alt} className="w-full rounded-lg" />
          <button
            onClick={() => onChange({ ...data, image: undefined })}
            className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded-lg"
          >
            Remove
          </button>
        </div>
      ) : (
        <ImageUploader
          onUpload={(url) => onChange({ ...data, image: { url } })}
          label="Upload Image"
        />
      )}

      <input
        type="text"
        value={data.alt || ''}
        onChange={(e) => onChange({ ...data, alt: e.target.value })}
        placeholder="Alt text (required for accessibility)"
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
      />

      <input
        type="text"
        value={data.caption || ''}
        onChange={(e) => onChange({ ...data, caption: e.target.value })}
        placeholder="Caption (optional)"
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
      />

      <select
        value={data.alignment || 'center'}
        onChange={(e) => onChange({ ...data, alignment: e.target.value })}
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
      >
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
        <option value="wide">Wide</option>
        <option value="full">Full Width</option>
      </select>
    </div>
  );
}

function ListBlockEditor({ data, onChange }: any) {
  const items = data.items || [''];

  const addItem = () => {
    onChange({ ...data, items: [...items, ''] });
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange({ ...data, items: newItems });
  };

  const removeItem = (index: number) => {
    onChange({ ...data, items: items.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <select
        value={data.style || 'bulleted'}
        onChange={(e) => onChange({ ...data, style: e.target.value })}
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
      >
        <option value="bulleted">Bulleted List</option>
        <option value="numbered">Numbered List</option>
      </select>

      {items.map((item: string, index: number) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={`Item ${index + 1}`}
            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg"
          />
          <button
            onClick={() => removeItem(index)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        onClick={addItem}
        className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg"
      >
        <Plus className="w-4 h-4" />
        Add Item
      </button>
    </div>
  );
}

function QuoteBlockEditor({ data, onChange }: any) {
  return (
    <div className="space-y-3">
      <textarea
        value={data.text || ''}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        rows={3}
        placeholder="Enter quote text"
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
      />

      <input
        type="text"
        value={data.author || ''}
        onChange={(e) => onChange({ ...data, author: e.target.value })}
        placeholder="Author name"
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
      />

      <input
        type="text"
        value={data.role || ''}
        onChange={(e) => onChange({ ...data, role: e.target.value })}
        placeholder="Author role or title"
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
      />
    </div>
  );
}

function CodeBlockEditor({ data, onChange }: any) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={data.language || ''}
        onChange={(e) => onChange({ ...data, language: e.target.value })}
        placeholder="Language (e.g., javascript, python)"
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
      />

      <textarea
        value={data.code || ''}
        onChange={(e) => onChange({ ...data, code: e.target.value })}
        rows={6}
        placeholder="Paste your code here"
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono text-sm"
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={data.showLineNumbers || false}
          onChange={(e) => onChange({ ...data, showLineNumbers: e.target.checked })}
          className="rounded"
        />
        <span className="text-sm text-neutral-700">Show line numbers</span>
      </label>
    </div>
  );
}

function VideoBlockEditor({ data, onChange }: any) {
  return (
    <div className="space-y-3">
      <select
        value={data.provider || 'youtube'}
        onChange={(e) => onChange({ ...data, provider: e.target.value })}
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
      >
        <option value="youtube">YouTube</option>
        <option value="vimeo">Vimeo</option>
        <option value="upload">Uploaded Video</option>
      </select>

      <input
        type="text"
        value={data.url || ''}
        onChange={(e) => onChange({ ...data, url: e.target.value })}
        placeholder="Video URL or embed code"
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
      />

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.autoplay || false}
            onChange={(e) => onChange({ ...data, autoplay: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-neutral-700">Autoplay</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.loop || false}
            onChange={(e) => onChange({ ...data, loop: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-neutral-700">Loop</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.controls !== false}
            onChange={(e) => onChange({ ...data, controls: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-neutral-700">Show controls</span>
        </label>
      </div>
    </div>
  );
}

function DividerBlockEditor({ data, onChange }: any) {
  return (
    <div className="space-y-3">
      <select
        value={data.style || 'solid'}
        onChange={(e) => onChange({ ...data, style: e.target.value })}
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
      >
        <option value="solid">Solid</option>
        <option value="dashed">Dashed</option>
        <option value="dotted">Dotted</option>
      </select>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Thickness (px)
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={data.thickness || 1}
          onChange={(e) => onChange({ ...data, thickness: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Color</label>
        <input
          type="color"
          value={data.color || '#e5e5e5'}
          onChange={(e) => onChange({ ...data, color: e.target.value })}
          className="w-full h-10 rounded-lg border border-neutral-300"
        />
      </div>
    </div>
  );
}

function getBlockIcon(type: ContentBlockType) {
  const icons = {
    heading: Type,
    paragraph: Type,
    image: Image,
    list: List,
    quote: Quote,
    code: Code,
    video: Video,
    divider: Minus,
  };
  const Icon = icons[type];
  return <Icon className="w-4 h-4" />;
}

function getBlockLabel(type: ContentBlockType): string {
  const labels = {
    heading: 'Heading',
    paragraph: 'Paragraph',
    image: 'Image',
    list: 'List',
    quote: 'Quote',
    code: 'Code',
    video: 'Video',
    divider: 'Divider',
  };
  return labels[type];
}

function getDefaultBlockData(type: ContentBlockType): any {
  switch (type) {
    case 'heading':
      return { type: 'heading', level: 2, text: '', alignment: 'left' };
    case 'paragraph':
      return { type: 'paragraph', text: '', alignment: 'left' };
    case 'image':
      return { type: 'image', image: undefined, alt: '', alignment: 'center' };
    case 'list':
      return { type: 'list', style: 'bulleted', items: [''] };
    case 'quote':
      return { type: 'quote', text: '' };
    case 'code':
      return { type: 'code', code: '', language: 'javascript', showLineNumbers: true };
    case 'video':
      return { type: 'video', url: '', provider: 'youtube', controls: true };
    case 'divider':
      return { type: 'divider', style: 'solid', thickness: 1, color: '#e5e5e5' };
    default:
      return {};
  }
}
