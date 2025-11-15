'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, TrendingUp, Mail, Share2, Sparkles } from 'lucide-react';
import { RelatedPost, PopularTool } from '@/types/blog';

interface BlogSidebarProps {
  relatedPosts?: RelatedPost[];
  popularTools?: PopularTool[];
}

export default function BlogSidebar({
  relatedPosts = [],
  popularTools = [],
}: BlogSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Newsletter Signup */}
      <div className="bg-gradient-to-br from-orange-50 to-purple-50 rounded-xl p-6 border border-orange-200">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="text-orange-600" size={20} />
          <h3 className="text-lg font-semibold text-neutral-900">
            Newsletter
          </h3>
        </div>
        <p className="text-sm text-neutral-600 mb-4">
          Get the latest AI tools and tips delivered to your inbox weekly.
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="w-full btn-primary btn-sm"
          >
            Subscribe
          </button>
        </form>
        <p className="text-xs text-neutral-500 mt-2">
          No spam. Unsubscribe anytime.
        </p>
      </div>

      {/* Social Share */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200">
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="text-orange-600" size={20} />
          <h3 className="text-lg font-semibold text-neutral-900">
            Share Article
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="flex-1 min-w-[100px] px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Facebook
          </button>
          <button className="flex-1 min-w-[100px] px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors">
            Twitter
          </button>
          <button className="flex-1 min-w-[100px] px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
            LinkedIn
          </button>
          <button className="w-full px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-300 transition-colors">
            Copy Link
          </button>
        </div>
      </div>

      {/* Popular Tools */}
      {popularTools.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-orange-600" size={20} />
            <h3 className="text-lg font-semibold text-neutral-900">
              Popular Tools
            </h3>
          </div>
          <div className="space-y-3">
            {popularTools.map((tool, idx) => (
              <Link
                key={idx}
                href={tool.url}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors group"
              >
                <div className="text-2xl flex-shrink-0">{tool.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900 group-hover:text-orange-600 transition-colors">
                    {tool.name}
                  </div>
                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-orange-600" size={20} />
            <h3 className="text-lg font-semibold text-neutral-900">
              Related Articles
            </h3>
          </div>
          <div className="space-y-4">
            {relatedPosts.map((post, idx) => (
              <Link
                key={idx}
                href={`/blog/${post.slug}`}
                className="block group"
              >
                {post.image && (
                  <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                <h4 className="font-semibold text-neutral-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Clock size={14} />
                  <span>{post.readTime} min read</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ad Placeholder */}
      <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200">
        <div className="text-center">
          <div className="text-xs text-neutral-500 mb-2">Advertisement</div>
          <div className="bg-neutral-200 rounded-lg h-64 flex items-center justify-center">
            <span className="text-neutral-400">Ad Space 300x250</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
