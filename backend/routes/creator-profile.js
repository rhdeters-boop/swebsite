import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import CreatorService from '../services/CreatorService.js';

const router = express.Router();

// Create creator profile for existing user
router.post('/profile', authenticateToken, [
  body('displayName').trim().isLength({ min: 1, max: 50 }).withMessage('Display name must be 1-50 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),
  body('categories').isArray({ min: 1 }).withMessage('At least one category must be selected'),
  body('subscriptionPrice').isFloat({ min: 4.99, max: 99.99 }).withMessage('Subscription price must be between $4.99 and $99.99'),
  body('socialLinks').optional().isObject()
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

    const { displayName, bio, categories, subscriptionPrice, socialLinks } = req.body;
    const userId = req.user.id;

    // Check if user already has a creator profile
    const existingCreator = await CreatorService.getCreatorByUserId(userId);
    if (existingCreator) {
      return res.status(400).json({
        success: false,
        message: 'User already has a creator profile'
      });
    }

    // Create creator profile
    const creator = await CreatorService.createCreator(userId, {
      displayName,
      bio: bio || 'Welcome to my page! 🌟',
      categories,
      subscriptionPrice,
      socialLinks: socialLinks || {}
    });

    res.status(201).json({
      success: true,
      message: 'Creator profile created successfully',
      creator
    });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Update creator profile
router.put('/profile', authenticateToken, [
  body('displayName').optional().trim().isLength({ min: 1, max: 50 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('categories').optional().isArray({ min: 1 }),
  body('subscriptionPrice').optional().isFloat({ min: 4.99, max: 99.99 }),
  body('socialLinks').optional().isObject()
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

    const updateData = req.body;
    const userId = req.user.id;

    const updatedCreator = await CreatorService.updateCreator(userId, updateData);

    res.json({
      success: true,
      message: 'Creator profile updated successfully',
      creator: updatedCreator
    });
  } catch (error) {
    if (error.message === 'Creator profile not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

export default router;
