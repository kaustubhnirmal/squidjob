<?php
/**
 * Simple Dashboard Page
 * SquidJob Tender Management System
 */

// Start session
if (session_status() === PHP_SESSION_NONE) {
    if (session_status() === PHP_SESSION_NONE) { session_start(); }
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: /squidjob/public/login.php');
    exit;
}

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: /squidjob/public/login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - SquidJob</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8fafc;
            color: #1a202c;
        }
        
        .header {
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            color: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .logout-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            cursor: pointer;
            text-decoration: none;
            font-size: 0.875rem;
            transition: background-color 0.2s;
        }
        
        .logout-btn:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .welcome-card {
            background: white;
            border-radius: 0.5rem;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }
        
        .welcome-card h1 {
            color: #7c3aed;
            margin-bottom: 0.5rem;
        }
        
        .welcome-card p {
            color: #6b7280;
            line-height: 1.6;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #7c3aed;
        }
        
        .stat-card h3 {
            color: #374151;
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .stat-card .number {
            font-size: 2rem;
            font-weight: 700;
            color: #7c3aed;
        }
        
        .quick-actions {
            background: white;
            border-radius: 0.5rem;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .quick-actions h2 {
            color: #374151;
            margin-bottom: 1rem;
        }
        
        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .action-btn {
            display: block;
            background: linear-gradient(135deg, #7c3aed, #a855f7);
            color: white;
            text-decoration: none;
            padding: 1rem;
            border-radius: 0.5rem;
            text-align: center;
            font-weight: 500;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
        
        .success-message {
            background: #d1fae5;
            border: 1px solid #a7f3d0;
            color: #065f46;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div class="logo">🦑 SquidJob</div>
            <div class="user-info">
                <span>Welcome, <?php echo htmlspecialchars($_SESSION['user_name'] ?? 'User'); ?>!</span>
                <a href="?logout=1" class="logout-btn">Logout</a>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="success-message">
            🎉 Authentication system is working! You have successfully logged in to SquidJob.
        </div>
        
        <div class="welcome-card">
            <h1>Dashboard</h1>
            <p>Welcome to the SquidJob Tender Management System. This comprehensive platform helps you manage tenders, bids, and procurement processes efficiently.</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>Active Tenders</h3>
                <div class="number">12</div>
            </div>
            <div class="stat-card">
                <h3>Pending Bids</h3>
                <div class="number">8</div>
            </div>
            <div class="stat-card">
                <h3>Completed Projects</h3>
                <div class="number">45</div>
            </div>
            <div class="stat-card">
                <h3>Total Value</h3>
                <div class="number">₹2.5M</div>
            </div>
        </div>

        <div class="quick-actions">
            <h2>Quick Actions</h2>
            <div class="actions-grid">
                <a href="#" class="action-btn">📋 View All Tenders</a>
                <a href="#" class="action-btn">➕ Create New Tender</a>
                <a href="#" class="action-btn">📊 View Reports</a>
                <a href="#" class="action-btn">⚙️ Settings</a>
            </div>
        </div>
    </div>
</body>
</html>