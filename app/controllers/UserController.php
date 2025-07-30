<?php
/**
 * User Management Controller
 * SquidJob Tender Management System
 * 
 * Handles user management, roles, and permissions
 */

namespace App\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Core\BaseController;
use App\Services\EmailService;

class UserController extends BaseController {
    
    private $userModel;
    private $roleModel;
    private $permissionModel;
    
    public function __construct() {
        parent::__construct();
        $this->userModel = new User();
        $this->roleModel = new Role();
        $this->permissionModel = new Permission();
        
        // Require authentication for all user management actions
        requireAuth();
    }
    
    /**
     * Display user list
     */
    public function index() {
        requirePermission('view_users');
        
        $page = (int)(request('page', 1));
        $limit = 20;
        $offset = ($page - 1) * $limit;
        $search = sanitize(request('search', ''));
        $role = sanitize(request('role', ''));
        $status = sanitize(request('status', ''));
        
        try {
            // Build query conditions
            $conditions = [];
            $params = [];
            
            if (!empty($search)) {
                $conditions[] = "(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.department LIKE ?)";
                $searchTerm = "%{$search}%";
                $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
            }
            
            if (!empty($role)) {
                $conditions[] = "r.name = ?";
                $params[] = $role;
            }
            
            if (!empty($status)) {
                $conditions[] = "u.status = ?";
                $params[] = $status;
            }
            
            $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';
            
            // Get users with role information
            $sql = "
                SELECT u.*, r.name as role_name, r.display_name as role_display_name, r.color as role_color
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                {$whereClause}
                ORDER BY u.created_at DESC
                LIMIT {$limit} OFFSET {$offset}
            ";
            
            $users = $this->userModel->query($sql, $params);
            
            // Get total count for pagination
            $countSql = "
                SELECT COUNT(DISTINCT u.id) as total
                FROM users u
                LEFT JOIN user_roles ur ON u.id = ur.user_id
                LEFT JOIN roles r ON ur.role_id = r.id
                {$whereClause}
            ";
            
            $totalResult = $this->userModel->query($countSql, $params);
            $total = $totalResult[0]['total'] ?? 0;
            $totalPages = ceil($total / $limit);
            
            // Get roles for filter
            $roles = $this->roleModel->getActiveRoles();
            
            // Get user statistics
            $stats = $this->userModel->getUserStats();
            
            $data = [
                'title' => 'User Management - ' . config('app.name'),
                'users' => $users,
                'roles' => $roles,
                'stats' => $stats,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_records' => $total,
                    'has_prev' => $page > 1,
                    'has_next' => $page < $totalPages,
                    'prev_page' => $page - 1,
                    'next_page' => $page + 1
                ],
                'filters' => [
                    'search' => $search,
                    'role' => $role,
                    'status' => $status
                ]
            ];
            
            theme_view('users.index', $data);
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error loading users: ' . $e->getMessage());
            flash('error', 'Error loading users. Please try again.');
            redirect(url('dashboard'));
        }
    }
    
    /**
     * Show create user form
     */
    public function create() {
        requirePermission('create_user');
        
        $roles = $this->roleModel->getActiveRoles();
        $departments = $this->getDepartments();
        
        $data = [
            'title' => 'Create User - ' . config('app.name'),
            'roles' => $roles,
            'departments' => $departments,
            'csrf_token' => csrfToken()
        ];
        
        theme_view('users.create', $data);
    }
    
    /**
     * Store new user
     */
    public function store() {
        requirePermission('create_user');
        
        try {
            // Verify CSRF token
            if (!verifyCsrf(request('_token'))) {
                flash('error', 'Invalid security token. Please try again.');
                return back();
            }
            
            // Get and validate input
            $input = [
                'first_name' => sanitize(request('first_name')),
                'last_name' => sanitize(request('last_name')),
                'email' => sanitize(request('email')),
                'password' => request('password'),
                'password_confirmation' => request('password_confirmation'),
                'phone' => sanitize(request('phone')),
                'department' => sanitize(request('department')),
                'designation' => sanitize(request('designation')),
                'employee_id' => sanitize(request('employee_id')),
                'role_id' => (int)request('role_id'),
                'status' => sanitize(request('status', 'active'))
            ];
            
            // Validation rules
            $rules = [
                'first_name' => 'required|max:100',
                'last_name' => 'required|max:100',
                'email' => 'required|email|max:255',
                'password' => 'required|min:8',
                'password_confirmation' => 'required',
                'phone' => 'max:20',
                'department' => 'max:100',
                'designation' => 'max:100',
                'employee_id' => 'max:50'
            ];
            
            $errors = validate($input, $rules);
            
            // Check password confirmation
            if ($input['password'] !== $input['password_confirmation']) {
                $errors['password_confirmation'] = ['Password confirmation does not match'];
            }
            
            // Check if email already exists
            if ($this->userModel->where('email', $input['email'])) {
                $errors['email'] = ['Email address is already registered'];
            }
            
            // Check if employee ID already exists (if provided)
            if (!empty($input['employee_id']) && $this->userModel->where('employee_id', $input['employee_id'])) {
                $errors['employee_id'] = ['Employee ID is already in use'];
            }
            
            // Validate password strength
            $passwordStrength = checkPasswordStrength($input['password']);
            if ($passwordStrength['strength'] === 'weak') {
                $errors['password'] = $passwordStrength['feedback'];
            }
            
            // Validate role
            if ($input['role_id'] && !$this->roleModel->find($input['role_id'])) {
                $errors['role_id'] = ['Invalid role selected'];
            }
            
            if (!empty($errors)) {
                flash('error', 'Please correct the errors below.');
                $_SESSION['validation_errors'] = $errors;
                $_SESSION['old_input'] = $input;
                return back();
            }
            
            // Create user account
            $userData = [
                'first_name' => $input['first_name'],
                'last_name' => $input['last_name'],
                'email' => $input['email'],
                'password_hash' => hashPassword($input['password']),
                'phone' => $input['phone'],
                'department' => $input['department'],
                'designation' => $input['designation'],
                'employee_id' => $input['employee_id'],
                'status' => $input['status'],
                'email_verified' => 1, // Admin created users are auto-verified
                'password_changed_at' => date('Y-m-d H:i:s')
            ];
            
            $user = $this->userModel->create($userData);
            
            if (!$user) {
                flash('error', 'Failed to create user account. Please try again.');
                return back();
            }
            
            // Assign role if specified
            if ($input['role_id']) {
                $this->userModel->assignRole($user['id'], $input['role_id'], userId());
            }
            
            // Log user creation
            $this->logSecurityEvent('user_created', $user['id'], [
                'created_by' => userId(),
                'role_assigned' => $input['role_id']
            ]);
            
            // Send welcome email
            try {
                $emailService = new EmailService();
                $emailService->sendWelcomeEmail($user);
            } catch (\Exception $e) {
                logMessage('WARNING', 'Failed to send welcome email: ' . $e->getMessage());
            }
            
            flash('success', 'User account created successfully!');
            redirect(url('users'));
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error creating user: ' . $e->getMessage());
            flash('error', 'An error occurred while creating the user. Please try again.');
            return back();
        }
    }
    
    /**
     * Show user details
     */
    public function show($id) {
        requirePermission('view_users');
        
        try {
            $user = $this->userModel->findWithRole($id);
            
            if (!$user) {
                flash('error', 'User not found.');
                redirect(url('users'));
            }
            
            // Get user permissions
            $permissions = $this->userModel->getUserPermissions($id);
            
            // Get user activity logs (recent)
            $activityLogs = $this->getUserActivityLogs($id, 10);
            
            // Get user sessions
            $sessions = $this->getUserSessions($id);
            
            // Get user devices
            $devices = $this->getUserDevices($id);
            
            $data = [
                'title' => 'User Details - ' . $user['first_name'] . ' ' . $user['last_name'],
                'user' => $user,
                'permissions' => $permissions,
                'activity_logs' => $activityLogs,
                'sessions' => $sessions,
                'devices' => $devices
            ];
            
            theme_view('users.show', $data);
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error loading user details: ' . $e->getMessage());
            flash('error', 'Error loading user details. Please try again.');
            redirect(url('users'));
        }
    }
    
    /**
     * Show edit user form
     */
    public function edit($id) {
        requirePermission('edit_user');
        
        try {
            $user = $this->userModel->findWithRole($id);
            
            if (!$user) {
                flash('error', 'User not found.');
                redirect(url('users'));
            }
            
            $roles = $this->roleModel->getActiveRoles();
            $departments = $this->getDepartments();
            
            $data = [
                'title' => 'Edit User - ' . $user['first_name'] . ' ' . $user['last_name'],
                'user' => $user,
                'roles' => $roles,
                'departments' => $departments,
                'csrf_token' => csrfToken()
            ];
            
            theme_view('users.edit', $data);
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error loading user for edit: ' . $e->getMessage());
            flash('error', 'Error loading user. Please try again.');
            redirect(url('users'));
        }
    }
    
    /**
     * Update user
     */
    public function update($id) {
        requirePermission('edit_user');
        
        try {
            // Verify CSRF token
            if (!verifyCsrf(request('_token'))) {
                flash('error', 'Invalid security token. Please try again.');
                return back();
            }
            
            $user = $this->userModel->find($id);
            
            if (!$user) {
                flash('error', 'User not found.');
                redirect(url('users'));
            }
            
            // Get and validate input
            $input = [
                'first_name' => sanitize(request('first_name')),
                'last_name' => sanitize(request('last_name')),
                'email' => sanitize(request('email')),
                'phone' => sanitize(request('phone')),
                'department' => sanitize(request('department')),
                'designation' => sanitize(request('designation')),
                'employee_id' => sanitize(request('employee_id')),
                'role_id' => (int)request('role_id'),
                'status' => sanitize(request('status'))
            ];
            
            // Validation rules
            $rules = [
                'first_name' => 'required|max:100',
                'last_name' => 'required|max:100',
                'email' => 'required|email|max:255',
                'phone' => 'max:20',
                'department' => 'max:100',
                'designation' => 'max:100',
                'employee_id' => 'max:50'
            ];
            
            $errors = validate($input, $rules);
            
            // Check if email already exists (excluding current user)
            $existingUser = $this->userModel->where('email', $input['email']);
            if ($existingUser && $existingUser['id'] != $id) {
                $errors['email'] = ['Email address is already registered'];
            }
            
            // Check if employee ID already exists (excluding current user)
            if (!empty($input['employee_id'])) {
                $existingEmployee = $this->userModel->where('employee_id', $input['employee_id']);
                if ($existingEmployee && $existingEmployee['id'] != $id) {
                    $errors['employee_id'] = ['Employee ID is already in use'];
                }
            }
            
            // Validate role
            if ($input['role_id'] && !$this->roleModel->find($input['role_id'])) {
                $errors['role_id'] = ['Invalid role selected'];
            }
            
            if (!empty($errors)) {
                flash('error', 'Please correct the errors below.');
                $_SESSION['validation_errors'] = $errors;
                $_SESSION['old_input'] = $input;
                return back();
            }
            
            // Prepare update data
            $updateData = [
                'first_name' => $input['first_name'],
                'last_name' => $input['last_name'],
                'email' => $input['email'],
                'phone' => $input['phone'],
                'department' => $input['department'],
                'designation' => $input['designation'],
                'employee_id' => $input['employee_id'],
                'status' => $input['status']
            ];
            
            // Update user
            $updated = $this->userModel->update($id, $updateData);
            
            if (!$updated) {
                flash('error', 'Failed to update user. Please try again.');
                return back();
            }
            
            // Update role if changed
            if ($input['role_id']) {
                // Remove existing roles
                $this->userModel->query("DELETE FROM user_roles WHERE user_id = ?", [$id]);
                
                // Assign new role
                $this->userModel->assignRole($id, $input['role_id'], userId());
            }
            
            // Log user update
            $this->logSecurityEvent('user_updated', $id, [
                'updated_by' => userId(),
                'changes' => array_diff_assoc($updateData, $user)
            ]);
            
            flash('success', 'User updated successfully!');
            redirect(url("users/{$id}"));
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error updating user: ' . $e->getMessage());
            flash('error', 'An error occurred while updating the user. Please try again.');
            return back();
        }
    }
    
    /**
     * Delete user
     */
    public function delete($id) {
        requirePermission('delete_user');
        
        try {
            // Verify CSRF token
            if (!verifyCsrf(request('_token'))) {
                flash('error', 'Invalid security token. Please try again.');
                return back();
            }
            
            $user = $this->userModel->find($id);
            
            if (!$user) {
                flash('error', 'User not found.');
                redirect(url('users'));
            }
            
            // Prevent self-deletion
            if ($id == userId()) {
                flash('error', 'You cannot delete your own account.');
                return back();
            }
            
            // Prevent deletion of admin users (optional safety check)
            if ($this->userModel->hasRole($id, 'admin') && !isAdmin()) {
                flash('error', 'You do not have permission to delete admin users.');
                return back();
            }
            
            // Soft delete or hard delete based on configuration
            $deleted = $this->userModel->delete($id);
            
            if ($deleted) {
                // Log user deletion
                $this->logSecurityEvent('user_deleted', $id, [
                    'deleted_by' => userId(),
                    'user_email' => $user['email']
                ]);
                
                flash('success', 'User deleted successfully.');
            } else {
                flash('error', 'Failed to delete user. Please try again.');
            }
            
            redirect(url('users'));
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error deleting user: ' . $e->getMessage());
            flash('error', 'An error occurred while deleting the user. Please try again.');
            return back();
        }
    }
    
    /**
     * Reset user password
     */
    public function resetPassword($id) {
        requirePermission('edit_user');
        
        try {
            // Verify CSRF token
            if (!verifyCsrf(request('_token'))) {
                flash('error', 'Invalid security token. Please try again.');
                return back();
            }
            
            $user = $this->userModel->find($id);
            
            if (!$user) {
                flash('error', 'User not found.');
                redirect(url('users'));
            }
            
            // Generate secure password
            $newPassword = generateSecurePassword(12);
            
            // Update password
            $updated = $this->userModel->updatePassword($id, $newPassword);
            
            if ($updated) {
                // Send password reset email
                try {
                    $emailService = new EmailService();
                    // You might want to create a specific template for admin password resets
                    $emailService->sendPasswordResetNotification($user, $newPassword);
                } catch (\Exception $e) {
                    logMessage('WARNING', 'Failed to send password reset email: ' . $e->getMessage());
                }
                
                // Log password reset
                $this->logSecurityEvent('password_reset_admin', $id, [
                    'reset_by' => userId()
                ]);
                
                flash('success', 'Password reset successfully. New password has been sent to the user\'s email.');
            } else {
                flash('error', 'Failed to reset password. Please try again.');
            }
            
            return back();
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error resetting password: ' . $e->getMessage());
            flash('error', 'An error occurred while resetting the password. Please try again.');
            return back();
        }
    }
    
    /**
     * Toggle user status
     */
    public function toggleStatus($id) {
        requirePermission('edit_user');
        
        try {
            // Verify CSRF token
            if (!verifyCsrf(request('_token'))) {
                flash('error', 'Invalid security token. Please try again.');
                return back();
            }
            
            $user = $this->userModel->find($id);
            
            if (!$user) {
                flash('error', 'User not found.');
                redirect(url('users'));
            }
            
            // Prevent self-deactivation
            if ($id == userId()) {
                flash('error', 'You cannot change your own account status.');
                return back();
            }
            
            // Toggle status
            $newStatus = $user['status'] === 'active' ? 'inactive' : 'active';
            
            $updated = $this->userModel->update($id, ['status' => $newStatus]);
            
            if ($updated) {
                // Log status change
                $this->logSecurityEvent('user_status_changed', $id, [
                    'changed_by' => userId(),
                    'old_status' => $user['status'],
                    'new_status' => $newStatus
                ]);
                
                $statusText = $newStatus === 'active' ? 'activated' : 'deactivated';
                flash('success', "User {$statusText} successfully.");
            } else {
                flash('error', 'Failed to update user status. Please try again.');
            }
            
            return back();
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error toggling user status: ' . $e->getMessage());
            flash('error', 'An error occurred while updating user status. Please try again.');
            return back();
        }
    }
    
    /**
     * Get departments list
     */
    private function getDepartments() {
        // This could be from a database table or configuration
        return [
            'Administration',
            'Sales & Marketing',
            'Finance & Accounts',
            'Operations',
            'Human Resources',
            'Information Technology',
            'Legal & Compliance',
            'Business Development'
        ];
    }
    
    /**
     * Get user activity logs
     */
    private function getUserActivityLogs($userId, $limit = 10) {
        try {
            $sql = "
                SELECT * FROM audit_logs 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            ";
            
            return $this->userModel->query($sql, [$userId, $limit]);
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error fetching user activity logs: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get user sessions
     */
    private function getUserSessions($userId) {
        try {
            $sql = "
                SELECT * FROM user_sessions 
                WHERE user_id = ? AND expires_at > NOW() 
                ORDER BY last_activity DESC
            ";
            
            return $this->userModel->query($sql, [$userId]);
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error fetching user sessions: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get user devices
     */
    private function getUserDevices($userId) {
        try {
            $sql = "
                SELECT * FROM user_devices 
                WHERE user_id = ? 
                ORDER BY last_used DESC
            ";
            
            return $this->userModel->query($sql, [$userId]);
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error fetching user devices: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Log security event
     */
    private function logSecurityEvent($event, $userId, $metadata = []) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO security_events (event_type, user_id, ip_address, user_agent, event_data, created_at) 
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $event,
                $userId,
                getClientIp(),
                $_SERVER['HTTP_USER_AGENT'] ?? '',
                json_encode($metadata)
            ]);
        } catch (\Exception $e) {
            logMessage('ERROR', 'Error logging security event: ' . $e->getMessage());
        }
    }
}