<?php
/**
 * TenderManager Module - Main Plugin File
 * SquidJob Tender Management System
 * 
 * Advanced tender management with comprehensive workflow automation
 */

// Prevent direct access
if (!defined('APP_ROOT')) {
    exit('Direct access denied');
}

/**
 * Plugin initialization
 */
add_hook('app_init', 'tender_manager_init', 10, 'tender-manager');

function tender_manager_init() {
    // Initialize TenderManager system
    if (class_exists('TenderManager')) {
        TenderManager::getInstance()->init();
    }
}

/**
 * TenderManager Main Class
 */
class TenderManager {
    
    private static $instance = null;
    private $settings = [];
    private $workflows = [];
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function init() {
        $this->loadSettings();
        $this->loadWorkflows();
        $this->registerHooks();
        $this->registerApiRoutes();
    }
    
    private function loadSettings() {
        $this->settings = [
            'auto_publish_enabled' => get_plugin_setting('tender-manager', 'auto_publish_enabled', false),
            'bid_evaluation_workflow' => get_plugin_setting('tender-manager', 'bid_evaluation_workflow', 'manual'),
            'document_compression' => get_plugin_setting('tender-manager', 'document_compression', true),
            'notification_enabled' => get_plugin_setting('tender-manager', 'notification_enabled', true),
            'deadline_reminder_days' => get_plugin_setting('tender-manager', 'deadline_reminder_days', 3),
            'max_file_size' => get_plugin_setting('tender-manager', 'max_file_size', 52428800),
            'allowed_file_types' => get_plugin_setting('tender-manager', 'allowed_file_types', ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'])
        ];
    }
    
    private function loadWorkflows() {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("SELECT * FROM tender_workflows WHERE is_active = 1 ORDER BY is_default DESC, name ASC");
            $stmt->execute();
            $this->workflows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Failed to load tender workflows: " . $e->getMessage());
        }
    }
    
    private function registerHooks() {
        // Dashboard widgets
        add_hook('dashboard_widgets', [$this, 'addDashboardWidgets'], 10, 'tender-manager');
        
        // Menu items
        add_hook('menu_items', [$this, 'addMenuItems'], 10, 'tender-manager');
        
        // Tender events
        add_hook('tender_created', [$this, 'onTenderCreated'], 10, 'tender-manager');
        add_hook('tender_updated', [$this, 'onTenderUpdated'], 10, 'tender-manager');
        add_hook('tender_published', [$this, 'onTenderPublished'], 10, 'tender-manager');
        
        // Bid events
        add_hook('bid_submitted', [$this, 'onBidSubmitted'], 10, 'tender-manager');
        add_hook('bid_evaluated', [$this, 'onBidEvaluated'], 10, 'tender-manager');
        
        // Document events
        add_hook('document_uploaded', [$this, 'onDocumentUploaded'], 10, 'tender-manager');
        
        // User events
        add_hook('user_login', [$this, 'onUserLogin'], 10, 'tender-manager');
        
        // Admin initialization
        add_hook('admin_init', [$this, 'onAdminInit'], 10, 'tender-manager');
    }
    
    private function registerApiRoutes() {
        // API routes will be handled by the router
        // This is a placeholder for route registration
    }
    
    /**
     * Add dashboard widgets
     */
    public function addDashboardWidgets($widgets) {
        if (!auth() || !can('view_tenders')) {
            return $widgets;
        }
        
        $widgets[] = [
            'id' => 'tender-stats',
            'title' => 'Tender Statistics',
            'content' => $this->renderTenderStatsWidget(),
            'position' => 'left',
            'priority' => 1,
            'class' => 'col-md-6 col-lg-4'
        ];
        
        $widgets[] = [
            'id' => 'recent-tenders',
            'title' => 'Recent Tenders',
            'content' => $this->renderRecentTendersWidget(),
            'position' => 'center',
            'priority' => 2,
            'class' => 'col-md-12 col-lg-8'
        ];
        
        if (can('evaluate_bids')) {
            $widgets[] = [
                'id' => 'pending-evaluations',
                'title' => 'Pending Evaluations',
                'content' => $this->renderPendingEvaluationsWidget(),
                'position' => 'right',
                'priority' => 3,
                'class' => 'col-md-6 col-lg-4'
            ];
        }
        
        $widgets[] = [
            'id' => 'deadline-alerts',
            'title' => 'Deadline Alerts',
            'content' => $this->renderDeadlineAlertsWidget(),
            'position' => 'right',
            'priority' => 4,
            'class' => 'col-md-6 col-lg-4'
        ];
        
        return $widgets;
    }
    
    /**
     * Add menu items
     */
    public function addMenuItems($menuItems) {
        if (!auth()) {
            return $menuItems;
        }
        
        $tenderMenu = [
            'title' => 'Tender Management',
            'slug' => 'tender-management',
            'icon' => 'fas fa-clipboard-list',
            'position' => 20,
            'children' => []
        ];
        
        if (can('manage_tenders')) {
            $tenderMenu['children'][] = [
                'title' => 'Dashboard',
                'slug' => 'tender-dashboard',
                'url' => url('admin/tenders/dashboard'),
                'icon' => 'fas fa-tachometer-alt'
            ];
        }
        
        if (can('view_tenders')) {
            $tenderMenu['children'][] = [
                'title' => 'All Tenders',
                'slug' => 'all-tenders',
                'url' => url('admin/tenders'),
                'icon' => 'fas fa-list'
            ];
        }
        
        if (can('create_tender')) {
            $tenderMenu['children'][] = [
                'title' => 'Create Tender',
                'slug' => 'create-tender',
                'url' => url('admin/tenders/create'),
                'icon' => 'fas fa-plus-circle'
            ];
        }
        
        if (can('evaluate_bids')) {
            $tenderMenu['children'][] = [
                'title' => 'Bid Management',
                'slug' => 'bid-management',
                'url' => url('admin/bids'),
                'icon' => 'fas fa-gavel'
            ];
        }
        
        if (can('manage_documents')) {
            $tenderMenu['children'][] = [
                'title' => 'Documents',
                'slug' => 'tender-documents',
                'url' => url('admin/tenders/documents'),
                'icon' => 'fas fa-folder-open'
            ];
        }
        
        if (can('view_reports')) {
            $tenderMenu['children'][] = [
                'title' => 'Reports',
                'slug' => 'tender-reports',
                'url' => url('admin/tenders/reports'),
                'icon' => 'fas fa-chart-bar'
            ];
        }
        
        if (!empty($tenderMenu['children'])) {
            $menuItems[] = $tenderMenu;
        }
        
        return $menuItems;
    }
    
    /**
     * Handle tender created event
     */
    public function onTenderCreated($tender) {
        try {
            // Auto-assign workflow
            $this->assignDefaultWorkflow($tender['id']);
            
            // Create initial assignment
            $this->createInitialAssignment($tender);
            
            // Send notifications
            if ($this->settings['notification_enabled']) {
                $this->sendTenderCreatedNotification($tender);
            }
            
            // Auto-publish if enabled
            if ($this->settings['auto_publish_enabled'] && can('publish_tender')) {
                $this->autoPublishTender($tender['id']);
            }
            
        } catch (Exception $e) {
            error_log("Error handling tender created event: " . $e->getMessage());
        }
        
        return $tender;
    }
    
    /**
     * Handle tender updated event
     */
    public function onTenderUpdated($tender) {
        try {
            // Update assignments if needed
            $this->updateTenderAssignments($tender);
            
            // Send update notifications
            if ($this->settings['notification_enabled']) {
                $this->sendTenderUpdatedNotification($tender);
            }
            
        } catch (Exception $e) {
            error_log("Error handling tender updated event: " . $e->getMessage());
        }
        
        return $tender;
    }
    
    /**
     * Handle tender published event
     */
    public function onTenderPublished($tender) {
        try {
            // Update workflow status
            $this->updateWorkflowStatus($tender['id'], 'published');
            
            // Schedule deadline reminders
            $this->scheduleDeadlineReminders($tender);
            
            // Send publication notifications
            if ($this->settings['notification_enabled']) {
                $this->sendTenderPublishedNotification($tender);
            }
            
        } catch (Exception $e) {
            error_log("Error handling tender published event: " . $e->getMessage());
        }
        
        return $tender;
    }
    
    /**
     * Handle bid submitted event
     */
    public function onBidSubmitted($bid) {
        try {
            // Create evaluation record
            $this->createBidEvaluation($bid);
            
            // Assign evaluators
            $this->assignBidEvaluators($bid);
            
            // Send notifications
            if ($this->settings['notification_enabled']) {
                $this->sendBidSubmittedNotification($bid);
            }
            
        } catch (Exception $e) {
            error_log("Error handling bid submitted event: " . $e->getMessage());
        }
        
        return $bid;
    }
    
    /**
     * Handle bid evaluated event
     */
    public function onBidEvaluated($evaluation) {
        try {
            // Update evaluation status
            $this->updateEvaluationStatus($evaluation);
            
            // Check if all evaluations complete
            $this->checkEvaluationCompletion($evaluation['bid_id']);
            
            // Send notifications
            if ($this->settings['notification_enabled']) {
                $this->sendBidEvaluatedNotification($evaluation);
            }
            
        } catch (Exception $e) {
            error_log("Error handling bid evaluated event: " . $e->getMessage());
        }
        
        return $evaluation;
    }
    
    /**
     * Handle document uploaded event
     */
    public function onDocumentUploaded($document) {
        try {
            // Process document if needed
            if ($this->settings['document_compression']) {
                $this->compressDocument($document);
            }
            
            // Extract text for search
            $this->extractDocumentText($document);
            
            // Create version record
            $this->createDocumentVersion($document);
            
            // Send notifications
            if ($this->settings['notification_enabled']) {
                $this->sendDocumentUploadedNotification($document);
            }
            
        } catch (Exception $e) {
            error_log("Error handling document uploaded event: " . $e->getMessage());
        }
        
        return $document;
    }
    
    /**
     * Handle user login event
     */
    public function onUserLogin($user) {
        try {
            // Check for pending assignments
            $pendingAssignments = $this->getPendingAssignments($user['id']);
            if (!empty($pendingAssignments)) {
                $_SESSION['pending_tender_assignments'] = count($pendingAssignments);
            }
            
            // Check for upcoming deadlines
            $upcomingDeadlines = $this->getUpcomingDeadlines($user['id']);
            if (!empty($upcomingDeadlines)) {
                $_SESSION['upcoming_tender_deadlines'] = count($upcomingDeadlines);
            }
            
        } catch (Exception $e) {
            error_log("Error handling user login event: " . $e->getMessage());
        }
        
        return $user;
    }
    
    /**
     * Handle admin initialization
     */
    public function onAdminInit() {
        // Register admin pages and functionality
        $this->registerAdminPages();
    }
    
    /**
     * Render tender statistics widget
     */
    private function renderTenderStatsWidget() {
        $stats = $this->getTenderStatistics();
        
        $html = '<div class="tender-stats-widget">';
        $html .= '<div class="row">';
        
        $html .= '<div class="col-6">';
        $html .= '<div class="stat-item">';
        $html .= '<div class="stat-number text-primary">' . $stats['total_tenders'] . '</div>';
        $html .= '<div class="stat-label">Total Tenders</div>';
        $html .= '</div>';
        $html .= '</div>';
        
        $html .= '<div class="col-6">';
        $html .= '<div class="stat-item">';
        $html .= '<div class="stat-number text-success">' . $stats['active_tenders'] . '</div>';
        $html .= '<div class="stat-label">Active</div>';
        $html .= '</div>';
        $html .= '</div>';
        
        $html .= '<div class="col-6">';
        $html .= '<div class="stat-item">';
        $html .= '<div class="stat-number text-warning">' . $stats['pending_evaluation'] . '</div>';
        $html .= '<div class="stat-label">Pending Evaluation</div>';
        $html .= '</div>';
        $html .= '</div>';
        
        $html .= '<div class="col-6">';
        $html .= '<div class="stat-item">';
        $html .= '<div class="stat-number text-info">' . $stats['completed_tenders'] . '</div>';
        $html .= '<div class="stat-label">Completed</div>';
        $html .= '</div>';
        $html .= '</div>';
        
        $html .= '</div>';
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Render recent tenders widget
     */
    private function renderRecentTendersWidget() {
        $recentTenders = $this->getRecentTenders(5);
        
        $html = '<div class="recent-tenders-widget">';
        
        if (empty($recentTenders)) {
            $html .= '<p class="text-muted">No recent tenders found.</p>';
        } else {
            $html .= '<div class="table-responsive">';
            $html .= '<table class="table table-sm">';
            $html .= '<thead>';
            $html .= '<tr>';
            $html .= '<th>Title</th>';
            $html .= '<th>Status</th>';
            $html .= '<th>Deadline</th>';
            $html .= '<th>Actions</th>';
            $html .= '</tr>';
            $html .= '</thead>';
            $html .= '<tbody>';
            
            foreach ($recentTenders as $tender) {
                $html .= '<tr>';
                $html .= '<td><a href="' . url('admin/tenders/' . $tender['id']) . '">' . e($tender['title']) . '</a></td>';
                $html .= '<td><span class="badge badge-' . $this->getStatusColor($tender['status']) . '">' . ucfirst($tender['status']) . '</span></td>';
                $html .= '<td>' . formatDate($tender['deadline'], 'M j, Y') . '</td>';
                $html .= '<td>';
                $html .= '<a href="' . url('admin/tenders/' . $tender['id']) . '" class="btn btn-sm btn-outline-primary">View</a>';
                $html .= '</td>';
                $html .= '</tr>';
            }
            
            $html .= '</tbody>';
            $html .= '</table>';
            $html .= '</div>';
        }
        
        $html .= '<div class="widget-footer">';
        $html .= '<a href="' . url('admin/tenders') . '" class="btn btn-sm btn-primary">View All Tenders</a>';
        $html .= '</div>';
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Render pending evaluations widget
     */
    private function renderPendingEvaluationsWidget() {
        $pendingEvaluations = $this->getPendingEvaluations(user()['id']);
        
        $html = '<div class="pending-evaluations-widget">';
        $html .= '<div class="widget-header">';
        $html .= '<span class="badge badge-warning">' . count($pendingEvaluations) . '</span>';
        $html .= '</div>';
        
        if (empty($pendingEvaluations)) {
            $html .= '<p class="text-muted">No pending evaluations.</p>';
        } else {
            $html .= '<ul class="list-unstyled">';
            foreach (array_slice($pendingEvaluations, 0, 5) as $evaluation) {
                $html .= '<li class="evaluation-item">';
                $html .= '<strong>' . e($evaluation['tender_title']) . '</strong><br>';
                $html .= '<small class="text-muted">Due: ' . formatDate($evaluation['due_date'], 'M j, Y') . '</small>';
                $html .= '<div class="mt-1">';
                $html .= '<a href="' . url('admin/evaluations/' . $evaluation['id']) . '" class="btn btn-xs btn-primary">Evaluate</a>';
                $html .= '</div>';
                $html .= '</li>';
            }
            $html .= '</ul>';
        }
        
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Render deadline alerts widget
     */
    private function renderDeadlineAlertsWidget() {
        $upcomingDeadlines = $this->getUpcomingDeadlines(user()['id'], $this->settings['deadline_reminder_days']);
        
        $html = '<div class="deadline-alerts-widget">';
        $html .= '<div class="widget-header">';
        $html .= '<span class="badge badge-danger">' . count($upcomingDeadlines) . '</span>';
        $html .= '</div>';
        
        if (empty($upcomingDeadlines)) {
            $html .= '<p class="text-muted">No upcoming deadlines.</p>';
        } else {
            $html .= '<ul class="list-unstyled">';
            foreach ($upcomingDeadlines as $deadline) {
                $daysLeft = ceil((strtotime($deadline['deadline']) - time()) / 86400);
                $urgencyClass = $daysLeft <= 1 ? 'text-danger' : ($daysLeft <= 3 ? 'text-warning' : 'text-info');
                
                $html .= '<li class="deadline-item">';
                $html .= '<strong>' . e($deadline['title']) . '</strong><br>';
                $html .= '<small class="' . $urgencyClass . '">';
                $html .= $daysLeft <= 0 ? 'Overdue!' : $daysLeft . ' days left';
                $html .= '</small>';
                $html .= '</li>';
            }
            $html .= '</ul>';
        }
        
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Get tender statistics
     */
    private function getTenderStatistics() {
        try {
            $pdo = getDbConnection();
            
            $stats = [
                'total_tenders' => 0,
                'active_tenders' => 0,
                'pending_evaluation' => 0,
                'completed_tenders' => 0
            ];
            
            // Total tenders
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM tenders WHERE deleted_at IS NULL");
            $stmt->execute();
            $stats['total_tenders'] = $stmt->fetchColumn();
            
            // Active tenders
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM tenders WHERE status IN ('live', 'in_process') AND deleted_at IS NULL");
            $stmt->execute();
            $stats['active_tenders'] = $stmt->fetchColumn();
            
            // Pending evaluation
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM tenders WHERE status = 'submitted' AND deleted_at IS NULL");
            $stmt->execute();
            $stats['pending_evaluation'] = $stmt->fetchColumn();
            
            // Completed tenders
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM tenders WHERE status IN ('awarded', 'completed') AND deleted_at IS NULL");
            $stmt->execute();
            $stats['completed_tenders'] = $stmt->fetchColumn();
            
            return $stats;
            
        } catch (Exception $e) {
            error_log("Error getting tender statistics: " . $e->getMessage());
            return ['total_tenders' => 0, 'active_tenders' => 0, 'pending_evaluation' => 0, 'completed_tenders' => 0];
        }
    }
    
    /**
     * Get recent tenders
     */
    private function getRecentTenders($limit = 10) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                SELECT id, title, status, deadline, created_at 
                FROM tenders 
                WHERE deleted_at IS NULL 
                ORDER BY created_at DESC 
                LIMIT ?
            ");
            $stmt->execute([$limit]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error getting recent tenders: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get pending evaluations for user
     */
    private function getPendingEvaluations($userId) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                SELECT be.*, t.title as tender_title, ta.due_date
                FROM bid_evaluations be
                JOIN tenders t ON be.tender_id = t.id
                LEFT JOIN tender_assignments ta ON t.id = ta.tender_id AND ta.user_id = ?
                WHERE be.evaluator_id = ? AND be.status = 'pending'
                ORDER BY ta.due_date ASC, be.created_at ASC
            ");
            $stmt->execute([$userId, $userId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error getting pending evaluations: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get upcoming deadlines for user
     */
    private function getUpcomingDeadlines($userId, $days = 7) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                SELECT t.id, t.title, t.deadline
                FROM tenders t
                JOIN tender_assignments ta ON t.id = ta.tender_id
                WHERE ta.user_id = ? 
                AND t.deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)
                AND t.status IN ('live', 'in_process')
                AND t.deleted_at IS NULL
                ORDER BY t.deadline ASC
            ");
            $stmt->execute([$userId, $days]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error getting upcoming deadlines: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get pending assignments for user
     */
    private function getPendingAssignments($userId) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                SELECT ta.*, t.title as tender_title
                FROM tender_assignments ta
                JOIN tenders t ON ta.tender_id = t.id
                WHERE ta.user_id = ? AND ta.status = 'assigned'
                ORDER BY ta.assigned_date DESC
            ");
            $stmt->execute([$userId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error getting pending assignments: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get status color for badges
     */
    private function getStatusColor($status) {
        $colors = [
            'draft' => 'secondary',
            'live' => 'primary',
            'in_process' => 'warning',
            'submitted' => 'info',
            'awarded' => 'success',
            'rejected' => 'danger',
            'cancelled' => 'dark',
            'completed' => 'success'
        ];
        
        return $colors[$status] ?? 'secondary';
    }
    
    // Placeholder methods for workflow and notification functionality
    private function assignDefaultWorkflow($tenderId) { /* Implementation */ }
    private function createInitialAssignment($tender) { /* Implementation */ }
    private function sendTenderCreatedNotification($tender) { /* Implementation */ }
    private function autoPublishTender($tenderId) { /* Implementation */ }
    private function updateTenderAssignments($tender) { /* Implementation */ }
    private function sendTenderUpdatedNotification($tender) { /* Implementation */ }
    private function updateWorkflowStatus($tenderId, $status) { /* Implementation */ }
    private function scheduleDeadlineReminders($tender) { /* Implementation */ }
    private function sendTenderPublishedNotification($tender) { /* Implementation */ }
    private function createBidEvaluation($bid) { /* Implementation */ }
    private function assignBidEvaluators($bid) { /* Implementation */ }
    private function sendBidSubmittedNotification($bid) { /* Implementation */ }
    private function updateEvaluationStatus($evaluation) { /* Implementation */ }
    private function checkEvaluationCompletion($bidId) { /* Implementation */ }
    private function sendBidEvaluatedNotification($evaluation) { /* Implementation */ }
    private function compressDocument($document) { /* Implementation */ }
    private function extractDocumentText($document) { /* Implementation */ }
    private function createDocumentVersion($document) { /* Implementation */ }
    private function sendDocumentUploadedNotification($document) { /* Implementation */ }
    private function registerAdminPages() { /* Implementation */ }
}