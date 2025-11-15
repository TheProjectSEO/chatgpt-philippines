/**
 * Schema Markup Component
 *
 * Client-side component to inject JSON-LD schema markup into page <head>
 * Renders schema.org structured data for better search engine understanding.
 */

'use client';

import { useEffect } from 'react';

interface SchemaMarkupProps {
  schema: string | object;
  id?: string;
}

/**
 * SchemaMarkup component that safely injects JSON-LD into the document head
 */
export function SchemaMarkup({ schema, id = 'schema-markup' }: SchemaMarkupProps) {
  useEffect(() => {
    // Convert schema to string if it's an object
    const schemaString = typeof schema === 'string' ? schema : JSON.stringify(schema, null, 0);

    // Create script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = schemaString;

    // Add to document head
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById(id);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [schema, id]);

  return null; // This component doesn't render anything
}

/**
 * Server-side Schema Markup component (for Next.js App Router)
 * Use this in server components for better SEO
 */
export function ServerSchemaMarkup({ schema }: { schema: string | object }) {
  const schemaString = typeof schema === 'string' ? schema : JSON.stringify(schema, null, 0);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: schemaString }}
      suppressHydrationWarning
    />
  );
}

export default SchemaMarkup;
