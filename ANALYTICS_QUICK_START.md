# Analytics Quick Start Guide

## Setup (5 minutes)

### 1. Run Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually
psql -h your-host -U your-user -d your-db -f supabase/migrations/20251116000000_create_analytics_tables.sql
```

### 2. Verify Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Access Dashboard

Navigate to: `/admin/analytics`

---

## Quick Track Events

### Import the Tracker

```typescript
import { trackToolUsage, trackClick, PageViewTracker } from '@/lib/eventTracker';
```

### Track Tool Usage (Most Common)

```typescript
const startTime = Date.now();

// Your tool logic here...
const result = await generateContent(input);

// Track it!
trackToolUsage('tool-name', {
  inputLength: input.length,
  outputLength: result.length,
  processingTime: Date.now() - startTime,
  success: true,
  modelUsed: 'claude-3-sonnet',
});
```

### Auto-Track Page Views

```typescript
import { useEffect } from 'react';
import { PageViewTracker } from '@/lib/eventTracker';

export default function MyPage() {
  useEffect(() => {
    const tracker = new PageViewTracker('/my-page', 'My Page Title');
    return () => tracker.destroy();
  }, []);

  return <div>Content</div>;
}
```

### Track Button Clicks

```tsx
<button
  data-track-click="submit_button"
  data-track-context="my_page"
  onClick={handleClick}
>
  Submit
</button>
```

---

## API Routes Reference

### Get Dashboard Data

```typescript
const response = await fetch('/api/analytics/dashboard?startDate=2025-01-01&endDate=2025-01-31');
const data = await response.json();
```

### Get Web Vitals

```typescript
const response = await fetch('/api/analytics/web-vitals?metric=LCP&startDate=2025-01-01');
const metrics = await response.json();
```

### Get Page Views

```typescript
const response = await fetch('/api/analytics/page-views?path=/paraphraser');
const pageViews = await response.json();
```

### Get User Behavior

```typescript
const response = await fetch('/api/analytics/user-behavior?type=tools&startDate=2025-01-01');
const toolUsage = await response.json();
```

---

## Common Tracking Patterns

### 1. Tool Page Template

```typescript
'use client';

import { useState, useEffect } from 'react';
import { trackToolUsage, PageViewTracker } from '@/lib/eventTracker';

export default function ToolPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  // Auto page view tracking
  useEffect(() => {
    const tracker = new PageViewTracker('/tool', 'Tool Name');
    return () => tracker.destroy();
  }, []);

  const handleGenerate = async () => {
    const startTime = Date.now();

    try {
      const result = await generateContent(input);
      setOutput(result);

      trackToolUsage('tool-name', {
        inputLength: input.length,
        outputLength: result.length,
        processingTime: Date.now() - startTime,
        success: true,
      });
    } catch (error) {
      trackToolUsage('tool-name', {
        inputLength: input.length,
        processingTime: Date.now() - startTime,
        success: false,
        errorType: 'generation_error',
      });
    }
  };

  return (
    <div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} />
      <button
        data-track-click="generate_button"
        onClick={handleGenerate}
      >
        Generate
      </button>
      <div>{output}</div>
    </div>
  );
}
```

### 2. Track Copy Action

```typescript
import { trackCopy } from '@/lib/eventTracker';

const handleCopy = () => {
  navigator.clipboard.writeText(text);
  trackCopy('generated_content');
};
```

### 3. Track Download

```typescript
import { trackDownload } from '@/lib/eventTracker';

const handleDownload = () => {
  // Download logic...
  trackDownload('output.pdf', 'pdf');
};
```

### 4. Track Form Submit

```typescript
import { trackFormSubmit } from '@/lib/eventTracker';

const handleSubmit = async () => {
  try {
    await submitForm(data);
    trackFormSubmit('contact_form', true);
  } catch (error) {
    trackFormSubmit('contact_form', false);
  }
};
```

---

## Dashboard Features

### Summary Metrics
- Total Page Views
- Unique Visitors
- Tool Usage Count
- Total Events

### Charts
- Daily Activity Trends (line chart)
- Web Vitals Performance (bar chart)
- Top Pages (bar chart)
- Most Used Tools (bar chart)
- Device Breakdown (doughnut chart)
- Browser Distribution (pie chart)

### Tables
- Top Pages with engagement metrics
- Tool performance statistics

---

## Privacy Features

✅ Anonymous session/visitor IDs (UUID)
✅ No personal information collected
✅ Hashed user agents
✅ Country-level location only
✅ Client-side tracking control

---

## Troubleshooting

### No data in dashboard?
1. Check Supabase credentials in `.env.local`
2. Verify migration ran successfully
3. Check browser console for errors
4. Test API routes manually

### Events not tracking?
1. Import event tracker correctly
2. Check Network tab for failed requests
3. Verify session ID is generated

### Dashboard loading slow?
1. Use smaller date ranges
2. Check database performance
3. Verify indexes are created

---

## What's Included

**Database Tables** (5):
- web_vitals
- page_views
- user_events
- tool_usage_analytics
- analytics_summary_daily

**API Routes** (4):
- `/api/analytics/web-vitals`
- `/api/analytics/page-views`
- `/api/analytics/user-behavior`
- `/api/analytics/dashboard`

**Dashboard**:
- `/admin/analytics`

**Tracking Functions** (10+):
- trackPageView
- trackToolUsage
- trackClick
- trackFormSubmit
- trackDownload
- trackSearch
- trackShare
- trackCopy
- trackError
- PageViewTracker class

---

## Next Steps

1. ✅ Run database migration
2. ✅ Verify environment variables
3. ✅ Add tracking to 1-2 key pages
4. ✅ Check dashboard for data
5. ✅ Roll out to all pages
6. ✅ Set up monitoring alerts

That's it! You're ready to track user behavior and optimize your application.
