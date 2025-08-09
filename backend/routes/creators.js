import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import CreatorService from '../services/CreatorService.js';
import { creatorValidation, sanitizeInputs, commonValidations } from '../middleware/validation.js';

const router = express.Router();

// Get all creators (public, with search and filters)
router.get('/', optionalAuth, sanitizeInputs, creatorValidation.list, async (req, res, next) => {
  try {

    const {
      search = '',
      category = '',
      sortBy = 'popular',
      page = 1,
      limit = 12
    } = req.query;

    const result = await CreatorService.getCreators({
      search,
      category,
      sortBy,
      page,
      limit,
      userId: req.user?.id
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// Analytics-based creator discovery routes (must be before /:id route)
router.get('/top-performers', optionalAuth, [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt()
], sanitizeInputs, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const { limit = 10 } = req.query;
    
    const creators = await CreatorService.getTopPerformers(limit);

    res.json({
      success: true,
      creators,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/trending', optionalAuth, [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt()
], sanitizeInputs, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const { limit = 10 } = req.query;
    
    const creators = await CreatorService.getTrendingCreators(limit);

    res.json({
      success: true,
      creators,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/new-rising', optionalAuth, [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt()
], sanitizeInputs, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }
    
    const { limit = 10 } = req.query;
    
    const creators = await CreatorService.getNewRisingCreators(limit);

    res.json({
      success: true,
      creators,
    });
  } catch (error) {
    next(error);
  }
});

// Get creator by username (public)
router.get('/username/:username', optionalAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
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

    const { username } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const { creator, mediaPagination } = await CreatorService.getCreatorByUsername(
      username,
      req.user?.id,
      { page, limit }
    );

    res.json({
      success: true,
      creator,
      mediaPagination
    });
  } catch (error) {
    if (error.message === 'Creator not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Get creator by ID (public)
router.get('/:id', optionalAuth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
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

    const { id } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const { creator, mediaPagination } = await CreatorService.getCreatorById(
      id,
      req.user?.id,
      { page, limit }
    );

    res.json({
      success: true,
      creator,
      mediaPagination
    });
  } catch (error) {
    if (error.message === 'Creator not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Apply to become a creator
router.post('/apply', authenticateToken, sanitizeInputs, creatorValidation.create, async (req, res, next) => {
  try {

    const {
      displayName,
      bio,
      categories,
      subscriptionPrice,
      socialLinks = {}
    } = req.body;

    const creator = await CreatorService.createCreator(req.user.id, {
      displayName,
      bio,
      categories,
      subscriptionPrice,
      socialLinks
    });

    res.status(201).json({
      success: true,
      message: 'Creator application submitted successfully',
      creator
    });
  } catch (error) {
    if (error.message === 'User already has a creator profile') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Get current user's creator profile
router.get('/me/profile', authenticateToken, async (req, res, next) => {
  try {
    const creator = await CreatorService.getCreatorByUserId(req.user.id);

    res.json({
      success: true,
      creator
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

// Update creator profile
router.put('/me/profile', authenticateToken, sanitizeInputs, creatorValidation.update, async (req, res, next) => {
  try {

    const updateData = {};
    const allowedFields = ['displayName', 'bio', 'categories', 'subscriptionPrice', 'socialLinks'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const creator = await CreatorService.updateCreator(req.user.id, updateData);

    res.json({
      success: true,
      message: 'Creator profile updated successfully',
      creator
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

// Get creator profile by user ID
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const creator = await CreatorService.getCreatorByUserId(userId);

    res.json(creator);
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

// Update creator profile (use PUT /creators/profile instead of /creators/me/profile)
router.put('/profile', authenticateToken, sanitizeInputs, creatorValidation.update, async (req, res, next) => {
  try {

    const updatedCreator = await CreatorService.updateCreator(req.user.id, req.body);

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

// Follow/Unfollow creator
router.post('/:id/follow', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await CreatorService.toggleFollow(id, req.user.id);
    
    res.json({
      success: true,
      message: result.message,
      isFollowed: result.isFollowed
    });
  } catch (error) {
    if (error.message === 'Creator not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

export default router;
