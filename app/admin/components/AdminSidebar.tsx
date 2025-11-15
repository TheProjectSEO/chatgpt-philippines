'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Settings,
  Image,
  HelpCircle,
  BarChart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Pages', href: '/admin/pages', icon: FileText },
  { label: 'SEO', href: '/admin/seo', icon: Settings },
  { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
  { label: 'Media', href: '/admin/media', icon: Image },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-neutral-200">
        <h1 className="text-xl font-bold text-neutral-900">Admin CMS</h1>
      </div>

      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-orange-50 text-orange-600 font-medium'
                  : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-neutral-200">
        <div className="text-xs text-neutral-500 text-center">
          v1.0.0 | Admin Panel
        </div>
      </div>
    </aside>
  );
}
