# Supabase Service Role Key Setup

## Quick Start (5 minutes)

### Step 1: Get Service Role Key from Supabase

1. Go to https://supabase.com and log in
2. Select your project: `qyjzqzqqjimittltttph`
3. Click **Project Settings** (gear icon in sidebar)
4. Click **API** in the left menu
5. Scroll to **Project API keys** section
6. Copy the `service_role` key (the long one, NOT anon/public)
   - It starts with `eyJhbGci...` and is much longer than the anon key
   - This is a JWT token with elevated privileges

### Step 2: Add to Local Environment

1. Open `/Users/adityaaman/Desktop/ChatGPTPH/.env.local`
2. Find this line:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
3. Replace `your_service_role_key_here` with your actual key
4. Save the file

### Step 3: Run Database Migration

Run the SQL migration to create the rate_limits table:

**Option A: Using Supabase Dashboard (Easiest)**
1. Go to Supabase Dashboard
2. Click **SQL Editor** in sidebar
3. Click **New Query**
4. Copy and paste contents of:
   `/Users/adityaaman/Desktop/ChatGPTPH/supabase/migrations/20251113000000_create_rate_limits.sql`
5. Click **Run**
6. You should see "Success. No rows returned"

**Option B: Using Supabase CLI**
```bash
cd /Users/adityaaman/Desktop/ChatGPTPH
npx supabase db push
```

### Step 4: Verify Setup

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open browser to http://localhost:3002

3. Open browser console (F12)

4. Send a test message as guest user

5. Check console for:
   ```
   [Rate Limit] Guest user: 1/10 messages used
   ```

6. Check Supabase Dashboard → Table Editor → rate_limits table
   - Should see a new row with your IP and fingerprint

### Step 5: Test Rate Limiting

1. Send 10 messages as guest user
2. On 10th message, modal should appear (cannot dismiss)
3. Try clearing cache - should still be blocked
4. Try incognito - should still be blocked

## Production Setup (Vercel)

### Step 1: Add to Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: (paste your service role key)
   - **Environments**: Production, Preview, Development
5. Click **Save**

### Step 2: Redeploy

Vercel will automatically redeploy with new environment variables.

Or manually redeploy:
```bash
vercel --prod
```

## Verification Commands

### Check if key is set:
```bash
# Local
echo $SUPABASE_SERVICE_ROLE_KEY

# Should output your key, not empty
```

### Test rate limit API directly:
```bash
# Check status (GET)
curl http://localhost:3002/api/rate-limit

# Increment counter (POST)
curl -X POST http://localhost:3002/api/rate-limit \
  -H "Content-Type: application/json" \
  -d '{"action":"increment"}'
```

### Check database:
```sql
-- In Supabase SQL Editor
SELECT * FROM rate_limits ORDER BY created_at DESC LIMIT 10;
```

## Troubleshooting

### "Missing Supabase configuration" Error

**Problem**: Service role key not found

**Solution**:
1. Check `.env.local` has the key
2. Restart dev server (Ctrl+C, then `npm run dev`)
3. Verify key is correct (no extra spaces)

### "Table rate_limits does not exist" Error

**Problem**: Migration not run

**Solution**:
1. Go to Supabase Dashboard → SQL Editor
2. Run migration file contents
3. Verify table exists in Table Editor

### Rate limiting not working after deployment

**Problem**: Vercel environment variable not set

**Solution**:
1. Check Vercel dashboard → Settings → Environment Variables
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Redeploy: `vercel --prod --force`

### "service_role key is invalid" Error

**Problem**: Wrong key copied

**Solution**:
1. Go back to Supabase Dashboard → Settings → API
2. Make sure you copied `service_role` key (NOT anon key)
3. Service role key is usually much longer
4. Should start with `eyJhbGci...`

## Security Checklist

- [ ] Service role key added to `.env.local`
- [ ] `.env.local` is in `.gitignore` (DO NOT COMMIT)
- [ ] Service role key added to Vercel environment variables
- [ ] Migration run successfully in Supabase
- [ ] Tested locally (send 10 messages)
- [ ] Tested in production (after deployment)
- [ ] No service role key in client-side code
- [ ] No service role key in git history

## Emergency: Key Compromised

If service role key is accidentally committed or exposed:

1. **Immediately rotate the key**:
   - Supabase Dashboard → Settings → API
   - Click "Generate new service_role key"
   - Confirm rotation

2. **Update all environments**:
   - Update `.env.local`
   - Update Vercel environment variables
   - Restart all servers

3. **Verify old key no longer works**:
   ```bash
   curl -X POST http://localhost:3002/api/rate-limit
   # Should fail with old key
   ```

## Questions?

**Q: What's the difference between anon and service_role keys?**
A:
- `anon` key: Safe for client-side, respects RLS policies, limited access
- `service_role` key: Server-side only, bypasses RLS, full admin access

**Q: Can I use anon key instead?**
A: No. Rate limiting needs to bypass RLS to work properly. Anon key would fail.

**Q: How do I know if it's working?**
A: Send 10 messages as guest. If modal appears and you can't dismiss it, it's working!

**Q: Does this cost money?**
A: No. Within Supabase free tier (500 MB database, 2 GB bandwidth/month).
