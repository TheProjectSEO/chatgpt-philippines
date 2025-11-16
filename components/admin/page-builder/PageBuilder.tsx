'use client';

import { useState, useCallback } from 'react';
import {
  PageContent,
  Section,
  SectionType,
  HeroSection,
  ContentSection,
  CTASection,
  FAQSection,
  FeaturesSection,
  TestimonialsSection,
  GallerySection,
} from '@/types/page-content';
import { SectionWrapper } from './SectionWrapper';
import { HeroEditor } from './sections/HeroEditor';
import { ContentEditor } from './sections/ContentEditor';
import { CTAEditor } from './sections/CTAEditor';
import { FAQEditor } from './sections/FAQEditor';
import { FeaturesEditor } from './sections/FeaturesEditor';
import { TestimonialsEditor } from './sections/TestimonialsEditor';
import { GalleryEditor } from './sections/GalleryEditor';
import {
  Plus,
  Save,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Settings,
  Undo,
  Redo,
  X,
} from 'lucide-react';

interface PageBuilderProps {
  initialContent?: PageContent;
  pageTitle: string;
  pageSlug: string;
  onSave: (content: PageContent) => void;
  onCancel: () => void;
}

export function PageBuilder({
  initialContent,
  pageTitle,
  pageSlug,
  onSave,
  onCancel,
}: PageBuilderProps) {
  const [content, setContent] = useState<PageContent>(
    initialContent || {
      version: '1.0',
      sections: [],
    }
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [history, setHistory] = useState<PageContent[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Update history when content changes
  const updateContent = useCallback((newContent: PageContent) => {
    setContent(newContent);
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, newContent];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  const addSection = (type: SectionType) => {
    const newSection = createDefaultSection(type, content.sections.length);
    updateContent({
      ...content,
      sections: [...content.sections, newSection],
    });
    setSelectedSectionId(newSection.id);
    setShowAddMenu(false);
  };

  const updateSection = (id: string, updatedSection: Section) => {
    updateContent({
      ...content,
      sections: content.sections.map((section) =>
        section.id === id ? updatedSection : section
      ),
    });
  };

  const deleteSection = (id: string) => {
    updateContent({
      ...content,
      sections: content.sections.filter((section) => section.id !== id),
    });
    if (selectedSectionId === id) {
      setSelectedSectionId(null);
    }
  };

  const duplicateSection = (id: string) => {
    const sectionToDuplicate = content.sections.find((s) => s.id === id);
    if (!sectionToDuplicate) return;

    const newSection = {
      ...sectionToDuplicate,
      id: `section-${Date.now()}`,
      order: content.sections.length,
    };

    updateContent({
      ...content,
      sections: [...content.sections, newSection],
    });
  };

  const toggleSectionVisibility = (id: string) => {
    updateContent({
      ...content,
      sections: content.sections.map((section) =>
        section.id === id ? { ...section, isVisible: !section.isVisible } : section
      ),
    });
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const sections = [...content.sections];
    const index = sections.findIndex((s) => s.id === id);

    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < sections.length - 1)
    ) {
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];

      // Update order property
      sections.forEach((section, i) => {
        section.order = i;
      });

      updateContent({ ...content, sections });
    }
  };

  const handleSave = () => {
    onSave(content);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">{pageTitle || 'Untitled Page'}</h2>
          <p className="text-sm text-neutral-600">{pageSlug || '/untitled'}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border border-neutral-200 rounded-lg">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-l-lg"
              aria-label="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-r-lg"
              aria-label="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Preview Mode */}
          <div className="flex items-center gap-1 border border-neutral-200 rounded-lg">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 ${
                previewMode === 'desktop'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-neutral-600 hover:bg-neutral-100'
              } rounded-l-lg`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('tablet')}
              className={`p-2 ${
                previewMode === 'tablet'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 ${
                previewMode === 'mobile'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-neutral-600 hover:bg-neutral-100'
              } rounded-r-lg`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showPreview
                ? 'bg-orange-500 text-white'
                : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Save className="w-4 h-4" />
            Save Page
          </button>

          {/* Close Button */}
          <button
            onClick={onCancel}
            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className="flex-1 overflow-y-auto bg-neutral-50 p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Add Section Button */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-600 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Section</span>
              </button>

              {/* Add Section Menu */}
              {showAddMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 p-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <SectionButton label="Hero" onClick={() => addSection('hero')} />
                    <SectionButton label="Content" onClick={() => addSection('content')} />
                    <SectionButton label="CTA" onClick={() => addSection('cta')} />
                    <SectionButton label="FAQ" onClick={() => addSection('faq')} />
                    <SectionButton label="Features" onClick={() => addSection('features')} />
                    <SectionButton
                      label="Testimonials"
                      onClick={() => addSection('testimonials')}
                    />
                    <SectionButton label="Gallery" onClick={() => addSection('gallery')} />
                    <SectionButton label="Stats" onClick={() => addSection('stats')} />
                  </div>
                </div>
              )}
            </div>

            {/* Sections */}
            {content.sections.length === 0 ? (
              <div className="text-center py-16 text-neutral-500">
                <p className="text-lg mb-2">No sections yet</p>
                <p className="text-sm">Click "Add Section" above to start building your page</p>
              </div>
            ) : (
              content.sections.map((section) => (
                <SectionWrapper
                  key={section.id}
                  id={section.id}
                  title={getSectionTitle(section)}
                  isSelected={selectedSectionId === section.id}
                  isVisible={section.isVisible}
                  onSelect={() => setSelectedSectionId(section.id)}
                  onToggleVisibility={() => toggleSectionVisibility(section.id)}
                  onDuplicate={() => duplicateSection(section.id)}
                  onDelete={() => deleteSection(section.id)}
                >
                  {renderSectionEditor(section, (updatedSection) =>
                    updateSection(section.id, updatedSection)
                  )}
                </SectionWrapper>
              ))
            )}
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 border-l border-neutral-200 overflow-y-auto bg-neutral-100 p-6">
            <div
              className={`mx-auto bg-white shadow-lg rounded-lg overflow-hidden transition-all ${
                previewMode === 'mobile'
                  ? 'max-w-sm'
                  : previewMode === 'tablet'
                  ? 'max-w-2xl'
                  : 'max-w-full'
              }`}
            >
              <PreviewContent content={content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-50 hover:bg-orange-50 hover:text-orange-600 border border-neutral-200 rounded-lg transition-colors"
    >
      {label}
    </button>
  );
}

function renderSectionEditor(section: Section, onChange: (section: Section) => void) {
  switch (section.type) {
    case 'hero':
      return <HeroEditor section={section as HeroSection} onChange={onChange} />;
    case 'content':
      return <ContentEditor section={section as ContentSection} onChange={onChange} />;
    case 'cta':
      return <CTAEditor section={section as CTASection} onChange={onChange} />;
    case 'faq':
      return <FAQEditor section={section as FAQSection} onChange={onChange} />;
    case 'features':
      return <FeaturesEditor section={section as FeaturesSection} onChange={onChange} />;
    case 'testimonials':
      return (
        <TestimonialsEditor section={section as TestimonialsSection} onChange={onChange} />
      );
    case 'gallery':
      return <GalleryEditor section={section as GallerySection} onChange={onChange} />;
    default:
      return <div>Editor for {section.type} not implemented yet</div>;
  }
}

function getSectionTitle(section: Section): string {
  const titles: Record<SectionType, string> = {
    hero: 'Hero Section',
    content: 'Content Block',
    cta: 'Call-to-Action',
    faq: 'FAQ',
    features: 'Features',
    testimonials: 'Testimonials',
    gallery: 'Gallery',
    stats: 'Stats',
    team: 'Team',
    pricing: 'Pricing',
    newsletter: 'Newsletter',
    contact: 'Contact',
  };
  return titles[section.type] || section.type;
}

function createDefaultSection(type: SectionType, order: number): Section {
  const baseSection = {
    id: `section-${Date.now()}`,
    type,
    order,
    isVisible: true,
    settings: {
      paddingTop: 'md' as const,
      paddingBottom: 'md' as const,
      containerWidth: 'medium' as const,
    },
  };

  switch (type) {
    case 'hero':
      return {
        ...baseSection,
        type: 'hero',
        data: {
          headline: '',
          alignment: 'center',
        },
      };
    case 'content':
      return {
        ...baseSection,
        type: 'content',
        data: {
          blocks: [],
        },
      };
    case 'cta':
      return {
        ...baseSection,
        type: 'cta',
        data: {
          title: '',
          ctaPrimary: { text: '', url: '', variant: 'primary' },
          layout: 'centered',
        },
      };
    case 'faq':
      return {
        ...baseSection,
        type: 'faq',
        data: {
          items: [],
          layout: 'accordion',
          enableSchema: true,
        },
      };
    case 'features':
      return {
        ...baseSection,
        type: 'features',
        data: {
          items: [],
          layout: 'grid',
          columns: 3,
        },
      };
    case 'testimonials':
      return {
        ...baseSection,
        type: 'testimonials',
        data: {
          items: [],
          layout: 'grid',
        },
      };
    case 'gallery':
      return {
        ...baseSection,
        type: 'gallery',
        data: {
          items: [],
          layout: 'grid',
          columns: 3,
        },
      };
    default:
      return baseSection as any;
  }
}

function PreviewContent({ content }: { content: PageContent }) {
  return (
    <div className="p-6 space-y-8">
      {content.sections.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p>Preview will appear here</p>
        </div>
      ) : (
        content.sections
          .filter((section) => section.isVisible)
          .map((section) => (
            <div key={section.id} className="border-b border-neutral-100 pb-8 last:border-0">
              <div className="text-xs font-semibold text-neutral-400 mb-3">
                {getSectionTitle(section)}
              </div>
              <PreviewSection section={section} />
            </div>
          ))
      )}
    </div>
  );
}

function PreviewSection({ section }: { section: Section }) {
  switch (section.type) {
    case 'hero':
      return <PreviewHero section={section as HeroSection} />;
    case 'content':
      return <PreviewContentSection section={section as ContentSection} />;
    case 'cta':
      return <PreviewCTA section={section as CTASection} />;
    case 'faq':
      return <PreviewFAQ section={section as FAQSection} />;
    case 'features':
      return <PreviewFeatures section={section as FeaturesSection} />;
    case 'testimonials':
      return <PreviewTestimonials section={section as TestimonialsSection} />;
    case 'gallery':
      return <PreviewGallery section={section as GallerySection} />;
    default:
      return <div className="text-neutral-400 text-sm">Preview not available</div>;
  }
}

function PreviewHero({ section }: { section: HeroSection }) {
  return (
    <div className={`text-${section.data.alignment}`}>
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
        {section.data.headline || 'Headline'}
      </h1>
      {section.data.subheadline && (
        <p className="text-xl text-neutral-600 mb-4">{section.data.subheadline}</p>
      )}
      {section.data.description && (
        <p className="text-neutral-600 mb-6">{section.data.description}</p>
      )}
      <div className="flex gap-3 justify-center">
        {section.data.ctaPrimary && (
          <button className="px-6 py-3 bg-orange-500 text-white rounded-lg">
            {section.data.ctaPrimary.text}
          </button>
        )}
        {section.data.ctaSecondary && (
          <button className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg">
            {section.data.ctaSecondary.text}
          </button>
        )}
      </div>
    </div>
  );
}

function PreviewContentSection({ section }: { section: ContentSection }) {
  return (
    <div className="space-y-4">
      {section.data.blocks.map((block) => (
        <div key={block.id} className="text-neutral-800">
          {block.type === 'heading' && (
            <h2 className="text-2xl font-bold">{(block.data as any).text}</h2>
          )}
          {block.type === 'paragraph' && <p>{(block.data as any).text}</p>}
          {block.type === 'image' && (block.data as any).image?.url && (
            <img
              src={(block.data as any).image.url}
              alt={(block.data as any).alt}
              className="rounded"
            />
          )}
        </div>
      ))}
    </div>
  );
}

function PreviewCTA({ section }: { section: CTASection }) {
  return (
    <div className="text-center p-8 bg-neutral-50 rounded-lg">
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">{section.data.title}</h2>
      {section.data.description && (
        <p className="text-neutral-600 mb-4">{section.data.description}</p>
      )}
      <button className="px-6 py-3 bg-orange-500 text-white rounded-lg">
        {section.data.ctaPrimary.text}
      </button>
    </div>
  );
}

function PreviewFAQ({ section }: { section: FAQSection }) {
  return (
    <div className="space-y-3">
      {section.data.title && (
        <h2 className="text-2xl font-bold text-neutral-900">{section.data.title}</h2>
      )}
      {section.data.items.map((item) => (
        <div key={item.id} className="border border-neutral-200 rounded-lg p-4">
          <p className="font-semibold text-neutral-900">{item.question}</p>
          <p className="text-neutral-600 mt-2">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}

function PreviewFeatures({ section }: { section: FeaturesSection }) {
  return (
    <div className="space-y-4">
      {section.data.title && (
        <h2 className="text-2xl font-bold text-neutral-900">{section.data.title}</h2>
      )}
      <div className={`grid grid-cols-${section.data.columns} gap-4`}>
        {section.data.items.map((item) => (
          <div key={item.id} className="p-4 border border-neutral-200 rounded-lg">
            <h3 className="font-semibold text-neutral-900">{item.title}</h3>
            <p className="text-sm text-neutral-600 mt-1">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewTestimonials({ section }: { section: TestimonialsSection }) {
  return (
    <div className="space-y-4">
      {section.data.title && (
        <h2 className="text-2xl font-bold text-neutral-900">{section.data.title}</h2>
      )}
      <div className="grid gap-4">
        {section.data.items.map((item) => (
          <div key={item.id} className="p-4 bg-neutral-50 rounded-lg">
            <p className="text-neutral-700 italic">"{item.quote}"</p>
            <p className="text-sm font-semibold text-neutral-900 mt-2">{item.author}</p>
            {item.role && <p className="text-sm text-neutral-600">{item.role}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewGallery({ section }: { section: GallerySection }) {
  return (
    <div className="space-y-4">
      {section.data.title && (
        <h2 className="text-2xl font-bold text-neutral-900">{section.data.title}</h2>
      )}
      <div className={`grid grid-cols-${section.data.columns} gap-4`}>
        {section.data.items.map((item) => (
          <div key={item.id}>
            {item.image.url && (
              <img src={item.image.url} alt={item.caption || ''} className="rounded" />
            )}
            {item.caption && <p className="text-sm text-neutral-600 mt-1">{item.caption}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
