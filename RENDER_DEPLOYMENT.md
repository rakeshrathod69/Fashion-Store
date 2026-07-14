# 🚀 Render Deployment Guide — Aura Luxe Fashion Store

A complete step-by-step guide to deploy your **Spring Boot backend**, **Vite React frontend**, and **MySQL database** to [Render](https://render.com).

---

## 🗂️ Project Stack Overview

| Layer     | Technology              | Render Service Type      |
|-----------|-------------------------|--------------------------|
| Frontend  | React + Vite            | Static Site              |
| Backend   | Spring Boot 3 (Java 17) | Web Service (Docker)     |
| Database  | MySQL                   | ⚠️ External (PlanetScale / Railway / Aiven) |

> [!IMPORTANT]
> Render does **not** offer a native MySQL service (only PostgreSQL). You will need to use an external MySQL provider. Your project already uses Railway MySQL — you can keep using it or migrate. See Step 1 below.

---

## ⚠️ Required Code Changes Before Deploying

Before pushing to Render, make the following changes to your project files:

### 1. 🔒 Remove Hardcoded Credentials from `application.properties`

**File:** `backend/src/main/resources/application.properties`

Your current file has hardcoded DB credentials as default fallback values. **Remove them** and rely only on environment variables:

```properties
# ✅ REPLACE THIS FILE CONTENT WITH:

spring.application.name=fashion-store-backend
server.port=${PORT:8080}

spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

app.jwt.secret=${APP_JWT_SECRET}
app.jwt.expiration-ms=86400000
app.cors.allowed-origins=${APP_CORS_ALLOWED_ORIGINS}
```

> [!CAUTION]
> Never commit real DB passwords or JWT secrets to Git. The current `application.properties` file has them hardcoded — fix this before pushing to GitHub!

---

### 2. 🌐 Ensure `vite.config.js` Exists

**File:** `frontend/vite.config.js`

Make sure you have a proper Vite config with React plugin:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
})
```

---

### 3. 📦 Update `.gitignore` (Root Level)

**File:** `.gitignore`

Ensure your `.gitignore` properly excludes secrets and build artifacts:

```gitignore
# Dependencies
node_modules/
frontend/node_modules/

# Build outputs
dist/
frontend/dist/
target/
backend/target/

# IDE
.idea/
.vscode/

# Logs
*.log

# Environment secrets
.env
.env.local
backend/src/main/resources/application.properties

# OS
.DS_Store
Thumbs.db
```

> [!WARNING]
> If you add `application.properties` to `.gitignore`, create a separate `application-example.properties` (already exists!) so others can set up locally.

---

### 4. 🔄 Update `application-example.properties`

**File:** `backend/src/main/resources/application-example.properties`

Make sure it contains only placeholder values (no real secrets):

```properties
spring.application.name=fashion-store-backend
server.port=8080

spring.datasource.url=jdbc:mysql://your-host:3306/your-db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

app.jwt.secret=your-very-long-random-jwt-secret-key-here
app.jwt.expiration-ms=86400000
app.cors.allowed-origins=http://localhost:5173,https://your-frontend.onrender.com
```

---

## 📋 Pre-Deployment Checklist

- [ ] Code pushed to a **GitHub repository**
- [ ] `.env` and `application.properties` are in `.gitignore`
- [ ] Hardcoded credentials removed from `application.properties`
- [ ] MySQL database is accessible from the internet (Railway / PlanetScale / Aiven)
- [ ] `Dockerfile` is present in the `backend/` folder ✅ (already exists)
- [ ] `vite.config.js` exists in `frontend/` folder

---

## 🗄️ Step 1 — Set Up External MySQL Database

Since you're already using **Railway MySQL**, you can continue using it.

### Option A: Keep Railway MySQL (Recommended if already working)

1. Go to [Railway Dashboard](https://railway.app)
2. Open your MySQL service
3. Go to **Variables** tab and note down:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_DATABASE`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
4. Your connection URL format:
   ```
   jdbc:mysql://HOST:PORT/DATABASE?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   ```

### Option B: Use PlanetScale (Free Tier)

1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Create a branch → Connect → choose **Java / JDBC**
4. Copy the connection string

### Option C: Use Aiven for MySQL (Free Tier)

1. Sign up at [aiven.io](https://aiven.io)
2. Create a MySQL service
3. Go to **Connection Info** → copy JDBC URL, username, password

---

## 🔧 Step 2 — Push Project to GitHub

```bash
# 1. Navigate to project root
cd "C:\Users\RAKESH\OneDrive\Desktop\fashion store"

# 2. Initialize git (if not already done)
git init

# 3. Add remote origin (create repo at github.com/new first!)
git remote add origin https://github.com/YOUR_USERNAME/fashion-store.git

# 4. Stage all files
git add .

# 5. Commit
git commit -m "Initial commit: Aura Luxe Fashion Store"

# 6. Push to GitHub
git push -u origin main
```

> [!NOTE]
> Replace `YOUR_USERNAME` with your actual GitHub username. Create the repository at [github.com/new](https://github.com/new) first — do NOT initialize it with a README.

---

## 🐳 Step 3 — Deploy Backend on Render (Web Service)

Your backend already has a `Dockerfile` ✅ — Render will use it automatically.

### 3.1 Create the Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **New +** → **Web Service**
3. Connect your **GitHub account** and select your repository
4. Configure the service:

| Setting             | Value                         |
|---------------------|-------------------------------|
| **Name**            | `fashion-store-backend`       |
| **Region**          | Oregon (US West) or closest   |
| **Branch**          | `main`                        |
| **Root Directory**  | `backend`                     |
| **Runtime**         | **Docker**                    |
| **Dockerfile Path** | `./Dockerfile`                |
| **Instance Type**   | Free (or Starter for prod)    |

### 3.2 Set Environment Variables for Backend

In Render dashboard → your Web Service → **Environment** tab:

| Variable Name                  | Value                                                                                          |
|--------------------------------|------------------------------------------------------------------------------------------------|
| `SPRING_DATASOURCE_URL`        | `jdbc:mysql://HOST:PORT/DB?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`       |
| `SPRING_DATASOURCE_USERNAME`   | Your MySQL username                                                                            |
| `SPRING_DATASOURCE_PASSWORD`   | Your MySQL password                                                                            |
| `APP_JWT_SECRET`               | A long random string (minimum 32 characters)                                                   |
| `APP_CORS_ALLOWED_ORIGINS`     | `https://fashion-store-frontend.onrender.com` (update after deploying frontend)                |

> [!TIP]
> Generate a secure JWT secret in PowerShell:
> ```powershell
> -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
> ```

5. Click **Create Web Service** — Render builds the Docker image and deploys
6. Note your backend URL: `https://fashion-store-backend.onrender.com`

---

## 🌍 Step 4 — Deploy Frontend on Render (Static Site)

### 4.1 Create the Static Site

1. Click **New +** → **Static Site**
2. Select the same GitHub repository
3. Configure:

| Setting               | Value                          |
|-----------------------|--------------------------------|
| **Name**              | `fashion-store-frontend`       |
| **Branch**            | `main`                         |
| **Root Directory**    | `frontend`                     |
| **Build Command**     | `npm install && npm run build` |
| **Publish Directory** | `dist`                         |

### 4.2 Set Environment Variables for Frontend

| Variable Name   | Value                                                    |
|-----------------|----------------------------------------------------------|
| `VITE_API_URL`  | `https://fashion-store-backend.onrender.com/api`         |

> [!IMPORTANT]
> Vite bakes environment variables at **build time**, not runtime. The `VITE_API_URL` must be set in Render's environment panel **before** the build runs.

### 4.3 Add a Redirect Rule (for React Router)

Since your app uses **React Router**, you need to redirect all routes to `index.html`:

1. Go to your Static Site → **Redirects/Rewrites** tab
2. Add a rule:

| Source | Destination  | Action  |
|--------|--------------|---------|
| `/*`   | `/index.html`| Rewrite |

---

## 🔁 Step 5 — Update Backend CORS After Frontend is Live

Once your frontend URL is confirmed (e.g., `https://fashion-store-frontend.onrender.com`):

1. Go to your Backend Web Service on Render
2. Go to **Environment** tab
3. Update `APP_CORS_ALLOWED_ORIGINS`:
   ```
   https://fashion-store-frontend.onrender.com,http://localhost:5173
   ```
4. Click **Save** — Render will redeploy automatically

---

## 🔍 Step 6 — Verify Deployment

### Test Backend API

Open in browser:
```
https://fashion-store-backend.onrender.com/api/products
```
You should receive a JSON response with your products.

### Test Frontend

Open:
```
https://fashion-store-frontend.onrender.com
```
You should see the Aura Luxe homepage. Try logging in and browsing products.

### Common Issues & Fixes

| Issue                      | Fix                                                                 |
|----------------------------|---------------------------------------------------------------------|
| Backend shows 502/503      | Check Render logs — likely DB connection failure or build error     |
| Frontend shows blank page  | Check browser console for CORS or API URL errors                   |
| Login fails                | Verify `APP_JWT_SECRET` is set and CORS includes frontend URL       |
| Products don't load        | Verify `VITE_API_URL` ends with `/api` and matches backend URL     |
| React Router 404 on refresh| Add `/* → /index.html` rewrite rule in Static Site settings        |
| Cold start is slow         | Free tier spins down after inactivity; upgrade to Starter ($7/mo)  |

---

## 📁 Final Project Structure on GitHub

```
fashion-store/
├── backend/
│   ├── Dockerfile                              ✅ Ready
│   ├── pom.xml
│   └── src/main/resources/
│       ├── application.properties              ⛔ Add to .gitignore!
│       └── application-example.properties      ✅ Commit this
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js                          ✅ Ensure exists
│   ├── .env.example                            ✅ Commit this
│   └── src/
├── .gitignore                                  ✅ Must exclude secrets
└── RENDER_DEPLOYMENT.md                        ✅ This guide
```

---

## 💡 Production Tips

- **Free Tier Cold Starts**: Render Free services sleep after 15 min of inactivity; first request takes 30–60 seconds. Use **Starter ($7/mo)** to avoid this.
- **Logs**: View real-time logs in Render Dashboard → your service → **Logs** tab
- **Custom Domain**: Available under **Settings → Custom Domains** (even on free static sites)
- **Auto-Deploy**: Every push to `main` triggers a new deployment automatically

---

## 🆘 Support Resources

- 📖 [Render Docs — Docker Web Services](https://render.com/docs/docker)
- 📖 [Render Docs — Static Sites](https://render.com/docs/static-sites)
- 📖 [Render Docs — Environment Variables](https://render.com/docs/environment-variables)
- 🐛 [Render Status Page](https://status.render.com)
