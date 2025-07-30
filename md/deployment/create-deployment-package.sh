#!/bin/bash

# Create deployment package for VPS
# This script creates a clean deployment package with all necessary files

set -e

echo "🚀 Creating VPS deployment package..."

# Create deployment directory
DEPLOY_DIR="tender247-vps-deployment"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy essential application files
echo "📦 Copying application files..."

# Root configuration files
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/ 2>/dev/null || echo "package-lock.json not found, skipping"
cp tsconfig.json $DEPLOY_DIR/
cp vite.config.ts $DEPLOY_DIR/
cp drizzle.config.ts $DEPLOY_DIR/
cp tailwind.config.js $DEPLOY_DIR/

# Application directories
cp -r server/ $DEPLOY_DIR/
cp -r client/ $DEPLOY_DIR/
cp -r shared/ $DEPLOY_DIR/

# Deployment files
mkdir -p $DEPLOY_DIR/deployment/
cp deployment/*.sh $DEPLOY_DIR/deployment/ 2>/dev/null || true
cp deployment/*.md $DEPLOY_DIR/deployment/ 2>/dev/null || true

# Environment template
cp .env.almalinux $DEPLOY_DIR/.env.example

# Documentation
cp README-AlmaLinux-Setup.md $DEPLOY_DIR/ 2>/dev/null || true

# Create production package.json with only necessary scripts
echo "⚙️ Optimizing package.json for production..."
cat > $DEPLOY_DIR/package.json.production << 'EOF'
{
  "name": "tender247-vps",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "dev": "cross-env NODE_ENV=development tsx server/index.ts",
    "db:push": "drizzle-kit push"
  }
}
EOF

# Copy original dependencies
echo "📋 Copying dependencies from original package.json..."
node -e "
const orig = require('./package.json');
const prod = require('./$DEPLOY_DIR/package.json.production');
prod.dependencies = orig.dependencies;
prod.devDependencies = orig.devDependencies;
require('fs').writeFileSync('./$DEPLOY_DIR/package.json', JSON.stringify(prod, null, 2));
"

# Remove the temporary production file
rm $DEPLOY_DIR/package.json.production

# Create deployment checklist
cat > $DEPLOY_DIR/DEPLOYMENT_CHECKLIST.md << 'EOF'
# VPS Deployment Checklist

## Before Starting
- [ ] AlmaLinux 9 VPS ready
- [ ] Root or sudo access
- [ ] Domain name (optional)

## Deployment Steps
- [ ] Upload files to VPS
- [ ] Install Node.js 20
- [ ] Run `npm install`
- [ ] Execute `./deployment/almalinux-setup.sh`
- [ ] Configure `.env` file
- [ ] Run `npm run db:push`
- [ ] Run `npm run build`
- [ ] Install and configure PM2
- [ ] Setup Nginx reverse proxy
- [ ] Configure SSL (optional)

## Verification
- [ ] Application starts without errors
- [ ] Database connects successfully
- [ ] Web interface accessible
- [ ] All features working

## Files Included
- All source code
- PostgreSQL setup script
- Environment template
- Deployment documentation
- Nginx configuration example

## Support Files
- `deployment/vps-deployment-guide.md` - Complete deployment instructions
- `deployment/almalinux-setup.sh` - Automated PostgreSQL setup
- `.env.example` - Environment configuration template
EOF

# Create start script
cat > $DEPLOY_DIR/start.sh << 'EOF'
#!/bin/bash
# Quick start script for VPS deployment

echo "🚀 Starting Tender247 deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20 first:"
    echo "sudo dnf module install nodejs:20/common -y"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Setup PostgreSQL if script exists
if [ -f "deployment/almalinux-setup.sh" ]; then
    if [ ! -f ".env" ]; then
        echo "🐘 Setting up PostgreSQL..."
        chmod +x deployment/almalinux-setup.sh
        ./deployment/almalinux-setup.sh
    else
        echo "⚠️ .env file exists, skipping PostgreSQL setup"
    fi
fi

# Create .env from template if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Creating .env file from template..."
        cp .env.example .env
        echo "⚠️ Please edit .env file with your actual configuration"
        echo "nano .env"
        exit 1
    fi
fi

# Push database schema
echo "🗄️ Setting up database schema..."
npm run db:push

# Build application
echo "🔧 Building application..."
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Start application with PM2
echo "🚀 Starting application..."
pm2 start npm --name "tender247" -- run start

echo "✅ Deployment completed!"
echo "Application should be running on http://localhost:5000"
echo "Check status with: pm2 status"
echo "View logs with: pm2 logs tender247"
EOF

chmod +x $DEPLOY_DIR/start.sh

# Create archive
echo "📦 Creating deployment archive..."
tar -czf $DEPLOY_DIR.tar.gz $DEPLOY_DIR/

echo "✅ Deployment package created!"
echo ""
echo "📁 Files created:"
echo "   - $DEPLOY_DIR/ (deployment directory)"
echo "   - $DEPLOY_DIR.tar.gz (compressed archive)"
echo ""
echo "📋 Next steps:"
echo "   1. Upload $DEPLOY_DIR.tar.gz to your VPS"
echo "   2. Extract: tar -xzf $DEPLOY_DIR.tar.gz"
echo "   3. Run: cd $DEPLOY_DIR && ./start.sh"
echo "   4. Follow instructions in deployment/vps-deployment-guide.md"