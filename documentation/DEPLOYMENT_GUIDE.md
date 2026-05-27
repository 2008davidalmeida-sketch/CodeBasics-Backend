# Deployment Guide - CodeBasics Backend

## 🚀 Production Deployment to Render

This guide covers deploying CodeBasics Backend to **Render** (formerly Heroku alternative).

---

## Pre-Deployment Checklist

- [ ] All code committed and pushed to GitHub
- [ ] All tests passing: `npm test`
- [ ] No `console.log` statements (use logger instead)
- [ ] `.env` file NOT committed (check `.gitignore`)
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] MongoDB Atlas cluster created
- [ ] Redis instance provisioned
- [ ] Google OAuth credentials configured

---

## Step 1: Prepare Production Environment

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster (free tier available)
3. Create database user with strong password
4. Whitelist Render IPs (or allow all from `.com`)
5. Copy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/`

### 1.2 Create Redis Instance

**Option A: Redis Cloud (Recommended)**
1. Go to [Redis Cloud](https://redis.com/try-free)
2. Create free tier database
3. Note connection string: `redis://:password@host:port`

**Option B: Self-hosted Redis on Render**
1. Create new Redis service on Render
2. Use provided connection string

### 1.3 Generate Production JWT Secret

```bash
# Generate a strong random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save this value for later use in environment variables.

---

## Step 2: Set Up Render Account

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub account
3. Authorize Render to access your GitHub repositories

---

## Step 3: Create Web Service on Render

### 3.1 New Web Service

1. Dashboard → New + → Web Service
2. Connect your GitHub repository
3. Select `CodeBasics-Backend` repository

### 3.2 Configure Service

**Basic Settings:**
- **Name**: `codebasics-backend`
- **Environment**: Node
- **Region**: Choose closest to users
- **Branch**: `main`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Auto-deploy**: Enable (auto-deploy on git push)

### 3.3 Set Environment Variables

In Render dashboard:
1. Go to Environment
2. Add each variable:

```env
NODE_ENV=production

MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/codebasics

REDIS_URL=redis://:password@host:port

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
ALLOWED_EMAIL_DOMAIN=example.com

JWT_SECRET=your-generated-secret-from-step-1-3

CLIENT_URL=https://your-frontend.com

GEMINI_API_KEY=your-gemini-api-key

PORT=5000
```

---

## Step 4: Update Google OAuth Credentials

### 4.1 Get Render Backend URL

After deployment, your backend URL will be:
```
https://codebasics-backend.onrender.com
```

### 4.2 Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to Credentials → OAuth 2.0 Client IDs
4. Update **Authorized redirect URIs**:
   ```
   https://codebasics-backend.onrender.com/auth/google/callback
   ```
5. Update **Authorized JavaScript origins**:
   ```
   https://codebasics-backend.onrender.com
   ```

---

## Step 5: Deploy Application

### 5.1 Manual Deployment

1. Push code to GitHub:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. Render auto-deploys on git push (if auto-deploy enabled)

### 5.2 Monitor Deployment

1. Go to Render dashboard
2. Click on your service
3. Go to "Logs" to watch deployment progress
4. Wait for "Build succeeded" message

---

## Step 6: Verify Deployment

### 6.1 Health Check

```bash
curl https://codebasics-backend.onrender.com/health

# Expected response:
# {"status":"ok"}
```

### 6.2 Test Authentication

1. Visit frontend
2. Click "Login with Google"
3. Authorize app
4. Check if redirected to dashboard

### 6.3 Test API Endpoints

```bash
# Get current user (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://codebasics-backend.onrender.com/auth/me

# List challenges
curl https://codebasics-backend.onrender.com/challenges
```

### 6.4 Check Logs

In Render dashboard → Logs:
- Look for any errors
- Verify database and Redis connections
- Check if workers are processing

---

## Step 7: Configure Frontend

Update your frontend `.env`:

```env
VITE_API_URL=https://codebasics-backend.onrender.com
VITE_CLIENT_URL=https://your-frontend.com
```

Deploy frontend and test login flow.

---

## Troubleshooting

### Build Fails

**Error**: `npm ERR! code EACCES`

**Solution**: Ensure `npm install` completes before build

```
Build Command: npm install && npm run build
```

### Cannot Connect to MongoDB

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solution**:
1. Verify `MONGODB_URI` in Render environment
2. Check IP whitelist in MongoDB Atlas (allow all)
3. Test connection locally with same URI

### Cannot Connect to Redis

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution**:
1. Verify `REDIS_URL` in Render environment
2. Use Redis Cloud connection string (includes password)
3. Check Redis instance is running: `redis-cli ping`

### Google OAuth Fails

**Error**: `Error: invalid_client` or redirect loop

**Solution**:
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` match Google Cloud Console
2. Check authorized redirect URI includes full path:
   ```
   https://codebasics-backend.onrender.com/auth/google/callback
   ```
3. Wait 5 minutes after updating Google Console

### 401 Errors on API Calls

**Problem**: Getting 401 on `/auth/me` endpoint

**Solution**:
1. Verify token is being sent in `Authorization: Bearer {token}` header
2. Check `JWT_SECRET` is identical between dev and prod
3. Verify token hasn't expired (7 day expiration)
4. Check browser Network tab for Authorization header

### Service Sleeps (Free Tier)

**Problem**: First request takes 30+ seconds

**Reason**: Render puts free services to sleep after 15 minutes of inactivity

**Solution**: Upgrade to paid plan for always-on service

---

## Production Best Practices

### 1. Environment Variables

✅ **DO**
- Store all secrets in Render environment, not code
- Use strong random strings for JWT_SECRET
- Different values for dev and prod

❌ **DON'T**
- Commit `.env` file
- Share credentials via Slack/email
- Reuse tokens across environments

### 2. Database

✅ **DO**
- Enable MongoDB backups
- Set up automated backups
- Monitor collection sizes
- Create database indexes

❌ **DON'T**
- Share production database credentials
- Delete data without backup
- Run long-running queries on production

### 3. Monitoring

✅ **DO**
- Check logs regularly: `Render Dashboard → Logs`
- Monitor error rates
- Set up alerts
- Track API response times

❌ **DON'T**
- Ignore error logs
- Log sensitive data (passwords, tokens)
- Leave verbose logging on

### 4. Scaling

Plan for growth:
- Monitor RAM usage (free tier: 512 MB)
- Monitor database query performance
- Cache frequently accessed data
- Use job queues for long tasks

### 5. Security

✅ **DO**
- Keep dependencies updated: `npm audit fix`
- Use HTTPS only (Render handles this)
- Validate all inputs
- Implement rate limiting

❌ **DON'T**
- Use weak passwords
- Allow all email domains
- Expose error details to users

---

## Updating Production

### 1. Make Code Changes

```bash
# Create feature branch
git checkout -b fix/auth-issue

# Make changes and test locally
npm test

# Commit and push
git commit -m "fix: handle expired tokens"
git push origin fix/auth-issue
```

### 2. Create Pull Request

On GitHub, create PR to `main` branch

### 3. Review & Merge

1. Review code
2. Resolve conflicts if any
3. Merge to main

### 4. Auto-Deploy

Render automatically redeploys when main changes:
1. Check Render Logs for deployment progress
2. Verify health check passes
3. Test in production

---

## Rollback to Previous Version

If deployment breaks production:

```bash
# Find last working commit
git log --oneline

# Revert to previous commit
git revert <commit-hash>

# Push to trigger redeploy
git push origin main

# Render will rollback automatically
```

---

## Database Backup & Recovery

### Manual Backup

```bash
# Backup database
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/codebasics" \
  --out=./backup-2026-05-27

# Restore from backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/codebasics" \
  ./backup-2026-05-27
```

### MongoDB Atlas Automatic Backups

1. Go to MongoDB Atlas → Backup
2. Enable automatic backups
3. Set retention policy (e.g., 7 days)
4. Backups run automatically

---

## Monitoring & Maintenance

### Weekly Checks

- [ ] Review logs for errors
- [ ] Check API response times
- [ ] Monitor database size
- [ ] Verify Redis is running smoothly
- [ ] Check error rates

### Monthly Tasks

- [ ] Update dependencies: `npm update`
- [ ] Review security advisories: `npm audit`
- [ ] Clean up old submissions/logs
- [ ] Review database indexes

### Quarterly Tasks

- [ ] Full backup of database
- [ ] Security audit
- [ ] Performance optimization
- [ ] Update documentation

---

## Useful Commands

### View Live Logs

```bash
# In Render dashboard:
# Service → Logs (top right)
# Auto-refresh enabled
```

### Access Database

```bash
# Using MongoDB Compass
# Connection String: mongodb+srv://user:pass@cluster.mongodb.net/

# Or use mongosh CLI
mongosh "mongodb+srv://cluster.mongodb.net/" --username user --password
```

### Restart Service

```bash
# In Render dashboard:
# Service Settings → Environment
# Click "Restart" button
```

### Scale Service

```bash
# Render Dashboard → Service Settings
# Choose instance type (CPU/RAM)
# Changes take effect immediately
```

---

## Cost Estimation

### Free Tier (Excellent for Learning)
- 512 MB RAM web service
- MongoDB Atlas free tier (512 MB)
- Redis Cloud free tier
- **Cost**: $0/month (service sleeps after 15 min inactivity)

### Small Production Setup
- 2 GB RAM web service: $12/month
- MongoDB Atlas shared tier: $0-57/month
- Redis Cloud pro: $15/month
- **Cost**: $27-84/month

### Medium Production Setup
- 4 GB RAM web service: $29/month
- MongoDB Atlas dedicated tier: $100+/month
- Redis Cloud pro: $30/month
- **Cost**: $159+/month

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **Redis Docs**: https://redis.io/documentation
- **Express Docs**: https://expressjs.com

---

**Last Updated**: May 27, 2026

---

## Deployment Checklist Summary

```bash
# 1. Pre-deployment
npm test                    # Tests pass
npm run build              # Builds successfully
git status                 # All changes committed

# 2. Environment setup
# - MongoDB Atlas cluster created
# - Redis instance provisioned
# - Google OAuth updated with Render URL
# - All secrets generated and safe

# 3. Render configuration
# - Web service created
# - Environment variables set
# - Build/Start commands configured
# - Auto-deploy enabled

# 4. Post-deployment
curl https://your-backend.onrender.com/health
# - Health check passes
# - Logs show no errors
# - Frontend can authenticate
# - API endpoints respond

# 5. Monitoring
# - Logs checked for errors
# - Database connection verified
# - Redis connection verified
# - Worker processes running
```
