import { MetadataRoute } from 'next';

/**
 * Robots.txt Configuration
 *
 * Controls search engine crawler access to the site
 * Includes sitemap location and crawl directives
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://chatgpt-philippines.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
