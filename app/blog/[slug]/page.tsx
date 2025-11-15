'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import BlogHeader from '@/components/blog/BlogHeader';
import TableOfContents from '@/components/blog/TableOfContents';
import CalloutBox from '@/components/blog/CalloutBox';
import FAQSection from '@/components/blog/FAQSection';
import BlogSidebar from '@/components/blog/BlogSidebar';
import ProgressBar from '@/components/blog/ProgressBar';
import { BlogPost, ContentBlock, CalloutBox as CalloutBoxType } from '@/types/blog';

// Import blog posts (in a real app, this would come from an API or database)
import examplePost from '@/data/blog-posts/example-post.json';

// Type assertion for imported JSON
const blogPosts: Record<string, BlogPost> = {
  'how-to-use-ai-tools-for-content-creation-2025': examplePost as BlogPost,
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Post Not Found
          </h1>
          <p className="text-neutral-600 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
        const headingClasses =
          block.level === 2
            ? 'text-2xl md:text-3xl font-bold text-neutral-900 mt-12 mb-6'
            : 'text-xl md:text-2xl font-semibold text-neutral-900 mt-8 mb-4';

        // Create ID from heading content
        const headingId = typeof block.content === 'string'
          ? block.content.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          : `heading-${index}`;

        return (
          <HeadingTag key={index} id={headingId} className={headingClasses}>
            {block.content as string}
          </HeadingTag>
        );

      case 'text':
        return (
          <p
            key={index}
            className="text-base md:text-lg text-neutral-700 leading-relaxed mb-6"
          >
            {block.content as string}
          </p>
        );

      case 'list':
        const items = Array.isArray(block.content) ? block.content : [block.content];
        return (
          <ul key={index} className="list-disc list-inside space-y-3 mb-6 ml-4">
            {items.map((item, idx) => (
              <li key={idx} className="text-base md:text-lg text-neutral-700 leading-relaxed">
                {String(item)}
              </li>
            ))}
          </ul>
        );

      case 'callout':
        const callout = block.content as CalloutBoxType;
        return (
          <CalloutBox
            key={index}
            type={callout.type}
            title={callout.title}
            content={callout.content}
          />
        );

      case 'code':
        return (
          <div key={index} className="my-6">
            <div className="bg-neutral-900 text-white rounded-xl p-6 overflow-x-auto">
              <div className="text-xs text-neutral-400 mb-2">
                {block.language || 'code'}
              </div>
              <pre className="text-sm font-mono">
                <code>{block.content as string}</code>
              </pre>
            </div>
          </div>
        );

      case 'image':
        return (
          <div key={index} className="my-8">
            <div className="relative w-full h-96 rounded-xl overflow-hidden">
              <Image
                src={block.content as string}
                alt={block.alt || 'Blog image'}
                fill
                className="object-cover"
              />
            </div>
            {block.alt && (
              <p className="text-sm text-neutral-500 text-center mt-2">
                {block.alt}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <ProgressBar />

      {/* Hero Section with Featured Image */}
      {post.featuredImage && (
        <section className="relative h-96 bg-gradient-to-br from-orange-50 via-white to-purple-50">
          <div className="absolute inset-0">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover opacity-20"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
        </section>
      )}

      {/* Breadcrumb */}
      <section className="border-b border-neutral-200 bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl py-4">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Link href="/" className="hover:text-orange-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} />
            <Link href="/blog" className="hover:text-orange-600 transition-colors">
              Blog
            </Link>
            <ChevronRight size={16} />
            <span className="text-neutral-800 font-medium truncate">
              {post.title}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Main Article */}
            <article className="lg:col-span-8">
              {/* Back Button */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-neutral-600 hover:text-orange-600 transition-colors mb-6"
              >
                <ArrowLeft size={20} />
                <span>Back to Blog</span>
              </Link>

              {/* Header */}
              <BlogHeader
                title={post.title}
                author={post.author}
                publishedDate={post.publishedDate}
                updatedDate={post.updatedDate}
                readingTime={post.readingTime}
                category={post.category}
              />

              {/* Featured Image (if not already shown in hero) */}
              {!post.featuredImage && post.featuredImage && (
                <div className="relative w-full h-96 rounded-xl overflow-hidden mb-8">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                {post.content.map((block, index) =>
                  renderContentBlock(block, index)
                )}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-neutral-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-neutral-700">
                      Tags:
                    </span>
                    {post.tags.map((tag, idx) => (
                      <Link
                        key={idx}
                        href={`/blog/tag/${tag.toLowerCase()}`}
                        className="text-sm px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full hover:bg-orange-100 hover:text-orange-700 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              <FAQSection faqs={post.faqs} />

              {/* CTA Section */}
              <div className="mt-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-white text-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to Try These AI Tools?
                </h3>
                <p className="text-lg text-orange-50 mb-6 max-w-2xl mx-auto">
                  Start creating amazing content with our free AI-powered tools designed for Filipino users.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/chat"
                    className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    Start Using AI Tools
                  </Link>
                  <Link
                    href="/translator"
                    className="inline-flex items-center justify-center gap-2 bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-800 transition-all duration-200 shadow-lg"
                  >
                    Try Translator
                  </Link>
                </div>
              </div>

              {/* Ad Placeholder */}
              <div className="mt-12 bg-neutral-100 rounded-xl p-6 border border-neutral-200">
                <div className="text-center">
                  <div className="text-xs text-neutral-500 mb-2">
                    Advertisement
                  </div>
                  <div className="bg-neutral-200 rounded-lg h-32 flex items-center justify-center">
                    <span className="text-neutral-400">Ad Space 728x90</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-6">
                <TableOfContents items={post.tableOfContents} />
                <BlogSidebar
                  relatedPosts={post.relatedPosts}
                  popularTools={post.popularTools}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: post.featuredImage || post.seo.ogImage,
            datePublished: post.publishedDate,
            dateModified: post.updatedDate || post.publishedDate,
            author: {
              '@type': 'Person',
              name: post.author.name,
              url: post.author.socialLinks?.website,
            },
            publisher: {
              '@type': 'Organization',
              name: 'ChatGPT Philippines',
              logo: {
                '@type': 'ImageObject',
                url: 'https://chatgpt-philippines.com/logo.png',
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://chatgpt-philippines.com/blog/${post.slug}`,
            },
          }),
        }}
      />

      {/* FAQ Schema */}
      {post.faqs && post.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: post.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      )}
    </div>
  );
}
