# VPS Deployment Guide for AlmaLinux 9

## Files You Need to Download

### 1. All Application Code
Download the entire project directory containing:

#### Frontend Files
- `client/` - React frontend application
- `shared/` - Shared TypeScript schemas and types

#### Backend Files  
- `server/` - Express.js backend application
- `deployment/` - Deployment scripts and configurations

#### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Build configuration
- `drizzle.config.ts` - Database configuration
- `tailwind.config.js` - Styling configuration

#### Environment Templates
- `.env.almalinux` - Environment configuration template
- `README-AlmaLinux-Setup.md` - Setup instructions

### 2. Database Setup Options

#### Option A: Use Setup Script (Recommended)
- Download `deployment/almalinux-setup.sh`
- This will automatically create database schema

#### Option B: Manual SQL Setup
- Generate SQL file: Run `npm run db:push --dry-run > schema.sql`
- Or use the database export from current setup

## VPS Deployment Steps

### Step 1: Prepare Your VPS
```bash
# Update system
sudo dnf update -y

# Install Node.js 20
sudo dnf module install nodejs:20/common -y

# Install development tools
sudo dnf groupinstall "Development Tools" -y

# Install Git
sudo dnf install git -y
```

### Step 2: Upload Application Files
```bash
# Option A: Using Git (if you have a repository)
git clone https://your-repo-url.git tender247
cd tender247

# Option B: Using SCP from local machine
scp -r ./tender247/ user@your-vps-ip:/home/user/tender247/

# Option C: Create archive and upload
tar -czf tender247.tar.gz .
scp tender247.tar.gz user@your-vps-ip:/home/user/
ssh user@your-vps-ip "cd /home/user && tar -xzf tender247.tar.gz"
```

### Step 3: Install Dependencies
```bash
cd tender247
npm install
```

### Step 4: Setup PostgreSQL
```bash
# Make script executable
chmod +x deployment/almalinux-setup.sh

# Run PostgreSQL setup
./deployment/almalinux-setup.sh
```

### Step 5: Configure Environment
```bash
# Copy environment template
cp .env.almalinux .env

# Edit with your actual values
nano .env

# Update these values:
# DATABASE_URL=postgresql://tender247_user:your_password@localhost:5432/tender247
# JWT_SECRET=your_super_secret_key
# SMTP_HOST=your_smtp_host
```

### Step 6: Setup Database Schema
```bash
# Push schema to database
npm run db:push

# Verify database connection
node -e "
const { testConnection } = require('./server/db-local.ts');
testConnection().then(success => {
  console.log('Database test:', success ? 'PASSED' : 'FAILED');
  process.exit(success ? 0 : 1);
});
"
```

### Step 7: Build Application
```bash
# Build production version
npm run build
```

### Step 8: Setup Process Manager (PM2)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
pm2 start npm --name "tender247" -- run start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### Step 9: Configure Reverse Proxy (Nginx)
```bash
# Install Nginx
sudo dnf install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/conf.d/tender247.conf
```

Add this Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Step 10: Setup SSL (Optional but Recommended)
```bash
# Install Certbot
sudo dnf install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## File Checklist for Download

### Essential Files (Required)
- [ ] `package.json` and `package-lock.json`
- [ ] All files in `server/` directory
- [ ] All files in `client/` directory  
- [ ] All files in `shared/` directory
- [ ] `vite.config.ts`
- [ ] `tsconfig.json`
- [ ] `drizzle.config.ts`
- [ ] `tailwind.config.js`

### Deployment Files (Recommended)
- [ ] `deployment/almalinux-setup.sh`
- [ ] `.env.almalinux`
- [ ] `README-AlmaLinux-Setup.md`
- [ ] `deployment/vps-deployment-guide.md`

### Optional Files
- [ ] `README.md`
- [ ] `replit.md`
- [ ] `.gitignore`

## Post-Deployment Verification

### Check Application Status
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs tender247

# Check Nginx status
sudo systemctl status nginx

# Check PostgreSQL status
sudo systemctl status postgresql-13
```

### Test Application
```bash
# Test local access
curl http://localhost:5000

# Test external access
curl http://your-domain.com

# Test database connection
npm run db:push
```

## Troubleshooting

### Common Issues
1. **Port 5000 already in use**: Change PORT in .env
2. **Database connection fails**: Check DATABASE_URL and PostgreSQL status
3. **Permission denied**: Check file permissions and ownership
4. **Nginx 502 error**: Ensure application is running on correct port

### Log Locations
- Application logs: `pm2 logs tender247`
- Nginx logs: `/var/log/nginx/error.log`
- PostgreSQL logs: `/var/lib/pgsql/13/data/log/`

### Performance Monitoring
```bash
# Monitor system resources
htop

# Monitor application
pm2 monit

# Check database performance
sudo -u postgres psql -d tender247 -c "SELECT * FROM pg_stat_activity;"
```