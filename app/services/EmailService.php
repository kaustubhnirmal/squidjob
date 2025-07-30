<?php
/**
 * Email Service
 * SquidJob Tender Management System
 * 
 * Handles email notifications for authentication and system events
 */

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailService {
    
    private $mailer;
    private $config;
    
    public function __construct() {
        $this->config = config('app.mail');
        $this->setupMailer();
    }
    
    /**
     * Setup PHPMailer configuration
     */
    private function setupMailer() {
        $this->mailer = new PHPMailer(true);
        
        try {
            // Server settings
            $this->mailer->isSMTP();
            $this->mailer->Host = $this->config['host'];
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $this->config['username'];
            $this->mailer->Password = $this->config['password'];
            $this->mailer->SMTPSecure = $this->config['encryption'] === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
            $this->mailer->Port = $this->config['port'];
            
            // Default sender
            $this->mailer->setFrom($this->config['from']['address'], $this->config['from']['name']);
            
            // Character set
            $this->mailer->CharSet = 'UTF-8';
            
        } catch (Exception $e) {
            logMessage('ERROR', 'Email service setup failed: ' . $e->getMessage());
        }
    }
    
    /**
     * Send password reset email
     */
    public function sendPasswordResetEmail($user, $resetToken) {
        try {
            $resetUrl = url("auth/reset-password?token={$resetToken}");
            
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($user['email'], $user['first_name'] . ' ' . $user['last_name']);
            
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Password Reset Request - ' . config('app.name');
            
            // Load email template
            $htmlBody = $this->loadTemplate('password-reset', [
                'user' => $user,
                'reset_url' => $resetUrl,
                'app_name' => config('app.name'),
                'app_url' => config('app.url'),
                'expires_in' => '1 hour'
            ]);
            
            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $this->generatePlainTextBody($user, $resetUrl);
            
            $result = $this->mailer->send();
            
            if ($result) {
                logMessage('INFO', "Password reset email sent to {$user['email']}");
                return true;
            }
            
            return false;
            
        } catch (Exception $e) {
            logMessage('ERROR', 'Failed to send password reset email: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send email verification email
     */
    public function sendEmailVerificationEmail($user, $verificationToken) {
        try {
            $verificationUrl = url("auth/verify-email?token={$verificationToken}");
            
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($user['email'], $user['first_name'] . ' ' . $user['last_name']);
            
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Verify Your Email Address - ' . config('app.name');
            
            // Load email template
            $htmlBody = $this->loadTemplate('email-verification', [
                'user' => $user,
                'verification_url' => $verificationUrl,
                'app_name' => config('app.name'),
                'app_url' => config('app.url')
            ]);
            
            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $this->generateVerificationPlainText($user, $verificationUrl);
            
            $result = $this->mailer->send();
            
            if ($result) {
                logMessage('INFO', "Email verification sent to {$user['email']}");
                return true;
            }
            
            return false;
            
        } catch (Exception $e) {
            logMessage('ERROR', 'Failed to send email verification: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send account lockout notification
     */
    public function sendAccountLockoutNotification($user, $lockoutDuration) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($user['email'], $user['first_name'] . ' ' . $user['last_name']);
            
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Account Security Alert - ' . config('app.name');
            
            // Load email template
            $htmlBody = $this->loadTemplate('account-lockout', [
                'user' => $user,
                'lockout_duration' => $lockoutDuration,
                'app_name' => config('app.name'),
                'app_url' => config('app.url'),
                'support_email' => config('app.mail.from.address')
            ]);
            
            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $this->generateLockoutPlainText($user, $lockoutDuration);
            
            $result = $this->mailer->send();
            
            if ($result) {
                logMessage('INFO', "Account lockout notification sent to {$user['email']}");
                return true;
            }
            
            return false;
            
        } catch (Exception $e) {
            logMessage('ERROR', 'Failed to send lockout notification: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send welcome email for new users
     */
    public function sendWelcomeEmail($user) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($user['email'], $user['first_name'] . ' ' . $user['last_name']);
            
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'Welcome to ' . config('app.name');
            
            // Load email template
            $htmlBody = $this->loadTemplate('welcome', [
                'user' => $user,
                'app_name' => config('app.name'),
                'app_url' => config('app.url'),
                'dashboard_url' => url('dashboard')
            ]);
            
            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $this->generateWelcomePlainText($user);
            
            $result = $this->mailer->send();
            
            if ($result) {
                logMessage('INFO', "Welcome email sent to {$user['email']}");
                return true;
            }
            
            return false;
            
        } catch (Exception $e) {
            logMessage('ERROR', 'Failed to send welcome email: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Load email template
     */
    private function loadTemplate($template, $data = []) {
        $templatePath = APP_ROOT . "/app/views/emails/{$template}.php";
        
        if (!file_exists($templatePath)) {
            // Fallback to basic template
            return $this->generateBasicTemplate($template, $data);
        }
        
        // Extract data for template
        extract($data);
        
        // Capture template output
        ob_start();
        include $templatePath;
        return ob_get_clean();
    }
    
    /**
     * Generate basic email template as fallback
     */
    private function generateBasicTemplate($type, $data) {
        $appName = $data['app_name'] ?? 'SquidJob';
        $userName = $data['user']['first_name'] ?? 'User';
        
        $baseStyle = '
            <style>
                body { font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
                .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .btn:hover { background: #5a6fd8; }
            </style>
        ';
        
        switch ($type) {
            case 'password-reset':
                return "
                    <html><head>{$baseStyle}</head><body>
                        <div class='container'>
                            <div class='header'>
                                <h1>{$appName}</h1>
                                <h2>Password Reset Request</h2>
                            </div>
                            <div class='content'>
                                <p>Hello {$userName},</p>
                                <p>You have requested to reset your password. Click the button below to reset it:</p>
                                <a href='{$data['reset_url']}' class='btn'>Reset Password</a>
                                <p>This link will expire in {$data['expires_in']}.</p>
                                <p>If you didn't request this, please ignore this email.</p>
                            </div>
                            <div class='footer'>
                                <p>&copy; " . date('Y') . " {$appName}. All rights reserved.</p>
                            </div>
                        </div>
                    </body></html>
                ";
                
            case 'email-verification':
                return "
                    <html><head>{$baseStyle}</head><body>
                        <div class='container'>
                            <div class='header'>
                                <h1>{$appName}</h1>
                                <h2>Verify Your Email</h2>
                            </div>
                            <div class='content'>
                                <p>Hello {$userName},</p>
                                <p>Please verify your email address by clicking the button below:</p>
                                <a href='{$data['verification_url']}' class='btn'>Verify Email</a>
                                <p>If you didn't create an account, please ignore this email.</p>
                            </div>
                            <div class='footer'>
                                <p>&copy; " . date('Y') . " {$appName}. All rights reserved.</p>
                            </div>
                        </div>
                    </body></html>
                ";
                
            case 'account-lockout':
                return "
                    <html><head>{$baseStyle}</head><body>
                        <div class='container'>
                            <div class='header' style='background: #dc3545;'>
                                <h1>{$appName}</h1>
                                <h2>Account Security Alert</h2>
                            </div>
                            <div class='content'>
                                <p>Hello {$userName},</p>
                                <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
                                <p>Lockout duration: {$data['lockout_duration']} minutes</p>
                                <p>If this wasn't you, please contact support immediately.</p>
                                <p>Support: {$data['support_email']}</p>
                            </div>
                            <div class='footer'>
                                <p>&copy; " . date('Y') . " {$appName}. All rights reserved.</p>
                            </div>
                        </div>
                    </body></html>
                ";
                
            case 'welcome':
                return "
                    <html><head>{$baseStyle}</head><body>
                        <div class='container'>
                            <div class='header'>
                                <h1>Welcome to {$appName}!</h1>
                            </div>
                            <div class='content'>
                                <p>Hello {$userName},</p>
                                <p>Welcome to {$appName}! Your account has been successfully created.</p>
                                <p>You can now access your dashboard and start managing tenders efficiently.</p>
                                <a href='{$data['dashboard_url']}' class='btn'>Go to Dashboard</a>
                                <p>If you have any questions, feel free to contact our support team.</p>
                            </div>
                            <div class='footer'>
                                <p>&copy; " . date('Y') . " {$appName}. All rights reserved.</p>
                            </div>
                        </div>
                    </body></html>
                ";
        }
        
        return '';
    }
    
    /**
     * Generate plain text body for password reset
     */
    private function generatePlainTextBody($user, $resetUrl) {
        $appName = config('app.name');
        return "
Hello {$user['first_name']},

You have requested to reset your password for {$appName}.

Please visit the following link to reset your password:
{$resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email.

Best regards,
The {$appName} Team
        ";
    }
    
    /**
     * Generate plain text for email verification
     */
    private function generateVerificationPlainText($user, $verificationUrl) {
        $appName = config('app.name');
        return "
Hello {$user['first_name']},

Please verify your email address for {$appName} by visiting:
{$verificationUrl}

If you didn't create an account, please ignore this email.

Best regards,
The {$appName} Team
        ";
    }
    
    /**
     * Generate plain text for lockout notification
     */
    private function generateLockoutPlainText($user, $lockoutDuration) {
        $appName = config('app.name');
        return "
Hello {$user['first_name']},

Your {$appName} account has been temporarily locked due to multiple failed login attempts.

Lockout duration: {$lockoutDuration} minutes

If this wasn't you, please contact support immediately.

Best regards,
The {$appName} Team
        ";
    }
    
    /**
     * Generate plain text for welcome email
     */
    private function generateWelcomePlainText($user) {
        $appName = config('app.name');
        return "
Hello {$user['first_name']},

Welcome to {$appName}! Your account has been successfully created.

You can now access your dashboard and start managing tenders efficiently.

Visit: " . url('dashboard') . "

If you have any questions, feel free to contact our support team.

Best regards,
The {$appName} Team
        ";
    }
    
    /**
     * Test email configuration
     */
    public function testConnection() {
        try {
            return $this->mailer->smtpConnect();
        } catch (Exception $e) {
            logMessage('ERROR', 'Email connection test failed: ' . $e->getMessage());
            return false;
        }
    }
}