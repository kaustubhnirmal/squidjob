# SquidJob Secure Authentication System

## 🔐 Overview

This document provides comprehensive information about the SquidJob Secure Authentication System - a professional-grade authentication solution with advanced security features, role-based access control (RBAC), and enterprise-level security measures.

## 🚀 Features

### Core Authentication Features
- ✅ **Secure Login/Logout** with session management
- ✅ **Password Reset** via email with secure tokens
- ✅ **Remember Me** functionality with token rotation
- ✅ **Email Verification** for new accounts
- ✅ **Two-Factor Authentication** ready infrastructure
- ✅ **Account Lockout** after failed attempts
- ✅ **Session Timeout** and management

### Security Features
- ✅ **Password Hashing** with bcrypt (configurable rounds)
- ✅ **CSRF Token Protection** on all forms
- ✅ **Rate Limiting** for sensitive operations
- ✅ **IP Whitelisting/Blacklisting** support
- ✅ **Device Tracking** and fingerprinting
- ✅ **Security Event Logging** and monitoring
- ✅ **Audit Trail** for all user actions
- ✅ **SQL Injection Prevention** with prepared statements

### Role-Based Access Control (RBAC)
- ✅ **Hierarchical Roles** with permission inheritance
- ✅ **Granular Permissions** by module and category
- ✅ **Dynamic Role Assignment** and management
- ✅ **Permission Matrix** for easy administration
- ✅ **Role-based UI** rendering and access control

### User Management
- ✅ **User Registration** (admin-controlled)
- ✅ **Profile Management** with avatar support
- ✅ **Department/Designation** assignment
- ✅ **User Status** management (active/inactive/suspended)
- ✅ **Bulk User Operations** and management
- ✅ **User Activity Tracking** and reporting

### Professional UI/UX
- ✅ **SquidJob Purple Theme** integration
- ✅ **Responsive Design** for all devices
- ✅ **Professional Login Modal** with animations
- ✅ **Registration Form** with real-time validation
- ✅ **Password Strength Indicator** with feedback
- ✅ **Loading States** and error handling
- ✅ **Accessibility Compliant** (WCAG 2.1 AA)

## 📁 File Structure

```
squidjob/
├── app/
│   ├── controllers/
│   │   ├── AuthController.php          # Authentication logic
│   │   └── UserController.php          # User management
│   ├── models/
│   │   ├── User.php                    # User model with RBAC
│   │   ├── Role.php                    # Role management
│   │   └── Permission.php              # Permission management
│   ├── core/
│   │   └── AuthMiddleware.php          # Session & security middleware
│   ├── services/
│   │   └── EmailService.php            # Email notifications
│   ├── helpers/
│   │   └── auth_helpers.php            # Authentication helper functions
│   └── views/
│       └── auth/
│           ├── login-modal.php         # Professional login modal
│           ├── register.php            # Registration form
│           └── reset-password.php      # Password reset form
├── database/
│   ├── enhanced_auth_schema.sql        # Complete database schema
│   └── auth_tables.sql                 # Additional security tables
├── config/
│   ├── app.php                         # Application configuration
│   └── database.php                    # Database configuration
└── install_auth_system.php             # Installation script
```

## 🛠️ Installation

### Prerequisites
- PHP 8.0 or higher
- MySQL 8.0 or higher
- Composer (for dependencies)
- XAMPP/LAMP/WAMP environment

### Step 1: Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE squidjob;
CREATE USER 'squidj0b'@'localhost' IDENTIFIED BY 'A1b2c3d4';
GRANT ALL PRIVILEGES ON squidjob.* TO 'squidj0b'@'localhost';
FLUSH PRIVILEGES;
```

### Step 2: Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Update .env with your settings
APP_NAME="SquidJob Tender Management System"
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost/squidjob

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=squidjob
DB_USERNAME=squidj0b
DB_PASSWORD=A1b2c3d4

# Email configuration
MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

### Step 3: Run Installation
```bash
# Run the installation script
php install_auth_system.php
```

The installation script will:
- Create all database tables and relationships
- Insert default roles and permissions
- Create an admin user account
- Set up security configurations
- Create necessary directories
- Set proper file permissions

### Step 4: Post-Installation
1. **Login with admin credentials** (provided by installation script)
2. **Change admin password** immediately
3. **Configure email settings** for notifications
4. **Create additional users** and assign roles
5. **Review security settings** in admin panel

## 🔧 Configuration

### Security Settings
The system includes configurable security settings stored in the `security_settings` table:

```php
// Maximum login attempts before lockout
'max_login_attempts' => 5

// Lockout duration in seconds (15 minutes)
'lockout_duration' => 900

// Session timeout in minutes (24 hours)
'session_timeout' => 1440

// Password requirements
'password_min_length' => 8
'password_require_uppercase' => true
'password_require_lowercase' => true
'password_require_numbers' => true
'password_require_symbols' => true

// Remember me duration (30 days)
'remember_me_duration' => 2592000

// Device tracking and security
'enable_device_tracking' => true
'max_concurrent_sessions' => 3
'enable_security_notifications' => true
```

### Role Configuration
Default roles with hierarchical levels:

1. **System Administrator** (Level 1) - Full system access
2. **Tender Manager** (Level 2) - Tender management and oversight
3. **Sales Head** (Level 3) - Business development and client relations
4. **Accountant** (Level 4) - Financial management and reporting
5. **Standard User** (Level 5) - Basic tender processing access

### Permission Categories
Permissions are organized by module and category:

- **Users**: management, roles
- **Tenders**: management, workflow
- **Bidding**: management, participation, evaluation, workflow
- **Documents**: access, management, security
- **Finance**: reporting, procurement, approval, planning
- **Reports**: access, management, export
- **System**: administration, monitoring, maintenance, security

## 🔐 Security Features

### Password Security
- **Bcrypt hashing** with configurable cost factor
- **Password strength validation** with real-time feedback
- **Password history** to prevent reuse
- **Forced password changes** after specified days
- **Secure password generation** for admin resets

### Session Security
- **Secure session configuration** with httpOnly and secure flags
- **Session regeneration** on login and privilege changes
- **Session timeout** with configurable duration
- **Concurrent session limiting** per user
- **Device fingerprinting** for session validation

### Rate Limiting
- **Login attempt limiting** with progressive delays
- **Password reset limiting** to prevent abuse
- **API rate limiting** for sensitive operations
- **IP-based rate limiting** with configurable windows

### Audit & Monitoring
- **Comprehensive audit logs** for all user actions
- **Security event tracking** with severity levels
- **Login attempt monitoring** with failure analysis
- **Device tracking** with trust levels
- **Suspicious activity detection** with alerts

## 📊 Database Schema

### Core Tables
- `users` - User accounts and profiles
- `roles` - Role definitions and hierarchy
- `permissions` - Permission definitions by module
- `user_roles` - User-role assignments
- `role_permissions` - Role-permission assignments

### Security Tables
- `login_attempts` - Failed login tracking
- `password_reset_tokens` - Secure password reset tokens
- `email_verification_tokens` - Email verification tokens
- `user_sessions` - Active session tracking
- `user_devices` - Device fingerprinting and trust
- `security_events` - Security event logging
- `security_settings` - Configurable security parameters

### Audit Tables
- `audit_logs` - Comprehensive audit trail
- `ip_whitelist` - Allowed IP addresses
- `ip_blacklist` - Blocked IP addresses
- `two_factor_auth` - 2FA configuration (ready)

## 🎨 UI Components

### Login Modal
Professional login modal with:
- SquidJob purple gradient theme
- Real-time validation feedback
- Password visibility toggle
- Remember me functionality
- Forgot password integration
- Loading states and animations

### Registration Form
Comprehensive registration with:
- Multi-step form layout
- Real-time password strength indicator
- Department and role selection
- Client-side validation
- Professional styling
- Mobile-responsive design

### User Management Interface
Admin interface featuring:
- User listing with search and filters
- Role-based action buttons
- Bulk operations support
- User profile management
- Activity tracking display
- Security event monitoring

## 🔌 API Integration

### Helper Functions
The system provides comprehensive helper functions:

```php
// Authentication checks
auth()                          // Check if user is authenticated
user()                          // Get current user data
userId()                        // Get current user ID
can('permission')               // Check user permission
hasRole('role')                 // Check user role
isAdmin()                       // Check if user is admin

// Security functions
csrfToken()                     // Generate CSRF token
verifyCsrf($token)              // Verify CSRF token
hashPassword($password)         // Hash password securely
verifyPassword($pass, $hash)    // Verify password
rateLimit($action, $max, $time) // Apply rate limiting

// Utility functions
sanitize($input)                // Sanitize user input
validate($data, $rules)         // Validate form data
flash($type, $message)          // Set flash message
redirect($url)                  // Redirect user
```

### Middleware Usage
```php
// Require authentication
requireAuth();

// Require specific permission
requirePermission('create_tender');

// Require specific role
requireRole('admin');

// Rate limiting
if (!rateLimit('password_reset', 3, 900)) {
    flash('error', 'Too many attempts. Try again later.');
    return back();
}
```

## 🧪 Testing

### Manual Testing Checklist

#### Authentication Flow
- [ ] User can login with valid credentials
- [ ] Invalid credentials are rejected
- [ ] Account lockout works after max attempts
- [ ] Password reset email is sent and works
- [ ] Remember me functionality persists sessions
- [ ] Logout clears session and redirects

#### Security Features
- [ ] CSRF tokens are validated on forms
- [ ] Rate limiting prevents abuse
- [ ] Session timeout works correctly
- [ ] Device tracking records new devices
- [ ] Security events are logged properly
- [ ] Audit trail captures user actions

#### Role-Based Access Control
- [ ] Users can only access permitted resources
- [ ] Role assignments work correctly
- [ ] Permission checks function properly
- [ ] Admin can manage users and roles
- [ ] UI elements show/hide based on permissions

#### User Management
- [ ] Admin can create new users
- [ ] User profiles can be updated
- [ ] User status changes work
- [ ] Password resets function
- [ ] Role assignments are applied

### Automated Testing
```bash
# Run PHPUnit tests (if implemented)
./vendor/bin/phpunit tests/

# Run security scan
php security-checker security:check

# Check code quality
./vendor/bin/phpcs --standard=PSR12 app/
```

## 🚨 Security Considerations

### Production Deployment
1. **Change default admin password** immediately
2. **Enable HTTPS** for all authentication pages
3. **Configure proper email settings** for notifications
4. **Set up regular database backups**
5. **Monitor security logs** for suspicious activity
6. **Update security settings** based on requirements
7. **Implement IP whitelisting** if needed
8. **Enable two-factor authentication** for admin users

### Security Best Practices
- Use strong, unique passwords for all accounts
- Regularly review user permissions and roles
- Monitor audit logs for suspicious activity
- Keep the system updated with security patches
- Implement proper backup and recovery procedures
- Use HTTPS in production environments
- Configure proper firewall rules
- Regular security audits and penetration testing

## 🔄 Maintenance

### Regular Tasks
- **Clean up expired tokens** (automated via MySQL events)
- **Review security logs** for anomalies
- **Update user permissions** as roles change
- **Monitor failed login attempts** for patterns
- **Backup audit logs** before cleanup
- **Review and update security settings**

### Database Maintenance
```sql
-- Clean old login attempts (automated)
DELETE FROM login_attempts WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- Clean expired tokens (automated)
DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = 1;

-- Clean old audit logs (automated)
DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

## 📞 Support

### Common Issues

**Q: Users can't login after installation**
A: Check database connection, verify admin user was created, ensure proper file permissions

**Q: Email notifications not working**
A: Verify MAIL_* settings in .env file, check email service configuration

**Q: Permission denied errors**
A: Check user roles and permissions, verify RBAC configuration

**Q: Session timeout issues**
A: Review session configuration in config/app.php and security_settings table

### Troubleshooting
1. Check application logs in `storage/logs/`
2. Review security events in database
3. Verify database connections and permissions
4. Check file permissions on storage directories
5. Validate email configuration settings

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Complete authentication system implementation
- ✅ Role-based access control (RBAC)
- ✅ Professional UI with SquidJob theme
- ✅ Comprehensive security features
- ✅ User management interface
- ✅ Email notification system
- ✅ Audit logging and monitoring
- ✅ Installation and setup scripts

### Planned Features
- 🔄 Two-factor authentication (2FA) implementation
- 🔄 OAuth integration (Google, Microsoft)
- 🔄 Advanced reporting dashboard
- 🔄 API authentication with JWT tokens
- 🔄 Mobile app authentication support
- 🔄 Advanced threat detection

## 📄 License

This authentication system is part of the SquidJob Tender Management System. All rights reserved.

---

**🎉 Congratulations!** You now have a professional-grade authentication system with enterprise-level security features. The system is ready for production use with proper configuration and security measures in place.

For additional support or customization requests, please refer to the development team or system administrator.