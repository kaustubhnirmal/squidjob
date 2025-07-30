# VPS Installation Manual - AlmaLinux/CentOS
# Complete Step-by-Step Deployment Guide

## Overview

This comprehensive guide covers deploying the Tender Management System on a Virtual Private Server (VPS) running AlmaLinux 9, CentOS 8+, or similar Enterprise Linux distributions. This method provides full control, better performance, and scalability for production deployments.

## Prerequisites

### VPS Requirements
- **OS**: AlmaLinux 9, CentOS 8+, RHEL 8+, or Rocky Linux 9
- **CPU**: 2+ cores (4 cores recommended for production)
- **RAM**: 4GB minimum (8GB+ recommended)
- **Storage**: 50GB SSD minimum (100GB+ recommended)
- **Network**: Public IP with unrestricted bandwidth
- **Ports**: 22 (SSH), 80 (HTTP), 443 (HTTPS) open

### Access Requirements
- Root or sudo access to the VPS
- SSH client for remote access
- Domain name pointing to VPS IP address
- Basic knowledge of Linux command line

## Step 1: Initial VPS Setup and Security

### 1.1 Connect to VPS
```bash
# Connect via SSH
ssh root@your-vps-ip-address
# Or if using non-root user:
ssh username@your-vps-ip-address
```

### 1.2 Update System
```bash
# Update all packages
dnf update -y

# Install essential packages
dnf install -y curl wget git vim nano htop unzip tar

# Install development tools
dnf groupinstall -y "Development Tools"
```

### 1.3 Configure Firewall
```bash
# Start and enable firewall
systemctl start firewalld
systemctl enable firewalld

# Allow SSH (usually already allowed)
firewall-cmd --permanent --add-service=ssh

# Allow HTTP and HTTPS
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https

# Allow custom port for Node.js (if needed)
firewall-cmd --permanent --add-port=3000/tcp

# Reload firewall rules
firewall-cmd --reload

# Check firewall status
firewall-cmd --list-all
```

### 1.4 Create Application User
```bash
# Create user for running the application
useradd -m -s /bin/bash tender247
usermod -aG wheel tender247

# Set password for the user
passwd tender247

# Create application directory
mkdir -p /opt/tender247
chown tender247:tender247 /opt/tender247
```

## Step 2: Install Node.js and npm

### 2.1 Install Node.js 18.x
```bash
# Add NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -

# Install Node.js
dnf install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show npm version

# Install global packages
npm install -g pm2
```

### 2.2 Alternative: Install via Node Version Manager
```bash
# Install nvm (if preferred)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install and use Node.js 18
nvm install 18
nvm use 18
nvm alias default 18
```

## Step 3: Database Installation and Setup

### 3.1 Install PostgreSQL 15
```bash
# Install PostgreSQL repository
dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Install PostgreSQL 15
dnf install -y postgresql15-server postgresql15-contrib

# Initialize database
/usr/pgsql-15/bin/postgresql-15-setup initdb

# Start and enable PostgreSQL
systemctl start postgresql-15
systemctl enable postgresql-15

# Check status
systemctl status postgresql-15
```

### 3.2 Configure PostgreSQL
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE tender247_db;
CREATE USER tender247_user WITH PASSWORD 'SecurePassword123!';
GRANT ALL PRIVILEGES ON DATABASE tender247_db TO tender247_user;

# Grant additional permissions
ALTER USER tender247_user CREATEDB;
\q

# Configure authentication
nano /var/lib/pgsql/15/data/postgresql.conf
# Find and update:
listen_addresses = 'localhost'
port = 5432

# Configure client authentication
nano /var/lib/pgsql/15/data/pg_hba.conf
# Add line:
local   tender247_db    tender247_user                  md5

# Restart PostgreSQL
systemctl restart postgresql-15
```

### 3.3 Test Database Connection
```bash
# Test connection
psql -h localhost -U tender247_user -d tender247_db -c "SELECT version();"
```

## Step 4: Install and Configure Nginx

### 4.1 Install Nginx
```bash
# Install Nginx
dnf install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Check status
systemctl status nginx
```

### 4.2 Configure Nginx for Tender247
```bash
# Create Nginx configuration
cat > /etc/nginx/conf.d/tender247.conf << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (will be updated after certificate installation)
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Client upload size
    client_max_body_size 100M;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # Static file serving (optional)
    location /uploads/ {
        alias /opt/tender247/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
    
    # Favicon and robots
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }
    
    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
EOF

# Test Nginx configuration
nginx -t
```

## Step 5: SSL Certificate Installation

### 5.1 Install Certbot for Let's Encrypt
```bash
# Install snapd and certbot
dnf install -y snapd
systemctl enable --now snapd.socket
ln -s /var/lib/snapd/snap /snap

# Install certbot
snap install core; snap refresh core
snap install --classic certbot
ln -s /snap/bin/certbot /usr/bin/certbot

# Or install via dnf
dnf install -y certbot python3-certbot-nginx
```

### 5.2 Generate SSL Certificate
```bash
# Generate certificate (replace yourdomain.com)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
certbot renew --dry-run

# Set up automatic renewal
systemctl enable --now certbot-renew.timer
```

### 5.3 Update Nginx Configuration
```bash
# Nginx configuration should be automatically updated by certbot
# Verify the certificate paths in /etc/nginx/conf.d/tender247.conf

# Restart Nginx
systemctl restart nginx
```

## Step 6: Application Deployment

### 6.1 Download and Extract Application
```bash
# Switch to application user
su - tender247

# Navigate to application directory
cd /opt/tender247

# Download application package (replace with actual URL or upload method)
wget https://your-server.com/complete-app-package.tar.gz
# Or upload via SCP:
# scp complete-app-package.tar.gz tender247@your-vps-ip:/opt/tender247/

# Extract application
tar -xzf complete-app-package.tar.gz
mv complete-app-package/app/* .
rm -rf complete-app-package.tar.gz complete-app-package/

# Set proper ownership
sudo chown -R tender247:tender247 /opt/tender247
```

### 6.2 Install Application Dependencies
```bash
# Install production dependencies
npm install --production

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Create logs directory
mkdir -p logs
chmod 755 logs
```

### 6.3 Configure Environment Variables
```bash
# Create production environment file
cat > .env << 'EOF'
# Environment
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration
DATABASE_URL=postgresql://tender247_user:SecurePassword123!@localhost:5432/tender247_db

# Security Configuration (IMPORTANT: Generate unique keys)
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters-long
SESSION_SECRET=your-super-secure-session-secret-key-minimum-32-characters
BCRYPT_ROUNDS=12

# Application URLs (Update with your actual domain)
BASE_URL=https://yourdomain.com
API_BASE_URL=https://yourdomain.com/api
FRONTEND_URL=https://yourdomain.com

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
CORS_CREDENTIALS=true

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_PATH=/opt/tender247/uploads
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,png,jpg,jpeg

# Email Configuration (Update with your SMTP provider)
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-email-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Tender247 System

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Performance Settings
COMPRESSION_ENABLED=true
CACHE_ENABLED=true
CACHE_TTL=300

# Logging
LOG_LEVEL=error
LOG_FILE=/opt/tender247/logs/app.log
ACCESS_LOG=/opt/tender247/logs/access.log

# Optional: Redis (for sessions and caching)
# REDIS_URL=redis://localhost:6379

# Optional: AI Services
# OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key

# Feature Flags
FEATURE_AI_ANALYSIS=true
FEATURE_BULK_OPERATIONS=true
FEATURE_ADVANCED_SEARCH=true
FEATURE_DOCUMENT_PROCESSING=true
FEATURE_EMAIL_NOTIFICATIONS=true
EOF

# Secure the environment file
chmod 600 .env
```

## Step 7: Database Schema and Data Import

### 7.1 Import Database Schema
```bash
# Import the complete schema
psql -h localhost -U tender247_user -d tender247_db -f complete-app-package/database/postgresql_complete_schema.sql

# Import sample data
psql -h localhost -U tender247_user -d tender247_db -f complete-app-package/database/sample_data.sql

# Verify tables were created
psql -h localhost -U tender247_user -d tender247_db -c "\dt"
```

### 7.2 Verify Database Setup
```bash
# Test database connection from application directory
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT COUNT(*) FROM users').then(res => {
  console.log('Database test successful. Users count:', res.rows[0].count);
  process.exit(0);
}).catch(err => {
  console.error('Database test failed:', err.message);
  process.exit(1);
});
"
```

## Step 8: Process Management with PM2

### 8.1 Create PM2 Ecosystem Configuration
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tender247',
    script: 'start-production.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/opt/tender247/logs/pm2-error.log',
    out_file: '/opt/tender247/logs/pm2-out.log',
    log_file: '/opt/tender247/logs/pm2-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'uploads', 'logs']
  }]
};
EOF
```

### 8.2 Start Application with PM2
```bash
# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Generate startup script
pm2 startup systemd -u tender247 --hp /home/tender247

# Execute the generated command as root (it will show the command to run)
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u tender247 --hp /home/tender247

# Check application status
pm2 status
pm2 logs tender247
```

## Step 9: Monitoring and Logging

### 9.1 Install System Monitoring Tools
```bash
# Install monitoring tools
sudo dnf install -y htop iotop nethogs

# Install log rotation utility
sudo dnf install -y logrotate
```

### 9.2 Configure Log Rotation
```bash
# Create logrotate configuration
sudo cat > /etc/logrotate.d/tender247 << 'EOF'
/opt/tender247/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 tender247 tender247
    postrotate
        pm2 reload tender247
    endscript
}
EOF
```

### 9.3 Create Monitoring Script
```bash
# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
# Tender247 Health Monitoring Script

LOG_FILE="/opt/tender247/logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting health check..." >> $LOG_FILE

# Check if PM2 process is running
if ! pm2 list | grep -q "tender247.*online"; then
    echo "[$DATE] ERROR: Application is not running. Attempting restart..." >> $LOG_FILE
    pm2 restart tender247
    echo "[$DATE] Application restart attempted." >> $LOG_FILE
fi

# Check disk space
DISK_USAGE=$(df /opt/tender247 | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "[$DATE] WARNING: Disk usage is at ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    echo "[$DATE] WARNING: Memory usage is at ${MEMORY_USAGE}%" >> $LOG_FILE
fi

# Check database connection
if ! psql $DATABASE_URL -c "SELECT 1;" > /dev/null 2>&1; then
    echo "[$DATE] ERROR: Database connection failed!" >> $LOG_FILE
fi

# Check web server response
if ! curl -f -s http://localhost:3000/health > /dev/null; then
    echo "[$DATE] ERROR: Web server health check failed!" >> $LOG_FILE
fi

echo "[$DATE] Health check completed." >> $LOG_FILE
EOF

chmod +x monitor.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/tender247/monitor.sh") | crontab -
```

## Step 10: Backup Configuration

### 10.1 Create Backup Script
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
# Tender247 Backup Script

BACKUP_DIR="/opt/backups/tender247"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Creating database backup..."
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/database_$DATE.sql.gz

# Files backup
echo "Creating files backup..."
tar -czf $BACKUP_DIR/files_$DATE.tar.gz \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='*.log' \
    /opt/tender247

# Configuration backup
echo "Creating configuration backup..."
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
    /etc/nginx/conf.d/tender247.conf \
    /opt/tender247/.env \
    /opt/tender247/ecosystem.config.js

# Clean old backups
echo "Cleaning old backups..."
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# Create backup directory
sudo mkdir -p /opt/backups/tender247
sudo chown tender247:tender247 /opt/backups/tender247

# Add to crontab for daily backup at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/tender247/backup.sh") | crontab -
```

### 10.2 Test Backup and Restore
```bash
# Test backup
./backup.sh

# Test restore (don't run in production)
# pg_dump $DATABASE_URL > test_backup.sql
# psql -h localhost -U tender247_user -d tender247_db_test < test_backup.sql
```

## Step 11: Security Hardening

### 11.1 Configure SELinux (if enabled)
```bash
# Check SELinux status
sestatus

# If SELinux is enforcing, configure policies
setsebool -P httpd_can_network_connect on
setsebool -P httpd_can_network_relay on

# Allow Nginx to serve files from application directory
semanage fcontext -a -t httpd_exec_t "/opt/tender247(/.*)?"
restorecon -R /opt/tender247
```

### 11.2 Configure Fail2Ban
```bash
# Install Fail2Ban
sudo dnf install -y epel-release
sudo dnf install -y fail2ban

# Configure for SSH protection
sudo cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/secure
EOF

# Start and enable Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 11.3 Harden SSH Configuration
```bash
# Backup SSH configuration
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Update SSH configuration
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
echo "AllowUsers tender247" | sudo tee -a /etc/ssh/sshd_config

# Restart SSH service
sudo systemctl restart sshd
```

## Step 12: Final Testing and Verification

### 12.1 Comprehensive Testing
```bash
# Test application startup
pm2 restart tender247
sleep 10
pm2 status

# Test web server response
curl -I http://localhost:3000
curl -I https://yourdomain.com

# Test database operations
psql -h localhost -U tender247_user -d tender247_db -c "SELECT COUNT(*) FROM users;"

# Test file uploads (create a test file)
curl -X POST -F "file=@test.txt" https://yourdomain.com/api/test-upload

# Test SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null
```

### 12.2 Performance Testing
```bash
# Install Apache Bench for load testing
sudo dnf install -y httpd-tools

# Basic load test
ab -n 1000 -c 10 https://yourdomain.com/

# Monitor during load test
pm2 monit
```

### 12.3 Security Testing
```bash
# Check open ports
nmap localhost

# Check SSL configuration
testssl.sh yourdomain.com

# Check HTTP headers
curl -I https://yourdomain.com
```

## Step 13: Go-Live Checklist

### Before Going Live
- [ ] SSL certificate is properly configured and valid
- [ ] Domain DNS is pointing to VPS IP address
- [ ] Application starts successfully with PM2
- [ ] Database connection is working
- [ ] File uploads are functional
- [ ] Email notifications are configured
- [ ] Backup script is working
- [ ] Monitoring script is active
- [ ] Log rotation is configured
- [ ] Firewall rules are properly set
- [ ] Security headers are enabled
- [ ] Performance is acceptable under load

### Default Login Credentials
- **Email**: admin@tender247.com
- **Password**: Admin@123
- **Action**: Change immediately after first login

### Post-Deployment Tasks
1. Change default admin password
2. Create additional user accounts
3. Configure email SMTP settings
4. Set up monitoring alerts
5. Test all major functionalities
6. Train end users
7. Document any custom configurations

## Troubleshooting Common Issues

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs tender247

# Check application logs
tail -f /opt/tender247/logs/app.log

# Check system resources
htop
df -h

# Test Node.js installation
node --version
npm --version
```

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql-15

# Check database connectivity
psql -h localhost -U tender247_user -d tender247_db -c "SELECT 1;"

# Check PostgreSQL logs
sudo tail -f /var/lib/pgsql/15/data/log/postgresql-*.log
```

### SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew certificate manually
certbot renew

# Check Nginx configuration
nginx -t
sudo systemctl status nginx
```

### Performance Issues
```bash
# Monitor system resources
htop
iotop
nethogs

# Check PM2 monitoring
pm2 monit

# Analyze slow queries
psql -h localhost -U tender247_user -d tender247_db -c "SELECT * FROM pg_stat_activity;"
```

## Maintenance and Updates

### Regular Maintenance Tasks

**Daily:**
- Check application logs for errors
- Monitor system resources
- Verify backup completion

**Weekly:**
- Update system packages: `sudo dnf update`
- Check SSL certificate expiry
- Review security logs
- Monitor disk space usage

**Monthly:**
- Update Node.js dependencies: `npm update`
- Rotate and clean old logs
- Review user access and permissions
- Optimize database performance
- Test backup restoration procedure

### Update Procedures
```bash
# Update application code
cd /opt/tender247
git pull origin main  # If using Git
npm install --production
pm2 restart tender247

# Update system packages
sudo dnf update -y
sudo reboot  # If kernel updates

# Update SSL certificates
certbot renew
sudo systemctl reload nginx
```

---

This completes the comprehensive VPS installation manual for the Tender Management System. Follow each step carefully and refer to the troubleshooting section for any issues. The system should be fully operational and production-ready upon completion.