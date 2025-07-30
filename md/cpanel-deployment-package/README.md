# Tender Management System - cPanel Deployment Package

## Overview
This is a complete deployment package for the Tender Management System, designed for hosting on Linux VPS through cPanel with PostgreSQL database support.

## Package Contents
- `dist/` - Production build files (frontend and backend)
- `server/` - Server source code
- `shared/` - Shared schemas and types
- `types/` - TypeScript type definitions
- `database_setup_cpanel.sql` - Database setup script for cPanel
- `database_setup_postgresql13.sql` - PostgreSQL 13.20 compatible schema
- `start-production.js` - Production server startup script
- `start-production-cors.js` - CORS-enabled startup script
- `server.js` - Alternative startup script
- `package.json` - Dependencies and scripts
- `CPANEL_DEPLOYMENT_SOLUTION_GUIDE.md` - Complete deployment instructions
- `CPANEL_DATABASE_SETUP_GUIDE.md` - Database setup guide
- `CORS_DEPLOYMENT_GUIDE.md` - CORS configuration guide

## Quick Deployment Steps

### 1. Upload Files
1. Extract this zip file to your cPanel File Manager
2. Upload all files to your domain's public folder (usually `public_html`)

### 2. Database Setup
1. Create a PostgreSQL database in cPanel
2. Import `database_setup_cpanel.sql` or `database_setup_postgresql13.sql`
3. Note down database credentials

### 3. Environment Configuration
1. Copy `.env.example` to `.env`
2. Update database connection details:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/database_name
   PGHOST=localhost
   PGPORT=5432
   PGUSER=your_db_user
   PGPASSWORD=your_db_password
   PGDATABASE=your_db_name
   ```

### 4. Install Dependencies
```bash
npm install --production
```

### 5. Start Application
Choose one of these startup methods:
```bash
# Standard production mode
node start-production.js

# With CORS support (recommended for external access)
node start-production-cors.js

# Alternative method
node server.js
```

## Default Admin Login
- **Username**: `kn@starinxs.com`
- **Password**: `admin123`

## System Requirements
- Node.js 18+ or 20+
- PostgreSQL 12, 13, or 14
- Linux VPS with cPanel
- Minimum 2GB RAM recommended

## Support Features
- Complete tender lifecycle management
- Document management with hierarchical folders
- Financial approval workflows
- Real-time notifications
- PDF compression and processing
- User management with role-based access
- MIS reporting and analytics

## Troubleshooting
Refer to the detailed guides:
- `CPANEL_DEPLOYMENT_SOLUTION_GUIDE.md` - Comprehensive deployment steps
- `CPANEL_DATABASE_SETUP_GUIDE.md` - Database configuration help
- `CORS_DEPLOYMENT_GUIDE.md` - External access configuration

## Production Ready Features
- JWT-based authentication with 24-hour token expiry
- bcrypt password hashing with 12 salt rounds
- Rate limiting and security headers
- SMTP email notifications
- File upload validation and security
- Database query optimization
- Error logging and monitoring

---
Built with React, Node.js, Express, PostgreSQL, and TypeScript
Deployment Package Created: July 24, 2025