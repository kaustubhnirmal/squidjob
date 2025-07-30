# cPanel Deployment Fix - Complete Solution

## Issues Resolved

### 1. Module Not Found Error
**Error**: `Cannot find module '/home/squidjob/public_html/server/index.js'`

**Root Cause**: The `server.js` was trying to import a non-existent compiled JavaScript file.

**Solution Applied**:
- Updated `server.js` with intelligent TypeScript handling
- Added fallback mechanisms for different hosting environments
- Created `start-production.js` as alternative startup method

### 2. PostgreSQL Dump Compatibility 
**Error**: SQL file not compatible with PostgreSQL 13.20

**Root Cause**: pg_dump format incompatible with older PostgreSQL versions.

**Solution Applied**:
- Created `database_setup_postgresql13.sql` with pure DDL statements
- Compatible with PostgreSQL 12, 13, 14+
- Includes all tables, relationships, and initial data

## Files Created/Modified

### 1. `server.js` (Modified)
- Intelligent TypeScript detection and loading
- Multiple fallback strategies
- Clear error messages with troubleshooting steps
- ES module compatibility

### 2. `database_setup_postgresql13.sql` (New)
- Clean SQL DDL statements (no pg_dump format)
- Complete schema with all 19 tables
- Initial admin users and permissions
- Performance indexes
- Compatible with PostgreSQL 13.20

### 3. `start-production.js` (New)
- Alternative startup script for problematic environments
- Multiple startup method attempts
- Comprehensive error handling and diagnostics
- Fallback chain for maximum compatibility

### 4. `CPANEL_DEPLOYMENT_SOLUTION_GUIDE.md` (New)
- Complete deployment instructions
- Troubleshooting guide
- Configuration examples
- Security recommendations

## Deployment Commands

### Quick Start (Recommended)
```bash
# Navigate to your deployment directory
cd /home/squidjob/public_html

# Install dependencies (if not already done)
npm install

# Start the application
node server.js
```

### Alternative Startup Methods

If the main startup fails, try these in order:

```bash
# Method 1: Safe startup script
node start-production.js

# Method 2: Direct tsx execution
npx tsx server/index.ts

# Method 3: With loader (if tsx installed globally)
node --loader tsx/esm server/index.ts
```

## Database Setup Instructions

1. **Access cPanel → PostgreSQL Databases**
2. **Create new database** (note the database name)
3. **Open phpPGAdmin**
4. **Select your database**
5. **Go to SQL tab**
6. **Copy entire content** of `database_setup_postgresql13.sql`
7. **Paste and execute**
8. **Verify success** (should create 19 tables)

## Environment Configuration

Create `.env` file in your deployment directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
PGHOST=localhost
PGPORT=5432
PGUSER=your_db_username
PGPASSWORD=your_db_password
PGDATABASE=your_db_name

# Application Settings
NODE_ENV=production
PORT=5000

# Optional Features
SENDGRID_API_KEY=your_sendgrid_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Default Login Credentials

After database setup:

**Admin Users**:
- `admin` / `admin123`
- `kn@starinxs.com` / `admin123`
- `poonam.amale` / `admin123`

**Non-Admin Users**:
- `simraan_quereshi` / `admin123` (Tender Manager)
- `mayank_pathak` / `admin123` (Sales Head)

⚠️ **Change passwords after first login!**

## Verification Checklist

- [ ] Server starts without module errors
- [ ] Database connection successful
- [ ] Admin login works
- [ ] Dashboard loads properly
- [ ] Tender pages accessible
- [ ] Settings menu visible only for admin users

## Troubleshooting

### Server Won't Start
1. Check Node.js version: `node --version` (need 18+)
2. Install dependencies: `npm install`
3. Check file permissions: `chmod +x server.js`
4. Try alternative: `node start-production.js`

### Database Connection Issues
1. Verify credentials in `.env`
2. Test connection: `psql -h localhost -U username -d database_name`
3. Check PostgreSQL service status
4. Verify port 5432 is open

### Module Loading Errors
1. Ensure `tsx` is installed: `npm install tsx`
2. Check ES module support: Node.js 18+
3. Try CommonJS alternative if needed
4. Review startup logs for specific errors

## Performance Tips

1. **Enable gzip compression** in your web server
2. **Set up static file caching** for better performance
3. **Configure PostgreSQL** connection pooling
4. **Monitor memory usage** during peak loads

## Security Recommendations

1. **Change default passwords** immediately
2. **Enable HTTPS** with SSL certificate
3. **Restrict database access** to application IP only
4. **Set up regular backups** of database and files
5. **Keep dependencies updated** regularly

---

This deployment fix should resolve both the module loading and PostgreSQL compatibility issues encountered in your cPanel hosting environment.