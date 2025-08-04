import express from 'express';
import { Subscription } from '../models/index.js';

const router = express.Router();

// Get user's current subscription
router.get('/current', async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      where: {
        userId: req.user.id,
        status: 'active'
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    next(error);
  }
});

// Get subscription history
router.get('/history', async (req, res, next) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    next(error);
  }
});

export default router;
