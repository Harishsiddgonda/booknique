# ☁️ BOOKNIQUE: Render Cloud Deployment Guide

This guide details the deployment of the complete **BOOKNIQUE** ecosystem on Render using the recommended multi-service cloud architecture.

---

## 🏛️ 1. Architecture Overview

| Component | Render Service Type | Root Directory | Build Command | Run Command / Publish Path |
| :--- | :--- | :--- | :--- | :--- |
| **Website (Frontend)** | **Static Site** | `frontend` | `npm install && npm run build` | `dist` (SPA rewrite: `/* ➔ /index.html`) |
| **API Backend** | **Web Service** | `backend` | `npm install` | `npm start` (Node.js on `0.0.0.0:10000`) |
| **Cloud Database** | **PostgreSQL** | Managed Database | — | Persistent relational database |
| **Android Application** | **Local Gradle Build** | `frontend/android` | `gradlew assembleRelease` | [`Booknique-Release.apk`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/Booknique-Release.apk) |

---

## 🚀 2. Automated 1-Click Blueprint Deployment (Recommended)

The repository includes a production-ready Render Blueprint file: [`render.yaml`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/render.yaml).

### Step 1: Push Project to GitHub
```bash
git add .
git commit -m "Configure production Render deployment"
git push origin master
```

### Step 2: Deploy on Render via Blueprint
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click the **New +** button in the top right ➔ Select **Blueprint**.
3. Connect your GitHub repository.
4. Render will inspect [`render.yaml`](file:///c:/Users/HarishRuler/Downloads/rsr-books-toys-rental/render.yaml) and automatically create:
   - **`booknique-db`**: A managed PostgreSQL database instance.
   - **`booknique-api`**: A Node.js web service linked to `booknique-db` via `DATABASE_URL`.
   - **`booknique-web`**: A static site serving the React SPA.
5. Click **Apply**. Render will automatically provision the database, install dependencies, run migrations, and launch all services.

---

## 🛠️ 3. Manual Step-by-Step Deployment (Alternative)

If you prefer provisioning each service individually through the Render UI:

### Service A: Managed PostgreSQL Database
1. In Render Dashboard, click **New +** ➔ **PostgreSQL**.
2. **Name**: `booknique-db`
3. **Database**: `booknique_rental_db`
4. **User**: `booknique_user`
5. **Region**: Singapore (or nearest to your customers)
6. **Plan**: Free (or Starter $7/mo for long-term production persistence)
7. Click **Create Database**.
8. Once provisioned, copy the **Internal Database URL** (for backend inside Render) and **External Database URL** (for remote access).

### Service B: Node.js Backend Web Service
1. Click **New +** ➔ **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `booknique-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Under **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=generate_a_random_32_char_secret_key
   DATABASE_URL=<Paste your Internal Database URL from Service A>
   FRONTEND_URL=https://booknique-web.onrender.com
   CORS_ORIGINS=https://booknique-web.onrender.com,capacitor://localhost,http://localhost
   ```
5. Click **Create Web Service**.

### Service C: React Frontend Static Site
1. Click **New +** ➔ **Static Site**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `booknique-web`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Redirects / Rewrites**:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
5. Under **Environment Variables**, add:
   ```env
   VITE_API_URL=https://booknique-api.onrender.com
   ```
6. Click **Create Static Site**.

---

## ⚠️ 4. Important Free-Tier Considerations & Workarounds

> [!IMPORTANT]
> ### 1. Backend Inactivity Spindown (Cold Starts)
> Render's Free Web Services spin down after **15 minutes of inactivity**. When a new request arrives, a cold start takes approximately **30 to 50 seconds** to wake up.
> - **Production Workaround**: Set up a free monitoring ping using [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org) targeting `https://booknique-api.onrender.com/api/health` every 10 minutes to keep the service warm 24/7.
> - **Commercial Upgrade**: Render's **Starter plan ($7/month)** disables spindown completely and provides 24/7 instant response.

> [!WARNING]
> ### 2. Free PostgreSQL Expiration
> Render's **Free PostgreSQL** databases are designed for testing and expire **90 days** after creation.
> - For a live commercial rental business, upgrade to the **Starter PostgreSQL plan ($7/month)** to ensure permanent persistent storage, daily automated backups, and zero downtime.

---

## 📱 5. Connecting the Android App to Live Render Backend

Once your backend is live at `https://booknique-api.onrender.com`:

1. Open the **BOOKNIQUE** Android app on your phone.
2. Tap the **Profile** tab in the bottom navigation bar.
3. Scroll to **Developer & Network Settings**.
4. Select **`https://booknique-api.onrender.com (Render Cloud)`** from the dropdown (or paste your custom Render domain).
5. Tap **Save Settings**. The app will immediately link to your live cloud database!
