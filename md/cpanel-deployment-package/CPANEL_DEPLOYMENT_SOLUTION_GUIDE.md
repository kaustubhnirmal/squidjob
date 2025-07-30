# cPanel Deployment Solution Guide
**Resolving Module Not Found and PostgreSQL Compatibility Issues**

## Issues Identified

1. **Server Module Error**: `Cannot find module '/home/squidjob/public_html/server/index.js'`
2. **PostgreSQL Dump Incompatibility**: SQL file not compatible with PostgreSQL 13.20

## Solutions Implemented

### 1. Fixed Server Entry Point Issue

**Problem**: The `server.js` file was trying to import a non-existent `server/index.js` file.

**Solution**: Updated `server.js` to handle TypeScript files properly with fallback mechanisms.

**Files Modified**:
- `server.js` - Now includes proper TypeScript handling and error recovery

**New Features**:
- Automatic detection of compiled JavaScript vs TypeScript files
- Fallback to compiled version if TypeScript fails
- Clear error messages with deployment requirements
- Proper ES module support

### 2. Created PostgreSQL 13-Compatible Database Setup

**Problem**: Original SQL dump format not compatible with PostgreSQL 13.20

**Solution**: Created `database_setup_postgresql13.sql` with clean DDL statements.

**New File**: `database_setup_postgresql13.sql`

**Features**:
- Pure SQL DDL (no pg_dump format)
- Compatible with PostgreSQL 12, 13, 14+
- Complete schema with all tables and relationships
- Initial admin users and permissions
- Sample data for immediate functionality
- Proper indexes for performance

## Deployment Instructions

### Step 1: Update Server Files

1. **Replace** your existing `server.js` with the updated version
2. **Ensure** `tsx` is installed: `npm install tsx`
3. **Verify** Node.js version is 18+ (required for ES modules)

### Step 2: Database Setup

1. **Login** to cPanel and access PostgreSQL Databases
2. **Create** a new PostgreSQL database
3. **Open** phpPGAdmin or use psql command line
4. **Copy and paste** the entire content of `database_setup_postgresql13.sql`
5. **Execute** the SQL script
6. **Verify** tables are created successfully

### Step 3: Environment Configuration

Create or update your `.env` file:

```bash
# Database Configuration (replace with your actual credentials)
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
PGHOST=localhost
PGPORT=5432
PGUSER=your_db_username
PGPASSWORD=your_db_password
PGDATABASE=your_db_name

# Application Settings
NODE_ENV=production
PORT=5000

# Optional API Keys (for enhanced features)
SENDGRID_API_KEY=your_sendgrid_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Start the Application

```bash
node server.js
```

## Default Admin Credentials

After database setup, you can login with:

**Username**: `admin`  
**Password**: `admin123`

**Additional Admin Users**:
- `kn@starinxs.com` / `admin123`
- `poonam.amale` / `admin123`

⚠️ **Important**: Change these passwords after first login!

## Verification Steps

1. **Check Server Startup**: Server should start without module errors
2. **Test Database Connection**: Application should connect to PostgreSQL successfully
3. **Verify Login**: Admin login should work with default credentials
4. **Test Core Features**: Navigate through dashboard and tender pages

## Troubleshooting

### If Server Still Fails to Start:

1. **Check Node.js Version**: Must be 18+
   ```bash
   node --version
   ```

2. **Verify Dependencies**: 
   ```bash
   npm install tsx
   npm install
   ```

3. **Check File Permissions**: Ensure server files are readable
   ```bash
   chmod +x server.js
   ```

### If Database Connection Fails:

1. **Verify Credentials**: Check DATABASE_URL and individual PG* variables
2. **Test Connection**: Use psql to test database connectivity
3. **Check Firewall**: Ensure PostgreSQL port (5432) is accessible

### If Login Fails:

1. **Verify User Creation**: Check if users table has the admin records
2. **Password Hash**: Default password is `admin123` with bcrypt hash
3. **Check Logs**: Look for authentication errors in console

## Performance Optimization

1. **Enable Compression**: Use gzip compression in your web server
2. **Static File Caching**: Configure caching for CSS/JS files
3. **Database Tuning**: Optimize PostgreSQL settings for your server resources

## Security Recommendations

1. **Change Default Passwords**: Update all admin passwords immediately
2. **SSL Certificate**: Enable HTTPS for production
3. **Firewall Rules**: Restrict database access to application server only
4. **Regular Backups**: Set up automated database backups

## Support

If you continue to experience issues:

1. **Check Error Logs**: Review both application and database logs
2. **Verify Environment**: Ensure all environment variables are correctly set
3. **Test Components**: Test database connection and file permissions separately
4. **Contact Support**: Provide specific error messages and configuration details

---

**Note**: This solution addresses the specific module loading and PostgreSQL compatibility issues mentioned in your support case. The application should now start successfully on your cPanel hosting environment.