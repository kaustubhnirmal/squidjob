<?php
/**
 * Advanced Notification System Plugin
 * Main plugin file for SquidJob Tender Management System
 */

// Prevent direct access
if (!defined('APP_ROOT')) {
    exit('Direct access denied');
}

/**
 * Plugin initialization
 */
add_hook('app_init', 'notification_system_init', 10, 'notification-system');

function notification_system_init() {
    // Initialize notification system
    if (class_exists('NotificationSystem')) {
        NotificationSystem::getInstance()->init();
    }
}

/**
 * Notification System Class
 */
class NotificationSystem {
    
    private static $instance = null;
    private $settings = [];
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function init() {
        $this->loadSettings();
        $this->registerHooks();
    }
    
    private function loadSettings() {
        $this->settings = [
            'email_enabled' => get_plugin_setting('notification-system', 'email_enabled', true),
            'sms_enabled' => get_plugin_setting('notification-system', 'sms_enabled', false),
            'sms_api_key' => get_plugin_setting('notification-system', 'sms_api_key', ''),
            'notification_delay' => get_plugin_setting('notification-system', 'notification_delay', 0),
            'batch_size' => get_plugin_setting('notification-system', 'batch_size', 50)
        ];
    }
    
    private function registerHooks() {
        // Tender events
        add_hook('tender_created', [$this, 'onTenderCreated'], 10, 'notification-system');
        add_hook('tender_updated', [$this, 'onTenderUpdated'], 10, 'notification-system');
        add_hook('tender_published', [$this, 'onTenderPublished'], 10, 'notification-system');
        
        // Bid events
        add_hook('bid_submitted', [$this, 'onBidSubmitted'], 10, 'notification-system');
        add_hook('bid_awarded', [$this, 'onBidAwarded'], 10, 'notification-system');
        
        // User events
        add_hook('user_login', [$this, 'onUserLogin'], 10, 'notification-system');
        
        // Dashboard
        add_hook('dashboard_widgets', [$this, 'addDashboardWidget'], 10, 'notification-system');
    }
    
    /**
     * Handle tender created event
     */
    public function onTenderCreated($tender) {
        $this->queueNotification([
            'type' => 'tender_created',
            'title' => 'New Tender Created',
            'message' => "Tender '{$tender['title']}' has been created",
            'data' => $tender,
            'recipients' => $this->getSubscribedUsers('tender_created')
        ]);
        
        return $tender;
    }
    
    /**
     * Handle tender updated event
     */
    public function onTenderUpdated($tender) {
        $this->queueNotification([
            'type' => 'tender_updated',
            'title' => 'Tender Updated',
            'message' => "Tender '{$tender['title']}' has been updated",
            'data' => $tender,
            'recipients' => $this->getInterestedUsers($tender['id'])
        ]);
        
        return $tender;
    }
    
    /**
     * Handle tender published event
     */
    public function onTenderPublished($tender) {
        $this->queueNotification([
            'type' => 'tender_published',
            'title' => 'New Tender Published',
            'message' => "Tender '{$tender['title']}' is now open for bidding",
            'data' => $tender,
            'recipients' => $this->getSubscribedUsers('tender_published')
        ]);
        
        return $tender;
    }
    
    /**
     * Handle bid submitted event
     */
    public function onBidSubmitted($bid) {
        // Notify tender owner
        $this->queueNotification([
            'type' => 'bid_submitted',
            'title' => 'New Bid Received',
            'message' => "A new bid has been submitted for your tender",
            'data' => $bid,
            'recipients' => [$bid['tender_owner_id']]
        ]);
        
        return $bid;
    }
    
    /**
     * Handle bid awarded event
     */
    public function onBidAwarded($bid) {
        // Notify winning bidder
        $this->queueNotification([
            'type' => 'bid_awarded',
            'title' => 'Congratulations! Your Bid Won',
            'message' => "Your bid has been selected for the tender",
            'data' => $bid,
            'recipients' => [$bid['bidder_id']]
        ]);
        
        // Notify other bidders
        $otherBidders = $this->getOtherBidders($bid['tender_id'], $bid['bidder_id']);
        if (!empty($otherBidders)) {
            $this->queueNotification([
                'type' => 'bid_not_awarded',
                'title' => 'Tender Award Update',
                'message' => "The tender has been awarded to another bidder",
                'data' => $bid,
                'recipients' => $otherBidders
            ]);
        }
        
        return $bid;
    }
    
    /**
     * Handle user login event
     */
    public function onUserLogin($user) {
        // Check for pending notifications
        $pendingCount = $this->getPendingNotificationCount($user['id']);
        
        if ($pendingCount > 0) {
            $_SESSION['notification_count'] = $pendingCount;
        }
        
        return $user;
    }
    
    /**
     * Add dashboard widget
     */
    public function addDashboardWidget($widgets) {
        $widgets[] = [
            'id' => 'notification-system-widget',
            'title' => 'Notifications',
            'content' => $this->renderNotificationWidget(),
            'position' => 'right',
            'priority' => 5
        ];
        
        return $widgets;
    }
    
    /**
     * Queue notification for processing
     */
    private function queueNotification($notification) {
        try {
            $pdo = getDbConnection();
            
            foreach ($notification['recipients'] as $userId) {
                $stmt = $pdo->prepare("
                    INSERT INTO notification_queue 
                    (user_id, type, title, message, data, status, created_at, scheduled_at) 
                    VALUES (?, ?, ?, ?, ?, 'pending', NOW(), ?)
                ");
                
                $scheduledAt = date('Y-m-d H:i:s', strtotime("+{$this->settings['notification_delay']} minutes"));
                
                $stmt->execute([
                    $userId,
                    $notification['type'],
                    $notification['title'],
                    $notification['message'],
                    json_encode($notification['data']),
                    $scheduledAt
                ]);
            }
            
            // Process queue if no delay
            if ($this->settings['notification_delay'] == 0) {
                $this->processNotificationQueue();
            }
            
        } catch (\Exception $e) {
            error_log("Failed to queue notification: " . $e->getMessage());
        }
    }
    
    /**
     * Process notification queue
     */
    public function processNotificationQueue() {
        try {
            $pdo = getDbConnection();
            
            // Get pending notifications
            $stmt = $pdo->prepare("
                SELECT nq.*, u.email, u.phone, u.notification_preferences 
                FROM notification_queue nq
                JOIN users u ON nq.user_id = u.id
                WHERE nq.status = 'pending' 
                AND nq.scheduled_at <= NOW()
                ORDER BY nq.created_at ASC
                LIMIT ?
            ");
            
            $stmt->execute([$this->settings['batch_size']]);
            $notifications = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
            foreach ($notifications as $notification) {
                $this->sendNotification($notification);
            }
            
        } catch (\Exception $e) {
            error_log("Failed to process notification queue: " . $e->getMessage());
        }
    }
    
    /**
     * Send individual notification
     */
    private function sendNotification($notification) {
        try {
            $pdo = getDbConnection();
            $preferences = json_decode($notification['notification_preferences'], true) ?? [];
            
            $sent = false;
            
            // Send email notification
            if ($this->settings['email_enabled'] && 
                ($preferences['email'] ?? true) && 
                !empty($notification['email'])) {
                
                $sent = $this->sendEmailNotification($notification) || $sent;
            }
            
            // Send SMS notification
            if ($this->settings['sms_enabled'] && 
                ($preferences['sms'] ?? false) && 
                !empty($notification['phone'])) {
                
                $sent = $this->sendSmsNotification($notification) || $sent;
            }
            
            // Always create in-app notification
            $this->createInAppNotification($notification);
            $sent = true;
            
            // Update notification status
            $status = $sent ? 'sent' : 'failed';
            $stmt = $pdo->prepare("
                UPDATE notification_queue 
                SET status = ?, sent_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$status, $notification['id']]);
            
        } catch (\Exception $e) {
            error_log("Failed to send notification {$notification['id']}: " . $e->getMessage());
        }
    }
    
    /**
     * Send email notification
     */
    private function sendEmailNotification($notification) {
        // Implementation would use your email service
        // This is a placeholder
        return true;
    }
    
    /**
     * Send SMS notification
     */
    private function sendSmsNotification($notification) {
        // Implementation would use SMS service API
        // This is a placeholder
        return true;
    }
    
    /**
     * Create in-app notification
     */
    private function createInAppNotification($notification) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO notifications 
                (user_id, type, title, message, data, is_read, created_at) 
                VALUES (?, ?, ?, ?, ?, 0, NOW())
            ");
            
            return $stmt->execute([
                $notification['user_id'],
                $notification['type'],
                $notification['title'],
                $notification['message'],
                $notification['data']
            ]);
            
        } catch (\Exception $e) {
            error_log("Failed to create in-app notification: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get users subscribed to notification type
     */
    private function getSubscribedUsers($notificationType) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                SELECT u.id 
                FROM users u
                LEFT JOIN notification_preferences np ON u.id = np.user_id
                WHERE np.notification_type = ? AND np.enabled = 1
                OR (np.id IS NULL AND u.status = 'active')
            ");
            
            $stmt->execute([$notificationType]);
            return array_column($stmt->fetchAll(\PDO::FETCH_ASSOC), 'id');
            
        } catch (\Exception $e) {
            error_log("Failed to get subscribed users: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get users interested in specific tender
     */
    private function getInterestedUsers($tenderId) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                SELECT DISTINCT user_id 
                FROM bids 
                WHERE tender_id = ?
            ");
            
            $stmt->execute([$tenderId]);
            return array_column($stmt->fetchAll(\PDO::FETCH_ASSOC), 'user_id');
            
        } catch (\Exception $e) {
            error_log("Failed to get interested users: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get other bidders for a tender
     */
    private function getOtherBidders($tenderId, $excludeUserId) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                SELECT DISTINCT user_id 
                FROM bids 
                WHERE tender_id = ? AND user_id != ?
            ");
            
            $stmt->execute([$tenderId, $excludeUserId]);
            return array_column($stmt->fetchAll(\PDO::FETCH_ASSOC), 'user_id');
            
        } catch (\Exception $e) {
            error_log("Failed to get other bidders: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get pending notification count for user
     */
    private function getPendingNotificationCount($userId) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                SELECT COUNT(*) 
                FROM notifications 
                WHERE user_id = ? AND is_read = 0
            ");
            
            $stmt->execute([$userId]);
            return $stmt->fetchColumn();
            
        } catch (\Exception $e) {
            error_log("Failed to get pending notification count: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Render notification widget
     */
    private function renderNotificationWidget() {
        if (!auth()) {
            return '<p>Please log in to view notifications.</p>';
        }
        
        $userId = user()['id'];
        $notifications = $this->getRecentNotifications($userId, 5);
        $unreadCount = $this->getPendingNotificationCount($userId);
        
        $html = '<div class="notification-widget">';
        $html .= '<div class="notification-header">';
        $html .= '<span class="notification-count badge badge-primary">' . $unreadCount . '</span>';
        $html .= '<a href="/notifications" class="view-all">View All</a>';
        $html .= '</div>';
        
        if (empty($notifications)) {
            $html .= '<p class="no-notifications">No recent notifications</p>';
        } else {
            $html .= '<ul class="notification-list">';
            foreach ($notifications as $notification) {
                $readClass = $notification['is_read'] ? 'read' : 'unread';
                $html .= '<li class="notification-item ' . $readClass . '">';
                $html .= '<strong>' . htmlspecialchars($notification['title']) . '</strong><br>';
                $html .= '<span class="notification-message">' . htmlspecialchars($notification['message']) . '</span>';
                $html .= '<small class="notification-time">' . timeAgo($notification['created_at']) . '</small>';
                $html .= '</li>';
            }
            $html .= '</ul>';
        }
        
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Get recent notifications for user
     */
    private function getRecentNotifications($userId, $limit = 10) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                SELECT * 
                FROM notifications 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ?
            ");
            
            $stmt->execute([$userId, $limit]);
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
            
        } catch (\Exception $e) {
            error_log("Failed to get recent notifications: " . $e->getMessage());
            return [];
        }
    }
}

/**
 * Helper function to format time ago
 */
function timeAgo($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) return 'just now';
    if ($time < 3600) return floor($time/60) . ' minutes ago';
    if ($time < 86400) return floor($time/3600) . ' hours ago';
    if ($time < 2592000) return floor($time/86400) . ' days ago';
    
    return date('M j, Y', strtotime($datetime));
}