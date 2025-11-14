# Rate Limiting Implementation Guide

## Overview

This implementation provides robust IP-based rate limiting for guest users with multiple bypass prevention mechanisms:

- **10 free messages** for guest users (changed from 3)
- **IP-based tracking** as primary method
- **Browser fingerprinting** as secondary method (VPN bypass prevention)
- **Un-dismissable modal** after limit is reached
- **24-hour reset period**

## Architecture

### Components

1. **Rate Limiting API** (`/app/api/rate-limit/route.ts`)
   - Handles rate limit checks and increments
   - Supports both POST (increment) and GET (check) methods
   - Uses Supabase for persistent storage

2. **Chat API Integration** (`/app/api/chat/route.ts`)
   - Checks rate limits before processing messages
   - Returns 429 status code when limit exceeded
   - Bypasses rate limiting for authenticated users

3. **Frontend Handling** (`/app/chat/page.tsx`)
   - Handles 429 errors from API
   - Shows un-dismissable modal when limit reached
   - Updated to show 10 free messages instead of 3

4. **Database** (`/supabase/migrations/20251113000000_create_rate_limits.sql`)
   - `rate_limits` table stores tracking data
   - Automatic cleanup of old entries (7 days)

## Setup Instructions

### 1. Get Supabase Service Role Key

1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** → **API**
3. Copy the `service_role` key (NOT the anon key)
4. This key bypasses Row Level Security policies

### 2. Add Environment Variables

Add to `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3002  # or your production URL
```

**IMPORTANT**: Never commit the service role key to version control!

### 3. Run Database Migration

Option A: Using Supabase CLI
```bash
npx supabase migration up
```

Option B: Manual (Supabase Dashboard)
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `/supabase/migrations/20251113000000_create_rate_limits.sql`
3. Run the SQL

Option C: Using the migration file directly
```bash
psql YOUR_DATABASE_URL -f supabase/migrations/20251113000000_create_rate_limits.sql
```

### 4. Verify Setup

1. Start development server: `npm run dev`
2. Open browser in guest mode (not logged in)
3. Send 10 messages
4. On the 10th message, you should see un-dismissable modal
5. Try clearing cache - should still be blocked
6. Try incognito mode - should still be blocked

## How It Works

### Tracking Mechanisms

#### 1. IP Address Tracking (Primary)
- Extracts client IP from multiple headers:
  - `cf-connecting-ip` (Cloudflare)
  - `x-forwarded-for` (Standard proxy)
  - `x-real-ip` (Nginx)
  - `x-vercel-forwarded-for` (Vercel)

#### 2. Browser Fingerprinting (Secondary)
- Combines multiple browser characteristics:
  - User-Agent
  - Accept-Language
  - Accept-Encoding
  - Sec-CH-UA (Client Hints)
  - Sec-CH-UA-Platform
- Creates unique hash for each browser

### Database Schema

```sql
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY,
  ip TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  message_count INTEGER NOT NULL,
  last_reset TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(ip, fingerprint)
);
```

### Rate Limit Logic

1. When guest sends message, API checks both IP and fingerprint
2. If match found (either IP OR fingerprint), increment counter
3. If last_reset > 24 hours ago, reset counter to 1
4. If counter >= 10, return 429 error
5. Frontend shows un-dismissable modal on 429

## Bypass Prevention

### What We Prevent

✅ **Cache clearing** - Stored server-side, not in localStorage
✅ **Incognito mode** - IP and fingerprint tracked server-side
✅ **Different browsers** - Fingerprint catches this
✅ **VPN switching** - Fingerprint provides fallback tracking
✅ **Multiple devices on same network** - Each device has unique fingerprint

### What Users Can Still Do

❌ **VPN + Clear browser data + Different browser** - Would need all three
❌ **Different network + Different device** - Completely new identity

## Production Deployment

### Vercel Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=https://heygpt.ph
```

### Testing in Production

1. Use different devices/networks to test
2. Monitor Supabase logs for rate limit queries
3. Check Vercel logs for rate limit API calls

## Monitoring

### Check Rate Limit Status

```typescript
// GET request to check without incrementing
fetch('/api/rate-limit')
  .then(res => res.json())
  .then(data => console.log(data));
// Returns: { count: 5, limit: 10, remaining: 5, blocked: false }
```

### Database Queries

```sql
-- View all rate limits
SELECT * FROM rate_limits ORDER BY last_activity DESC;

-- Count active rate limits
SELECT COUNT(*) FROM rate_limits WHERE last_reset > NOW() - INTERVAL '24 hours';

-- Find blocked users
SELECT * FROM rate_limits WHERE message_count >= 10 AND last_reset > NOW() - INTERVAL '24 hours';

-- Manually reset a user (emergency)
DELETE FROM rate_limits WHERE ip = 'xxx.xxx.xxx.xxx';
```

## Troubleshooting

### Issue: Rate limiting not working

**Check:**
1. Is `SUPABASE_SERVICE_ROLE_KEY` set correctly?
2. Run: `echo $SUPABASE_SERVICE_ROLE_KEY` (should not be empty)
3. Check Vercel logs for errors
4. Verify migration ran successfully

### Issue: Users still bypassing

**Check:**
1. Verify IP extraction is working:
   ```typescript
   console.log('Headers:', Object.fromEntries(request.headers));
   ```
2. Check if fingerprint is being generated:
   ```typescript
   console.log('Fingerprint:', getBrowserFingerprint(request));
   ```

### Issue: Legitimate users getting blocked

**Solution:**
```sql
-- Whitelist specific IP
DELETE FROM rate_limits WHERE ip = 'user_ip_here';

-- Or increase limit temporarily
UPDATE rate_limits SET message_count = 0 WHERE ip = 'user_ip_here';
```

## Future Enhancements

1. **Add CAPTCHA** after 5 failed attempts
2. **Exponential backoff** - Increase wait time for repeated bypass attempts
3. **Device ID tracking** using localStorage as third layer
4. **Analytics dashboard** to monitor rate limit hits
5. **Whitelist for specific IPs** (office networks, partners, etc.)

## Security Notes

### DO NOT:
- ❌ Expose service role key to client
- ❌ Use service role key in client-side code
- ❌ Commit service role key to Git
- ❌ Log sensitive user data

### DO:
- ✅ Use service role key only in API routes
- ✅ Rotate service role key periodically
- ✅ Monitor for unusual patterns
- ✅ Keep migration files in version control

## Testing Checklist

- [ ] Normal usage (guest sends 10 messages)
- [ ] Clear cache and try again (should still be blocked)
- [ ] Incognito mode (should still be blocked)
- [ ] Different browser (should still be blocked)
- [ ] VPN change (fingerprint should catch it)
- [ ] 24-hour reset (counter should reset)
- [ ] Authenticated user (should have unlimited)
- [ ] Modal cannot be dismissed when blocked
- [ ] Error handling when Supabase is down

## Cost Analysis

**Storage Cost:**
- Each rate limit record: ~100 bytes
- 10,000 daily users = 1 MB
- Monthly storage: ~30 MB
- **Cost: ~$0.00 (within free tier)**

**Database Queries:**
- 2 queries per message (check + update)
- 10,000 messages/day = 20,000 queries
- **Cost: ~$0.00 (within free tier)**

## Support

If you encounter issues:
1. Check Vercel logs
2. Check Supabase logs
3. Verify environment variables
4. Run migration again if needed
5. Contact team if persistent issues
