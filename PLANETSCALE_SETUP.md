# PlanetScale Database Setup Guide for LifeLink

## Step 1: Create PlanetScale Account

1. Go to https://planetscale.com
2. Click "Sign Up" 
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

## Step 2: Create a Database

1. After logging in, click "Create a database"
2. **Database name**: `lifelink`
3. **Region**: Choose the region closest to your users (or leave as default)
4. **Plan**: Select "Hobby" (Free tier - 5GB storage, 1 billion rows read/month)
5. Click "Create database"

## Step 3: Get Connection Credentials

1. Once the database is created, click on it
2. Go to the "Connect" tab
3. Under "General", select "Node.js" as your language
4. You'll see connection details like:
   ```
   Host: xxx.psdb.cloud
   Username: xxx
   Password: xxx
   Database: lifelink
   Port: 3306
   ```
5. **Save these credentials** - you'll need them for Vercel

## Step 4: Import Database Schema

### Option A: Using PlanetScale Dashboard (Easiest)

1. In your PlanetScale database, go to the "Console" tab
2. Click "Open Console"
3. Copy the contents of `api/src/config/schema.sql` from your project
4. Paste the SQL into the console
5. Click "Run" to execute the schema

### Option B: Using PlanetScale CLI

1. Install PlanetScale CLI:
   ```bash
   npm install -g @planetscale/cli
   ```

2. Authenticate:
   ```bash
   pscale auth login
   ```

3. Import the schema:
   ```bash
   pscale shell lifelink < api/src/config/schema.sql
   ```

## Step 5: Enable Branching (Optional but Recommended)

1. In PlanetScale, go to "Settings" → "Branching"
2. Enable branching for development workflows
3. This allows you to create development branches for testing

## Step 6: Configure Vercel Environment Variables

1. Go to your Vercel project (after importing from GitHub)
2. Navigate to "Settings" → "Environment Variables"
3. Add the following variables:

   ```
   DB_HOST = your_planetscale_host (e.g., xxx.psdb.cloud)
   DB_PORT = 3306
   DB_USER = your_planetscale_username
   DB_PASSWORD = your_planetscale_password
   DB_NAME = lifelink
   JWT_SECRET = generate_a_secure_random_string
   CLIENT_URL = your_vercel_domain_url (e.g., https://lifelink-final.vercel.app)
   ```

4. **Important**: Generate JWT_SECRET using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Step 7: Deploy to Vercel

1. In Vercel, click "Deploy"
2. Wait for the deployment to complete
3. Your site will be live at `https://lifelink-final.vercel.app`

## Step 8: Test the Application

1. Visit your deployed URL
2. Test user registration (signup)
3. Test login functionality
4. Verify donor/patient dashboards work
5. Check that API calls are successful

## Troubleshooting

### Connection Issues
- Ensure your PlanetScale database allows connections from Vercel
- Check that you're using SSL (PlanetScale requires SSL)
- Verify credentials are correct in Vercel environment variables

### SSL Certificate Issues
If you get SSL errors, update your database connection in `api/src/config/db.js`:
```javascript
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true
  }
});
```

### Schema Import Issues
- Make sure the schema file is properly formatted
- Check for any MySQL-specific syntax that might need adjustment
- Verify tables were created in PlanetScale console

## PlanetScale Free Tier Limits

- **Storage**: 5GB
- **Rows read**: 1 billion per month
- **Rows written**: 10 million per month
- **Databases**: Unlimited
- **Branches**: Unlimited

This is more than sufficient for your LifeLink application.

## Monitoring

1. In PlanetScale dashboard, you can monitor:
   - Query performance
   - Connection counts
   - Storage usage
   - Slow queries

2. In Vercel dashboard, you can monitor:
   - API response times
   - Error rates
   - Deployment logs

## Backup

PlanetScale automatically handles backups and point-in-time recovery, so your data is safe.
