# Analytics Implementation Guide

## Overview

This guide provides instructions for integrating the Advanced Analytics dashboard into your application. The analytics system tracks Web Vitals, page views, user behavior, and tool usage while maintaining user privacy.

## Table of Contents

1. [Database Setup](#database-setup)
2. [API Routes](#api-routes)
3. [Analytics Dashboard](#analytics-dashboard)
4. [Event Tracking](#event-tracking)
5. [Privacy & Compliance](#privacy--compliance)
6. [Usage Examples](#usage-examples)

---

## Database Setup

### 1. Run the Analytics Migration

Execute the analytics schema migration to create all required tables:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the migration file
psql -h your-db-host -U your-user -d your-db -f supabase/migrations/20251116000000_create_analytics_tables.sql
```

### 2. Tables Created

The migration creates the following tables:

- **web_vitals**: Core Web Vitals metrics (LCP, FCP, CLS, INP, TTFB)
- **page_views**: Page view tracking with engagement metrics
- **user_events**: User interaction events (clicks, form submissions, etc.)
- **tool_usage_analytics**: Tool-specific usage and performance metrics
- **analytics_summary_daily**: Daily aggregated analytics for performance

### 3. Helper Functions

The migration also creates PostgreSQL functions for data aggregation:

- `get_web_vitals_summary(start_date, end_date, metric_filter)`
- `get_page_views_by_path(start_date, end_date, limit_count)`
- `get_tool_usage_stats(start_date, end_date, limit_count)`
- `get_user_funnel(start_date, end_date)`

---

## API Routes

### Created API Routes

The following API routes have been created:

#### 1. Web Vitals API
**Path**: `/app/api/analytics/web-vitals/route.ts`

**Methods**:
- `GET` - Retrieve web vitals data with filtering
- `POST` - Submit web vitals metrics

**Query Parameters (GET)**:
- `startDate` - Filter by start date
- `endDate` - Filter by end date
- `metric` - Filter by metric name (LCP, FCP, CLS, INP, TTFB)
- `path` - Filter by page path

**Usage**:
```typescript
// Automatically tracked via app/web-vitals.tsx
// No manual implementation needed
```

#### 2. Page Views API
**Path**: `/app/api/analytics/page-views/route.ts`

**Methods**:
- `GET` - Retrieve page view data
- `POST` - Track page view

**Query Parameters (GET)**:
- `startDate`, `endDate`, `path` - Filters
- `groupBy` - Aggregate by 'path', 'device', or 'browser'

#### 3. User Behavior API
**Path**: `/app/api/analytics/user-behavior/route.ts`

**Methods**:
- `GET` - Retrieve user events or tool usage
- `POST` - Track user event

**Query Parameters (GET)**:
- `type` - 'events' or 'tools'
- `startDate`, `endDate`, `eventType`, `path` - Filters

#### 4. Dashboard API
**Path**: `/app/api/analytics/dashboard/route.ts`

**Methods**:
- `GET` - Get aggregated dashboard data

**Returns**:
- Summary metrics
- Web Vitals data
- Top pages
- Top tools
- User funnel
- Daily trends
- Device/browser breakdown

---

## Analytics Dashboard

### Accessing the Dashboard

The analytics dashboard is available at:

```
/admin/analytics
```

**Path**: `/app/admin/analytics/page.tsx`

### Features

1. **Summary Cards**: Total page views, unique visitors, tool usage, total events
2. **Daily Activity Trends**: Line chart showing page views and tool usage over time
3. **Web Vitals Performance**: Bar charts for metric values and rating distribution
4. **Top Pages**: Most viewed pages with engagement metrics
5. **Most Used Tools**: Tool usage statistics
6. **Device & Browser Breakdown**: Pie/doughnut charts
7. **Data Tables**: Detailed metrics for pages and tools

### Date Range Filtering

Use the date range selectors at the top to filter data:
- Default: Last 30 days
- Custom range supported

---

## Event Tracking

### Event Tracker Utility

**Path**: `/lib/eventTracker.ts`

### Available Tracking Functions

#### 1. Track Page View

```typescript
import { trackPageView } from '@/lib/eventTracker';

trackPageView('/paraphraser', 'Paraphraser Tool', {
  referrer: document.referrer,
  timeOnPage: 120, // seconds
  scrollDepth: 75, // percentage
});
```

#### 2. Track Button Click

```typescript
import { trackClick } from '@/lib/eventTracker';

trackClick('submit_button', 'paraphraser_page');
```

#### 3. Track Form Submission

```typescript
import { trackFormSubmit } from '@/lib/eventTracker';

trackFormSubmit('contact_form', true); // true = success
```

#### 4. Track Tool Usage

```typescript
import { trackToolUsage } from '@/lib/eventTracker';

const startTime = Date.now();
// ... tool execution ...
const processingTime = Date.now() - startTime;

trackToolUsage('paraphraser', {
  action: 'generate',
  inputLength: inputText.length,
  outputLength: outputText.length,
  processingTime,
  success: true,
  modelUsed: 'claude-3-sonnet',
});
```

#### 5. Track Download

```typescript
import { trackDownload } from '@/lib/eventTracker';

trackDownload('report.pdf', 'pdf');
```

#### 6. Track Search

```typescript
import { trackSearch } from '@/lib/eventTracker';

trackSearch(query, resultsCount);
```

#### 7. Track Share

```typescript
import { trackShare } from '@/lib/eventTracker';

trackShare('twitter', 'paraphrased_text');
```

#### 8. Track Copy

```typescript
import { trackCopy } from '@/lib/eventTracker';

trackCopy('paraphrased_text');
```

#### 9. Track Error

```typescript
import { trackError } from '@/lib/eventTracker';

trackError('api_error', 'network_error', 'Connection timeout');
```

### Automatic Page View Tracking

Use the `PageViewTracker` class for automatic tracking:

```typescript
import { PageViewTracker } from '@/lib/eventTracker';
import { useEffect } from 'react';

export default function MyPage() {
  useEffect(() => {
    const tracker = new PageViewTracker(
      window.location.pathname,
      document.title
    );

    return () => tracker.destroy();
  }, []);

  return <div>Your page content</div>;
}
```

### Declarative Tracking with Data Attributes

Add tracking to any element:

```tsx
<button
  data-track-click="submit_button"
  data-track-context="paraphraser"
  onClick={handleSubmit}
>
  Submit
</button>
```

---

## Privacy & Compliance

### Privacy Features

1. **Anonymous Identifiers**: Session and visitor IDs are randomly generated UUIDs
2. **No PII Collection**: No personal information is collected
3. **Hashed User Agents**: User agents are hashed for privacy
4. **Country-Level Location Only**: Only country codes stored, no precise location
5. **Client-Side Control**: All tracking happens client-side with opt-in capability

### GDPR Compliance

To add cookie consent:

```typescript
import { trackPageView } from '@/lib/eventTracker';

// Only track if user has consented
if (userHasConsented()) {
  trackPageView('/page', 'Page Title');
}
```

### Data Retention

Consider implementing data retention policies:

```sql
-- Example: Delete analytics data older than 90 days
DELETE FROM web_vitals WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM page_views WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM user_events WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM tool_usage_analytics WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## Usage Examples

### Example 1: Adding Tracking to a Tool Page

```typescript
'use client';

import { useState, useEffect } from 'react';
import { trackToolUsage, PageViewTracker } from '@/lib/eventTracker';

export default function ParaphraserPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  // Track page view
  useEffect(() => {
    const tracker = new PageViewTracker('/paraphraser', 'Paraphraser Tool');
    return () => tracker.destroy();
  }, []);

  const handleSubmit = async () => {
    const startTime = Date.now();

    try {
      const response = await fetch('/api/paraphrase', {
        method: 'POST',
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();
      setOutput(data.result);

      // Track successful tool usage
      trackToolUsage('paraphraser', {
        action: 'generate',
        inputLength: input.length,
        outputLength: data.result.length,
        processingTime: Date.now() - startTime,
        success: true,
        modelUsed: data.model,
      });
    } catch (error) {
      // Track error
      trackToolUsage('paraphraser', {
        action: 'generate',
        inputLength: input.length,
        processingTime: Date.now() - startTime,
        success: false,
        errorType: 'api_error',
      });
    }
  };

  return (
    <div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} />
      <button
        data-track-click="paraphrase_submit"
        data-track-context="paraphraser"
        onClick={handleSubmit}
      >
        Paraphrase
      </button>
      <div>{output}</div>
    </div>
  );
}
```

### Example 2: Track Copy to Clipboard

```typescript
import { trackCopy } from '@/lib/eventTracker';

const handleCopy = () => {
  navigator.clipboard.writeText(outputText);
  trackCopy('paraphrased_text');
  toast.success('Copied to clipboard!');
};
```

### Example 3: Track Download

```typescript
import { trackDownload } from '@/lib/eventTracker';

const handleDownload = () => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'output.txt';
  a.click();

  trackDownload('output.txt', 'txt');
};
```

### Example 4: Track Form Submission

```typescript
import { trackFormSubmit } from '@/lib/eventTracker';

const handleFormSubmit = async (e: FormEvent) => {
  e.preventDefault();

  try {
    await submitForm(formData);
    trackFormSubmit('contact_form', true);
    toast.success('Form submitted!');
  } catch (error) {
    trackFormSubmit('contact_form', false);
    toast.error('Submission failed');
  }
};
```

---

## Testing

### Test Analytics Locally

1. **Check Database Connection**:
```bash
# Verify Supabase environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

2. **Test Web Vitals Tracking**:
- Open browser DevTools
- Navigate to Network tab
- Visit any page
- Look for POST requests to `/api/analytics/web-vitals`

3. **Test Event Tracking**:
```typescript
// In browser console
import { trackClick } from '@/lib/eventTracker';
trackClick('test_button', 'test_context');
```

4. **Verify Dashboard**:
- Navigate to `/admin/analytics`
- Check that data is displayed
- Try different date ranges

### Debug Mode

Enable debug logging:

```typescript
// In eventTracker.ts, change console.debug to console.log
console.log('[Analytics] Failed to track event:', error);
```

---

## Performance Considerations

1. **Edge Runtime**: All API routes use Edge runtime for fast response times
2. **Batch Requests**: Consider batching analytics events if needed
3. **Non-Blocking**: All tracking is async and won't block user interactions
4. **Graceful Failures**: Analytics failures are silently caught

---

## Monitoring & Alerts

### Set Up Alerts for Poor Web Vitals

The Web Vitals API already logs poor metrics:

```typescript
if (metric.rating === 'poor') {
  console.warn(`[Web Vitals] POOR ${metric.name}: ${metric.value}`);
  // Add Sentry/error tracking integration here
}
```

### Daily Analytics Summary

Create a cron job to populate `analytics_summary_daily`:

```typescript
// app/api/cron/analytics-summary/route.ts
export async function GET() {
  const supabase = getSupabaseClient();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Aggregate data and insert into analytics_summary_daily
  // Implementation details...
}
```

---

## Troubleshooting

### Common Issues

1. **No Data in Dashboard**
   - Check Supabase credentials
   - Verify migration ran successfully
   - Check browser console for errors

2. **Events Not Tracking**
   - Verify event tracker is imported
   - Check network tab for failed requests
   - Ensure session/visitor IDs are generated

3. **Dashboard Loading Slow**
   - Check database query performance
   - Consider adding more indexes
   - Use date range filters

---

## Next Steps

1. **Deploy Migration**: Run the analytics migration on production
2. **Add Tracking**: Integrate event tracking into key user actions
3. **Set Up Monitoring**: Configure alerts for poor Web Vitals
4. **Create Reports**: Build custom reports using the analytics data
5. **Optimize**: Monitor performance and add indexes as needed

---

## Support

For issues or questions:
- Check the API route implementations
- Review the database schema
- Test with small date ranges first
- Verify environment variables are set

---

## Summary

You now have a complete analytics system with:
- ✅ Database schema for analytics tables
- ✅ 4 API routes (web-vitals, page-views, user-behavior, dashboard)
- ✅ Admin analytics dashboard UI
- ✅ Event tracker utility with multiple tracking methods
- ✅ Privacy-compliant data collection
- ✅ Real-time metrics display
- ✅ Comprehensive usage examples

Start by adding event tracking to your most important user actions and monitor the dashboard to gain insights into user behavior and application performance.
