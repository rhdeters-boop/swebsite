import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import SubscriptionService from '../services/SubscriptionService.js';

const router = express.Router();

// Get user's current subscription
router.get('/current', authenticateToken, async (req, res, next) => {
  try {
    const subscription = await SubscriptionService.getCurrentSubscription(req.user.id);

    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    if (error.message === 'No active subscription found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Get subscription history
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const subscriptions = await SubscriptionService.getSubscriptionHistory(req.user.id);

    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    next(error);
  }
});

// Create a new subscription
router.post('/create', authenticateToken, [
  body('tier').isIn(['picture', 'solo_video', 'collab_video']),
  body('price').isFloat({ min: 0 }),
  body('billingCycle').isIn(['weekly', 'monthly', 'yearly']),
  body('stripeSubscriptionId').optional().isString(),
  body('stripeCustomerId').optional().isString(),
  body('paymentMethodId').optional().isString(),
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

    const subscriptionData = {
      userId: req.user.id,
      ...req.body
    };

    const subscription = await SubscriptionService.createSubscription(subscriptionData);

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    if (error.message === 'User already has an active subscription') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Update subscription
router.put('/:id', authenticateToken, [
  body('tier').optional().isIn(['picture', 'solo_video', 'collab_video']),
  body('price').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['active', 'canceled', 'past_due']),
  body('cancelAtPeriodEnd').optional().isBoolean(),
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
    const updateData = req.body;

    const subscription = await SubscriptionService.updateSubscription(id, updateData);

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    if (error.message === 'Subscription not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, [
  body('immediate').optional().isBoolean(),
], async (req, res, next) => {
  try {
    const { immediate = false } = req.body;

    const subscription = await SubscriptionService.cancelSubscription(
      req.user.id,
      { immediate }
    );

    res.json({
      success: true,
      message: immediate ? 'Subscription canceled immediately' : 'Subscription will be canceled at period end',
      subscription
    });
  } catch (error) {
    if (error.message === 'No active subscription found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Reactivate subscription
router.post('/reactivate', authenticateToken, async (req, res, next) => {
  try {
    const subscription = await SubscriptionService.reactivateSubscription(req.user.id);

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription
    });
  } catch (error) {
    if (error.message === 'No subscription found to reactivate') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Creator subscription management routes

// Get creator's subscribers
router.get('/creator/:creatorId/subscribers', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if user owns this creator profile
    if (req.user.creatorId !== creatorId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own subscribers'
      });
    }

    const result = await SubscriptionService.getCreatorSubscriptions(
      creatorId,
      { page, limit }
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// Subscribe to a creator
router.post('/creator/:creatorId/subscribe', authenticateToken, [
  body('tier').isIn(['picture', 'solo_video', 'collab_video']),
  body('paymentMethodId').optional().isString(),
  body('stripeSubscriptionId').optional().isString(),
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
    const subscriptionData = req.body;

    const subscription = await SubscriptionService.subscribeToCreator(
      req.user.id,
      creatorId,
      subscriptionData
    );

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to creator',
      subscription
    });
  } catch (error) {
    if (error.message === 'Creator not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Already subscribed to this creator') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Unsubscribe from a creator
router.delete('/creator/:creatorId/unsubscribe', authenticateToken, async (req, res, next) => {
  try {
    const { creatorId } = req.params;

    const subscription = await SubscriptionService.unsubscribeFromCreator(
      req.user.id,
      creatorId
    );

    res.json({
      success: true,
      message: 'Successfully unsubscribed from creator',
      subscription
    });
  } catch (error) {
    if (error.message === 'No active subscription found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Get user's creator subscriptions
router.get('/my-creators', authenticateToken, async (req, res, next) => {
  try {
    const subscriptions = await SubscriptionService.getUserCreatorSubscriptions(req.user.id);

    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    next(error);
  }
});

// Check tier access
router.get('/check-access/:tier', authenticateToken, async (req, res, next) => {
  try {
    const { tier } = req.params;

    if (!['picture', 'solo_video', 'collab_video'].includes(tier)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tier'
      });
    }

    const hasAccess = await SubscriptionService.checkTierAccess(req.user.id, tier);

    res.json({
      success: true,
      hasAccess,
      tier
    });
  } catch (error) {
    next(error);
  }
});

// Get subscription analytics for creator
router.get('/analytics/:creatorId', authenticateToken, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
], async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const { startDate, endDate } = req.query;

    // Check if user owns this creator profile
    if (req.user.creatorId !== creatorId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own analytics'
      });
    }

    const analytics = await SubscriptionService.getSubscriptionAnalytics(
      creatorId,
      { startDate, endDate }
    );

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
});

export default router;
