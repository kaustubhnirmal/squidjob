# SquidJob Installation Guide

## Prerequisites

### System Requirements
- **PHP**: 8.1 or higher
- **MySQL**: 8.0 or higher
- **Apache**: 2.4 or higher
- **Composer**: Latest version
- **Node.js**: 18+ (for frontend assets)

### XAMPP Requirements
- XAMPP 8.1+ with PHP 8.1, MySQL 8.0, and Apache 2.4
- Minimum 4GB RAM
- 2GB free disk space

## Installation Steps

### 1. Download and Setup

```bash
# Clone or extract the project to XAMPP htdocs
cd /Applications/XAMPP/xamppfiles/htdocs/
# Extract squidjob.zip or clone repository
```

### 2. Install Dependencies

```bash
# Navigate to project directory
cd squidjob

# Install PHP dependencies
composer install

# Install Node.js dependencies (for frontend assets)
npm install
```

### 3. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Important Environment Variables:**
```env
DB_DATABASE=squidjob
DB_USERNAME=squidj0b
DB_PASSWORD=A1b2c3d4
APP_URL=http://localhost/squidjob
```

### 4. Database Setup

#### Option A: Using phpMyAdmin
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Create database: `squidjob`
3. Create user: `squidj0b` with password: `A1b2c3d4`
4. Grant all privileges to user on `squidjob` database

#### Option B: Using MySQL Command Line
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE squidjob CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'squidj0b'@'localhost' IDENTIFIED BY 'A1b2c3d4';

-- Grant privileges
GRANT ALL PRIVILEGES ON squidjob.* TO 'squidj0b'@'localhost';
FLUSH PRIVILEGES;

-- Use the database
USE squidjob;

-- Import schema
SOURCE database/schema.sql;

-- Import seed data
SOURCE database/seeds.sql;
```

### 5. File Permissions

```bash
# Set proper permissions
chmod -R 755 storage/
chmod -R 755 public/uploads/
chmod -R 644 .env

# Create required directories
mkdir -p storage/logs
mkdir -p storage/cache
mkdir -p storage/sessions
mkdir -p public/uploads/tenders
mkdir -p public/uploads/documents
mkdir -p public/uploads/companies
```

### 6. Apache Configuration

#### Virtual Host Setup (Optional)
Create a virtual host for better development experience:

```apache
# Add to httpd-vhosts.conf
<VirtualHost *:80>
    ServerName squidjob.local
    DocumentRoot "/Applications/XAMPP/xamppfiles/htdocs/squidjob/public"
    
    <Directory "/Applications/XAMPP/xamppfiles/htdocs/squidjob/public">
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog "/Applications/XAMPP/xamppfiles/logs/squidjob_error.log"
    CustomLog "/Applications/XAMPP/xamppfiles/logs/squidjob_access.log" combined
</VirtualHost>
```

Add to `/etc/hosts`:
```
127.0.0.1 squidjob.local
```

### 7. Frontend Assets

```bash
# Build frontend assets
npm run build

# For development with watching
npm run watch
```

### 8. Verification

1. **Database Connection Test**
   - Visit: `http://localhost/squidjob/test-db`
   - Should show: "Database connection successful"

2. **Application Access**
   - Visit: `http://localhost/squidjob`
   - Should show the SquidJob homepage

3. **Admin Login**
   - Visit: `http://localhost/squidjob/login`
   - Email: `admin@squidjob.com`
   - Password: `admin123`

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@squidjob.com | admin123 |
| Manager | manager@squidjob.com | admin123 |
| Sales | sales@squidjob.com | admin123 |
| Accountant | accounts@squidjob.com | admin123 |
| User | user@squidjob.com | admin123 |

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
- Check MySQL service is running in XAMPP
- Verify database credentials in `.env`
- Ensure database and user exist

#### 2. Permission Denied Errors
```bash
# Fix file permissions
sudo chown -R www-data:www-data storage/
sudo chown -R www-data:www-data public/uploads/
```

#### 3. 404 Errors
- Check Apache mod_rewrite is enabled
- Verify `.htaccess` file exists in `public/`
- Check virtual host configuration

#### 4. Composer Issues
```bash
# Clear composer cache
composer clear-cache

# Update dependencies
composer update
```

#### 5. Frontend Assets Not Loading
```bash
# Rebuild assets
npm run build

# Check file permissions
chmod -R 755 public/assets/
```

### Log Files
- Application logs: `storage/logs/`
- Apache error log: XAMPP logs directory
- MySQL error log: XAMPP logs directory

### Performance Optimization

#### Production Setup
```bash
# Optimize autoloader
composer install --optimize-autoloader --no-dev

# Build production assets
npm run production

# Enable OPcache in php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=4000
```

#### Cache Configuration
```bash
# Clear application cache
rm -rf storage/cache/*

# Set cache permissions
chmod -R 755 storage/cache/
```

## Security Considerations

1. **Change Default Passwords**
   - Update all default user passwords
   - Use strong passwords in production

2. **Environment Security**
   - Never commit `.env` to version control
   - Use strong `APP_KEY` and `JWT_SECRET`
   - Enable HTTPS in production

3. **File Upload Security**
   - Validate file types and sizes
   - Scan uploaded files for malware
   - Store uploads outside web root in production

4. **Database Security**
   - Use strong database passwords
   - Limit database user privileges
   - Enable MySQL SSL in production

## Support

For technical support:
- Email: support@squidjob.com
- Documentation: `/docs/`
- GitHub Issues: [Repository URL]

## Next Steps

After installation:
1. Review system settings in Admin panel
2. Configure email settings
3. Set up backup procedures
4. Configure SSL certificate for production
5. Set up monitoring and logging