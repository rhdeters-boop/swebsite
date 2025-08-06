import express from 'express';
import { body, validationResult } from 'express-validator';
import { Creator, CreatorLike } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get creator like counts and user's vote status
router.get('/:creatorId/likes', async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const userId = req.user?.id; // Optional auth

    // Verify creator exists
    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator not found'
      });
    }

    // Get like counts
    const counts = await CreatorLike.getLikeCounts(creatorId);
    
    // Get user's current vote if authenticated
    let userVote = null;
    if (userId) {
      userVote = await CreatorLike.getUserVote(userId, creatorId);
    }

    res.json({
      success: true,
      data: {
        likes: counts.likes,
        dislikes: counts.dislikes,
        total: counts.total,
        userVote, // null, true (like), or false (dislike)
      },
    });
  } catch (error) {
    next(error);
  }
});

// Like a creator
router.post('/:creatorId/like', authenticateToken, [
  body('isLike').isBoolean().withMessage('isLike must be a boolean'),
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

    const { creatorId } = req.params;
    const { isLike } = req.body;
    const userId = req.user.id;

    // Verify creator exists
    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator not found'
      });
    }

    // Prevent self-voting
    if (creator.userId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on your own content'
      });
    }

    // Set the vote
    await CreatorLike.setUserVote(userId, creatorId, isLike);

    // Update creator's cached like counts
    await creator.updateLikeCounts();

    // Get updated counts
    const counts = await CreatorLike.getLikeCounts(creatorId);

    res.json({
      success: true,
      message: isLike ? 'Creator liked' : 'Creator disliked',
      data: {
        likes: counts.likes,
        dislikes: counts.dislikes,
        total: counts.total,
        userVote: isLike,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Remove like/dislike
router.delete('/:creatorId/like', authenticateToken, async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const userId = req.user.id;

    // Verify creator exists
    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator not found'
      });
    }

    // Remove the vote
    const removed = await CreatorLike.removeUserVote(userId, creatorId);
    
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'No vote found to remove'
      });
    }

    // Update creator's cached like counts
    await creator.updateLikeCounts();

    // Get updated counts
    const counts = await CreatorLike.getLikeCounts(creatorId);

    res.json({
      success: true,
      message: 'Vote removed',
      data: {
        likes: counts.likes,
        dislikes: counts.dislikes,
        total: counts.total,
        userVote: null,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
