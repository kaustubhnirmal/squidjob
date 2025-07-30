<?php
/**
 * Tenders API Endpoint
 * SquidJob Tender Management System
 * 
 * RESTful API for tender operations
 */

// Prevent direct access
if (!defined('APP_ROOT')) {
    define('APP_ROOT', dirname(dirname(__DIR__)));
}

// Include bootstrap
require_once APP_ROOT . '/app/helpers/functions.php';
require_once APP_ROOT . '/config/database.php';
require_once APP_ROOT . '/app/core/AuthMiddleware.php';

// Initialize authentication middleware
use App\Core\AuthMiddleware;
$authMiddleware = AuthMiddleware::getInstance();
$authMiddleware->init();

// Include API controller
require_once APP_ROOT . '/plugins/TenderManager/classes/TenderApiController.php';

// Set content type
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Initialize API controller
    $controller = new TenderApiController();
    
    // Get request method and path
    $method = $_SERVER['REQUEST_METHOD'];
    $path = $_SERVER['PATH_INFO'] ?? '';
    $pathParts = array_filter(explode('/', $path));
    
    // Route the request
    switch ($method) {
        case 'GET':
            if (empty($pathParts)) {
                // GET /api/v1/tenders - List all tenders
                $controller->index();
            } elseif (count($pathParts) === 1 && is_numeric($pathParts[0])) {
                // GET /api/v1/tenders/{id} - Get specific tender
                $controller->show($pathParts[0]);
            } elseif (count($pathParts) === 2 && is_numeric($pathParts[0]) && $pathParts[1] === 'bids') {
                // GET /api/v1/tenders/{id}/bids - Get tender bids
                require_once APP_ROOT . '/plugins/TenderManager/classes/BidApiController.php';
                $bidController = new BidApiController();
                $bidController->index($pathParts[0]);
            } else {
                throw new Exception('Invalid API endpoint', 404);
            }
            break;
            
        case 'POST':
            if (empty($pathParts)) {
                // POST /api/v1/tenders - Create new tender
                $controller->store();
            } elseif (count($pathParts) === 2 && is_numeric($pathParts[0])) {
                if ($pathParts[1] === 'publish') {
                    // POST /api/v1/tenders/{id}/publish - Publish tender
                    $controller->publish($pathParts[0]);
                } elseif ($pathParts[1] === 'bids') {
                    // POST /api/v1/tenders/{id}/bids - Submit bid
                    require_once APP_ROOT . '/plugins/TenderManager/classes/BidApiController.php';
                    $bidController = new BidApiController();
                    $bidController->store($pathParts[0]);
                } else {
                    throw new Exception('Invalid API endpoint', 404);
                }
            } else {
                throw new Exception('Invalid API endpoint', 404);
            }
            break;
            
        case 'PUT':
            if (count($pathParts) === 1 && is_numeric($pathParts[0])) {
                // PUT /api/v1/tenders/{id} - Update tender
                $controller->update($pathParts[0]);
            } else {
                throw new Exception('Invalid API endpoint', 404);
            }
            break;
            
        case 'DELETE':
            if (count($pathParts) === 1 && is_numeric($pathParts[0])) {
                // DELETE /api/v1/tenders/{id} - Delete tender
                $controller->destroy($pathParts[0]);
            } else {
                throw new Exception('Invalid API endpoint', 404);
            }
            break;
            
        default:
            throw new Exception('Method not allowed', 405);
    }
    
} catch (Exception $e) {
    // Handle errors
    $statusCode = $e->getCode() ?: 500;
    $statusCode = ($statusCode >= 100 && $statusCode < 600) ? $statusCode : 500;
    
    http_response_code($statusCode);
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_code' => $statusCode,
        'meta' => [
            'timestamp' => date('c'),
            'version' => '1.0',
            'endpoint' => $_SERVER['REQUEST_URI'] ?? ''
        ]
    ]);
}