<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php echo $meta_description ?? 'SquidJob Tender Management System'; ?>">
    <meta name="csrf-token" content="<?php echo $csrf_token; ?>">
    
    <title><?php echo $page_title ?? 'SquidJob'; ?></title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <!-- SquidJob Theme CSS -->
    <link href="<?php echo url('public/css/squidjob-theme.css'); ?>" rel="stylesheet">
    
    <!-- Additional CSS files -->
    <?php if (isset($css_files)): ?>
        <?php foreach ($css_files as $css): ?>
            <link href="<?php echo url($css); ?>" rel="stylesheet">
        <?php endforeach; ?>
    <?php endif; ?>
    
    <style>
        :root {
            --squidjob-primary: #7c3aed;
            --squidjob-secondary: #6366f1;
            --squidjob-success: #10b981;
            --squidjob-danger: #ef4444;
            --squidjob-warning: #f59e0b;
            --squidjob-info: #3b82f6;
            --squidjob-light: #f8fafc;
            --squidjob-dark: #1e293b;
        }
        
        body {
            background-color: #f8fafc;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .navbar-brand {
            color: var(--squidjob-primary) !important;
            font-weight: 700;
            font-size: 1.5rem;
        }
        
        .navbar {
            background: white !important;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .btn-primary {
            background-color: var(--squidjob-primary);
            border-color: var(--squidjob-primary);
        }
        
        .btn-primary:hover {
            background-color: #6d28d9;
            border-color: #6d28d9;
        }
        
        .text-primary {
            color: var(--squidjob-primary) !important;
        }
        
        .bg-primary {
            background-color: var(--squidjob-primary) !important;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white">
        <div class="container-fluid">
            <a class="navbar-brand" href="<?php echo url('dashboard'); ?>">
                <i class="fas fa-squid"></i> SquidJob
            </a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo url('dashboard'); ?>">
                            <i class="fas fa-tachometer-alt"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="tendersDropdown" role="button" data-bs-toggle="dropdown">
                            <i class="fas fa-file-contract"></i> Tenders
                        </a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="<?php echo url('tenders'); ?>">All Tenders</a></li>
                            <li><a class="dropdown-item" href="<?php echo url('tenders/create'); ?>">Create Tender</a></li>
                            <li><a class="dropdown-item" href="<?php echo url('my-tenders'); ?>">My Tenders</a></li>
                            <li><a class="dropdown-item" href="<?php echo url('assigned-tenders'); ?>">Assigned Tenders</a></li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo url('bids'); ?>">
                            <i class="fas fa-handshake"></i> Bids
                        </a>
                    </li>
                </ul>
                
                <ul class="navbar-nav">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                            <i class="fas fa-user-circle"></i> <?php echo e($user['first_name'] ?? 'User'); ?>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="<?php echo url('profile'); ?>">Profile</a></li>
                            <li><a class="dropdown-item" href="<?php echo url('change-password'); ?>">Change Password</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <form method="POST" action="<?php echo url('logout'); ?>" class="d-inline">
                                    <input type="hidden" name="_token" value="<?php echo $csrf_token; ?>">
                                    <button type="submit" class="dropdown-item">
                                        <i class="fas fa-sign-out-alt"></i> Logout
                                    </button>
                                </form>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    
    <!-- Flash Messages -->
    <?php if (isset($flash) && is_array($flash)): ?>
        <?php foreach ($flash as $type => $message): ?>
            <?php if ($message): ?>
                <div class="alert alert-<?php echo $type === 'error' ? 'danger' : $type; ?> alert-dismissible fade show m-3" role="alert">
                    <?php echo e($message); ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>
        <?php endforeach; ?>
    <?php endif; ?>
    
    <!-- Breadcrumbs -->
    <?php if (isset($breadcrumbs) && !empty($breadcrumbs)): ?>
        <nav aria-label="breadcrumb" class="container-fluid mt-3">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="<?php echo url('dashboard'); ?>">Home</a></li>
                <?php foreach ($breadcrumbs as $index => $breadcrumb): ?>
                    <?php if ($index === count($breadcrumbs) - 1): ?>
                        <li class="breadcrumb-item active" aria-current="page"><?php echo e($breadcrumb['title']); ?></li>
                    <?php else: ?>
                        <li class="breadcrumb-item">
                            <?php if ($breadcrumb['url']): ?>
                                <a href="<?php echo $breadcrumb['url']; ?>"><?php echo e($breadcrumb['title']); ?></a>
                            <?php else: ?>
                                <?php echo e($breadcrumb['title']); ?>
                            <?php endif; ?>
                        </li>
                    <?php endif; ?>
                <?php endforeach; ?>
            </ol>
        </nav>
    <?php endif; ?>
    
    <!-- Main Content -->
    <main class="main-content">