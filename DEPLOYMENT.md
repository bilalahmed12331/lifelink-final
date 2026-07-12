# Vercel Deployment Guide for LifeLink

## Prerequisites
- GitHub account
- Vercel account
- MySQL database (recommended: PlanetScale, Railway, or AWS RDS)

## Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Add the remote repository:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Database

Since Vercel doesn't support MySQL directly, you need a cloud MySQL provider:

### Option A: PlanetScale (Recommended - Free tier available)
1. Go to [planetscale.com](https://planetscale.com) and sign up
2. Create a new database named "lifelink"
3. Get your connection details from the dashboard
4. Import the schema from `api/src/config/schema.sql`

### Option B: Railway
1. Go to [railway.app](https://railway.app) and sign up
2. Create a new MySQL database
3. Get your connection details
4. Import the schema from `api/src/config/schema.sql`

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration from `vercel.json`

## Step 4: Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```
DB_HOST = your_database_host
DB_PORT = 3306
DB_USER = your_database_user
DB_PASSWORD = your_database_password
DB_NAME = lifelink
JWT_SECRET = generate_a_secure_random_string
CLIENT_URL = your_vercel_domain_url
```

**Important:** Generate a secure JWT_SECRET using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Deploy

1. Click "Deploy" in Vercel
2. Wait for the deployment to complete
3. Your site will be live at `https://your-project-name.vercel.app`

## Step 6: Test the Application

1. Visit your deployed URL
2. Test the signup/login functionality
3. Verify API endpoints are working
4. Check the donor and patient dashboards

## Troubleshooting

### Database Connection Issues
- Verify your database allows connections from Vercel's IP ranges
- Check that your database credentials are correct
- Ensure the database schema is imported

### API Routes Not Working
- Check Vercel deployment logs
- Verify environment variables are set correctly
- Ensure the `vercel.json` configuration is correct

### Frontend Not Loading
- Clear browser cache
- Check that static files are being served from `/public`
- Verify the API_BASE in `public/js/api.js` is using `/api` in production

## Local Development

To run locally:
```bash
# Backend
cd api
npm install
npm run dev

# Frontend (serve the public folder)
cd ..
npx serve public
```

## Database Schema Import

To import the schema to your cloud database:

```bash
# Using PlanetScale CLI
pscale shell lifelink < api/src/config/schema.sql

# Or manually copy the contents of api/src/config/schema.sql
# and run it in your database's SQL interface
```
