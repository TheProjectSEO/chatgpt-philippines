# ChatGPT Philippines - Deployment Guide

Quick reference for deploying to Vercel and configuring environment variables.

## Files Created

### 1. **VERCEL_ENV_SETUP.md** (Main Guide)
Comprehensive documentation covering:
- Complete list of all 8 environment variables
- Step-by-step Vercel configuration instructions
- Auth0 dashboard update requirements
- Variable descriptions and purposes
- Verification steps and troubleshooting
- Security best practices

**Use this for**: Understanding what each variable does and detailed setup instructions.

### 2. **VERCEL_ENV_QUICK_REFERENCE.txt** (Quick Copy-Paste)
Simple text file with all variables ready to copy-paste into Vercel Dashboard.

**Use this for**: Fast setup without reading documentation.

### 3. **.env.production** (Production Template)
Production environment file with all variables and inline comments.

**Note**: This file is in `.gitignore` and should NOT be committed to git.

### 4. **vercel-env-template.json** (Programmatic Reference)
JSON format for reference or potential Vercel CLI automation.

**Note**: This file is in `.gitignore` and should NOT be committed to git.

---

## Quick Start (5 Minutes)

### Step 1: Add Variables to Vercel
1. Open `VERCEL_ENV_QUICK_REFERENCE.txt`
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Select your project → Settings → Environment Variables
4. Copy-paste each variable (8 total)
5. Select all three environments: Production, Preview, Development

### Step 2: Update Auth0
1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to Applications → Your App
3. Add to **Allowed Callback URLs**:
   ```
   https://heygpt.ph/api/auth/callback
   ```
4. Add to **Allowed Logout URLs**:
   ```
   https://heygpt.ph
   ```
5. Add to **Allowed Web Origins** and **Allowed Origins (CORS)**:
   ```
   https://heygpt.ph
   ```
6. Save changes

### Step 3: Deploy
1. In Vercel Dashboard → Deployments
2. Click "Redeploy" on latest deployment
3. Wait for build to complete

### Step 4: Test
1. Visit https://heygpt.ph
2. Test login/logout
3. Test chat functionality
4. Verify conversation history persists

---

## Critical Changes from Local Development

### AUTH0_BASE_URL Updated
```diff
- AUTH0_BASE_URL=http://localhost:3002
+ AUTH0_BASE_URL=https://heygpt.ph
```

This is the MOST IMPORTANT change. Without it, Auth0 login will fail.

---

## Environment Variables Summary

| Variable | Purpose | Critical? |
|----------|---------|-----------|
| `ANTHROPIC_API_KEY` | Claude AI chat | ✅ YES |
| `NEXT_PUBLIC_SUPABASE_URL` | Database connection | ✅ YES |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Database auth | ✅ YES |
| `AUTH0_SECRET` | Session encryption | ✅ YES |
| `AUTH0_BASE_URL` | Production URL | ✅ YES |
| `AUTH0_ISSUER_BASE_URL` | Auth0 tenant | ✅ YES |
| `AUTH0_CLIENT_ID` | Auth0 app ID | ✅ YES |
| `AUTH0_CLIENT_SECRET` | Auth0 secret | ✅ YES |

All 8 variables are required for the application to work in production.

---

## Troubleshooting

### Login Not Working?
1. Check `AUTH0_BASE_URL` is set to `https://heygpt.ph`
2. Verify Auth0 dashboard has production callback URL
3. Redeploy after making changes

### Chat Not Responding?
1. Check `ANTHROPIC_API_KEY` is set in Vercel
2. Verify key is valid in [Anthropic Console](https://console.anthropic.com/)
3. Check Vercel function logs for errors

### Conversations Not Saving?
1. Verify both Supabase variables are set
2. Check Supabase project is not paused
3. Verify keys match the same project

### Environment Variables Not Taking Effect?
Environment variables are only loaded during build time. After adding or changing variables, you MUST redeploy.

---

## Security Notes

### Protected Files (in .gitignore)
- `.env.local` - Local development variables
- `.env.production` - Production variables template
- `vercel-env-template.json` - JSON template with sensitive data

These files contain sensitive API keys and should NEVER be committed to git.

### Best Practices
- Never share API keys in public channels
- Rotate `AUTH0_SECRET` every 6 months
- Use different Auth0 applications for dev/staging/production
- Monitor API usage in Anthropic and Supabase dashboards

---

## Support Resources

### Documentation
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Auth0 Next.js SDK](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Anthropic API Documentation](https://docs.anthropic.com/)

### Project Files
- `VERCEL_ENV_SETUP.md` - Detailed setup guide
- `VERCEL_ENV_QUICK_REFERENCE.txt` - Quick copy-paste reference
- `.env.production` - Production template with comments
- `vercel-env-template.json` - JSON format reference

---

## Maintenance Checklist

### Before Each Deployment
- [ ] All environment variables added to Vercel
- [ ] Auth0 callback URLs updated
- [ ] `.env.production` values match Vercel
- [ ] Sensitive files in `.gitignore`

### After Deployment
- [ ] Test login/logout flow
- [ ] Test chat functionality
- [ ] Check conversation persistence
- [ ] Monitor Vercel function logs
- [ ] Check browser console for errors

### Monthly Reviews
- [ ] Review Anthropic API usage
- [ ] Check Supabase database size
- [ ] Review Auth0 Monthly Active Users
- [ ] Update dependencies

---

**Last Updated**: 2025-11-13
**Project**: ChatGPT Philippines
**Production URL**: https://heygpt.ph
**Platform**: Vercel
