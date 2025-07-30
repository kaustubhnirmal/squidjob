<?php
/**
 * Permission Model
 * SquidJob Tender Management System
 * 
 * Handles permission management for RBAC system
 */

namespace App\Models;

class Permission extends BaseModel {
    
    protected $table = 'permissions';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'name', 'display_name', 'description', 'module', 'category', 'is_active'
    ];
    
    protected $guarded = [
        'id', 'created_at', 'updated_at'
    ];
    
    protected $timestamps = true;
    
    /**
     * Get all active permissions
     */
    public function getActivePermissions() {
        return $this->whereAll('is_active', 1, 'module ASC, category ASC, name ASC');
    }
    
    /**
     * Get permissions by module
     */
    public function getPermissionsByModule($module) {
        try {
            $sql = "
                SELECT * FROM {$this->table} 
                WHERE module = ? AND is_active = 1 
                ORDER BY category ASC, name ASC
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$module]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get permissions grouped by module and category
     */
    public function getGroupedPermissions() {
        try {
            $sql = "
                SELECT * FROM {$this->table} 
                WHERE is_active = 1 
                ORDER BY module ASC, category ASC, name ASC
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            $permissions = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            $grouped = [];
            
            foreach ($permissions as $permission) {
                $module = $permission['module'];
                $category = $permission['category'];
                
                if (!isset($grouped[$module])) {
                    $grouped[$module] = [];
                }
                
                if (!isset($grouped[$module][$category])) {
                    $grouped[$module][$category] = [];
                }
                
                $grouped[$module][$category][] = $permission;
            }
            
            return $grouped;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Find permission by name
     */
    public function findByName($name) {
        return $this->where('name', $name);
    }
    
    /**
     * Get roles that have specific permission
     */
    public function getRolesWithPermission($permissionId) {
        try {
            $sql = "
                SELECT r.*, rp.assigned_at
                FROM roles r
                INNER JOIN role_permissions rp ON r.id = rp.role_id
                WHERE rp.permission_id = ? AND r.is_active = 1
                ORDER BY r.level ASC
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$permissionId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get users that have specific permission (through roles)
     */
    public function getUsersWithPermission($permissionId) {
        try {
            $sql = "
                SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, u.status
                FROM users u
                INNER JOIN user_roles ur ON u.id = ur.user_id
                INNER JOIN role_permissions rp ON ur.role_id = rp.role_id
                WHERE rp.permission_id = ? AND u.status = 'active'
                ORDER BY u.first_name, u.last_name
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$permissionId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Check if permission can be deleted
     */
    public function canDelete($permissionId) {
        try {
            // Check if permission is assigned to any role
            $sql = "SELECT COUNT(*) as count FROM role_permissions WHERE permission_id = ?";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$permissionId]);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            return (int)$result['count'] === 0;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Get permission statistics
     */
    public function getPermissionStats() {
        try {
            $sql = "
                SELECT 
                    COUNT(*) as total_permissions,
                    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_permissions,
                    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_permissions,
                    COUNT(DISTINCT module) as total_modules,
                    COUNT(DISTINCT category) as total_categories
                FROM {$this->table}
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [
                'total_permissions' => 0,
                'active_permissions' => 0,
                'inactive_permissions' => 0,
                'total_modules' => 0,
                'total_categories' => 0
            ];
        }
    }
    
    /**
     * Get modules list
     */
    public function getModules() {
        try {
            $sql = "SELECT DISTINCT module FROM {$this->table} WHERE is_active = 1 ORDER BY module ASC";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(\PDO::FETCH_COLUMN);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get categories for a module
     */
    public function getCategoriesByModule($module) {
        try {
            $sql = "
                SELECT DISTINCT category 
                FROM {$this->table} 
                WHERE module = ? AND is_active = 1 
                ORDER BY category ASC
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$module]);
            
            return $stmt->fetchAll(\PDO::FETCH_COLUMN);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Search permissions
     */
    public function searchPermissions($query) {
        return $this->search($query, ['name', 'display_name', 'description', 'module', 'category']);
    }
    
    /**
     * Bulk create permissions
     */
    public function bulkCreatePermissions($permissions) {
        try {
            $this->connection->beginTransaction();
            
            $created = [];
            foreach ($permissions as $permissionData) {
                $permission = $this->create($permissionData);
                if ($permission) {
                    $created[] = $permission;
                }
            }
            
            $this->connection->commit();
            return $created;
            
        } catch (\PDOException $e) {
            $this->connection->rollBack();
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Get default permissions for installation
     */
    public static function getDefaultPermissions() {
        return [
            // User Management
            [
                'name' => 'view_users',
                'display_name' => 'View Users',
                'description' => 'View user list and profiles',
                'module' => 'users',
                'category' => 'management',
                'is_active' => 1
            ],
            [
                'name' => 'create_user',
                'display_name' => 'Create User',
                'description' => 'Create new user accounts',
                'module' => 'users',
                'category' => 'management',
                'is_active' => 1
            ],
            [
                'name' => 'edit_user',
                'display_name' => 'Edit User',
                'description' => 'Edit user profiles and settings',
                'module' => 'users',
                'category' => 'management',
                'is_active' => 1
            ],
            [
                'name' => 'delete_user',
                'display_name' => 'Delete User',
                'description' => 'Delete user accounts',
                'module' => 'users',
                'category' => 'management',
                'is_active' => 1
            ],
            [
                'name' => 'manage_roles',
                'display_name' => 'Manage Roles',
                'description' => 'Assign and manage user roles',
                'module' => 'users',
                'category' => 'roles',
                'is_active' => 1
            ],
            
            // Tender Management
            [
                'name' => 'view_tenders',
                'display_name' => 'View Tenders',
                'description' => 'View tender listings and details',
                'module' => 'tenders',
                'category' => 'management',
                'is_active' => 1
            ],
            [
                'name' => 'create_tender',
                'display_name' => 'Create Tender',
                'description' => 'Create new tenders',
                'module' => 'tenders',
                'category' => 'management',
                'is_active' => 1
            ],
            [
                'name' => 'edit_tender',
                'display_name' => 'Edit Tender',
                'description' => 'Edit tender details and specifications',
                'module' => 'tenders',
                'category' => 'management',
                'is_active' => 1
            ],
            [
                'name' => 'delete_tender',
                'display_name' => 'Delete Tender',
                'description' => 'Delete tenders',
                'module' => 'tenders',
                'category' => 'management',
                'is_active' => 1
            ],
            [
                'name' => 'publish_tender',
                'display_name' => 'Publish Tender',
                'description' => 'Publish tenders for bidding',
                'module' => 'tenders',
                'category' => 'workflow',
                'is_active' => 1
            ],
            [
                'name' => 'assign_tender',
                'display_name' => 'Assign Tender',
                'description' => 'Assign tenders to team members',
                'module' => 'tenders',
                'category' => 'workflow',
                'is_active' => 1
            ],
            
            // Bidding System
            [
                'name' => 'view_bids',
                'display_name' => 'View Bids',
                'description' => 'View bid submissions and details',
                'module' => 'bidding',
                'category' => 'management',
                'is_active' => 1
            ],
            [
                'name' => 'submit_bid',
                'display_name' => 'Submit Bid',
                'description' => 'Submit bids for tenders',
                'module' => 'bidding',
                'category' => 'participation',
                'is_active' => 1
            ],
            [
                'name' => 'evaluate_bids',
                'display_name' => 'Evaluate Bids',
                'description' => 'Evaluate and score bid submissions',
                'module' => 'bidding',
                'category' => 'evaluation',
                'is_active' => 1
            ],
            [
                'name' => 'award_tender',
                'display_name' => 'Award Tender',
                'description' => 'Award tenders to winning bidders',
                'module' => 'bidding',
                'category' => 'workflow',
                'is_active' => 1
            ],
            
            // Document Management
            [
                'name' => 'view_documents',
                'display_name' => 'View Documents',
                'description' => 'View and download documents',
                'module' => 'documents',
                'category' => 'access',
                'is_active' => 1
            ],
            [
                'name' => 'upload_document',
                'display_name' => 'Upload Document',
                'description' => 'Upload documents and files',
                'module' => 'documents',
                'category' => 'management',
                'is_active' => 1
            ],
            [
                'name' => 'delete_document',
                'display_name' => 'Delete Document',
                'description' => 'Delete documents and files',
                'module' => 'documents',
                'category' => 'management',
                'is_active' => 1
            ],
            [
                'name' => 'manage_confidential',
                'display_name' => 'Manage Confidential Documents',
                'description' => 'Access and manage confidential documents',
                'module' => 'documents',
                'category' => 'security',
                'is_active' => 1
            ],
            
            // Financial Management
            [
                'name' => 'view_financials',
                'display_name' => 'View Financials',
                'description' => 'View financial reports and data',
                'module' => 'finance',
                'category' => 'reporting',
                'is_active' => 1
            ],
            [
                'name' => 'create_po',
                'display_name' => 'Create Purchase Order',
                'description' => 'Create purchase orders',
                'module' => 'finance',
                'category' => 'procurement',
                'is_active' => 1
            ],
            [
                'name' => 'approve_po',
                'display_name' => 'Approve Purchase Order',
                'description' => 'Approve purchase orders',
                'module' => 'finance',
                'category' => 'approval',
                'is_active' => 1
            ],
            [
                'name' => 'manage_budget',
                'display_name' => 'Manage Budget',
                'description' => 'Manage project budgets and allocations',
                'module' => 'finance',
                'category' => 'planning',
                'is_active' => 1
            ],
            
            // Reporting
            [
                'name' => 'view_reports',
                'display_name' => 'View Reports',
                'description' => 'View system reports and analytics',
                'module' => 'reports',
                'category' => 'access',
                'is_active' => 1
            ],
            [
                'name' => 'create_reports',
                'display_name' => 'Create Reports',
                'description' => 'Create custom reports',
                'module' => 'reports',
                'category' => 'management',
                'is_active' => 1
            ],
            [
                'name' => 'export_reports',
                'display_name' => 'Export Reports',
                'description' => 'Export reports in various formats',
                'module' => 'reports',
                'category' => 'export',
                'is_active' => 1
            ],
            
            // System Administration
            [
                'name' => 'system_config',
                'display_name' => 'System Configuration',
                'description' => 'Configure system settings',
                'module' => 'system',
                'category' => 'administration',
                'is_active' => 1
            ],
            [
                'name' => 'view_logs',
                'display_name' => 'View System Logs',
                'description' => 'View system and audit logs',
                'module' => 'system',
                'category' => 'monitoring',
                'is_active' => 1
            ],
            [
                'name' => 'backup_system',
                'display_name' => 'Backup System',
                'description' => 'Create and manage system backups',
                'module' => 'system',
                'category' => 'maintenance',
                'is_active' => 1
            ],
            [
                'name' => 'manage_permissions',
                'display_name' => 'Manage Permissions',
                'description' => 'Manage roles and permissions',
                'module' => 'system',
                'category' => 'security',
                'is_active' => 1
            ]
        ];
    }
    
    /**
     * Get permission matrix for role assignment
     */
    public function getPermissionMatrix() {
        $grouped = $this->getGroupedPermissions();
        $matrix = [];
        
        foreach ($grouped as $module => $categories) {
            $matrix[$module] = [
                'name' => ucfirst($module),
                'categories' => []
            ];
            
            foreach ($categories as $category => $permissions) {
                $matrix[$module]['categories'][$category] = [
                    'name' => ucwords(str_replace('_', ' ', $category)),
                    'permissions' => $permissions
                ];
            }
        }
        
        return $matrix;
    }
}