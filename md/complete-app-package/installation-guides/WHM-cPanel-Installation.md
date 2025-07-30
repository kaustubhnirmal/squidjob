# WHM/cPanel Installation Guide
# Complete Step-by-Step Manual for Tender Management System

## Overview

This guide provides detailed instructions for deploying the Tender Management System on a shared hosting environment using WHM/cPanel. This method is suitable for small to medium-scale deployments with cost-effective hosting solutions.

## Prerequisites

### Hosting Requirements
- **Hosting Type**: cPanel shared hosting with Node.js support
- **Node.js Version**: 18.0 or higher
- **Database**: PostgreSQL 12+ or MySQL 8+ 
- **Storage**: Minimum 10GB available space
- **Memory**: Minimum 1GB RAM allocated
- **Bandwidth**: Sufficient for expected traffic

### Access Requirements
- cPanel login credentials
- File Manager or FTP access
- Database creation permissions
- Domain/subdomain configured

## Step 1: Domain and SSL Setup

### 1.1 Configure Domain
```bash
# In cPanel > Subdomains (if using subdomain)
1. Go to cPanel Dashboard
2. Navigate to "Subdomains"
3. Create subdomain: tender.yourdomain.com
4. Set document root: /public_html/tender247/
```

### 1.2 SSL Certificate Installation
```bash
# In cPanel > SSL/TLS
1. Go to "SSL/TLS" section
2. Click "Let's Encrypt SSL"
3. Select your domain: tender.yourdomain.com
4. Click "Issue" to generate free SSL certificate
5. Verify SSL is active (green padlock in browser)
```

## Step 2: Database Creation and Setup

### 2.1 Create PostgreSQL Database (Preferred)
```sql
-- In cPanel > PostgreSQL Databases
1. Navigate to "PostgreSQL Databases"
2. Create Database: tender247_db
3. Create User: tender247_user
4. Set Password: [secure-password]
5. Add user to database with ALL PRIVILEGES
```

### 2.2 Alternative: MySQL Database Setup
```sql
-- In cPanel > MySQL Databases (if PostgreSQL not available)
1. Navigate to "MySQL Databases"
2. Create Database: cpanel_tender247_db
3. Create User: cpanel_tender247
4. Set Password: [secure-password]
5. Add user to database with ALL PRIVILEGES
```

### 2.3 Import Database Schema
```bash
# Method 1: Using phpPgAdmin (PostgreSQL)
1. Go to cPanel > phpPgAdmin
2. Select your database: tender247_db
3. Click "SQL" tab
4. Copy contents from: database/postgresql_complete_schema.sql
5. Click "Execute" to create tables

# Method 2: Using phpMyAdmin (MySQL)
1. Go to cPanel > phpMyAdmin
2. Select your database: cpanel_tender247_db
3. Click "Import" tab
4. Upload: database/mysql_compatible_schema.sql
5. Click "Go" to import
```

### 2.4 Import Sample Data
```sql
-- After schema import, add sample data
1. Stay in database management interface
2. Click "SQL" tab again
3. Copy contents from: database/sample_data.sql
4. Execute to populate with test data
```

## Step 3: File Upload and Configuration

### 3.1 Upload Application Files
```bash
# Using cPanel File Manager
1. Go to cPanel > File Manager
2. Navigate to /public_html/
3. Create folder: tender247
4. Enter tender247 folder
5. Upload the complete-app-package/app/ contents
6. Extract if uploaded as ZIP

# File structure should be:
/public_html/tender247/
├── server/
├── client/
├── shared/
├── node_modules/ (will be created)
├── package.json
├── start-production.js
├── .env (create this)
└── uploads/ (create this)
```

### 3.2 Create Environment Configuration
```bash
# Create .env file in /public_html/tender247/
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database (PostgreSQL - preferred)
DATABASE_URL=postgresql://tender247_user:your-password@localhost:5432/tender247_db

# Alternative Database (MySQL)
# DATABASE_URL=mysql://cpanel_tender247:your-password@localhost:3306/cpanel_tender247_db

# Security (IMPORTANT: Generate unique keys)
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long
SESSION_SECRET=your-super-secure-session-secret-minimum-32-characters
BCRYPT_ROUNDS=12

# Application URLs (Update with your domain)
BASE_URL=https://tender.yourdomain.com
API_BASE_URL=https://tender.yourdomain.com/api
FRONTEND_URL=https://tender.yourdomain.com

# CORS Configuration
CORS_ORIGIN=https://tender.yourdomain.com,https://yourdomain.com
CORS_CREDENTIALS=true

# File Upload Settings
MAX_FILE_SIZE=52428800
UPLOAD_PATH=/home/username/public_html/tender247/uploads
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,png,jpg,jpeg

# Email Configuration (Update with your SMTP details)
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-email-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Tender247 System

# Performance Settings
COMPRESSION_ENABLED=true
CACHE_ENABLED=true
RATE_LIMIT_ENABLED=true
```

### 3.3 Set File Permissions
```bash
# In cPanel File Manager, set permissions:
1. Right-click on tender247 folder > Permissions
2. Set to 755 (drwxr-xr-x)
3. Right-click on .env file > Permissions  
4. Set to 600 (rw-------)
5. Create uploads folder with 755 permissions
6. Set all .js files to 644 permissions
```

## Step 4: Node.js Application Setup

### 4.1 Configure Node.js App
```bash
# In cPanel > Node.js Selector (if available)
1. Go to "Node.js Selector"
2. Click "Create Application"
3. Set Node.js Version: 18.x or latest
4. Set Application Root: tender247
5. Set Application URL: tender.yourdomain.com
6. Set Application Startup File: start-production.js
7. Click "Create"
```

### 4.2 Install Dependencies
```bash
# In cPanel > Terminal (if available) or Node.js App interface
cd /home/username/public_html/tender247
npm install --production

# If terminal not available, use Node.js interface:
1. Go to Node.js Selector > Manage Application
2. Click on your application
3. In "Package installation" section
4. Install packages from package.json
```

### 4.3 Alternative: Manual Node.js Setup
```bash
# If Node.js Selector not available
# Upload pre-built node_modules or use SSH
ssh username@yourserver.com
cd public_html/tender247
npm install --production
node start-production.js
```

## Step 5: Web Server Configuration

### 5.1 Configure .htaccess for Apache
```apache
# Create .htaccess in /public_html/tender247/
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy to Node.js application
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# File upload limits
LimitRequestBody 52428800

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache control for static files
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/javascript "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 5.2 Configure Passenger (if available)
```bash
# Create passenger_wsgi.py if Passenger is used
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

def application(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain')])
    return [b'Redirecting to Node.js application']
```

## Step 6: Application Startup and Testing

### 6.1 Start the Application
```bash
# Method 1: Using Node.js Selector
1. Go to cPanel > Node.js Selector
2. Click on your application
3. Click "Start" button
4. Monitor status and logs

# Method 2: Using Terminal/SSH
cd /home/username/public_html/tender247
node start-production.js

# Method 3: Using Screen (for persistent running)
screen -S tender247
cd /home/username/public_html/tender247
node start-production.js
# Press Ctrl+A, then D to detach
```

### 6.2 Verify Installation
```bash
# Check application status
1. Visit: https://tender.yourdomain.com
2. You should see the login page
3. Test login with: admin@tender247.com / Admin@123
4. Check all main features work:
   - User authentication ✓
   - Tender listings ✓
   - File uploads ✓
   - Database operations ✓
```

### 6.3 Test Database Connection
```bash
# In cPanel > Terminal or SSH
cd /home/username/public_html/tender247
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(res => {
  console.log('Database connected:', res.rows[0]);
  process.exit(0);
}).catch(err => {
  console.error('Database error:', err);
  process.exit(1);
});
"
```

## Step 7: Production Optimization

### 7.1 Enable Monitoring
```bash
# Create monitoring script: monitor.sh
#!/bin/bash
# Check if application is running
if ! pgrep -f "node start-production.js" > /dev/null; then
    echo "Application not running, starting..."
    cd /home/username/public_html/tender247
    nohup node start-production.js > app.log 2>&1 &
fi

# Add to crontab
crontab -e
# Add line: */5 * * * * /home/username/public_html/tender247/monitor.sh
```

### 7.2 Setup Backup Automation
```bash
# Create backup script: backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/username/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump $DATABASE_URL > $BACKUP_DIR/database_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /home/username/public_html/tender247

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# Add to crontab for daily backup at 2 AM
# 0 2 * * * /home/username/public_html/tender247/backup.sh
```

### 7.3 Configure Log Rotation
```bash
# Create logrotate configuration
cat > /home/username/tender247-logrotate.conf << EOF
/home/username/public_html/tender247/app.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    postrotate
        # Restart application if needed
        pkill -f "node start-production.js"
        cd /home/username/public_html/tender247
        nohup node start-production.js > app.log 2>&1 &
    endscript
}
EOF
```

## Step 8: Security Configuration

### 8.1 Secure File Permissions
```bash
# Set secure permissions for sensitive files
chmod 600 /home/username/public_html/tender247/.env
chmod 755 /home/username/public_html/tender247/uploads
chmod 644 /home/username/public_html/tender247/*.js
chmod 644 /home/username/public_html/tender247/.htaccess

# Prevent access to sensitive directories
echo "deny from all" > /home/username/public_html/tender247/server/.htaccess
echo "deny from all" > /home/username/public_html/tender247/node_modules/.htaccess
```

### 8.2 Configure Firewall (if available)
```bash
# If server-level access is available
# Allow only necessary ports
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -j DROP
```

## Step 9: Performance Optimization

### 9.1 Enable Compression
```apache
# Already configured in .htaccess above
# Verify compression is working:
# curl -H "Accept-Encoding: gzip" -I https://tender.yourdomain.com
```

### 9.2 Database Optimization
```sql
-- In your database interface, run optimization queries
ANALYZE;
VACUUM;

-- For PostgreSQL, also run:
REINDEX DATABASE tender247_db;

-- Set up automatic maintenance
-- Add to crontab: 0 3 * * 0 psql $DATABASE_URL -c "VACUUM ANALYZE;"
```

## Troubleshooting Common Issues

### Issue 1: Application Won't Start
```bash
# Check logs
tail -f /home/username/public_html/tender247/app.log

# Common solutions:
1. Verify Node.js version: node --version
2. Check package installation: ls node_modules/
3. Verify database connection: test connection string
4. Check file permissions: ls -la
5. Review .env file: cat .env
```

### Issue 2: Database Connection Failed
```bash
# Test database connectivity
psql "postgresql://tender247_user:password@localhost:5432/tender247_db" -c "SELECT 1;"

# Common solutions:
1. Verify database credentials in .env
2. Check if database service is running
3. Ensure user has proper permissions
4. Test from different location
```

### Issue 3: File Upload Issues
```bash
# Check upload directory
ls -la /home/username/public_html/tender247/uploads/

# Common solutions:
1. Verify UPLOAD_PATH in .env
2. Check directory permissions: chmod 755 uploads
3. Verify MAX_FILE_SIZE setting
4. Check server upload limits
```

### Issue 4: SSL Certificate Problems
```bash
# Test SSL certificate
openssl s_client -connect tender.yourdomain.com:443 -servername tender.yourdomain.com

# Common solutions:
1. Regenerate Let's Encrypt certificate
2. Verify domain DNS settings
3. Check .htaccess HTTPS redirect
4. Ensure certificate is properly installed
```

### Issue 5: Performance Issues
```bash
# Monitor resource usage
top -u username

# Common solutions:
1. Enable compression in .htaccess
2. Optimize database queries
3. Implement caching
4. Monitor memory usage
5. Check for memory leaks
```

## Maintenance Schedule

### Daily Tasks
- Check application logs
- Monitor disk space usage
- Verify backup completion

### Weekly Tasks
- Review security logs
- Update system packages (if permitted)
- Check SSL certificate status
- Monitor performance metrics

### Monthly Tasks
- Rotate log files
- Update Node.js dependencies
- Review user access and permissions
- Optimize database performance

## Support and Documentation

### Log Locations
- Application logs: `/home/username/public_html/tender247/app.log`
- Error logs: Check cPanel > Error Logs
- Access logs: Check cPanel > Raw Access Logs

### Useful Commands
```bash
# Check application status
pgrep -f "node start-production.js"

# View real-time logs
tail -f app.log

# Restart application
pkill -f "node start-production.js"
nohup node start-production.js > app.log 2>&1 &

# Test database connection
node -e "console.log(process.env.DATABASE_URL)"
```

### Contact Information
- Technical support: Available through documentation
- Emergency procedures: Documented in troubleshooting section
- Backup recovery: Automated daily backups in `/home/username/backups/`

---

This completes the comprehensive cPanel installation guide for the Tender Management System. Follow each step carefully and refer to the troubleshooting section for any issues encountered during deployment.