# SquidJob Tender Management System - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the SquidJob Tender Management System in various environments.

## System Requirements

### Minimum Requirements
- **PHP**: 7.4 or higher (8.0+ recommended)
- **MySQL**: 5.7 or higher (8.0+ recommended)
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **Memory**: 512MB RAM minimum (2GB+ recommended)
- **Storage**: 1GB free space minimum
- **Redis**: 6.0+ (optional, for caching)

### PHP Extensions Required
- `mysqli` or `pdo_mysql`
- `json`
- `mbstring`
- `openssl`
- `curl`
- `gd` or `imagick` (for image processing)
- `zip`
- `xml`
- `redis` (optional, for Redis caching)

## Installation Methods

### Method 1: Fresh Installation

#### 1. Download and Extract
```bash
# Download the system files
git clone https://github.com/your-repo/squidjob-tender-system.git
cd squidjob-tender-system

# Or extract from ZIP
unzip squidjob-tender-system.zip
cd squidjob-tender-system
```

#### 2. Configure Database
```bash
# Create database
mysql -u root -p
CREATE DATABASE squidjob_tender;
CREATE USER 'squidjob_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON squidjob_tender.* TO 'squidjob_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Configure Application
```bash
# Copy configuration file
cp config/config.example.php config/config.php

# Edit configuration
nano config/config.php
```

Update the database configuration:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'squidjob_tender');
define('DB_USER', 'squidjob_user');
define('DB_PASS', 'secure_password');
```

#### 4. Set Permissions
```bash
# Set proper permissions
chmod 755 -R .
chmod 777 -R storage/
chmod 777 -R public/uploads/
chmod 777 -R cache/
chmod 777 -R logs/

# Make migration script executable
chmod +x migrate.php
```

#### 5. Run Database Migrations
```bash
# Run initial migration
php migrate.php migrate

# Seed with default data
php migrate.php db:seed
```

#### 6. Configure Web Server

**Apache (.htaccess already included)**
```apache
<VirtualHost *:80>
    ServerName squidjob.local
    DocumentRoot /path/to/squidjob-tender-system
    
    <Directory /path/to/squidjob-tender-system>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/squidjob_error.log
    CustomLog ${APACHE_LOG_DIR}/squidjob_access.log combined
</VirtualHost>
```

**Nginx**
```nginx
server {
    listen 80;
    server_name squidjob.local;
    root /path/to/squidjob-tender-system;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

### Method 2: Docker Deployment

#### 1. Using Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    volumes:
      - .:/var/www/html
    depends_on:
      - db
      - redis
    environment:
      - DB_HOST=db
      - DB_NAME=squidjob_tender
      - DB_USER=squidjob_user
      - DB_PASS=secure_password
      - REDIS_HOST=redis

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: squidjob_tender
      MYSQL_USER: squidjob_user
      MYSQL_PASSWORD: secure_password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  redis:
    image: redis:6.2-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

#### 2. Deploy with Docker
```bash
# Build and start containers
docker-compose up -d

# Run migrations
docker-compose exec web php migrate.php migrate
docker-compose exec web php migrate.php db:seed
```

### Method 3: Cloud Deployment (AWS/DigitalOcean/etc.)

#### AWS EC2 Deployment
```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install LAMP stack
sudo apt install apache2 mysql-server php php-mysql php-mbstring php-xml php-curl php-gd php-zip redis-server -y

# Configure MySQL
sudo mysql_secure_installation

# Clone repository
cd /var/www/html
sudo git clone https://github.com/your-repo/squidjob-tender-system.git .

# Set permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Configure and run migrations
sudo cp config/config.example.php config/config.php
sudo nano config/config.php
sudo php migrate.php migrate
sudo php migrate.php db:seed
```

## Configuration Options

### Environment Configuration
```php
// config/config.php

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'squidjob_tender');
define('DB_USER', 'squidjob_user');
define('DB_PASS', 'secure_password');
define('DB_PORT', 3306);

// Redis Configuration (optional)
define('REDIS_HOST', 'localhost');
define('REDIS_PORT', 6379);
define('REDIS_PASSWORD', '');

// Security Configuration
define('JWT_SECRET', 'your-super-secret-jwt-key-here');
define('ENCRYPTION_KEY', 'your-32-character-encryption-key');
define('CSRF_TOKEN_EXPIRE', 3600); // 1 hour

// File Upload Configuration
define('MAX_UPLOAD_SIZE', 52428800); // 50MB
define('UPLOAD_PATH', 'public/uploads/');
define('ALLOWED_FILE_TYPES', 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png,zip');

// Email Configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-app-password');
define('SMTP_ENCRYPTION', 'tls');

// Application Configuration
define('APP_NAME', 'SquidJob Tender Management');
define('APP_URL', 'https://your-domain.com');
define('APP_TIMEZONE', 'UTC');
define('APP_DEBUG', false);
```

### SSL/HTTPS Configuration

#### Let's Encrypt (Certbot)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache -y

# Obtain SSL certificate
sudo certbot --apache -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Manual SSL Certificate
```apache
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /var/www/html
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    SSLCertificateChainFile /path/to/ca-bundle.crt
</VirtualHost>
```

## Database Management

### Migration Commands
```bash
# Run all pending migrations
php migrate.php migrate

# Rollback last migration
php migrate.php migrate:rollback

# Rollback multiple migrations
php migrate.php migrate:rollback --steps=3

# Check migration status
php migrate.php migrate:status

# Fresh installation (drops all tables)
php migrate.php migrate:fresh

# Create new migration
php migrate.php make:migration add_new_feature

# Seed database
php migrate.php db:seed
```

### Module Management
```bash
# Install TenderManager module
php -r "
require_once 'bootstrap.php';
require_once 'app/core/ModuleVersionManager.php';
\$manager = new ModuleVersionManager();
\$manager->installModule('TenderManager', '1.0.0', ['install.php']);
"

# Check module status
php -r "
require_once 'bootstrap.php';
require_once 'app/core/ModuleVersionManager.php';
\$manager = new ModuleVersionManager();
\$manager->showModuleStatus();
"
```

### Backup and Restore
```bash
# Create database backup
mysqldump -u squidjob_user -p squidjob_tender > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
mysql -u squidjob_user -p squidjob_tender < backup_20240101_120000.sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/var/backups/squidjob"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u squidjob_user -p squidjob_tender > $BACKUP_DIR/db_$DATE.sql

# File backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/html/public/uploads

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## Performance Optimization

### PHP Configuration
```ini
; php.ini optimizations
memory_limit = 256M
max_execution_time = 300
max_input_vars = 3000
upload_max_filesize = 50M
post_max_size = 50M

; OPcache
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=4000
opcache.revalidate_freq=60
```

### MySQL Optimization
```sql
-- my.cnf optimizations
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
query_cache_size = 64M
query_cache_type = 1
```

### Redis Configuration
```conf
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Security Hardening

### File Permissions
```bash
# Secure file permissions
find /var/www/html -type f -exec chmod 644 {} \;
find /var/www/html -type d -exec chmod 755 {} \;
chmod 600 config/config.php
chmod 777 storage/ cache/ logs/ public/uploads/
```

### Apache Security
```apache
# .htaccess security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
Header always set Content-Security-Policy "default-src 'self'"

# Hide sensitive files
<Files "config.php">
    Require all denied
</Files>

<Files "*.log">
    Require all denied
</Files>
```

### Firewall Configuration
```bash
# UFW firewall rules
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3306/tcp  # Block external MySQL access
```

## Monitoring and Logging

### Log Configuration
```php
// config/logging.php
define('LOG_LEVEL', 'INFO'); // DEBUG, INFO, WARNING, ERROR
define('LOG_FILE', 'logs/application.log');
define('LOG_MAX_SIZE', 10485760); // 10MB
define('LOG_ROTATION', true);
```

### Health Check Endpoint
```php
// health.php
<?php
require_once 'bootstrap.php';

$health = [
    'status' => 'ok',
    'timestamp' => date('c'),
    'checks' => []
];

// Database check
try {
    $db = Database::getInstance();
    $db->query("SELECT 1");
    $health['checks']['database'] = 'ok';
} catch (Exception $e) {
    $health['checks']['database'] = 'error';
    $health['status'] = 'error';
}

// Redis check (if enabled)
if (class_exists('Redis')) {
    try {
        $redis = new Redis();
        $redis->connect(REDIS_HOST, REDIS_PORT);
        $redis->ping();
        $health['checks']['redis'] = 'ok';
    } catch (Exception $e) {
        $health['checks']['redis'] = 'error';
    }
}

header('Content-Type: application/json');
echo json_encode($health);
?>
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check MySQL service
sudo systemctl status mysql

# Check database credentials
mysql -u squidjob_user -p squidjob_tender

# Check PHP MySQL extension
php -m | grep mysql
```

#### Permission Issues
```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/html

# Fix permissions
sudo chmod -R 755 /var/www/html
sudo chmod -R 777 storage/ cache/ logs/ public/uploads/
```

#### Migration Errors
```bash
# Check migration status
php migrate.php migrate:status

# Reset migrations (WARNING: This will drop all data)
php migrate.php migrate:fresh

# Manual migration rollback
php migrate.php migrate:rollback --steps=1
```

### Log Analysis
```bash
# Check application logs
tail -f logs/application.log

# Check Apache error logs
sudo tail -f /var/log/apache2/error.log

# Check MySQL error logs
sudo tail -f /var/log/mysql/error.log
```

## Maintenance

### Regular Maintenance Tasks
```bash
#!/bin/bash
# maintenance.sh

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clear application cache
rm -rf cache/*

# Optimize database
mysql -u squidjob_user -p squidjob_tender -e "OPTIMIZE TABLE users, tenders, bids;"

# Rotate logs
find logs/ -name "*.log" -size +10M -exec gzip {} \;
find logs/ -name "*.gz" -mtime +30 -delete

# Check disk space
df -h

# Check system resources
free -h
top -bn1 | head -20
```

### Automated Maintenance (Cron)
```bash
# Add to crontab (crontab -e)

# Daily backup at 2 AM
0 2 * * * /path/to/backup_script.sh

# Weekly maintenance at 3 AM Sunday
0 3 * * 0 /path/to/maintenance.sh

# Clear cache every hour
0 * * * * rm -rf /var/www/html/cache/*

# Check health every 5 minutes
*/5 * * * * curl -s http://localhost/health.php > /dev/null
```

## Support and Documentation

### Getting Help
- **Documentation**: Check the `/docs` directory for detailed API documentation
- **Issues**: Report bugs and issues on GitHub
- **Community**: Join our community forum for support

### Version Information
- **Current Version**: 1.0.0
- **PHP Compatibility**: 7.4+
- **MySQL Compatibility**: 5.7+
- **Last Updated**: 2024-01-01

---

**Note**: Always test deployments in a staging environment before deploying to production. Keep regular backups and monitor system performance after deployment.