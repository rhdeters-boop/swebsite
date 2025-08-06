import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import UserService from '../services/UserService.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await UserService.getUserProfile(req.user.id);
    
    res.json({
      success: true,
      user
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

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
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

    const { firstName, lastName, displayName, profilePicture } = req.body;

    const user = await UserService.updateUserProfile(req.user.id, {
      firstName,
      lastName,
      displayName,
      profilePicture
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
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

// Get user by username (public)
router.get('/username/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    
    const user = await UserService.getUserByUsername(username);
    
    res.json({
      success: true,
      user
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

// Get user statistics
router.get('/stats', authenticateToken, async (req, res, next) => {
  try {
    const stats = await UserService.getUserStats(req.user.id);
    
    res.json({
      success: true,
      stats
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

// Deactivate account
router.post('/deactivate', authenticateToken, async (req, res, next) => {
  try {
    const result = await UserService.deactivateAccount(req.user.id);
    
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

// Reactivate account
router.post('/reactivate', authenticateToken, async (req, res, next) => {
  try {
    const result = await UserService.reactivateAccount(req.user.id);
    
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

export default router;
