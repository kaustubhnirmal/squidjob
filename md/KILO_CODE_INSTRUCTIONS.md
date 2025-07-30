# Kilo Code Development Instructions - SquidJob Tender Management System

## Project Overview
This is a PHP/MySQL tender management system with modular architecture, theme system, and CDN integration. The project uses XAMPP for local development and is designed for VPS deployment with Cloudflare CDN.

## Database Configuration
- **Database Name**: squidjob
- **Username**: squidj0b
- **Password**: A1b2c3d4
- **Host**: localhost (XAMPP)

## Core Architecture Principles

### 1. Modular Structure
- **NEVER** modify files in the `core/` directory directly
- All customizations must go through modules or themes
- Use the hook system for integration points
- Follow the established directory structure strictly

### 2. File Organization
```
squidjob/
├── core/           # Core application (READ-ONLY)
├── modules/        # Add-on functionality
├── themes/         # UI/UX customization
├── public/         # Document root
└── storage/        # Application data
```

### 3. Development Guidelines

#### Database Operations
- Always use prepared statements
- Use the Database class from `core/classes/Database.php`
- Create migrations for module installations
- Follow the established schema patterns

#### Security Requirements
- All user inputs must be validated and sanitized
- Use password_hash() for password storage
- Implement CSRF protection on all forms
- Use session-based authentication
- Sanitize file uploads with proper validation

#### Performance Standards
- Optimize database queries with proper indexing
- Use CDN for static assets
- Implement caching strategies
- Minimize HTTP requests
- Use lazy loading for images

## Module Development Instructions

### Creating a New Module

1. **Module Structure**
```
modules/your-module/
├── module.json
├── install.php
├── uninstall.php
├── classes/
├── views/
├── assets/
├── api/
└── database/
    └── migrations/
```

2. **Module Configuration (module.json)**
```json
{
  "name": "Your Module Name",
  "version": "1.0.0",
  "description": "Module description",
  "author": "Your Name",
  "license": "MIT",
  "dependencies": [],
  "hooks": [
    "dashboard_widgets",
    "menu_items",
    "api_endpoints"
  ],
  "permissions": [
    "view_module",
    "manage_module"
  ]
}
```

3. **Installation Script (install.php)**
```php
<?php
class YourModuleInstaller {
    public function install() {
        // Create database tables
        $this->createTables();
        
        // Register hooks
        $this->registerHooks();
        
        // Create default data
        $this->createDefaultData();
        
        return true;
    }
    
    private function createTables() {
        $sql = "
        CREATE TABLE IF NOT EXISTS your_module_table (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        ";
        
        $db = Database::getInstance();
        $db->execute($sql);
    }
    
    private function registerHooks() {
        $hookManager = HookManager::getInstance();
        $hookManager->register('dashboard_widgets', 'YourModule', 'getDashboardWidgets');
        $hookManager->register('menu_items', 'YourModule', 'getMenuItems');
    }
}
?>
```

4. **Module Class Example**
```php
<?php
// modules/your-module/classes/YourModule.php
class YourModule {
    public function executeHook($hookName, $data = []) {
        switch ($hookName) {
            case 'dashboard_widgets':
                return $this->getDashboardWidgets($data);
            case 'menu_items':
                return $this->getMenuItems($data);
            default:
                return null;
        }
    }
    
    public function getDashboardWidgets($data) {
        return [
            'title' => 'Your Widget',
            'content' => $this->renderWidget(),
            'position' => 'sidebar'
        ];
    }
    
    public function getMenuItems($data) {
        return [
            'title' => 'Your Module',
            'url' => '/your-module',
            'icon' => 'icon-class',
            'permissions' => ['view_module']
        ];
    }
    
    private function renderWidget() {
        ob_start();
        include __DIR__ . '/../views/widget.php';
        return ob_get_clean();
    }
}
?>
```

## Theme Development Instructions

### Creating a New Theme

1. **Theme Structure**
```
themes/your-theme/
├── theme.json
├── index.php
├── header.php
├── footer.php
├── sidebar.php
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── views/
└── config/
```

2. **Theme Configuration (theme.json)**
```json
{
  "name": "Your Theme Name",
  "version": "1.0.0",
  "description": "Theme description",
  "author": "Your Name",
  "features": [
    "responsive",
    "dark_mode",
    "customizable_colors"
  ],
  "dependencies": []
}
```

3. **Main Layout (index.php)**
```php
<?php
$themeManager = ThemeManager::getInstance();
$colors = include 'config/colors.php';
?>
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $title ?? 'SquidJob' ?></title>
    
    <!-- Theme Assets -->
    <link rel="stylesheet" href="<?= $themeManager->getAssetUrl('css/main.css') ?>">
    
    <!-- Module Assets -->
    <?php foreach ($activeModules as $module): ?>
        <link rel="stylesheet" href="/assets/modules/<?= $module ?>/css/main.css">
    <?php endforeach; ?>
</head>
<body>
    <?php include 'header.php'; ?>
    
    <div class="flex">
        <?php include 'sidebar.php'; ?>
        <main class="flex-1 p-6">
            <?= $content ?>
        </main>
    </div>
    
    <?php include 'footer.php'; ?>
    
    <!-- Scripts -->
    <script src="<?= $themeManager->getAssetUrl('js/main.js') ?>"></script>
</body>
</html>
```

## Frontend Development Guidelines

### CSS Framework Usage
- Use Tailwind CSS for styling
- Create custom components in `components.css`
- Use CSS variables for theme colors
- Implement responsive design patterns

### JavaScript Standards
- Use Alpine.js for reactive components
- Use HTMX for dynamic content loading
- Minimize vanilla JavaScript usage
- Follow ES6+ standards

### Asset Optimization
- Optimize images using WebP format
- Use SVG for icons when possible
- Implement lazy loading for images
- Minify CSS and JavaScript files

## API Development Guidelines

### RESTful API Structure
```php
// api/v1/your-endpoint.php
<?php
require_once '../../core/classes/ApiController.php';

class YourEndpointController extends ApiController {
    public function get() {
        // Handle GET request
        $data = $this->getData();
        return $this->jsonResponse($data);
    }
    
    public function post() {
        // Handle POST request
        $data = $this->validateInput($_POST);
        $result = $this->processData($data);
        return $this->jsonResponse($result);
    }
    
    private function validateInput($data) {
        // Validate input data
        if (empty($data['required_field'])) {
            throw new Exception('Required field missing');
        }
        return $data;
    }
}
?>
```

### API Response Format
```php
// Success response
{
    "success": true,
    "data": {...},
    "message": "Operation successful"
}

// Error response
{
    "success": false,
    "error": "Error message",
    "code": "ERROR_CODE"
}
```

## Database Guidelines

### Table Naming Convention
- Use snake_case for table names
- Prefix module tables with module name
- Use descriptive names

### Column Standards
```sql
-- Standard columns for all tables
id INT PRIMARY KEY AUTO_INCREMENT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
created_by INT,
updated_by INT,
is_active BOOLEAN DEFAULT TRUE
```

### Indexing Strategy
- Index foreign keys
- Index frequently searched columns
- Use composite indexes for complex queries
- Avoid over-indexing

## Security Implementation

### Authentication
```php
// Use session-based authentication
session_start();
session_regenerate_id(true);

// Check authentication
if (!isset($_SESSION['user_id'])) {
    header('Location: /login');
    exit;
}
```

### Input Validation
```php
// Validate and sanitize input
function validateInput($data, $rules) {
    $errors = [];
    
    foreach ($rules as $field => $rule) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $errors[$field] = "Field is required";
        }
    }
    
    return $errors;
}
```

### File Upload Security
```php
// Secure file upload
function secureFileUpload($file, $allowedTypes, $maxSize) {
    $allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'png'];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($extension, $allowedExtensions)) {
        throw new Exception('Invalid file type');
    }
    
    if ($file['size'] > $maxSize) {
        throw new Exception('File too large');
    }
    
    $newFilename = uniqid() . '.' . $extension;
    $uploadPath = 'uploads/' . $newFilename;
    
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        return $newFilename;
    }
    
    throw new Exception('Upload failed');
}
```

## Performance Optimization

### Caching Strategy
```php
// Implement caching
class Cache {
    private $redis;
    
    public function __construct() {
        $this->redis = new Redis();
        $this->redis->connect('127.0.0.1', 6379);
    }
    
    public function get($key) {
        return $this->redis->get($key);
    }
    
    public function set($key, $value, $ttl = 3600) {
        return $this->redis->setex($key, $ttl, $value);
    }
}
```

### Database Optimization
```php
// Use prepared statements
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$userId]);

// Use transactions for multiple operations
$pdo->beginTransaction();
try {
    // Multiple database operations
    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollback();
    throw $e;
}
```

## Testing Guidelines

### Unit Testing
- Test all module classes
- Test database operations
- Test API endpoints
- Use PHPUnit for testing

### Integration Testing
- Test module interactions
- Test theme integration
- Test API responses
- Test user workflows

## Deployment Checklist

### Pre-deployment
- [ ] All modules tested
- [ ] Database migrations run
- [ ] Assets optimized
- [ ] Security audit completed
- [ ] Performance testing done

### Deployment Steps
1. Backup current system
2. Upload new files
3. Run database migrations
4. Clear cache
5. Test functionality
6. Monitor performance

## Common Pitfalls to Avoid

1. **Never modify core files directly**
2. **Always use the hook system for integrations**
3. **Don't hardcode database credentials**
4. **Always validate user input**
5. **Don't skip error handling**
6. **Don't ignore performance implications**
7. **Always test modules before deployment**

## Code Review Checklist

- [ ] Follows modular architecture
- [ ] Uses proper security measures
- [ ] Implements error handling
- [ ] Follows coding standards
- [ ] Includes proper documentation
- [ ] Optimized for performance
- [ ] Responsive design implemented
- [ ] Cross-browser compatibility
- [ ] Accessibility standards met

## Support and Documentation

### Required Documentation
- Module README files
- API documentation
- Database schema documentation
- Deployment guides
- User manuals

### Version Control
- Use Git for version control
- Create feature branches
- Write descriptive commit messages
- Tag releases properly

## Emergency Procedures

### Rollback Process
1. Restore from backup
2. Revert database changes
3. Disable problematic modules
4. Notify stakeholders

### Debug Mode
```php
// Enable debug mode in development
define('DEBUG_MODE', true);

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}
```

---

**Remember**: This is a modular system. Always think in terms of modules and themes when adding new functionality. Never modify the core system directly. Use the established patterns and follow the security guidelines strictly.

For questions or clarifications, refer to the architecture documentation or consult with the development team. 