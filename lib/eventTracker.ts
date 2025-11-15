/**
 * Event Tracker Utility
 * Privacy-compliant event tracking for user analytics
 * All data is anonymized and no PII is collected
 */

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  const SESSION_KEY = 'analytics_session_id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

// Generate or retrieve visitor ID
function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  const VISITOR_KEY = 'analytics_visitor_id';
  let visitorId = localStorage.getItem(VISITOR_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, visitorId);
  }

  return visitorId;
}

// Track page view
export async function trackPageView(
  pagePath: string,
  pageTitle: string,
  options?: {
    referrer?: string;
    timeOnPage?: number;
    scrollDepth?: number;
  }
): Promise<void> {
  try {
    const sessionId = getSessionId();

    await fetch('/api/analytics/page-views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      },
      body: JSON.stringify({
        pagePath,
        pageTitle,
        referrer: options?.referrer || document.referrer,
        timeOnPage: options?.timeOnPage,
        scrollDepth: options?.scrollDepth,
      }),
    });
  } catch (error) {
    // Silently fail - don't block user experience
    console.debug('[Analytics] Failed to track page view:', error);
  }
}

// Track user event
export async function trackEvent(
  eventType: 'click' | 'form_submit' | 'tool_usage' | 'download' | 'search' | 'share' | 'copy' | 'error',
  eventName: string,
  options?: {
    eventData?: Record<string, any>;
    toolName?: string;
    toolAction?: string;
    inputLength?: number;
    outputLength?: number;
    processingTime?: number;
    success?: boolean;
    errorType?: string;
    modelUsed?: string;
  }
): Promise<void> {
  try {
    const sessionId = getSessionId();

    await fetch('/api/analytics/user-behavior', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      },
      body: JSON.stringify({
        eventType,
        eventName,
        eventData: options?.eventData,
        pagePath: window.location.pathname,
        toolName: options?.toolName,
        toolAction: options?.toolAction,
        inputLength: options?.inputLength,
        outputLength: options?.outputLength,
        processingTime: options?.processingTime,
        success: options?.success,
        errorType: options?.errorType,
        modelUsed: options?.modelUsed,
      }),
    });
  } catch (error) {
    console.debug('[Analytics] Failed to track event:', error);
  }
}

// Track button click
export function trackClick(buttonName: string, buttonContext?: string): void {
  trackEvent('click', buttonName, {
    eventData: buttonContext ? { context: buttonContext } : undefined,
  });
}

// Track form submission
export function trackFormSubmit(formName: string, success: boolean = true): void {
  trackEvent('form_submit', formName, {
    success,
  });
}

// Track tool usage
export function trackToolUsage(
  toolName: string,
  options: {
    action?: string;
    inputLength?: number;
    outputLength?: number;
    processingTime?: number;
    success?: boolean;
    errorType?: string;
    modelUsed?: string;
  } = {}
): void {
  trackEvent('tool_usage', `${toolName}_use`, {
    toolName,
    toolAction: options.action || 'generate',
    inputLength: options.inputLength,
    outputLength: options.outputLength,
    processingTime: options.processingTime,
    success: options.success !== undefined ? options.success : true,
    errorType: options.errorType,
    modelUsed: options.modelUsed,
  });
}

// Track download
export function trackDownload(fileName: string, fileType: string): void {
  trackEvent('download', `download_${fileType}`, {
    eventData: { fileName, fileType },
  });
}

// Track search
export function trackSearch(query: string, resultsCount: number): void {
  trackEvent('search', 'search_performed', {
    eventData: {
      queryLength: query.length,
      resultsCount,
    },
  });
}

// Track share
export function trackShare(platform: string, content: string): void {
  trackEvent('share', `share_${platform}`, {
    eventData: {
      platform,
      contentType: content,
    },
  });
}

// Track copy
export function trackCopy(contentType: string): void {
  trackEvent('copy', `copy_${contentType}`);
}

// Track error
export function trackError(errorName: string, errorType: string, errorMessage?: string): void {
  trackEvent('error', errorName, {
    errorType,
    eventData: errorMessage ? { message: errorMessage } : undefined,
  });
}

/**
 * Page View Tracker Hook
 * Automatically tracks page views, time on page, and scroll depth
 */
export class PageViewTracker {
  private startTime: number;
  private maxScrollDepth: number = 0;
  private scrollListener: (() => void) | null = null;

  constructor(private pagePath: string, private pageTitle: string) {
    this.startTime = Date.now();
    this.initScrollTracking();
    this.trackInitialView();
  }

  private initScrollTracking(): void {
    if (typeof window === 'undefined') return;

    this.scrollListener = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

      if (scrollPercent > this.maxScrollDepth) {
        this.maxScrollDepth = Math.min(scrollPercent, 100);
      }
    };

    window.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  private trackInitialView(): void {
    trackPageView(this.pagePath, this.pageTitle, {
      referrer: document.referrer,
    });
  }

  public destroy(): void {
    if (typeof window === 'undefined') return;

    // Calculate time on page
    const timeOnPage = Math.round((Date.now() - this.startTime) / 1000); // seconds

    // Send final page view with engagement metrics
    trackPageView(this.pagePath, this.pageTitle, {
      timeOnPage,
      scrollDepth: this.maxScrollDepth,
    });

    // Remove scroll listener
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }
}

/**
 * React Hook for Page View Tracking
 * Usage in component:
 *
 * useEffect(() => {
 *   const tracker = new PageViewTracker('/paraphraser', 'Paraphraser Tool');
 *   return () => tracker.destroy();
 * }, []);
 */

/**
 * Automatic Event Tracking
 * Attach data attributes to elements for automatic tracking:
 *
 * <button data-track-click="submit_button" data-track-context="paraphraser">
 *   Submit
 * </button>
 */
if (typeof window !== 'undefined') {
  // Auto-track clicks on elements with data-track-click attribute
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const trackClick = target.getAttribute('data-track-click');

    if (trackClick) {
      const context = target.getAttribute('data-track-context');
      trackEvent('click', trackClick, {
        eventData: context ? { context } : undefined,
      });
    }
  });
}

export default {
  trackPageView,
  trackEvent,
  trackClick,
  trackFormSubmit,
  trackToolUsage,
  trackDownload,
  trackSearch,
  trackShare,
  trackCopy,
  trackError,
  PageViewTracker,
};
