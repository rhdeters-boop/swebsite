// Payments and Billing Service
import Stripe from 'stripe';
import { Payment, Subscription, User, Creator } from '../models/index.js';
import { Op } from 'sequelize';
import NotificationService from './NotificationService.js';

class PaymentService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  /**
   * Create payment intent for tips
   * amount: cents (min 50)
   */
  async createTipPaymentIntent(userId, { amount, currency = 'usd', creatorId = null, message = '' }) {
    if (!amount || amount < 50) {
      throw new Error('Minimum tip amount is $0.50');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: parseInt(amount, 10),
      currency,
      metadata: {
        userId,
        type: 'tip',
        creatorId: creatorId || '',
        message: message || ''
      }
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  }

  /**
   * Create subscription payment intent
   */
  async createSubscriptionPaymentIntent(userId, { tier, creatorId, paymentMethodId }) {
    // Get creator pricing
    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    // Create customer if not exists
    const user = await User.findByPk(userId);
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.displayName,
        metadata: {
          userId: user.id
        }
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await user.update({ stripeCustomerId: customerId });
    }

    // Create subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${creator.displayName} - ${tier} Subscription`,
            description: `Monthly subscription to ${creator.displayName}'s ${tier} content`
          },
          unit_amount: creator.subscriptionPrice * 100, // Convert to cents
          recurring: {
            interval: 'month'
          }
        }
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId,
        creatorId,
        tier
      }
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      paymentIntentId: subscription.latest_invoice.payment_intent.id
    };
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(userId, { page = 1, limit = 50, type = null } = {}) {
    const offset = (page - 1) * limit;
    const where = { userId };
    
    if (type) {
      where.type = type;
    }

    const { rows: payments, count } = await Payment.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Creator,
          as: 'creator',
          attributes: ['id', 'displayName'],
          required: false
        }
      ]
    });

    return {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get payment analytics for creator
   */
  async getCreatorPaymentAnalytics(creatorId, { startDate, endDate } = {}) {
    const where = { creatorId, status: 'succeeded' };
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const payments = await Payment.findAll({
      where,
      attributes: ['amount', 'type', 'createdAt'],
      raw: true
    });

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const tipRevenue = payments
      .filter(p => p.type === 'tip')
      .reduce((sum, payment) => sum + payment.amount, 0);
    const subscriptionRevenue = payments
      .filter(p => p.type === 'subscription')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const totalPayments = payments.length;
    const tipCount = payments.filter(p => p.type === 'tip').length;
    const subscriptionCount = payments.filter(p => p.type === 'subscription').length;

    return {
      totalRevenue: totalRevenue / 100, // Convert from cents to dollars
      tipRevenue: tipRevenue / 100,
      subscriptionRevenue: subscriptionRevenue / 100,
      totalPayments,
      tipCount,
      subscriptionCount,
      averagePayment: totalPayments > 0 ? (totalRevenue / totalPayments) / 100 : 0
    };
  }

  /**
   * Handle successful payment from webhook
   */
  async handlePaymentSucceeded(paymentIntent) {
    const { metadata } = paymentIntent || {};

    if (metadata?.type === 'tip' && metadata.userId) {
      await Payment.create({
        userId: metadata.userId,
        creatorId: metadata.creatorId || null,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'succeeded',
        type: 'tip',
        description: metadata.message || 'Tip payment',
        processedAt: new Date()
      });

      // Notify user of successful payment
      try {
        await NotificationService.createNotification(
          metadata.userId,
          'billing_success',
          'Your payment was processed successfully.',
          null
        );
      } catch (e) {
        console.error('Failed to create billing_success notification', e.message);
      }

      // Update creator tip analytics if applicable
      if (metadata.creatorId) {
        const creator = await Creator.findByPk(metadata.creatorId);
        if (creator) {
          await creator.increment('totalTipsReceived', { by: paymentIntent.amount });
        }
      }
    }
  }

  /**
   * Handle failed invoice payments (billing_failure notification)
   */
  async handleInvoicePaymentFailed(invoice) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription);
      const { metadata } = subscription || {};
      if (metadata?.userId) {
        await NotificationService.createNotification(
          metadata.userId,
          'billing_failure',
          'Your recent invoice payment failed. Please update your payment method.',
          null
        );
      }
    } catch (e) {
      console.error('Error handling invoice.payment_failed', e.message);
    }
  }

  /**
   * Handle upcoming invoice to warn about expiring payment (billing_expiring)
   */
  async handleInvoiceUpcoming(invoice) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription);
      const { metadata } = subscription || {};
      if (metadata?.userId) {
        await NotificationService.createNotification(
          metadata.userId,
          'billing_expiring',
          'Your subscription will renew soon. Ensure your payment method is up to date.',
          null
        );
      }
    } catch (e) {
      console.error('Error handling invoice.upcoming', e.message);
    }
  }

  /**
   * User-initiated refund request - create Stripe refund when possible or log request
   */
  async requestRefund(paymentId, userId, reason = '') {
    const payment = await Payment.findByPk(paymentId);

    if (!payment || payment.userId !== userId) {
      throw new Error('Payment not found');
    }
    if (payment.refunded) {
      return { message: 'Payment already refunded', refunded: true };
    }
    if (payment.status !== 'succeeded') {
      throw new Error('Only succeeded payments can be refunded');
    }

    let refund;
    try {
      if (payment.stripePaymentIntentId) {
        refund = await this.stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          reason: reason ? 'requested_by_customer' : undefined,
        });
      } else if (payment.stripeInvoiceId) {
        // Retrieve invoice to get payment_intent
        const invoice = await this.stripe.invoices.retrieve(payment.stripeInvoiceId, { expand: ['payment_intent'] });
        if (invoice?.payment_intent?.id) {
          refund = await this.stripe.refunds.create({
            payment_intent: invoice.payment_intent.id,
            reason: reason ? 'requested_by_customer' : undefined,
          });
        }
      }
    } catch (e) {
      console.error('Stripe refund failed or not possible, falling back to support flow:', e.message);
    }

    if (refund?.status === 'succeeded' || refund?.status === 'pending') {
      await payment.update({
        refunded: true,
        refundedAmount: payment.amount,
        metadata: { ...(payment.metadata || {}), refundReason: reason || 'user_request' },
      });

      // Notify user
      try {
        await NotificationService.createNotification(
          userId,
          'billing_success',
          'Your refund has been initiated. It may take 5-10 business days to appear on your statement.',
          null
        );
      } catch (e) {
        console.error('Failed to create refund notification', e.message);
      }

      return {
        message: 'Refund initiated',
        refunded: true,
        refundStatus: refund.status,
      };
    }

    // Fallback: create a support request by logging a notification as a message
    try {
      await NotificationService.createNotification(
        userId,
        'message',
        'Your refund request has been received and will be reviewed by our support team.',
        null
      );
    } catch (e) {
      console.error('Failed to create refund-request notification', e.message);
    }

    return {
      message: 'Refund request submitted for manual review',
      refunded: false,
    };
  }

  /**
   * Handle subscription payment from webhook
   */
  async handleSubscriptionPayment(invoice) {
    const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription);
    const { metadata } = subscription;

    if (metadata.userId && metadata.creatorId) {
      await Payment.create({
        userId: metadata.userId,
        creatorId: metadata.creatorId,
        stripeInvoiceId: invoice.id,
        stripeSubscriptionId: subscription.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        type: 'subscription',
        description: `Subscription payment - ${metadata.tier}`,
        processedAt: new Date()
      });

      try {
        await NotificationService.createNotification(
          metadata.userId,
          'billing_success',
          'Your subscription payment was successful.',
          null
        );
      } catch (e) {
        console.error('Failed to create billing_success notification', e.message);
      }
    }
  }

  /**
   * Handle subscription updates from webhook
   */
  async handleSubscriptionUpdated(stripeSubscription) {
    const { metadata } = stripeSubscription;

    if (metadata.userId && metadata.creatorId) {
      // Update local subscription record
      await Subscription.update(
        {
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
        },
        {
          where: {
            stripeSubscriptionId: stripeSubscription.id
          }
        }
      );

      // If status indicates payment issues, notify user
      if (['past_due', 'unpaid'].includes(stripeSubscription.status)) {
        try {
          await NotificationService.createNotification(
            metadata.userId,
            'billing_failure',
            'There was an issue with your recent subscription payment. Please update your payment method.',
            null
          );
        } catch (e) {
          console.error('Failed to create billing_failure notification', e.message);
        }
      }
    }
  }

  /**
   * Handle subscription cancellation from webhook
   */
  async handleSubscriptionDeleted(stripeSubscription) {
    await Subscription.update(
      {
        status: 'canceled',
        canceledAt: new Date()
      },
      {
        where: {
          stripeSubscriptionId: stripeSubscription.id
        }
      }
    );
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, { immediate = false } = {}) {
    try {
      let stripeSubscription;
      
      if (immediate) {
        // Cancel immediately
        stripeSubscription = await this.stripe.subscriptions.del(subscriptionId);
      } else {
        // Cancel at period end
        stripeSubscription = await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
      }

      // Update local record
      await Subscription.update({
        status: stripeSubscription.status,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        canceledAt: immediate ? new Date() : null
      }, {
        where: {
          stripeSubscriptionId: subscriptionId
        }
      });

      return stripeSubscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Create setup intent for saving payment method
   */
  async createSetupIntent(userId) {
    const user = await User.findByPk(userId);
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.displayName,
        metadata: {
          userId: user.id
        }
      });
      customerId = customer.id;
      
      await user.update({ stripeCustomerId: customerId });
    }

    const setupIntent = await this.stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session'
    });

    return {
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id
    };
  }

  /**
   * Get user's payment methods
   */
  async getPaymentMethods(userId) {
    const user = await User.findByPk(userId);
    
    if (!user.stripeCustomerId) {
      return [];
    }

    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card'
    });

    return paymentMethods.data.map(pm => ({
      id: pm.id,
      type: pm.type,
      card: {
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year
      },
      isDefault: false // Would need to track this separately or get from customer.default_payment_method
    }));
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId) {
    await this.stripe.paymentMethods.detach(paymentMethodId);
    
    return {
      message: 'Payment method removed successfully'
    };
  }
}

export default new PaymentService();
