<?php
/**
 * API Routes
 * SquidJob Tender Management System
 * 
 * Define REST API endpoints for mobile app and external integrations
 */

// API Routes Group
$router->group(['prefix' => 'api/v1'], function($router) {
    
    // Authentication API
    $router->post('/auth/login', 'Api\AuthController@login');
    $router->post('/auth/register', 'Api\AuthController@register');
    $router->post('/auth/forgot-password', 'Api\AuthController@forgotPassword');
    $router->post('/auth/reset-password', 'Api\AuthController@resetPassword');
    $router->post('/auth/verify-email', 'Api\AuthController@verifyEmail');
    
    // Protected API Routes
    $router->group(['middleware' => ['api-auth']], function($router) {
        
        // Authentication
        $router->post('/auth/logout', 'Api\AuthController@logout');
        $router->get('/auth/me', 'Api\AuthController@me');
        $router->post('/auth/refresh', 'Api\AuthController@refresh');
        $router->post('/auth/change-password', 'Api\AuthController@changePassword');
        
        // User Management API
        $router->get('/users', 'Api\UserController@index');
        $router->post('/users', 'Api\UserController@store');
        $router->get('/users/{id}', 'Api\UserController@show');
        $router->put('/users/{id}', 'Api\UserController@update');
        $router->delete('/users/{id}', 'Api\UserController@destroy');
        $router->get('/users/{id}/permissions', 'Api\UserController@permissions');
        $router->post('/users/{id}/assign-role', 'Api\UserController@assignRole');
        
        // Profile API
        $router->get('/profile', 'Api\ProfileController@show');
        $router->put('/profile', 'Api\ProfileController@update');
        $router->post('/profile/avatar', 'Api\ProfileController@uploadAvatar');
        
        // Tender Management API
        $router->get('/tenders', 'Api\TenderController@index');
        $router->post('/tenders', 'Api\TenderController@store');
        $router->get('/tenders/{id}', 'Api\TenderController@show');
        $router->put('/tenders/{id}', 'Api\TenderController@update');
        $router->delete('/tenders/{id}', 'Api\TenderController@destroy');
        $router->get('/tenders/{id}/documents', 'Api\TenderController@documents');
        $router->post('/tenders/{id}/documents', 'Api\TenderController@uploadDocument');
        $router->get('/my-tenders', 'Api\TenderController@myTenders');
        $router->get('/assigned-tenders', 'Api\TenderController@assignedTenders');
        
        // Tender Assignment API
        $router->post('/tenders/{id}/assign', 'Api\TenderController@assign');
        $router->delete('/tenders/{id}/unassign/{userId}', 'Api\TenderController@unassign');
        $router->get('/tenders/{id}/assignments', 'Api\TenderController@assignments');
        
        // Tender Status API
        $router->post('/tenders/{id}/status', 'Api\TenderController@updateStatus');
        $router->get('/tender-statuses', 'Api\TenderController@statuses');
        
        // Company Management API
        $router->get('/companies', 'Api\CompanyController@index');
        $router->post('/companies', 'Api\CompanyController@store');
        $router->get('/companies/{id}', 'Api\CompanyController@show');
        $router->put('/companies/{id}', 'Api\CompanyController@update');
        $router->delete('/companies/{id}', 'Api\CompanyController@destroy');
        $router->get('/companies/{id}/contacts', 'Api\CompanyController@contacts');
        $router->post('/companies/{id}/contacts', 'Api\CompanyController@addContact');
        
        // Bid Management API
        $router->get('/bids', 'Api\BidController@index');
        $router->post('/bids', 'Api\BidController@store');
        $router->get('/bids/{id}', 'Api\BidController@show');
        $router->put('/bids/{id}', 'Api\BidController@update');
        $router->delete('/bids/{id}', 'Api\BidController@destroy');
        $router->get('/bids/{id}/documents', 'Api\BidController@documents');
        $router->post('/bids/{id}/documents', 'Api\BidController@uploadDocument');
        $router->post('/bids/{id}/submit', 'Api\BidController@submit');
        
        // Document Management API
        $router->get('/documents', 'Api\DocumentController@index');
        $router->post('/documents/upload', 'Api\DocumentController@upload');
        $router->get('/documents/{id}', 'Api\DocumentController@show');
        $router->get('/documents/{id}/download', 'Api\DocumentController@download');
        $router->delete('/documents/{id}', 'Api\DocumentController@destroy');
        $router->post('/documents/{id}/compress', 'Api\DocumentController@compress');
        $router->get('/documents/briefcase', 'Api\DocumentController@briefcase');
        $router->post('/documents/briefcase', 'Api\DocumentController@createBriefcase');
        
        // Financial Management API
        $router->get('/purchase-orders', 'Api\PurchaseOrderController@index');
        $router->post('/purchase-orders', 'Api\PurchaseOrderController@store');
        $router->get('/purchase-orders/{id}', 'Api\PurchaseOrderController@show');
        $router->put('/purchase-orders/{id}', 'Api\PurchaseOrderController@update');
        $router->post('/purchase-orders/{id}/approve', 'Api\PurchaseOrderController@approve');
        $router->post('/purchase-orders/{id}/reject', 'Api\PurchaseOrderController@reject');
        
        // EMD Management API
        $router->get('/emd-deposits', 'Api\EmdController@index');
        $router->post('/emd-deposits', 'Api\EmdController@store');
        $router->get('/emd-deposits/{id}', 'Api\EmdController@show');
        $router->put('/emd-deposits/{id}', 'Api\EmdController@update');
        
        // Team Management API
        $router->get('/teams', 'Api\TeamController@index');
        $router->post('/teams', 'Api\TeamController@store');
        $router->get('/teams/{id}', 'Api\TeamController@show');
        $router->put('/teams/{id}', 'Api\TeamController@update');
        $router->delete('/teams/{id}', 'Api\TeamController@destroy');
        $router->get('/teams/{id}/members', 'Api\TeamController@members');
        $router->post('/teams/{id}/members', 'Api\TeamController@addMember');
        $router->delete('/teams/{id}/members/{userId}', 'Api\TeamController@removeMember');
        
        // Notification API
        $router->get('/notifications', 'Api\NotificationController@index');
        $router->get('/notifications/unread', 'Api\NotificationController@unread');
        $router->post('/notifications/{id}/read', 'Api\NotificationController@markAsRead');
        $router->post('/notifications/read-all', 'Api\NotificationController@markAllAsRead');
        $router->delete('/notifications/{id}', 'Api\NotificationController@destroy');
        
        // Dashboard API
        $router->get('/dashboard/stats', 'Api\DashboardController@stats');
        $router->get('/dashboard/recent-activities', 'Api\DashboardController@recentActivities');
        $router->get('/dashboard/upcoming-deadlines', 'Api\DashboardController@upcomingDeadlines');
        $router->get('/dashboard/charts', 'Api\DashboardController@charts');
        
        // Reports API
        $router->get('/reports/tenders', 'Api\ReportController@tenders');
        $router->get('/reports/financial', 'Api\ReportController@financial');
        $router->get('/reports/analytics', 'Api\ReportController@analytics');
        $router->post('/reports/export', 'Api\ReportController@export');
        $router->get('/reports/download/{file}', 'Api\ReportController@download');
        
        // Search API
        $router->get('/search', 'Api\SearchController@index');
        $router->get('/search/tenders', 'Api\SearchController@tenders');
        $router->get('/search/companies', 'Api\SearchController@companies');
        $router->get('/search/documents', 'Api\SearchController@documents');
        
        // Settings API
        $router->get('/settings', 'Api\SettingsController@index');
        $router->put('/settings', 'Api\SettingsController@update');
        $router->get('/settings/permissions', 'Api\SettingsController@permissions');
        
        // Admin API Routes
        $router->group(['middleware' => ['role:admin']], function($router) {
            
            // System Management
            $router->get('/admin/system-info', 'Api\Admin\SystemController@info');
            $router->get('/admin/logs', 'Api\Admin\SystemController@logs');
            $router->post('/admin/cache/clear', 'Api\Admin\SystemController@clearCache');
            $router->post('/admin/backup', 'Api\Admin\SystemController@backup');
            
            // Role Management
            $router->get('/admin/roles', 'Api\Admin\RoleController@index');
            $router->post('/admin/roles', 'Api\Admin\RoleController@store');
            $router->get('/admin/roles/{id}', 'Api\Admin\RoleController@show');
            $router->put('/admin/roles/{id}', 'Api\Admin\RoleController@update');
            $router->delete('/admin/roles/{id}', 'Api\Admin\RoleController@destroy');
            
            // Permission Management
            $router->get('/admin/permissions', 'Api\Admin\PermissionController@index');
            $router->post('/admin/permissions', 'Api\Admin\PermissionController@store');
            $router->put('/admin/permissions/{id}', 'Api\Admin\PermissionController@update');
            $router->delete('/admin/permissions/{id}', 'Api\Admin\PermissionController@destroy');
            
            // User Management (Admin)
            $router->get('/admin/users', 'Api\Admin\UserController@index');
            $router->post('/admin/users/{id}/activate', 'Api\Admin\UserController@activate');
            $router->post('/admin/users/{id}/deactivate', 'Api\Admin\UserController@deactivate');
            $router->post('/admin/users/{id}/reset-password', 'Api\Admin\UserController@resetPassword');
            
            // Audit Logs
            $router->get('/admin/audit-logs', 'Api\Admin\AuditController@index');
            $router->get('/admin/audit-logs/{id}', 'Api\Admin\AuditController@show');
        });
        
        // File Upload API
        $router->post('/upload', 'Api\FileController@upload');
        $router->post('/upload/multiple', 'Api\FileController@uploadMultiple');
        $router->get('/files/{id}', 'Api\FileController@show');
        $router->delete('/files/{id}', 'Api\FileController@destroy');
        
        // Import/Export API
        $router->post('/import/tenders', 'Api\ImportController@tenders');
        $router->post('/import/companies', 'Api\ImportController@companies');
        $router->get('/export/tenders', 'Api\ExportController@tenders');
        $router->get('/export/companies', 'Api\ExportController@companies');
        $router->get('/export/reports', 'Api\ExportController@reports');
    });
    
    // Public API Routes (no authentication required)
    $router->group(['prefix' => 'public'], function($router) {
        $router->get('/tenders', 'Api\PublicController@tenders');
        $router->get('/tenders/{id}', 'Api\PublicController@tender');
        $router->get('/companies', 'Api\PublicController@companies');
        $router->get('/statistics', 'Api\PublicController@statistics');
    });
});

// API Documentation Route
$router->get('/api/docs', function() {
    view('api.documentation');
});

// API Health Check
$router->get('/api/health', function() {
    jsonResponse([
        'status' => 'healthy',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0',
        'environment' => config('app.env'),
        'database' => testDbConnection() ? 'connected' : 'disconnected',
        'memory_usage' => memory_get_usage(true),
        'peak_memory' => memory_get_peak_usage(true)
    ]);
});

// API Rate Limit Test
$router->get('/api/test/rate-limit', function() {
    jsonResponse([
        'message' => 'Rate limit test endpoint',
        'timestamp' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ]);
});