# Local Development Setup Guide
# Complete Environment Configuration for Development

## Overview

This guide provides comprehensive instructions for setting up the Tender Management System on a local development machine. This setup is ideal for developers who want to contribute to the project, test features, or customize the application.

## Prerequisites

### Required Software
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **PostgreSQL**: Version 12 or higher
- **Git**: Latest version for version control
- **Code Editor**: VS Code recommended with extensions

### Optional but Recommended
- **Docker**: For containerized development
- **Postman**: For API testing
- **pgAdmin**: PostgreSQL administration tool
- **Redis**: For session storage and caching

## Step 1: System Setup

### 1.1 Install Node.js
```bash
# Option 1: Download from official website
# Visit https://nodejs.org and download Node.js 18+

# Option 2: Using Node Version Manager (recommended)
# Install nvm first
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show npm version
```

### 1.2 Install PostgreSQL

#### Windows
```bash
# Download PostgreSQL installer from postgresql.org
# Run the installer and follow setup wizard
# Note the password you set for postgres user
# Add PostgreSQL to PATH if not done automatically
```

#### macOS
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15

# Or download PostgreSQL.app from postgresapp.com
```

#### Linux (Ubuntu/Debian)
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 1.3 Install Git
```bash
# Windows: Download from git-scm.com
# macOS: git is usually pre-installed or via Homebrew
brew install git

# Linux
sudo apt install git

# Verify installation
git --version
```

## Step 2: Database Setup

### 2.1 Configure PostgreSQL
```bash
# Connect to PostgreSQL as postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE tender247_dev;
CREATE USER tender247_dev WITH PASSWORD 'dev_password_123';
GRANT ALL PRIVILEGES ON DATABASE tender247_dev TO tender247_dev;
ALTER USER tender247_dev CREATEDB;

# Exit PostgreSQL
\q
```

### 2.2 Test Database Connection
```bash
# Test connection
psql -h localhost -U tender247_dev -d tender247_dev -c "SELECT version();"

# If connection fails, check PostgreSQL configuration
# Edit pg_hba.conf to allow local connections
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add line: local   all   tender247_dev   md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Step 3: Project Setup

### 3.1 Clone or Extract Project
```bash
# Option 1: Clone from GitHub (if repository exists)
git clone https://github.com/your-username/tender-management-system.git
cd tender-management-system

# Option 2: Extract from complete-app-package
mkdir tender247-dev
cd tender247-dev
# Extract complete-app-package/app/* to current directory
```

### 3.2 Install Dependencies
```bash
# Install all dependencies
npm install

# If you encounter permission issues on Linux/macOS
sudo npm install -g npm

# Verify installation
npm list --depth=0
```

### 3.3 Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit the .env file
nano .env
```

### 3.4 Environment Variables for Development
```bash
# Development Environment Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
DATABASE_URL=postgresql://tender247_dev:dev_password_123@localhost:5432/tender247_dev

# Security Configuration (Development keys - NOT for production)
JWT_SECRET=development-jwt-secret-key-for-local-testing-only
SESSION_SECRET=development-session-secret-key-for-local-testing
BCRYPT_ROUNDS=8

# Application URLs
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api
FRONTEND_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
CORS_CREDENTIALS=true

# File Upload Settings
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,png,jpg,jpeg

# Email Configuration (Development - use Mailtrap or similar)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
FROM_EMAIL=dev@tender247.local
FROM_NAME=Tender247 Development

# Development Features
DEBUG=tender247:*
LOG_LEVEL=debug
RATE_LIMIT_ENABLED=false

# Optional: AI Services for testing
OPENAI_API_KEY=your-openai-api-key-for-testing
ANTHROPIC_API_KEY=your-anthropic-api-key-for-testing

# Feature Flags (All enabled in development)
FEATURE_AI_ANALYSIS=true
FEATURE_BULK_OPERATIONS=true
FEATURE_ADVANCED_SEARCH=true
FEATURE_DOCUMENT_PROCESSING=true
FEATURE_EMAIL_NOTIFICATIONS=true
```

## Step 4: Database Migration

### 4.1 Import Database Schema
```bash
# Import the complete schema
psql -h localhost -U tender247_dev -d tender247_dev -f database/postgresql_complete_schema.sql

# Import sample data
psql -h localhost -U tender247_dev -d tender247_dev -f database/sample_data.sql

# Verify tables were created
psql -h localhost -U tender247_dev -d tender247_dev -c "\dt"
```

### 4.2 Alternative: Using npm Script (if available)
```bash
# If setup script exists
npm run db:setup

# Or individual commands
npm run db:migrate
npm run db:seed
```

## Step 5: Development Tools Setup

### 5.1 VS Code Extensions (Recommended)
```bash
# Install VS Code extensions via command palette (Ctrl+Shift+P)
# Or install via VS Code marketplace:

1. TypeScript and JavaScript Language Features (built-in)
2. ESLint - Linting support
3. Prettier - Code formatting
4. Auto Rename Tag - HTML/JSX tag renaming
5. Bracket Pair Colorizer - Visual bracket matching
6. GitLens - Enhanced Git capabilities
7. Thunder Client - API testing within VS Code
8. PostgreSQL - Database management
9. Docker - Container management
10. Tailwind CSS IntelliSense - CSS utility suggestions
```

### 5.2 VS Code Workspace Settings
```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### 5.3 Create Uploads Directory
```bash
# Create necessary directories
mkdir -p uploads
mkdir -p logs

# Set permissions (Linux/macOS)
chmod 755 uploads
chmod 755 logs
```

## Step 6: Start Development

### 6.1 Start the Application
```bash
# Start in development mode
npm run dev

# The application will start with:
# - Backend API server on http://localhost:5000
# - Frontend dev server on http://localhost:3000
# - Hot reload enabled for both frontend and backend
```

### 6.2 Verify Installation
```bash
# Check if application is running
curl http://localhost:3000

# Check API health
curl http://localhost:3000/api/health

# Check database connection
curl http://localhost:3000/api/status
```

### 6.3 Access the Application
```bash
# Open browser and navigate to:
http://localhost:3000

# Default login credentials:
Email: admin@tender247.com
Password: Admin@123

# Test the following features:
1. User authentication ✓
2. Tender creation and management ✓
3. File upload functionality ✓
4. User management ✓
5. Company management ✓
```

## Step 7: Development Workflow

### 7.1 Code Structure Overview
```
tender247-dev/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility libraries
│   │   └── styles/      # CSS and styling
├── server/              # Express.js backend
│   ├── routes/          # API route handlers
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic services
│   └── utils/           # Server utilities
├── shared/              # Shared types and schemas
│   ├── schema.ts        # Database schema (Drizzle)
│   └── types.ts         # TypeScript type definitions
├── database/            # Database scripts
├── uploads/             # File upload directory
└── docs/                # Documentation
```

### 7.2 Common Development Commands
```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint
npm run lint:fix

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Build for production
npm run build

# Start production build locally
npm start

# Database operations
npm run db:migrate
npm run db:seed
npm run db:reset
```

### 7.3 Git Workflow for Development
```bash
# Create feature branch
git checkout -b feature/new-feature-name

# Make changes and commit frequently
git add .
git commit -m "feat: add specific feature description"

# Push to remote
git push origin feature/new-feature-name

# When ready, create pull request or merge to main
git checkout main
git pull origin main
git merge feature/new-feature-name
git push origin main
```

## Step 8: Testing Setup

### 8.1 Run Existing Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### 8.2 API Testing with Postman
```bash
# Import the Postman collection (if available)
# Or create new requests:

# Authentication
POST http://localhost:3000/api/auth/login
Content-Type: application/json
{
  "email": "admin@tender247.com",
  "password": "Admin@123"
}

# Get all tenders
GET http://localhost:3000/api/tenders
Authorization: Bearer [your-jwt-token]

# Create new tender
POST http://localhost:3000/api/tenders
Authorization: Bearer [your-jwt-token]
Content-Type: application/json
{
  "title": "Test Tender",
  "authority": "Test Authority",
  "deadline": "2025-12-31T23:59:59Z"
}
```

### 8.3 Database Testing
```bash
# Connect to development database
psql -h localhost -U tender247_dev -d tender247_dev

# Run some test queries
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM tenders;
SELECT COUNT(*) FROM companies;

# Check table structure
\d users
\d tenders
```

## Step 9: Debugging and Troubleshooting

### 9.1 Common Issues and Solutions

#### Issue: Application won't start
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :3000
lsof -i :5000

# Kill processes if needed
kill -9 [PID]
```

#### Issue: Database connection fails
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql

# Test connection manually
psql -h localhost -U tender247_dev -d tender247_dev

# Check pg_hba.conf for authentication settings
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

#### Issue: File upload not working
```bash
# Check uploads directory exists and has proper permissions
ls -la uploads/
mkdir -p uploads
chmod 755 uploads

# Check environment variables
echo $UPLOAD_PATH
echo $MAX_FILE_SIZE
```

#### Issue: Hot reload not working
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart development server
npm run dev
```

### 9.2 Debug Mode
```bash
# Start with debug output
DEBUG=* npm run dev

# Or specific debug namespaces
DEBUG=tender247:* npm run dev

# Check application logs
tail -f logs/app.log
```

### 9.3 Development Tools
```bash
# Check bundle size
npm run build
ls -la dist/

# Analyze dependencies
npm list --depth=1
npm audit

# Check for outdated packages
npm outdated
```

## Step 10: Advanced Development Setup

### 10.1 Docker Development Environment (Optional)
```bash
# If you prefer Docker development
# Create docker-compose.yml for development

version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: tender247_dev
      POSTGRES_PASSWORD: dev_password_123
      POSTGRES_DB: tender247_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

# Start with Docker
docker-compose up -d
```

### 10.2 Multiple Environment Setup
```bash
# Create different environment files
cp .env .env.development
cp .env .env.testing
cp .env .env.staging

# Use different environments
NODE_ENV=testing npm run dev
NODE_ENV=staging npm run dev
```

### 10.3 Performance Monitoring
```bash
# Install development performance tools
npm install --save-dev clinic autocannon

# Profile application performance
clinic doctor -- node server/index.js
clinic flame -- node server/index.js

# Load testing
autocannon http://localhost:3000
```

## Step 11: Contribution Guidelines

### 11.1 Code Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation when needed

### 11.2 Testing Requirements
- Write unit tests for business logic
- Add integration tests for API endpoints
- Maintain minimum 80% code coverage
- Test error handling scenarios

### 11.3 Documentation
- Update README for significant changes
- Add JSDoc comments for public APIs
- Document environment variables
- Update API documentation for new endpoints

## Step 12: Production Preparation

### 12.1 Environment Validation
```bash
# Check production readiness
npm run build
NODE_ENV=production npm start

# Verify environment variables
node -e "console.log(process.env)"

# Test production database connection
# (Use production database URL temporarily)
```

### 12.2 Security Checklist
- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Validate file upload types
- [ ] Enable security headers

### 12.3 Performance Optimization
- [ ] Enable compression
- [ ] Optimize database queries
- [ ] Implement caching
- [ ] Minimize bundle sizes
- [ ] Configure CDN for static assets

## Conclusion

Your local development environment is now ready! You can:

- ✅ **Develop Features** - Full hot reload development setup
- ✅ **Test Changes** - Comprehensive testing environment
- ✅ **Debug Issues** - Detailed logging and debugging tools
- ✅ **Contribute Code** - Proper Git workflow and standards
- ✅ **Deploy Changes** - Production-ready build process

### Next Steps:
1. Familiarize yourself with the codebase structure
2. Try creating a test tender to understand the workflow
3. Explore the API endpoints with Postman
4. Make a small feature change to test the development process
5. Read the user documentation to understand business requirements

### Support:
- Check the troubleshooting section for common issues
- Review the API documentation for endpoint details
- Refer to the database schema documentation for data structure
- Use the GitHub issues for questions or bug reports

Happy coding! 🚀