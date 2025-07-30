<?php
/**
 * Web Routes
 * SquidJob Tender Management System
 * 
 * Define web application routes
 */

// Home and Landing Pages
$router->get('/', function() {
    include APP_ROOT . '/public/landing.php';
});
$router->get('/landing', function() {
    include APP_ROOT . '/public/landing.php';
});
$router->get('/home', 'HomeController@index');
$router->get('/about', 'HomeController@about');
$router->get('/contact', 'HomeController@contact');

// Authentication Routes
$router->get('/login', 'AuthController@showLogin');
$router->post('/login', 'AuthController@processLogin');
$router->post('/auth/login', 'AuthController@processLogin');
$router->get('/register', 'AuthController@showRegister');
$router->post('/register', 'AuthController@processRegister');
$router->get('/logout', 'AuthController@logout');
$router->post('/logout', 'AuthController@logout');
$router->get('/forgot-password', 'AuthController@showForgotPassword');
$router->post('/forgot-password', 'AuthController@processForgotPassword');
$router->get('/reset-password/{token}', 'AuthController@showResetPassword');
$router->post('/reset-password', 'AuthController@resetPassword');

// Protected Routes (require authentication)
$router->group(['middleware' => ['auth']], function($router) {
    
    // Dashboard
    $router->get('/dashboard', 'DashboardController@index');
    
    // Profile Management
    $router->get('/profile', 'ProfileController@show');
    $router->post('/profile', 'ProfileController@update');
    $router->get('/change-password', 'ProfileController@showChangePassword');
    $router->post('/change-password', 'ProfileController@changePassword');
    
    // Tender Management
    $router->get('/tenders', 'TenderController@index');
    $router->get('/tenders/create', 'TenderController@create');
    $router->post('/tenders', 'TenderController@store');
    $router->get('/tenders/{id}', 'TenderController@show');
    $router->get('/tenders/{id}/edit', 'TenderController@edit');
    $router->post('/tenders/{id}', 'TenderController@update');
    $router->post('/tenders/{id}/delete', 'TenderController@delete');
    $router->get('/my-tenders', 'TenderController@myTenders');
    $router->get('/assigned-tenders', 'TenderController@assignedTenders');
    
    // Tender Assignment
    $router->get('/tenders/{id}/assign', 'TenderController@showAssign');
    $router->post('/tenders/{id}/assign', 'TenderController@assign');
    
    // Document Management
    $router->get('/documents', 'DocumentController@index');
    $router->get('/documents/briefcase', 'DocumentController@briefcase');
    $router->post('/documents/upload', 'DocumentController@upload');
    $router->get('/documents/{id}/download', 'DocumentController@download');
    $router->post('/documents/{id}/delete', 'DocumentController@delete');
    
    // Company Management
    $router->get('/companies', 'CompanyController@index');
    $router->get('/companies/create', 'CompanyController@create');
    $router->post('/companies', 'CompanyController@store');
    $router->get('/companies/{id}', 'CompanyController@show');
    $router->get('/companies/{id}/edit', 'CompanyController@edit');
    $router->post('/companies/{id}', 'CompanyController@update');
    $router->post('/companies/{id}/delete', 'CompanyController@delete');
    
    // Bid Management
    $router->get('/bids', 'BidController@index');
    $router->get('/tenders/{tenderId}/bid', 'BidController@create');
    $router->post('/bids', 'BidController@store');
    $router->get('/bids/{id}', 'BidController@show');
    $router->get('/bids/{id}/edit', 'BidController@edit');
    $router->post('/bids/{id}', 'BidController@update');
    $router->post('/bids/{id}/withdraw', 'BidController@withdraw');
    $router->get('/bids/{bidId}/documents/{documentId}/download', 'BidController@downloadDocument');
    $router->post('/bids/{bidId}/documents/{documentId}/delete', 'BidController@deleteDocument');
    
    // Tender Document Management
    $router->post('/tenders/{id}/documents/upload', 'TenderController@uploadDocument');
    $router->get('/tenders/{tenderId}/documents/{documentId}/download', 'TenderController@downloadDocument');
    $router->post('/tenders/{tenderId}/documents/{documentId}/delete', 'TenderController@deleteDocument');
    
    // Financial Management
    $router->get('/finance', 'FinanceController@index');
    $router->get('/finance/dashboard', 'FinanceController@dashboard');
    $router->get('/purchase-orders', 'PurchaseOrderController@index');
    $router->get('/purchase-orders/create', 'PurchaseOrderController@create');
    $router->post('/purchase-orders', 'PurchaseOrderController@store');
    $router->get('/purchase-orders/{id}', 'PurchaseOrderController@show');
    $router->post('/purchase-orders/{id}/approve', 'PurchaseOrderController@approve');
    
    // Reports and Analytics
    $router->get('/reports', 'ReportController@index');
    $router->get('/reports/tenders', 'ReportController@tenders');
    $router->get('/reports/financial', 'ReportController@financial');
    $router->get('/reports/analytics', 'ReportController@analytics');
    $router->get('/reports/export/{type}', 'ReportController@export');
    
    // Admin Routes (require admin role)
    $router->group(['middleware' => ['role:admin']], function($router) {
        
        // User Management
        $router->get('/admin/users', 'Admin\UserController@index');
        $router->get('/admin/users/create', 'Admin\UserController@create');
        $router->post('/admin/users', 'Admin\UserController@store');
        $router->get('/admin/users/{id}', 'Admin\UserController@show');
        $router->get('/admin/users/{id}/edit', 'Admin\UserController@edit');
        $router->post('/admin/users/{id}', 'Admin\UserController@update');
        $router->post('/admin/users/{id}/delete', 'Admin\UserController@delete');
        
        // Role Management
        $router->get('/admin/roles', 'Admin\RoleController@index');
        $router->get('/admin/roles/create', 'Admin\RoleController@create');
        $router->post('/admin/roles', 'Admin\RoleController@store');
        $router->get('/admin/roles/{id}/edit', 'Admin\RoleController@edit');
        $router->post('/admin/roles/{id}', 'Admin\RoleController@update');
        
        // System Settings
        $router->get('/admin/settings', 'Admin\SettingsController@index');
        $router->post('/admin/settings', 'Admin\SettingsController@update');
        
        // System Logs
        $router->get('/admin/logs', 'Admin\LogController@index');
        $router->get('/admin/logs/{file}', 'Admin\LogController@show');
        
        // Database Management
        $router->get('/admin/database', 'Admin\DatabaseController@index');
        $router->post('/admin/database/backup', 'Admin\DatabaseController@backup');
        $router->post('/admin/database/restore', 'Admin\DatabaseController@restore');
    });
    
    // Manager Routes (require manager role or above)
    $router->group(['middleware' => ['role:tender_manager,admin']], function($router) {
        
        // Team Management
        $router->get('/teams', 'TeamController@index');
        $router->get('/teams/create', 'TeamController@create');
        $router->post('/teams', 'TeamController@store');
        $router->get('/teams/{id}', 'TeamController@show');
        $router->get('/teams/{id}/edit', 'TeamController@edit');
        $router->post('/teams/{id}', 'TeamController@update');
        
        // Tender Approval
        $router->get('/approvals', 'ApprovalController@index');
        $router->post('/approvals/{id}/approve', 'ApprovalController@approve');
        $router->post('/approvals/{id}/reject', 'ApprovalController@reject');
    });
});

// Public API Routes (for mobile app or external integrations)
$router->group(['prefix' => 'public-api'], function($router) {
    $router->get('/tenders', 'PublicApiController@tenders');
    $router->get('/tenders/{id}', 'PublicApiController@tender');
    $router->get('/companies', 'PublicApiController@companies');
});

// File Serving Routes
$router->get('/uploads/{path}', 'FileController@serve');
$router->get('/assets/{path}', 'AssetController@serve');

// Error Pages
$router->get('/404', function() {
    http_response_code(404);
    view('errors.404');
});

$router->get('/403', function() {
    http_response_code(403);
    view('errors.403');
});

$router->get('/500', function() {
    http_response_code(500);
    view('errors.500');
});

// Health Check
$router->get('/health', function() {
    jsonResponse([
        'status' => 'ok',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0',
        'database' => testDbConnection() ? 'connected' : 'disconnected'
    ]);
});

// Test Route (only in development)
if (config('app.env') === 'development') {
    $router->get('/test', function() {
        phpinfo();
    });
    
    $router->get('/test-db', function() {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->query('SELECT VERSION() as version');
            $result = $stmt->fetch();
            
            jsonResponse([
                'status' => 'success',
                'message' => 'Database connection successful',
                'mysql_version' => $result['version']
            ]);
        } catch (Exception $e) {
            jsonResponse([
                'status' => 'error',
                'message' => 'Database connection failed',
                'error' => $e->getMessage()
            ], 500);
        }
    });
}