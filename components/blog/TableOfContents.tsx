'use client';

import { useState, useEffect } from 'react';
import { List, X } from 'lucide-react';
import { TableOfContentsItem } from '@/types/blog';

interface TableOfContentsProps {
  items: TableOfContentsItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
      >
        {isOpen ? <X size={24} /> : <List size={24} />}
      </button>

      {/* Mobile Drawer */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Table of Contents
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <X size={20} />
                </button>
              </div>
              <nav>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => scrollToSection(item.id)}
                        className={`block w-full text-left py-2 px-3 rounded-lg transition-colors ${
                          item.level === 3 ? 'pl-6 text-sm' : 'text-base'
                        } ${
                          activeId === item.id
                            ? 'bg-orange-100 text-orange-700 font-medium'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sticky Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <List size={20} className="text-orange-600" />
              <h3 className="text-lg font-semibold text-neutral-900">
                Table of Contents
              </h3>
            </div>
            <nav>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className={`block w-full text-left py-2 px-3 rounded-lg transition-colors ${
                        item.level === 3 ? 'pl-6 text-sm' : 'text-sm'
                      } ${
                        activeId === item.id
                          ? 'bg-orange-100 text-orange-700 font-medium'
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                      }`}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
