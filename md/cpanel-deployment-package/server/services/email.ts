import nodemailer from 'nodemailer';
import { storage } from '../storage';

interface TenderAssignmentEmailData {
  recipientEmail: string;
  recipientName: string;
  tenderTitle: string;
  tenderReferenceNo: string;
  startDate: string;
  endDate: string;
  assignedByName: string;
  comment?: string;
}

class EmailService {
  private async createTransporter() {
    const settings = await storage.getGeneralSettings();
    
    if (!settings || !settings.emailHost || !settings.emailUser || !settings.emailPassword) {
      throw new Error('Email settings not configured. Please configure SMTP settings in General Settings.');
    }

    return nodemailer.createTransporter({
      host: settings.emailHost,
      port: settings.emailPort || 587,
      secure: settings.emailPort === 465, // true for port 465, false for other ports
      auth: {
        user: settings.emailUser,
        pass: settings.emailPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendTenderAssignmentEmail(data: TenderAssignmentEmailData): Promise<boolean> {
    try {
      const settings = await storage.getGeneralSettings();
      const transporter = await this.createTransporter();
      
      const subject = `New tender assigned: ${data.tenderTitle} (${data.startDate} - ${data.endDate})`;
      
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0076a8; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">TENDER247</h1>
            <p style="margin: 5px 0 0 0;">Tender Management System</p>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #0076a8; margin-top: 0;">New Tender Assignment</h2>
            
            <p>Dear ${data.recipientName},</p>
            
            <p>A new tender has been assigned to you. Here are the details:</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #0076a8; margin-top: 0;">Tender Details</h3>
              <p><strong>Title:</strong> ${data.tenderTitle}</p>
              <p><strong>Reference No:</strong> ${data.tenderReferenceNo}</p>
              <p><strong>Start Date:</strong> ${data.startDate}</p>
              <p><strong>End Date:</strong> ${data.endDate}</p>
              <p><strong>Assigned By:</strong> ${data.assignedByName}</p>
              ${data.comment ? `<p><strong>Comment:</strong> ${data.comment}</p>` : ''}
            </div>
            
            <p>Please log in to the Tender Management System to view the complete tender details and take necessary action.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background-color: #0076a8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                View Tender Details
              </a>
            </div>
            
            <p>Best regards,<br>
            <strong>Tender247 Team</strong></p>
          </div>
          
          <div style="background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>This is an automated email from the Tender Management System. Please do not reply to this email.</p>
          </div>
        </div>
      `;

      const textBody = `
Dear ${data.recipientName},

A new tender has been assigned to you.

Tender Details:
- Title: ${data.tenderTitle}
- Reference No: ${data.tenderReferenceNo}
- Start Date: ${data.startDate}
- End Date: ${data.endDate}
- Assigned By: ${data.assignedByName}
${data.comment ? `- Comment: ${data.comment}` : ''}

Please log in to the Tender Management System to view the complete tender details and take necessary action.

Best regards,
Tender247 Team

---
This is an automated email from the Tender Management System. Please do not reply to this email.
      `;

      const mailOptions = {
        from: {
          name: settings?.emailFromName || 'SquidJob System',
          address: settings?.emailFrom || settings?.emailUser || 'noreply@squidjob.com'
        },
        to: data.recipientEmail,
        subject: subject,
        text: textBody,
        html: htmlBody,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Tender assignment email sent to ${data.recipientEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending tender assignment email:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const transporter = await this.createTransporter();
      await transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();