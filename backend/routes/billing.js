import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import SubscriptionService from '../services/SubscriptionService.js';
import PaymentService from '../services/PaymentService.js';

const router = express.Router();

// All routes here require auth (router will also be mounted with authenticateToken)
router.use(authenticateToken);

// GET /billing/subscriptions - current and past subscriptions for the authenticated user
router.get('/subscriptions', async (req, res, next) => {
  try {
    const [current, history] = await Promise.all([
      SubscriptionService
        .getCurrentSubscription(req.user.id)
        .catch(() => null),
      SubscriptionService.getSubscriptionHistory(req.user.id),
    ]);

    res.json({
      success: true,
      currentSubscription: current,
      history,
    });
  } catch (error) {
    next(error);
  }
});

// POST /billing/subscriptions/:id/cancel - Cancel an active subscription by internal subscriptionId
router.post(
  '/subscriptions/:id/cancel',
  [param('id').isUUID().withMessage('Invalid subscription id'), body('immediate').optional().isBoolean()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { immediate = false } = req.body;

      // Ensure the user owns this subscription
      const history = await SubscriptionService.getSubscriptionHistory(req.user.id);
      const target = history.find((s) => s.id === id);
      if (!target) {
        return res.status(404).json({ success: false, message: 'Subscription not found' });
      }

      // If we had a Stripe subscription id we could call PaymentService.cancelSubscription(stripeId, { immediate })
      // For now we update local record conservatively
      const updated = await SubscriptionService.updateSubscription(id, {
        status: immediate ? 'canceled' : 'active',
        cancelAtPeriodEnd: !immediate,
        canceledAt: immediate ? new Date() : new Date(),
      });

      res.json({
        success: true,
        message: immediate
          ? 'Subscription canceled immediately'
          : 'Subscription will be canceled at period end',
        subscription: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /billing/history - billing history (payments)
router.get(
  '/history',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isIn(['tip', 'subscription', 'one_time']),
  ],
  async (req, res, next) => {
    try {
      const { page = 1, limit = 50, type } = req.query;
      const result = await PaymentService.getPaymentHistory(req.user.id, { page, limit, type });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

// POST /billing/refund-request - create a refund request
router.post(
  '/refund-request',
  [
    body('paymentId').isUUID().withMessage('paymentId is required'),
    body('reason').optional().isString().isLength({ max: 500 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }
      const { paymentId, reason } = req.body;
      const result = await PaymentService.requestRefund(paymentId, req.user.id, reason || '');
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
);

// GET /billing/payment-methods - get saved payment methods
router.get('/payment-methods', async (req, res, next) => {
  try {
    const paymentMethods = await PaymentService.getPaymentMethods(req.user.id);
    res.json({ success: true, paymentMethods });
  } catch (error) {
    next(error);
  }
});

// POST /billing/payment-methods - create setup intent to add a new payment method
router.post('/payment-methods', async (req, res, next) => {
  try {
    const result = await PaymentService.createSetupIntent(req.user.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// DELETE /billing/payment-methods/:id - delete a saved payment method
router.delete('/payment-methods/:id', [param('id').isString()], async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await PaymentService.deletePaymentMethod(id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

export default router;