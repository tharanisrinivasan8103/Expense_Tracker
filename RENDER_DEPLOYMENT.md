# Render Backend Deployment Guide

## Step 1: Prepare Your Repository
Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "chore: prepare for Render deployment"
git push origin main
```

## Step 2: Create MySQL Database on Render

1. Go to [render.com](https://render.com)
2. **Sign up/Login** with GitHub
3. Click **"+ New +"** → **MySQL**
4. Configure:
   - **Name**: `expense-tracker-db` (or your choice)
   - **Database**: `expense_tracker`
   - **Username**: `admin` (keep secure)
   - **Region**: Select your closest region
   - **Plan**: Free tier available
5. Click **Create Database**
6. **Copy the connection string** (Internal Database URL) — you'll need this later

Example internal URL: `mysql://admin:password@dpg-xyz.render.internal:3306/expense_tracker`

## Step 3: Deploy Node.js Backend

1. Click **"+ New +"** → **Web Service**
2. **Connect your GitHub repository** (`expense-tracker`)
3. Fill in:
   - **Name**: `expense-tracker-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node backend/server.js`)
   - **Root Directory**: Leave blank (repo root) OR enter `backend/`
4. Click **Create Web Service**

## Step 4: Set Environment Variables in Render

In the Render dashboard for your web service:

1. Go to **Environment** tab
2. Add these variables:

```
DB_HOST=dpg-xyz.render.internal
DB_USER=admin
DB_PASSWORD=your_password_here
DB_NAME=expense_tracker
DB_PORT=3306
NODE_ENV=production
PORT=10000
```

Get the exact `DB_HOST`, `DB_USER`, `DB_PASSWORD` from your MySQL service page.

3. Click **Save** — Render will redeploy automatically

## Step 5: Update Frontend API URL

In your frontend Netlify environment variables, set:
```
REACT_APP_API_URL=https://expense-tracker-api.onrender.com/api
```

Replace `expense-tracker-api` with your actual Render service name (visible in Render dashboard).

## Step 6: Verify Deployment

- Visit `https://expense-tracker-api.onrender.com/` — should see "Expense Tracker API"
- Check Render logs in the **Logs** tab if there are issues
- Test API: `https://expense-tracker-api.onrender.com/api/auth/` (should return something)

## Troubleshooting

### Database Connection Error
- Verify `DB_HOST` uses the **Internal Database URL** (not external)
- Check DB is in **same region** as web service
- Ensure credentials match exactly

### Port Binding Error
- Render assigns a dynamic port; `server.js` uses `process.env.PORT` ✓ (already correct)
- Do NOT hardcode port 5000

### Build Fails
- Check logs in Render dashboard
- Ensure `package.json` has `npm start` script
- If using monorepo, set **Root Directory** to `backend/`

---

Need help with any of these steps?
