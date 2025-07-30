<?php
/**
 * Router Class
 * SquidJob Tender Management System
 * 
 * Handles HTTP routing and request dispatching
 */

namespace App\Core;

class Router {
    private $routes = [];
    private $middlewares = [];
    private $currentMiddleware = [];
    
    /**
     * Add GET route
     */
    public function get($uri, $action) {
        return $this->addRoute('GET', $uri, $action);
    }
    
    /**
     * Add POST route
     */
    public function post($uri, $action) {
        return $this->addRoute('POST', $uri, $action);
    }
    
    /**
     * Add PUT route
     */
    public function put($uri, $action) {
        return $this->addRoute('PUT', $uri, $action);
    }
    
    /**
     * Add DELETE route
     */
    public function delete($uri, $action) {
        return $this->addRoute('DELETE', $uri, $action);
    }
    
    /**
     * Add route with any method
     */
    public function any($uri, $action) {
        $methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
        foreach ($methods as $method) {
            $this->addRoute($method, $uri, $action);
        }
        return $this;
    }
    
    /**
     * Add middleware to routes
     */
    public function middleware($middleware) {
        if (is_string($middleware)) {
            $middleware = [$middleware];
        }
        $this->currentMiddleware = array_merge($this->currentMiddleware, $middleware);
        return $this;
    }
    
    /**
     * Group routes with common attributes
     */
    public function group($attributes, $callback) {
        $previousMiddleware = $this->currentMiddleware;
        $prefix = $attributes['prefix'] ?? '';
        
        if (isset($attributes['middleware'])) {
            $this->currentMiddleware = array_merge(
                $this->currentMiddleware,
                is_array($attributes['middleware']) ? $attributes['middleware'] : [$attributes['middleware']]
            );
        }
        
        // Store current prefix
        $previousPrefix = $this->currentPrefix ?? '';
        $this->currentPrefix = $previousPrefix . $prefix;
        
        // Execute callback
        $callback($this);
        
        // Restore previous state
        $this->currentMiddleware = $previousMiddleware;
        $this->currentPrefix = $previousPrefix;
    }
    
    /**
     * Add route to collection
     */
    private function addRoute($method, $uri, $action) {
        // Add prefix if in group
        if (isset($this->currentPrefix)) {
            $uri = $this->currentPrefix . $uri;
        }
        
        // Normalize URI
        $uri = '/' . trim($uri, '/');
        if ($uri !== '/') {
            $uri = rtrim($uri, '/');
        }
        
        $this->routes[$method][$uri] = [
            'action' => $action,
            'middleware' => $this->currentMiddleware
        ];
        
        return $this;
    }
    
    /**
     * Dispatch request to appropriate handler
     */
    public function dispatch($method, $uri) {
        // Normalize URI
        $uri = '/' . trim($uri, '/');
        if ($uri !== '/') {
            $uri = rtrim($uri, '/');
        }
        
        // Check for exact match first
        if (isset($this->routes[$method][$uri])) {
            return $this->handleRoute($this->routes[$method][$uri], []);
        }
        
        // Check for parameter routes
        foreach ($this->routes[$method] ?? [] as $route => $handler) {
            $pattern = $this->convertToRegex($route);
            if (preg_match($pattern, $uri, $matches)) {
                array_shift($matches); // Remove full match
                return $this->handleRoute($handler, $matches);
            }
        }
        
        // No route found
        $this->handleNotFound();
    }
    
    /**
     * Handle matched route
     */
    private function handleRoute($route, $parameters) {
        // Execute middleware
        foreach ($route['middleware'] as $middleware) {
            if (!$this->executeMiddleware($middleware)) {
                return; // Middleware blocked request
            }
        }
        
        // Execute action
        $action = $route['action'];
        
        if (is_callable($action)) {
            // Closure
            call_user_func_array($action, $parameters);
        } elseif (is_string($action)) {
            // Controller@method format
            $this->callControllerAction($action, $parameters);
        } elseif (is_array($action)) {
            // [Controller::class, 'method'] format
            $this->callControllerMethod($action[0], $action[1], $parameters);
        }
    }
    
    /**
     * Execute middleware
     */
    private function executeMiddleware($middleware) {
        if (is_string($middleware)) {
            $middlewareClass = "App\\Middleware\\{$middleware}";
            if (class_exists($middlewareClass)) {
                $instance = new $middlewareClass();
                return $instance->handle();
            }
        } elseif (is_callable($middleware)) {
            return $middleware();
        }
        
        return true; // Allow by default
    }
    
    /**
     * Call controller action from string
     */
    private function callControllerAction($action, $parameters) {
        list($controller, $method) = explode('@', $action);
        $this->callControllerMethod($controller, $method, $parameters);
    }
    
    /**
     * Call controller method
     */
    private function callControllerMethod($controller, $method, $parameters) {
        // Add namespace if not present
        if (strpos($controller, '\\') === false) {
            $controller = "App\\Controllers\\{$controller}";
        }
        
        if (class_exists($controller)) {
            $instance = new $controller();
            if (method_exists($instance, $method)) {
                call_user_func_array([$instance, $method], $parameters);
            } else {
                $this->handleError("Method {$method} not found in {$controller}");
            }
        } else {
            $this->handleError("Controller {$controller} not found");
        }
    }
    
    /**
     * Convert route to regex pattern
     */
    private function convertToRegex($route) {
        // Convert {param} to regex groups
        $pattern = preg_replace('/\{([^}]+)\}/', '([^/]+)', $route);
        return '#^' . $pattern . '$#';
    }
    
    /**
     * Handle 404 Not Found
     */
    private function handleNotFound() {
        http_response_code(404);
        
        // Check if it's an API request
        if (strpos($_SERVER['REQUEST_URI'], '/api/') === 0) {
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Route not found', 'code' => 404]);
        } else {
            // Load 404 view
            if (file_exists(APP_ROOT . '/app/views/errors/404.php')) {
                include APP_ROOT . '/app/views/errors/404.php';
            } else {
                echo '<h1>404 - Page Not Found</h1>';
            }
        }
    }
    
    /**
     * Handle routing errors
     */
    private function handleError($message) {
        error_log("Router Error: {$message}");
        http_response_code(500);
        
        if (config('app.debug')) {
            echo "<h1>Router Error</h1><p>{$message}</p>";
        } else {
            echo '<h1>500 - Internal Server Error</h1>';
        }
    }
    
    /**
     * Get all registered routes
     */
    public function getRoutes() {
        return $this->routes;
    }
}