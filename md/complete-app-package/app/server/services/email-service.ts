import nodemailer from 'nodemailer';

console.log("Email service initialized with SMTP configuration only.");

// SMTP Configuration - will be loaded from database
let smtpTransporter: nodemailer.Transporter | null = null;

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  // Initialize SMTP transporter from database settings
  static async initializeSMTP() {
    try {
      // Import storage here to avoid circular dependencies
      const { storage } = await import('../storage');
      const settings = await storage.getGeneralSettings();
      
      if (settings && settings.emailHost && settings.emailUser && settings.emailPassword) {
        const smtpConfig = {
          host: settings.emailHost,
          port: parseInt(String(settings.emailPort || '465')),
          secure: settings.emailSecure || true, // true for 465, false for other ports
          auth: {
            user: settings.emailUser,
            pass: settings.emailPassword,
          },
          // Add additional security options
          tls: {
            rejectUnauthorized: false // Accept self-signed certificates
          }
        };

        smtpTransporter = nodemailer.createTransport(smtpConfig);
        console.log('SMTP transporter initialized successfully');
        return true;
      }
    } catch (error) {
      console.error('Failed to initialize SMTP:', error);
      smtpTransporter = null;
    }
    return false;
  }

  // Test email configuration
  static async testEmailConfiguration(config: {
    host: string;
    port: number;
    username: string;
    password: string;
    useSSL: boolean;
    testEmail: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const testTransporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.useSSL,
        auth: {
          user: config.username,
          pass: config.password,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      await testTransporter.verify();

      // Send test email
      await testTransporter.sendMail({
        from: config.username,
        to: config.testEmail,
        subject: 'SquidJob Email Configuration Test',
        text: 'This is a test email to verify your email configuration is working correctly.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Email Configuration Test</h2>
            <p>This is a test email to verify your email configuration is working correctly.</p>
            <p>If you received this email, your SMTP settings are configured properly.</p>
            <p>Best regards,<br>SquidJob Team</p>
          </div>
        `
      });

      return { success: true, message: 'Email configuration test successful! Test email sent.' };
    } catch (error: any) {
      console.error('Email test failed:', error);
      return { 
        success: false, 
        message: `Email configuration test failed: ${error.message || 'Unknown error'}` 
      };
    }
  }

  static async sendEmail(params: EmailParams): Promise<boolean> {
    // Initialize SMTP if not already done
    if (!smtpTransporter) {
      await this.initializeSMTP();
    }

    if (smtpTransporter) {
      try {
        await smtpTransporter.sendMail({
          from: params.from,
          to: params.to,
          subject: params.subject,
          text: params.text,
          html: params.html,
        });
        console.log(`Email sent successfully via SMTP to ${params.to}`);
        return true;
      } catch (error) {
        console.error('SMTP email error:', error);
        return false;
      }
    }

    console.log("Email sending failed - SMTP configuration not available. Please configure SMTP settings in General Settings.");
    return false;
  }

  static async sendReminderNotification(
    userEmail: string,
    userName: string,
    tenderTitle: string,
    tenderId: number,
    reminderDate: Date,
    comments?: string
  ): Promise<boolean> {
    const subject = `Tender Reminder: ${tenderTitle} (ID: ${tenderId})`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Tender Reminder Notification</h2>
        
        <p>Hello ${userName},</p>
        
        <p>This is a reminder for the following tender:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">Tender Details</h3>
          <p><strong>Title:</strong> ${tenderTitle}</p>
          <p><strong>Tender ID:</strong> ${tenderId}</p>
          <p><strong>Reminder Date:</strong> ${reminderDate.toLocaleDateString()} at ${reminderDate.toLocaleTimeString()}</p>
          ${comments ? `<p><strong>Notes:</strong> ${comments}</p>` : ''}
        </div>
        
        <p>Please log into the Tender247 system to view the complete tender details and take necessary actions.</p>
        
        <p>Best regards,<br>Tender247 Team</p>
        
        <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated reminder from the Tender247 Bid Management System.
        </p>
      </div>
    `;

    const text = `
Tender Reminder Notification

Hello ${userName},

This is a reminder for the following tender:

Tender Details:
- Title: ${tenderTitle}
- Tender ID: ${tenderId}
- Reminder Date: ${reminderDate.toLocaleDateString()} at ${reminderDate.toLocaleTimeString()}
${comments ? `- Notes: ${comments}` : ''}

Please log into the Tender247 system to view the complete tender details and take necessary actions.

Best regards,
Tender247 Team

This is an automated reminder from the Tender247 Bid Management System.
    `;

    return await this.sendEmail({
      to: userEmail,
      from: 'noreply@tender247.com', // Use your verified sender email
      subject,
      text,
      html
    });
  }

  static async sendTenderAssignmentNotification(
    userEmail: string,
    userName: string,
    tenderTitle: string,
    tenderId: number,
    assignedByName: string,
    comments?: string
  ): Promise<boolean> {
    const subject = `New Tender Assignment: ${tenderTitle} (ID: ${tenderId})`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Tender Assignment</h2>
        
        <p>Hello ${userName},</p>
        
        <p>You have been assigned a new tender:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">Tender Details</h3>
          <p><strong>Title:</strong> ${tenderTitle}</p>
          <p><strong>Tender ID:</strong> ${tenderId}</p>
          <p><strong>Assigned By:</strong> ${assignedByName}</p>
          ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
        </div>
        
        <p>Please log into the Tender247 system to view the complete tender details and begin processing.</p>
        
        <p>Best regards,<br>Tender247 Team</p>
        
        <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated notification from the Tender247 Bid Management System.
        </p>
      </div>
    `;

    const text = `
New Tender Assignment

Hello ${userName},

You have been assigned a new tender:

Tender Details:
- Title: ${tenderTitle}
- Tender ID: ${tenderId}
- Assigned By: ${assignedByName}
${comments ? `- Comments: ${comments}` : ''}

Please log into the Tender247 system to view the complete tender details and begin processing.

Best regards,
Tender247 Team

This is an automated notification from the Tender247 Bid Management System.
    `;

    return await this.sendEmail({
      to: userEmail,
      from: 'noreply@tender247.com', // Use your verified sender email
      subject,
      text,
      html
    });
  }

  static async sendNewUserRegistrationNotification(
    userEmail: string,
    userName: string,
    username: string,
    role: string,
    department?: string,
    designation?: string,
    adminEmail?: string
  ): Promise<boolean> {
    const subject = `Welcome to SquidJob Tender247 - Account Created`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Welcome to SquidJob Tender247!</h2>
        
        <p>Hello ${userName},</p>
        
        <p>Your account has been successfully created in the SquidJob Tender247 Bid Management System. You can now access your account and start managing tenders.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">Account Details</h3>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Role:</strong> ${role}</p>
          ${department ? `<p><strong>Department:</strong> ${department}</p>` : ''}
          ${designation ? `<p><strong>Designation:</strong> ${designation}</p>` : ''}
        </div>
        
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p style="margin: 0; color: #991b1b;"><strong>Important:</strong> Please contact your system administrator to obtain your login password.</p>
        </div>
        
        <p>Once you have your password, you can log in to the system and:</p>
        <ul>
          <li>View and manage assigned tenders</li>
          <li>Upload and organize tender documents</li>
          <li>Track tender progress and deadlines</li>
          <li>Collaborate with team members</li>
          <li>Generate reports and analytics</li>
        </ul>
        
        <p>If you have any questions or need assistance, please contact your system administrator.</p>
        
        <p>Best regards,<br>SquidJob Tender247 Team</p>
        
        <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated notification from the SquidJob Tender247 Bid Management System.
        </p>
      </div>
    `;

    const text = `
Welcome to SquidJob Tender247!

Hello ${userName},

Your account has been successfully created in the SquidJob Tender247 Bid Management System. You can now access your account and start managing tenders.

Account Details:
- Name: ${userName}
- Username: ${username}
- Email: ${userEmail}
- Role: ${role}
${department ? `- Department: ${department}` : ''}
${designation ? `- Designation: ${designation}` : ''}

IMPORTANT: Please contact your system administrator to obtain your login password.

Once you have your password, you can log in to the system and:
- View and manage assigned tenders
- Upload and organize tender documents
- Track tender progress and deadlines
- Collaborate with team members
- Generate reports and analytics

If you have any questions or need assistance, please contact your system administrator.

Best regards,
SquidJob Tender247 Team

This is an automated notification from the SquidJob Tender247 Bid Management System.
    `;

    // Send email to the new user
    const userEmailSent = await this.sendEmail({
      to: userEmail,
      from: 'noreply@squidjob.com',
      subject,
      text,
      html
    });

    // Send notification to admin if admin email is provided
    if (adminEmail && adminEmail !== userEmail) {
      const adminSubject = `New User Registration - ${userName} (${role})`;
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">New User Registration Alert</h2>
          
          <p>A new user has been registered in the SquidJob Tender247 system:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">User Details</h3>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Role:</strong> ${role}</p>
            ${department ? `<p><strong>Department:</strong> ${department}</p>` : ''}
            ${designation ? `<p><strong>Designation:</strong> ${designation}</p>` : ''}
            <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <p>The user has been notified about their account creation and instructed to contact you for their login password.</p>
          
          <p>Best regards,<br>SquidJob Tender247 System</p>
        </div>
      `;

      const adminText = `
New User Registration Alert

A new user has been registered in the SquidJob Tender247 system:

User Details:
- Name: ${userName}
- Username: ${username}
- Email: ${userEmail}
- Role: ${role}
${department ? `- Department: ${department}` : ''}
${designation ? `- Designation: ${designation}` : ''}
- Registration Date: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

The user has been notified about their account creation and instructed to contact you for their login password.

Best regards,
SquidJob Tender247 System
      `;

      await this.sendEmail({
        to: adminEmail,
        from: 'noreply@squidjob.com',
        subject: adminSubject,
        text: adminText,
        html: adminHtml
      });
    }

    return userEmailSent;
  }
}