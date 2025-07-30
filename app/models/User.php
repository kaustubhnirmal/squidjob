<?php
/**
 * User Model
 * SquidJob Tender Management System
 * 
 * Handles user data and authentication
 */

namespace App\Models;

class User extends BaseModel {
    
    protected $table = 'users';
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'email', 'password_hash', 'first_name', 'last_name', 'phone', 'avatar_url',
        'department', 'designation', 'employee_id', 'status'
    ];
    
    protected $guarded = [
        'id', 'created_at', 'updated_at', 'email_verified_at', 'last_login',
        'password_changed_at', 'email_verification_token', 'password_reset_token',
        'password_reset_expires', 'remember_token'
    ];
    
    protected $timestamps = true;
    protected $softDeletes = false;
    
    /**
     * Find user by email
     */
    public function findByEmail($email) {
        return $this->where('email', $email);
    }
    
    /**
     * Create new user with hashed password
     */
    public function createUser($data) {
        if (isset($data['password'])) {
            $data['password_hash'] = hashPassword($data['password']);
            unset($data['password']);
        }
        
        $data['email_verification_token'] = bin2hex(random_bytes(32));
        $data['status'] = 'active';
        
        return $this->create($data);
    }
    
    /**
     * Update user password
     */
    public function updatePassword($userId, $newPassword) {
        return $this->update($userId, [
            'password_hash' => hashPassword($newPassword),
            'password_changed_at' => date('Y-m-d H:i:s')
        ]);
    }
    
    /**
     * Verify user password
     */
    public function verifyPassword($userId, $password) {
        $user = $this->find($userId);
        
        if (!$user) {
            return false;
        }
        
        return verifyPassword($password, $user['password_hash']);
    }
    
    /**
     * Update last login time
     */
    public function updateLastLogin($userId) {
        return $this->update($userId, [
            'last_login' => date('Y-m-d H:i:s')
        ]);
    }
    
    /**
     * Get user with role information
     */
    public function findWithRole($userId) {
        try {
            $sql = "
                SELECT u.*, r.name as role_name, r.display_name as role_display_name, r.level as role_level
                FROM {$this->table} u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                WHERE u.id = ? AND u.status = 'active'
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$userId]);
            
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return null;
        }
    }
    
    /**
     * Get user permissions
     */
    public function getUserPermissions($userId) {
        try {
            $sql = "
                SELECT DISTINCT p.name, p.display_name, p.description, p.module, p.category
                FROM permissions p
                INNER JOIN role_permissions rp ON p.id = rp.permission_id
                INNER JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE ur.user_id = ? AND p.active = 1
                ORDER BY p.module, p.category, p.name
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$userId]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Check if user has permission
     */
    public function hasPermission($userId, $permission) {
        try {
            $sql = "
                SELECT COUNT(*) as count
                FROM permissions p
                INNER JOIN role_permissions rp ON p.id = rp.permission_id
                INNER JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE ur.user_id = ? AND p.name = ? AND p.active = 1
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$userId, $permission]);
            
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            return (int)$result['count'] > 0;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Check if user has role
     */
    public function hasRole($userId, $roleName) {
        try {
            $sql = "
                SELECT COUNT(*) as count
                FROM roles r
                INNER JOIN user_roles ur ON r.id = ur.role_id
                WHERE ur.user_id = ? AND r.name = ? AND r.active = 1
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$userId, $roleName]);
            
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            return (int)$result['count'] > 0;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Assign role to user
     */
    public function assignRole($userId, $roleId, $assignedBy = null) {
        try {
            // Check if role assignment already exists
            $sql = "SELECT COUNT(*) as count FROM user_roles WHERE user_id = ? AND role_id = ?";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$userId, $roleId]);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ((int)$result['count'] > 0) {
                return true; // Already assigned
            }
            
            // Insert new role assignment
            $sql = "INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at) VALUES (?, ?, ?, NOW())";
            $stmt = $this->connection->prepare($sql);
            
            return $stmt->execute([$userId, $roleId, $assignedBy]);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Remove role from user
     */
    public function removeRole($userId, $roleId) {
        try {
            $sql = "DELETE FROM user_roles WHERE user_id = ? AND role_id = ?";
            $stmt = $this->connection->prepare($sql);
            
            return $stmt->execute([$userId, $roleId]);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Get users by role
     */
    public function getUsersByRole($roleName) {
        try {
            $sql = "
                SELECT u.*, r.name as role_name, r.display_name as role_display_name
                FROM {$this->table} u
                INNER JOIN user_roles ur ON u.id = ur.user_id
                INNER JOIN roles r ON ur.role_id = r.id
                WHERE r.name = ? AND u.status = 'active'
                ORDER BY u.first_name, u.last_name
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$roleName]);
            
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [];
        }
    }
    
    /**
     * Get users by department
     */
    public function getUsersByDepartment($department) {
        return $this->whereAll('department', $department);
    }
    
    /**
     * Search users
     */
    public function searchUsers($query) {
        return $this->search($query, ['first_name', 'last_name', 'email', 'department', 'designation']);
    }
    
    /**
     * Get active users count
     */
    public function getActiveUsersCount() {
        return $this->count('status', 'active');
    }
    
    /**
     * Get user statistics
     */
    public function getUserStats() {
        try {
            $sql = "
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
                    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
                    SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_users,
                    SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as active_last_30_days
                FROM {$this->table}
            ";
            
            $stmt = $this->connection->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetch(\PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return [
                'total_users' => 0,
                'active_users' => 0,
                'inactive_users' => 0,
                'suspended_users' => 0,
                'active_last_30_days' => 0
            ];
        }
    }
    
    /**
     * Verify email
     */
    public function verifyEmail($token) {
        try {
            $user = $this->where('email_verification_token', $token);
            
            if (!$user) {
                return false;
            }
            
            return $this->update($user['id'], [
                'email_verified' => true,
                'email_verified_at' => date('Y-m-d H:i:s'),
                'email_verification_token' => null
            ]);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Generate password reset token
     */
    public function generatePasswordResetToken($email) {
        try {
            $user = $this->findByEmail($email);
            
            if (!$user) {
                return false;
            }
            
            $token = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            $updated = $this->update($user['id'], [
                'password_reset_token' => $token,
                'password_reset_expires' => $expires
            ]);
            
            return $updated ? $token : false;
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
    
    /**
     * Reset password with token
     */
    public function resetPasswordWithToken($token, $newPassword) {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE password_reset_token = ? AND password_reset_expires > NOW()";
            $stmt = $this->connection->prepare($sql);
            $stmt->execute([$token]);
            
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if (!$user) {
                return false;
            }
            
            return $this->update($user['id'], [
                'password_hash' => hashPassword($newPassword),
                'password_reset_token' => null,
                'password_reset_expires' => null,
                'password_changed_at' => date('Y-m-d H:i:s')
            ]);
        } catch (\PDOException $e) {
            $this->handleError($e);
            return false;
        }
    }
}