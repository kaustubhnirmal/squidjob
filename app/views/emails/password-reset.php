<?php
/**
 * Password Reset Email Template
 * SquidJob Tender Management System
 * 
 * Professional email template for password reset notifications
 */

$userName = $user['first_name'] ?? 'User';
$appName = $app_name ?? 'SquidJob';
$resetUrl = $reset_url ?? '#';
$expiresIn = $expires_in ?? '1 hour';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - <?php echo e($appName); ?></title>
    <style>
        /* Reset styles */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        /* Base styles */
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #f4f4f7;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .email-logo {
            margin-bottom: 20px;
        }
        
        .email-title {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            line-height: 1.2;
        }
        
        .email-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            margin: 10px 0 0 0;
            line-height: 1.4;
        }
        
        .email-content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 20px 0;
        }
        
        .message {
            font-size: 16px;
            color: #4a5568;
            line-height: 1.6;
            margin: 0 0 30px 0;
        }
        
        .cta-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .cta-button {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.2s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .security-notice {
            background-color: #fef5e7;
            border-left: 4px solid #f6ad55;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .security-notice-title {
            font-size: 16px;
            font-weight: 600;
            color: #c05621;
            margin: 0 0 10px 0;
        }
        
        .security-notice-text {
            font-size: 14px;
            color: #9c4221;
            margin: 0;
            line-height: 1.5;
        }
        
        .expiry-notice {
            background-color: #e6fffa;
            border: 1px solid #81e6d9;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        
        .expiry-text {
            font-size: 14px;
            color: #234e52;
            margin: 0;
            font-weight: 500;
        }
        
        .alternative-link {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .alternative-title {
            font-size: 14px;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 10px 0;
        }
        
        .alternative-url {
            font-size: 12px;
            color: #718096;
            word-break: break-all;
            margin: 0;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .email-footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-text {
            font-size: 14px;
            color: #718096;
            margin: 0 0 15px 0;
            line-height: 1.5;
        }
        
        .footer-links {
            margin: 20px 0;
        }
        
        .footer-link {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
            margin: 0 15px;
        }
        
        .footer-link:hover {
            text-decoration: underline;
        }
        
        .copyright {
            font-size: 12px;
            color: #a0aec0;
            margin: 20px 0 0 0;
        }
        
        /* Responsive styles */
        @media only screen and (max-width: 600px) {
            .email-header,
            .email-content,
            .email-footer {
                padding: 30px 20px !important;
            }
            
            .email-title {
                font-size: 24px !important;
            }
            
            .cta-button {
                padding: 14px 24px !important;
                font-size: 15px !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="email-logo">
                <img src="<?php echo $app_url ?? ''; ?>/assets/images/squidjob-logo-white.svg" alt="<?php echo e($appName); ?> Logo" width="50" height="50" style="display: block; margin: 0 auto;">
            </div>
            <h1 class="email-title"><?php echo e($appName); ?></h1>
            <p class="email-subtitle">Password Reset Request</p>
        </div>

        <!-- Content -->
        <div class="email-content">
            <p class="greeting">Hello <?php echo e($userName); ?>,</p>
            
            <p class="message">
                We received a request to reset the password for your <?php echo e($appName); ?> account. 
                If you made this request, click the button below to create a new password.
            </p>

            <!-- Call to Action -->
            <div class="cta-container">
                <a href="<?php echo e($resetUrl); ?>" class="cta-button">Reset My Password</a>
            </div>

            <!-- Expiry Notice -->
            <div class="expiry-notice">
                <p class="expiry-text">
                    <strong>⏰ This link expires in <?php echo e($expiresIn); ?></strong>
                </p>
            </div>

            <!-- Security Notice -->
            <div class="security-notice">
                <p class="security-notice-title">🔒 Security Notice</p>
                <p class="security-notice-text">
                    If you didn't request a password reset, please ignore this email. Your password will remain unchanged. 
                    For security reasons, this link can only be used once.
                </p>
            </div>

            <!-- Alternative Link -->
            <div class="alternative-link">
                <p class="alternative-title">Having trouble with the button? Copy and paste this link:</p>
                <p class="alternative-url"><?php echo e($resetUrl); ?></p>
            </div>

            <p class="message">
                If you continue to have problems, please contact our support team. We're here to help!
            </p>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p class="footer-text">
                This email was sent from <?php echo e($appName); ?> Tender Management System.<br>
                You're receiving this because a password reset was requested for your account.
            </p>
            
            <div class="footer-links">
                <a href="<?php echo $app_url ?? ''; ?>" class="footer-link">Visit Website</a>
                <a href="<?php echo $app_url ?? ''; ?>/support" class="footer-link">Get Support</a>
                <a href="<?php echo $app_url ?? ''; ?>/privacy" class="footer-link">Privacy Policy</a>
            </div>
            
            <p class="copyright">
                &copy; <?php echo date('Y'); ?> <?php echo e($appName); ?>. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>