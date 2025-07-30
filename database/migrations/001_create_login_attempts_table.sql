-- Login Attempts Table Migration
-- SquidJob Tender Management System
-- 
-- Tracks failed login attempts for security and rate limiting

CREATE TABLE IF NOT EXISTS login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Attempt details
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    
    -- Attempt result
    success BOOLEAN DEFAULT FALSE,
    failure_reason VARCHAR(255),
    
    -- Lockout information
    locked_until TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_email (email),
    INDEX idx_ip_address (ip_address),
    INDEX idx_created_at (created_at),
    INDEX idx_locked_until (locked_until),
    INDEX idx_email_created (email, created_at),
    INDEX idx_ip_created (ip_address, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add cleanup procedure for old login attempts
DELIMITER //
CREATE PROCEDURE CleanupLoginAttempts()
BEGIN
    -- Delete login attempts older than 30 days
    DELETE FROM login_attempts 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
END //
DELIMITER ;

-- Create event to run cleanup daily (if event scheduler is enabled)
-- CREATE EVENT IF NOT EXISTS cleanup_login_attempts
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURRENT_TIMESTAMP
-- DO CALL CleanupLoginAttempts();