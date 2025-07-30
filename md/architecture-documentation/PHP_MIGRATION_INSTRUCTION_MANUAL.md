# PHP/MySQL/Apache Migration Manual
# Complete Guide for Development Team

## Table of Contents
1. [Project Overview](#project-overview)
2. [Migration Strategy](#migration-strategy)
3. [Development Environment Setup](#development-environment-setup)
4. [Database Migration](#database-migration)
5. [Backend Implementation](#backend-implementation)
6. [Frontend Options](#frontend-options)
7. [Testing & Deployment](#testing--deployment)
8. [Team Workflow](#team-workflow)

## Project Overview

### Current System (Node.js/PostgreSQL)
- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Backend**: Express.js + Drizzle ORM + PostgreSQL
- **Features**: Authentication, Tender Management, Document Processing, Real-time Analytics

### Target System (PHP/MySQL/Apache)
- **Frontend**: React (API mode) OR Laravel Blade + Vue.js
- **Backend**: Laravel 10+ with MySQL 8.0+
- **Server**: Apache with mod_rewrite + PHP-FPM
- **Features**: All existing features maintained

## Migration Strategy

### Phase 1: Database Migration (Week 1)
1. Convert PostgreSQL schema to MySQL
2. Migrate existing data
3. Test data integrity
4. Performance optimization

### Phase 2: Backend Development (Weeks 2-3)
1. Laravel project setup
2. Authentication implementation
3. API endpoints development
4. File upload system
5. Business logic porting

### Phase 3: Frontend Integration (Week 4)
1. Update API endpoints in React app
2. Test all functionalities
3. Performance optimization
4. Mobile responsive testing

### Phase 4: Deployment & Testing (Week 5)
1. VPS setup and configuration
2. Production deployment
3. Load testing
4. Security audit
5. Go-live preparation

## Development Environment Setup

### Required Software Stack
```bash
# Core Requirements
PHP 8.1+ with extensions:
- php-mysql, php-json, php-xml, php-mbstring
- php-zip, php-curl, php-gd, php-fileinfo

MySQL 8.0+ Server
Apache 2.4+ with modules:
- mod_rewrite, mod_ssl, mod_headers

Development Tools:
- Composer (PHP package manager)
- Node.js 18+ (for frontend build)
- Git for version control
```

### Local Development Setup
```bash
# 1. Install XAMPP/WAMP/MAMP or individual components
# 2. Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# 3. Create new Laravel project
composer create-project laravel/laravel tender247-php
cd tender247-php

# 4. Install additional packages
composer require tymon/jwt-auth
composer require spatie/laravel-permission
composer require maatwebsite/excel
composer require barryvdh/laravel-dompdf

# 5. Configure environment
cp .env.example .env
php artisan key:generate
```

## Database Migration

### Schema Conversion Script
```sql
-- Create Migration Database Script
-- Run this to convert PostgreSQL schema to MySQL

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_id INT,
    department_id INT,
    designation_id INT,
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role_id)
);

-- Roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Role permissions junction table
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- Departments table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Designations table
CREATE TABLE designations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    department_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Tenders table
CREATE TABLE tenders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tender_number VARCHAR(100),
    organization VARCHAR(255),
    deadline TIMESTAMP,
    status VARCHAR(50) DEFAULT 'New',
    estimated_value DECIMAL(15,2),
    eligibility_criteria TEXT,
    required_documents JSON,
    created_by INT,
    assigned_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_deadline (deadline),
    INDEX idx_created_by (created_by),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```

### Data Migration Script
```php
<?php
// database/migrations/import_existing_data.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class ImportExistingData extends Migration {
    public function up() {
        // Import roles
        DB::table('roles')->insert([
            ['id' => 17, 'name' => 'Admin', 'description' => 'System Administrator'],
            ['id' => 18, 'name' => 'Tender Manager', 'description' => 'Tender Management'],
            ['id' => 19, 'name' => 'Sales Head', 'description' => 'Sales Management'],
            ['id' => 20, 'name' => 'Accountant', 'description' => 'Financial Management']
        ]);
        
        // Import permissions
        $permissions = [
            'create_user', 'edit_user', 'delete_user', 'view_users',
            'create_tender', 'edit_tender', 'delete_tender', 'view_tenders',
            'upload_document', 'delete_document', 'view_documents',
            'create_po', 'approve_po', 'view_financials'
        ];
        
        foreach ($permissions as $permission) {
            DB::table('permissions')->insert([
                'name' => $permission,
                'description' => ucwords(str_replace('_', ' ', $permission)),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        // Create admin user
        DB::table('users')->insert([
            'id' => 5,
            'email' => 'admin@tender247.com',
            'password' => Hash::make('admin123'),
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'role_id' => 17,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
```

## Backend Implementation

### Laravel Project Structure
```
app/
├── Http/
│   ├── Controllers/
│   │   ├── API/
│   │   │   ├── AuthController.php
│   │   │   ├── TenderController.php
│   │   │   ├── UserController.php
│   │   │   ├── CompanyController.php
│   │   │   └── DocumentController.php
│   │   └── Web/
│   │       └── DashboardController.php
│   ├── Middleware/
│   │   ├── JWTAuth.php
│   │   ├── RolePermission.php
│   │   └── CorsMiddleware.php
│   └── Requests/
│       ├── Auth/
│       ├── Tender/
│       └── User/
├── Models/
│   ├── User.php
│   ├── Role.php
│   ├── Permission.php
│   ├── Tender.php
│   ├── Company.php
│   └── Document.php
├── Services/
│   ├── AuthService.php
│   ├── TenderService.php
│   ├── DocumentService.php
│   └── NotificationService.php
└── Repositories/
    ├── UserRepository.php
    ├── TenderRepository.php
    └── CompanyRepository.php
```

### Core Models Implementation
```php
<?php
// app/Models/User.php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements JWTSubject {
    use HasRoles;
    
    protected $fillable = [
        'email', 'password', 'first_name', 'last_name',
        'role_id', 'department_id', 'designation_id'
    ];
    
    protected $hidden = ['password'];
    
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
    
    // JWT methods
    public function getJWTIdentifier() {
        return $this->getKey();
    }
    
    public function getJWTCustomClaims() {
        return [
            'role_id' => $this->role_id,
            'email' => $this->email
        ];
    }
    
    // Relationships
    public function role() {
        return $this->belongsTo(Role::class);
    }
    
    public function department() {
        return $this->belongsTo(Department::class);
    }
    
    public function designation() {
        return $this->belongsTo(Designation::class);
    }
    
    public function createdTenders() {
        return $this->hasMany(Tender::class, 'created_by');
    }
    
    public function assignedTenders() {
        return $this->belongsToMany(Tender::class, 'tender_assignments');
    }
}

<?php
// app/Models/Tender.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tender extends Model {
    protected $fillable = [
        'title', 'description', 'tender_number', 'organization',
        'deadline', 'status', 'estimated_value', 'eligibility_criteria',
        'required_documents', 'created_by', 'assigned_to'
    ];
    
    protected $casts = [
        'deadline' => 'datetime',
        'estimated_value' => 'decimal:2',
        'required_documents' => 'array'
    ];
    
    // Relationships
    public function creator() {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    public function assignee() {
        return $this->belongsTo(User::class, 'assigned_to');
    }
    
    public function documents() {
        return $this->hasMany(TenderDocument::class);
    }
    
    public function bidParticipations() {
        return $this->hasMany(BidParticipation::class);
    }
    
    public function assignedUsers() {
        return $this->belongsToMany(User::class, 'tender_assignments');
    }
    
    // Scopes
    public function scopeActive($query) {
        return $query->where('status', '!=', 'Completed');
    }
    
    public function scopeByStatus($query, $status) {
        return $query->where('status', $status);
    }
}
```

### Authentication Controller
```php
<?php
// app/Http/Controllers/API/AuthController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller {
    protected $authService;
    
    public function __construct(AuthService $authService) {
        $this->authService = $authService;
    }
    
    public function login(Request $request): JsonResponse {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);
        
        $result = $this->authService->login($credentials);
        
        if (!$result['success']) {
            return response()->json([
                'error' => 'Invalid credentials'
            ], 401);
        }
        
        return response()->json([
            'token' => $result['token'],
            'user' => $result['user']
        ]);
    }
    
    public function logout(Request $request): JsonResponse {
        auth()->logout();
        return response()->json(['message' => 'Successfully logged out']);
    }
    
    public function me(Request $request): JsonResponse {
        $user = auth()->user()->load(['role', 'department', 'designation']);
        return response()->json(['user' => $user]);
    }
    
    public function refresh(): JsonResponse {
        $token = auth()->refresh();
        return response()->json(['token' => $token]);
    }
}
```

### Tender Controller
```php
<?php
// app/Http/Controllers/API/TenderController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\TenderService;
use App\Http\Requests\Tender\CreateTenderRequest;
use App\Http\Requests\Tender\UpdateTenderRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TenderController extends Controller {
    protected $tenderService;
    
    public function __construct(TenderService $tenderService) {
        $this->tenderService = $tenderService;
    }
    
    public function index(Request $request): JsonResponse {
        $filters = $request->only(['status', 'organization', 'search']);
        $tenders = $this->tenderService->getAllTenders($filters);
        
        return response()->json($tenders);
    }
    
    public function store(CreateTenderRequest $request): JsonResponse {
        $tender = $this->tenderService->createTender(
            $request->validated(),
            auth()->id()
        );
        
        return response()->json($tender, 201);
    }
    
    public function show($id): JsonResponse {
        $tender = $this->tenderService->getTenderById($id);
        
        if (!$tender) {
            return response()->json(['error' => 'Tender not found'], 404);
        }
        
        return response()->json($tender);
    }
    
    public function update(UpdateTenderRequest $request, $id): JsonResponse {
        $tender = $this->tenderService->updateTender($id, $request->validated());
        
        if (!$tender) {
            return response()->json(['error' => 'Tender not found'], 404);
        }
        
        return response()->json($tender);
    }
    
    public function destroy($id): JsonResponse {
        $deleted = $this->tenderService->deleteTender($id);
        
        if (!$deleted) {
            return response()->json(['error' => 'Tender not found'], 404);
        }
        
        return response()->json(['message' => 'Tender deleted successfully']);
    }
    
    public function myTenders(): JsonResponse {
        $tenders = $this->tenderService->getUserTenders(auth()->id());
        return response()->json($tenders);
    }
    
    public function assign(Request $request, $id): JsonResponse {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id'
        ]);
        
        $result = $this->tenderService->assignTender($id, $request->user_ids);
        
        if (!$result) {
            return response()->json(['error' => 'Assignment failed'], 400);
        }
        
        return response()->json(['message' => 'Tender assigned successfully']);
    }
}
```

### Service Layer Implementation
```php
<?php
// app/Services/TenderService.php
namespace App\Services;

use App\Models\Tender;
use App\Repositories\TenderRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class TenderService {
    protected $tenderRepository;
    
    public function __construct(TenderRepository $tenderRepository) {
        $this->tenderRepository = $tenderRepository;
    }
    
    public function getAllTenders(array $filters = []): LengthAwarePaginator {
        return $this->tenderRepository->getAllWithFilters($filters);
    }
    
    public function createTender(array $data, int $userId): Tender {
        $data['created_by'] = $userId;
        return $this->tenderRepository->create($data);
    }
    
    public function getTenderById(int $id): ?Tender {
        return $this->tenderRepository->findWithRelations($id);
    }
    
    public function updateTender(int $id, array $data): ?Tender {
        return $this->tenderRepository->update($id, $data);
    }
    
    public function deleteTender(int $id): bool {
        return $this->tenderRepository->delete($id);
    }
    
    public function getUserTenders(int $userId): LengthAwarePaginator {
        return $this->tenderRepository->getUserTenders($userId);
    }
    
    public function assignTender(int $tenderId, array $userIds): bool {
        $tender = $this->tenderRepository->find($tenderId);
        
        if (!$tender) {
            return false;
        }
        
        $tender->assignedUsers()->sync($userIds);
        return true;
    }
}
```

### Document Upload Service
```php
<?php
// app/Services/DocumentService.php
namespace App\Services;

use App\Models\TenderDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentService {
    public function uploadTenderDocument(int $tenderId, UploadedFile $file, int $userId): TenderDocument {
        // Validate file
        $this->validateFile($file);
        
        // Generate unique filename
        $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
        
        // Store file
        $path = $file->storeAs("tenders/{$tenderId}/documents", $filename, 'public');
        
        // Create database record
        return TenderDocument::create([
            'tender_id' => $tenderId,
            'original_name' => $file->getClientOriginalName(),
            'filename' => $filename,
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => $userId
        ]);
    }
    
    public function downloadDocument(int $documentId): ?array {
        $document = TenderDocument::find($documentId);
        
        if (!$document || !Storage::disk('public')->exists($document->file_path)) {
            return null;
        }
        
        return [
            'path' => storage_path('app/public/' . $document->file_path),
            'name' => $document->original_name,
            'mime_type' => $document->mime_type
        ];
    }
    
    private function validateFile(UploadedFile $file): void {
        $allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];
        $maxSize = 50 * 1024 * 1024; // 50MB
        
        if (!in_array($file->getClientOriginalExtension(), $allowedTypes)) {
            throw new \InvalidArgumentException('File type not allowed');
        }
        
        if ($file->getSize() > $maxSize) {
            throw new \InvalidArgumentException('File size exceeds limit');
        }
    }
    
    public function compressPdf(string $filePath): string {
        // Implementation for PDF compression
        // You can use libraries like PDFtk or Ghostscript
        return $filePath;
    }
}
```

## Frontend Options

### Option 1: Keep React Frontend (Recommended)
```javascript
// Update API configuration
// src/lib/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Update authentication
// src/lib/auth.ts
export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  const { token, user } = response.data;
  
  localStorage.setItem('token', token);
  apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;
  
  return { token, user };
};
```

### Option 2: Laravel Blade + Vue.js
```php
<!-- resources/views/dashboard.blade.php -->
@extends('layouts.app')

@section('content')
<div id="app">
    <dashboard-component 
        :user="{{ auth()->user()->toJson() }}"
        :permissions="{{ auth()->user()->role->permissions->pluck('name')->toJson() }}">
    </dashboard-component>
</div>
@endsection

@push('scripts')
<script src="{{ mix('js/dashboard.js') }}"></script>
@endpush
```

## Testing & Deployment

### Unit Testing Setup
```php
<?php
// tests/Feature/TenderControllerTest.php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Tender;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TenderControllerTest extends TestCase {
    use RefreshDatabase;
    
    protected function setUp(): void {
        parent::setUp();
        $this->seed();
    }
    
    public function test_user_can_create_tender() {
        $user = User::factory()->create();
        
        $tenderData = [
            'title' => 'Test Tender',
            'description' => 'Test Description',
            'organization' => 'Test Org',
            'deadline' => now()->addDays(30)->toDateString()
        ];
        
        $response = $this->actingAs($user)
                         ->postJson('/api/tenders', $tenderData);
        
        $response->assertStatus(201)
                 ->assertJsonStructure(['id', 'title', 'description']);
    }
    
    public function test_user_can_view_their_tenders() {
        $user = User::factory()->create();
        $tender = Tender::factory()->create(['created_by' => $user->id]);
        
        $response = $this->actingAs($user)
                         ->getJson('/api/tenders/my-tenders');
        
        $response->assertStatus(200)
                 ->assertJsonFragment(['id' => $tender->id]);
    }
}
```

### Production Deployment
```bash
# VPS Deployment Script
#!/bin/bash

# 1. System preparation
sudo yum update -y
sudo yum install -y epel-release
sudo yum install -y httpd mysql-server php php-fpm php-mysql php-json php-xml

# 2. Configure Apache
sudo systemctl start httpd
sudo systemctl enable httpd

# 3. Configure MySQL
sudo systemctl start mysqld
sudo systemctl enable mysqld
sudo mysql_secure_installation

# 4. Deploy application
cd /var/www/html
sudo git clone https://github.com/your-repo/tender247-php.git
cd tender247-php

# 5. Install dependencies
composer install --optimize-autoloader --no-dev
npm install
npm run production

# 6. Configure environment
cp .env.production .env
php artisan key:generate

# 7. Database setup
php artisan migrate
php artisan db:seed

# 8. Set permissions
sudo chown -R apache:apache /var/www/html/tender247-php
sudo chmod -R 755 storage bootstrap/cache

# 9. Configure Apache virtual host
sudo tee /etc/httpd/conf.d/tender247.conf << EOF
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/html/tender247-php/public
    
    <Directory /var/www/html/tender247-php/public>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog /var/log/httpd/tender247_error.log
    CustomLog /var/log/httpd/tender247_access.log combined
</VirtualHost>
EOF

# 10. Restart services
sudo systemctl restart httpd
sudo systemctl restart php-fpm
```

## Team Workflow

### Development Phases
```
Week 1: Database & Setup
├── Day 1-2: MySQL schema conversion
├── Day 3-4: Data migration scripts
└── Day 5: Laravel project setup

Week 2: Core Backend
├── Day 1-2: Authentication system
├── Day 3-4: User & role management
└── Day 5: Basic API endpoints

Week 3: Feature Development
├── Day 1-2: Tender management APIs
├── Day 3-4: Document upload system
└── Day 5: Testing & bug fixes

Week 4: Frontend Integration
├── Day 1-2: React app integration
├── Day 3-4: Feature testing
└── Day 5: Mobile responsive testing

Week 5: Deployment
├── Day 1-2: VPS setup & deployment
├── Day 3-4: Performance optimization
└── Day 5: Go-live preparation
```

### Team Assignments
- **Backend Developer**: Laravel API development, database design
- **Frontend Developer**: React integration, UI improvements
- **DevOps Engineer**: VPS setup, deployment automation
- **QA Tester**: Feature testing, performance testing
- **Project Manager**: Coordination, timeline management

This manual provides complete guidance for migrating the Tender Management System to PHP/MySQL/Apache stack while maintaining all existing functionality.