import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import PaymentService from '../services/PaymentService.js';

const router = express.Router();

// Create payment intent for tips
router.post('/tips', authenticateToken, [
  body('amount').isInt({ min: 50 }).withMessage('Minimum tip amount is $0.50'),
  body('currency').optional().isIn(['usd', 'eur', 'gbp']),
  body('creatorId').optional().isUUID(),
  body('message').optional().trim().isLength({ max: 500 }),
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

    const { amount, currency = 'usd', creatorId, message } = req.body;

    const result = await PaymentService.createTipPaymentIntent(req.user.id, {
      amount,
      currency,
      creatorId,
      message
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.message.includes('Minimum tip amount')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Create subscription payment intent
router.post('/subscription', authenticateToken, [
  body('tier').isIn(['picture', 'solo_video', 'collab_video']),
  body('creatorId').isUUID(),
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

    const { tier, creatorId, paymentMethodId } = req.body;

    const result = await PaymentService.createSubscriptionPaymentIntent(req.user.id, {
      tier,
      creatorId,
      paymentMethodId
    });

    res.json({
      success: true,
      ...result
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

// Get payment history
router.get('/history', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['tip', 'subscription']),
], async (req, res, next) => {
  try {
    const { page = 1, limit = 50, type } = req.query;

    const result = await PaymentService.getPaymentHistory(req.user.id, {
      page,
      limit,
      type
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// Get creator payment analytics
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
        message: 'You can only view your own payment analytics'
      });
    }

    const analytics = await PaymentService.getCreatorPaymentAnalytics(
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

// Cancel subscription
router.post('/subscription/:subscriptionId/cancel', authenticateToken, [
  body('immediate').optional().isBoolean(),
], async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const { immediate = false } = req.body;

    const result = await PaymentService.cancelSubscription(subscriptionId, { immediate });

    res.json({
      success: true,
      message: immediate ? 'Subscription canceled immediately' : 'Subscription will be canceled at period end',
      subscription: result
    });
  } catch (error) {
    if (error.message === 'Failed to cancel subscription') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

// Create setup intent for saving payment method
router.post('/setup-intent', authenticateToken, async (req, res, next) => {
  try {
    const result = await PaymentService.createSetupIntent(req.user.id);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// Get payment methods
router.get('/payment-methods', authenticateToken, async (req, res, next) => {
  try {
    const paymentMethods = await PaymentService.getPaymentMethods(req.user.id);

    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    next(error);
  }
});

// Delete payment method
router.delete('/payment-methods/:paymentMethodId', authenticateToken, async (req, res, next) => {
  try {
    const { paymentMethodId } = req.params;

    const result = await PaymentService.deletePaymentMethod(paymentMethodId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

// Stripe webhook endpoint (public)
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const stripe = PaymentService.stripe;
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await PaymentService.handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await PaymentService.handleSubscriptionPayment(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await PaymentService.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await PaymentService.handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;
