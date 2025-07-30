# SquidJob Administrator Manual
## Tender Management System - Complete Administration Guide

### Table of Contents
1. [System Administration Overview](#system-administration-overview)
2. [Installation & Configuration](#installation--configuration)
3. [User Management](#user-management)
4. [System Settings](#system-settings)
5. [Theme Management](#theme-management)
6. [Plugin Management](#plugin-management)
7. [CDN Configuration](#cdn-configuration)
8. [Security Management](#security-management)
9. [Database Administration](#database-administration)
10. [Backup & Recovery](#backup--recovery)
11. [Performance Monitoring](#performance-monitoring)
12. [Maintenance Tasks](#maintenance-tasks)
13. [Troubleshooting](#troubleshooting)
14. [API Management](#api-management)

---

## System Administration Overview

### Administrator Responsibilities
- **System Configuration**: Configure application settings and parameters
- **User Management**: Create, modify, and manage user accounts and roles
- **Security Management**: Implement and maintain security policies
- **Performance Monitoring**: Monitor system performance and optimize as needed
- **Backup Management**: Ensure regular backups and test recovery procedures
- **Plugin Management**: Install, configure, and manage system plugins
- **Theme Management**: Manage UI themes and customizations
- **Database Administration**: Maintain database integrity and performance
- **System Updates**: Apply updates and patches
- **Support**: Provide technical support to users

### System Architecture
```
SquidJob Architecture:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   Load Balancer │    │      CDN        │
│   (Frontend)    │◄──►│   (Optional)    │◄──►│   (Assets)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Apache Server  │    │  PHP-FPM/CLI    │    │   File Storage  │
│  (Web Server)   │◄──►│  (Application)  │◄──►│   (Uploads)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  MySQL Server   │    │   Redis Cache   │    │   Log Files     │
│  (Database)     │    │   (Optional)    │    │   (Monitoring)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Installation & Configuration

### System Requirements

#### Server Requirements
- **Operating System**: Linux (Ubuntu 20.04+, CentOS 8+) or Windows Server 2019+
- **Web Server**: Apache 2.4+ with mod_rewrite enabled
- **PHP**: Version 8.1+ with required extensions
- **Database**: MySQL 8.0+ or MariaDB 10.6+
- **Memory**: Minimum 4GB RAM (8GB+ recommended)
- **Storage**: Minimum 20GB free space
- **Network**: Stable internet connection

#### PHP Extensions Required
```bash
# Check required extensions
php -m | grep -E "(pdo|pdo_mysql|mbstring|openssl|tokenizer|xml|ctype|json|bcmath|fileinfo|gd|curl|zip)"

# Install missing extensions (Ubuntu/Debian)
sudo apt-get install php8.1-pdo php8.1-mysql php8.1-mbstring php8.1-xml php8.1-gd php8.1-curl php8.1-zip

# Install missing extensions (CentOS/RHEL)
sudo yum install php81-php-pdo php81-php-mysqlnd php81-php-mbstring php81-php-xml php81-php-gd
```

### Installation Process

#### Step 1: Download and Extract
```bash
# Download SquidJob package
wget https://releases.squidjob.com/latest/squidjob-latest.tar.gz

# Extract to web directory
sudo tar -xzf squidjob-latest.tar.gz -C /var/www/html/
sudo chown -R www-data:www-data /var/www/html/squidjob/
```

#### Step 2: Database Setup
```sql
-- Create database and user
CREATE DATABASE squidjob CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'squidjob'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON squidjob.* TO 'squidjob'@'localhost';
FLUSH PRIVILEGES;

-- Import schema
mysql -u squidjob -p squidjob < /var/www/html/squidjob/database/schema.sql
mysql -u squidjob -p squidjob < /var/www/html/squidjob/database/seeds.sql
```

#### Step 3: Configuration
```bash
# Copy environment file
cp /var/www/html/squidjob/.env.example /var/www/html/squidjob/.env

# Edit configuration
nano /var/www/html/squidjob/.env
```

#### Step 4: Set Permissions
```bash
# Set proper permissions
sudo chmod -R 755 /var/www/html/squidjob/
sudo chmod -R 775 /var/www/html/squidjob/storage/
sudo chmod -R 775 /var/www/html/squidjob/public/uploads/
sudo chmod 600 /var/www/html/squidjob/.env
```

#### Step 5: Install Dependencies
```bash
cd /var/www/html/squidjob/

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install and build frontend assets
npm install
npm run production
```

#### Step 6: Apache Configuration
```apache
# /etc/apache2/sites-available/squidjob.conf
<VirtualHost *:80>
    ServerName squidjob.yourdomain.com
    DocumentRoot /var/www/html/squidjob/public
    
    <Directory /var/www/html/squidjob/public>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/squidjob_error.log
    CustomLog ${APACHE_LOG_DIR}/squidjob_access.log combined
</VirtualHost>

# Enable site and restart Apache
sudo a2ensite squidjob.conf
sudo systemctl restart apache2
```

### Environment Configuration

#### Core Settings (.env)
```env
# Application
APP_NAME="SquidJob Tender Management"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://squidjob.yourdomain.com
APP_TIMEZONE=UTC

# Database
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=squidjob
DB_USERNAME=squidjob
DB_PASSWORD=secure_password_here

# Security
JWT_SECRET=your-jwt-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
SESSION_LIFETIME=120

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=mail_password_here
MAIL_ENCRYPTION=tls

# CDN (Optional)
CDN_ENABLED=false
CDN_DEFAULT_PROVIDER=local

# Cache (Optional)
CACHE_DRIVER=file
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

---

## User Management

### User Roles and Permissions

#### Default Roles
1. **Administrator**: Full system access
2. **Tender Manager**: Tender creation and management
3. **Bidder**: Bid submission and tracking
4. **Viewer**: Read-only access

#### Permission Categories
- **User Management**: Create, edit, delete users
- **Tender Management**: Create, edit, publish tenders
- **Bid Management**: View, evaluate, award bids
- **System Settings**: Configure application settings
- **Reports**: Generate and view reports
- **File Management**: Upload, download, manage files

### Creating Users

#### Admin Panel User Creation
1. Navigate to **Admin** > **Users** > **Create User**
2. Fill in user details:
   ```
   Name: John Doe
   Email: john.doe@company.com
   Role: Bidder
   Status: Active
   Company: ABC Corporation
   Phone: +1-555-0123
   ```
3. Set temporary password
4. Configure permissions
5. Send welcome email

#### Bulk User Import
```csv
# users_import.csv
name,email,role,company,phone,status
John Doe,john@company.com,bidder,ABC Corp,+1-555-0123,active
Jane Smith,jane@company.com,manager,XYZ Ltd,+1-555-0124,active
```

```bash
# Import users via CLI
php artisan users:import users_import.csv
```

### User Management Tasks

#### Password Reset
```bash
# Reset user password via CLI
php artisan user:reset-password john.doe@company.com

# Or through admin panel
Admin > Users > [Select User] > Reset Password
```

#### Account Activation/Deactivation
```sql
-- Activate user account
UPDATE users SET status = 'active' WHERE email = 'user@example.com';

-- Deactivate user account
UPDATE users SET status = 'inactive' WHERE email = 'user@example.com';
```

#### Role Assignment
```php
// Assign role to user
$user = User::findByEmail('user@example.com');
$user->assignRole('tender_manager');

// Remove role from user
$user->removeRole('bidder');

// Check user permissions
if ($user->can('manage_tenders')) {
    // User has permission
}
```

---

## System Settings

### Application Configuration

#### General Settings
```php
// config/app.php
return [
    'name' => 'SquidJob Tender Management',
    'version' => '1.0.0',
    'timezone' => 'UTC',
    'locale' => 'en',
    'debug' => false,
    'maintenance_mode' => false
];
```

#### Tender Settings
```php
// Admin > Settings > Tenders
$settings = [
    'default_tender_duration' => 30, // days
    'max_file_size' => 10485760, // 10MB
    'allowed_file_types' => ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    'auto_close_expired' => true,
    'bid_visibility' => 'private', // public, private, count_only
    'evaluation_period' => 7 // days
];
```

#### Email Settings
```php
// Admin > Settings > Email
$emailSettings = [
    'smtp_host' => 'smtp.yourdomain.com',
    'smtp_port' => 587,
    'smtp_encryption' => 'tls',
    'from_address' => 'noreply@yourdomain.com',
    'from_name' => 'SquidJob System',
    'template_path' => 'emails/',
    'queue_emails' => true
];
```

### Notification Configuration

#### Email Templates
```html
<!-- resources/views/emails/tender_published.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <title>New Tender Published</title>
</head>
<body>
    <h2>New Tender: {{ $tender->title }}</h2>
    <p>A new tender has been published that matches your interests.</p>
    
    <h3>Tender Details:</h3>
    <ul>
        <li><strong>Title:</strong> {{ $tender->title }}</li>
        <li><strong>Budget:</strong> {{ $tender->budget_display }}</li>
        <li><strong>Deadline:</strong> {{ $tender->deadline_formatted }}</li>
    </ul>
    
    <a href="{{ $tender->url }}">View Tender Details</a>
</body>
</html>
```

#### Notification Rules
```php
// Admin > Settings > Notifications
$notificationRules = [
    'tender_published' => [
        'enabled' => true,
        'recipients' => 'subscribed_bidders',
        'delay' => 0, // minutes
        'template' => 'tender_published'
    ],
    'bid_submitted' => [
        'enabled' => true,
        'recipients' => 'tender_owner',
        'delay' => 5,
        'template' => 'bid_submitted'
    ]
];
```

---

## Theme Management

### Theme Administration

#### Installing Themes
```bash
# Upload theme package
cd /var/www/html/squidjob/themes/
sudo unzip new-theme.zip
sudo chown -R www-data:www-data new-theme/
```

#### Theme Configuration
```json
// themes/corporate/theme.json
{
    "name": "Corporate Theme",
    "version": "1.0.0",
    "description": "Professional corporate theme",
    "author": "Your Company",
    "assets": {
        "css": ["css/corporate.css"],
        "js": ["js/corporate.js"]
    },
    "customization": {
        "colors": {
            "primary": "#2c3e50",
            "secondary": "#34495e"
        }
    }
}
```

#### Activating Themes
```php
// Admin > Appearance > Themes
theme()->switchTheme('corporate');

// Or via CLI
php artisan theme:activate corporate
```

### Theme Customization

#### Custom CSS
```css
/* themes/custom/assets/css/custom.css */
:root {
    --primary-color: #3498db;
    --secondary-color: #2c3e50;
    --success-color: #27ae60;
    --warning-color: #f39c12;
    --danger-color: #e74c3c;
}

.navbar-brand {
    color: var(--primary-color);
}

.btn-primary {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
}
```

#### Logo and Branding
```php
// Admin > Appearance > Branding
$branding = [
    'logo' => 'uploads/branding/logo.png',
    'favicon' => 'uploads/branding/favicon.ico',
    'company_name' => 'Your Company Name',
    'footer_text' => '© 2024 Your Company. All rights reserved.'
];
```

---

## Plugin Management

### Plugin Administration

#### Installing Plugins
```bash
# Upload plugin to plugins directory
cd /var/www/html/squidjob/plugins/
sudo unzip notification-system.zip
sudo chown -R www-data:www-data notification-system/
```

#### Plugin Activation
```php
// Admin > Plugins
plugins()->activatePlugin('notification-system');

// Check plugin status
if (is_plugin_active('notification-system')) {
    echo "Plugin is active";
}
```

#### Plugin Configuration
```php
// Admin > Plugins > [Plugin Name] > Settings
set_plugin_setting('notification-system', 'email_enabled', true);
set_plugin_setting('notification-system', 'sms_enabled', false);
set_plugin_setting('notification-system', 'batch_size', 50);
```

### Plugin Development Guidelines

#### Plugin Structure Requirements
```
plugins/your-plugin/
├── plugin.json          # Required: Plugin metadata
├── main.php             # Required: Main plugin file
├── hooks.php            # Optional: Hook registrations
├── install.php          # Optional: Installation script
├── uninstall.php        # Optional: Cleanup script
├── database/            # Optional: Database schemas
├── assets/              # Optional: CSS, JS, images
└── views/               # Optional: Template files
```

#### Security Guidelines
- Validate all inputs
- Use prepared statements for database queries
- Escape output to prevent XSS
- Check user permissions before actions
- Follow WordPress coding standards

---

## CDN Configuration

### CDN Setup

#### CloudFlare Configuration
```env
# .env
CDN_ENABLED=true
CDN_DEFAULT_PROVIDER=cloudflare
CLOUDFLARE_ENABLED=true
CLOUDFLARE_BASE_URL=https://cdn.yourdomain.com
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_API_TOKEN=your_api_token
```

#### AWS CloudFront Configuration
```env
# .env
CDN_DEFAULT_PROVIDER=cloudfront
CLOUDFRONT_ENABLED=true
CLOUDFRONT_BASE_URL=https://d123456789.cloudfront.net
CLOUDFRONT_DISTRIBUTION_ID=E123456789ABCD
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
```

### Asset Optimization

#### Automatic Optimization
```php
// config/cdn.php
'asset_types' => [
    'css' => [
        'minify' => true,
        'combine' => true,
        'cache_ttl' => 31536000
    ],
    'js' => [
        'minify' => true,
        'combine' => true,
        'cache_ttl' => 31536000
    ],
    'image' => [
        'optimize' => true,
        'quality' => 85,
        'progressive' => true
    ]
]
```

#### Manual Cache Purging
```bash
# Purge all CDN cache
php artisan cdn:purge

# Purge specific files
php artisan cdn:purge css/app.css js/app.js

# Purge by pattern
php artisan cdn:purge "css/*"
```

---

## Security Management

### Security Configuration

#### SSL/TLS Setup
```apache
# /etc/apache2/sites-available/squidjob-ssl.conf
<VirtualHost *:443>
    ServerName squidjob.yourdomain.com
    DocumentRoot /var/www/html/squidjob/public
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    SSLCertificateChainFile /path/to/chain.crt
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</VirtualHost>
```

#### Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Fail2ban for brute force protection
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
```

#### Database Security
```sql
-- Remove default accounts
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Set strong passwords
ALTER USER 'root'@'localhost' IDENTIFIED BY 'strong_root_password';

-- Remove test database
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';

-- Flush privileges
FLUSH PRIVILEGES;
```

### Security Monitoring

#### Audit Logging
```php
// Enable audit logging
'audit' => [
    'enabled' => true,
    'events' => [
        'user_login',
        'user_logout',
        'tender_created',
        'bid_submitted',
        'file_uploaded',
        'settings_changed'
    ],
    'retention_days' => 365
]
```

#### Security Alerts
```php
// Admin > Security > Alerts
$securityAlerts = [
    'failed_login_threshold' => 5,
    'suspicious_activity_detection' => true,
    'file_upload_scanning' => true,
    'admin_action_notifications' => true
];
```

---

## Database Administration

### Database Maintenance

#### Regular Maintenance Tasks
```sql
-- Optimize tables
OPTIMIZE TABLE users, tenders, bids, notifications;

-- Check table integrity
CHECK TABLE users, tenders, bids;

-- Repair tables if needed
REPAIR TABLE table_name;

-- Update table statistics
ANALYZE TABLE users, tenders, bids;
```

#### Index Optimization
```sql
-- Check index usage
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    CARDINALITY,
    SEQ_IN_INDEX,
    COLUMN_NAME
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'squidjob'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Add missing indexes
CREATE INDEX idx_tenders_status_deadline ON tenders(status, deadline);
CREATE INDEX idx_bids_tender_status ON bids(tender_id, status);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### Database Monitoring

#### Performance Monitoring
```sql
-- Check slow queries
SELECT 
    query_time,
    lock_time,
    rows_sent,
    rows_examined,
    sql_text
FROM mysql.slow_log 
ORDER BY query_time DESC 
LIMIT 10;

-- Monitor table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'squidjob'
ORDER BY (data_length + index_length) DESC;
```

#### Connection Monitoring
```sql
-- Check active connections
SHOW PROCESSLIST;

-- Monitor connection statistics
SHOW STATUS LIKE 'Connections';
SHOW STATUS LIKE 'Max_used_connections';
SHOW STATUS LIKE 'Threads_connected';
```

---

## Backup & Recovery

### Backup Strategy

#### Database Backups
```bash
#!/bin/bash
# backup_database.sh

BACKUP_DIR="/var/backups/squidjob"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="squidjob"
DB_USER="squidjob"
DB_PASS="password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: db_$DATE.sql.gz"
```

#### File Backups
```bash
#!/bin/bash
# backup_files.sh

BACKUP_DIR="/var/backups/squidjob"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/html/squidjob"

# Backup uploads and configuration
tar -czf $BACKUP_DIR/files_$DATE.tar.gz \
    $APP_DIR/public/uploads/ \
    $APP_DIR/.env \
    $APP_DIR/config/ \
    $APP_DIR/themes/ \
    $APP_DIR/plugins/

# Keep only last 30 days
find $BACKUP_DIR -name "files_*.tar.gz" -mtime +30 -delete

echo "File backup completed: files_$DATE.tar.gz"
```

#### Automated Backups
```bash
# Add to crontab (crontab -e)
# Daily database backup at 2 AM
0 2 * * * /usr/local/bin/backup_database.sh

# Weekly file backup on Sundays at 3 AM
0 3 * * 0 /usr/local/bin/backup_files.sh

# Monthly full system backup
0 4 1 * * /usr/local/bin/backup_full.sh
```

### Recovery Procedures

#### Database Recovery
```bash
# Stop application
sudo systemctl stop apache2

# Restore database
gunzip -c /var/backups/squidjob/db_20240101_020000.sql.gz | mysql -u squidjob -p squidjob

# Restart application
sudo systemctl start apache2
```

#### File Recovery
```bash
# Extract files backup
cd /var/www/html/squidjob/
sudo tar -xzf /var/backups/squidjob/files_20240101_030000.tar.gz

# Set permissions
sudo chown -R www-data:www-data public/uploads/
sudo chmod -R 755 public/uploads/
```

---

## Performance Monitoring

### System Monitoring

#### Server Resources
```bash
# Monitor CPU usage
top -p $(pgrep -d',' php)

# Monitor memory usage
free -h
ps aux --sort=-%mem | head

# Monitor disk usage
df -h
du -sh /var/www/html/squidjob/*

# Monitor network
netstat -tuln | grep :80
netstat -tuln | grep :443
```

#### Application Performance
```bash
# Monitor PHP-FPM
sudo systemctl status php8.1-fpm
sudo tail -f /var/log/php8.1-fpm.log

# Monitor Apache
sudo systemctl status apache2
sudo tail -f /var/log/apache2/squidjob_access.log
sudo tail -f /var/log/apache2/squidjob_error.log
```

### Performance Optimization

#### PHP Optimization
```ini
; /etc/php/8.1/fpm/php.ini
memory_limit = 256M
max_execution_time = 300
max_input_vars = 3000
upload_max_filesize = 10M
post_max_size = 50M

; OPcache settings
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
```

#### MySQL Optimization
```ini
# /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
query_cache_type = 1
query_cache_size = 64M
tmp_table_size = 64M
max_heap_table_size = 64M
```

#### Apache Optimization
```apache
# /etc/apache2/mods-available/mpm_prefork.conf
<IfModule mpm_prefork_module>
    StartServers 8
    MinSpareServers 5
    MaxSpareServers 20
    ServerLimit 256
    MaxRequestWorkers 256
    MaxConnectionsPerChild 10000
</IfModule>

# Enable compression
LoadModule deflate_module modules/mod_deflate.so
<Location />
    SetOutputFilter DEFLATE
    SetEnvIfNoCase Request_URI \
        \.(?:gif|jpe?g|png)$ no-gzip dont-vary
    SetEnvIfNoCase Request_URI \
        \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
</Location>
```

---

## Maintenance Tasks

### Regular Maintenance

#### Daily Tasks
```bash
#!/bin/bash
# daily_maintenance.sh

# Clear application cache
php artisan cache:clear

# Clear expired sessions
php artisan session:gc

# Process notification queue
php artisan queue:work --stop-when-empty

# Update system statistics
php artisan stats:update

# Check system health
php artisan health:check
```

#### Weekly Tasks
```bash
#!/bin/bash
# weekly_maintenance.sh

# Optimize database
php artisan db:optimize

# Clear old log files
find /var/www/html/squidjob/storage/logs/ -name "*.log" -mtime +7 -delete

# Update search indexes
php artisan search:index

# Generate reports
php artisan reports:generate weekly
```

#### Monthly Tasks
```bash
#!/bin/bash
# monthly_maintenance.sh

# Archive old data
php artisan data:archive --older-than=1year

# Update system statistics
php artisan stats:recalculate

# Security audit
php artisan security:audit

# Performance analysis
php artisan performance:analyze
```

### System Updates

#### Application Updates
```bash
# Backup before update
./backup_database.sh
./backup_files.sh

# Download update
wget https://releases.squidjob.com/updates/squidjob-1.1.0-update.zip

# Apply update
php artisan update:apply squidjob-1.1.0-update.zip

# Run migrations
php artisan migrate

# Clear cache
php artisan cache:clear
php artisan config:clear
```

#### Security Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update PHP packages
composer update --no-dev

# Update Node.js packages
npm update

# Rebuild assets
npm run production
```

---

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check Apache status
sudo systemctl status apache2

# Check PHP-FPM status
sudo systemctl status php8.1-fpm

# Check error logs
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/php8.1-fpm.log

# Check file permissions
ls -la /var/www/html/squidjob/
```

#### Database Connection Issues
```bash
# Test database connection
mysql -u squidjob -p squidjob -e "SELECT 1;"

# Check MySQL status
sudo systemctl status mysql

# Check MySQL error log
sudo tail -f /var/log/mysql/error.log

# Verify database configuration
grep -E "DB_" /var/www/html/squidjob/.env
```

#### Performance Issues
```bash
# Check system resources
htop
iotop
nethogs

# Check slow queries
mysql -u root -p -e "SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;"

# Check Apache status
apache2ctl status
apache2ctl fullstatus
```

### Log Analysis

#### Application Logs
```bash
# View application logs
tail -f /var/www/html/squidjob/storage/logs/app.log

# Search for errors
grep -i error /var/www/html/squidjob/storage/logs/app.log

# Analyze log patterns
awk '{print $1}' /var/log/apache2/squidjob_access.log | sort | uniq -c | sort -nr
```

#### Error Debugging
```php
// Enable debug mode temporarily
// .env
APP_DEBUG=true
LOG_LEVEL=debug

// Check specific error
try {
    // Problem code
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    error_log("Trace: " . $e->getTraceAsString());
}
```

---

## API Management

### API Configuration

#### API Authentication
```php
// config/api.php
return [
    'auth_method' => 'jwt', // jwt, session, api_key
    'rate_limiting' => [
        'enabled' => true,
        'requests_per_minute' => 60,
        'requests_per_hour' => 1000
    ],
    'cors' => [
        'enabled' => true,
        'allowed_origins' => ['*'],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
        'allowed_headers' =>