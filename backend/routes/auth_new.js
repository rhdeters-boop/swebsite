import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import AuthService from '../services/AuthService.js';

const router = express.Router();

// Check username availability
router.get('/check-username/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    
    const result = await AuthService.checkUsernameAvailability(username);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
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

    const result = await AuthService.registerUser({
      email,
      password,
      displayName,
      username
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      ...result
    });
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('already taken')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
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

    const result = await AuthService.loginUser({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
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

    const result = await AuthService.requestPasswordReset(email);

    res.json({
      success: true,
      ...result
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

    const result = await AuthService.resetPassword({ token, password });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.message === 'Invalid or expired reset token') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Verify reset token (optional - for frontend validation)
router.get('/verify-reset-token/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    const result = await AuthService.verifyResetToken(token);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.message === 'Invalid or expired reset token') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('displayName').optional().trim().isLength({ min: 1, max: 100 }),
  body('profilePicture').optional().isURL(),
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

    const { firstName, lastName, username, displayName, profilePicture } = req.body;

    const updatedUser = await AuthService.updateProfile(req.user.id, {
      firstName,
      lastName,
      username,
      displayName,
      profilePicture
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    if (error.message === 'Username is already taken') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
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

    const { currentPassword, newPassword } = req.body;

    const result = await AuthService.changePassword(req.user.id, {
      currentPassword,
      newPassword
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.message.includes('password') || error.message === 'User not found') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Change email
router.put('/change-email', authenticateToken, [
  body('newEmail').isEmail().normalizeEmail().withMessage('Valid email address is required'),
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

    const { newEmail } = req.body;

    const result = await AuthService.changeEmail(req.user.id, newEmail);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.message.includes('email') || error.message === 'User not found') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Get account information
router.get('/account-info', authenticateToken, async (req, res, next) => {
  try {
    const result = await AuthService.getAccountInfo(req.user.id);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Update notification settings
router.put('/notification-settings', authenticateToken, [
  body('emailNotifications').optional().isBoolean(),
  body('marketingEmails').optional().isBoolean(),
  body('securityAlerts').optional().isBoolean(),
], async (req, res, next) => {
  try {
    const { emailNotifications, marketingEmails, securityAlerts } = req.body;

    const result = await AuthService.updateNotificationSettings(req.user.id, {
      emailNotifications,
      marketingEmails,
      securityAlerts
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// Update security settings
router.put('/security-settings', authenticateToken, [
  body('twoFactorEnabled').optional().isBoolean(),
  body('loginAlerts').optional().isBoolean(),
  body('sessionTimeout').optional().isInt({ min: 15, max: 1440 }),
], async (req, res, next) => {
  try {
    const { twoFactorEnabled, loginAlerts, sessionTimeout } = req.body;

    const result = await AuthService.updateSecuritySettings(req.user.id, {
      twoFactorEnabled,
      loginAlerts,
      sessionTimeout
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// Logout all sessions
router.post('/logout-all-sessions', authenticateToken, async (req, res, next) => {
  try {
    const result = await AuthService.logoutAllSessions(req.user.id);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// Delete account
router.delete('/delete-account', authenticateToken, [
  body('password').notEmpty().withMessage('Password is required to delete account'),
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

    const { password } = req.body;

    const result = await AuthService.deleteAccount(req.user.id, password);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.message.includes('password') || error.message === 'User not found') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

export default router;
