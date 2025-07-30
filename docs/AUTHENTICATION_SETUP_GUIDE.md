# SquidJob Authentication System Setup Guide

## Overview

This guide provides comprehensive instructions for setting up and configuring the enhanced authentication system for SquidJob Tender Management System. The system includes advanced security features, professional UI components, and comprehensive user management capabilities.

## 🚀 Quick Start

### Prerequisites

- PHP 8.1 or higher
- MySQL 8.0 or higher
- Composer (for PHPMailer dependency)
- XAMPP or similar development environment

### Installation Steps

1. **Install Dependencies**
   ```bash
   composer require phpmailer/phpmailer
   ```

2. **Run Database Migrations**
   ```sql
   -- Execute in MySQL/phpMyAdmin
   SOURCE database/migrations/001_create_login_attempts_table.sql;
   SOURCE database/migrations/002_enhance_authentication_system.sql;
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Set Up Email Configuration**
   ```php
   // In .env file
   MAIL_DRIVER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=noreply@squidjob.com
   MAIL_FROM_NAME="SquidJob System"
   ```

## 🔧 Configuration

### Security Settings

The system includes configurable security settings stored in the `security_settings` table:

| Setting | Default | Description |
|---------|---------|-------------|
| `max_login_attempts` | 5 | Failed attempts before lockout |
| `lockout_duration` | 900 | Lockout duration (seconds) |
| `password_min_length` | 8 | Minimum password length |
| `password_expiry_days` | 90 | Password expiry (0 = never) |
| `session_timeout` | 1440 | Session timeout (minutes) |
| `two_factor_enabled` | false | Enable 2FA system-wide |

### Email Templates

Professional email templates are included for:
- Password reset notifications
- Email verification
- Account lockout alerts
- Welcome messages

Templates are located in `app/views/emails/` and can be customized.

## 🎨 UI Components

### Login Modal

The authentication system includes a professional login modal with:
- Purple gradient theme matching SquidJob branding
- Real-time validation
- Password visibility toggle
- Remember me functionality
- Forgot password integration
- Mobile-responsive design

**Usage:**
```php
// Include in your layout
include 'app/views/auth/login-modal.php';

// JavaScript to open modal
openLoginModal();
```

### Password Reset Page

Dedicated password reset page with:
- Real-time password strength validation
- Visual requirement indicators
- Secure token verification
- Professional styling

## 🔐 Security Features

### Password Security

- **Bcrypt Hashing**: 12 salt rounds by default
- **Strength Requirements**: Configurable complexity rules
- **History Tracking**: Prevents password reuse
- **Expiry Management**: Automatic password expiration

### Account Protection

- **Rate Limiting**: Configurable attempt limits
- **Account Lockout**: Temporary lockout after failed attempts
- **IP Tracking**: Monitor login attempts by IP
- **Device Trust**: Remember trusted devices

### Session Management

- **Secure Sessions**: HTTPOnly, Secure, SameSite cookies
- **Session Regeneration**: Regular ID regeneration
- **Remember Me**: Secure long-term authentication
- **Multi-device Support**: Track active sessions

## 📧 Email Service

### Configuration

The `EmailService` class handles all authentication emails:

```php
use App\Services\EmailService;

$emailService = new EmailService();
$emailService->sendPasswordResetEmail($user, $token);
```

### Available Methods

- `sendPasswordResetEmail($user, $token)`
- `sendEmailVerificationEmail($user, $token)`
- `sendAccountLockoutNotification($user, $duration)`
- `sendWelcomeEmail($user)`

## 🛡️ Middleware Protection

### Route Protection

```php
// Require authentication
requireAuth();

// Require specific permission
requirePermission('manage_users');

// Require specific role
requireRole('admin');

// CSRF protection
validateCsrf($token);

// Rate limiting
rateLimit('login', 5, 900); // 5 attempts per 15 minutes
```

### Usage Examples

```php
// In your controller
public function sensitiveAction() {
    requireAuth();
    requirePermission('sensitive_action');
    
    if (!validateCsrf(request('_token'))) {
        flash('error', 'Invalid security token');
        return back();
    }
    
    // Your secure code here
}
```

## 🗄️ Database Schema

### Core Tables

1. **users** - Enhanced with security fields
2. **login_attempts** - Track failed login attempts
3. **user_sessions** - Active session management
4. **password_history** - Password reuse prevention
5. **security_events** - Security event logging
6. **trusted_devices** - Device trust management
7. **security_settings** - Configurable security options

### Key Relationships

```sql
users (1) -> (many) login_attempts
users (1) -> (many) user_sessions
users (1) -> (many) password_history
users (1) -> (many) trusted_devices
```

## 🔍 Monitoring & Logging

### Security Events

All security events are logged in the `security_events` table:

```php
// Log custom security event
$this->logSecurityEvent('suspicious_activity', $userId, [
    'ip_address' => $ip,
    'details' => 'Multiple rapid login attempts'
]);
```

### Available Views

- `active_user_sessions` - Current active sessions
- `recent_security_events` - Recent security events
- `user_login_stats` - User login statistics

## 🚨 Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check SMTP configuration in `.env`
   - Verify firewall settings
   - Test with `EmailService::testConnection()`

2. **Session Issues**
   - Ensure session directory is writable
   - Check session configuration in `config/app.php`
   - Verify cookie settings

3. **Database Errors**
   - Run migrations in correct order
   - Check MySQL version compatibility
   - Verify foreign key constraints

### Debug Mode

Enable debug mode for detailed error messages:

```php
// In .env
APP_DEBUG=true
APP_ENV=development
```

## 🔧 Customization

### Styling

The authentication UI uses CSS custom properties for easy theming:

```css
:root {
    --auth-primary-color: #667eea;
    --auth-secondary-color: #764ba2;
    --auth-success-color: #16a34a;
    --auth-error-color: #dc2626;
    --auth-warning-color: #d97706;
}
```

### Email Templates

Customize email templates in `app/views/emails/`:

```php
// Override default template
$emailService->loadTemplate('custom-password-reset', $data);
```

### Security Policies

Modify security settings via database or admin interface:

```sql
UPDATE security_settings 
SET setting_value = '10' 
WHERE setting_key = 'max_login_attempts';
```

## 📊 Performance Optimization

### Database Optimization

1. **Indexes**: All critical queries are indexed
2. **Cleanup**: Automated cleanup procedures
3. **Partitioning**: Consider partitioning large tables

### Caching

```php
// Cache user permissions
$permissions = cache()->remember("user_permissions_{$userId}", 3600, function() {
    return $this->getUserPermissions($userId);
});
```

## 🔄 Maintenance

### Regular Tasks

1. **Cleanup Old Data**
   ```sql
   CALL CleanupSecurityData();
   ```

2. **Monitor Security Events**
   ```sql
   SELECT * FROM recent_security_events 
   WHERE severity IN ('high', 'critical');
   ```

3. **Review User Sessions**
   ```sql
   SELECT * FROM active_user_sessions 
   WHERE last_activity < DATE_SUB(NOW(), INTERVAL 1 DAY);
   ```

### Backup Considerations

Ensure these tables are included in backups:
- `users` (with security fields)
- `security_events`
- `password_history`
- `security_settings`

## 🚀 Production Deployment

### Security Checklist

- [ ] Change default passwords
- [ ] Enable HTTPS
- [ ] Configure proper session settings
- [ ] Set up email service
- [ ] Review security settings
- [ ] Enable audit logging
- [ ] Set up monitoring
- [ ] Test backup/restore

### Environment Variables

```bash
# Production settings
APP_ENV=production
APP_DEBUG=false
SESSION_SECURE_COOKIE=true
BCRYPT_ROUNDS=12
```

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review error logs in `storage/logs/`
3. Consult the API documentation
4. Contact the development team

## 🔄 Updates

To update the authentication system:

1. Backup your database
2. Run new migrations
3. Update configuration files
4. Test thoroughly
5. Deploy to production

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Compatibility**: PHP 8.1+, MySQL 8.0+