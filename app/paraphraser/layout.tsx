import { Metadata } from 'next';
import { getToolMetadata, getToolFAQs } from '@/lib/seo/tool-metadata';
import { generateFAQPageSchema } from '@/lib/seo';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata: Metadata = getToolMetadata('paraphraser');

export default function ParaphraserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqs = getToolFAQs('paraphraser');

  return (
    <>
      {faqs && faqs.length > 0 && (
        <SchemaMarkup
          schema={generateFAQPageSchema(faqs)}
          id="paraphraser-faq-schema"
        />
      )}
      {children}
    </>
  );
}
