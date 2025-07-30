# cPanel PostgreSQL Database Setup Guide

## Current Database Information
- **Database Version**: PostgreSQL 16.9 (current system)
- **Compatible Versions**: PostgreSQL 12.x, 13.x, 14.x, 15.x, 16.x
- **Recommended**: PostgreSQL 14+ for optimal compatibility

## Setup Steps for cPanel

### Step 1: Create PostgreSQL Database
1. Login to your cPanel
2. Go to **PostgreSQL Databases**
3. Create a new database (e.g., `tender_management`)
4. Create a database user with full privileges
5. Note down your database credentials:
   - Database Name: `yourusername_tender_management`
   - Username: `yourusername_dbuser`
   - Password: `your_password`
   - Host: `localhost` (usually)

### Step 2: Database Setup Options

#### Option A: Using phpPGAdmin (Recommended)
1. Access **phpPGAdmin** from cPanel
2. Select your database
3. Go to **SQL** tab
4. Copy and paste the content from `database_setup_cpanel.sql`
5. Execute the script

#### Option B: Using Command Line (if SSH access available)
```bash
# Connect to PostgreSQL
psql -h localhost -U yourusername_dbuser -d yourusername_tender_management

# Run the setup script
\i database_setup_cpanel.sql
```

#### Option C: Split Script Execution (if large script fails)
If the full script fails, execute these sections separately:

1. **Tables Creation** (Core structure)
2. **Indexes Creation** (Performance optimization)  
3. **Initial Data** (Admin user and settings)

### Step 3: Troubleshooting Common Issues

#### Issue: "relation already exists"
- **Solution**: Drop existing tables first or use `DROP TABLE IF EXISTS` statements

#### Issue: "permission denied"
- **Solution**: Ensure database user has CREATE, INSERT, UPDATE, DELETE privileges

#### Issue: "syntax error" 
- **Solution**: Check PostgreSQL version compatibility. Remove version-specific features if needed.

#### Issue: "extension does not exist"
- **Solution**: Skip extension creation or ask hosting provider to install extensions

### Step 4: Environment Configuration

Create these environment variables in your Node.js application:

```bash
# Database Configuration
DATABASE_URL=postgresql://yourusername_dbuser:your_password@localhost:5432/yourusername_tender_management

# Application Configuration  
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secret-key-here

# SMTP Configuration (your existing cPanel mail)
SMTP_HOST=smtp.squidjob.com
SMTP_PORT=465
SMTP_USER=your-email-username
SMTP_PASS=your-email-password
SMTP_SECURE=true
```

### Step 5: Verification

Test database connection:
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.query('SELECT version()', (err, result) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected:', result.rows[0].version);
  }
});
```

### Step 6: Data Migration (if needed)

If you have existing data to migrate:
1. Export data from current system using provided SQL script
2. Modify paths and references as needed
3. Import using phpPGAdmin or command line

## Default Admin Login
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@yourcompany.com`

**Important**: Change the admin password immediately after setup!

## File Permissions Setup
Ensure your Node.js application can write to:
```bash
mkdir uploads
chmod 755 uploads
```

## Production Considerations
1. **SSL/TLS**: Enable SSL for database connections in production
2. **Connection Pooling**: Configure appropriate pool size (max 10-20 connections)
3. **Backups**: Set up regular database backups
4. **Monitoring**: Monitor database performance and slow queries
5. **Security**: Use strong passwords and restrict database access

## Support
If you encounter issues:
1. Check cPanel PostgreSQL version compatibility
2. Contact your hosting provider for extension installations
3. Verify user permissions and privileges
4. Check PostgreSQL logs for detailed error messages