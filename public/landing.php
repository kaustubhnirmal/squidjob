<?php
/**
 * SquidJob Landing Page
 * Professional landing page with octopus mascot and purple theme
 */

// Include bootstrap for config and helper functions
require_once dirname(__DIR__) . '/bootstrap/app.php';

// Start session for CSRF protection
if (session_status() === PHP_SESSION_NONE) { session_start(); }

// Generate CSRF token
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Get static statistics (fallback values)
function getStatistics() {
    return [
        'active_tenders' => '10,000+',
        'successful_bids' => '5,000+',
        'uptime' => '99.9',
        'support' => '24/7'
    ];
}

$stats = getStatistics();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="SquidJob - Hassle Free Tender Management System. Streamline your tender processes with our intelligent platform featuring AI-powered search, automated workflows, and comprehensive bid management.">
    <meta name="keywords" content="tender management, bid management, government tenders, procurement, SquidJob">
    <meta name="author" content="SquidJob Team">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="SquidJob - Hassle Free Tender Management">
    <meta property="og:description" content="Streamline your tender processes with our intelligent platform featuring AI-powered search and automated workflows.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo config('app.url'); ?>">
    <meta property="og:image" content="<?php echo config('app.url'); ?>/assets/images/squidjob-og.png">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="SquidJob - Hassle Free Tender Management">
    <meta name="twitter:description" content="Streamline your tender processes with our intelligent platform.">
    <meta name="twitter:image" content="<?php echo config('app.url'); ?>/assets/images/squidjob-og.png">
    
    <title>SquidJob - Hassle Free Tender Management</title>
    
    <!-- Preload critical resources -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style">
    <link rel="preload" href="assets/css/landing.css" as="style">
    
    <!-- Stylesheets -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/landing.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="assets/images/favicon.ico">
    <link rel="apple-touch-icon" href="assets/images/apple-touch-icon.png">
    
    <!-- CSRF Token for JavaScript -->
    <meta name="csrf-token" content="<?php echo $_SESSION['csrf_token']; ?>">
</head>
<body>
    <!-- Header Navigation -->
    <header class="header" id="header">
        <div class="container">
            <div class="header-content">
                <div class="logo">
                    <img src="assets/images/squidjob-logo.svg" alt="SquidJob Logo" width="40" height="40">
                    <span>SquidJob</span>
                </div>
                <nav class="nav" id="nav">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How it Works</a>
                    <a href="#contact">Contact</a>
                </nav>
                <div class="header-actions">
                    <button class="btn btn-outline" onclick="openLoginModal()">Sign In</button>
                    <button class="btn btn-primary" onclick="openLoginModal()">Get Started</button>
                </div>
                <button class="mobile-menu-toggle" id="mobileMenuToggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero" id="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-left">
                    <div class="octopus-mascot">
                        <img src="assets/images/octopus-mascot.svg" alt="SquidJob Octopus Mascot" width="400" height="400">
                        <div class="neon-signs">
                            <span class="neon-text neon-department">DEPARTMENT</span>
                            <span class="neon-text neon-goodjob">Good job! SquidJob</span>
                        </div>
                    </div>
                </div>
                <div class="hero-right">
                    <div class="hero-overlay">
                        <h1>HAVE A HASSLE FREE TENDER MANAGEMENT</h1>
                        <p>Streamline your tender processes with our intelligent platform featuring AI-powered search, automated workflows, and comprehensive bid management.</p>
                        <button class="btn btn-primary btn-large" onclick="playDemo()">
                            <svg class="icon-play" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            See how it works
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Statistics Bar -->
    <section class="stats-bar" id="stats">
        <div class="container">
            <div class="stats-grid">
                <div class="stat-item" data-target="<?php echo str_replace(',', '', $stats['active_tenders']); ?>">
                    <h3 class="stat-number"><?php echo $stats['active_tenders']; ?></h3>
                    <p>Active Tenders</p>
                </div>
                <div class="stat-item" data-target="<?php echo str_replace(',', '', $stats['successful_bids']); ?>">
                    <h3 class="stat-number"><?php echo $stats['successful_bids']; ?></h3>
                    <p>Successful Bids</p>
                </div>
                <div class="stat-item" data-target="99.9">
                    <h3 class="stat-number"><?php echo $stats['uptime']; ?>%</h3>
                    <p>Uptime</p>
                </div>
                <div class="stat-item">
                    <h3 class="stat-number"><?php echo $stats['support']; ?></h3>
                    <p>Support</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Smart Bidding Strategies -->
    <section class="features" id="features">
        <div class="container">
            <div class="section-header">
                <h2>Shaping Success Stories with Smart Bidding Strategies</h2>
                <p>Discover how our innovative approach helps bidders secure winning bids and achieve excellence in tender management.</p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                    </div>
                    <h3>Smart Tender Search</h3>
                    <p>AI-powered search engine that finds the most relevant tenders for your business with advanced filtering and matching algorithms.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                    </div>
                    <h3>Automated Workflows</h3>
                    <p>Streamline your bid preparation process with automated document generation, deadline tracking, and approval workflows.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                        </svg>
                    </div>
                    <h3>Real-time Analytics</h3>
                    <p>Comprehensive dashboard with insights on bid performance, success rates, and market trends to optimize your strategy.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </div>
                    <h3>Document Management</h3>
                    <p>Secure cloud storage with version control, collaborative editing, and automated compliance checking for all tender documents.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H9V7h9v14z"/>
                        </svg>
                    </div>
                    <h3>Team Collaboration</h3>
                    <p>Multi-user platform with role-based access control, task assignment, and real-time communication tools for seamless teamwork.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                    </div>
                    <h3>Security & Compliance</h3>
                    <p>Enterprise-grade security with encryption, audit trails, and compliance with government procurement regulations and standards.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- 6 Steps to Bid & Win -->
    <section class="steps" id="how-it-works">
        <div class="container">
            <div class="section-header">
                <h2>6 STEPS TO BID & WIN</h2>
                <p>Our proven methodology helps you navigate the tender process efficiently and increase your success rate.</p>
            </div>
            <div class="steps-grid">
                <div class="step-item">
                    <div class="step-number">01</div>
                    <div class="step-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                    </div>
                    <h3>Search for Tenders</h3>
                    <p>Browse thousands of active tenders with advanced filtering options. Our AI-powered search helps you find opportunities that match your expertise and capabilities.</p>
                    <button class="btn btn-outline btn-sm">Learn More</button>
                </div>
                <div class="step-item">
                    <div class="step-number">02</div>
                    <div class="step-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                        </svg>
                    </div>
                    <h3>Analyze Requirements</h3>
                    <p>Our intelligent document parser extracts key requirements, deadlines, and eligibility criteria. Get automated insights and compliance checklists.</p>
                    <button class="btn btn-outline btn-sm">Learn More</button>
                </div>
                <div class="step-item">
                    <div class="step-number">03</div>
                    <div class="step-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V7h10v2z"/>
                        </svg>
                    </div>
                    <h3>Prepare Documents</h3>
                    <p>Use our template library and collaborative editing tools to prepare professional bid documents. Track progress and ensure compliance with requirements.</p>
                    <button class="btn btn-outline btn-sm">Learn More</button>
                </div>
                <div class="step-item">
                    <div class="step-number">04</div>
                    <div class="step-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <h3>Review & Approve</h3>
                    <p>Multi-level approval workflow ensures quality control. Get automated compliance checks and final review before submission with audit trails.</p>
                    <button class="btn btn-outline btn-sm">Learn More</button>
                </div>
                <div class="step-item">
                    <div class="step-number">05</div>
                    <div class="step-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </div>
                    <h3>Submit Bid</h3>
                    <p>Secure submission portal with encryption and delivery confirmation. Track submission status and receive real-time notifications about updates.</p>
                    <button class="btn btn-outline btn-sm">Learn More</button>
                </div>
                <div class="step-item">
                    <div class="step-number">06</div>
                    <div class="step-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                        </svg>
                    </div>
                    <h3>Track & Analyze</h3>
                    <p>Monitor bid status, track results, and analyze performance metrics. Get insights to improve future bids and build a winning strategy.</p>
                    <button class="btn btn-outline btn-sm">Learn More</button>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer" id="contact">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <img src="assets/images/squidjob-logo.svg" alt="SquidJob Logo" width="40" height="40">
                    <h3>SquidJob</h3>
                    <p>Empowering businesses with intelligent tender management solutions. Streamline your procurement processes and win more bids with our comprehensive platform.</p>
                    <div class="social-links">
                        <a href="#" aria-label="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
                        <a href="#" aria-label="Twitter"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
                        <a href="#" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                    </div>
                </div>
                <div class="footer-links">
                    <div class="footer-section">
                        <h4>Solutions</h4>
                        <ul>
                            <li><a href="#features">Tender Search</a></li>
                            <li><a href="#features">Bid Management</a></li>
                            <li><a href="#features">Analytics</a></li>
                            <li><a href="#features">Team Collaboration</a></li>
                            <li><a href="#features">Document Management</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Support</h4>
                        <ul>
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Contact Us</a></li>
                            <li><a href="#">Documentation</a></li>
                            <li><a href="#">API Reference</a></li>
                            <li><a href="#">Training</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Contact</h4>
                        <ul>
                            <li><strong>Sales:</strong> +1-234-567-8900</li>
                            <li><strong>Support:</strong> +1-234-567-8901</li>
                            <li><strong>Bidding Solution:</strong> +1-234-567-8902</li>
                            <li><strong>Email:</strong> support@squidjob.com</li>
                            <li><strong>Address:</strong> 123 Business Ave, Suite 100</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; <?php echo date('Y'); ?> SquidJob. All rights reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a> | <a href="#">Cookie Policy</a></p>
            </div>
        </div>
    </footer>

    <!-- Login Modal -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-logo">
                    <img src="assets/images/squidjob-logo.svg" alt="SquidJob Logo" width="32" height="32">
                    <span>Sign In</span>
                </div>
                <button class="modal-close" onclick="closeLoginModal()" aria-label="Close modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
            
            <!-- Error/Success Messages -->
            <div id="loginMessages" style="display: none; margin-bottom: 1rem;">
                <div id="errorMessage" class="alert alert-error" style="display: none; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 0.75rem; border-radius: 0.375rem; margin-bottom: 0.5rem;">
                    <span id="errorText"></span>
                </div>
                <div id="successMessage" class="alert alert-success" style="display: none; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 0.75rem; border-radius: 0.375rem; margin-bottom: 0.5rem;">
                    <span id="successText"></span>
                </div>
            </div>
            
            <form class="login-form" id="loginForm" action="/squidjob/public/login_handler.php" method="POST">
                <input type="hidden" name="_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="email" id="username" name="email" placeholder="Enter your email" required autocomplete="email">
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-input">
                        <input type="password" id="password" name="password" placeholder="Enter your password" required autocomplete="current-password">
                        <button type="button" class="password-toggle" onclick="togglePassword()" aria-label="Toggle password visibility">
                            <svg class="icon-eye" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="remember" checked>
                        <span class="checkmark"></span>
                        Remember me
                    </label>
                </div>
                
                <button type="submit" class="btn btn-primary btn-full" id="loginButton">
                    <span id="loginButtonText">Sign In</span>
                    <span id="loginButtonSpinner" style="display: none;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
                            <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
                            <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"/>
                        </svg>
                        Signing In...
                    </span>
                </button>
                
                <div class="form-instructions">
                    <p>Please enter your credentials to access the system</p>
                    <p>Contact your administrator if you need login credentials</p>
                </div>
                
                <div class="form-footer">
                    <a href="/squidjob/public/index.php/forgot-password" class="forgot-password">Forgot Password?</a>
                </div>
            </form>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div id="loadingOverlay" class="loading-overlay">
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    </div>

    <!-- JavaScript -->
    <script src="assets/js/landing.js"></script>
    
    <script>
        // Enhanced login form handling
        document.addEventListener('DOMContentLoaded', function() {
            const loginForm = document.getElementById('loginForm');
            const loginButton = document.getElementById('loginButton');
            const loginButtonText = document.getElementById('loginButtonText');
            const loginButtonSpinner = document.getElementById('loginButtonSpinner');
            const loginMessages = document.getElementById('loginMessages');
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
            const errorText = document.getElementById('errorText');
            const successText = document.getElementById('successText');
            
            // Show message function
            function showMessage(type, message) {
                loginMessages.style.display = 'block';
                if (type === 'error') {
                    errorMessage.style.display = 'block';
                    successMessage.style.display = 'none';
                    errorText.textContent = message;
                } else if (type === 'success') {
                    successMessage.style.display = 'block';
                    errorMessage.style.display = 'none';
                    successText.textContent = message;
                }
            }
            
            // Hide messages function
            function hideMessages() {
                loginMessages.style.display = 'none';
                errorMessage.style.display = 'none';
                successMessage.style.display = 'none';
            }
            
            // Set loading state
            function setLoading(loading) {
                if (loading) {
                    loginButton.disabled = true;
                    loginButtonText.style.display = 'none';
                    loginButtonSpinner.style.display = 'inline-flex';
                } else {
                    loginButton.disabled = false;
                    loginButtonText.style.display = 'inline';
                    loginButtonSpinner.style.display = 'none';
                }
            }
            
            // Handle form submission
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                hideMessages();
                setLoading(true);
                
                const formData = new FormData(loginForm);
                
                // Submit form using fetch
                fetch(loginForm.action, {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin'
                })
                .then(response => {
                    // Always expect JSON response from our login handler
                    return response.json().then(data => ({
                        status: response.status,
                        data: data
                    }));
                })
                .then(result => {
                    setLoading(false);
                    
                    if (result.status === 200 && result.data.success) {
                        // Successful login
                        showMessage('success', result.data.message || 'Login successful! Redirecting...');
                        
                        // Redirect after a short delay
                        setTimeout(() => {
                            if (result.data.redirect) {
                                window.location.href = result.data.redirect;
                            } else {
                                window.location.href = '/squidjob/public/index.php/dashboard';
                            }
                        }, 1500);
                    } else {
                        // Login failed
                        showMessage('error', result.data.error || 'Login failed. Please try again.');
                    }
                })
                .catch(error => {
                    setLoading(false);
                    console.error('Login error:', error);
                    showMessage('error', 'Network error. Please check your connection and try again.');
                });
            });
        });
        
        // Toggle password visibility
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
        }
        
        // Performance monitoring
        window.addEventListener('load', function() {
            if ('performance' in window) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log('Page load time:', loadTime + 'ms');
            }
        });
        
        // Add CSS for spinner animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    </script>
</body>
</html>