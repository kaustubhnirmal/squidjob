# Tender Management System - Complete Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Current Technology Stack](#current-technology-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Security](#authentication--security)
6. [File Management](#file-management)
7. [Frontend Architecture](#frontend-architecture)
8. [Business Logic](#business-logic)
9. [PHP/MySQL Migration Guide](#phpmysql-migration-guide)
10. [Deployment Instructions](#deployment-instructions)

## System Overview

### Purpose
A comprehensive tender management system that handles the complete tender lifecycle from import and tracking to bid participation and document management. The system provides role-based access control, document processing capabilities, AI-powered insights, and comprehensive workflow management for government and corporate tender processes.

### Core Features
- **User Management**: Role-based access control with departments and designations
- **Tender Lifecycle Management**: Complete workflow from import to completion
- **Document Processing**: Multi-format file support with AI-powered analysis
- **Bid Participation**: Step-by-step workflow for bid submissions
- **Financial Management**: Purchase orders, EMD tracking, and financial workflows
- **Real-time Analytics**: Dashboard with insights and reporting
- **Mobile-Responsive Design**: Optimized for all device types

### Architecture Pattern
- **Frontend**: Single Page Application (SPA) with React
- **Backend**: RESTful API with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based with role-based access control
- **File Storage**: Local file system with organized directory structure

## Current Technology Stack

### Frontend Technologies
```
React 18.2.0 + TypeScript
├── UI Framework: shadcn/ui + Radix UI primitives
├── Styling: TailwindCSS with custom themes
├── Routing: Wouter (lightweight client-side routing)
├── State Management: React Query (@tanstack/react-query)
├── Forms: React Hook Form with Zod validation
├── Build Tool: Vite with hot module replacement
└── Icons: Lucide React + React Icons
```

### Backend Technologies
```
Node.js 18+ with Express.js
├── Language: TypeScript for type safety
├── ORM: Drizzle ORM with PostgreSQL
├── Authentication: JWT + bcrypt (12 salt rounds)
├── File Upload: Multer middleware
├── Security: Helmet + CORS + Rate limiting
├── PDF Processing: pdf-lib + pdf-parse
├── Email: Nodemailer
└── AI Integration: OpenAI API + Anthropic Claude
```

### Database
```
PostgreSQL 12+ with Drizzle ORM
├── Connection Pooling: Built-in PostgreSQL pooling
├── Schema Management: Drizzle migrations
├── Type Safety: Drizzle Zod integration
└── Backup Strategy: pg_dump compatible exports
```

## Database Schema

### Core Tables Overview
```sql
-- User Management
users (id, email, password_hash, first_name, last_name, role_id, department_id, designation_id)
roles (id, name, description)
permissions (id, name, description, category)
role_permissions (role_id, permission_id)
departments (id, name, description)
designations (id, name, description, department_id)

-- Tender Management
tenders (id, title, description, tender_number, organization, deadline, status, created_by, assigned_to)
tender_statuses (id, name, color, description)
tender_assignments (tender_id, user_id, assigned_at, assigned_by)
tender_documents (id, tender_id, filename, file_path, file_size, uploaded_by)

-- Companies & Bid Participation
companies (id, name, type, contact_email, contact_phone, address)
company_contacts (id, company_id, name, email, phone, designation)
bid_participations (id, tender_id, company_id, status, created_by)
bid_documents (id, bid_participation_id, document_type, filename, file_path)

-- Financial Management
purchase_orders (id, tender_id, po_number, amount, vendor_name, status)
financial_approvals (id, po_id, approver_id, status, approved_at, comments)
emd_deposits (id, tender_id, amount, bank_name, reference_number, status)

-- Document Management
document_briefcases (id, name, description, created_by)
briefcase_documents (briefcase_id, document_id)
document_versions (id, document_id, version_number, file_path, uploaded_by)

-- Analytics & Reporting
tender_analytics (id, tender_id, views, downloads, last_accessed)
user_activity_logs (id, user_id, action, entity_type, entity_id, timestamp)
```

### Key Relationships
- Users belong to Roles, Departments, and Designations
- Tenders have many Documents and can be assigned to multiple Users
- Companies participate in Tenders through Bid Participations
- Purchase Orders are linked to Tenders with Financial Approvals
- Document Briefcases organize documents with version control

## API Endpoints

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### User Management
```
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/:id/role
GET    /api/users/:id/permissions
PUT    /api/users/:id/role
```

### Tender Management
```
GET    /api/tenders
POST   /api/tenders
GET    /api/tenders/:id
PUT    /api/tenders/:id
DELETE /api/tenders/:id
GET    /api/tenders/my-tenders
POST   /api/tenders/:id/assign
GET    /api/tenders/:id/documents
POST   /api/tenders/:id/upload
GET    /api/tenders/analytics
```

### Company & Bid Management
```
GET    /api/companies
POST   /api/companies
GET    /api/companies/:id
PUT    /api/companies/:id
POST   /api/companies/:id/contacts
GET    /api/bid-participations
POST   /api/bid-participations
GET    /api/bid-participations/:id/documents
POST   /api/bid-participations/:id/upload
```

### File Management
```
POST   /api/upload
GET    /api/files/:id
GET    /api/files/:id/download
DELETE /api/files/:id
POST   /api/files/compress-pdf
GET    /api/briefcases
POST   /api/briefcases
```

### Financial Management
```
GET    /api/purchase-orders
POST   /api/purchase-orders
GET    /api/purchase-orders/:id
PUT    /api/purchase-orders/:id/approve
GET    /api/emd-deposits
POST   /api/emd-deposits
```

## Authentication & Security

### JWT Implementation
```javascript
// Token Structure
{
  "userId": 5,
  "roleId": 17,
  "email": "admin@tender247.com",
  "iat": 1234567890,
  "exp": 1234654290  // 24 hours
}

// Security Features
- bcrypt password hashing (12 salt rounds)
- JWT token expiry (24 hours)
- Rate limiting (100 requests per 15 minutes)
- CORS policy with allowed origins
- Helmet security headers
- SQL injection protection via parameterized queries
```

### Role-Based Access Control
```javascript
// Role Hierarchy
Admin (ID: 17)
├── Full system access
├── User management
├── System configuration
└── All CRUD operations

Tender Manager (ID: 18)
├── Tender CRUD operations
├── Document management
├── Bid participation
└── Team assignments

Sales Head (ID: 19)
├── Company management
├── Bid tracking
├── Revenue analytics
└── Client relationships

Accountant (ID: 20)
├── Financial workflows
├── Purchase order management
├── EMD tracking
└── Financial reporting
```

### Permission System
```javascript
// Permission Categories
User Management: create_user, edit_user, delete_user, view_users
Tender Management: create_tender, edit_tender, delete_tender, view_tenders
Document Management: upload_document, delete_document, view_documents
Financial Management: create_po, approve_po, view_financials
System Administration: system_config, view_logs, manage_roles
```

## File Management

### Directory Structure
```
uploads/
├── tenders/
│   ├── documents/
│   │   ├── {tender_id}/
│   │   └── {filename}_{timestamp}.{ext}
│   └── thumbnails/
├── companies/
│   ├── profiles/
│   └── documents/
├── bid-participations/
│   ├── {bid_id}/
│   └── compiled/
├── briefcases/
│   └── {briefcase_id}/
└── temp/
    └── processing/
```

### File Processing Pipeline
```javascript
// Upload Flow
1. File validation (type, size, security)
2. Virus scanning (if configured)
3. Metadata extraction
4. PDF compression (for PDFs)
5. Thumbnail generation (for images)
6. Database record creation
7. File storage with organized naming
8. Access control enforcement
```

### Supported File Types
```
Documents: PDF, DOC, DOCX, XLS, XLSX, CSV
Images: JPG, JPEG, PNG, GIF, WEBP
Archives: ZIP, RAR (for bulk uploads)
Max Size: 50MB per file
Bulk Upload: Up to 10 files simultaneously
```

## Frontend Architecture

### Component Structure
```
client/src/
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── forms/            # Form components
│   ├── tables/           # Data table components
│   └── charts/           # Chart components
├── pages/
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard and analytics
│   ├── tenders/         # Tender management
│   ├── companies/       # Company management
│   ├── users/           # User management
│   └── settings/        # System settings
├── lib/
│   ├── api.ts           # API client configuration
│   ├── auth.ts          # Authentication utilities
│   ├── utils.ts         # Utility functions
│   └── validations.ts   # Zod schemas
├── hooks/
│   ├── use-auth.ts      # Authentication hooks
│   ├── use-api.ts       # API data hooks
│   └── use-permissions.ts # Permission checking
└── types/
    └── index.ts         # TypeScript type definitions
```

### State Management Strategy
```javascript
// React Query for Server State
- API data caching and synchronization
- Optimistic updates
- Background refetching
- Error handling and retries

// React Context for Global State
- Authentication state
- User permissions
- Theme preferences
- Navigation state

// Local State with useState/useReducer
- Form state
- UI component state
- Temporary data
```

### Responsive Design Implementation
```css
/* Mobile-First Approach */
.tender-card {
  @apply w-full p-4 mb-4;
}

/* Tablet and up */
@media (min-width: 768px) {
  .tender-grid {
    @apply grid grid-cols-2 gap-6;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .tender-grid {
    @apply grid-cols-3;
  }
}

/* Key Breakpoints */
sm: 640px   (mobile landscape)
md: 768px   (tablet)
lg: 1024px  (desktop)
xl: 1280px  (large desktop)
```

## Business Logic

### Tender Workflow States
```javascript
// Status Flow
New → Live → In-Process → Submitted → Awarded/Rejected → Completed

// Status Definitions
New: Recently imported, needs review
Live: Active tender, accepting bids
In-Process: Bid preparation in progress
Submitted: Bid submitted, awaiting results
Awarded: Tender won, execution phase
Rejected: Bid unsuccessful
Completed: Project delivered and closed
```

### Document Processing Workflow
```javascript
// AI-Powered Analysis Pipeline
1. Document upload and validation
2. Text extraction (PDF/OCR)
3. AI analysis for key information:
   - Tender value estimation
   - Eligibility criteria extraction
   - Deadline identification
   - Required documents list
   - Technical specifications
4. Data structuring and storage
5. Notification to relevant users
6. Integration with workflow
```

### Financial Approval Workflow
```javascript
// Multi-Level Approval System
1. Purchase Order Creation (Tender Manager)
2. Department Head Approval (if amount > 50,000)
3. Finance Team Review (if amount > 100,000)
4. Final Approval (Admin/CEO if amount > 500,000)
5. Vendor Communication
6. Execution and Tracking
```

## PHP/MySQL Migration Guide

### Recommended PHP Stack
```php
// Core Technologies
PHP 8.1+ with Composer
├── Framework: Laravel 10+ or Symfony 6+
├── Database: MySQL 8.0+ with PDO
├── Authentication: Laravel Sanctum or JWT
├── File Upload: Laravel Storage or custom
├── PDF Processing: TCPDF or DomPDF
├── Email: SwiftMailer or Laravel Mail
└── API: Laravel API Resources or Symfony API Platform
```

### Database Migration (PostgreSQL to MySQL)
```sql
-- Data Type Mappings
PostgreSQL          →  MySQL
SERIAL             →  INT AUTO_INCREMENT
TEXT               →  TEXT or LONGTEXT
JSONB              →  JSON
BOOLEAN            →  TINYINT(1)
TIMESTAMP          →  TIMESTAMP
UUID               →  CHAR(36) or BINARY(16)

-- Example User Table Migration
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_id INT,
    department_id INT,
    designation_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role_id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

### Laravel Implementation Structure
```php
// Directory Structure
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── TenderController.php
│   │   ├── UserController.php
│   │   └── CompanyController.php
│   ├── Middleware/
│   │   ├── JWTAuth.php
│   │   └── RolePermission.php
│   └── Requests/
│       ├── CreateTenderRequest.php
│       └── UpdateUserRequest.php
├── Models/
│   ├── User.php
│   ├── Tender.php
│   ├── Company.php
│   └── Role.php
├── Services/
│   ├── TenderService.php
│   ├── DocumentService.php
│   └── NotificationService.php
└── Repositories/
    ├── TenderRepository.php
    └── UserRepository.php
```

### Core Model Examples
```php
// User Model (Laravel)
<?php
class User extends Authenticatable implements JWTSubject {
    protected $fillable = [
        'email', 'password', 'first_name', 'last_name', 
        'role_id', 'department_id', 'designation_id'
    ];
    
    protected $hidden = ['password'];
    
    public function role() {
        return $this->belongsTo(Role::class);
    }
    
    public function department() {
        return $this->belongsTo(Department::class);
    }
    
    public function assignedTenders() {
        return $this->belongsToMany(Tender::class, 'tender_assignments');
    }
    
    public function hasPermission($permission) {
        return $this->role->permissions->contains('name', $permission);
    }
}

// Tender Model
<?php
class Tender extends Model {
    protected $fillable = [
        'title', 'description', 'tender_number', 'organization',
        'deadline', 'status', 'created_by', 'assigned_to'
    ];
    
    protected $dates = ['deadline'];
    
    public function creator() {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    public function assignedUsers() {
        return $this->belongsToMany(User::class, 'tender_assignments');
    }
    
    public function documents() {
        return $this->hasMany(TenderDocument::class);
    }
    
    public function bidParticipations() {
        return $this->hasMany(BidParticipation::class);
    }
}
```

### Authentication Implementation (Laravel Sanctum)
```php
// AuthController
<?php
class AuthController extends Controller {
    public function login(Request $request) {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);
        
        if (!Auth::attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
        
        $user = Auth::user();
        $token = $user->createToken('tender247')->plainTextToken;
        
        return response()->json([
            'token' => $token,
            'user' => $user->load('role', 'department', 'designation')
        ]);
    }
    
    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}

// Middleware for Role-Based Access
<?php
class RolePermissionMiddleware {
    public function handle($request, Closure $next, $permission) {
        if (!$request->user()->hasPermission($permission)) {
            return response()->json(['error' => 'Insufficient permissions'], 403);
        }
        return $next($request);
    }
}
```

### API Routes (Laravel)
```php
// routes/api.php
<?php
use App\Http\Controllers\{AuthController, TenderController, UserController};

// Authentication Routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
});

// Protected API Routes
Route::middleware(['auth:sanctum'])->group(function () {
    // User Management
    Route::apiResource('users', UserController::class)
         ->middleware('permission:manage_users');
    
    // Tender Management
    Route::apiResource('tenders', TenderController::class);
    Route::get('/tenders/my-tenders', [TenderController::class, 'myTenders']);
    Route::post('/tenders/{tender}/assign', [TenderController::class, 'assign'])
         ->middleware('permission:assign_tenders');
    
    // File Upload
    Route::post('/upload', [FileController::class, 'upload']);
    Route::get('/files/{file}/download', [FileController::class, 'download']);
});
```

### Database Seeder (Laravel)
```php
// database/seeders/DatabaseSeeder.php
<?php
class DatabaseSeeder extends Seeder {
    public function run() {
        // Create Roles
        $adminRole = Role::create(['name' => 'Admin', 'description' => 'System Administrator']);
        $managerRole = Role::create(['name' => 'Tender Manager', 'description' => 'Tender Management']);
        
        // Create Permissions
        $permissions = [
            'create_user', 'edit_user', 'delete_user', 'view_users',
            'create_tender', 'edit_tender', 'delete_tender', 'view_tenders',
            'upload_document', 'delete_document', 'view_documents',
            'create_po', 'approve_po', 'view_financials'
        ];
        
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
        
        // Assign all permissions to admin
        $adminRole->permissions()->attach(Permission::all());
        
        // Create Admin User
        User::create([
            'email' => 'admin@tender247.com',
            'password' => Hash::make('admin123'),
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'role_id' => $adminRole->id
        ]);
    }
}
```

### File Upload Service (Laravel)
```php
// app/Services/DocumentService.php
<?php
class DocumentService {
    public function uploadTenderDocument($tenderId, $file, $userId) {
        // Validate file
        $this->validateFile($file);
        
        // Generate unique filename
        $filename = time() . '_' . $file->getClientOriginalName();
        
        // Store file
        $path = $file->storeAs("tenders/{$tenderId}", $filename, 'public');
        
        // Create database record
        return TenderDocument::create([
            'tender_id' => $tenderId,
            'filename' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'uploaded_by' => $userId
        ]);
    }
    
    private function validateFile($file) {
        $allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'];
        $maxSize = 50 * 1024 * 1024; // 50MB
        
        if (!in_array($file->getClientOriginalExtension(), $allowedTypes)) {
            throw new InvalidArgumentException('File type not allowed');
        }
        
        if ($file->getSize() > $maxSize) {
            throw new InvalidArgumentException('File size too large');
        }
    }
}
```

### Frontend Migration (React to PHP Blade/Vue.js)
```php
// Option 1: Server-Side Rendering with Blade
<!-- resources/views/tenders/index.blade.php -->
@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">All Tenders</h1>
        @can('create_tender')
        <a href="{{ route('tenders.create') }}" class="btn btn-primary">
            Add New Tender
        </a>
        @endcan
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach($tenders as $tender)
        <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold mb-2">{{ $tender->title }}</h3>
            <p class="text-gray-600 mb-4">{{ Str::limit($tender->description, 100) }}</p>
            <div class="flex justify-between items-center">
                <span class="badge badge-{{ $tender->status }}">{{ $tender->status }}</span>
                <span class="text-sm text-gray-500">
                    Due: {{ $tender->deadline->format('M d, Y') }}
                </span>
            </div>
        </div>
        @endforeach
    </div>
</div>
@endsection

// Option 2: API + Vue.js/React Frontend
// Keep existing React frontend, replace API calls to point to Laravel backend
```

### Environment Configuration
```env
# .env file for Laravel
APP_NAME="Tender247 Management System"
APP_ENV=production
APP_KEY=base64:your-app-key-here
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tender247
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password

FILESYSTEM_DISK=local
SESSION_DRIVER=database
QUEUE_CONNECTION=database
```

## Deployment Instructions

### VPS Setup (AlmaLinux/CentOS)
```bash
# 1. Install Required Software
sudo yum update -y
sudo yum install -y epel-release
sudo yum install -y nginx mysql-server php php-fpm php-mysql php-json php-xml php-mbstring php-zip php-curl

# 2. Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# 3. Configure MySQL
sudo systemctl start mysqld
sudo systemctl enable mysqld
sudo mysql_secure_installation

# 4. Create Database
mysql -u root -p
CREATE DATABASE tender247;
CREATE USER 'tender_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON tender247.* TO 'tender_user'@'localhost';
FLUSH PRIVILEGES;

# 5. Configure Nginx
sudo vi /etc/nginx/conf.d/tender247.conf
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/tender247/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php-fpm/www.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }

    # Handle large file uploads
    client_max_body_size 50M;
}
```

### Laravel Deployment Steps
```bash
# 1. Clone or Upload Project
cd /var/www/html
sudo git clone https://github.com/your-repo/tender247-laravel.git tender247
cd tender247

# 2. Install Dependencies
composer install --optimize-autoloader --no-dev

# 3. Set Permissions
sudo chown -R nginx:nginx /var/www/html/tender247
sudo chmod -R 755 /var/www/html/tender247/storage
sudo chmod -R 755 /var/www/html/tender247/bootstrap/cache

# 4. Environment Setup
cp .env.example .env
php artisan key:generate

# 5. Database Migration
php artisan migrate
php artisan db:seed

# 6. Storage Link
php artisan storage:link

# 7. Cache Optimization
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 8. Start Services
sudo systemctl start nginx
sudo systemctl start php-fpm
sudo systemctl enable nginx
sudo systemctl enable php-fpm
```

### Production Optimization
```php
// config/app.php - Production Settings
'debug' => false,
'log_level' => 'error',

// config/database.php - Connection Pooling
'mysql' => [
    'options' => [
        PDO::ATTR_PERSISTENT => true,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
],

// config/cache.php - Redis Caching
'default' => 'redis',
'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'cache',
    ],
],
```

### Security Considerations
```php
// Security Headers (Middleware)
class SecurityHeaders {
    public function handle($request, Closure $next) {
        $response = $next($request);
        
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000');
        
        return $response;
    }
}

// Rate Limiting
Route::middleware(['throttle:60,1'])->group(function () {
    // API routes
});

// SQL Injection Prevention
// Always use Eloquent ORM or prepared statements
User::where('email', $email)->first(); // Safe
DB::select('SELECT * FROM users WHERE email = ?', [$email]); // Safe
```

This documentation provides a complete blueprint for replicating the Tender Management System using PHP/MySQL/Apache stack while maintaining all core functionality and security features.

# Kilo Code UI/UX Manual - SquidJob Tender Management System

## 🎨 **Project Overview**
**SquidJob** - A comprehensive tender management system with modern UI/UX design featuring purple and white color scheme, octopus mascot branding, and intuitive navigation.

**Technology Stack**: PHP 8.0+, MySQL 8.0, HTML5, CSS3, JavaScript, Bootstrap 5, jQuery
**Database**: squidjob (squidj0b/A1b2c3d4)
**Local URL**: http://localhost/squidjob

---

## 🎨 **Design System & Brand Guidelines**

### **Color Palette (CSS Variables)**
```css
:root {
  /* Primary Colors */
  --primary-purple: #7c3aed;
  --secondary-purple: #8b5cf6;
  --purple-light: #a78bfa;
  --purple-dark: #5b21b6;
  
  /* Neutral Colors */
  --white: #ffffff;
  --light-gray: #f8fafc;
  --gray: #64748b;
  --dark-gray: #334155;
  
  /* Status Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-card: #ffffff;
}
```

### **Typography System**
```css
/* Font Family */
--font-primary: 'Inter', system-ui, -apple-system, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### **Spacing System**
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
```

---

## 🏗️ **Core Architecture Principles**

### **1. Modular Structure**
- **NEVER** modify files in the `core/` directory directly
- All customizations must go through modules or themes
- Use the hook system for integration points
- Follow the established directory structure strictly

### **2. File Organization**
```
squidjob/
├── core/           # Core application (READ-ONLY)
├── modules/        # Add-on functionality
├── themes/         # UI/UX customization
├── public/         # Document root
├── assets/         # Static assets (CSS, JS, images)
│   ├── css/
│   ├── js/
│   ├── images/
│   └── icons/
└── storage/        # Application data
```

### **3. Development Guidelines**

#### **Database Operations**
- Always use prepared statements
- Use the Database class from `core/classes/Database.php`
- Create migrations for module installations
- Follow the established schema patterns

#### **Security Requirements**
- All user inputs must be validated and sanitized
- Use password_hash() for password storage
- Implement CSRF protection on all forms
- Use session-based authentication
- Sanitize file uploads with proper validation

#### **Performance Standards**
- Optimize database queries with proper indexing
- Use CDN for static assets
- Implement caching strategies
- Minimize HTTP requests
- Use lazy loading for images

---

## 📱 **Page-by-Page Implementation Guide**

### **1. Landing Page (Static)**

#### **File Structure**
```
<code_block_to_apply_changes_from>
```

#### **HTML Structure**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SquidJob - Hassle Free Tender Management</title>
    <link rel="stylesheet" href="assets/css/landing.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header Navigation -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <img src="assets/images/logo.svg" alt="SquidJob">
                    <span>SquidJob</span>
                </div>
                <nav class="nav">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How it Works</a>
                    <a href="#contact">Contact</a>
                </nav>
                <div class="header-actions">
                    <button class="btn btn-outline">Sign In</button>
                    <button class="btn btn-primary">Get Started</button>
                </div>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-left">
                    <div class="octopus-mascot">
                        <img src="assets/images/octopus-mascot.svg" alt="SquidJob Mascot">
                    </div>
                    <div class="neon-signs">
                        <span class="neon-text">DEPARTMENT</span>
                        <span class="neon-text">Good job! SquidJob</span>
                    </div>
                </div>
                <div class="hero-right">
                    <div class="hero-overlay">
                        <h2>HAVE A HASSLE FREE TENDER MANAGEMENT</h2>
                        <button class="btn btn-primary btn-large">
                            <i class="icon-play"></i>
                            See how it works
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Statistics Bar -->
    <section class="stats-bar">
        <div class="container">
            <div class="stats-grid">
                <div class="stat-item">
                    <h3>10,000+</h3>
                    <p>Active Tenders</p>
                </div>
                <div class="stat-item">
                    <h3>5,000+</h3>
                    <p>Successful Bids</p>
                </div>
                <div class="stat-item">
                    <h3>99.9%</h3>
                    <p>Uptime</p>
                </div>
                <div class="stat-item">
                    <h3>24/7</h3>
                    <p>Support</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Smart Bidding Strategies -->
    <section class="features">
        <div class="container">
            <div class="section-header">
                <h2>Shaping Success Stories with Smart Bidding Strategies</h2>
                <p>Discover how our innovative approach helps bidders secure winning bids and achieve excellence.</p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="icon-search"></i>
                    </div>
                    <h3>Smart Tender Search</h3>
                    <p>AI-powered search to find the most relevant tenders for your business.</p>
                </div>
                <!-- Repeat for other 5 features -->
            </div>
        </div>
    </section>

    <!-- 6 Steps to Bid & Win -->
    <section class="steps">
        <div class="container">
            <h2>6 STEPS TO BID & WIN</h2>
            <div class="steps-grid">
                <div class="step-item">
                    <div class="step-number">01</div>
                    <div class="step-icon">
                        <i class="icon-search"></i>
                    </div>
                    <h3>Search for Tenders</h3>
                    <p>Browse tenders with advanced filtering and AI-powered search.</p>
                    <button class="btn btn-outline">Learn More</button>
                </div>
                <!-- Repeat for other 5 steps -->
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <img src="assets/images/logo.svg" alt="SquidJob">
                    <p>Empowering businesses with intelligent tender management solutions.</p>
                </div>
                <div class="footer-links">
                    <div class="footer-section">
                        <h4>Solutions</h4>
                        <ul>
                            <li><a href="#">Tender Search</a></li>
                            <li><a href="#">Bid Management</a></li>
                            <li><a href="#">Analytics</a></li>
                            <li><a href="#">Team Collaboration</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">Documentation</a></li>
                            <li><a href="#">API Reference</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Contact</h4>
                        <ul>
                            <li>Sales: +1-234-567-8900</li>
                            <li>Support: +1-234-567-8901</li>
                            <li>Bidding Solution: +1-234-567-8902</li>
                            <li>Email: support@squidjob.com</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 SquidJob. All rights reserved. | Privacy Policy | Terms of Service</p>
            </div>
        </div>
    </footer>

    <script src="assets/js/landing.js"></script>
</body>
</html>
```

#### **CSS Implementation**
```css
/* landing.css */
:root {
    --primary-purple: #7c3aed;
    --secondary-purple: #8b5cf6;
    --white: #ffffff;
    --light-gray: #f8fafc;
    --gray: #64748b;
    --dark-gray: #334155;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.6;
    color: var(--dark-gray);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Header Styles */
.header {
    background: var(--white);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
}

.logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1.5rem;
    color: var(--primary-purple);
}

.nav {
    display: flex;
    gap: 2rem;
}

.nav a {
    text-decoration: none;
    color: var(--gray);
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav a:hover {
    color: var(--primary-purple);
}

.header-actions {
    display: flex;
    gap: 1rem;
}

/* Button Styles */
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background: var(--primary-purple);
    color: var(--white);
}

.btn-primary:hover {
    background: var(--secondary-purple);
    transform: translateY(-2px);
}

.btn-outline {
    background: transparent;
    color: var(--primary-purple);
    border: 2px solid var(--primary-purple);
}

.btn-outline:hover {
    background: var(--primary-purple);
    color: var(--white);
}

.btn-large {
    padding: 1rem 2rem;
    font-size: 1.125rem;
}

/* Hero Section */
.hero {
    padding: 8rem 0 4rem;
    background: linear-gradient(135deg, var(--light-gray) 0%, var(--white) 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
}

.hero-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}

.octopus-mascot {
    position: relative;
    text-align: center;
}

.octopus-mascot img {
    max-width: 400px;
    height: auto;
}

.neon-signs {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
}

.neon-text {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-purple);
    text-shadow: 0 0 10px var(--primary-purple);
    margin: 0.5rem 0;
}

.hero-overlay {
    background: rgba(124, 58, 237, 0.1);
    padding: 2rem;
    border-radius: 16px;
    text-align: center;
}

.hero-overlay h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--dark-gray);
    margin-bottom: 1.5rem;
}

/* Statistics Bar */
.stats-bar {
    background: var(--primary-purple);
    color: var(--white);
    padding: 3rem 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    text-align: center;
}

.stat-item h3 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.stat-item p {
    font-size: 1rem;
    opacity: 0.9;
}

/* Features Section */
.features {
    padding: 5rem 0;
    background: var(--white);
}

.section-header {
    text-align: center;
    margin-bottom: 4rem;
}

.section-header h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--dark-gray);
    margin-bottom: 1rem;
}

.section-header p {
    font-size: 1.125rem;
    color: var(--gray);
    max-width: 600px;
    margin: 0 auto;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}

.feature-card {
    background: var(--white);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    text-align: center;
    transition: transform 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-4px);
}

.feature-icon {
    width: 64px;
    height: 64px;
    background: var(--primary-purple);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
}

.feature-icon i {
    font-size: 1.5rem;
    color: var(--white);
}

.feature-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--dark-gray);
}

.feature-card p {
    color: var(--gray);
    line-height: 1.6;
}

/* Steps Section */
.steps {
    padding: 5rem 0;
    background: var(--light-gray);
}

.steps h2 {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 4rem;
    color: var(--dark-gray);
}

.steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}

.step-item {
    background: var(--white);
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    position: relative;
}

.step-number {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    background: var(--primary-purple);
    color: var(--white);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
}

.step-icon {
    width: 64px;
    height: 64px;
    background: var(--light-gray);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1rem auto 1.5rem;
}

.step-item h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--dark-gray);
}

.step-item p {
    color: var(--gray);
    margin-bottom: 1.5rem;
    line-height: 1.6;
}

/* Footer */
.footer {
    background: var(--dark-gray);
    color: var(--white);
    padding: 3rem 0 1rem;
}

.footer-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
    margin-bottom: 2rem;
}

.footer-brand img {
    height: 40px;
    margin-bottom: 1rem;
}

.footer-brand p {
    color: var(--gray);
    line-height: 1.6;
}

.footer-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}

.footer-section h4 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.footer-section ul {
    list-style: none;
}

.footer-section ul li {
    margin-bottom: 0.5rem;
}

.footer-section ul li a {
    color: var(--gray);
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-section ul li a:hover {
    color: var(--white);
}

.footer-bottom {
    border-top: 1px solid var(--gray);
    padding-top: 1rem;
    text-align: center;
    color: var(--gray);
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero-content {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
    
    .steps-grid {
        grid-template-columns: 1fr;
    }
    
    .footer-content {
        grid-template-columns: 1fr;
    }
    
    .footer-links {
        grid-template-columns: 1fr;
    }
}
```

### **2. Login Modal**

#### **HTML Structure**
```html
<!-- Login Modal -->
<div id="loginModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <div class="modal-logo">
                <img src="assets/images/logo.svg" alt="SquidJob">
                <span>Sign In</span>
            </div>
            <button class="modal-close" onclick="closeLoginModal()">
                <i class="icon-close"></i>
            </button>
        </div>
        
        <form class="login-form" id="loginForm">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="email" id="username" name="username" value="kn@starinxs.com" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <div class="password-input">
                    <input type="password" id="password" name="password" required>
                    <button type="button" class="password-toggle" onclick="togglePassword()">
                        <i class="icon-eye"></i>
                    </button>
                </div>
            </div>
            
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" name="remember" checked>
                    <span class="checkmark"></span>
                    Remember my password
                </label>
            </div>
            
            <button type="submit" class="btn btn-primary btn-full">
                Sign In
            </button>
            
            <div class="form-instructions">
                <p>Please enter your credentials to access the system</p>
                <p>Contact your administrator if you need login credentials</p>
            </div>
            
            <div class="form-footer">
                <a href="#" class="forgot-password">Forgot Password?</a>
            </div>
        </form>
    </div>
</div>
```

#### **CSS Implementation**
```css
/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    z-index: 2000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
}

.modal-content {
    background-color: var(--white);
    margin: 5% auto;
    padding: 0;
    border-radius: 12px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-50px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid var(--light-gray);
}

.modal-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 600;
    font-size: 1.25rem;
    color: var(--dark-gray);
}

.modal-logo img {
    height: 32px;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--gray);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.modal-close:hover {
    background: var(--light-gray);
    color: var(--dark-gray);
}

.login-form {
    padding: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-weight: 500;
    color: var(--dark-gray);
    margin-bottom: 0.5rem;
}

.form-group input[type="email"],
.form-group input[type="password"] {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--gray);
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: var(--primary-purple);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.password-input {
    position: relative;
}

.password-toggle {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--gray);
    cursor: pointer;
    padding: 0.25rem;
}

.password-toggle:hover {
    color: var(--dark-gray);
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    font-weight: 500;
    color: var(--dark-gray);
}

.checkbox-label input[type="checkbox"] {
    display: none;
}

.checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid var(--gray);
    border-radius: 4px;
    position: relative;
    transition: all 0.3s ease;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
    background: var(--primary-purple);
    border-color: var(--primary-purple);
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--white);
    font-size: 0.875rem;
    font-weight: 700;
}

.btn-full {
    width: 100%;
    justify-content: center;
    margin-bottom: 1rem;
}

.form-instructions {
    text-align: center;
    margin-bottom: 1rem;
}

.form-instructions p {
    font-size: 0.875rem;
    color: var(--gray);
    margin-bottom: 0.25rem;
}

.form-footer {
    text-align: center;
}

.forgot-password {
    color: var(--primary-purple);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.875rem;
}

.forgot-password:hover {
    text-decoration: underline;
}
```

#### **JavaScript Implementation**
```javascript
// landing.js
document.addEventListener('DOMContentLoaded', function() {
    // Login Modal Functionality
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    
    // Open modal when Sign In button is clicked
    document.querySelectorAll('.btn-outline').forEach(btn => {
        if (btn.textContent.includes('Sign In')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                openLoginModal();
            });
        }
    });
    
    // Close modal when clicking outside
    loginModal.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            closeLoginModal();
        }
    });
    
    // Close modal when pressing Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && loginModal.style.display === 'block') {
            closeLoginModal();
        }
    });
    
    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Password toggle functionality
    const passwordToggle = document.querySelector('.password-toggle');
    const passwordInput = document.getElementById('password');
    
    passwordToggle.addEventListener('click', function() {
        togglePassword();
    });
});

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus on username field
    setTimeout(() => {
        document.getElementById('username').focus();
    }, 100);
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'icon-eye-off';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'icon-eye';
    }
}

function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.querySelector('input[name="remember"]').checked;
    
    // Show loading state
    const submitBtn = document.querySelector('.login-form .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="icon-spinner"></i> Signing In...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Here you would make an actual API call to your PHP backend
        console.log('Login attempt:', { username, password, remember });
        
        // For demo purposes, redirect to dashboard
        window.location.href = 'dashboard.php';
    }, 1500);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .step-item, .stat-item').forEach(el => {
    observer.observe(el);
});
```

### **3. Dashboard Page**

#### **File Structure**
```
app/
├── dashboard.php           # Main dashboard page
├── includes/
│   ├── header.php         # Common header
│   ├── sidebar.php        # Navigation sidebar
│   └── footer.php         # Common footer
├── assets/
│   ├── css/
│   │   ├── dashboard.css  # Dashboard styles
│   │   └── components.css # Reusable components
│   ├── js/
│   │   └── dashboard.js   # Dashboard interactions
│   └── images/
│       ├── user-avatar.png
│       └── icons/
└── api/
    └── dashboard-data.php  # API endpoint for dashboard data
```

#### **PHP Implementation (dashboard.php)**
```php
<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/auth.php';

// Check if user is logged in
if (!isLoggedIn()) {
    header('Location: login.php');
    exit();
}

// Get user data
$user = getCurrentUser();
$userId = $user['id'];

// Get dashboard data
$stats = getDashboardStats($userId);
$recentTenders = getRecentTenders($userId);
$upcomingDeadlines = getUpcomingDeadlines($userId);
$recentActivities = getRecentActivities($userId);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - SquidJob</title>
    <link rel="stylesheet" href="assets/css/dashboard.css">
    <link rel="stylesheet" href="assets/css/components.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="app-container">
        <!-- Sidebar -->
        <?php include 'includes/sidebar.php'; ?>
        
        <!-- Main Content -->
        <div class="main-content">
            <!-- Header -->
            <?php include 'includes/header.php'; ?>
            
            <!-- Dashboard Content -->
            <div class="dashboard-content">
                <!-- Welcome Banner -->
                <div class="welcome-banner">
                    <h1>Welcome back, <?php echo htmlspecialchars($user['name']); ?>!</h1>
                    <p>Here's what's happening with your tenders today.</p>
                </div>
                
                <!-- Statistics Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon stat-blue">
                            <i class="icon-file-text"></i>
                        </div>
                        <div class="stat-content">
                            <h3><?php echo $stats['active_tenders']; ?></h3>
                            <p>Active Tenders</p>
                            <span class="stat-trend stat-up">+<?php echo $stats['tender_growth']; ?>%</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon stat-green">
                            <i class="icon-send"></i>
                        </div>
                        <div class="stat-content">
                            <h3><?php echo $stats['submitted_bids']; ?></h3>
                            <p>Submitted Bids</p>
                            <span class="stat-trend stat-up">+<?php echo $stats['bid_growth']; ?>%</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon stat-yellow">
                            <i class="icon-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h3><?php echo $stats['won_bids']; ?></h3>
                            <p>Won Bids</p>
                            <span class="stat-trend stat-neutral"><?php echo $stats['win_rate']; ?>%</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon stat-purple">
                            <i class="icon-alert-circle"></i>
                        </div>
                        <div class="stat-content">
                            <h3><?php echo $stats['pending_approvals']; ?></h3>
                            <p>Pending Approvals</p>
                            <span class="stat-trend stat-down">-<?php echo $stats['approval_reduction']; ?>%</span>
                        </div>
                    </div>
                </div>
                
                <!-- Main Dashboard Grid -->
                <div class="dashboard-grid">
                    <!-- Recent Tenders -->
                    <div class="dashboard-card recent-tenders">
                        <div class="card-header">
                            <h2>Recent Tenders</h2>
                            <a href="tenders.php" class="btn btn-outline btn-sm">View All</a>
                        </div>
                        <div class="card-content">
                            <?php if (empty($recentTenders)): ?>
                                <div class="empty-state">
                                    <i class="icon-file-text"></i>
                                    <p>No recent tenders found</p>
                                    <a href="tenders.php" class="btn btn-primary">Browse Tenders</a>
                                </div>
                            <?php else: ?>
                                <div class="tender-list">
                                    <?php foreach ($recentTenders as $tender): ?>
                                        <div class="tender-item">
                                            <div class="tender-info">
                                                <h4><?php echo htmlspecialchars($tender['title']); ?></h4>
                                                <p><?php echo htmlspecialchars($tender['authority']); ?></p>
                                                <span class="tender-status status-<?php echo $tender['status']; ?>">
                                                    <?php echo ucfirst($tender['status']); ?>
                                                </span>
                                            </div>
                                            <div class="tender-meta">
                                                <span class="tender-date">
                                                    <?php echo date('M j, Y', strtotime($tender['due_date'])); ?>
                                                </span>
                                                <a href="tender-details.php?id=<?php echo $tender['id']; ?>" 
                                                   class="btn btn-outline btn-sm">View</a>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <!-- Recent Activities -->
                    <div class="dashboard-card recent-activities">
                        <div class="card-header">
                            <h2>Recent Activities</h2>
                        </div>
                        <div class="card-content">
                            <div class="activity-timeline">
                                <?php foreach ($recentActivities as $activity): ?>
                                    <div class="activity-item">
                                        <div class="activity-icon">
                                            <i class="icon-<?php echo $activity['icon']; ?>"></i>
                                        </div>
                                        <div class="activity-content">
                                            <p><?php echo htmlspecialchars($activity['description']); ?></p>
                                            <span class="activity-time">
                                                <?php echo timeAgo($activity['created_at']); ?>
                                            </span>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Upcoming Deadlines -->
                    <div class="dashboard-card upcoming-deadlines">
                        <div class="card-header">
                            <h2>Upcoming Deadlines</h2>
                        </div>
                        <div class="card-content">
                            <?php if (empty($upcomingDeadlines)): ?>
                                <div class="empty-state">
                                    <i class="icon-check-circle"></i>
                                    <p>No upcoming deadlines</p>
                                </div>
                            <?php else: ?>
                                <div class="deadline-list">
                                    <?php foreach ($upcomingDeadlines as $deadline): ?>
                                        <div class="deadline-item">
                                            <div class="deadline-info">
                                                <h4><?php echo htmlspecialchars($deadline['title']); ?></h4>
                                                <p><?php echo htmlspecialchars($deadline['tender_title']); ?></p>
                                            </div>
                                            <div class="deadline-meta">
                                                <span class="deadline-countdown <?php echo $deadline['urgency']; ?>">
                                                    <?php echo $deadline['days_left']; ?> days left
                                                </span>
                                                <a href="tender-details.php?id=<?php echo $deadline['tender_id']; ?>" 
                                                   class="btn btn-primary btn-sm">View</a>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
 
Certainly! Here is the last complete line from my previous response, followed by the continuation:

```php
        </div>
    </div>
</body>
</html>
```

---

## 📋 **4. Tender List Page**

### **File Structure**
```
app/
├── tenders.php                # Tender list page
├── includes/
│   ├── header.php
│   ├── sidebar.php
│   └── footer.php
├── assets/
│   ├── css/
│   │   ├── tenders.css
│   ├── js/
│   │   └── tenders.js
└── api/
    └── tenders-data.php       # API endpoint for tender data
```

### **PHP Implementation (tenders.php)**
```php
<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/auth.php';

if (!isLoggedIn()) {
    header('Location: login.php');
    exit();
}

$user = getCurrentUser();
$tenders = getTendersList($user['id']);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tenders - SquidJob</title>
    <link rel="stylesheet" href="assets/css/tenders.css">
    <link rel="stylesheet" href="assets/css/components.css">
</head>
<body>
    <div class="app-container">
        <?php include 'includes/sidebar.php'; ?>
        <div class="main-content">
            <?php include 'includes/header.php'; ?>
            <div class="tenders-content">
                <div class="page-header">
                    <h1>Tender</h1>
                </div>
                <div class="tender-filter-panel">
                    <!-- Filter form as per UI/UX spec -->
                </div>
                <div class="tender-list-nav">
                    <!-- Tabs: All, Live, Archive, etc. -->
                </div>
                <div class="tender-list">
                    <?php foreach ($tenders as $tender): ?>
                        <div class="tender-card">
                            <!-- Render tender card as per UI/UX spec -->
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

---

## 📄 **5. Tender Details Page**

### **File Structure**
```
app/
├── tender-details.php
├── includes/
│   ├── header.php
│   ├── sidebar.php
│   └── footer.php
├── assets/
│   ├── css/
│   │   ├── tender-details.css
│   ├── js/
│   │   └── tender-details.js
└── api/
    └── tender-details-data.php
```

### **PHP Implementation (tender-details.php)**
```php
<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/auth.php';

if (!isLoggedIn()) {
    header('Location: login.php');
    exit();
}

$tenderId = $_GET['id'] ?? null;
if (!$tenderId) {
    header('Location: tenders.php');
    exit();
}

$tender = getTenderDetails($tenderId);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tender Details - SquidJob</title>
    <link rel="stylesheet" href="assets/css/tender-details.css">
    <link rel="stylesheet" href="assets/css/components.css">
</head>
<body>
    <div class="app-container">
        <?php include 'includes/sidebar.php'; ?>
        <div class="main-content">
            <?php include 'includes/header.php'; ?>
            <div class="tender-details-content">
                <!-- Render tender details as per UI/UX spec -->
            </div>
        </div>
    </div>
</body>
</html>
```

---

## 📝 **6. Tender Checklist Page**

### **File Structure**
```
app/
├── tender-checklist.php
├── includes/
│   ├── header.php
│   ├── sidebar.php
│   └── footer.php
├── assets/
│   ├── css/
│   │   ├── tender-checklist.css
│   ├── js/
│   │   └── tender-checklist.js
└── api/
    └── tender-checklist-data.php
```

### **PHP Implementation (tender-checklist.php)**
```php
<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/auth.php';

if (!isLoggedIn()) {
    header('Location: login.php');
    exit();
}

$tenderId = $_GET['id'] ?? null;
if (!$tenderId) {
    header('Location: tenders.php');
    exit();
}

$checklist = getTenderChecklist($tenderId);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tender Checklist - SquidJob</title>
    <link rel="stylesheet" href="assets/css/tender-checklist.css">
    <link rel="stylesheet" href="assets/css/components.css">
</head>
<body>
    <div class="app-container">
        <?php include 'includes/sidebar.php'; ?>
        <div class="main-content">
            <?php include 'includes/header.php'; ?>
            <div class="tender-checklist-content">
                <!-- Render checklist as per UI/UX spec -->
            </div>
        </div>
    </div>
</body>
</html>
```

---

**Continue this pattern for each menu page, using the UI/UX layouts and specifications provided above.**  
- Use modular includes for header, sidebar, and footer.
- Use the CSS and JS structure for maintainability.
- Follow the color, spacing, and component guidelines for perfect continuity and brand consistency.

**This manual ensures Kilo Code can execute the UI/UX implementation for every page, matching the provided screenshots and design system.**