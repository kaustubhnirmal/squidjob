-- Authentication System Tables
-- SquidJob Tender Management System
-- Additional tables for secure authentication

-- Login attempts tracking table
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMP NULL,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_ip_address (ip_address),
    INDEX idx_success (success),
    INDEX idx_locked_until (locked_until),
    INDEX idx_created_at (created_at),
    INDEX idx_email_ip (email, ip_address),
    INDEX idx_email_created (email, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password reset tokens table (if not using users table columns)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at),
    INDEX idx_used (used),
    
    -- Constraints
    UNIQUE KEY uk_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email verification tokens table (if not using users table columns)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at),
    INDEX idx_verified (verified),
    
    -- Constraints
    UNIQUE KEY uk_token (token),
    
    -- Foreign keys
    CONSTRAINT fk_email_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Two-factor authentication table (for future enhancement)
CREATE TABLE IF NOT EXISTS two_factor_auth (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    secret VARCHAR(255) NOT NULL,
    backup_codes JSON,
    enabled BOOLEAN DEFAULT FALSE,
    last_used TIMESTAMP NULL,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_enabled (enabled),
    
    -- Constraints
    UNIQUE KEY uk_user_2fa (user_id),
    
    -- Foreign keys
    CONSTRAINT fk_2fa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Security settings table
CREATE TABLE IF NOT EXISTS security_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    
    -- Indexes
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_active (is_active),
    
    -- Foreign keys
    CONSTRAINT fk_security_settings_updater FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default security settings
INSERT IGNORE INTO security_settings (setting_key, setting_value, description) VALUES
('max_login_attempts', '5', 'Maximum failed login attempts before account lockout'),
('lockout_duration', '900', 'Account lockout duration in seconds (15 minutes)'),
('session_timeout', '1440', 'Session timeout in minutes (24 hours)'),
('password_min_length', '8', 'Minimum password length'),
('password_require_uppercase', '1', 'Require uppercase letters in password'),
('password_require_lowercase', '1', 'Require lowercase letters in password'),
('password_require_numbers', '1', 'Require numbers in password'),
('password_require_symbols', '1', 'Require special characters in password'),
('password_history_count', '5', 'Number of previous passwords to remember'),
('force_password_change_days', '90', 'Force password change after X days'),
('enable_2fa', '0', 'Enable two-factor authentication'),
('enable_email_verification', '0', 'Require email verification for new accounts'),
('enable_remember_me', '1', 'Allow remember me functionality'),
('remember_me_duration', '2592000', 'Remember me duration in seconds (30 days)'),
('enable_rate_limiting', '1', 'Enable rate limiting for sensitive operations'),
('enable_ip_whitelist', '0', 'Enable IP address whitelisting'),
('allowed_ip_addresses', '', 'Comma-separated list of allowed IP addresses'),
('enable_geo_blocking', '0', 'Enable geographic blocking'),
('blocked_countries', '', 'Comma-separated list of blocked country codes'),
('enable_device_tracking', '1', 'Track user devices for security'),
('max_concurrent_sessions', '3', 'Maximum concurrent sessions per user'),
('enable_security_notifications', '1', 'Send security-related notifications'),
('enable_login_notifications', '0', 'Send notifications on every login'),
('suspicious_activity_threshold', '10', 'Threshold for suspicious activity detection');

-- User device tracking table
CREATE TABLE IF NOT EXISTS user_devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    device_fingerprint VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    ip_address VARCHAR(45),
    location VARCHAR(255),
    is_trusted BOOLEAN DEFAULT FALSE,
    last_used TIMESTAMP NULL,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_device_fingerprint (device_fingerprint),
    INDEX idx_is_trusted (is_trusted),
    INDEX idx_last_used (last_used),
    INDEX idx_ip_address (ip_address),
    
    -- Constraints
    UNIQUE KEY uk_user_device (user_id, device_fingerprint),
    
    -- Foreign keys
    CONSTRAINT fk_user_device_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Active sessions table
CREATE TABLE IF NOT EXISTS active_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Session data
    session_data LONGTEXT,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_last_activity (last_activity),
    INDEX idx_expires_at (expires_at),
    INDEX idx_ip_address (ip_address),
    INDEX idx_device_fingerprint (device_fingerprint),
    
    -- Foreign keys
    CONSTRAINT fk_active_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Security events log table
CREATE TABLE IF NOT EXISTS security_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_type VARCHAR(100) NOT NULL,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    event_data JSON,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    resolved_by INT,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_event_type (event_type),
    INDEX idx_user_id (user_id),
    INDEX idx_ip_address (ip_address),
    INDEX idx_severity (severity),
    INDEX idx_resolved (resolved),
    INDEX idx_created_at (created_at),
    
    -- Foreign keys
    CONSTRAINT fk_security_event_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_security_event_resolver FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- IP whitelist table
CREATE TABLE IF NOT EXISTS ip_whitelist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    ip_range VARCHAR(50),
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    
    -- Indexes
    INDEX idx_ip_address (ip_address),
    INDEX idx_is_active (is_active),
    
    -- Constraints
    UNIQUE KEY uk_ip_address (ip_address),
    
    -- Foreign keys
    CONSTRAINT fk_ip_whitelist_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- IP blacklist table
CREATE TABLE IF NOT EXISTS ip_blacklist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    ip_range VARCHAR(50),
    reason VARCHAR(255),
    blocked_until TIMESTAMP NULL,
    is_permanent BOOLEAN DEFAULT FALSE,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    
    -- Indexes
    INDEX idx_ip_address (ip_address),
    INDEX idx_blocked_until (blocked_until),
    INDEX idx_is_permanent (is_permanent),
    
    -- Constraints
    UNIQUE KEY uk_ip_address (ip_address),
    
    -- Foreign keys
    CONSTRAINT fk_ip_blacklist_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clean up old records procedures
DELIMITER //

-- Clean up old login attempts (older than 24 hours)
CREATE EVENT IF NOT EXISTS cleanup_login_attempts
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM login_attempts 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
END//

-- Clean up expired password reset tokens
CREATE EVENT IF NOT EXISTS cleanup_password_reset_tokens
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() OR used = TRUE;
END//

-- Clean up expired email verification tokens
CREATE EVENT IF NOT EXISTS cleanup_email_verification_tokens
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM email_verification_tokens 
    WHERE expires_at < NOW() OR verified = TRUE;
END//

-- Clean up expired sessions
CREATE EVENT IF NOT EXISTS cleanup_expired_sessions
ON SCHEDULE EVERY 30 MINUTE
DO
BEGIN
    DELETE FROM active_sessions 
    WHERE expires_at < NOW();
END//

-- Clean up old security events (older than 90 days)
CREATE EVENT IF NOT EXISTS cleanup_security_events
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    DELETE FROM security_events 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY) 
    AND severity IN ('low', 'medium');
END//

DELIMITER ;

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;