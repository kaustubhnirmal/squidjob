<?php
/**
 * NotificationQueueManager
 * SquidJob Tender Management System
 * 
 * Advanced queue management for notifications:
 * - Smart batching and grouping
 * - Priority-based queuing
 * - Retry logic and error handling
 * - Scheduled delivery
 * - Rate limiting and throttling
 * - Queue monitoring and analytics
 */

class NotificationQueueManager
{
    private $db;
    private $config;
    private $redis;
    private $batchProcessor;
    private $rateLimiter;
    
    public function __construct($config = [])
    {
        $this->config = $config;
        $this->db = $config['database'] ?? null;
        $this->redis = $config['redis'] ?? null;
        $this->batchProcessor = new BatchProcessor($config['batch'] ?? []);
        $this->rateLimiter = new RateLimiter($config['rate_limit'] ?? []);
    }
    
    /**
     * Add notification to queue
     */
    public function addToQueue($notification, $priority = 'normal', $scheduledTime = null)
    {
        try {
            $queueItem = [
                'id' => $this->generateQueueId(),
                'notification' => $notification,
                'priority' => $priority,
                'scheduled_time' => $scheduledTime ?? time(),
                'created_at' => time(),
                'status' => 'pending',
                'retry_count' => 0,
                'max_retries' => $this->getMaxRetries($priority),
                'channels' => $notification['channels'] ?? ['in_app'],
                'recipients' => $notification['recipients'] ?? []
            ];
            
            // Add to appropriate queue based on priority
            $this->addToPriorityQueue($queueItem);
            
            // Log queue addition
            $this->logQueueEvent('added', $queueItem);
            
            return [
                'success' => true,
                'queue_id' => $queueItem['id'],
                'estimated_delivery' => $this->estimateDeliveryTime($queueItem)
            ];
            
        } catch (Exception $e) {
            error_log('Queue Add Error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    /**
     * Add notification to batch
     */
    public function addToBatch($type, $recipients, $data, $optimalTiming)
    {
        try {
            $batchKey = $this->generateBatchKey($type, $recipients);
            
            $batchItem = [
                'type' => $type,
                'recipients' => $recipients,
                'data' => $data,
                'optimal_timing' => $optimalTiming,
                'created_at' => time(),
                'batch_size' => count($recipients)
            ];
            
            // Add to batch queue
            $this->addToBatchQueue($batchKey, $batchItem);
            
            // Check if batch should be processed
            $this->checkBatchProcessing($batchKey);
            
            return [
                'success' => true,
                'batch_key' => $batchKey,
                'batch_size' => count($recipients)
            ];
            
        } catch (Exception $e) {
            error_log('Batch Add Error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    /**
     * Schedule notification for later delivery
     */
    public function scheduleNotification($channel, $recipient, $notification, $deliveryTime)
    {
        try {
            $scheduledItem = [
                'id' => $this->generateQueueId(),
                'channel' => $channel,
                'recipient' => $recipient,
                'notification' => $notification,
                'scheduled_time' => $deliveryTime,
                'created_at' => time(),
                'status' => 'scheduled',
                'retry_count' => 0,
                'max_retries' => $this->getMaxRetries('normal')
            ];
            
            // Add to scheduled queue
            $this->addToScheduledQueue($scheduledItem);
            
            return [
                'success' => true,
                'scheduled_id' => $scheduledItem['id'],
                'delivery_time' => $deliveryTime
            ];
            
        } catch (Exception $e) {
            error_log('Schedule Error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    /**
     * Process queue items
     */
    public function processQueue()
    {
        try {
            $processedCount = 0;
            $errorCount = 0;
            
            // Process high priority items first
            $highPriorityItems = $this->getQueueItems('high', 10);
            foreach ($highPriorityItems as $item) {
                $result = $this->processQueueItem($item);
                if ($result['success']) {
                    $processedCount++;
                } else {
                    $errorCount++;
                }
            }
            
            // Process normal priority items
            $normalPriorityItems = $this->getQueueItems('normal', 50);
            foreach ($normalPriorityItems as $item) {
                $result = $this->processQueueItem($item);
                if ($result['success']) {
                    $processedCount++;
                } else {
                    $errorCount++;
                }
            }
            
            // Process low priority items
            $lowPriorityItems = $this->getQueueItems('low', 20);
            foreach ($lowPriorityItems as $item) {
                $result = $this->processQueueItem($item);
                if ($result['success']) {
                    $processedCount++;
                } else {
                    $errorCount++;
                }
            }
            
            // Process scheduled items
            $scheduledItems = $this->getScheduledItems();
            foreach ($scheduledItems as $item) {
                $result = $this->processScheduledItem($item);
                if ($result['success']) {
                    $processedCount++;
                } else {
                    $errorCount++;
                }
            }
            
            // Process batches
            $this->processBatches();
            
            return [
                'success' => true,
                'processed' => $processedCount,
                'errors' => $errorCount,
                'timestamp' => time()
            ];
            
        } catch (Exception $e) {
            error_log('Queue Processing Error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    /**
     * Process individual queue item
     */
    private function processQueueItem($item)
    {
        try {
            // Check rate limits
            if (!$this->rateLimiter->checkLimit($item['recipients'], $item['channels'])) {
                return $this->rescheduleItem($item, time() + 300); // Retry in 5 minutes
            }
            
            // Attempt delivery
            $deliveryResult = $this->attemptDelivery($item);
            
            if ($deliveryResult['success']) {
                // Mark as delivered
                $this->markItemAsDelivered($item['id']);
                $this->logQueueEvent('delivered', $item);
                return ['success' => true];
            } else {
                // Handle retry logic
                return $this->handleRetry($item, $deliveryResult['error']);
            }
            
        } catch (Exception $e) {
            error_log('Queue Item Processing Error: ' . $e->getMessage());
            return $this->handleRetry($item, $e->getMessage());
        }
    }
    
    /**
     * Process scheduled item
     */
    private function processScheduledItem($item)
    {
        // Check if it's time to deliver
        if (time() >= $item['scheduled_time']) {
            return $this->processQueueItem($item);
        }
        
        return ['success' => true, 'status' => 'scheduled'];
    }
    
    /**
     * Process batches
     */
    private function processBatches()
    {
        $batches = $this->getReadyBatches();
        
        foreach ($batches as $batchKey => $batchData) {
            $result = $this->processBatch($batchKey, $batchData);
            
            if ($result['success']) {
                $this->removeBatch($batchKey);
            }
        }
    }
    
    /**
     * Process individual batch
     */
    private function processBatch($batchKey, $batchData)
    {
        try {
            // Group recipients by optimal timing
            $groupedRecipients = $this->groupRecipientsByTiming($batchData['recipients'], $batchData['optimal_timing']);
            
            $successCount = 0;
            $totalCount = count($batchData['recipients']);
            
            foreach ($groupedRecipients as $timing => $recipients) {
                // Create batched notification
                $batchedNotification = $this->createBatchedNotification($batchData['type'], $recipients, $batchData['data']);
                
                // Send to each recipient
                foreach ($recipients as $recipient) {
                    $result = $this->sendBatchedNotification($recipient, $batchedNotification, $timing);
                    if ($result['success']) {
                        $successCount++;
                    }
                }
            }
            
            return [
                'success' => $successCount > 0,
                'delivered' => $successCount,
                'total' => $totalCount
            ];
            
        } catch (Exception $e) {
            error_log('Batch Processing Error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    /**
     * Attempt delivery to all channels
     */
    private function attemptDelivery($item)
    {
        $successCount = 0;
        $totalChannels = count($item['channels']);
        $errors = [];
        
        foreach ($item['channels'] as $channel) {
            try {
                $result = $this->deliverToChannel($channel, $item['recipients'], $item['notification']);
                
                if ($result['success']) {
                    $successCount++;
                } else {
                    $errors[$channel] = $result['message'];
                }
                
            } catch (Exception $e) {
                $errors[$channel] = $e->getMessage();
            }
        }
        
        // Consider successful if at least one channel worked
        $success = $successCount > 0;
        
        return [
            'success' => $success,
            'delivered_channels' => $successCount,
            'total_channels' => $totalChannels,
            'errors' => $errors
        ];
    }
    
    /**
     * Handle retry logic
     */
    private function handleRetry($item, $error)
    {
        $item['retry_count']++;
        
        if ($item['retry_count'] >= $item['max_retries']) {
            // Max retries reached, mark as failed
            $this->markItemAsFailed($item['id'], $error);
            $this->logQueueEvent('failed', $item);
            return ['success' => false, 'status' => 'failed', 'error' => $error];
        }
        
        // Calculate retry delay
        $retryDelay = $this->calculateRetryDelay($item['retry_count'], $item['priority']);
        
        // Reschedule for retry
        return $this->rescheduleItem($item, time() + $retryDelay);
    }
    
    /**
     * Get pending similar notifications for batching
     */
    public function getPendingSimilarNotifications($type, $recipients)
    {
        try {
            $sql = "
                SELECT COUNT(*) as count
                FROM notification_queue
                WHERE notification_type = ?
                AND status = 'pending'
                AND created_at > ?
                AND JSON_OVERLAPS(recipients, ?)
            ";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $type,
                time() - 3600, // Last hour
                json_encode($recipients)
            ]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['count'] ?? 0;
            
        } catch (Exception $e) {
            error_log('Get Pending Similar Error: ' . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Get queue statistics
     */
    public function getQueueStats()
    {
        try {
            $stats = [
                'pending' => $this->getQueueCount('pending'),
                'processing' => $this->getQueueCount('processing'),
                'delivered' => $this->getQueueCount('delivered'),
                'failed' => $this->getQueueCount('failed'),
                'scheduled' => $this->getScheduledCount(),
                'batches' => $this->getBatchCount(),
                'avg_delivery_time' => $this->getAverageDeliveryTime(),
                'success_rate' => $this->getSuccessRate()
            ];
            
            return $stats;
            
        } catch (Exception $e) {
            error_log('Queue Stats Error: ' . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Clean up old queue items
     */
    public function cleanupQueue($daysOld = 30)
    {
        try {
            $cutoffTime = time() - ($daysOld * 24 * 3600);
            
            $sql = "
                DELETE FROM notification_queue
                WHERE created_at < ?
                AND status IN ('delivered', 'failed')
            ";
            
            $stmt = $this->db->prepare($sql);
            $deletedCount = $stmt->execute([$cutoffTime]);
            
            return [
                'success' => true,
                'deleted_count' => $deletedCount
            ];
            
        } catch (Exception $e) {
            error_log('Queue Cleanup Error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    // Private helper methods
    
    private function generateQueueId()
    {
        return 'nq_' . time() . '_' . rand(1000, 9999);
    }
    
    private function generateBatchKey($type, $recipients)
    {
        return 'batch_' . $type . '_' . md5(implode(',', $recipients)) . '_' . time();
    }
    
    private function getMaxRetries($priority)
    {
        $retryLimits = [
            'high' => 5,
            'normal' => 3,
            'low' => 1
        ];
        
        return $retryLimits[$priority] ?? 3;
    }
    
    private function calculateRetryDelay($retryCount, $priority)
    {
        $baseDelays = [
            'high' => 60,    // 1 minute
            'normal' => 300,  // 5 minutes
            'low' => 900      // 15 minutes
        ];
        
        $baseDelay = $baseDelays[$priority] ?? 300;
        return $baseDelay * pow(2, $retryCount - 1); // Exponential backoff
    }
    
    private function estimateDeliveryTime($queueItem)
    {
        $baseTime = time();
        
        // Add priority-based delay
        $priorityDelays = [
            'high' => 0,
            'normal' => 60,
            'low' => 300
        ];
        
        $delay = $priorityDelays[$queueItem['priority']] ?? 60;
        return $baseTime + $delay;
    }
    
    private function addToPriorityQueue($item)
    {
        $queueName = 'notification_queue_' . $item['priority'];
        
        if ($this->redis) {
            $this->redis->lpush($queueName, json_encode($item));
        } else {
            // Fallback to database
            $this->addToDatabaseQueue($item);
        }
    }
    
    private function addToBatchQueue($batchKey, $batchData)
    {
        if ($this->redis) {
            $this->redis->hset('notification_batches', $batchKey, json_encode($batchData));
        } else {
            $this->addToDatabaseBatch($batchKey, $batchData);
        }
    }
    
    private function addToScheduledQueue($item)
    {
        if ($this->redis) {
            $this->redis->zadd('scheduled_notifications', $item['scheduled_time'], json_encode($item));
        } else {
            $this->addToDatabaseScheduled($item);
        }
    }
    
    private function getQueueItems($priority, $limit)
    {
        $queueName = 'notification_queue_' . $priority;
        
        if ($this->redis) {
            $items = $this->redis->lrange($queueName, 0, $limit - 1);
            return array_map('json_decode', $items);
        } else {
            return $this->getDatabaseQueueItems($priority, $limit);
        }
    }
    
    private function getScheduledItems()
    {
        if ($this->redis) {
            $items = $this->redis->zrangebyscore('scheduled_notifications', 0, time());
            return array_map('json_decode', $items);
        } else {
            return $this->getDatabaseScheduledItems();
        }
    }
    
    private function getReadyBatches()
    {
        if ($this->redis) {
            $batches = $this->redis->hgetall('notification_batches');
            $readyBatches = [];
            
            foreach ($batches as $key => $data) {
                $batchData = json_decode($data, true);
                if ($this->isBatchReady($batchData)) {
                    $readyBatches[$key] = $batchData;
                }
            }
            
            return $readyBatches;
        } else {
            return $this->getDatabaseReadyBatches();
        }
    }
    
    private function isBatchReady($batchData)
    {
        // Check if batch has enough items or time has passed
        $batchAge = time() - $batchData['created_at'];
        $minBatchAge = 300; // 5 minutes
        
        return $batchAge >= $minBatchAge;
    }
    
    private function groupRecipientsByTiming($recipients, $optimalTiming)
    {
        $grouped = [];
        
        foreach ($recipients as $recipient) {
            $timing = $optimalTiming[$recipient] ?? time();
            $grouped[$timing][] = $recipient;
        }
        
        return $grouped;
    }
    
    private function createBatchedNotification($type, $recipients, $data)
    {
        return [
            'type' => $type,
            'title' => $this->generateBatchTitle($type, count($recipients)),
            'message' => $this->generateBatchMessage($type, $recipients, $data),
            'recipients' => $recipients,
            'data' => $data,
            'is_batched' => true
        ];
    }
    
    private function generateBatchTitle($type, $recipientCount)
    {
        $titles = [
            'tender_updates' => "{$recipientCount} Tender Updates",
            'document_uploads' => "{$recipientCount} New Documents",
            'status_changes' => "{$recipientCount} Status Updates"
        ];
        
        return $titles[$type] ?? "{$recipientCount} Updates";
    }
    
    private function generateBatchMessage($type, $recipients, $data)
    {
        return "You have {$recipientCount} new updates that require your attention.";
    }
    
    // Placeholder methods for external integrations
    private function deliverToChannel($channel, $recipients, $notification) { return ['success' => true]; }
    private function sendBatchedNotification($recipient, $notification, $timing) { return ['success' => true]; }
    private function logQueueEvent($event, $item) { /* Log to monitoring system */ }
    private function markItemAsDelivered($id) { /* Update database */ }
    private function markItemAsFailed($id, $error) { /* Update database */ }
    private function rescheduleItem($item, $newTime) { return ['success' => true]; }
    private function removeBatch($batchKey) { /* Remove from queue */ }
    private function checkBatchProcessing($batchKey) { /* Check if batch should be processed */ }
    
    // Database fallback methods
    private function addToDatabaseQueue($item) { /* Add to database queue */ }
    private function addToDatabaseBatch($key, $data) { /* Add to database batch */ }
    private function addToDatabaseScheduled($item) { /* Add to database scheduled */ }
    private function getDatabaseQueueItems($priority, $limit) { return []; }
    private function getDatabaseScheduledItems() { return []; }
    private function getDatabaseReadyBatches() { return []; }
    private function getQueueCount($status) { return 0; }
    private function getScheduledCount() { return 0; }
    private function getBatchCount() { return 0; }
    private function getAverageDeliveryTime() { return 0; }
    private function getSuccessRate() { return 0.95; }
}

/**
 * BatchProcessor - Handles notification batching logic
 */
class BatchProcessor
{
    private $config;
    
    public function __construct($config = [])
    {
        $this->config = $config;
    }
    
    public function shouldBatch($type, $recipients, $data)
    {
        // Check if notification type is batchable
        $batchableTypes = ['tender_updates', 'document_uploads', 'status_changes'];
        
        if (!in_array($type, $batchableTypes)) {
            return false;
        }
        
        // Check recipient count
        if (count($recipients) < 3) {
            return false;
        }
        
        // Check priority
        $priority = $this->calculatePriority($type, $data);
        if ($priority > 70) {
            return false; // Don't batch high priority notifications
        }
        
        return true;
    }
}

/**
 * RateLimiter - Handles rate limiting for notifications
 */
class RateLimiter
{
    private $config;
    private $redis;
    
    public function __construct($config = [])
    {
        $this->config = $config;
        $this->redis = $config['redis'] ?? null;
    }
    
    public function checkLimit($recipients, $channels)
    {
        $limits = [
            'email' => ['per_hour' => 100, 'per_day' => 1000],
            'sms' => ['per_hour' => 50, 'per_day' => 500],
            'push' => ['per_hour' => 200, 'per_day' => 2000],
            'in_app' => ['per_hour' => 500, 'per_day' => 5000]
        ];
        
        foreach ($channels as $channel) {
            $limit = $limits[$channel] ?? ['per_hour' => 100, 'per_day' => 1000];
            
            if (!$this->checkChannelLimit($channel, $limit)) {
                return false;
            }
        }
        
        return true;
    }
    
    private function checkChannelLimit($channel, $limit)
    {
        $hourKey = "rate_limit:{$channel}:hour:" . date('Y-m-d-H');
        $dayKey = "rate_limit:{$channel}:day:" . date('Y-m-d');
        
        if ($this->redis) {
            $hourCount = $this->redis->get($hourKey) ?? 0;
            $dayCount = $this->redis->get($dayKey) ?? 0;
            
            if ($hourCount >= $limit['per_hour'] || $dayCount >= $limit['per_day']) {
                return false;
            }
            
            $this->redis->incr($hourKey);
            $this->redis->incr($dayKey);
            $this->redis->expire($hourKey, 3600);
            $this->redis->expire($dayKey, 86400);
        }
        
        return true;
    }
} 