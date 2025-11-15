import { MetadataRoute } from 'next';
import { getAllToolPaths } from '@/lib/seo/tool-metadata';

/**
 * Dynamic Sitemap Generator
 *
 * Automatically generates sitemap.xml with all pages
 * Updates: Every time the site is rebuilt
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://chatgpt-philippines.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic tool pages
  const toolPaths = getAllToolPaths();
  const toolPages: MetadataRoute.Sitemap = toolPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages];
}
