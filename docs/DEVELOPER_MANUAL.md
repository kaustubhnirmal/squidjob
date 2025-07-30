# SquidJob Developer Manual
## Tender Management System - Complete Development Guide

### Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Core Components](#core-components)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Theme System](#theme-system)
8. [Plugin Development](#plugin-development)
9. [CDN Integration](#cdn-integration)
10. [Security Guidelines](#security-guidelines)
11. [Performance Optimization](#performance-optimization)
12. [Testing](#testing)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)

---

## System Overview

SquidJob is an enterprise-grade Tender Management System built with PHP 8.1+, MySQL 8.0+, and Apache 2.4+. It provides comprehensive functionality for managing tenders, bids, users, and administrative tasks with enterprise features including theme management, plugin architecture, and CDN integration.

### Key Features
- **Multi-role User Management**: Admin, Tender Manager, Bidder, Viewer roles
- **Complete Tender Lifecycle**: Creation, publishing, bidding, evaluation, awarding
- **Advanced Security**: CSRF protection, role-based access control, input validation
- **Theme Management**: Separate UI/UX templates without affecting core files
- **Plugin Architecture**: Modular system for custom extensions
- **CDN Integration**: Asset optimization and delivery
- **RESTful API**: Comprehensive API for all operations
- **Responsive Design**: Bootstrap 5 framework with mobile-first approach

### Technology Stack
- **Backend**: PHP 8.1+ with MVC architecture
- **Database**: MySQL 8.0+ with 19-table normalized schema
- **Frontend**: HTML5, CSS3, JavaScript ES6+, Bootstrap 5
- **Server**: Apache 2.4+ with mod_rewrite
- **Deployment**: XAMPP environment
- **Dependencies**: Composer for PHP, npm for frontend assets

---

## Architecture

### MVC Pattern
```
app/
├── controllers/     # Request handling and business logic
├── models/         # Data access and business entities
├── views/          # Presentation layer templates
└── core/           # Core system classes
```

### Core Classes
- **Router**: URL routing and request handling
- **BaseController**: Common controller functionality
- **BaseModel**: Database operations and ORM-like features
- **ErrorHandler**: Exception and error management
- **ThemeManager**: Theme switching and customization
- **PluginManager**: Plugin lifecycle and hook system
- **CDNManager**: Asset delivery and optimization

### Directory Structure
```
squidjob/
├── app/                    # Application core
│   ├── controllers/        # Controllers
│   ├── models/            # Models
│   ├── views/             # View templates
│   └── core/              # Core classes
├── config/                # Configuration files
├── database/              # Database schemas and seeds
├── public/                # Web-accessible files
│   ├── assets/            # Static assets
│   ├── uploads/           # File uploads
│   └── index.php          # Entry point
├── themes/                # Theme templates
├── plugins/               # Plugin modules
├── storage/               # Logs and cache
├── vendor/                # Composer dependencies
├── node_modules/          # npm dependencies
└── docs/                  # Documentation
```

---

## Installation & Setup

### Prerequisites
- XAMPP 8.1+ (Apache, MySQL, PHP)
- Composer 2.0+
- Node.js 16+ and npm
- Git (optional)

### Step 1: Environment Setup
1. **Install XAMPP**
   ```bash
   # Download and install XAMPP from https://www.apachefriends.org/
   # Start Apache and MySQL services
   ```

2. **Clone/Extract Project**
   ```bash
   # Place project in XAMPP htdocs directory
   cd /Applications/XAMPP/xamppfiles/htdocs/
   # Extract or clone squidjob project
   ```

### Step 2: Database Configuration
1. **Create Database**
   ```sql
   CREATE DATABASE squidjob CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'squidjob'@'localhost' IDENTIFIED BY 'squidj0b';
   GRANT ALL PRIVILEGES ON squidjob.* TO 'squidjob'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Import Schema**
   ```bash
   mysql -u squidjob -p squidjob < database/schema.sql
   mysql -u squidjob -p squidjob < database/seeds.sql
   ```

### Step 3: Configuration
1. **Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Key Configuration Values**
   ```env
   APP_ENV=development
   APP_DEBUG=true
   APP_URL=http://localhost/squidjob
   
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=squidjob
   DB_USERNAME=squidjob
   DB_PASSWORD=squidj0b
   
   JWT_SECRET=your-secret-key-here
   ENCRYPTION_KEY=your-encryption-key-here
   ```

### Step 4: Dependencies
1. **PHP Dependencies**
   ```bash
   composer install
   ```

2. **Frontend Dependencies**
   ```bash
   npm install
   npm run build
   ```

### Step 5: Permissions
```bash
chmod -R 755 storage/
chmod -R 755 public/uploads/
chmod -R 755 themes/
chmod -R 755 plugins/
```

### Step 6: Verification
1. Access `http://localhost/squidjob`
2. Login with default admin credentials:
   - Email: `admin@squidjob.com`
   - Password: `Admin@123`

---

## Core Components

### Router Class (`app/core/Router.php`)
Handles URL routing and request dispatching.

```php
// Basic usage
$router = new Router();
$router->get('/tenders', 'TenderController@index');
$router->post('/tenders', 'TenderController@store');
$router->put('/tenders/{id}', 'TenderController@update');
$router->delete('/tenders/{id}', 'TenderController@destroy');

// Route groups with middleware
$router->group(['prefix' => 'api', 'middleware' => 'auth'], function($router) {
    $router->get('/user', 'UserController@profile');
});
```

### BaseController Class (`app/controllers/BaseController.php`)
Provides common functionality for all controllers.

```php
class TenderController extends BaseController {
    public function index() {
        // Automatic authentication check
        $this->requireAuth();
        
        // Input validation
        $data = $this->validate([
            'status' => 'string|in:active,closed,draft',
            'page' => 'integer|min:1'
        ]);
        
        // Business logic
        $tenders = $this->tenderModel->getAll($data);
        
        // Response
        return $this->jsonResponse($tenders);
    }
}
```

### BaseModel Class (`app/models/BaseModel.php`)
Provides database operations and ORM-like features.

```php
class Tender extends BaseModel {
    protected $table = 'tenders';
    protected $fillable = ['title', 'description', 'budget', 'deadline'];
    protected $hidden = ['created_by'];
    
    // Relationships
    public function bids() {
        return $this->hasMany('Bid', 'tender_id');
    }
    
    public function creator() {
        return $this->belongsTo('User', 'created_by');
    }
}
```

---

## Database Schema

### Core Tables
1. **users** - User accounts and profiles
2. **roles** - User roles (Admin, Manager, Bidder, Viewer)
3. **permissions** - Granular permissions
4. **user_roles** - User-role assignments
5. **role_permissions** - Role-permission assignments
6. **tenders** - Tender information
7. **tender_categories** - Tender categorization
8. **tender_documents** - Tender attachments
9. **bids** - Bid submissions
10. **bid_documents** - Bid attachments
11. **evaluations** - Bid evaluations
12. **notifications** - System notifications
13. **audit_logs** - System audit trail
14. **settings** - Application settings
15. **sessions** - User sessions
16. **password_resets** - Password reset tokens
17. **email_templates** - Email templates
18. **file_uploads** - File upload tracking
19. **api_tokens** - API authentication tokens

### Key Relationships
```sql
-- Users and Roles (Many-to-Many)
users -> user_roles <- roles
roles -> role_permissions <- permissions

-- Tenders and Bids (One-to-Many)
tenders -> bids
users -> bids (bidder)
users -> tenders (creator)

-- Documents (One-to-Many)
tenders -> tender_documents
bids -> bid_documents

-- Evaluations (One-to-Many)
bids -> evaluations
users -> evaluations (evaluator)
```

### Indexes and Performance
```sql
-- Critical indexes for performance
CREATE INDEX idx_tenders_status_deadline ON tenders(status, deadline);
CREATE INDEX idx_bids_tender_status ON bids(tender_id, status);
CREATE INDEX idx_users_email_status ON users(email, status);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
```

---

## API Documentation

### Authentication
All API endpoints require authentication via JWT tokens or session cookies.

```bash
# Get JWT token
POST /api/auth/login
{
    "email": "user@example.com",
    "password": "password"
}

# Use token in subsequent requests
Authorization: Bearer <jwt_token>
```

### Tender Management

#### List Tenders
```bash
GET /api/tenders
Query Parameters:
- status: active|closed|draft
- category: category_id
- page: page_number
- limit: items_per_page
- search: search_term
```

#### Create Tender
```bash
POST /api/tenders
{
    "title": "Website Development",
    "description": "Develop a responsive website",
    "category_id": 1,
    "budget": 50000,
    "deadline": "2024-12-31",
    "requirements": "PHP, MySQL, Bootstrap",
    "documents": ["file1.pdf", "file2.doc"]
}
```

#### Update Tender
```bash
PUT /api/tenders/{id}
{
    "title": "Updated Title",
    "budget": 60000
}
```

#### Delete Tender
```bash
DELETE /api/tenders/{id}
```

### Bid Management

#### Submit Bid
```bash
POST /api/bids
{
    "tender_id": 1,
    "amount": 45000,
    "proposal": "Detailed proposal text",
    "timeline": "3 months",
    "documents": ["proposal.pdf"]
}
```

#### List Bids
```bash
GET /api/bids
Query Parameters:
- tender_id: filter by tender
- status: pending|accepted|rejected
- user_id: filter by bidder
```

### User Management

#### User Profile
```bash
GET /api/user/profile
PUT /api/user/profile
{
    "name": "John Doe",
    "phone": "+1234567890",
    "company": "ABC Corp"
}
```

#### Change Password
```bash
POST /api/user/change-password
{
    "current_password": "old_password",
    "new_password": "new_password",
    "confirm_password": "new_password"
}
```

### Error Responses
```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Validation failed",
        "details": {
            "email": ["Email is required"],
            "password": ["Password must be at least 8 characters"]
        }
    }
}
```

---

## Theme System

### Theme Structure
```
themes/
├── default/
│   ├── theme.json          # Theme configuration
│   ├── assets/             # Theme-specific assets
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   ├── layouts/            # Layout templates
│   │   ├── app.php
│   │   ├── auth.php
│   │   └── admin.php
│   ├── components/         # Reusable components
│   │   ├── header.php
│   │   ├── footer.php
│   │   └── sidebar.php
│   └── pages/              # Page templates
│       ├── dashboard.php
│       ├── tenders/
│       └── users/
```

### Theme Configuration (`theme.json`)
```json
{
    "name": "Default Theme",
    "version": "1.0.0",
    "description": "Default SquidJob theme",
    "author": "SquidJob Team",
    "assets": {
        "css": ["css/theme.css", "css/components.css"],
        "js": ["js/theme.js"],
        "fonts": ["fonts/inter-var.woff2"]
    },
    "layouts": {
        "default": "layouts/app.php",
        "auth": "layouts/auth.php",
        "admin": "layouts/admin.php"
    },
    "customization": {
        "colors": {
            "primary": "#007bff",
            "secondary": "#6c757d",
            "success": "#28a745"
        },
        "typography": {
            "font_family": "Inter, sans-serif",
            "font_size": "16px"
        }
    }
}
```

### Using Themes in Controllers
```php
class DashboardController extends BaseController {
    public function index() {
        // Set theme
        theme()->setTheme('default');
        
        // Render with theme
        return theme()->render('pages/dashboard', [
            'user' => auth()->user(),
            'stats' => $this->getDashboardStats()
        ]);
    }
}
```

### Theme Helper Functions
```php
// Get current theme
$currentTheme = theme()->getCurrentTheme();

// Switch theme
theme()->switchTheme('dark-theme');

// Get theme asset URL
$cssUrl = theme()->asset('css/theme.css');

// Render theme template
echo theme()->render('components/header', ['title' => 'Dashboard']);

// Get theme setting
$primaryColor = theme()->getSetting('colors.primary', '#007bff');
```

---

## Plugin Development

### Plugin Structure
```
plugins/
├── your-plugin/
│   ├── plugin.json         # Plugin configuration
│   ├── main.php           # Main plugin file
│   ├── hooks.php          # Hook registrations
│   ├── install.php        # Installation script
│   ├── uninstall.php      # Uninstallation script
│   ├── hooks/             # Hook handlers
│   ├── database/          # Database schemas
│   ├── assets/            # Plugin assets
│   ├── views/             # Plugin templates
│   ├── controllers/       # Plugin controllers
│   └── models/            # Plugin models
```

### Plugin Configuration (`plugin.json`)
```json
{
    "name": "Notification System",
    "slug": "notification-system",
    "version": "1.0.0",
    "description": "Advanced notification system",
    "author": "Your Name",
    "main": "main.php",
    "compatibility": {
        "min_version": "1.0.0",
        "php_version": "8.1"
    },
    "hooks": [
        "tender_created",
        "bid_submitted",
        "dashboard_widgets"
    ],
    "permissions": [
        "manage_notifications"
    ],
    "settings": {
        "email_enabled": {
            "type": "boolean",
            "default": true
        }
    }
}
```

### Plugin Main File (`main.php`)
```php
<?php
// Prevent direct access
if (!defined('APP_ROOT')) {
    exit('Direct access denied');
}

// Plugin initialization
add_hook('app_init', 'notification_system_init');

function notification_system_init() {
    // Initialize plugin
}

// Hook into tender creation
add_hook('tender_created', 'send_tender_notification');

function send_tender_notification($tender) {
    // Send notification logic
    return $tender;
}

// Add dashboard widget
add_hook('dashboard_widgets', 'add_notification_widget');

function add_notification_widget($widgets) {
    $widgets[] = [
        'title' => 'Notifications',
        'content' => render_notification_widget(),
        'position' => 'right'
    ];
    return $widgets;
}
```

### Available Hooks
```php
// Core application hooks
do_hook('app_init');                    // Application initialization
do_hook('before_route', $request);      // Before route processing
do_hook('after_route', $response);      // After route processing

// Authentication hooks
do_hook('user_login', $user);           // User login
do_hook('user_logout', $user);          // User logout
do_hook('user_register', $user);        // User registration

// Tender hooks
do_hook('tender_created', $tender);     // Tender created
do_hook('tender_updated', $tender);     // Tender updated
do_hook('tender_published', $tender);   // Tender published

// Bid hooks
do_hook('bid_submitted', $bid);         // Bid submitted
do_hook('bid_awarded', $bid);           // Bid awarded

// UI hooks
do_hook('dashboard_widgets', $widgets); // Dashboard widgets
do_hook('admin_menu', $menu);           // Admin menu items
```

### Plugin Management
```php
// Activate plugin
plugins()->activatePlugin('notification-system');

// Deactivate plugin
plugins()->deactivatePlugin('notification-system');

// Check if plugin is active
if (is_plugin_active('notification-system')) {
    // Plugin-specific code
}

// Get plugin setting
$emailEnabled = get_plugin_setting('notification-system', 'email_enabled', true);

// Set plugin setting
set_plugin_setting('notification-system', 'email_enabled', false);
```

---

## CDN Integration

### Configuration (`config/cdn.php`)
```php
return [
    'enabled' => env('CDN_ENABLED', false),
    'default_provider' => env('CDN_DEFAULT_PROVIDER', 'local'),
    'providers' => [
        'cloudflare' => [
            'base_url' => env('CLOUDFLARE_BASE_URL'),
            'zone_id' => env('CLOUDFLARE_ZONE_ID'),
            'api_token' => env('CLOUDFLARE_API_TOKEN')
        ]
    ]
];
```

### Using CDN in Templates
```php
<!-- CSS files -->
<link rel="stylesheet" href="<?= asset('css/app.css') ?>">

<!-- JavaScript files -->
<script src="<?= asset('js/app.js') ?>"></script>

<!-- Images -->
<img src="<?= asset('images/logo.png') ?>" alt="Logo">

<!-- Combined assets -->
<link rel="stylesheet" href="<?= combine_css(['css/bootstrap.css', 'css/app.css']) ?>">
<script src="<?= combine_js(['js/jquery.js', 'js/app.js']) ?>"></script>
```

### Asset Optimization
```php
// Minify CSS
$minifiedCSS = cdn()->minifyCSS($cssContent);

// Minify JavaScript
$minifiedJS = cdn()->minifyJS($jsContent);

// Combine and minify multiple files
$combinedCSS = cdn()->combineCSS([
    'css/bootstrap.css',
    'css/fontawesome.css',
    'css/app.css'
], 'vendor.css');

// Preload critical assets
echo preload_assets([
    ['path' => 'css/app.css', 'type' => 'css'],
    ['path' => 'js/app.js', 'type' => 'js'],
    ['path' => 'fonts/inter.woff2', 'type' => 'font']
]);
```

### Cache Management
```php
// Purge CDN cache
cdn()->purgeCache(['css/app.css', 'js/app.js']);

// Purge all cache
cdn()->purgeCache();

// Get CDN statistics
$stats = cdn()->getStatistics();
```

---

## Security Guidelines

### Input Validation
```php
// Controller validation
$data = $this->validate([
    'email' => 'required|email|max:255',
    'password' => 'required|min:8|confirmed',
    'name' => 'required|string|max:100',
    'phone' => 'nullable|regex:/^[+]?[0-9\s\-\(\)]+$/'
]);

// Manual validation
$validator = new Validator();
$errors = $validator->validate($input, $rules);
```

### CSRF Protection
```php
// Generate CSRF token
$token = csrf_token();

// Verify CSRF token
if (!csrf_verify($token)) {
    throw new SecurityException('CSRF token mismatch');
}

// In forms
<input type="hidden" name="_token" value="<?= csrf_token() ?>">
```

### SQL Injection Prevention
```php
// Use prepared statements
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND status = ?");
$stmt->execute([$email, 'active']);

// Model methods automatically use prepared statements
$user = User::where('email', $email)->first();
```

### XSS Prevention
```php
// Escape output
echo htmlspecialchars($userInput, ENT_QUOTES, 'UTF-8');

// Use helper function
echo e($userInput);

// In templates
<p><?= e($user->bio) ?></p>
```

### Authentication & Authorization
```php
// Check authentication
if (!auth()) {
    redirect('/login');
}

// Check specific permission
if (!can('manage_tenders')) {
    abort(403, 'Insufficient permissions');
}

// Role-based access
if (!hasRole('admin')) {
    abort(403, 'Admin access required');
}
```

### File Upload Security
```php
// Validate file uploads
$rules = [
    'document' => 'required|file|mimes:pdf,doc,docx|max:10240' // 10MB
];

// Secure file storage
$filename = uniqid() . '.' . $file->getExtension();
$path = 'uploads/documents/' . date('Y/m/');
$file->move($path, $filename);
```

---

## Performance Optimization

### Database Optimization
```php
// Use indexes effectively
$tenders = Tender::where('status', 'active')
                 ->where('deadline', '>', date('Y-m-d'))
                 ->orderBy('created_at', 'desc')
                 ->limit(20)
                 ->get();

// Eager loading to prevent N+1 queries
$tenders = Tender::with(['bids', 'creator', 'category'])->get();

// Use database pagination
$tenders = Tender::paginate(20);
```

### Caching Strategies
```php
// Cache expensive operations
$stats = cache()->remember('dashboard_stats', 3600, function() {
    return [
        'total_tenders' => Tender::count(),
        'active_tenders' => Tender::where('status', 'active')->count(),
        'total_bids' => Bid::count()
    ];
});

// Cache database queries
$categories = cache()->remember('tender_categories', 86400, function() {
    return TenderCategory::orderBy('name')->get();
});
```

### Asset Optimization
```php
// Combine and minify assets
$vendorCSS = combine_css([
    'css/bootstrap.min.css',
    'css/fontawesome.min.css',
    'css/datatables.min.css'
], 'vendor.css');

// Use CDN for static assets
$logoUrl = asset('images/logo.png', 'image', ['provider' => 'cloudflare']);

// Preload critical resources
echo preload_assets([
    ['path' => 'css/app.css', 'type' => 'css'],
    ['path' => 'fonts/inter-var.woff2', 'type' => 'font']
]);
```

### Code Optimization
```php
// Use generators for large datasets
function getTendersBatch($batchSize = 1000) {
    $offset = 0;
    do {
        $tenders = Tender::limit($batchSize)->offset($offset)->get();
        foreach ($tenders as $tender) {
            yield $tender;
        }
        $offset += $batchSize;
    } while (count($tenders) === $batchSize);
}

// Optimize loops
$tenderIds = array_column($tenders, 'id');
$bids = Bid::whereIn('tender_id', $tenderIds)->get();
$bidsByTender = array_group_by($bids, 'tender_id');
```

---

## Testing

### Unit Testing
```php
// Test model methods
class TenderTest extends PHPUnit\Framework\TestCase {
    public function testCreateTender() {
        $tender = new Tender();
        $data = [
            'title' => 'Test Tender',
            'description' => 'Test Description',
            'budget' => 10000,
            'deadline' => '2024-12-31'
        ];
        
        $result = $tender->create($data);
        $this->assertNotNull($result);
        $this->assertEquals('Test Tender', $result['title']);
    }
}
```

### API Testing
```php
// Test API endpoints
class TenderAPITest extends PHPUnit\Framework\TestCase {
    public function testCreateTenderAPI() {
        $response = $this->post('/api/tenders', [
            'title' => 'API Test Tender',
            'description' => 'Test Description',
            'budget' => 15000,
            'deadline' => '2024-12-31'
        ], [
            'Authorization' => 'Bearer ' . $this->getAuthToken()
        ]);
        
        $this->assertEquals(201, $response->getStatusCode());
        $data = json_decode($response->getBody(), true);
        $this->assertTrue($data['success']);
    }
}
```

### Integration Testing
```php
// Test complete workflows
class TenderWorkflowTest extends PHPUnit\Framework\TestCase {
    public function testCompleteTenderWorkflow() {
        // Create tender
        $tender = $this->createTender();
        
        // Publish tender
        $this->publishTender($tender['id']);
        
        // Submit bid
        $bid = $this->submitBid($tender['id']);
        
        // Award bid
        $this->awardBid($bid['id']);
        
        // Verify final state
        $updatedTender = Tender::find($tender['id']);
        $this->assertEquals('awarded', $updatedTender['status']);
    }
}
```

---

## Deployment

### Production Environment Setup
1. **Server Requirements**
   - PHP 8.1+ with required extensions
   - MySQL 8.0+ or MariaDB 10.6+
   - Apache 2.4+ with mod_rewrite
   - SSL certificate for HTTPS

2. **Environment Configuration**
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://yourdomain.com
   
   DB_HOST=your-db-host
   DB_DATABASE=squidjob_prod
   DB_USERNAME=squidjob_user
   DB_PASSWORD=secure-password
   
   CDN_ENABLED=true
   CDN_DEFAULT_PROVIDER=cloudflare
   ```

3. **Security Hardening**
   ```apache
   # .htaccess security headers
   Header always set X-Content-Type-Options nosniff
   Header always set X-Frame-Options DENY
   Header always set X-XSS-Protection "1; mode=block"
   Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
   ```

### Deployment Checklist
- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Clear application cache
- [ ] Optimize assets (minify, combine)
- [ ] Configure CDN
- [ ] Set up SSL certificate
- [ ] Configure backup strategy
- [ ] Set up monitoring
- [ ] Test all functionality
- [ ] Update DNS records

### Backup Strategy
```bash
# Database backup
mysqldump -u username -p squidjob_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# File backup
tar -czf files_backup_$(date +%Y%m%d_%H%M%S).tar.gz public/uploads/

# Automated backup script
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz public/uploads/

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

---

## Troubleshooting

### Common Issues

#### Database Connection Issues
```php
// Check database connection
try {
    $pdo = getDbConnection();
    echo "Database connected successfully";
} catch (Exception $e) {
    echo "Database connection failed: " . $e->getMessage();
}

// Common solutions:
// 1. Verify database credentials in .env
// 2. Check if MySQL service is running
// 3. Verify database exists and user has permissions
// 4. Check firewall settings
```

#### Permission Issues
```bash
# Fix file permissions
chmod -R 755 storage/
chmod -R 755 public/uploads/
chmod -R 644 config/
chmod 600 .env

# Fix ownership (if needed)
chown -R www-data:www-data /path/to/squidjob/
```

#### Memory Issues
```php
// Increase memory limit in php.ini
memory_limit = 256M

// Or in code for specific operations
ini_set('memory_limit', '256M');

// Optimize large data processing
function processLargeDataset($data) {
    foreach (array_chunk($data, 1000) as $chunk) {
        // Process in smaller chunks
        processChunk($chunk);
        
        // Free memory
        unset($chunk);
        gc_collect_cycles();
    }
}
```

#### Performance Issues
```php
// Enable query logging to identify slow queries
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Add database indexes for frequently queried columns
CREATE INDEX idx_tenders_status_deadline ON tenders(status, deadline);

// Use caching for expensive operations
$result = cache()->remember('expensive_operation', 3600, function() {
    return performExpensiveOperation();
});
```

### Debug Mode
```php
// Enable debug mode in .env
APP_DEBUG=true

// View debug information
if (config('app.debug')) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    
    // Log all queries
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
```

### Logging
```php
// Application logs are stored in storage/logs/
// View recent errors
tail -f storage/logs/app.log