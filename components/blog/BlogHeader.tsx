'use client';

import Image from 'next/image';
import { Calendar, Clock, User } from 'lucide-react';
import { Author } from '@/types/blog';

interface BlogHeaderProps {
  title: string;
  author: Author;
  publishedDate: string;
  updatedDate?: string;
  readingTime: number;
  category: string;
}

export default function BlogHeader({
  title,
  author,
  publishedDate,
  updatedDate,
  readingTime,
  category,
}: BlogHeaderProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="mb-8 md:mb-12">
      {/* Category Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
          {category}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
        {title}
      </h1>

      {/* Author & Meta Info */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 pb-6 border-b border-neutral-200">
        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
            {author.avatar ? (
              <Image
                src={author.avatar}
                alt={author.name}
                fill
                className="object-cover"
              />
            ) : (
              <User className="text-orange-600" size={24} />
            )}
          </div>
          <div>
            <div className="font-semibold text-neutral-900">{author.name}</div>
            {author.role && (
              <div className="text-sm text-neutral-600">{author.role}</div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-8 bg-neutral-300" />

        {/* Published Date */}
        <div className="flex items-center gap-2 text-neutral-600">
          <Calendar size={18} />
          <span className="text-sm">{formatDate(publishedDate)}</span>
        </div>

        {/* Reading Time */}
        <div className="flex items-center gap-2 text-neutral-600">
          <Clock size={18} />
          <span className="text-sm">{readingTime} min read</span>
        </div>
      </div>

      {/* Updated Date */}
      {updatedDate && (
        <div className="mt-4 text-sm text-neutral-500">
          Last updated: {formatDate(updatedDate)}
        </div>
      )}

      {/* Author Bio */}
      {author.bio && (
        <div className="mt-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
          <div className="flex items-start gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center flex-shrink-0">
              {author.avatar ? (
                <Image
                  src={author.avatar}
                  alt={author.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="text-orange-600" size={20} />
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-neutral-900 mb-1">
                About {author.name}
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {author.bio}
              </p>
              {author.socialLinks && (
                <div className="flex gap-3 mt-2">
                  {author.socialLinks.twitter && (
                    <a
                      href={author.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Twitter
                    </a>
                  )}
                  {author.socialLinks.linkedin && (
                    <a
                      href={author.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      LinkedIn
                    </a>
                  )}
                  {author.socialLinks.website && (
                    <a
                      href={author.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
