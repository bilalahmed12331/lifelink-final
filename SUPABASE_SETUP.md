# Supabase Database Setup Guide for LifeLink

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

## Step 2: Create a New Project

1. After logging in, click "New Project"
2. **Organization**: Create or select an organization
3. **Project name**: `lifelink`
4. **Database password**: Generate a strong password (save this!)
5. **Region**: Choose the region closest to your users
6. **Pricing plan**: Select "Free" (500MB database, unlimited API requests)
7. Click "Create new project"
8. Wait for the project to be created (takes ~1-2 minutes)

## Step 3: Get Connection Credentials

1. Once the project is ready, click on it
2. Go to **Settings** → **Database**
3. Scroll down to **Connection info**
4. You'll see connection details like:
   ```
   Host: xxx.supabase.co
   Port: 5432
   Database: postgres
   Username: postgres
   Password: (your database password)
   Connection string: postgresql://postgres:[password]@xxx.supabase.co:5432/postgres
   ```
5. **Save these credentials** - you'll need them for Vercel

## Step 4: Import Database Schema

### Option A: Using Supabase SQL Editor (Easiest)

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the contents of `api/src/config/schema-postgres.sql` from your project
4. Paste it into the SQL editor
5. Click **"Run"** to execute the schema
6. You should see "Success" message

### Option B: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link to your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. Execute the schema:
   ```bash
   supabase db execute api/src/config/schema-postgres.sql
   ```

## Step 5: Verify Tables Created

1. In Supabase, go to **Table Editor** (left sidebar)
2. You should see these tables:
   - `users`
   - `donation_history`
   - `blood_requests`
   - `contact_messages`
   - `admin_accounts`

3. Click on `admin_accounts` table to verify the default admin account was created

## Step 6: Configure Vercel Environment Variables

1. Go to https://vercel.com and import your GitHub repository `lifelink-final`
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

   ```
   DB_HOST = your_supabase_host (e.g., xxx.supabase.co)
   DB_PORT = 5432
   DB_USER = postgres
   DB_PASSWORD = your_supabase_database_password
   DB_NAME = postgres
   DB_SSL = true
   JWT_SECRET = generate_a_secure_random_string
   CLIENT_URL = https://lifelink-final.vercel.app
   ```

4. **Generate JWT_SECRET**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Step 7: Deploy to Vercel

1. In Vercel, click **"Deploy"**
2. Wait for the deployment to complete
3. Your site will be live at `https://lifelink-final.vercel.app`

## Step 8: Test the Application

1. Visit your deployed URL
2. Test user registration (signup)
3. Test login functionality
4. Verify donor/patient dashboards work
5. Check that API calls are successful

## Supabase Free Tier Limits

- **Database**: 500MB storage
- **File storage**: 1GB
- **Bandwidth**: 2GB/month
- **API requests**: Unlimited
- **Emails**: 3/day (Auth emails)
- **Edge functions**: 500,000 invocations/month

This is more than sufficient for your LifeLink application.

## Troubleshooting

### Connection Issues
- Ensure `DB_SSL=true` is set in Vercel environment variables
- Verify your Supabase project is active (not paused)
- Check that you're using the correct database password

### SSL Certificate Issues
If you get SSL errors, the connection is already configured with SSL in `api/src/config/db.js`:
```javascript
ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
```

### Schema Import Issues
- Make sure the schema file is properly formatted
- Check for any PostgreSQL-specific syntax errors
- Verify tables were created in Supabase Table Editor

### API Response Errors
- Check Vercel deployment logs for errors
- Verify all environment variables are set correctly
- Ensure the Supabase database is accessible from Vercel

## Monitoring

1. In Supabase dashboard, you can monitor:
   - Database performance
   - API usage
   - Storage usage
   - Authentication activity

2. In Vercel dashboard, you can monitor:
   - API response times
   - Error rates
   - Deployment logs

## Security Notes

- Never commit your database password to git
- Use strong, unique passwords for Supabase
- Enable Row Level Security (RLS) in Supabase for additional security
- Rotate your JWT_SECRET periodically
- Keep your dependencies updated

## Backup

Supabase automatically handles daily backups for free tier:
- Point-in-time recovery (7 days)
- Daily backups (30 days retention)
- Manual backups available

Your data is safe and recoverable.
