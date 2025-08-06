import express from 'express';
import Stripe from 'stripe';
import { Payment, Subscription, User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent for tips
router.post('/tips', authenticateToken, async (req, res, next) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount < 50) { // Minimum $0.50
      return res.status(400).json({
        success: false,
        message: 'Minimum tip amount is $0.50'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount),
      currency,
      metadata: {
        userId: req.user.id,
        type: 'tip'
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req, res, next) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      payments
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
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
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

// Helper functions for webhook handlers
async function handlePaymentSucceeded(paymentIntent) {
  const { metadata } = paymentIntent;
  
  if (metadata.type === 'tip' && metadata.userId) {
    await Payment.create({
      userId: metadata.userId,
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'succeeded',
      type: 'tip',
      description: 'Tip payment',
      processedAt: new Date()
    });
  }
}

async function handleSubscriptionUpdated(subscription) {
  // Implementation for subscription updates
  console.log('Subscription updated:', subscription.id);
}

async function handleSubscriptionDeleted(subscription) {
  // Implementation for subscription cancellation
  console.log('Subscription deleted:', subscription.id);
}

export default router;
