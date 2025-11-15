# ChatGPT Philippines - Emergency Rollback Procedure

## Overview
This document outlines step-by-step procedures for rolling back a problematic deployment to restore service quickly.

**Critical Rule**: When in doubt, rollback first, debug later. User experience is priority #1.

---

## When to Rollback

### Immediate Rollback Triggers (P0)
- Site completely down or inaccessible
- Authentication system broken (users can't login)
- Database connection failures affecting all users
- Critical security vulnerability discovered
- Data corruption or loss occurring
- Error rate >10% across the platform
- Payment system broken (charging incorrectly)

### Consider Rollback (Evaluate First)
- Error rate 5-10%
- Single major feature completely broken
- Performance degradation >50% slower
- Multiple P1 bugs discovered
- User complaints spiking

### Do NOT Rollback For
- Minor UI issues
- Single tool not working (if others work)
- Slow performance on specific pages only
- Low error rate (<2%)
- Expected traffic spike (scale instead)

---

## Pre-Rollback Checklist

Before initiating rollback:
1. [ ] Confirm the issue is from latest deployment
2. [ ] Document the issue (screenshots, error messages, logs)
3. [ ] Notify team in emergency channel
4. [ ] Check if quick fix is possible (<5 minutes)
5. [ ] Identify last known good deployment
6. [ ] Ensure rollback won't cause data loss

---

## Rollback Methods

### Method 1: Vercel Dashboard Rollback (Fastest)

**Estimated Time**: 2-3 minutes

**Steps**:

1. **Access Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select "ChatGPT Philippines" project
   - Click "Deployments" tab

2. **Identify Last Good Deployment**
   - Find deployment before the problematic one
   - Look for status: "Ready" with green checkmark
   - Check deployment timestamp
   - Verify it's a production deployment

3. **Promote Previous Deployment**
   - Click the three dots (...) next to the good deployment
   - Click "Promote to Production"
   - Confirm the promotion

4. **Wait for Propagation**
   - Deployment typically propagates in 30-60 seconds
   - Watch the deployment status
   - Once "Ready", verify site is accessible

5. **Immediate Verification**
   ```bash
   # Test home page
   curl -I https://yourdomain.com
   # Should return 200 OK

   # Test API endpoint
   curl https://yourdomain.com/api/health
   # Should return healthy response
   ```

6. **Test Critical Paths**
   - Visit home page: https://yourdomain.com
   - Test login: https://yourdomain.com/login
   - Test key tool: https://yourdomain.com/paraphraser
   - Check error monitoring dashboard

**Pros**:
- Fastest method
- No command line needed
- Visual confirmation

**Cons**:
- Requires dashboard access
- Slightly slower than CLI

---

### Method 2: Vercel CLI Rollback (Fastest for Technical Users)

**Estimated Time**: 1-2 minutes

**Prerequisites**:
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login (if not logged in)
vercel login
```

**Steps**:

1. **List Recent Deployments**
   ```bash
   cd /Users/adityaaman/Desktop/ChatGPTPH
   vercel ls
   ```

2. **Find Last Good Deployment**
   - Look for deployment URL with status "READY"
   - Note the deployment URL (e.g., chatgpt-philippines-abc123.vercel.app)

3. **Promote Previous Deployment**
   ```bash
   # Promote specific deployment to production
   vercel promote <deployment-url>

   # Example:
   # vercel promote chatgpt-philippines-abc123.vercel.app
   ```

4. **Verify Rollback**
   ```bash
   # Check current production deployment
   vercel ls --prod

   # Test the site
   curl -I https://yourdomain.com
   ```

**Pros**:
- Fastest method
- Can be scripted
- Works from terminal

**Cons**:
- Requires CLI setup
- Requires command line knowledge

---

### Method 3: Git Revert and Redeploy (Most Control)

**Estimated Time**: 5-10 minutes

**Use When**:
- Dashboard/CLI rollback not working
- Need to ensure specific code version
- Want permanent revert in git history

**Steps**:

1. **Identify Problematic Commit**
   ```bash
   cd /Users/adityaaman/Desktop/ChatGPTPH

   # View recent commits
   git log --oneline -10

   # Find the commit that caused issues
   # Example output:
   # abc1234 Added new feature (BAD - this one broke it)
   # def5678 Fixed styling (GOOD - this one worked)
   ```

2. **Create Revert Commit**
   ```bash
   # Option A: Revert single commit
   git revert abc1234

   # Option B: Revert to specific commit (destructive)
   git reset --hard def5678

   # Option A is preferred (preserves history)
   ```

3. **Push to Main Branch**
   ```bash
   # If you used git revert
   git push origin main

   # If you used git reset (force push required)
   git push -f origin main
   ```

4. **Vercel Auto-Deploy**
   - Vercel will automatically detect the push
   - New deployment will start
   - Wait 2-3 minutes for build and deploy

5. **Monitor Deployment**
   - Check Vercel dashboard for deployment status
   - Watch build logs for errors
   - Verify deployment completes successfully

6. **Verify Site**
   ```bash
   # Test the site
   curl -I https://yourdomain.com

   # Check specific pages
   curl https://yourdomain.com/paraphraser
   ```

**Pros**:
- Full control over code version
- Creates clear git history
- Permanent fix in repository

**Cons**:
- Slowest method
- Requires git knowledge
- Requires waiting for rebuild

---

## Post-Rollback Actions

### Immediate (0-15 minutes)

1. **Verify System Health**
   - [ ] Check error monitoring dashboard (Sentry)
   - [ ] Verify error rate dropped to normal levels
   - [ ] Test all critical user journeys manually
   - [ ] Check uptime monitoring (UptimeRobot)
   - [ ] Verify database connections restored

2. **Test Critical Features**
   - [ ] User can access home page
   - [ ] User can signup/login
   - [ ] Top 5 tools work correctly
   - [ ] Rate limiting functions properly
   - [ ] Analytics tracking works

3. **Monitor Metrics**
   ```
   Acceptable ranges after rollback:
   - Error rate: <2%
   - Response time: <500ms average
   - Uptime: 100%
   - Database connections: Normal
   - API response times: <1s
   ```

### Short-term (15-60 minutes)

1. **Communicate Status**
   - [ ] Update team in emergency channel
   - [ ] Post on status page (if public): "Issue resolved"
   - [ ] Notify affected users (if applicable)
   - [ ] Update social media (if outage was public)

2. **Document the Incident**
   ```markdown
   # Incident Report - [Date]

   ## Summary
   Brief description of what went wrong

   ## Timeline
   - 10:00 AM: Deployed version X.Y.Z
   - 10:15 AM: Error rate spiked to 15%
   - 10:20 AM: Decided to rollback
   - 10:23 AM: Rollback completed
   - 10:25 AM: Service restored

   ## Root Cause
   What caused the issue

   ## Impact
   - Number of users affected: ~X
   - Duration of impact: X minutes
   - Features affected: [list]

   ## Resolution
   How it was resolved (rollback method used)

   ## Prevention
   How to prevent this in the future
   ```

3. **Investigate Root Cause**
   - [ ] Review problematic code changes
   - [ ] Check deployment logs
   - [ ] Analyze error messages in Sentry
   - [ ] Review database logs
   - [ ] Check API provider status

### Long-term (1-24 hours)

1. **Create Fix Plan**
   - [ ] Identify exact cause of failure
   - [ ] Plan proper fix
   - [ ] Write tests to prevent regression
   - [ ] Schedule fix deployment (not immediate)

2. **Improve Processes**
   - [ ] Update pre-deployment checklist
   - [ ] Add missing tests
   - [ ] Improve monitoring/alerts
   - [ ] Document lessons learned

3. **Team Retrospective**
   - What went well during incident response?
   - What could be improved?
   - How can we prevent similar issues?
   - Do we need better testing/staging?

---

## Rollback Decision Tree

```
Is the site completely down?
├─ YES → Rollback immediately
└─ NO → Continue

Is authentication broken?
├─ YES → Rollback immediately
└─ NO → Continue

Is error rate >10%?
├─ YES → Rollback immediately
└─ NO → Continue

Is error rate 5-10%?
├─ YES → Evaluate:
│        Can we fix quickly (<5 min)?
│        ├─ YES → Fix and monitor
│        └─ NO → Rollback
└─ NO → Continue

Is one major feature completely broken?
├─ YES → Evaluate:
│        Is it critical for most users?
│        ├─ YES → Consider rollback
│        └─ NO → Fix in next deployment
└─ NO → Continue

Are there minor issues only?
└─ Monitor and fix in next deployment
```

---

## Database Rollback (If Needed)

### When to Rollback Database

**CAUTION**: Database rollbacks are risky and should be last resort.

Only rollback database if:
- Data corruption is actively happening
- Incorrect schema change causing failures
- Data loss is occurring

**Do NOT rollback database for**:
- Application errors
- API failures
- UI issues

### Supabase Database Rollback

1. **Stop All Application Traffic**
   - Put site in maintenance mode (if possible)
   - Or rollback application first to stop writes

2. **Access Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to Database → Backups

3. **Identify Backup Point**
   - Find backup before problematic deployment
   - Note the timestamp
   - Download backup (optional, for safety)

4. **Restore from Backup**
   ```sql
   -- Supabase provides point-in-time recovery
   -- Follow their dashboard instructions for restoration
   ```

5. **Verify Data Integrity**
   - Check critical tables
   - Verify user data intact
   - Test queries

6. **Restart Application**
   - Deploy working application version
   - Test database connections
   - Monitor for issues

**WARNING**: Database rollback will lose ALL data changes since backup point!

---

## Communication Templates

### Internal Team Alert (Slack/Discord)

```
🚨 ROLLBACK IN PROGRESS

Issue: [Brief description]
Severity: P0 - Critical
Action: Rolling back to previous deployment

Current Status: Initiating rollback
ETA: 3 minutes

Team Members:
- @techLead: Executing rollback
- @devops: Monitoring systems
- @support: Handling user inquiries

Updates: Will post every 2 minutes
```

### Status Update (During Rollback)

```
🔄 ROLLBACK UPDATE

Status: Rollback 50% complete
Current: Promoting previous deployment
Next: Verification testing

No action needed from team.
```

### Resolution Message

```
✅ INCIDENT RESOLVED

Issue: [Brief description]
Resolution: Rollback completed successfully
Duration: X minutes
Users Affected: ~X

Current Status: All systems normal
Monitoring: Increased monitoring for next 2 hours

Post-mortem: Will be shared in #incidents channel
```

### User-Facing Message (If Needed)

```
We experienced a brief technical issue that has now been resolved.
All services are operating normally. We apologize for any inconvenience.

If you continue to experience issues, please contact support@yourdomain.com
```

---

## Prevention Measures

### Before Every Deployment

1. **Staging Testing**
   - [ ] Deploy to staging first
   - [ ] Run full test suite
   - [ ] Manual testing of critical paths
   - [ ] Load testing (if major changes)

2. **Gradual Rollout (Future)**
   - Consider implementing canary deployments
   - Route 10% of traffic to new version first
   - Monitor for issues before full rollout

3. **Pre-Deployment Checklist**
   - [ ] All tests passing
   - [ ] Code reviewed
   - [ ] Database migrations tested
   - [ ] Environment variables verified
   - [ ] Rollback plan ready

### Monitoring for Early Detection

1. **Set Aggressive Alerts**
   - Error rate >2% = Warning
   - Error rate >5% = Critical
   - Response time >1s = Warning
   - Response time >2s = Critical

2. **Watch First 30 Minutes**
   - After every deployment, monitor actively
   - Check error dashboard every 5 minutes
   - Test critical user journeys
   - Be ready to rollback quickly

---

## Emergency Contacts

**If Rollback Fails**:
1. Vercel Support: https://vercel.com/support (Enterprise support if available)
2. Supabase Support: https://supabase.com/support
3. Anthropic Support: support@anthropic.com

**Team Contacts**:
- Tech Lead: [Phone/Telegram]
- DevOps: [Phone/Telegram]
- Product Owner: [Phone/Telegram]

**Escalation Path**:
1. Team Lead attempts rollback
2. If fails after 2 attempts, contact Vercel support
3. If data issues, contact Supabase support
4. If complete failure, consider temporary maintenance page

---

## Rollback Testing

### Pre-Launch Rollback Test

**Schedule**: Day 6 (before launch)

1. **Deploy Test Change**
   - Make small, obvious change (e.g., change homepage title)
   - Deploy to production
   - Verify change is live

2. **Practice Rollback**
   - Use Vercel dashboard method
   - Time how long it takes
   - Verify rollback works
   - Document any issues

3. **Practice Communication**
   - Send test alert to team
   - Practice status updates
   - Review templates

**Goal**: Entire team comfortable with rollback process

---

## Rollback Metrics to Track

After each rollback, document:
- Time to detect issue: ___ minutes
- Time to decide on rollback: ___ minutes
- Time to execute rollback: ___ minutes
- Time to verify resolution: ___ minutes
- **Total downtime**: ___ minutes
- Users affected: approximately ___
- Data lost: Yes/No (details)

**Target Metrics**:
- Detection: <5 minutes
- Decision: <3 minutes
- Execution: <3 minutes
- Verification: <5 minutes
- **Total Recovery Time**: <15 minutes

---

## Quick Reference Card

**Print this and keep handy during launch:**

```
╔════════════════════════════════════════════╗
║  CHATGPT PH - EMERGENCY ROLLBACK CARD     ║
╠════════════════════════════════════════════╣
║                                            ║
║  ROLLBACK TRIGGERS:                        ║
║  • Site down                               ║
║  • Auth broken                             ║
║  • Error rate >10%                         ║
║  • Database failures                       ║
║                                            ║
║  FASTEST ROLLBACK METHOD:                  ║
║  1. Go to vercel.com/dashboard             ║
║  2. Select ChatGPT Philippines             ║
║  3. Click Deployments tab                  ║
║  4. Find last good deployment              ║
║  5. Click ⋯ → Promote to Production        ║
║  6. Wait 60 seconds                        ║
║  7. Verify site works                      ║
║                                            ║
║  VERIFY ROLLBACK:                          ║
║  curl -I https://yourdomain.com            ║
║  (should return 200 OK)                    ║
║                                            ║
║  EMERGENCY CONTACTS:                       ║
║  Tech Lead: [phone]                        ║
║  Vercel Support: vercel.com/support        ║
║                                            ║
║  RULE: When in doubt, rollback first!      ║
╚════════════════════════════════════════════╝
```

---

**Remember**: A rollback is not a failure. It's a success in protecting users from a bad deployment. Better to rollback quickly and fix properly than to leave users with a broken experience.
