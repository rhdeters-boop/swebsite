import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    // In development, we'll create a test account or use a simple configuration
    if (process.env.NODE_ENV === 'development') {
      // For development, we'll use a simple console log approach
      this.isDevelopment = true;
      console.log('📧 EmailService initialized in development mode - emails will be logged to console');
    } else {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  // Generic notification email helper used by NotificationService
  async sendNotificationEmail(email, subject, content) {
    try {
      if (this.isDevelopment) {
        console.log('📧 [DEVELOPMENT] Notification email would be sent to:', email);
        console.log('📧 [DEVELOPMENT] Subject:', subject);
        console.log('📧 [DEVELOPMENT] Content:', content);
        return {
          success: true,
          messageId: 'dev-notification-' + Date.now(),
          isDevelopment: true,
        };
      }

      if (!this.transporter) {
        console.warn('Email transporter not configured. Skipping send.');
        return { success: false, message: 'Email transporter not configured' };
      }

      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@voidofdesire.com',
        to: email,
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><title>${subject}</title></head>
          <body style="font-family: Arial, sans-serif; background:#1a1a2e; color:#e5e7eb; padding:16px;">
            <div style="max-width:600px;margin:0 auto;background:#16213e;border:1px solid #7c3aed;border-radius:10px;padding:24px;">
              <h2 style="margin-top:0;margin-bottom:12px;color:#c084fc;">${subject}</h2>
              <p style="margin:0;white-space:pre-line;color:#e5e7eb;">${content}</p>
            </div>
            <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">© ${new Date().getFullYear()} Void of Desire</p>
          </body>
          </html>
        `,
        text: content,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Notification email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending notification email:', error);
      return { success: false, message: 'Failed to send notification email' };
    }
  }

  async sendPasswordResetEmail(email, resetToken, displayName) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@voidofdesire.com',
      to: email,
      subject: 'Reset Your Void of Desire Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #e5e7eb; background: #1a1a2e; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #16213e; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #7c3aed; }
            .button { display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px; }
            .warning { background: #1f2937; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${displayName}!</h2>
              <p>We received a request to reset your password for your Void of Desire account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <a href="${resetUrl}" class="button">Reset My Password</a>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #1a1a2e; padding: 10px; border-radius: 4px; border: 1px solid #374151;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in 1 hour for security reasons</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              
              <p>If you continue to have problems, please contact our support team.</p>
              
              <p>Best regards,<br>The Void of Desire Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${email}</p>
              <p>© 2025 Void of Desire. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${displayName}!
        
        We received a request to reset your password for your Void of Desire account.
        
        Please click the following link to reset your password:
        ${resetUrl}
        
        ⚠️ Important:
        - This link will expire in 1 hour for security reasons
        - If you didn't request this reset, please ignore this email
        - Never share this link with anyone
        
        If you continue to have problems, please contact our support team.
        
        Best regards,
        The Void of Desire Team
        
        ---
        This email was sent to ${email}
        © 2025 Void of Desire. All rights reserved.
      `
    };

    try {
      if (this.isDevelopment) {
        // In development, just log the email details
        console.log('📧 [DEVELOPMENT] Password reset email would be sent to:', email);
        console.log('📧 [DEVELOPMENT] Reset URL:', resetUrl);
        console.log('📧 [DEVELOPMENT] Email subject: Reset Your Void of Desire Password');
        console.log('📧 [DEVELOPMENT] Email contains reset link and expires in 1 hour');
        
        return { 
          success: true, 
          messageId: 'dev-' + Date.now(),
          isDevelopment: true,
          resetUrl: resetUrl
        };
      }
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Password reset email sent:', info.messageId);
      
      // For development, show preview URL if using Ethereal
      if (process.env.NODE_ENV === 'development' && info.previewURL) {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendPasswordResetConfirmation(email, displayName) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@voidofdesire.com',
      to: email,
      subject: 'Password Successfully Reset - Void of Desire',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #e5e7eb; background: #1a1a2e; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #16213e; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #10b981; }
            .footer { text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px; }
            .success { background: #1f2937; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
            </div>
            <div class="content">
              <h2>Hi ${displayName}!</h2>
              
              <div class="success">
                <strong>✅ Success!</strong> Your password has been successfully reset.
              </div>
              
              <p>Your Void of Desire account password has been updated. You can now log in with your new password.</p>
              
              <p><strong>What's next?</strong></p>
              <ul>
                <li>Log in to your account with your new password</li>
                <li>Make sure to store your password securely</li>
                <li>Consider enabling two-factor authentication for extra security</li>
              </ul>
              
              <p>If you didn't make this change, please contact our support team immediately.</p>
              
              <p>Best regards,<br>The Void of Desire Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${email}</p>
              <p>© 2025 Void of Desire. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hi ${displayName}!
        
        ✅ Success! Your password has been successfully reset.
        
        Your Void of Desire account password has been updated. You can now log in with your new password.
        
        What's next?
        - Log in to your account with your new password
        - Make sure to store your password securely
        - Consider enabling two-factor authentication for extra security
        
        If you didn't make this change, please contact our support team immediately.
        
        Best regards,
        The Void of Desire Team
        
        ---
        This email was sent to ${email}
        © 2025 Void of Desire. All rights reserved.
      `
    };

    try {
      if (this.isDevelopment) {
        // In development, just log the email details
        console.log('📧 [DEVELOPMENT] Password reset confirmation would be sent to:', email);
        console.log('📧 [DEVELOPMENT] Email subject: Password Successfully Reset - Void of Desire');
        console.log('📧 [DEVELOPMENT] Confirmation that password was reset for user:', displayName);
        
        return { 
          success: true, 
          messageId: 'dev-confirmation-' + Date.now(),
          isDevelopment: true
        };
      }
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Password reset confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending password reset confirmation email:', error);
      throw new Error('Failed to send password reset confirmation email');
    }
  }
}

export default new EmailService();
