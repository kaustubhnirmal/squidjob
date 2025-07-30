<?php
/**
 * NotificationManager
 * SquidJob Tender Management System
 * 
 * Comprehensive notification system for real-time updates
 * Handles email, SMS, push notifications, and in-app notifications
 */

class NotificationManager
{
    private $db;
    private $emailConfig;
    private $smsConfig;
    private $pushConfig;
    private $templates;
    
    public function __construct($config = [])
    {
        $this->db = $config['database'] ?? null;
        $this->emailConfig = $config['email'] ?? [];
        $this->smsConfig = $config['sms'] ?? [];
        $this->pushConfig = $config['push'] ?? [];
        $this->templates = $config['templates'] ?? [];
    }
    
    /**
     * Send notification to user(s)
     */
    public function sendNotification($type, $recipients, $data, $channels = ['in_app'])
    {
        try {
            $notification = $this->createNotification($type, $data);
            $results = [];
            
            // Ensure recipients is an array
            if (!is_array($recipients)) {
                $recipients = [$recipients];
            }
            
            foreach ($recipients as $recipient) {
                $userPreferences = $this->getUserNotificationPreferences($recipient);
                $activeChannels = $this->getActiveChannels($channels, $userPreferences);
                
                foreach ($activeChannels as $channel) {
                    $result = $this->sendToChannel($channel, $recipient, $notification);
                    $results[] = [
                        'recipient' => $recipient,
                        'channel' => $channel,
                        'success' => $result['success'],
                        'message' => $result['message'] ?? null
                    ];
                }
                
                // Store in-app notification
                if (in_array('in_app', $activeChannels)) {
                    $this->storeInAppNotification($recipient, $notification);
                }
            }
            
            return [
                'success' => true,
                'results' => $results
            ];
            
        } catch (Exception $e) {
            error_log('NotificationManager Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Send tender-related notifications
     */
    public function sendTenderNotification($tenderId, $type, $data = [])
    {
        try {
            $tender = $this->getTenderDetails($tenderId);
            if (!$tender) {
                throw new Exception('Tender not found');
            }
            
            $recipients = $this->getTenderNotificationRecipients($tenderId, $type);
            $notificationData = array_merge($data, [
                'tender_id' => $tenderId,
                'tender_title' => $tender['title'],
                'tender_organization' => $tender['organization'],
                'tender_deadline' => $tender['submission_deadline']
            ]);
            
            return $this->sendNotification($type, $recipients, $notificationData);
            
        } catch (Exception $e) {
            error_log('Tender Notification Error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    /**
     * Send bid-related notifications
     */
    public function sendBidNotification($bidId, $type, $data = [])
    {
        try {
            $bid = $this->getBidDetails($bidId);
            if (!$bid) {
                throw new Exception('Bid not found');
            }
            
            $tender = $this->getTenderDetails($bid['tender_id']);
            $recipients = $this->getBidNotificationRecipients($bidId, $type);
            
            $notificationData = array_merge($data, [
                'bid_id' => $bidId,
                'tender_id' => $bid['tender_id'],
                'tender_title' => $tender['title'],
                'bidder_name' => $bid['bidder_name'],
                'bid_amount' => $bid['bid_amount'],
                'bid_status' => $bid['status']
            ]);
            
            return $this->sendNotification($type, $recipients, $notificationData);
            
        } catch (Exception $e) {
            error_log('Bid Notification Error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    /**
     * Send deadline reminders
     */
    public function sendDeadlineReminders()
    {
        try {
            $upcomingDeadlines = $this->getUpcomingDeadlines();
            $results = [];
            
            foreach ($upcomingDeadlines as $tender) {
                $hoursUntilDeadline = $this->getHoursUntilDeadline($tender['submission_deadline']);
                
                // Send reminders at 24h, 6h, and 1h before deadline
                if (in_array($hoursUntilDeadline, [24, 6, 1])) {
                    $result = $this->sendTenderNotification($tender['id'], 'deadline_reminder', [
                        'hours_remaining' => $hoursUntilDeadline
                    ]);
                    $results[] = $result;
                }
            }
            
            return [
                'success' => true,
                'reminders_sent' => count($results),
                'results' => $results
            ];
            
        } catch (Exception $e) {
            error_log('Deadline Reminder Error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    /**
     * Get user's in-app notifications
     */
    public function getUserNotifications($userId, $limit = 50, $unreadOnly = false)
    {
        try {
            $sql = "
                SELECT 
                    n.*,
                    t.title as tender_title
                FROM tender_notifications n
                LEFT JOIN tenders t ON n.tender_id = t.id
                WHERE n.user_id = ?
            ";
            
            $params = [$userId];
            
            if ($unreadOnly) {
                $sql .= " AND n.is_read = 0";
            }
            
            $sql .= " ORDER BY n.created_at DESC LIMIT ?";
            $params[] = $limit;
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log('Get User Notifications Error: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Mark notification as read
     */
    public function markAsRead($notificationId, $userId)
    {
        try {
            $sql = "
                UPDATE tender_notifications 
                SET is_read = 1, read_at = NOW() 
                WHERE id = ? AND user_id = ?
            ";
            
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([$notificationId, $userId]);
            
        } catch (Exception $e) {
            error_log('Mark as Read Error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Mark all notifications as read for user
     */
    public function markAllAsRead($userId)
    {
        try {
            $sql = "
                UPDATE tender_notifications 
                SET is_read = 1, read_at = NOW() 
                WHERE user_id = ? AND is_read = 0
            ";
            
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([$userId]);
            
        } catch (Exception $e) {
            error_log('Mark All as Read Error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get notification count for user
     */
    public function getNotificationCount($userId, $unreadOnly = true)
    {
        try {
            $sql = "
                SELECT COUNT(*) as count
                FROM tender_notifications 
                WHERE user_id = ?
            ";
            
            $params = [$userId];
            
            if ($unreadOnly) {
                $sql .= " AND is_read = 0";
            }
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['count'] ?? 0;
            
        } catch (Exception $e) {
            error_log('Get Notification Count Error: ' . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Subscribe user to tender notifications
     */
    public function subscribeTo($userId, $tenderId, $preferences = [])
    {
        try {
            $defaultPreferences = [
                'new_bids' => true,
                'deadline_reminders' => true,
                'status_changes' => true,
                'document_updates' => true
            ];
            
            $preferences = array_merge($defaultPreferences, $preferences);
            
            $sql = "
                INSERT INTO tender_watchers (tender_id, user_id, notification_preferences)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                notification_preferences = VALUES(notification_preferences)
            ";
            
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                $tenderId,
                $userId,
                json_encode($preferences)
            ]);
            
        } catch (Exception $e) {
            error_log('Subscribe Error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Unsubscribe user from tender notifications
     */
    public function unsubscribeFrom($userId, $tenderId)
    {
        try {
            $sql = "DELETE FROM tender_watchers WHERE user_id = ? AND tender_id = ?";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([$userId, $tenderId]);
            
        } catch (Exception $e) {
            error_log('Unsubscribe Error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send real-time notification via WebSocket
     */
    public function sendRealTimeNotification($userId, $notification)
    {
        try {
            // This would integrate with your WebSocket server
            // For now, we'll use Server-Sent Events (SSE) approach
            
            $eventData = [
                'type' => 'notification',
                'data' => $notification,
                'timestamp' => time()
            ];
            
            // Store in session for SSE pickup
            if (!isset($_SESSION['pending_notifications'])) {
                $_SESSION['pending_notifications'] = [];
            }
            
            if (!isset($_SESSION['pending_notifications'][$userId])) {
                $_SESSION['pending_notifications'][$userId] = [];
            }
            
            $_SESSION['pending_notifications'][$userId][] = $eventData;
            
            return true;
            
        } catch (Exception $e) {
            error_log('Real-time Notification Error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get pending real-time notifications for SSE
     */
    public function getPendingNotifications($userId)
    {
        $notifications = $_SESSION['pending_notifications'][$userId] ?? [];
        
        // Clear after retrieving
        if (isset($_SESSION['pending_notifications'][$userId])) {
            unset($_SESSION['pending_notifications'][$userId]);
        }
        
        return $notifications;
    }
    
    // Private helper methods
    
    private function createNotification($type, $data)
    {
        $template = $this->getNotificationTemplate($type);
        
        return [
            'type' => $type,
            'title' => $this->processTemplate($template['title'], $data),
            'message' => $this->processTemplate($template['message'], $data),
            'data' => $data,
            'created_at' => date('Y-m-d H:i:s')
        ];
    }
    
    private function getNotificationTemplate($type)
    {
        $templates = [
            'tender_published' => [
                'title' => 'New Tender Published',
                'message' => 'A new tender "{tender_title}" has been published by {tender_organization}.'
            ],
            'tender_updated' => [
                'title' => 'Tender Updated',
                'message' => 'The tender "{tender_title}" has been updated.'
            ],
            'tender_cancelled' => [
                'title' => 'Tender Cancelled',
                'message' => 'The tender "{tender_title}" has been cancelled.'
            ],
            'deadline_reminder' => [
                'title' => 'Tender Deadline Reminder',
                'message' => 'The tender "{tender_title}" deadline is in {hours_remaining} hours.'
            ],
            'bid_submitted' => [
                'title' => 'New Bid Submitted',
                'message' => 'A new bid has been submitted for "{tender_title}" by {bidder_name}.'
            ],
            'bid_updated' => [
                'title' => 'Bid Updated',
                'message' => 'Your bid for "{tender_title}" has been updated.'
            ],
            'bid_accepted' => [
                'title' => 'Bid Accepted',
                'message' => 'Congratulations! Your bid for "{tender_title}" has been accepted.'
            ],
            'bid_rejected' => [
                'title' => 'Bid Status Update',
                'message' => 'Your bid for "{tender_title}" status has been updated to {bid_status}.'
            ],
            'document_uploaded' => [
                'title' => 'New Document',
                'message' => 'A new document has been uploaded for "{tender_title}".'
            ]
        ];
        
        return $templates[$type] ?? [
            'title' => 'Notification',
            'message' => 'You have a new notification.'
        ];
    }
    
    private function processTemplate($template, $data)
    {
        foreach ($data as $key => $value) {
            $template = str_replace('{' . $key . '}', $value, $template);
        }
        return $template;
    }
    
    private function getUserNotificationPreferences($userId)
    {
        try {
            $sql = "
                SELECT notification_preferences 
                FROM users 
                WHERE id = ?
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$userId]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $preferences = $result['notification_preferences'] ?? '{}';
            
            return json_decode($preferences, true) ?: [];
            
        } catch (Exception $e) {
            return [];
        }
    }
    
    private function getActiveChannels($requestedChannels, $userPreferences)
    {
        $defaultPreferences = [
            'email' => true,
            'sms' => false,
            'push' => true,
            'in_app' => true
        ];
        
        $preferences = array_merge($defaultPreferences, $userPreferences);
        $activeChannels = [];
        
        foreach ($requestedChannels as $channel) {
            if ($preferences[$channel] ?? false) {
                $activeChannels[] = $channel;
            }
        }
        
        return $activeChannels;
    }
    
    private function sendToChannel($channel, $recipient, $notification)
    {
        switch ($channel) {
            case 'email':
                return $this->sendEmail($recipient, $notification);
            case 'sms':
                return $this->sendSMS($recipient, $notification);
            case 'push':
                return $this->sendPushNotification($recipient, $notification);
            case 'in_app':
                return $this->sendRealTimeNotification($recipient, $notification);
            default:
                return ['success' => false, 'message' => 'Unknown channel'];
        }
    }
    
    private function sendEmail($userId, $notification)
    {
        try {
            $user = $this->getUserDetails($userId);
            if (!$user || !$user['email']) {
                return ['success' => false, 'message' => 'User email not found'];
            }
            
            // Use your email service (PHPMailer, SendGrid, etc.)
            $subject = $notification['title'];
            $body = $this->generateEmailBody($notification);
            
            // Placeholder for actual email sending
            $emailSent = $this->sendEmailMessage($user['email'], $subject, $body);
            
            return [
                'success' => $emailSent,
                'message' => $emailSent ? 'Email sent successfully' : 'Failed to send email'
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    private function sendSMS($userId, $notification)
    {
        try {
            $user = $this->getUserDetails($userId);
            if (!$user || !$user['phone']) {
                return ['success' => false, 'message' => 'User phone not found'];
            }
            
            // Use your SMS service (Twilio, etc.)
            $message = $notification['title'] . ': ' . $notification['message'];
            
            // Placeholder for actual SMS sending
            $smsSent = $this->sendSMSMessage($user['phone'], $message);
            
            return [
                'success' => $smsSent,
                'message' => $smsSent ? 'SMS sent successfully' : 'Failed to send SMS'
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    private function sendPushNotification($userId, $notification)
    {
        try {
            // Use your push notification service (Firebase, OneSignal, etc.)
            $pushSent = $this->sendPushMessage($userId, $notification);
            
            return [
                'success' => $pushSent,
                'message' => $pushSent ? 'Push notification sent' : 'Failed to send push notification'
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    private function storeInAppNotification($userId, $notification)
    {
        try {
            $sql = "
                INSERT INTO tender_notifications (
                    tender_id, user_id, notification_type, title, message, data, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, NOW())
            ";
            
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                $notification['data']['tender_id'] ?? null,
                $userId,
                $notification['type'],
                $notification['title'],
                $notification['message'],
                json_encode($notification['data'])
            ]);
            
        } catch (Exception $e) {
            error_log('Store In-App Notification Error: ' . $e->getMessage());
            return false;
        }
    }
    
    private function getTenderNotificationRecipients($tenderId, $type)
    {
        try {
            $sql = "
                SELECT DISTINCT tw.user_id
                FROM tender_watchers tw
                WHERE tw.tender_id = ?
                AND JSON_EXTRACT(tw.notification_preferences, '$.\"{$type}\"') = true
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$tenderId]);
            
            return array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'user_id');
            
        } catch (Exception $e) {
            return [];
        }
    }
    
    private function getBidNotificationRecipients($bidId, $type)
    {
        try {
            $sql = "
                SELECT DISTINCT u.id as user_id
                FROM bids b
                JOIN tenders t ON b.tender_id = t.id
                JOIN users u ON t.created_by = u.id
                WHERE b.id = ?
                
                UNION
                
                SELECT DISTINCT tw.user_id
                FROM bids b
                JOIN tender_watchers tw ON b.tender_id = tw.tender_id
                WHERE b.id = ?
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$bidId, $bidId]);
            
            return array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'user_id');
            
        } catch (Exception $e) {
            return [];
        }
    }
    
    private function getTenderDetails($tenderId)
    {
        try {
            $sql = "SELECT * FROM tenders WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$tenderId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return null;
        }
    }
    
    private function getBidDetails($bidId)
    {
        try {
            $sql = "
                SELECT b.*, u.name as bidder_name, u.email as bidder_email
                FROM bids b
                JOIN users u ON b.bidder_id = u.id
                WHERE b.id = ?
            ";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$bidId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return null;
        }
    }
    
    private function getUserDetails($userId)
    {
        try {
            $sql = "SELECT * FROM users WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$userId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return null;
        }
    }
    
    private function getUpcomingDeadlines()
    {
        try {
            $sql = "
                SELECT * FROM tenders 
                WHERE status = 'active' 
                AND submission_deadline > NOW() 
                AND submission_deadline <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
                ORDER BY submission_deadline ASC
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }
    
    private function getHoursUntilDeadline($deadline)
    {
        $now = time();
        $deadlineTime = strtotime($deadline);
        return round(($deadlineTime - $now) / 3600);
    }
    
    private function generateEmailBody($notification)
    {
        // Generate HTML email body
        return "
            <h2>{$notification['title']}</h2>
            <p>{$notification['message']}</p>
            <hr>
            <p><small>This is an automated notification from SquidJob Tender Management System.</small></p>
        ";
    }
    
    private function sendEmailMessage($email, $subject, $body)
    {
        // Implement actual email sending logic
        return true; // Placeholder
    }
    
    private function sendSMSMessage($phone, $message)
    {
        // Implement actual SMS sending logic
        return true; // Placeholder
    }
    
    private function sendPushMessage($userId, $notification)
    {
        // Implement actual push notification logic
        return true; // Placeholder
    }
}