<?php
/**
 * Dashboard Controller
 * SquidJob Tender Management System
 * 
 * Handles dashboard functionality
 */

namespace App\Controllers;

class DashboardController extends BaseController {
    
    /**
     * Show dashboard
     */
    public function index() {
        $this->requireAuth();
        
        $this->setTitle('Dashboard - SquidJob');
        $this->addBreadcrumb('Dashboard');
        
        // Get dashboard statistics
        $stats = $this->getDashboardStats();
        
        $this->view('dashboard.index', [
            'stats' => $stats,
            'page_title' => 'Dashboard'
        ]);
    }
    
    /**
     * Get dashboard statistics
     */
    private function getDashboardStats() {
        try {
            $pdo = getDbConnection();
            
            // Get tender statistics
            $tenderStats = $pdo->query("
                SELECT 
                    COUNT(*) as total_tenders,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_tenders,
                    SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_tenders,
                    SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as recent_tenders
                FROM tenders
            ")->fetch();
            
            // Get bid statistics
            $bidStats = $pdo->query("
                SELECT 
                    COUNT(*) as total_bids,
                    SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted_bids,
                    SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won_bids,
                    SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as recent_bids
                FROM bids
            ")->fetch();
            
            return [
                'tenders' => $tenderStats ?: [
                    'total_tenders' => 0,
                    'active_tenders' => 0,
                    'closed_tenders' => 0,
                    'recent_tenders' => 0
                ],
                'bids' => $bidStats ?: [
                    'total_bids' => 0,
                    'submitted_bids' => 0,
                    'won_bids' => 0,
                    'recent_bids' => 0
                ]
            ];
            
        } catch (\Exception $e) {
            logMessage('ERROR', 'Dashboard stats error: ' . $e->getMessage());
            
            // Return default stats on error
            return [
                'tenders' => [
                    'total_tenders' => 0,
                    'active_tenders' => 0,
                    'closed_tenders' => 0,
                    'recent_tenders' => 0
                ],
                'bids' => [
                    'total_bids' => 0,
                    'submitted_bids' => 0,
                    'won_bids' => 0,
                    'recent_bids' => 0
                ]
            ];
        }
    }
}