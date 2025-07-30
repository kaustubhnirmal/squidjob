<?php
/**
 * AIEngine
 * SquidJob Tender Management System
 * 
 * AI-powered engine for notification optimization:
 * - Priority scoring algorithms
 * - Content personalization
 * - Optimal timing prediction
 * - User behavior analysis
 * - Context-aware recommendations
 */

class AIEngine
{
    private $config;
    private $mlModel;
    private $userProfiles;
    private $behaviorPatterns;
    
    public function __construct($config = [])
    {
        $this->config = $config;
        $this->mlModel = $this->initializeMLModel();
        $this->userProfiles = [];
        $this->behaviorPatterns = [];
    }
    
    /**
     * Calculate AI-powered priority score
     */
    public function calculatePriorityScore($type, $data, $recipients)
    {
        $baseScore = $this->getBasePriorityScore($type);
        
        // User engagement analysis
        $engagementScore = $this->analyzeUserEngagement($recipients, $type);
        
        // Content urgency analysis
        $urgencyScore = $this->analyzeContentUrgency($data);
        
        // Business impact analysis
        $businessImpactScore = $this->analyzeBusinessImpact($data);
        
        // User behavior patterns
        $behaviorScore = $this->analyzeBehaviorPatterns($recipients, $type);
        
        // Context relevance
        $contextScore = $this->analyzeContextRelevance($data, $recipients);
        
        // Weighted combination
        $finalScore = ($baseScore * 0.25) + 
                     ($engagementScore * 0.20) + 
                     ($urgencyScore * 0.20) + 
                     ($businessImpactScore * 0.15) + 
                     ($behaviorScore * 0.10) + 
                     ($contextScore * 0.10);
        
        return min(100, max(1, $finalScore));
    }
    
    /**
     * Predict optimal delivery timing
     */
    public function predictOptimalTime($userBehavior, $type, $data)
    {
        // Analyze user's historical response patterns
        $responsePatterns = $this->analyzeResponsePatterns($userBehavior, $type);
        
        // Consider current context
        $contextFactors = $this->analyzeContextFactors($data);
        
        // Predict optimal time using ML model
        $optimalTime = $this->mlModel->predictOptimalTime($responsePatterns, $contextFactors);
        
        // Apply business rules
        $optimalTime = $this->applyBusinessRules($optimalTime, $type, $data);
        
        return $optimalTime;
    }
    
    /**
     * Generate personalized content
     */
    public function generatePersonalizedContent($type, $data, $userProfile, $userContext)
    {
        // Analyze user preferences and behavior
        $personalizationFactors = $this->analyzePersonalizationFactors($userProfile, $userContext);
        
        // Generate personalized title
        $personalizedTitle = $this->generatePersonalizedTitle($type, $data, $personalizationFactors);
        
        // Generate personalized message
        $personalizedMessage = $this->generatePersonalizedMessage($type, $data, $personalizationFactors);
        
        // Generate call-to-action
        $personalizedCTA = $this->generatePersonalizedCTA($type, $data, $personalizationFactors);
        
        return [
            'title' => $personalizedTitle,
            'message' => $personalizedMessage,
            'cta' => $personalizedCTA,
            'personalization_score' => $this->calculatePersonalizationScore($personalizationFactors)
        ];
    }
    
    /**
     * Analyze user engagement patterns
     */
    private function analyzeUserEngagement($recipients, $type)
    {
        $totalEngagement = 0;
        $recipientCount = count($recipients);
        
        foreach ($recipients as $recipient) {
            $userBehavior = $this->getUserBehavior($recipient);
            
            // Response rate to similar notifications
            $responseRate = $userBehavior['response_rates'][$type] ?? 0.5;
            
            // Click-through rate
            $clickRate = $userBehavior['click_rates'][$type] ?? 0.3;
            
            // Time spent on notification content
            $timeSpent = $userBehavior['time_spent'][$type] ?? 0;
            $timeScore = min(1, $timeSpent / 60); // Normalize to 1 minute
            
            // Engagement score calculation
            $engagementScore = ($responseRate * 0.4) + ($clickRate * 0.4) + ($timeScore * 0.2);
            $totalEngagement += $engagementScore;
        }
        
        return $totalEngagement / $recipientCount;
    }
    
    /**
     * Analyze content urgency
     */
    private function analyzeContentUrgency($data)
    {
        $urgencyScore = 50; // Base score
        
        // Deadline proximity
        if (isset($data['deadline'])) {
            $hoursUntilDeadline = $this->calculateHoursUntilDeadline($data['deadline']);
            
            if ($hoursUntilDeadline <= 1) {
                $urgencyScore += 40;
            } elseif ($hoursUntilDeadline <= 6) {
                $urgencyScore += 30;
            } elseif ($hoursUntilDeadline <= 24) {
                $urgencyScore += 20;
            } elseif ($hoursUntilDeadline <= 72) {
                $urgencyScore += 10;
            }
        }
        
        // Status changes
        if (isset($data['status'])) {
            $statusUrgency = [
                'accepted' => 30,
                'rejected' => 25,
                'cancelled' => 20,
                'pending' => 10,
                'draft' => 5
            ];
            $urgencyScore += $statusUrgency[$data['status']] ?? 0;
        }
        
        // Financial impact
        if (isset($data['bid_amount'])) {
            if ($data['bid_amount'] > 1000000) {
                $urgencyScore += 25;
            } elseif ($data['bid_amount'] > 100000) {
                $urgencyScore += 15;
            } elseif ($data['bid_amount'] > 10000) {
                $urgencyScore += 10;
            }
        }
        
        return min(100, $urgencyScore);
    }
    
    /**
     * Analyze business impact
     */
    private function analyzeBusinessImpact($data)
    {
        $impactScore = 50;
        
        // Tender value
        if (isset($data['tender_value'])) {
            if ($data['tender_value'] > 1000000) {
                $impactScore += 30;
            } elseif ($data['tender_value'] > 100000) {
                $impactScore += 20;
            } elseif ($data['tender_value'] > 10000) {
                $impactScore += 10;
            }
        }
        
        // Strategic importance
        if (isset($data['strategic_importance'])) {
            $impactScore += $data['strategic_importance'] * 20;
        }
        
        // Market opportunity
        if (isset($data['market_opportunity'])) {
            $impactScore += $data['market_opportunity'] * 15;
        }
        
        // Competitive landscape
        if (isset($data['competitor_count'])) {
            if ($data['competitor_count'] < 3) {
                $impactScore += 15;
            } elseif ($data['competitor_count'] < 10) {
                $impactScore += 10;
            }
        }
        
        return min(100, $impactScore);
    }
    
    /**
     * Analyze behavior patterns
     */
    private function analyzeBehaviorPatterns($recipients, $type)
    {
        $totalScore = 0;
        $recipientCount = count($recipients);
        
        foreach ($recipients as $recipient) {
            $userBehavior = $this->getUserBehavior($recipient);
            
            // Notification interaction patterns
            $interactionPattern = $userBehavior['interaction_patterns'][$type] ?? [];
            
            // Response time analysis
            $avgResponseTime = $interactionPattern['avg_response_time'] ?? 3600;
            $responseTimeScore = max(0, 100 - ($avgResponseTime / 60));
            
            // Engagement depth
            $engagementDepth = $interactionPattern['engagement_depth'] ?? 0.5;
            $engagementScore = $engagementDepth * 100;
            
            // Notification preferences
            $preferenceScore = $userBehavior['preferences'][$type] ?? 0.5;
            $preferenceScore = $preferenceScore * 100;
            
            // User activity level
            $activityLevel = $userBehavior['activity_level'] ?? 0.5;
            $activityScore = $activityLevel * 100;
            
            // Weighted behavior score
            $behaviorScore = ($responseTimeScore * 0.3) + 
                           ($engagementScore * 0.25) + 
                           ($preferenceScore * 0.25) + 
                           ($activityScore * 0.2);
            
            $totalScore += $behaviorScore;
        }
        
        return $totalScore / $recipientCount;
    }
    
    /**
     * Analyze context relevance
     */
    private function analyzeContextRelevance($data, $recipients)
    {
        $totalRelevance = 0;
        $recipientCount = count($recipients);
        
        foreach ($recipients as $recipient) {
            $userContext = $this->getUserContext($recipient);
            
            // Role relevance
            $roleRelevance = $this->calculateRoleRelevance($data, $userContext['role']);
            
            // Department relevance
            $departmentRelevance = $this->calculateDepartmentRelevance($data, $userContext['department']);
            
            // Geographic relevance
            $geographicRelevance = $this->calculateGeographicRelevance($data, $userContext);
            
            // Historical relevance
            $historicalRelevance = $this->calculateHistoricalRelevance($data, $recipient);
            
            // Context relevance score
            $contextScore = ($roleRelevance * 0.3) + 
                          ($departmentRelevance * 0.3) + 
                          ($geographicRelevance * 0.2) + 
                          ($historicalRelevance * 0.2);
            
            $totalRelevance += $contextScore;
        }
        
        return $totalRelevance / $recipientCount;
    }
    
    /**
     * Analyze response patterns
     */
    private function analyzeResponsePatterns($userBehavior, $type)
    {
        $patterns = [
            'avg_response_time' => $userBehavior['response_times'][$type] ?? 3600,
            'response_rate' => $userBehavior['response_rates'][$type] ?? 0.5,
            'preferred_channels' => $userBehavior['preferred_channels'][$type] ?? ['email'],
            'preferred_times' => $userBehavior['preferred_times'][$type] ?? [],
            'engagement_level' => $userBehavior['engagement_levels'][$type] ?? 0.5
        ];
        
        return $patterns;
    }
    
    /**
     * Analyze context factors
     */
    private function analyzeContextFactors($data)
    {
        $factors = [
            'urgency_level' => $this->calculateUrgencyLevel($data),
            'business_impact' => $this->calculateBusinessImpact($data),
            'user_availability' => $this->calculateUserAvailability($data),
            'system_load' => $this->calculateSystemLoad(),
            'time_of_day' => date('H'),
            'day_of_week' => date('N'),
            'seasonal_factors' => $this->calculateSeasonalFactors()
        ];
        
        return $factors;
    }
    
    /**
     * Generate personalized title
     */
    private function generatePersonalizedTitle($type, $data, $personalizationFactors)
    {
        $baseTitle = $this->getBaseTitle($type);
        
        // Apply personalization based on user factors
        if ($personalizationFactors['role'] === 'manager') {
            $baseTitle = $this->addManagerContext($baseTitle, $data);
        }
        
        if ($personalizationFactors['department'] === 'sales') {
            $baseTitle = $this->addSalesContext($baseTitle, $data);
        }
        
        // Add urgency indicators
        if ($personalizationFactors['urgency_level'] > 80) {
            $baseTitle = "🚨 " . $baseTitle;
        } elseif ($personalizationFactors['urgency_level'] > 60) {
            $baseTitle = "⚡ " . $baseTitle;
        }
        
        return $baseTitle;
    }
    
    /**
     * Generate personalized message
     */
    private function generatePersonalizedMessage($type, $data, $personalizationFactors)
    {
        $baseMessage = $this->getBaseMessage($type, $data);
        
        // Add personalization elements
        $message = $this->addPersonalizationElements($baseMessage, $personalizationFactors);
        
        // Add context-specific information
        $message = $this->addContextSpecificInfo($message, $data, $personalizationFactors);
        
        // Add action-oriented language
        $message = $this->addActionOrientedLanguage($message, $personalizationFactors);
        
        return $message;
    }
    
    /**
     * Generate personalized call-to-action
     */
    private function generatePersonalizedCTA($type, $data, $personalizationFactors)
    {
        $baseCTA = $this->getBaseCTA($type);
        
        // Customize based on user role
        if ($personalizationFactors['role'] === 'manager') {
            $baseCTA = "Review and Approve";
        } elseif ($personalizationFactors['role'] === 'sales') {
            $baseCTA = "View Opportunity";
        }
        
        // Add urgency if needed
        if ($personalizationFactors['urgency_level'] > 80) {
            $baseCTA = "Act Now - " . $baseCTA;
        }
        
        return $baseCTA;
    }
    
    /**
     * Calculate personalization score
     */
    private function calculatePersonalizationScore($personalizationFactors)
    {
        $score = 50; // Base score
        
        // Role relevance
        $score += $personalizationFactors['role_relevance'] * 20;
        
        // Department relevance
        $score += $personalizationFactors['department_relevance'] * 20;
        
        // Historical relevance
        $score += $personalizationFactors['historical_relevance'] * 15;
        
        // Behavioral relevance
        $score += $personalizationFactors['behavioral_relevance'] * 15;
        
        return min(100, $score);
    }
    
    /**
     * Get base priority score for notification type
     */
    private function getBasePriorityScore($type)
    {
        $priorityScores = [
            'deadline_reminder' => 90,
            'bid_accepted' => 85,
            'bid_rejected' => 80,
            'tender_cancelled' => 75,
            'tender_published' => 70,
            'bid_submitted' => 65,
            'document_uploaded' => 60,
            'tender_updated' => 55,
            'status_change' => 50,
            'general_update' => 40
        ];
        
        return $priorityScores[$type] ?? 50;
    }
    
    /**
     * Calculate hours until deadline
     */
    private function calculateHoursUntilDeadline($deadline)
    {
        $now = time();
        $deadlineTime = strtotime($deadline);
        return round(($deadlineTime - $now) / 3600);
    }
    
    /**
     * Calculate urgency level
     */
    private function calculateUrgencyLevel($data)
    {
        $urgency = 50;
        
        if (isset($data['deadline'])) {
            $hoursUntilDeadline = $this->calculateHoursUntilDeadline($data['deadline']);
            
            if ($hoursUntilDeadline <= 1) {
                $urgency = 95;
            } elseif ($hoursUntilDeadline <= 6) {
                $urgency = 85;
            } elseif ($hoursUntilDeadline <= 24) {
                $urgency = 70;
            } elseif ($hoursUntilDeadline <= 72) {
                $urgency = 60;
            }
        }
        
        return $urgency;
    }
    
    /**
     * Calculate business impact
     */
    private function calculateBusinessImpact($data)
    {
        $impact = 50;
        
        if (isset($data['tender_value'])) {
            if ($data['tender_value'] > 1000000) {
                $impact = 90;
            } elseif ($data['tender_value'] > 100000) {
                $impact = 75;
            } elseif ($data['tender_value'] > 10000) {
                $impact = 60;
            }
        }
        
        return $impact;
    }
    
    /**
     * Calculate user availability
     */
    private function calculateUserAvailability($data)
    {
        // This would integrate with calendar systems
        return 80; // Default availability
    }
    
    /**
     * Calculate system load
     */
    private function calculateSystemLoad()
    {
        // This would check current system metrics
        return 50; // Default load
    }
    
    /**
     * Calculate seasonal factors
     */
    private function calculateSeasonalFactors()
    {
        $month = date('n');
        $dayOfWeek = date('N');
        
        // Weekend factor
        if ($dayOfWeek >= 6) {
            return 0.7; // Lower engagement on weekends
        }
        
        // Holiday season factor
        if ($month == 12) {
            return 0.8; // Lower engagement during holidays
        }
        
        return 1.0; // Normal engagement
    }
    
    /**
     * Apply business rules to timing
     */
    private function applyBusinessRules($optimalTime, $type, $data)
    {
        // Don't send notifications outside business hours for non-urgent items
        if ($this->calculateUrgencyLevel($data) < 70) {
            $hour = date('H', $optimalTime);
            if ($hour < 9 || $hour > 17) {
                // Move to next business day
                $optimalTime = strtotime('+1 day 09:00', $optimalTime);
            }
        }
        
        return $optimalTime;
    }
    
    // Helper methods for personalization
    private function addManagerContext($title, $data) { return $title . " - Requires Approval"; }
    private function addSalesContext($title, $data) { return $title . " - Sales Opportunity"; }
    private function addPersonalizationElements($message, $factors) { return $message; }
    private function addContextSpecificInfo($message, $data, $factors) { return $message; }
    private function addActionOrientedLanguage($message, $factors) { return $message; }
    private function getBaseTitle($type) { return "Notification"; }
    private function getBaseMessage($type, $data) { return "You have a new notification."; }
    private function getBaseCTA($type) { return "View Details"; }
    
    // Placeholder methods for external data
    private function getUserBehavior($userId) { return []; }
    private function getUserContext($userId) { return []; }
    private function initializeMLModel() { return new class { public function predictOptimalTime($patterns, $factors) { return time(); } }; }
    private function calculateRoleRelevance($data, $role) { return 0.5; }
    private function calculateDepartmentRelevance($data, $department) { return 0.5; }
    private function calculateGeographicRelevance($data, $context) { return 0.5; }
    private function calculateHistoricalRelevance($data, $userId) { return 0.5; }
} 