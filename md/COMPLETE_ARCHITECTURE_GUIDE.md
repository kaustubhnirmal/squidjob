# Complete Architecture Guide - SquidJob Tender Management System

## Complete Directory Structure

```
squidjob/
├── core/                              # Core application (never modify)
│   ├── config/
│   │   ├── database.php
│   │   ├── redis.php
│   │   ├── cloudflare.php
│   │   └── app.php
│   ├── classes/
│   │   ├── Database.php
│   │   ├── Cache.php
│   │   ├── CDN.php
│   │   ├── Auth.php
│   │   ├── User.php
│   │   ├── Tender.php
│   │   ├── Company.php
│   │   ├── Document.php
│   │   └── Notification.php
│   ├── includes/
│   │   ├── functions.php
│   │   ├── validation.php
│   │   ├── security.php
│   │   └── helpers.php
│   ├── api/
│   │   ├── base/
│   │   │   ├── ApiController.php
│   │   │   └── ApiResponse.php
│   │   └── v1/
│   │       ├── tenders.php
│   │       ├── companies.php
│   │       └── users.php
│   └── system/
│       ├── ModuleManager.php
│       ├── ThemeManager.php
│       ├── HookManager.php
│       └── EventDispatcher.php
├── modules/                           # Add-on modules
│   ├── .module-registry.json         # Module registry
│   ├── advanced-analytics/           # Advanced analytics module
│   │   ├── module.json
│   │   ├── install.php
│   │   ├── uninstall.php
│   │   ├── classes/
│   │   │   ├── AnalyticsManager.php
│   │   │   └── ReportGenerator.php
│   │   ├── views/
│   │   │   ├── dashboard.php
│   │   │   └── reports.php
│   │   ├── assets/
│   │   │   ├── css/
│   │   │   ├── js/
│   │   │   └── images/
│   │   ├── api/
│   │   │   └── analytics.php
│   │   └── database/
│   │       └── migrations/
│   ├── email-marketing/              # Email marketing module
│   │   ├── module.json
│   │   ├── install.php
│   │   ├── uninstall.php
│   │   ├── classes/
│   │   │   ├── EmailCampaign.php
│   │   │   └── TemplateManager.php
│   │   ├── views/
│   │   │   ├── campaigns.php
│   │   │   └── templates.php
│   │   ├── assets/
│   │   └── api/
│   ├── document-ai/                  # AI document processing
│   │   ├── module.json
│   │   ├── install.php
│   │   ├── uninstall.php
│   │   ├── classes/
│   │   │   ├── DocumentAI.php
│   │   │   └── TextExtractor.php
│   │   ├── views/
│   │   ├── assets/
│   │   └── api/
│   ├── multi-language/               # Multi-language support
│   │   ├── module.json
│   │   ├── install.php
│   │   ├── uninstall.php
│   │   ├── classes/
│   │   │   ├── LanguageManager.php
│   │   │   └── TranslationService.php
│   │   ├── languages/
│   │   │   ├── en/
│   │   │   ├── es/
│   │   │   └── fr/
│   │   ├── views/
│   │   └── assets/
│   ├── payment-gateway/              # Payment processing
│   │   ├── module.json
│   │   ├── install.php
│   │   ├── uninstall.php
│   │   ├── classes/
│   │   │   ├── PaymentProcessor.php
│   │   │   └── StripeGateway.php
│   │   ├── views/
│   │   ├── assets/
│   │   └── api/
│   └── workflow-automation/          # Workflow automation
│       ├── module.json
│       ├── install.php
│       ├── uninstall.php
│       ├── classes/
│       │   ├── WorkflowEngine.php
│       │   └── AutomationRules.php
│       ├── views/
│       ├── assets/
│       └── api/
├── themes/                           # Theme customization
│   ├── .theme-registry.json         # Theme registry
│   ├── default/                     # Default theme
│   │   ├── theme.json
│   │   ├── index.php               # Main layout
│   │   ├── header.php
│   │   ├── footer.php
│   │   ├── sidebar.php
│   │   ├── assets/
│   │   │   ├── css/
│   │   │   │   ├── main.css
│   │   │   │   ├── components.css
│   │   │   │   └── responsive.css
│   │   │   ├── js/
│   │   │   │   ├── main.js
│   │   │   │   └── components.js
│   │   │   ├── images/
│   │   │   │   ├── logo.svg
│   │   │   │   ├── hero-octopus.webp
│   │   │   │   └── icons/
│   │   │   └── fonts/
│   │   │       └── inter/
│   │   ├── views/
│   │   │   ├── landing/
│   │   │   │   ├── hero.php
│   │   │   │   ├── features.php
│   │   │   │   ├── statistics.php
│   │   │   │   └── cta.php
│   │   │   ├── dashboard/
│   │   │   │   ├── sidebar.php
│   │   │   │   ├── header.php
│   │   │   │   └── widgets/
│   │   │   └── components/
│   │   │       ├── buttons.php
│   │   │       ├── cards.php
│   │   │       ├── forms.php
│   │   │       └── modals.php
│   │   └── config/
│   │       ├── colors.php
│   │       ├── typography.php
│   │       └── layout.php
│   ├── modern-dark/                 # Dark theme variant
│   │   ├── theme.json
│   │   ├── index.php
│   │   ├── assets/
│   │   │   ├── css/
│   │   │   │   ├── main.css
│   │   │   │   └── dark-mode.css
│   │   │   ├── js/
│   │   │   └── images/
│   │   ├── views/
│   │   └── config/
│   ├── corporate-blue/              # Corporate theme
│   │   ├── theme.json
│   │   ├── index.php
│   │   ├── assets/
│   │   │   ├── css/
│   │   │   │   ├── main.css
│   │   │   │   └── corporate.css
│   │   │   ├── js/
│   │   │   └── images/
│   │   ├── views/
│   │   └── config/
│   └── custom/                      # Custom theme template
│       ├── theme.json
│       ├── index.php
│       ├── assets/
│       ├── views/
│       └── config/
├── public/                          # Document root (Apache)
│   ├── index.php                   # Entry point
│   ├── assets/
│   │   ├── modules/                # Module assets (symlinked)
│   │   ├── themes/                 # Theme assets (symlinked)
│   │   └── core/                   # Core assets
│   ├── uploads/
│   │   ├── tenders/
│   │   ├── bids/
│   │   └── documents/
│   ├── cache/                      # Generated cache files
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── service-worker.js
├── storage/                         # Application storage
│   ├── cache/
│   ├── logs/
│   ├── sessions/
│   └── temp/
├── composer.json
├── package.json
├── tailwind.config.js
├── .htaccess
└── README.md
```

## Core System Classes

### Database Connection Class
```php
<?php
// core/classes/Database.php
class Database {
    private $host = 'localhost';
    private $db_name = 'squidjob';
    private $username = 'squidj0b';
    private $password = 'A1b2c3d4';
    private $conn;
    
    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            echo "Connection Error: " . $e->getMessage();
        }
        return $this->conn;
    }
}
?>
```

### Module Manager Class
```php
<?php
// core/system/ModuleManager.php
class ModuleManager {
    private $registryFile;
    private $modules = [];
    private $activeModules = [];
    
    public function __construct() {
        $this->registryFile = MODULES_PATH . '/.module-registry.json';
        $this->loadRegistry();
    }
    
    public function loadRegistry() {
        if (file_exists($this->registryFile)) {
            $registry = json_decode(file_get_contents($this->registryFile), true);
            $this->modules = $registry['modules'] ?? [];
            $this->activeModules = array_filter($this->modules, function($module) {
                return $module['status'] === 'active';
            });
        }
    }
    
    public function getActiveModules() {
        return $this->activeModules;
    }
    
    public function loadModule($moduleName) {
        if (!isset($this->activeModules[$moduleName])) {
            return false;
        }
        
        $modulePath = MODULES_PATH . '/' . $moduleName;
        $moduleClass = $this->getModuleClass($moduleName);
        
        if (file_exists($modulePath . '/classes/' . $moduleClass . '.php')) {
            require_once $modulePath . '/classes/' . $moduleClass . '.php';
            return new $moduleClass();
        }
        
        return false;
    }
    
    public function executeHook($hookName, $data = []) {
        $results = [];
        
        foreach ($this->activeModules as $moduleName => $module) {
            if (in_array($hookName, $module['hooks'])) {
                $moduleInstance = $this->loadModule($moduleName);
                if ($moduleInstance && method_exists($moduleInstance, 'executeHook')) {
                    $results[$moduleName] = $moduleInstance->executeHook($hookName, $data);
                }
            }
        }
        
        return $results;
    }
    
    public function installModule($moduleName) {
        $modulePath = MODULES_PATH . '/' . $moduleName;
        
        if (!file_exists($modulePath . '/install.php')) {
            throw new Exception("Install script not found for module: $moduleName");
        }
        
        // Run installation script
        include $modulePath . '/install.php';
        
        // Update registry
        $this->updateModuleStatus($moduleName, 'active');
        
        return true;
    }
    
    public function uninstallModule($moduleName) {
        $modulePath = MODULES_PATH . '/' . $moduleName;
        
        if (file_exists($modulePath . '/uninstall.php')) {
            include $modulePath . '/uninstall.php';
        }
        
        // Update registry
        $this->updateModuleStatus($moduleName, 'inactive');
        
        return true;
    }
    
    private function updateModuleStatus($moduleName, $status) {
        if (isset($this->modules[$moduleName])) {
            $this->modules[$moduleName]['status'] = $status;
            file_put_contents($this->registryFile, json_encode(['modules' => $this->modules], JSON_PRETTY_PRINT));
        }
    }
}
?>
```

### Theme Manager Class
```php
<?php
// core/system/ThemeManager.php
class ThemeManager {
    private $registryFile;
    private $themes = [];
    private $activeTheme;
    
    public function __construct() {
        $this->registryFile = THEMES_PATH . '/.theme-registry.json';
        $this->loadRegistry();
    }
    
    public function loadRegistry() {
        if (file_exists($this->registryFile)) {
            $registry = json_decode(file_get_contents($this->registryFile), true);
            $this->themes = $registry['themes'] ?? [];
            $this->activeTheme = $registry['active_theme'] ?? 'default';
        }
    }
    
    public function getActiveTheme() {
        return $this->activeTheme;
    }
    
    public function getThemeConfig($themeName = null) {
        $themeName = $themeName ?: $this->activeTheme;
        return $this->themes[$themeName] ?? null;
    }
    
    public function render($view, $data = []) {
        $themePath = THEMES_PATH . '/' . $this->activeTheme;
        $viewFile = $themePath . '/views/' . $view . '.php';
        
        if (file_exists($viewFile)) {
            extract($data);
            include $viewFile;
        } else {
            throw new Exception("View not found: $view");
        }
    }
    
    public function getAssetUrl($path) {
        $themePath = THEMES_PATH . '/' . $this->activeTheme;
        $assetFile = $themePath . '/assets/' . $path;
        
        if (file_exists($assetFile)) {
            return '/assets/themes/' . $this->activeTheme . '/' . $path;
        }
        
        return null;
    }
    
    public function activateTheme($themeName) {
        if (!isset($this->themes[$themeName])) {
            throw new Exception("Theme not found: $themeName");
        }
        
        $this->activeTheme = $themeName;
        $this->updateRegistry();
        
        return true;
    }
    
    private function updateRegistry() {
        $registry = [
            'themes' => $this->themes,
            'active_theme' => $this->activeTheme
        ];
        
        file_put_contents($this->registryFile, json_encode($registry, JSON_PRETTY_PRINT));
    }
}
?>
```

### Hook Manager Class
```php
<?php
// core/system/HookManager.php
class HookManager {
    private static $instance = null;
    private $hooks = [];
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function register($hookName, $class, $method) {
        if (!isset($this->hooks[$hookName])) {
            $this->hooks[$hookName] = [];
        }
        
        $this->hooks[$hookName][] = [
            'class' => $class,
            'method' => $method
        ];
    }
    
    public function execute($hookName, $data = []) {
        $results = [];
        
        if (isset($this->hooks[$hookName])) {
            foreach ($this->hooks[$hookName] as $hook) {
                $class = $hook['class'];
                $method = $hook['method'];
                
                if (class_exists($class)) {
                    $instance = new $class();
                    if (method_exists($instance, $method)) {
                        $results[] = $instance->$method($data);
                    }
                }
            }
        }
        
        return $results;
    }
}
?>
```

## Database Schema

### Core Tables
```sql
-- Users and Authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Companies/Organizations
CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenders
CREATE TABLE tenders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reference_number VARCHAR(100),
    tender_type ENUM('open', 'restricted', 'negotiated') DEFAULT 'open',
    status ENUM('draft', 'published', 'evaluation', 'awarded', 'closed') DEFAULT 'draft',
    budget DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    submission_deadline DATETIME,
    evaluation_deadline DATETIME,
    created_by INT,
    assigned_team_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_team_id) REFERENCES teams(id)
);

-- Teams
CREATE TABLE teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team Members
CREATE TABLE team_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team_id INT,
    user_id INT,
    role VARCHAR(50),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Bidders/Participants
CREATE TABLE bidders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tender_id INT,
    company_id INT,
    status ENUM('registered', 'submitted', 'evaluated', 'awarded', 'rejected') DEFAULT 'registered',
    bid_amount DECIMAL(15,2),
    submitted_at TIMESTAMP,
    evaluated_at TIMESTAMP,
    FOREIGN KEY (tender_id) REFERENCES tenders(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Documents
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tender_id INT,
    bidder_id INT NULL,
    document_type ENUM('tender_doc', 'bid_doc', 'evaluation_doc', 'award_doc'),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tender_id) REFERENCES tenders(id),
    FOREIGN KEY (bidder_id) REFERENCES bidders(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Evaluations
CREATE TABLE evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tender_id INT,
    bidder_id INT,
    evaluator_id INT,
    technical_score DECIMAL(5,2),
    financial_score DECIMAL(5,2),
    total_score DECIMAL(5,2),
    comments TEXT,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tender_id) REFERENCES tenders(id),
    FOREIGN KEY (bidder_id) REFERENCES bidders(id),
    FOREIGN KEY (evaluator_id) REFERENCES users(id)
);

-- Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Configuration Files

### Apache Configuration (.htaccess)
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# URL rewriting
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./app/views/**/*.php",
    "./public/**/*.html",
    "./public/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#faf5ff',
          600: '#9333ea',
          700: '#7c3aed',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

## CDN Integration

### Cloudflare Configuration
```php
// core/config/cloudflare.php
return [
    'zone_id' => 'your_zone_id',
    'api_token' => 'your_api_token',
    'domain' => 'your-domain.com',
    'cache_settings' => [
        'css' => '1 year',
        'js' => '1 year',
        'images' => '1 year',
        'fonts' => '1 year',
    ]
];
```

### CDN Helper Class
```php
<?php
// core/classes/CDN.php
class CDN {
    private $config;
    
    public function __construct() {
        $this->config = require 'config/cloudflare.php';
    }
    
    public function getAssetUrl($path) {
        $cdnDomain = $this->config['domain'];
        return "https://{$cdnDomain}/{$path}";
    }
    
    public function purgeCache($urls) {
        // Implement Cloudflare API call to purge cache
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.cloudflare.com/client/v4/zones/{$this->config['zone_id']}/purge_cache");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['files' => $urls]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->config['api_token'],
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
}
?>
```

This complete architecture guide provides all the necessary information for implementing the modular SquidJob tender management system with proper separation of concerns, theme system, and CDN integration. 