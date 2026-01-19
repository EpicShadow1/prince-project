# 🚀 Prince Project Deployment Guide (FREE)

**Stack:** Netlify (Frontend) + Railway (Backend) + FreeSQLDatabase (MySQL)

---

## 📋 Step 1: Setup Free MySQL Database

### Using FreeSQLDatabase.com (Easiest & Completely Free)

1. **Go to:** https://www.freesqldatabase.com/
2. **Click "Sign Up"** and create a free account
3. **Create a new database:**
   - Database Name: `kaduna_court_db` (or any name you want)
   - Keep note of:
     - Database Host (e.g., `sql12.freesqldatabase.com`)
     - Database Name
     - Username
     - Password
4. **In phpMyAdmin (their interface):**
   - Copy entire contents of `Backend/database/schema.sql`
   - Paste into **SQL** tab and execute
   - Your tables are now created!

**Alternative:** db4free.net (same process, also free)

---

## 🚂 Step 2: Deploy Backend to Railway

### 2.1 Prepare Your Repository

1. **Add .gitignore** (to exclude .env):
   Create a `.gitignore` file in root if it doesn't exist with:
   ```
   node_modules/
   .env
   .env.local
   .env.*.local
   dist/
   build/
   .DS_Store
   Backend/uploads/
   ```

2. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

### 2.2 Deploy on Railway

1. **Go to:** https://railway.app/
2. **Sign up with GitHub** (connect your repo)
3. **Create new project → Deploy from GitHub**
4. **Select your repository**
5. **Add environment variables:**
   - Click **Variables** in Railway dashboard
   - Add all from `.env.production`:
   ```
   PORT=3000
   NODE_ENV=production
   DB_HOST=sql12.freesqldatabase.com (from FreeSQLDatabase)
   DB_PORT=3306
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=kaduna_court_db
   JWT_SECRET=generate_random_string_32_chars_minimum
   JWT_REFRESH_SECRET=another_random_string_32_chars
   JWT_EXPIRY=24h
   JWT_REFRESH_EXPIRY=7d
   CORS_ORIGIN=https://your-netlify-domain.netlify.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

6. **Configure build settings:**
   - Build Command: `cd Backend && npm install`
   - Start Command: `npm start`
   - Working Directory: `Backend` (important!)

7. **Deploy!** Railway will give you a URL like:
   ```
   https://your-app.up.railway.app
   ```
   Copy this URL - you'll need it for frontend

---

## 🌐 Step 3: Deploy Frontend to Netlify

### 3.1 Prepare Frontend

1. **Create `netlify.toml`** in root directory:
   ```toml
   [build]
   command = "npm run build"
   publish = "dist"
   
   [build.environment]
   NODE_VERSION = "18"
   
   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

2. **Update API URL** in your code:
   
   Create or update [src/services/api.ts](src/services/api.ts) to use environment variable:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
   
   export const api = {
     // ... rest of your code
   };
   ```

3. **Create `.env.production`** in root:
   ```
   VITE_API_BASE_URL=https://your-app.up.railway.app/api
   ```

### 3.2 Deploy on Netlify

1. **Go to:** https://netlify.com/
2. **Sign up with GitHub**
3. **New site from Git → Select your repository**
4. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Add environment variables:**
   - Go to **Site settings → Build & deploy → Environment**
   - Add: `VITE_API_BASE_URL=https://your-railway-url.up.railway.app/api`
6. **Deploy!**

Netlify will give you a URL like:
```
https://your-site-name.netlify.app
```

---

## ✅ Step 4: Update Backend CORS

After getting your Netlify URL, update Railway environment variable:

```
CORS_ORIGIN=https://your-site-name.netlify.app
```

This allows your frontend to communicate with backend.

---

## 🔑 Important: Create Admin User

After database is set up:

1. **Local test first (optional):**
   ```bash
   cd Backend
   npm run create-admin
   ```

2. **Or via API** (after deployment):
   ```bash
   curl -X POST https://your-railway-url.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email":"admin@kadunacourt.gov.ng",
       "password":"admin123",
       "role":"admin"
     }'
   ```

Admin credentials after running script:
- Email: `admin@kadunacourt.gov.ng`
- Password: `admin123`
- **⚠️ CHANGE THIS AFTER FIRST LOGIN!**

---

## 🧪 Testing Everything

1. **Test Backend Health:**
   ```
   https://your-railway-url.up.railway.app/health
   ```
   Should return: `{"status":"ok",...}`

2. **Test Frontend:**
   Open: `https://your-netlify-site.netlify.app`
   Should load without errors

3. **Test Login:**
   Try logging in with admin credentials

4. **Check Network Tab:**
   - Open DevTools → Network tab
   - Perform a login
   - Check if API calls go to your Railway URL

---

## 💾 Costs

- **Netlify**: FREE (up to 300 minutes/month builds)
- **Railway**: FREE (up to $5 credit/month)
- **FreeSQLDatabase**: FREE (unlimited)
- **Total: $0/month** ✅

---

## 🐛 Troubleshooting

### Frontend can't reach backend
- Check CORS_ORIGIN in Railway matches your Netlify URL
- Check API URL in frontend environment variables
- Check Railway logs for errors

### Database connection error
- Verify credentials in Railway variables
- Test connection in FreeSQLDatabase phpMyAdmin
- Check port is 3306

### Build fails on Netlify
- Check `npm run build` works locally first
- Check all environment variables are set
- Check node_modules are not tracked in git

### Build fails on Railway
- Check `cd Backend && npm install` works
- Check Node version is 18+
- Check `npm start` works locally

---

## 📞 Support Resources

- **Netlify Docs:** https://docs.netlify.com/
- **Railway Docs:** https://docs.railway.app/
- **FreeSQLDatabase:** https://www.freesqldatabase.com/

---

## 🎯 Summary

| Step | Service | Cost | Time |
|------|---------|------|------|
| 1️⃣ Database | FreeSQLDatabase | FREE | 5 min |
| 2️⃣ Backend | Railway | FREE | 10 min |
| 3️⃣ Frontend | Netlify | FREE | 10 min |
| 4️⃣ Connect | Update URLs | - | 5 min |
| **Total** | | **$0** | **30 min** |

**You're ready to go live! 🎉**
