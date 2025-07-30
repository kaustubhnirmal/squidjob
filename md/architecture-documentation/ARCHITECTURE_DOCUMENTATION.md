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