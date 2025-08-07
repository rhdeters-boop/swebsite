import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { User, PasswordResetToken, Creator } from '../models/index.js';
import EmailService from './EmailService.js';

class AuthService {
  /**
   * Register a new user
   */
  async registerUser({ email, password, displayName, username, wantsToBecomeCreator = false }) {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Check if username is already taken
    if (username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        throw new Error('Username is already taken');
      }
    }

    // Default displayName to username if not provided
    const finalDisplayName = displayName || username;

    // Create user
    const user = await User.create({
      email,
      password,
      displayName: finalDisplayName,
      username
    });

    // If user wants to become a creator, create basic creator profile
    if (wantsToBecomeCreator) {
      await Creator.create({
        userId: user.id,
        displayName: finalDisplayName || 'New Creator',
        bio: 'Welcome to my page! 🌟',
        categories: ['lifestyle'],
        subscriptionPrice: 9.99, // Default price
        socialLinks: {},
        isActive: true,
        isApproved: true // Auto-approve for now
      });
    }

    // Generate JWT token
    const token = this._generateToken(user.id);

    return {
      token,
      user: user.toJSON(),
      isCreator: wantsToBecomeCreator
    };
  }

  /**
   * Login user with email and password
   */
  async loginUser({ email, password }) {
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate JWT token
    const token = this._generateToken(user.id);

    return {
      token,
      user: user.toJSON()
    };
  }

  /**
   * Check if username is available
   */
  async checkUsernameAvailability(username) {
    // Validate username format
    if (!username || username.length < 3 || username.length > 30) {
      throw new Error('Invalid username format');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    const existingUser = await User.findOne({ where: { username } });
    
    return {
      available: !existingUser,
      username
    };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (user) {
      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set expiration time (1 hour from now)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      
      // Invalidate any existing reset tokens for this user
      await PasswordResetToken.update(
        { used: true },
        { where: { userId: user.id, used: false } }
      );
      
      // Create new reset token
      await PasswordResetToken.create({
        userId: user.id,
        token: resetToken,
        expiresAt,
      });
      
      // Send password reset email
      try {
        await EmailService.sendPasswordResetEmail(email, resetToken, user.firstName);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Don't reveal email sending failure to user
      }
    }

    // Always return success for security
    return {
      message: 'If an account with that email exists, we have sent a password reset link.'
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword({ token, password }) {
    // Find valid reset token
    const resetToken = await PasswordResetToken.findOne({
      where: {
        token,
        used: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      include: [{
        model: User,
        as: 'user',
      }],
    });

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Update user password
    await resetToken.user.update({ password });
    
    // Mark token as used
    await resetToken.update({ used: true });

    // Send confirmation email
    try {
      await EmailService.sendPasswordResetConfirmation(
        resetToken.user.email,
        resetToken.user.firstName
      );
    } catch (emailError) {
      console.error('Failed to send password reset confirmation email:', emailError);
    }

    return {
      message: 'Password reset successfully'
    };
  }

  /**
   * Verify reset token validity
   */
  async verifyResetToken(token) {
    const resetToken = await PasswordResetToken.findOne({
      where: {
        token,
        used: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    return {
      message: 'Token is valid'
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, { firstName, lastName, username, displayName, profilePicture }) {
    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({
        where: {
          username,
          id: { [Op.ne]: userId }
        }
      });

      if (existingUser) {
        throw new Error('Username is already taken');
      }
    }

    // Update user
    await User.update(
      {
        firstName,
        lastName,
        username,
        displayName,
        profilePicture,
      },
      {
        where: { id: userId }
      }
    );

    // Fetch updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'username', 'displayName', 'profilePicture', 'isEmailVerified', 'lastLoginAt', 'createdAt', 'updatedAt']
    });

    return updatedUser;
  }

  /**
   * Change user password
   */
  async changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    // Get user with password
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    await user.update({ password: newPassword });

    return {
      message: 'Password changed successfully'
    };
  }

  /**
   * Change user email
   */
  async changeEmail(userId, newEmail) {
    if (!newEmail) {
      throw new Error('New email address is required');
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ 
      where: { 
        email: newEmail,
        id: { [Op.ne]: userId }
      } 
    });

    if (existingUser) {
      throw new Error('Email address is already in use');
    }

    // Get current user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    console.log(`Email change request from ${user.email} to ${newEmail} for user ${userId}`);
    
    // Update email (in production, this should be done only after verification)
    await user.update({ email: newEmail });

    return {
      message: 'Email address updated successfully'
    };
  }

  /**
   * Get account information
   */
  async getAccountInfo(userId) {
    // Get user data
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Mock notification settings (should come from a UserSettings table)
    const notificationSettings = {
      emailNotifications: true,
      marketingEmails: false,
      securityAlerts: true
    };

    const accountData = {
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || user.createdAt,
      isEmailVerified: user.isEmailVerified || false,
      totalSessions: 1,
      subscription: null
    };

    // Mock subscription and payment data (should come from respective tables)
    const subscriptions = [
      {
        id: 'sub_123',
        tier: 'Solo Video Tier',
        status: 'active',
        price: 19.99,
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const paymentMethods = [
      {
        id: 'pm_123',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2027,
        isDefault: true
      },
      {
        id: 'pm_456',
        type: 'paypal',
        email: user.email,
        isDefault: false
      }
    ];

    return {
      account: accountData,
      notifications: notificationSettings,
      subscriptions: subscriptions,
      paymentMethods: paymentMethods
    };
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(userId, { emailNotifications, marketingEmails, securityAlerts }) {
    // In a real app, save to UserSettings table
    console.log(`Updated notification settings for user ${userId}:`, {
      emailNotifications,
      marketingEmails,
      securityAlerts
    });

    return {
      message: 'Notification settings updated successfully'
    };
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(userId, { twoFactorEnabled, loginAlerts, sessionTimeout }) {
    // In a real app, save to UserSettings table
    console.log(`Updated security settings for user ${userId}:`, {
      twoFactorEnabled,
      loginAlerts,
      sessionTimeout
    });

    return {
      message: 'Security settings updated successfully'
    };
  }

  /**
   * Logout all sessions
   */
  async logoutAllSessions(userId) {
    // In a real app, invalidate all user sessions
    console.log(`Logged out all sessions for user ${userId}`);

    return {
      message: 'All sessions have been logged out successfully'
    };
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId, password) {
    if (!password) {
      throw new Error('Password is required to delete account');
    }

    // Get user with password
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Delete user account
    await user.destroy();

    return {
      message: 'Account deleted successfully'
    };
  }

  /**
   * Generate JWT token
   * @private
   */
  _generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}

export default new AuthService();
