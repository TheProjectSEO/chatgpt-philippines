export interface Author {
  name: string;
  avatar: string;
  bio: string;
  role?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: 2 | 3; // H2 or H3
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface CalloutBox {
  type: 'info' | 'warning' | 'tip' | 'success';
  title?: string;
  content: string;
}

export interface ContentBlock {
  type: 'text' | 'heading' | 'list' | 'callout' | 'code' | 'image';
  level?: 2 | 3; // For headings
  content: string | string[] | CalloutBox;
  language?: string; // For code blocks
  alt?: string; // For images
}

export interface RelatedPost {
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  readTime: number;
}

export interface PopularTool {
  name: string;
  description: string;
  icon: string;
  url: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: Author;
  publishedDate: string; // ISO format
  updatedDate?: string; // ISO format
  readingTime: number; // in minutes
  featuredImage?: string;
  category: string;
  tags: string[];
  tableOfContents: TableOfContentsItem[];
  content: ContentBlock[];
  faqs: FAQItem[];
  relatedPosts: RelatedPost[];
  popularTools: PopularTool[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
  };
}
