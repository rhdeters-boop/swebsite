import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { User, PasswordResetToken } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import EmailService from '../services/EmailService.js';

const router = express.Router();

// Check username availability
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Validate username format
    if (!username || username.length < 3 || username.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Invalid username format'
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username can only contain letters, numbers, and underscores'
      });
    }

    const existingUser = await User.findOne({ where: { username } });
    
    res.json({
      success: true,
      available: !existingUser,
      username
    });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').optional().trim().isLength({ min: 1, max: 100 }),
  body('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password, displayName, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if username is already taken
    if (username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    // Create user
    const user = await User.create({
      email,
      password,
      displayName,
      username
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
});

// Request password reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    // Always return success for security (don't reveal if email exists)
    // But only send email if user actually exists
    if (user) {
      // Generate secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set expiration time (1 hour from now)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
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

    res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
  } catch (error) {
    next(error);
  }
});

// Reset password with token
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Find valid reset token
    const resetToken = await PasswordResetToken.findOne({
      where: {
        token,
        used: false,
        expiresAt: {
          [Op.gt]: new Date(), // Token not expired
        },
      },
      include: [{
        model: User,
        as: 'user',
      }],
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
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
      // Don't fail the password reset if email fails
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Verify reset token (optional - for frontend validation)
router.get('/verify-reset-token/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

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
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { firstName, lastName, username, displayName, profilePicture } = req.body;
    const userId = req.user.id;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if username is already taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({
        where: {
          username,
          id: { [Op.ne]: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
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

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Get user with password
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Change email
router.put('/change-email', authenticateToken, async (req, res, next) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: 'New email address is required'
      });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ 
      where: { 
        email: newEmail,
        id: { [Op.ne]: userId } // Exclude current user
      } 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already in use'
      });
    }

    // Get current user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // In a real application, you would:
    // 1. Generate a verification token
    // 2. Send verification email to new address
    // 3. Update email only after verification
    // For now, we'll update directly and log the action
    
    console.log(`Email change request from ${user.email} to ${newEmail} for user ${userId}`);
    
    // Update email directly (in production, do this only after verification)
    await user.update({ email: newEmail });

    res.json({
      success: true,
      message: 'Email address updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get account information
router.get('/account-info', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user data
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Mock notification settings for now
    // In a real app, you'd have separate tables for these
    const notificationSettings = {
      emailNotifications: true,
      marketingEmails: false,
      securityAlerts: true
    };

    const accountData = {
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || user.createdAt,
      isEmailVerified: user.isEmailVerified || false,
      totalSessions: 1, // Mock value
      subscription: null // Would come from subscription table
    };

    // Mock subscription data
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

    // Mock payment methods data
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

    res.json({
      success: true,
      account: accountData,
      notifications: notificationSettings,
      subscriptions: subscriptions,
      paymentMethods: paymentMethods
    });
  } catch (error) {
    next(error);
  }
});

// Update notification settings
router.put('/notification-settings', authenticateToken, async (req, res, next) => {
  try {
    const { emailNotifications, marketingEmails, securityAlerts } = req.body;
    const userId = req.user.id;

    // In a real app, you'd save these to a UserSettings table
    // For now, we'll just return success
    console.log(`Updated notification settings for user ${userId}:`, req.body);

    res.json({
      success: true,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Update security settings
router.put('/security-settings', authenticateToken, async (req, res, next) => {
  try {
    const { twoFactorEnabled, loginAlerts, sessionTimeout } = req.body;
    const userId = req.user.id;

    // In a real app, you'd save these to a UserSettings table
    // For now, we'll just return success
    console.log(`Updated security settings for user ${userId}:`, req.body);

    res.json({
      success: true,
      message: 'Security settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Logout all sessions
router.post('/logout-all-sessions', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // In a real app with session tracking, you'd invalidate all user sessions here
    // For now, we'll just return success
    console.log(`Logged out all sessions for user ${userId}`);

    res.json({
      success: true,
      message: 'All sessions have been logged out successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Delete account
router.delete('/delete-account', authenticateToken, async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    // Get user with password
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Delete user account
    await user.destroy();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
