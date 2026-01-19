# 🚀 QUICK START: Free Deployment Guide

**Total Cost: $0** | **Uptime: 24/7** | **Setup Time: ~30 minutes**

---

## 📋 Quick Overview

| Component | Service | Cost | Uptime |
|-----------|---------|------|--------|
| Frontend | Netlify | FREE | 99.9% |
| Backend | Railway | FREE ($5/mo credit) | 99% |
| Database | FreeSQLDatabase | FREE | 99% |
| **Total** | | **$0** | **24/7** |

---

## ⚡ STEP-BY-STEP

### STEP 1: Create Free MySQL Database (5 minutes)

1. Go to **https://www.freesqldatabase.com/**
2. Click **"Sign Up"** → Create account
3. Click **"Create New Database"**
   - Database Name: `kaduna_court_db`
   - Click **Create**
4. You'll get credentials like:
   ```
   Host: sql12.freesqldatabase.com
   Database: sql12345678_kaduna_court_db
   Username: sql12345678_user
   Password: abc123xyz...
   ```
5. Copy these somewhere safe ⭐

6. **Import Database Schema:**
   - In FreeSQLDatabase, click **"phpMyAdmin"**
   - Go to **SQL tab**
   - Copy contents of `Backend/database/schema.sql`
   - Paste and execute
   - Done! ✅

---

### STEP 2: Push Code to GitHub (5 minutes)

In terminal at project root:

```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/prince-project.git
git branch -M main
git push -u origin main
```

---

### STEP 3: Deploy Backend to Railway (10 minutes)

1. Go to **https://railway.app/**
2. **Sign up with GitHub** (connect your GitHub account)
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your `prince-project` repository
5. Railway will auto-detect your project
6. Go to **Variables** tab and add these:

```
PORT=3000
NODE_ENV=production
DB_HOST=sql12.freesqldatabase.com
DB_PORT=3306
DB_USER=sql12345678_user
DB_PASSWORD=abc123xyz...
DB_NAME=sql12345678_kaduna_court_db
JWT_SECRET=generate-random-string-here-min-32-chars
JWT_REFRESH_SECRET=generate-another-random-string-min-32-chars
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=https://YOUR_NETLIFY_DOMAIN.netlify.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

7. **Settings:**
   - Root Directory: `Backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

8. Click **Deploy** ✅
9. After deployment, Railway gives you a URL like:
   ```
   https://your-project.up.railway.app
   ```
   **Copy this URL** 🔗

---

### STEP 4: Deploy Frontend to Netlify (10 minutes)

1. Go to **https://netlify.com/**
2. **Sign up with GitHub** (connect your GitHub account)
3. Click **"New site from Git"**
4. Select your `prince-project` repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click **Deploy** and wait...
7. After deployment, you'll get a URL like:
   ```
   https://your-site-123456.netlify.app
   ```
   **Copy this URL** 🔗

---

### STEP 5: Connect Frontend to Backend

1. Go back to **Railway dashboard**
2. Find your backend service
3. Go to **Variables**
4. Update `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://your-site-123456.netlify.app
   ```
5. Service redeploys automatically ✅

---

### STEP 6: Update Frontend API URL

1. Go to **Netlify** → **Site settings**
2. Go to **Build & deploy** → **Environment**
3. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-project.up.railway.app/api
   ```
4. Trigger a **redeploy**:
   - Netlify → **Deploys** → **Trigger deploy**

---

### STEP 7: Test Everything ✅

1. **Test Backend is running:**
   ```
   https://your-project.up.railway.app/health
   ```
   Should show: `{"status":"ok",...}`

2. **Open Frontend:**
   ```
   https://your-site-123456.netlify.app
   ```
   Should load without errors

3. **Test Login:**
   - Email: `admin@kadunacourt.gov.ng`
   - Password: `admin123`
   - If login works, everything is connected! 🎉

---

## 🔐 Generate Random Secrets

For JWT secrets, use one of these tools:
- https://randomkeygen.com/ (copy the "CodeIgniter Encryption Keys")
- Or run in terminal:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Frontend can't reach backend** | Check CORS_ORIGIN in Railway matches your Netlify URL |
| **Database connection error** | Check DB credentials in Railway match FreeSQLDatabase |
| **Login not working** | Check network tab in DevTools → see API errors |
| **Build fails on Netlify** | Run `npm run build` locally first to debug |
| **Backend won't start** | Check Railway logs for errors |

---

## 📊 Monitor Your Deployment

- **Railway Dashboard:** https://railway.app/dashboard (see logs, metrics)
- **Netlify Dashboard:** https://app.netlify.com (see deploys, logs)
- **FreeSQLDatabase:** https://www.freesqldatabase.com (see database status)

---

## 💡 Pro Tips

1. **Keep your Database Credentials Safe** - Never share them
2. **Change Admin Password** - After first login, change admin password
3. **Monitor Logs** - Check Railway logs if something breaks
4. **Free Tier Limits:**
   - Railway: 750 free dyno hours/month (resets monthly)
   - Netlify: 300 build minutes/month
   - FreeSQLDatabase: Unlimited (with occasional cleanup)

---

## 🎯 You're Done! 

Your app is now live 24/7 for FREE! 🚀

**Your URLs:**
- Frontend: `https://your-site-123456.netlify.app`
- Backend API: `https://your-project.up.railway.app`
- Database: `sql12.freesqldatabase.com`

---

**Need help?** Check the full guide in `DEPLOYMENT_GUIDE.md`
