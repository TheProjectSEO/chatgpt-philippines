'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to analytics endpoint
    if (typeof window !== 'undefined') {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType,
          path: window.location.pathname,
        }),
      }).catch((error) => {
        // Silently fail - don't block the app
        console.debug('[Web Vitals] Failed to send metric:', error);
      });
    }
  });

  return null;
}

// Debug utility - expose on window in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).logWebVitals = async () => {
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

    console.log('📊 Web Vitals Monitoring...\n');

    onCLS((metric) => console.log('CLS (Cumulative Layout Shift):', metric));
    onFCP((metric) => console.log('FCP (First Contentful Paint):', metric));
    onLCP((metric) => console.log('LCP (Largest Contentful Paint):', metric));
    onTTFB((metric) => console.log('TTFB (Time to First Byte):', metric));
    onINP((metric) => console.log('INP (Interaction to Next Paint):', metric));
  };
}
