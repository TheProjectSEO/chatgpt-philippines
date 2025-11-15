# ChatGPT Philippines - Post-Launch Monitoring Setup

## Overview
This document outlines the monitoring setup for ChatGPT Philippines to ensure platform health, performance, and user satisfaction after launch.

**Monitoring Philosophy**: Proactive detection and rapid response to issues before users are significantly impacted.

---

## 1. Error Monitoring

### Recommended Tool: Sentry

#### Setup Steps
1. **Create Sentry Account**
   - Sign up at https://sentry.io
   - Create new project for "ChatGPT Philippines"
   - Select "Next.js" as platform

2. **Install Sentry SDK**
   ```bash
   npm install --save @sentry/nextjs
   npx @sentry/wizard -i nextjs
   ```

3. **Configuration**
   ```javascript
   // sentry.client.config.ts
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 0.1, // Adjust based on traffic
     environment: process.env.NODE_ENV,
     enabled: process.env.NODE_ENV === 'production',
   });
   ```

   ```javascript
   // sentry.server.config.ts
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     tracesSampleRate: 0.1,
     environment: process.env.NODE_ENV,
     enabled: process.env.NODE_ENV === 'production',
   });
   ```

4. **Add Environment Variables**
   ```
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   SENTRY_AUTH_TOKEN=your_auth_token
   ```

#### Alert Configuration

**Critical Alerts (Immediate Notification)**
- Error rate >5% in any 5-minute window
- 500 errors occurring
- Authentication failures spiking
- Database connection errors
- API timeout rate >10%

**Warning Alerts (Monitor Closely)**
- Error rate >2% in any 15-minute window
- Unusual spike in 4xx errors
- Slow response times (>2s average)
- Memory usage increasing

**Alert Channels**
- Email: team@yourdomain.com
- Slack: #alerts channel
- SMS: For critical errors only (optional)

#### Issue Categorization
```
P0 (Critical): Users cannot use platform
P1 (High): Major features broken
P2 (Medium): Minor features broken
P3 (Low): Edge cases, cosmetic issues
```

---

## 2. Uptime Monitoring

### Recommended Tool: UptimeRobot (Free tier sufficient)

#### Setup Steps
1. **Create Account**
   - Sign up at https://uptimerobot.com
   - Free plan allows 50 monitors

2. **Configure Monitors**

   **Monitor 1: Home Page**
   - URL: https://yourdomain.com
   - Type: HTTPS
   - Interval: 5 minutes
   - Alert if down for: 2 minutes

   **Monitor 2: Login Page**
   - URL: https://yourdomain.com/login
   - Type: HTTPS
   - Interval: 5 minutes
   - Alert if down for: 2 minutes

   **Monitor 3: Main Chat Interface**
   - URL: https://yourdomain.com/chat
   - Type: HTTPS
   - Interval: 10 minutes
   - Alert if down for: 5 minutes

   **Monitor 4: Key Tool (Paraphraser)**
   - URL: https://yourdomain.com/paraphraser
   - Type: HTTPS
   - Interval: 10 minutes

   **Monitor 5: API Health**
   - URL: https://yourdomain.com/api/health (if you create one)
   - Type: HTTPS
   - Interval: 5 minutes
   - Alert if down for: 2 minutes

3. **Alert Contacts**
   - Primary email
   - Secondary email
   - Slack webhook (optional)
   - SMS (for critical monitors only)

4. **Status Page**
   - Enable public status page (optional)
   - Custom domain: status.yourdomain.com
   - Shows uptime history

#### Response Time Thresholds
- Green: <1 second
- Yellow: 1-2 seconds
- Red: >2 seconds or down

---

## 3. Performance Monitoring

### Vercel Analytics (Built-in)

#### Setup
1. **Enable in Vercel Dashboard**
   - Go to your project in Vercel
   - Navigate to Analytics tab
   - Enable Web Analytics and Speed Insights

2. **Install Package**
   ```bash
   npm install @vercel/speed-insights
   ```

3. **Add to Layout**
   ```typescript
   // app/layout.tsx
   import { SpeedInsights } from '@vercel/speed-insights/next';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <SpeedInsights />
         </body>
       </html>
     );
   }
   ```

#### Metrics to Track
- **Core Web Vitals**
  - Largest Contentful Paint (LCP): Target <2.5s
  - First Input Delay (FID): Target <100ms
  - Cumulative Layout Shift (CLS): Target <0.1

- **Custom Metrics**
  - Time to Interactive (TTI)
  - Total Blocking Time (TBT)
  - First Contentful Paint (FCP)

#### Performance Alerts
- LCP >3s for >10% of users
- FID >300ms for >5% of users
- CLS >0.25 for >5% of users

### Google Lighthouse CI

#### Setup for Continuous Monitoring
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://yourdomain.com
            https://yourdomain.com/paraphraser
            https://yourdomain.com/essay-writer
          uploadArtifacts: true
```

---

## 4. User Analytics

### Google Analytics 4

#### Setup
1. **Create GA4 Property**
   - Go to https://analytics.google.com
   - Create new GA4 property
   - Get Measurement ID (G-XXXXXXXXXX)

2. **Install gtag**
   ```typescript
   // lib/analytics.ts
   export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

   export const pageview = (url: string) => {
     if (typeof window !== 'undefined' && window.gtag) {
       window.gtag('config', GA_MEASUREMENT_ID!, {
         page_path: url,
       });
     }
   };

   export const event = ({ action, category, label, value }: {
     action: string;
     category: string;
     label?: string;
     value?: number;
   }) => {
     if (typeof window !== 'undefined' && window.gtag) {
       window.gtag('event', action, {
         event_category: category,
         event_label: label,
         value: value,
       });
     }
   };
   ```

3. **Add to App**
   ```typescript
   // app/layout.tsx
   import Script from 'next/script';

   <Script
     src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
     strategy="afterInteractive"
   />
   <Script id="google-analytics" strategy="afterInteractive">
     {`
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', '${GA_MEASUREMENT_ID}');
     `}
   </Script>
   ```

#### Events to Track

**User Events**
```typescript
// User signup
event({
  action: 'signup',
  category: 'User',
  label: 'New User'
});

// User login
event({
  action: 'login',
  category: 'User',
  label: 'Returning User'
});
```

**Tool Usage Events**
```typescript
// Tool used
event({
  action: 'tool_used',
  category: 'Tools',
  label: 'Paraphraser'
});

// Tool completed
event({
  action: 'tool_completed',
  category: 'Tools',
  label: 'Paraphraser',
  value: responseTime // in ms
});
```

**Conversion Events**
```typescript
// Hit rate limit
event({
  action: 'rate_limit_reached',
  category: 'Conversion',
  label: 'Free Tier'
});

// Upgrade prompt shown
event({
  action: 'upgrade_prompt_shown',
  category: 'Conversion'
});

// Upgrade completed (if applicable)
event({
  action: 'upgrade_completed',
  category: 'Conversion',
  value: planPrice
});
```

#### Custom Dashboards
Create dashboards for:
1. **Real-time Users**: Active users, pages, events
2. **User Acquisition**: Traffic sources, campaigns
3. **User Engagement**: Session duration, pages per session
4. **Tool Usage**: Most popular tools, completion rates
5. **Conversion Funnel**: Signup → Use → Rate Limit → Upgrade

---

## 5. API & Database Monitoring

### Anthropic API Monitoring

#### Cost Tracking
```typescript
// lib/anthropic-monitor.ts
export async function trackAnthropicUsage(
  model: string,
  inputTokens: number,
  outputTokens: number
) {
  // Calculate cost based on model
  const cost = calculateCost(model, inputTokens, outputTokens);

  // Track in your database
  await supabase.from('api_usage').insert({
    provider: 'anthropic',
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost,
    timestamp: new Date()
  });

  // Alert if daily cost exceeds threshold
  const dailyCost = await getDailyCost();
  if (dailyCost > DAILY_BUDGET) {
    sendAlert('Anthropic API cost exceeds daily budget!');
  }
}
```

#### Billing Alerts
1. **Set up in Anthropic Console**
   - Go to https://console.anthropic.com
   - Set budget alerts at:
     - 50% of monthly budget
     - 80% of monthly budget
     - 100% of monthly budget

2. **Monitor Usage Dashboard**
   - Check daily usage
   - Track cost per tool
   - Identify expensive queries

### Supabase Monitoring

#### Database Performance
1. **Enable Performance Insights**
   - Go to Supabase Dashboard
   - Navigate to Database → Performance
   - Monitor slow queries
   - Check connection pool usage

2. **Set Up Alerts**
   ```sql
   -- Create monitoring table
   CREATE TABLE monitoring_metrics (
     id SERIAL PRIMARY KEY,
     metric_name TEXT NOT NULL,
     metric_value NUMERIC,
     timestamp TIMESTAMPTZ DEFAULT NOW()
   );

   -- Track query performance
   CREATE OR REPLACE FUNCTION log_slow_queries()
   RETURNS trigger AS $$
   BEGIN
     IF (EXTRACT(EPOCH FROM (clock_timestamp() - NEW.query_start)) > 1) THEN
       INSERT INTO monitoring_metrics (metric_name, metric_value)
       VALUES ('slow_query', EXTRACT(EPOCH FROM (clock_timestamp() - NEW.query_start)));
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```

3. **Connection Pool Monitoring**
   - Monitor active connections
   - Alert if connections >80% of limit
   - Track connection errors

#### Database Alerts
- Slow queries (>1 second)
- High connection count (>80% of pool)
- Disk usage >80%
- CPU usage >70%
- Memory usage >80%

---

## 6. Log Aggregation

### Vercel Logs
- Access via Vercel Dashboard → Logs
- Filter by severity, time, function
- Download logs for analysis

### Custom Logging
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, metadata?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      metadata,
      timestamp: new Date().toISOString()
    }));
  },

  error: (message: string, error?: Error, metadata?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      metadata,
      timestamp: new Date().toISOString()
    }));

    // Send to Sentry
    if (error) {
      Sentry.captureException(error, { extra: metadata });
    }
  },

  warn: (message: string, metadata?: any) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      metadata,
      timestamp: new Date().toISOString()
    }));
  }
};
```

---

## 7. Business Metrics Dashboard

### Key Metrics to Track Daily

#### User Metrics
- [ ] Total users (cumulative)
- [ ] New signups (daily)
- [ ] Active users (DAU)
- [ ] Returning users (%)
- [ ] User retention (7-day, 30-day)

#### Tool Usage Metrics
- [ ] Total tool uses (daily)
- [ ] Tool uses per user (average)
- [ ] Most popular tools (top 10)
- [ ] Least used tools
- [ ] Tool completion rate (%)
- [ ] Average response time per tool

#### Performance Metrics
- [ ] Average page load time
- [ ] Average API response time
- [ ] Error rate (%)
- [ ] Uptime (%)
- [ ] 95th percentile response time

#### Conversion Metrics (if applicable)
- [ ] Rate limit hit rate (% of users)
- [ ] Upgrade prompt views
- [ ] Conversion rate (free → paid)
- [ ] Revenue (daily/monthly)

#### Cost Metrics
- [ ] Anthropic API cost (daily/monthly)
- [ ] OpenAI API cost (if used)
- [ ] Supabase cost
- [ ] Vercel hosting cost
- [ ] Total cost per user
- [ ] Profit margin

### Dashboard Tools

**Option 1: Google Data Studio** (Free)
- Connect to Google Analytics
- Connect to Supabase (via connector)
- Create custom dashboards
- Share with team

**Option 2: Metabase** (Open Source)
- Self-hosted or cloud
- Connect to Supabase
- Create custom queries
- Automated reports

**Option 3: Custom Dashboard**
- Build with Chart.js or Recharts
- Pull data from Supabase
- Real-time updates
- Embed in admin panel

---

## 8. Alert Response Procedures

### Critical Alert Response (P0)

**Step 1: Immediate Assessment (0-5 minutes)**
1. Check Sentry for error details
2. Check Vercel deployment status
3. Check Supabase status
4. Check Anthropic API status

**Step 2: User Impact Assessment (5-10 minutes)**
1. How many users affected?
2. What functionality is broken?
3. Is data at risk?
4. Can users still access core features?

**Step 3: Decision (10-15 minutes)**
- **If minor impact**: Fix and deploy
- **If major impact**: Rollback to previous version
- **If data risk**: Take site offline, fix, test, deploy

**Step 4: Communication (15-20 minutes)**
- Update status page (if public)
- Notify affected users (if possible)
- Post on social media (if appropriate)

**Step 5: Resolution**
- Implement fix
- Deploy to production
- Verify fix
- Monitor for recurrence

**Step 6: Post-Mortem**
- Document what happened
- Document root cause
- Document prevention measures
- Share with team

### Warning Alert Response (P1)

**Step 1: Investigation (0-30 minutes)**
- Review error logs
- Check affected components
- Assess user impact

**Step 2: Action Plan (30-60 minutes)**
- Create fix or workaround
- Test locally
- Plan deployment

**Step 3: Deploy Fix**
- Deploy during low-traffic period if possible
- Monitor closely after deployment

---

## 9. Monitoring Checklist

### Daily (First Week)
- [ ] Check Sentry error dashboard
- [ ] Review uptime reports
- [ ] Check performance metrics
- [ ] Review user signup numbers
- [ ] Check API cost dashboard
- [ ] Review top tools used
- [ ] Check for any user complaints
- [ ] Review database performance

### Weekly (Ongoing)
- [ ] Review weekly metrics report
- [ ] Analyze user retention
- [ ] Review cost trends
- [ ] Identify performance issues
- [ ] Plan optimizations
- [ ] Review security logs

### Monthly
- [ ] Full performance audit
- [ ] Cost analysis and optimization
- [ ] User feedback review
- [ ] Feature usage analysis
- [ ] Security review
- [ ] Infrastructure scaling review

---

## 10. Monitoring Tools Summary

| Tool | Purpose | Cost | Priority |
|------|---------|------|----------|
| Sentry | Error monitoring | Free tier / $26/mo | P0 - Critical |
| UptimeRobot | Uptime monitoring | Free / $7/mo | P0 - Critical |
| Vercel Analytics | Performance | Included | P0 - Critical |
| Google Analytics | User analytics | Free | P1 - High |
| Lighthouse CI | Performance audits | Free | P1 - High |
| Supabase Monitoring | Database performance | Included | P1 - High |
| Google Data Studio | Dashboards | Free | P2 - Medium |

**Total Monthly Cost**: $0-$50 (depending on traffic)

---

## 11. First 48 Hours - Critical Monitoring

### Hour-by-Hour Checklist

**Hour 1**
- [ ] Verify deployment successful
- [ ] Test critical user journeys
- [ ] Check error rate (should be <0.5%)
- [ ] Verify analytics tracking
- [ ] Check API response times

**Hour 2-4**
- [ ] Monitor error dashboard every 30 minutes
- [ ] Check for unusual patterns
- [ ] Monitor user signups
- [ ] Check database performance

**Hour 4-8**
- [ ] Check error dashboard every hour
- [ ] Review user feedback (if any)
- [ ] Monitor tool usage patterns
- [ ] Check API costs

**Hour 8-24**
- [ ] Check error dashboard every 2 hours
- [ ] Review metrics summary
- [ ] Document any issues
- [ ] Plan any necessary hotfixes

**Hour 24-48**
- [ ] Check error dashboard 3x daily
- [ ] Review performance trends
- [ ] Analyze user behavior
- [ ] Optimize based on data

---

## 12. Sample Alert Messages

### Slack Alert Format
```
🚨 CRITICAL: High Error Rate
━━━━━━━━━━━━━━━━━━━━━
Error Rate: 12.3% (last 5 min)
Threshold: 5%
Affected Route: /api/essay-write
Error Type: API Timeout
Users Affected: ~50

Action Required: Immediate investigation
Dashboard: https://sentry.io/...
```

### Email Alert Format
```
Subject: [CRITICAL] ChatGPT PH - High Error Rate

Issue: Error rate exceeds threshold
Severity: P0 - Critical
Time Detected: 2025-11-23 10:45 AM PST

Details:
- Error Rate: 12.3% (threshold: 5%)
- Affected Component: Essay Writer API
- Error Type: Anthropic API Timeout
- Users Affected: Approximately 50 in last 5 minutes

Next Steps:
1. Check Anthropic API status
2. Review recent deployments
3. Check for traffic spike
4. Consider rollback if necessary

Dashboard Links:
- Sentry: [link]
- Vercel: [link]
- Supabase: [link]
```

---

## 13. Success Criteria

### Launch Day Success
- [ ] Uptime >99%
- [ ] Error rate <1%
- [ ] Average response time <500ms
- [ ] Zero P0 bugs discovered
- [ ] <5 P1 bugs discovered
- [ ] All monitoring tools operational

### Week 1 Success
- [ ] Uptime >98%
- [ ] Error rate <2%
- [ ] Average response time <600ms
- [ ] All P0 bugs fixed
- [ ] >80% of P1 bugs fixed
- [ ] User satisfaction >4.0/5.0 (if collecting feedback)

---

## Contact Information

**Emergency Escalation**
1. Tech Lead: [Phone]
2. DevOps: [Phone]
3. Product Owner: [Phone]

**Support Contacts**
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Anthropic Support: support@anthropic.com
- Sentry Support: https://sentry.io/support/

---

**Remember**: The goal of monitoring is not just to collect data, but to enable rapid response and continuous improvement. Review your monitoring setup weekly and adjust as you learn what matters most for your specific platform.
