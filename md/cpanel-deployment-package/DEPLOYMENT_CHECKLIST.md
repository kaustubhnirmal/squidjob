# cPanel Deployment Checklist

## Pre-Deployment Requirements
- [ ] Linux VPS with cPanel access
- [ ] PostgreSQL database available (version 12, 13, or 14)
- [ ] Node.js 18+ or 20+ installed
- [ ] SSH access or cPanel Terminal access
- [ ] Domain/subdomain configured

## Step 1: File Upload
- [ ] Extract deployment package zip file
- [ ] Upload all files to public_html folder (or domain subfolder)
- [ ] Verify all folders are present: dist/, server/, shared/, types/
- [ ] Check that package.json and all .js files are uploaded

## Step 2: Database Setup
- [ ] Create PostgreSQL database in cPanel
- [ ] Create database user with full privileges
- [ ] Import `database_setup_cpanel.sql` via phpPgAdmin or command line
- [ ] Verify all 19 tables are created successfully
- [ ] Test database connection

## Step 3: Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Update DATABASE_URL with actual credentials
- [ ] Set PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
- [ ] Configure SMTP settings (optional but recommended)
- [ ] Set NODE_ENV=production

## Step 4: Dependencies Installation
- [ ] Access terminal/SSH
- [ ] Navigate to application directory
- [ ] Run `npm install --production`
- [ ] Verify no critical installation errors

## Step 5: Application Startup
- [ ] Choose startup method:
  - [ ] `node start-production.js` (standard)
  - [ ] `node start-production-cors.js` (with CORS)
  - [ ] `node server.js` (alternative)
- [ ] Verify server starts without errors
- [ ] Check application logs for any issues

## Step 6: Access Testing
- [ ] Open application URL in browser
- [ ] Verify landing page loads correctly
- [ ] Test login with default admin credentials:
  - Username: `kn@starinxs.com`
  - Password: `admin123`
- [ ] Verify dashboard loads after login
- [ ] Test basic functionality (user creation, tender import)

## Step 7: Production Configuration
- [ ] Change default admin password
- [ ] Create additional user accounts
- [ ] Configure SMTP email settings
- [ ] Test file upload functionality
- [ ] Verify database operations work correctly

## Step 8: Security & Performance
- [ ] Enable HTTPS/SSL if available
- [ ] Configure proper file permissions
- [ ] Set up regular database backups
- [ ] Monitor application logs
- [ ] Test from external IP addresses

## Troubleshooting Common Issues
- [ ] Module not found errors → Check TypeScript files and paths
- [ ] Database connection errors → Verify credentials and PostgreSQL service
- [ ] Port conflicts → Ensure chosen port is available
- [ ] File permission errors → Check folder ownership and permissions
- [ ] CORS errors → Use start-production-cors.js startup script

## Optional Enhancements
- [ ] Configure process manager (PM2)
- [ ] Set up automatic SSL renewal
- [ ] Configure log rotation
- [ ] Set up monitoring and alerts
- [ ] Configure backup automation

## Success Indicators
- [ ] Application accessible via web browser
- [ ] Admin login works correctly
- [ ] Dashboard displays without errors
- [ ] File upload and tender import functional
- [ ] Email notifications working (if configured)
- [ ] All menu sections accessible
- [ ] Database operations completing successfully

---
Complete this checklist step by step for successful deployment.
If any step fails, refer to the detailed guides in the deployment package.