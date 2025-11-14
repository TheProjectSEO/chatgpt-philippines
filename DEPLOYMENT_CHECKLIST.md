# Vercel Deployment Checklist
## ChatGPT Philippines (heygpt.ph)

Use this checklist to ensure successful deployment to production.

---

## Pre-Deployment Checklist

### Environment Variables Setup

#### Vercel Dashboard Configuration
- [ ] Navigate to Vercel Dashboard → Project → Settings → Environment Variables
- [ ] Add all 8 variables from `VERCEL_ENV_QUICK_REFERENCE.txt`
- [ ] For each variable, select all three environments:
  - [ ] Production
  - [ ] Preview
  - [ ] Development

#### Variables to Add (Check each one)
- [ ] `ANTHROPIC_API_KEY` (Claude AI)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (Database URL)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Database key)
- [ ] `AUTH0_SECRET` (Session encryption)
- [ ] `AUTH0_BASE_URL` (Set to `https://heygpt.ph`)
- [ ] `AUTH0_ISSUER_BASE_URL` (Auth0 tenant)
- [ ] `AUTH0_CLIENT_ID` (Auth0 app ID)
- [ ] `AUTH0_CLIENT_SECRET` (Auth0 secret key)

---

## Auth0 Configuration

### Update Auth0 Dashboard
- [ ] Log in to [Auth0 Dashboard](https://manage.auth0.com/)
- [ ] Navigate to Applications → Applications → Your App
- [ ] Update the following fields:

#### Allowed Callback URLs
- [ ] Add: `https://heygpt.ph/api/auth/callback`
- [ ] Keep: `http://localhost:3002/api/auth/callback` (for local dev)

#### Allowed Logout URLs
- [ ] Add: `https://heygpt.ph`
- [ ] Keep: `http://localhost:3002` (for local dev)

#### Allowed Web Origins
- [ ] Add: `https://heygpt.ph`
- [ ] Keep: `http://localhost:3002` (for local dev)

#### Allowed Origins (CORS)
- [ ] Add: `https://heygpt.ph`
- [ ] Keep: `http://localhost:3002` (for local dev)

#### Save Changes
- [ ] Click "Save Changes" at bottom of page
- [ ] Wait for confirmation message

---

## Deployment

### Trigger Deployment
- [ ] Go to Vercel Dashboard → Your Project → Deployments
- [ ] Click three dots (•••) on latest deployment
- [ ] Click "Redeploy"
- [ ] OR: Push a new commit to trigger automatic deployment

### Monitor Build
- [ ] Click on the building deployment
- [ ] Monitor "Building" tab for errors
- [ ] Check for environment variable loading
- [ ] Ensure no "missing environment variable" errors
- [ ] Wait for "Ready" status (usually 2-5 minutes)

---

## Post-Deployment Testing

### Authentication Testing
- [ ] Visit `https://heygpt.ph`
- [ ] Click "Login" or "Sign Up"
- [ ] Verify redirect to Auth0 login page
- [ ] Log in with test credentials
- [ ] Verify successful redirect back to app
- [ ] Check that user profile/avatar appears
- [ ] Test logout functionality

### Chat Functionality Testing
- [ ] Start a new chat conversation
- [ ] Send a test message
- [ ] Verify Claude AI responds (usually within 2-3 seconds)
- [ ] Send 2-3 more messages in conversation
- [ ] Check that context is maintained (AI remembers previous messages)

### Persistence Testing
- [ ] Send at least one message in a conversation
- [ ] Refresh the page (F5 or Cmd+R)
- [ ] Verify conversation history is still visible
- [ ] Click on conversation in sidebar
- [ ] Verify all messages load correctly
- [ ] Create a new conversation
- [ ] Verify old conversation still accessible

### Browser Console Check
- [ ] Open browser DevTools (F12 or Cmd+Option+I)
- [ ] Go to Console tab
- [ ] Check for errors (red messages)
- [ ] Common issues to look for:
  - [ ] No Supabase connection errors
  - [ ] No Auth0 authentication errors
  - [ ] No API call failures
  - [ ] No "missing environment variable" warnings

### Vercel Logs Check
- [ ] In Vercel Dashboard → Project → Logs
- [ ] Filter by "Function Logs"
- [ ] Look for runtime errors
- [ ] Check authentication flow logs
- [ ] Verify no 500 errors

---

## Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Testing
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Test responsive design
- [ ] Test touch interactions

---

## Performance Checks

### Page Load Speed
- [ ] Homepage loads in < 3 seconds
- [ ] Chat interface responsive
- [ ] No significant delays when switching conversations

### API Response Times
- [ ] Claude AI responses within 5 seconds
- [ ] Conversation history loads quickly
- [ ] Login/logout flows smooth

---

## Security Verification

### Environment Variables
- [ ] No secrets exposed in client-side code
- [ ] `.env.local` not committed to git
- [ ] `.env.production` not committed to git
- [ ] `vercel-env-template.json` not committed to git
- [ ] All sensitive files in `.gitignore`

### Auth0 Security
- [ ] Only production URL in Auth0 allowed URLs
- [ ] No wildcard (*) in callback URLs
- [ ] HTTPS enforced for all production URLs
- [ ] Session cookies secure

---

## Documentation Review

### Files to Review
- [ ] Read `VERCEL_ENV_SETUP.md` (detailed guide)
- [ ] Keep `VERCEL_ENV_QUICK_REFERENCE.txt` handy
- [ ] Review `DEPLOYMENT_GUIDE.md` for troubleshooting
- [ ] Save `DEPLOYMENT_CHECKLIST.md` (this file) for future deployments

---

## Troubleshooting Decision Tree

### Problem: Login Not Working
1. [ ] Check `AUTH0_BASE_URL` = `https://heygpt.ph`
2. [ ] Verify Auth0 callback URLs include production domain
3. [ ] Check Vercel logs for Auth0 errors
4. [ ] Redeploy and test again

### Problem: Chat Not Responding
1. [ ] Verify `ANTHROPIC_API_KEY` is set in Vercel
2. [ ] Check Anthropic Console for API key validity
3. [ ] Check Vercel function logs for errors
4. [ ] Verify API key has not exceeded rate limits

### Problem: Conversations Not Saving
1. [ ] Verify both Supabase variables are set
2. [ ] Check Supabase project is active (not paused)
3. [ ] Verify keys are from same Supabase project
4. [ ] Check Supabase logs for errors

### Problem: Environment Variables Not Working
1. [ ] Verify variables are set for "Production" environment
2. [ ] Check variable names match exactly (case-sensitive)
3. [ ] Redeploy after adding/changing variables
4. [ ] Wait for new deployment to complete

---

## Rollback Plan (If Deployment Fails)

### Immediate Rollback
- [ ] Go to Vercel Dashboard → Deployments
- [ ] Find last working deployment (marked "Ready")
- [ ] Click three dots (•••)
- [ ] Click "Promote to Production"
- [ ] Confirm rollback

### Investigation
- [ ] Review build logs for errors
- [ ] Check what changed since last working deployment
- [ ] Verify all environment variables are still set
- [ ] Test in Preview environment before re-deploying

---

## Success Criteria

Your deployment is successful when ALL of the following are true:

- [ ] ✅ Login/logout works without errors
- [ ] ✅ Chat responds to messages within 5 seconds
- [ ] ✅ Conversations persist after page refresh
- [ ] ✅ No console errors in browser
- [ ] ✅ No 500 errors in Vercel logs
- [ ] ✅ All 8 environment variables set in Vercel
- [ ] ✅ Auth0 dashboard updated with production URLs
- [ ] ✅ Tested on at least 2 different browsers
- [ ] ✅ Mobile responsive design working
- [ ] ✅ No security warnings or issues

---

## Monthly Maintenance Checklist

Run this checklist once per month:

### Usage & Costs
- [ ] Review Anthropic API usage in [Anthropic Console](https://console.anthropic.com/)
- [ ] Check Supabase database size (free tier: 500MB)
- [ ] Review Auth0 Monthly Active Users (MAU)
- [ ] Monitor Vercel bandwidth usage

### Security Updates
- [ ] Check for Next.js updates
- [ ] Update npm dependencies
- [ ] Review Auth0 security logs
- [ ] Verify no unauthorized access attempts

### Backup & Documentation
- [ ] Backup Supabase database (if needed)
- [ ] Update documentation if features changed
- [ ] Review and update this checklist if needed

---

## Emergency Contacts

### Service Dashboards
- **Vercel**: https://vercel.com/dashboard
- **Auth0**: https://manage.auth0.com/
- **Supabase**: https://supabase.com/dashboard
- **Anthropic**: https://console.anthropic.com/

### Documentation
- **Main Setup Guide**: `VERCEL_ENV_SETUP.md`
- **Quick Reference**: `VERCEL_ENV_QUICK_REFERENCE.txt`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`

---

## Notes

Date of Deployment: _______________

Deployed By: _______________

Issues Encountered:
-
-
-

Resolution:
-
-
-

Post-Deployment Changes Needed:
-
-
-

---

**Version**: 1.0
**Last Updated**: 2025-11-13
**Project**: ChatGPT Philippines (heygpt.ph)
**Platform**: Vercel + Auth0 + Supabase + Anthropic Claude
