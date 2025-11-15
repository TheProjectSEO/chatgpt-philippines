/**
 * Schema Markup Component
 *
 * Renders JSON-LD structured data for SEO.
 * This component should be used in page layouts or components
 * to inject schema markup into the page head.
 */

import { SchemaMarkup as SchemaMarkupType } from '@/lib/seo/types';

interface SchemaMarkupProps {
  schema: SchemaMarkupType | SchemaMarkupType[] | string;
  id?: string;
}

export default function SchemaMarkup({ schema, id }: SchemaMarkupProps) {
  // If schema is already a string, use it directly
  const schemaString = typeof schema === 'string'
    ? schema
    : JSON.stringify(schema);

  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: schemaString }}
    />
  );
}

/**
 * Multiple Schema Markup Component
 * For rendering multiple schema types on a single page
 */
interface MultipleSchemaMarkupProps {
  schemas: (SchemaMarkupType | string)[];
}

export function MultipleSchemaMarkup({ schemas }: MultipleSchemaMarkupProps) {
  return (
    <>
      {schemas.map((schema, index) => (
        <SchemaMarkup
          key={`schema-${index}`}
          schema={schema}
          id={`schema-${index}`}
        />
      ))}
    </>
  );
}
