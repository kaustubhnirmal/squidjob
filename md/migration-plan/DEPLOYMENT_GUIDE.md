# Deployment Guide - Multi-Platform Instructions
# Complete Deployment Documentation

## Deployment Overview

### Supported Platforms
The Tender Management System supports deployment across multiple platforms and environments:

1. **cPanel Shared Hosting** - Budget-friendly solution for small teams
2. **VPS/Dedicated Servers** - Full control with AlmaLinux/CentOS/Ubuntu
3. **Cloud Platforms** - AWS, Google Cloud, Azure with auto-scaling
4. **Containerized Deployment** - Docker and Kubernetes support
5. **Replit Platform** - Development and testing environment

### Pre-Deployment Checklist
- [ ] Node.js 18+ environment available
- [ ] PostgreSQL 12+ database access
- [ ] Required environment variables configured
- [ ] SSL certificate obtained (for production)
- [ ] Domain name configured
- [ ] Email service configured
- [ ] Backup strategy implemented

## cPanel Shared Hosting Deployment

### Requirements
- **Node.js**: Version 18 or higher
- **Database**: PostgreSQL (MySQL conversion available)
- **Storage**: Minimum 5GB disk space
- **Memory**: Minimum 1GB RAM
- **cPanel Version**: Latest with Node.js support

### Step 1: Prepare Deployment Package
```bash
# Download the deployment package
wget https://releases.tender247.com/cpanel-deployment-package.zip
unzip cpanel-deployment-package.zip
cd tender247-cpanel/
```

### Step 2: Database Setup
```sql
-- Create database through cPanel interface
-- Database name: tender247_db
-- Import the provided schema

-- Via cPanel phpMyAdmin or terminal:
mysql -u username -p tender247_db < database_setup_cpanel.sql

-- For PostgreSQL (if available):
psql -U username -d tender247_db -f postgresql13_compatible_dump.sql
```

### Step 3: File Upload and Configuration
```bash
# Upload files to public_html via File Manager or FTP
# Directory structure:
public_html/
├── tender247/
│   ├── server/
│   ├── client/
│   ├── node_modules/ (to be installed)
│   ├── package.json
│   ├── start-production.js
│   └── .env

# Set permissions
chmod 755 tender247/
chmod 644 tender247/*.js
chmod 600 tender247/.env
```

### Step 4: Environment Configuration
```bash
# Create .env file in tender247 directory
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://username:password@localhost/tender247_db

# For PostgreSQL:
DATABASE_URL=postgresql://username:password@localhost:5432/tender247_db

# Security keys (generate unique values)
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-here

# Email configuration
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-email-password

# File upload settings
MAX_FILE_SIZE=52428800
UPLOAD_PATH=/home/username/public_html/tender247/uploads
```

### Step 5: Install Dependencies
```bash
# Via SSH terminal (if available) or cPanel Terminal
cd public_html/tender247/
npm install --production

# Alternative: Upload pre-built node_modules
# Available in deployment package
```

### Step 6: Start Application
```bash
# Create startup script: start.sh
#!/bin/bash
cd /home/username/public_html/tender247
node start-production.js

# Make executable
chmod +x start.sh

# Start application
./start.sh

# For persistent running, add to crontab:
# @reboot /home/username/public_html/tender247/start.sh
```

### Step 7: Configure Web Server
```apache
# .htaccess file for Apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Enable proxy module
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
```

## VPS/Dedicated Server Deployment (AlmaLinux)

### Requirements
- **OS**: AlmaLinux 9, CentOS 8+, Ubuntu 20.04+
- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB SSD minimum
- **Network**: Public IP with ports 80, 443, 22 open

### Step 1: System Preparation
```bash
# Update system
sudo dnf update -y

# Install required packages
sudo dnf install -y curl wget git nginx postgresql postgresql-server

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Database Setup
```bash
# Initialize PostgreSQL
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create database user and database
sudo -u postgres psql << EOF
CREATE USER tender247 WITH PASSWORD 'secure_password_here';
CREATE DATABASE tender247_db OWNER tender247;
GRANT ALL PRIVILEGES ON DATABASE tender247_db TO tender247;
\q
EOF

# Import schema
sudo -u postgres psql tender247_db < postgresql13_compatible_dump.sql
```

### Step 3: Application Deployment
```bash
# Create application directory
sudo mkdir -p /opt/tender247
sudo chown $USER:$USER /opt/tender247

# Clone or upload application
cd /opt/tender247
wget https://releases.tender247.com/vps-deployment-package.tar.gz
tar -xzf vps-deployment-package.tar.gz

# Install dependencies
npm install --production

# Create uploads directory
mkdir -p uploads
chmod 755 uploads
```

### Step 4: Environment Configuration
```bash
# Create production environment file
cat > .env << EOF
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://tender247:secure_password_here@localhost:5432/tender247_db

# Security
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Email (configure with your SMTP provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File uploads
MAX_FILE_SIZE=52428800
UPLOAD_PATH=/opt/tender247/uploads

# URLs
BASE_URL=https://yourdomain.com
API_BASE_URL=https://yourdomain.com/api

# Redis (optional, for session storage)
REDIS_URL=redis://localhost:6379
EOF

# Secure environment file
chmod 600 .env
```

### Step 5: PM2 Process Management
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'tender247',
    script: 'start-production-vps.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/tender247/error.log',
    out_file: '/var/log/tender247/out.log',
    log_file: '/var/log/tender247/combined.log',
    time: true,
    max_restarts: 10,
    min_uptime: '10s',
    watch: false,
    ignore_watch: ['node_modules', 'uploads', 'logs']
  }]
};
EOF

# Create log directory
sudo mkdir -p /var/log/tender247
sudo chown $USER:$USER /var/log/tender247

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 6: Nginx Configuration
```bash
# Create Nginx configuration
sudo tee /etc/nginx/conf.d/tender247.conf << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Main proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # File uploads (increased limits)
    client_max_body_size 100M;
    
    # Static files (if serving directly)
    location /uploads/ {
        alias /opt/tender247/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
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

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: SSL Certificate Setup
```bash
# Option 1: Let's Encrypt (Free)
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Option 2: Custom SSL Certificate
# Copy your certificate files to:
# /etc/ssl/certs/yourdomain.com.crt
# /etc/ssl/private/yourdomain.com.key
```

### Step 8: Firewall Configuration
```bash
# Configure firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload

# Check status
sudo firewall-cmd --list-all
```

### Step 9: Monitoring and Maintenance
```bash
# Create monitoring script
cat > /opt/tender247/monitor.sh << EOF
#!/bin/bash
# Health check script for Tender247

# Check if application is running
if ! pm2 list | grep -q "tender247.*online"; then
    echo "Application is not running, restarting..."
    pm2 restart tender247
fi

# Check disk space
DISK_USAGE=\$(df /opt/tender247 | tail -1 | awk '{print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 80 ]; then
    echo "Warning: Disk usage is at \${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=\$(free | grep Mem | awk '{printf("%.2f", \$3/\$2 * 100.0)}')
if (( \$(echo "\$MEMORY_USAGE > 90" | bc -l) )); then
    echo "Warning: Memory usage is at \${MEMORY_USAGE}%"
fi
EOF

chmod +x /opt/tender247/monitor.sh

# Add to crontab for regular monitoring
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/tender247/monitor.sh") | crontab -
```

## Cloud Platform Deployment

### AWS Deployment
```yaml
# docker-compose.yml for AWS ECS
version: '3.8'
services:
  app:
    image: tender247/app:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
    
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=tender247_db
      - POSTGRES_USER=tender247
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ssl_certs:/etc/ssl/certs
    depends_on:
      - app

volumes:
  postgres_data:
  ssl_certs:
```

### Kubernetes Deployment
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tender247-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tender247
  template:
    metadata:
      labels:
        app: tender247
    spec:
      containers:
      - name: app
        image: tender247/app:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: tender247-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: tender247-secrets
              key: jwt-secret
---
apiVersion: v1
kind: Service
metadata:
  name: tender247-service
spec:
  selector:
    app: tender247
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

## Database Migration Scripts

### PostgreSQL to MySQL Migration
```sql
-- MySQL equivalent schema
CREATE DATABASE tender247_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tender247_db;

-- Users table (MySQL version)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    department VARCHAR(100),
    designation VARCHAR(100),
    employee_id VARCHAR(50),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    INDEX idx_users_email (email),
    INDEX idx_users_status (status),
    INDEX idx_users_department (department)
) ENGINE=InnoDB;

-- Data migration script
INSERT INTO users (email, password_hash, first_name, last_name, department, status, created_at)
SELECT email, password_hash, first_name, last_name, department, status, created_at
FROM postgresql_users_backup;
```

### Environment-Specific Configurations
```bash
# Development environment
NODE_ENV=development
DEBUG=tender247:*
LOG_LEVEL=debug

# Staging environment
NODE_ENV=staging
LOG_LEVEL=info
RATE_LIMIT_ENABLED=true

# Production environment
NODE_ENV=production
LOG_LEVEL=error
RATE_LIMIT_ENABLED=true
COMPRESSION_ENABLED=true
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Application Won't Start
```bash
# Check logs
pm2 logs tender247

# Common solutions:
1. Verify Node.js version: node --version
2. Check database connection: psql $DATABASE_URL
3. Verify environment variables: cat .env
4. Check file permissions: ls -la
5. Restart services: pm2 restart tender247
```

#### Database Connection Issues
```bash
# PostgreSQL troubleshooting
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"

# Check connection from app directory
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()').then(res => console.log('OK:', res.rows[0])).catch(err => console.error('Error:', err));"
```

#### Performance Issues
```bash
# Monitor resource usage
htop
iotop
nethogs

# Check application metrics
pm2 monit

# Database performance
sudo -u postgres psql tender247_db -c "SELECT * FROM pg_stat_activity;"
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run

# Test SSL configuration
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

This comprehensive deployment guide provides the development team with detailed instructions for deploying the Tender Management System across multiple platforms and environments.