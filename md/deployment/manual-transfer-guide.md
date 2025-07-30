# Manual File Transfer Guide for VPS Deployment

## Step-by-Step Transfer Process

### Step 1: Download Files from Replit

#### Option A: Download Individual Files
1. **Navigate to each directory** in the Replit file explorer
2. **Right-click and download** these essential directories:
   - `server/` (entire folder)
   - `client/` (entire folder)  
   - `shared/` (entire folder)
   - `deployment/` (entire folder)

3. **Download individual files**:
   - `package.json`
   - `tsconfig.json`
   - `vite.config.ts`
   - `drizzle.config.ts`
   - `tailwind.config.js`
   - `.env.almalinux`

#### Option B: Use Replit Shell to Create Archive
```bash
# In Replit shell, create deployment package
./deployment/create-deployment-package.sh

# Download the created tar.gz file
# tender247-vps-deployment.tar.gz will be created
```

### Step 2: Transfer Files to VPS

#### Method 1: SCP (Secure Copy Protocol)
```bash
# Upload entire directory
scp -r tender247-vps-deployment/ username@your-vps-ip:/home/username/

# Or upload archive file
scp tender247-vps-deployment.tar.gz username@your-vps-ip:/home/username/
```

#### Method 2: SFTP (Secure File Transfer Protocol)
```bash
# Connect via SFTP
sftp username@your-vps-ip

# Upload directory
put -r tender247-vps-deployment/

# Or upload archive
put tender247-vps-deployment.tar.gz

# Exit SFTP
exit
```

#### Method 3: Using Web Panel (if available)
1. **Access your VPS control panel** (cPanel, Plesk, etc.)
2. **Navigate to File Manager**
3. **Upload the tar.gz file**
4. **Extract using File Manager's extract option**

#### Method 4: Using rsync (Most Efficient)
```bash
# Sync entire directory with progress
rsync -avz --progress tender247-vps-deployment/ username@your-vps-ip:/home/username/tender247/
```

### Step 3: Extract Files on VPS (if uploaded as archive)

```bash
# SSH into your VPS
ssh username@your-vps-ip

# Navigate to upload directory
cd /home/username/

# Extract archive
tar -xzf tender247-vps-deployment.tar.gz

# Enter directory
cd tender247-vps-deployment/
```

### Step 4: Set Permissions

```bash
# Make scripts executable
chmod +x deployment/*.sh
chmod +x start.sh

# Set proper ownership (if needed)
sudo chown -R username:username /home/username/tender247-vps-deployment/
```

## File Structure After Transfer

Your VPS should have this structure:
```
/home/username/tender247-vps-deployment/
├── server/                    # Backend application
├── client/                    # Frontend application
├── shared/                    # Shared TypeScript schemas
├── deployment/                # Setup scripts
│   ├── almalinux-setup.sh    # PostgreSQL setup
│   ├── vps-deployment-guide.md
│   └── postgresql-versions.md
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Build configuration
├── drizzle.config.ts         # Database configuration
├── tailwind.config.js        # CSS configuration
├── .env.example              # Environment template
├── start.sh                  # Quick start script
├── DEPLOYMENT_CHECKLIST.md   # Deployment steps
└── README-AlmaLinux-Setup.md # Setup documentation
```

## Verification Steps

### Check File Transfer Completion
```bash
# Verify all directories exist
ls -la tender247-vps-deployment/
ls -la tender247-vps-deployment/server/
ls -la tender247-vps-deployment/client/
ls -la tender247-vps-deployment/shared/

# Check file permissions
ls -la tender247-vps-deployment/*.sh
```

### Estimate Transfer Time
- **Small files** (configs): Instant
- **Source code** (~10MB): 1-2 minutes on decent connection
- **Complete package** (~50MB): 3-5 minutes
- **With node_modules** (~200MB): 10-15 minutes

## Common Transfer Issues

### Connection Refused
```bash
# Check SSH service
sudo systemctl status ssh

# Check firewall
sudo firewall-cmd --list-all
```

### Permission Denied
```bash
# Check SSH key authentication
ssh-copy-id username@your-vps-ip

# Or use password authentication
ssh -o PreferredAuthentications=password username@your-vps-ip
```

### Large File Transfer Timeout
```bash
# Use screen for long transfers
screen
rsync -avz --progress tender247-vps-deployment/ username@your-vps-ip:/home/username/tender247/
# Ctrl+A, D to detach
# screen -r to reattach
```

## Quick Start After Transfer

Once files are transferred:
```bash
# Navigate to project directory
cd tender247-vps-deployment/

# Run automated setup
./start.sh

# Or manual setup
npm install
./deployment/almalinux-setup.sh
cp .env.example .env
# Edit .env with your settings
npm run db:push
npm run build
pm2 start npm --name "tender247" -- run start
```

## Alternative: Git-Based Transfer

If you have a Git repository:
```bash
# On VPS
git clone https://your-repository-url.git tender247
cd tender247
npm install
./deployment/almalinux-setup.sh
# Continue with setup...
```

## File Size Reference
- **Minimal package**: ~15MB (source code only)
- **Complete package**: ~50MB (with documentation)
- **After npm install**: ~200MB (with dependencies)
- **Built application**: ~20MB (production ready)

## Support Resources
- `deployment/vps-deployment-guide.md` - Complete deployment instructions
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step verification
- `start.sh` - Automated setup script