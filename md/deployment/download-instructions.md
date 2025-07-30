# Download Instructions for VPS Deployment

## Quick Answer: Yes, you need ALL the code files

You need to download the complete application including all source code, configuration files, and database setup files to deploy on your VPS.

## What You Need to Download

### Method 1: Automated Package Creation (Recommended)
Run this command to create a clean deployment package:
```bash
./deployment/create-deployment-package.sh
```

This creates `tender247-vps-deployment.tar.gz` with everything you need.

### Method 2: Manual File Selection
If you want to download manually, you need these directories and files:

#### Essential Directories
- `server/` - Backend API and business logic
- `client/` - Frontend React application
- `shared/` - TypeScript schemas and types
- `deployment/` - Setup scripts and configurations

#### Essential Files
- `package.json` - Dependencies and build scripts
- `tsconfig.json` - TypeScript configuration  
- `vite.config.ts` - Build and development server config
- `drizzle.config.ts` - Database ORM configuration
- `tailwind.config.js` - CSS framework configuration

#### Environment Configuration
- `.env.almalinux` - Environment template for your VPS
- `deployment/almalinux-setup.sh` - PostgreSQL installation script

## Database Setup Options

### Option 1: Automated (Recommended)
The setup script will automatically:
- Install PostgreSQL 13
- Create database and user
- Configure connection settings
- Set up the database schema

### Option 2: Manual SQL File
If you prefer manual database setup:
- `deployment/schema.sql` - Database schema export
- Import this file into your PostgreSQL installation

## VPS Deployment Process

1. **Download**: Get all files using Method 1 or 2 above
2. **Upload**: Transfer files to your AlmaLinux 9 VPS
3. **Setup**: Run the automated setup scripts
4. **Configure**: Update environment variables
5. **Deploy**: Build and start the application

## File Size Expectations
- Complete package: ~50-100MB (with node_modules excluded)
- After `npm install`: ~200-300MB
- Built application: ~10-20MB

## Transfer Methods

### SCP (Secure Copy)
```bash
scp -r ./tender247-vps-deployment/ user@your-vps-ip:/home/user/
```

### SFTP
```bash
sftp user@your-vps-ip
put -r tender247-vps-deployment/
```

### Git Repository (if you have one)
```bash
git clone https://your-repo.com/tender247.git
```

### Archive Upload
```bash
# Create archive locally
tar -czf tender247.tar.gz tender247-vps-deployment/

# Upload archive
scp tender247.tar.gz user@your-vps-ip:/home/user/

# Extract on VPS
ssh user@your-vps-ip "cd /home/user && tar -xzf tender247.tar.gz"
```

## Quick Start After Upload

Once files are on your VPS:
```bash
cd tender247-vps-deployment/
./start.sh
```

This will automatically:
- Install dependencies
- Setup PostgreSQL 
- Configure database
- Build application
- Start with PM2

## What You DON'T Need
- `node_modules/` - Will be created by `npm install`
- `.git/` - Version control history
- Development cache files
- IDE-specific files

## Support
If you encounter issues during deployment, check:
- `deployment/vps-deployment-guide.md` - Complete setup instructions
- `deployment/postgresql-versions.md` - Database compatibility info
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step verification