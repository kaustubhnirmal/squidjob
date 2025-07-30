<?php
/**
 * Role Model
 * SquidJob Tender Management System
 * 
 * Handles role management and permissions
 */

namespace App\Models;

class Role extends BaseModel {
    
    protected $table = 'roles';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'name', 'display_name', 'description', 'level', 'color', 'is_active'
    ];
    
    protected $guarded = [
        'id', 'created_at', 'updated_at'
    ];
    
    protected $timestamps = true;
    
    /**
     * Get all active roles
     */
    public function getActiveRoles() {
        return $this->whereAll('is_active', 1, 'level ASC');
    }
    
    /**
     * Find role by name
     */
    public function findByName($name) {
        return $this->where('name', $name);
    }
    
    /**
     * Get role with permissions
     */
    public function getRoleWithPermissions($roleId) {
        try {
            $sql = "
                SELECT r.*, 
                       GROUP_CONCAT(p.name) as permissions,
                       GROUP_CONCAT(p.display_name) as permission_names
                FROM {$this->table} r
                LEFT JOIN role_permissions rp ON r.id = rp.role_id
                LEFT JOIN permissions p ON rp.permission_id = p.id AND p.is_active = 1
                WHERE r.id = ? AND r.is_active = 1
                GROUP BY r.id
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$roleId]);
            
            $role = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($role) {
                $role['permissions'] = $role['permissions'] ? explode(',', $role['permissions']) : [];
                $role['permission_names'] = $role['permission_names'] ? explode(',', $role['permission_names']) : [];
            }
            
            return $role;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return null;
        }
    }
    
    /**
     * Get users with specific role
     */
    public function getUsersWithRole($roleId) {
        try {
            $sql = "
                SELECT u.id, u.first_name, u.last_name, u.email, u.status, ur.assigned_at
                FROM users u
                INNER JOIN user_roles ur ON u.id = ur.user_id
                WHERE ur.role_id = ? AND u.status = 'active'
                ORDER BY u.first_name, u.last_name
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$roleId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Assign permission to role
     */
    public function assignPermission($roleId, $permissionId, $assignedBy = null) {
        try {
            // Check if permission is already assigned
            $sql = "SELECT COUNT(*) as count FROM role_permissions WHERE role_id = ? AND permission_id = ?";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$roleId, $permissionId]);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ((int)$result['count'] > 0) {
                return true; // Already assigned
            }
            
            // Insert new permission assignment
            $sql = "INSERT INTO role_permissions (role_id, permission_id, assigned_by, assigned_at) VALUES (?, ?, ?, NOW())";
            $stmt = $this->connection->prepare($sql);
            
            return $stmt->execute([$roleId, $permissionId, $assignedBy]);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Remove permission from role
     */
    public function removePermission($roleId, $permissionId) {
        try {
            $sql = "DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?";
            $stmt = $this->connection->prepare($sql);
            
            return $stmt->execute([$roleId, $permissionId]);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Get role permissions
     */
    public function getRolePermissions($roleId) {
        try {
            $sql = "
                SELECT p.*, rp.assigned_at, rp.assigned_by
                FROM permissions p
                INNER JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = ? AND p.is_active = 1
                ORDER BY p.module, p.category, p.name
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$roleId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Create new role with permissions
     */
    public function createRoleWithPermissions($roleData, $permissions = []) {
        try {
            $this->connection->beginTransaction();
            
            // Create role
            $role = $this->create($roleData);
            
            if (!$role) {
                $this->connection->rollBack();
                return false;
            }
            
            // Assign permissions
            foreach ($permissions as $permissionId) {
                $this->assignPermission($role['id'], $permissionId, $roleData['created_by'] ?? null);
            }
            
            $this->connection->commit();
            return $role;
            
        } catch (\PDOException $e) {
            $this->connection->rollBack();
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Update role permissions
     */
    public function updateRolePermissions($roleId, $permissions = []) {
        try {
            $this->connection->beginTransaction();
            
            // Remove all existing permissions
            $sql = "DELETE FROM role_permissions WHERE role_id = ?";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$roleId]);
            
            // Add new permissions
            foreach ($permissions as $permissionId) {
                $this->assignPermission($roleId, $permissionId);
            }
            
            $this->connection->commit();
            return true;
            
        } catch (\PDOException $e) {
            $this->connection->rollBack();
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Get role hierarchy
     */
    public function getRoleHierarchy() {
        try {
            $sql = "
                SELECT r.*, COUNT(ur.user_id) as user_count
                FROM {$this->table} r
                LEFT JOIN user_roles ur ON r.id = ur.role_id
                WHERE r.is_active = 1
                GROUP BY r.id
                ORDER BY r.level ASC
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Check if role can be deleted
     */
    public function canDelete($roleId) {
        try {
            // Check if role has users
            $sql = "SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$roleId]);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            return (int)$result['count'] === 0;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Get role statistics
     */
    public function getRoleStats() {
        try {
            $sql = "
                SELECT 
                    COUNT(*) as total_roles,
                    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_roles,
                    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_roles
                FROM {$this->table}
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [
                'total_roles' => 0,
                'active_roles' => 0,
                'inactive_roles' => 0
            ];
        }
    }
    
    /**
     * Search roles
     */
    public function searchRoles($query) {
        return $this->search($query, ['name', 'display_name', 'description']);
    }
    
    /**
     * Get default roles for installation
     */
    public static function getDefaultRoles() {
        return [
            [
                'name' => 'admin',
                'display_name' => 'System Administrator',
                'description' => 'Full system access with all permissions',
                'level' => 1,
                'color' => '#dc3545',
                'is_active' => 1
            ],
            [
                'name' => 'tender_manager',
                'display_name' => 'Tender Manager',
                'description' => 'Manage tenders, bids, and evaluations',
                'level' => 2,
                'color' => '#007bff',
                'is_active' => 1
            ],
            [
                'name' => 'sales_head',
                'display_name' => 'Sales Head',
                'description' => 'Business development and client relations',
                'level' => 3,
                'color' => '#28a745',
                'is_active' => 1
            ],
            [
                'name' => 'accountant',
                'display_name' => 'Accountant',
                'description' => 'Financial management and reporting',
                'level' => 4,
                'color' => '#ffc107',
                'is_active' => 1
            ],
            [
                'name' => 'user',
                'display_name' => 'Standard User',
                'description' => 'Basic tender processing access',
                'level' => 5,
                'color' => '#6c757d',
                'is_active' => 1
            ]
        ];
    }
}