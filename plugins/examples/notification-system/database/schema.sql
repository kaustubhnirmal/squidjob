-- Notification System Plugin Database Schema
-- SquidJob Tender Management System

-- Plugin settings table (if not exists in main schema)
CREATE TABLE IF NOT EXISTS plugin_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plugin_name VARCHAR(100) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_plugin_setting (plugin_name, setting_key),
    INDEX idx_plugin_name (plugin_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification queue for batch processing
CREATE TABLE IF NOT EXISTS notification_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    status ENUM('pending', 'processing', 'sent', 'failed') DEFAULT 'pending',
    priority TINYINT DEFAULT 5,
    attempts TINYINT DEFAULT 0,
    max_attempts TINYINT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    error_message TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status_scheduled (status, scheduled_at),
    INDEX idx_user_type (user_id, type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification templates for different types
CREATE TABLE IF NOT EXISTS notification_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    subject_template VARCHAR(255) NOT NULL,
    email_template TEXT,
    sms_template VARCHAR(160),
    in_app_template TEXT,
    variables JSON COMMENT 'Available template variables',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON SET NULL,
    INDEX idx_type_active (type, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    frequency ENUM('immediate', 'hourly', 'daily', 'weekly') DEFAULT 'immediate',
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_notification_type (user_id, notification_type),
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default notification templates
INSERT INTO notification_templates (type, name, subject_template, email_template, sms_template, in_app_template, variables) VALUES
('tender_created', 'Tender Created', 'New Tender: {{tender_title}}', 
 '<h2>New Tender Created</h2><p>A new tender "{{tender_title}}" has been created.</p><p><strong>Description:</strong> {{tender_description}}</p><p><a href="{{tender_url}}">View Tender</a></p>',
 'New tender: {{tender_title}}. View: {{tender_url}}',
 'New tender "{{tender_title}}" has been created',
 '["tender_title", "tender_description", "tender_url", "tender_deadline"]'),

('tender_updated', 'Tender Updated', 'Tender Updated: {{tender_title}}',
 '<h2>Tender Updated</h2><p>The tender "{{tender_title}}" has been updated.</p><p><a href="{{tender_url}}">View Changes</a></p>',
 'Tender updated: {{tender_title}}. View: {{tender_url}}',
 'Tender "{{tender_title}}" has been updated',
 '["tender_title", "tender_url", "changes"]'),

('tender_published', 'Tender Published', 'New Tender Available: {{tender_title}}',
 '<h2>New Tender Available for Bidding</h2><p>Tender "{{tender_title}}" is now open for bidding.</p><p><strong>Deadline:</strong> {{tender_deadline}}</p><p><a href="{{tender_url}}">Submit Your Bid</a></p>',
 'New tender open: {{tender_title}}. Deadline: {{tender_deadline}}',
 'New tender "{{tender_title}}" is open for bidding',
 '["tender_title", "tender_url", "tender_deadline", "tender_budget"]'),

('bid_submitted', 'New Bid Received', 'New Bid for: {{tender_title}}',
 '<h2>New Bid Received</h2><p>A new bid has been submitted for your tender "{{tender_title}}".</p><p><strong>Bid Amount:</strong> {{bid_amount}}</p><p><a href="{{tender_url}}">Review Bids</a></p>',
 'New bid received for {{tender_title}}. Amount: {{bid_amount}}',
 'New bid received for "{{tender_title}}"',
 '["tender_title", "tender_url", "bid_amount", "bidder_name"]'),

('bid_awarded', 'Congratulations! Bid Awarded', 'Your Bid Won: {{tender_title}}',
 '<h2>Congratulations!</h2><p>Your bid for "{{tender_title}}" has been selected!</p><p><strong>Awarded Amount:</strong> {{bid_amount}}</p><p><a href="{{tender_url}}">View Details</a></p>',
 'Congratulations! Your bid for {{tender_title}} won. Amount: {{bid_amount}}',
 'Congratulations! Your bid for "{{tender_title}}" has been selected',
 '["tender_title", "tender_url", "bid_amount"]'),

('bid_not_awarded', 'Tender Award Update', 'Tender Awarded: {{tender_title}}',
 '<h2>Tender Award Update</h2><p>The tender "{{tender_title}}" has been awarded to another bidder.</p><p>Thank you for your participation.</p>',
 'Tender {{tender_title}} has been awarded to another bidder.',
 'Tender "{{tender_title}}" has been awarded to another bidder',
 '["tender_title", "tender_url"]');

-- Insert default notification preferences for common types
INSERT INTO notification_preferences (user_id, notification_type, email_enabled, sms_enabled, in_app_enabled) 
SELECT u.id, 'tender_created', TRUE, FALSE, TRUE FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preferences np 
    WHERE np.user_id = u.id AND np.notification_type = 'tender_created'
);

INSERT INTO notification_preferences (user_id, notification_type, email_enabled, sms_enabled, in_app_enabled) 
SELECT u.id, 'tender_published', TRUE, FALSE, TRUE FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preferences np 
    WHERE np.user_id = u.id AND np.notification_type = 'tender_published'
);

INSERT INTO notification_preferences (user_id, notification_type, email_enabled, sms_enabled, in_app_enabled) 
SELECT u.id, 'bid_submitted', TRUE, TRUE, TRUE FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preferences np 
    WHERE np.user_id = u.id AND np.notification_type = 'bid_submitted'
);

INSERT INTO notification_preferences (user_id, notification_type, email_enabled, sms_enabled, in_app_enabled) 
SELECT u.id, 'bid_awarded', TRUE, TRUE, TRUE FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preferences np 
    WHERE np.user_id = u.id AND np.notification_type = 'bid_awarded'
);