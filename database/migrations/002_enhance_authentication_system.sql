-- Enhanced Authentication System Migration
-- SquidJob Tender Management System
-- 
-- Adds comprehensive security features and enhancements to the authentication system

-- ============================================================================
-- ENHANCED USERS TABLE MODIFICATIONS
-- ============================================================================

-- Add additional security columns to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE AFTER remember_token,
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255) NULL AFTER two_factor_enabled,
ADD COLUMN IF NOT EXISTS two_factor_recovery_codes JSON NULL AFTER two_factor_secret,
ADD COLUMN IF NOT EXISTS login_attempts INT DEFAULT 0 AFTER two_factor_recovery_codes,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL AFTER login_attempts,
ADD COLUMN IF NOT EXISTS password_expires_at TIMESTAMP NULL AFTER password_changed_at,
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE AFTER password_expires_at,
ADD COLUMN IF NOT EXISTS last_password_change_reminder TIMESTAMP NULL AFTER must_change_password,
ADD COLUMN IF NOT EXISTS security_questions JSON NULL AFTER last_password_change_reminder,
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en' AFTER security_questions,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC' AFTER preferred_language,
ADD COLUMN IF NOT EXISTS login_notifications BOOLEAN DEFAULT TRUE AFTER timezone,
ADD COLUMN IF NOT EXISTS security_notifications BOOLEAN DEFAULT TRUE AFTER login_notifications;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_two_factor ON users(two_factor_enabled);
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);
CREATE INDEX IF NOT EXISTS idx_users_password_expires ON users(password_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_must_change_password ON users(must_change_password);

-- ============================================================================
-- USER SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    platform VARCHAR(100),
    location VARCHAR(255),
    
    -- Session data
    payload LONGTEXT NOT NULL,
    last_activity INT NOT NULL,
    
    -- Security flags
    is_current BOOLEAN DEFAULT FALSE,
    is_trusted BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_user_sessions_user_id (user_id),
    INDEX idx_user_sessions_last_activity (last_activity),
    INDEX idx_user_sessions_expires_at (expires_at),
    INDEX idx_user_sessions_is_current (is_current),
    
    -- Foreign keys
    CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PASSWORD HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS password_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    
    -- Indexes
    INDEX idx_password_history_user_id (user_id),
    INDEX idx_password_history_created_at (created_at),
    
    -- Foreign keys
    CONSTRAINT fk_password_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_password_history_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SECURITY EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Event details
    event_type VARCHAR(100) NOT NULL,
    event_category ENUM('authentication', 'authorization', 'account', 'security', 'system') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    
    -- User and context
    user_id INT,
    affected_user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Event data
    event_data JSON,
    description TEXT,
    
    -- Status and resolution
    status ENUM('open', 'investigating', 'resolved', 'false_positive') DEFAULT 'open',
    resolved_at TIMESTAMP NULL,
    resolved_by INT,
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_security_events_type (event_type),
    INDEX idx_security_events_category (event_category),
    INDEX idx_security_events_severity (severity),
    INDEX idx_security_events_user_id (user_id),
    INDEX idx_security_events_affected_user (affected_user_id),
    INDEX idx_security_events_ip (ip_address),
    INDEX idx_security_events_created_at (created_at),
    INDEX idx_security_events_status (status),
    
    -- Foreign keys
    CONSTRAINT fk_security_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_security_events_affected_user FOREIGN KEY (affected_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_security_events_resolver FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TRUSTED DEVICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS trusted_devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    
    -- Device identification
    device_fingerprint VARCHAR(255) NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    platform VARCHAR(100),
    
    -- Trust details
    trusted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    
    -- Location and IP
    ip_address VARCHAR(45),
    location VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    revoked_at TIMESTAMP NULL,
    revoked_by INT,
    revoke_reason VARCHAR(255),
    
    -- Indexes
    INDEX idx_trusted_devices_user_id (user_id),
    INDEX idx_trusted_devices_fingerprint (device_fingerprint),
    INDEX idx_trusted_devices_is_active (is_active),
    INDEX idx_trusted_devices_expires_at (expires_at),
    
    -- Unique constraint
    UNIQUE KEY uk_user_device (user_id, device_fingerprint),
    
    -- Foreign keys
    CONSTRAINT fk_trusted_devices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_trusted_devices_revoker FOREIGN KEY (revoked_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- EMAIL VERIFICATION TOKENS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    
    -- Token details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    
    -- Verification details
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Indexes
    INDEX idx_email_verification_user_id (user_id),
    INDEX idx_email_verification_token (token),
    INDEX idx_email_verification_expires_at (expires_at),
    INDEX idx_email_verification_email (email),
    
    -- Foreign keys
    CONSTRAINT fk_email_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SYSTEM SECURITY SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    
    -- Metadata
    description TEXT,
    category VARCHAR(50),
    is_system BOOLEAN DEFAULT FALSE,
    is_encrypted BOOLEAN DEFAULT FALSE,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    
    -- Indexes
    INDEX idx_security_settings_category (category),
    INDEX idx_security_settings_is_system (is_system),
    
    -- Foreign keys
    CONSTRAINT fk_security_settings_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERT DEFAULT SECURITY SETTINGS
-- ============================================================================

INSERT IGNORE INTO security_settings (setting_key, setting_value, setting_type, description, category, is_system) VALUES
('max_login_attempts', '5', 'integer', 'Maximum failed login attempts before account lockout', 'authentication', TRUE),
('lockout_duration', '900', 'integer', 'Account lockout duration in seconds (15 minutes)', 'authentication', TRUE),
('password_min_length', '8', 'integer', 'Minimum password length requirement', 'password_policy', TRUE),
('password_require_uppercase', 'true', 'boolean', 'Require at least one uppercase letter', 'password_policy', TRUE),
('password_require_lowercase', 'true', 'boolean', 'Require at least one lowercase letter', 'password_policy', TRUE),
('password_require_numbers', 'true', 'boolean', 'Require at least one number', 'password_policy', TRUE),
('password_require_symbols', 'true', 'boolean', 'Require at least one special character', 'password_policy', TRUE),
('password_history_count', '5', 'integer', 'Number of previous passwords to remember', 'password_policy', TRUE),
('password_expiry_days', '90', 'integer', 'Password expiry in days (0 = never expires)', 'password_policy', TRUE),
('session_timeout', '1440', 'integer', 'Session timeout in minutes (24 hours)', 'session', TRUE),
('remember_me_duration', '2592000', 'integer', 'Remember me duration in seconds (30 days)', 'session', TRUE),
('two_factor_enabled', 'false', 'boolean', 'Enable two-factor authentication system-wide', 'two_factor', TRUE),
('trusted_device_duration', '7776000', 'integer', 'Trusted device duration in seconds (90 days)', 'trusted_devices', TRUE),
('email_verification_required', 'false', 'boolean', 'Require email verification for new accounts', 'registration', TRUE),
('registration_enabled', 'true', 'boolean', 'Allow new user registration', 'registration', TRUE),
('login_notification_enabled', 'true', 'boolean', 'Send email notifications for new logins', 'notifications', TRUE),
('security_notification_enabled', 'true', 'boolean', 'Send email notifications for security events', 'notifications', TRUE);

-- ============================================================================
-- CREATE STORED PROCEDURES FOR SECURITY OPERATIONS
-- ============================================================================

DELIMITER //

-- Procedure to clean up expired tokens and sessions
CREATE PROCEDURE IF NOT EXISTS CleanupSecurityData()
BEGIN
    -- Clean up expired password reset tokens
    UPDATE users 
    SET password_reset_token = NULL, password_reset_expires = NULL 
    WHERE password_reset_expires < NOW();
    
    -- Clean up expired email verification tokens
    DELETE FROM email_verification_tokens 
    WHERE expires_at < NOW() AND used_at IS NULL;
    
    -- Clean up old login attempts (older than 7 days)
    DELETE FROM login_attempts 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
    
    -- Clean up expired user sessions
    DELETE FROM user_sessions 
    WHERE expires_at < NOW();
    
    -- Clean up old password history (keep only last 10 per user)
    DELETE ph1 FROM password_history ph1
    INNER JOIN (
        SELECT user_id, id,
               ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
        FROM password_history
    ) ph2 ON ph1.id = ph2.id
    WHERE ph2.rn > 10;
    
    -- Clean up resolved security events older than 1 year
    DELETE FROM security_events 
    WHERE status = 'resolved' AND resolved_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    -- Clean up expired trusted devices
    UPDATE trusted_devices 
    SET is_active = FALSE, revoked_at = NOW(), revoke_reason = 'Expired'
    WHERE expires_at < NOW() AND is_active = TRUE;
END //

-- Procedure to check password strength
CREATE PROCEDURE IF NOT EXISTS CheckPasswordStrength(
    IN p_password TEXT,
    OUT p_score INT,
    OUT p_feedback JSON
)
BEGIN
    DECLARE v_length_score INT DEFAULT 0;
    DECLARE v_complexity_score INT DEFAULT 0;
    DECLARE v_feedback JSON DEFAULT JSON_ARRAY();
    
    -- Check length
    IF CHAR_LENGTH(p_password) >= 8 THEN
        SET v_length_score = 25;
    ELSE
        SET v_feedback = JSON_ARRAY_APPEND(v_feedback, '$', 'Password must be at least 8 characters long');
    END IF;
    
    -- Check for uppercase
    IF p_password REGEXP '[A-Z]' THEN
        SET v_complexity_score = v_complexity_score + 25;
    ELSE
        SET v_feedback = JSON_ARRAY_APPEND(v_feedback, '$', 'Password must contain at least one uppercase letter');
    END IF;
    
    -- Check for lowercase
    IF p_password REGEXP '[a-z]' THEN
        SET v_complexity_score = v_complexity_score + 25;
    ELSE
        SET v_feedback = JSON_ARRAY_APPEND(v_feedback, '$', 'Password must contain at least one lowercase letter');
    END IF;
    
    -- Check for numbers
    IF p_password REGEXP '[0-9]' THEN
        SET v_complexity_score = v_complexity_score + 25;
    ELSE
        SET v_feedback = JSON_ARRAY_APPEND(v_feedback, '$', 'Password must contain at least one number');
    END IF;
    
    -- Check for special characters
    IF p_password REGEXP '[^A-Za-z0-9]' THEN
        SET v_complexity_score = v_complexity_score + 25;
    ELSE
        SET v_feedback = JSON_ARRAY_APPEND(v_feedback, '$', 'Password must contain at least one special character');
    END IF;
    
    SET p_score = v_length_score + v_complexity_score;
    SET p_feedback = v_feedback;
END //

DELIMITER ;

-- ============================================================================
-- CREATE EVENTS FOR AUTOMATED CLEANUP
-- ============================================================================

-- Create event to run cleanup daily at 2 AM (if event scheduler is enabled)
-- SET GLOBAL event_scheduler = ON;

-- CREATE EVENT IF NOT EXISTS daily_security_cleanup
-- ON SCHEDULE EVERY 1 DAY
-- STARTS TIMESTAMP(CURRENT_DATE + INTERVAL 1 DAY, '02:00:00')
-- DO CALL CleanupSecurityData();

-- ============================================================================
-- CREATE VIEWS FOR SECURITY MONITORING
-- ============================================================================

-- View for active user sessions
CREATE OR REPLACE VIEW active_user_sessions AS
SELECT 
    us.id as session_id,
    u.id as user_id,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) as full_name,
    us.ip_address,
    us.device_type,
    us.browser,
    us.platform,
    us.location,
    us.is_current,
    us.is_trusted,
    FROM_UNIXTIME(us.last_activity) as last_activity,
    us.created_at,
    us.expires_at
FROM user_sessions us
INNER JOIN users u ON us.user_id = u.id
WHERE us.expires_at > NOW() OR us.expires_at IS NULL
ORDER BY us.last_activity DESC;

-- View for recent security events
CREATE OR REPLACE VIEW recent_security_events AS
SELECT 
    se.id,
    se.event_type,
    se.event_category,
    se.severity,
    u.email as user_email,
    CONCAT(u.first_name, ' ', u.last_name) as user_name,
    au.email as affected_user_email,
    se.ip_address,
    se.description,
    se.status,
    se.created_at
FROM security_events se
LEFT JOIN users u ON se.user_id = u.id
LEFT JOIN users au ON se.affected_user_id = au.id
WHERE se.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY se.created_at DESC;

-- View for user login statistics
CREATE OR REPLACE VIEW user_login_stats AS
SELECT 
    u.id,
    u.email,
    CONCAT(u.first_name, ' ', u.last_name) as full_name,
    u.last_login,
    u.login_attempts,
    u.locked_until,
    COUNT(DISTINCT us.id) as active_sessions,
    COUNT(DISTINCT td.id) as trusted_devices,
    u.two_factor_enabled,
    u.status
FROM users u
LEFT JOIN user_sessions us ON u.id = us.user_id AND (us.expires_at > NOW() OR us.expires_at IS NULL)
LEFT JOIN trusted_devices td ON u.id = td.user_id AND td.is_active = TRUE
GROUP BY u.id
ORDER BY u.last_login DESC;

-- ============================================================================
-- FINAL OPTIMIZATIONS
-- ============================================================================

-- Optimize tables
OPTIMIZE TABLE users;
OPTIMIZE TABLE login_attempts;
OPTIMIZE TABLE user_sessions;
OPTIMIZE TABLE password_history;
OPTIMIZE TABLE security_events;
OPTIMIZE TABLE trusted_devices;
OPTIMIZE TABLE email_verification_tokens;
OPTIMIZE TABLE security_settings;

-- Update table statistics
ANALYZE TABLE users;
ANALYZE TABLE login_attempts;
ANALYZE TABLE user_sessions;
ANALYZE TABLE password_history;
ANALYZE TABLE security_events;
ANALYZE TABLE trusted_devices;
ANALYZE TABLE email_verification_tokens;
ANALYZE TABLE security_settings;

-- Success message
SELECT 'Enhanced Authentication System Migration Completed Successfully!' as Status;