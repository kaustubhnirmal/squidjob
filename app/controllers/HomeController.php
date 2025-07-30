<?php
/**
 * Home Controller
 * SquidJob Tender Management System
 * 
 * Handles home page and public pages
 */

namespace App\Controllers;

class HomeController extends BaseController {
    
    /**
     * Display home page
     */
    public function index() {
        $this->setTitle('Welcome to SquidJob');
        $this->setMetaDescription('SquidJob Tender Management System - Streamline your tender processes');
        
        // Get some statistics for the home page
        $stats = $this->getHomePageStats();
        
        $this->view('home.index', [
            'stats' => $stats,
            'features' => $this->getFeatures(),
            'testimonials' => $this->getTestimonials()
        ]);
    }
    
    /**
     * Display about page
     */
    public function about() {
        $this->setTitle('About Us - SquidJob');
        $this->setMetaDescription('Learn more about SquidJob Tender Management System and our mission');
        
        $this->addBreadcrumb('Home', '/');
        $this->addBreadcrumb('About Us');
        
        $this->view('home.about', [
            'team_members' => $this->getTeamMembers(),
            'company_info' => $this->getCompanyInfo()
        ]);
    }
    
    /**
     * Display contact page
     */
    public function contact() {
        $this->setTitle('Contact Us - SquidJob');
        $this->setMetaDescription('Get in touch with SquidJob team for support and inquiries');
        
        $this->addBreadcrumb('Home', '/');
        $this->addBreadcrumb('Contact Us');
        
        if (isPost()) {
            $this->handleContactForm();
        }
        
        $this->view('home.contact', [
            'contact_info' => $this->getContactInfo()
        ]);
    }
    
    /**
     * Handle contact form submission
     */
    private function handleContactForm() {
        $this->verifyCsrfToken();
        
        $data = $this->validate(request(), [
            'name' => 'required|min:2|max:100',
            'email' => 'required|email',
            'subject' => 'required|min:5|max:200',
            'message' => 'required|min:10|max:1000'
        ]);
        
        try {
            // Save contact inquiry to database
            $this->saveContactInquiry($data);
            
            // Send email notification
            $this->sendContactNotification($data);
            
            flash('success', 'Thank you for your message. We will get back to you soon!');
            $this->redirect('/contact');
            
        } catch (\Exception $e) {
            error_log("Contact form error: " . $e->getMessage());
            flash('error', 'Sorry, there was an error sending your message. Please try again.');
            $this->back();
        }
    }
    
    /**
     * Get home page statistics
     */
    private function getHomePageStats() {
        try {
            $pdo = getDbConnection();
            
            // Get tender statistics
            $tenderStats = $pdo->query("
                SELECT 
                    COUNT(*) as total_tenders,
                    SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END) as active_tenders,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tenders,
                    SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as recent_tenders
                FROM tenders 
                WHERE deleted_at IS NULL
            ")->fetch(\PDO::FETCH_ASSOC);
            
            // Get company statistics
            $companyStats = $pdo->query("
                SELECT 
                    COUNT(*) as total_companies,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_companies,
                    SUM(CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) as verified_companies
                FROM companies
            ")->fetch(\PDO::FETCH_ASSOC);
            
            // Get user statistics
            $userStats = $pdo->query("
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users
                FROM users
            ")->fetch(\PDO::FETCH_ASSOC);
            
            return [
                'tenders' => $tenderStats,
                'companies' => $companyStats,
                'users' => $userStats
            ];
            
        } catch (\Exception $e) {
            error_log("Error fetching home page stats: " . $e->getMessage());
            return [
                'tenders' => ['total_tenders' => 0, 'active_tenders' => 0, 'completed_tenders' => 0, 'recent_tenders' => 0],
                'companies' => ['total_companies' => 0, 'active_companies' => 0, 'verified_companies' => 0],
                'users' => ['total_users' => 0, 'active_users' => 0]
            ];
        }
    }
    
    /**
     * Get system features
     */
    private function getFeatures() {
        return [
            [
                'icon' => 'file-text',
                'title' => 'Tender Management',
                'description' => 'Complete tender lifecycle management from import to completion with automated workflows.'
            ],
            [
                'icon' => 'users',
                'title' => 'Team Collaboration',
                'description' => 'Assign tenders to team members, track progress, and collaborate effectively.'
            ],
            [
                'icon' => 'folder',
                'title' => 'Document Management',
                'description' => 'Secure document storage with version control and easy access management.'
            ],
            [
                'icon' => 'building',
                'title' => 'Company Database',
                'description' => 'Maintain comprehensive vendor and dealer database with performance tracking.'
            ],
            [
                'icon' => 'dollar-sign',
                'title' => 'Financial Management',
                'description' => 'Track EMD, purchase orders, and financial workflows with approval systems.'
            ],
            [
                'icon' => 'bar-chart',
                'title' => 'Analytics & Reports',
                'description' => 'Detailed analytics and customizable reports for better decision making.'
            ],
            [
                'icon' => 'shield',
                'title' => 'Security & Compliance',
                'description' => 'Role-based access control with audit trails and data protection.'
            ],
            [
                'icon' => 'smartphone',
                'title' => 'Mobile Responsive',
                'description' => 'Access your tender management system from any device, anywhere.'
            ]
        ];
    }
    
    /**
     * Get testimonials
     */
    private function getTestimonials() {
        return [
            [
                'name' => 'Rajesh Kumar',
                'position' => 'Tender Manager',
                'company' => 'Tech Solutions Pvt Ltd',
                'message' => 'SquidJob has revolutionized our tender management process. The automation and collaboration features have increased our efficiency by 300%.',
                'rating' => 5
            ],
            [
                'name' => 'Priya Sharma',
                'position' => 'Business Development Head',
                'company' => 'Global Manufacturing Co',
                'message' => 'The document management and team collaboration features are outstanding. We can now track all our tenders in real-time.',
                'rating' => 5
            ],
            [
                'name' => 'Amit Patel',
                'position' => 'Operations Manager',
                'company' => 'Prime Contractors Ltd',
                'message' => 'Excellent system with great support. The financial management module has streamlined our purchase order process.',
                'rating' => 4
            ]
        ];
    }
    
    /**
     * Get team members
     */
    private function getTeamMembers() {
        return [
            [
                'name' => 'John Doe',
                'position' => 'CEO & Founder',
                'bio' => 'Experienced technology leader with 15+ years in enterprise software development.',
                'image' => 'team/john-doe.jpg',
                'linkedin' => 'https://linkedin.com/in/johndoe'
            ],
            [
                'name' => 'Jane Smith',
                'position' => 'CTO',
                'bio' => 'Full-stack developer and architect specializing in scalable web applications.',
                'image' => 'team/jane-smith.jpg',
                'linkedin' => 'https://linkedin.com/in/janesmith'
            ],
            [
                'name' => 'Mike Johnson',
                'position' => 'Head of Product',
                'bio' => 'Product management expert with deep understanding of tender management processes.',
                'image' => 'team/mike-johnson.jpg',
                'linkedin' => 'https://linkedin.com/in/mikejohnson'
            ]
        ];
    }
    
    /**
     * Get company information
     */
    private function getCompanyInfo() {
        return [
            'name' => 'SquidJob Technologies',
            'founded' => '2020',
            'mission' => 'To streamline and digitize tender management processes for businesses worldwide.',
            'vision' => 'To become the leading platform for tender management and business process automation.',
            'values' => [
                'Innovation' => 'We continuously innovate to provide cutting-edge solutions.',
                'Quality' => 'We deliver high-quality software that exceeds expectations.',
                'Customer Focus' => 'Our customers success is our primary goal.',
                'Integrity' => 'We operate with transparency and ethical business practices.'
            ]
        ];
    }
    
    /**
     * Get contact information
     */
    private function getContactInfo() {
        return [
            'address' => '123 Business District, Tech City, TC 12345',
            'phone' => '+1 (555) 123-4567',
            'email' => 'contact@squidjob.com',
            'support_email' => 'support@squidjob.com',
            'business_hours' => 'Monday - Friday: 9:00 AM - 6:00 PM',
            'social_media' => [
                'linkedin' => 'https://linkedin.com/company/squidjob',
                'twitter' => 'https://twitter.com/squidjob',
                'facebook' => 'https://facebook.com/squidjob'
            ]
        ];
    }
    
    /**
     * Save contact inquiry to database
     */
    private function saveContactInquiry($data) {
        try {
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("
                INSERT INTO contact_inquiries (name, email, subject, message, ip_address, user_agent, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $data['name'],
                $data['email'],
                $data['subject'],
                $data['message'],
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ]);
            
            return true;
        } catch (\Exception $e) {
            error_log("Error saving contact inquiry: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send contact notification email
     */
    private function sendContactNotification($data) {
        // This would integrate with your email service
        // For now, just log the notification
        $message = "New contact inquiry from {$data['name']} ({$data['email']})\n";
        $message .= "Subject: {$data['subject']}\n";
        $message .= "Message: {$data['message']}";
        
        error_log("Contact Inquiry: " . $message);
        
        return true;
    }
}