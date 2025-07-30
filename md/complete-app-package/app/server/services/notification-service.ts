import { storage } from "../storage";

interface NotificationOptions {
  to: string;
  subject?: string;
  message: string;
  type: 'email' | 'whatsapp' | 'both';
}

/**
 * Service for handling notifications (email and WhatsApp)
 */
export class NotificationService {
  /**
   * Send a notification via email and/or WhatsApp
   */
  static async sendNotification(options: NotificationOptions): Promise<boolean> {
    const { to, subject, message, type } = options;
    
    try {
      if (type === 'email' || type === 'both') {
        await this.sendEmail(to, subject || 'Notification from StarTender', message);
      }
      
      if (type === 'whatsapp' || type === 'both') {
        await this.sendWhatsApp(to, message);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }
  
  /**
   * Send a notification when a tender is assigned
   */
  static async sendTenderAssignmentNotification(
    tenderId: number,
    assigneeId: number,
    comments?: string
  ): Promise<boolean> {
    try {
      // Get tender and user details
      const tender = await storage.getTender(tenderId);
      const user = await storage.getUser(assigneeId);
      const assignedBy = await storage.getUser(1); // Default to admin user if assignedBy is not provided
      
      if (!tender || !user) {
        throw new Error('Tender or user not found');
      }
      
      // Format dates for email
      const startDate = tender.createdAt ? new Date(tender.createdAt).toLocaleString() : 'N/A';
      const endDate = tender.deadline ? new Date(tender.deadline).toLocaleString() : 'N/A';
      
      // Format notification message as per requirements
      const subject = `New tender assigned: ${tender.title} (${startDate} - ${endDate})`;
      const message = `
Dear ${user.name || user.username},

A new tender has been assigned to you.

Tender Details:
- Title: ${tender.title || 'N/A'}
- Reference Number: ${tender.referenceNo || 'N/A'}
- Authority: ${tender.authority || 'N/A'}
- Start Date: ${startDate}
- End Date: ${endDate}
- Location: ${tender.location || 'N/A'}
${tender.estimatedValue ? `- Estimated Value: ${tender.estimatedValue}` : ''}
${tender.documentFee ? `- Document Fee: ${tender.documentFee}` : ''}
${tender.emdAmount ? `- EMD Amount: ${tender.emdAmount}` : ''}

${comments ? `Additional Comments: ${comments}` : ''}

Please review this tender at your earliest convenience and take necessary actions before the deadline.

You can access the tender details by logging into your StarTender dashboard.

Sincerely,
The StarTender System
${assignedBy ? `On behalf of ${assignedBy.name || assignedBy.username}` : ''}
      `;
      
      // Send notifications using both email and WhatsApp
      return await this.sendNotification({
        to: user.email,
        subject,
        message,
        type: 'email' // Only sending email as per the requirements
      });
    } catch (error) {
      console.error('Error sending tender assignment notification:', error);
      return false;
    }
  }
  
  /**
   * Send an email notification
   * @private
   */
  private static async sendEmail(to: string, subject: string, message: string): Promise<boolean> {
    try {
      console.log(`[EMAIL NOTIFICATION] To: ${to}, Subject: ${subject}`);
      console.log(`Message: ${message}`);
      
      // Check for required environment variables
      const smtpHost = process.env.SMTP_HOST || 'smtp.example.com';
      const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      
      if (!smtpUser || !smtpPass) {
        console.warn('SMTP credentials not configured. Skipping actual email sending.');
        console.log('To enable email sending, configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS environment variables.');
        return true; // Return success but log warning
      }
      
      // Import Node.js nodemailer package
      const nodemailer = await import('nodemailer');
      
      // Create a transporter object using SMTP transport
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      
      // Format HTML version of message with proper line breaks
      const htmlMessage = message
        .replace(/\n/g, '<br>')
        .replace(/\s{2,}/g, '&nbsp;&nbsp;'); // Preserve spacing
      
      // Define email options
      const mailOptions = {
        from: {
          name: 'StarTender System',
          address: smtpUser
        },
        to: to,
        subject: subject,
        text: message, // Plain text version
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">${htmlMessage}</div>` // HTML version
      };
      
      // Send the email
      await transporter.sendMail(mailOptions);
      
      console.log(`Email successfully sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
  
  /**
   * Send a WhatsApp notification
   * @private
   */
  private static async sendWhatsApp(to: string, message: string): Promise<boolean> {
    try {
      console.log(`[WHATSAPP NOTIFICATION] To: ${to}`);
      console.log(`Message: ${message}`);
      
      // In a real implementation, this would use Twilio, MessageBird, or another WhatsApp API
      
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }
}