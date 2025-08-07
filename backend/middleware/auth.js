import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (_error) {
    // For optional auth, we don't return errors, just continue without user
    next();
  }
};

export const requireSubscription = (requiredTier) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Import here to avoid circular dependency
      const { Subscription } = await import('../models/index.js');
      
      const subscription = await Subscription.findOne({
        where: {
          userId: req.user.id,
          status: 'active'
        }
      });

      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'Active subscription required'
        });
      }

      if (!subscription.hasAccessTo(requiredTier)) {
        return res.status(403).json({
          success: false,
          message: `${requiredTier} subscription tier required`
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      console.error('Subscription middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Subscription verification error'
      });
    }
  };
};

// Alias for authenticateToken to match common naming conventions
export const requireAuth = authenticateToken;
