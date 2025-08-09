import { body, query, param, validationResult } from 'express-validator';
import { validateNumeric, sanitizeSearchString } from '../utils/queryHelpers.js';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Common validation chains
 */
export const commonValidations = {
  // Pagination validators
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be between 1 and 1000')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt()
  ],

  // ID validators
  numericId: (field = 'id') => 
    param(field)
      .isInt({ min: 1 })
      .withMessage('Invalid ID format')
      .toInt(),

  uuidId: (field = 'id') =>
    param(field)
      .isUUID()
      .withMessage('Invalid UUID format'),

  // Search validators
  search: query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long')
    .customSanitizer(value => sanitizeSearchString(value)),

  // Sort validators
  sortBy: (allowedValues) =>
    query('sortBy')
      .optional()
      .isIn(allowedValues)
      .withMessage(`Sort must be one of: ${allowedValues.join(', ')}`),
};

/**
 * Auth validation rules
 */
export const authValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username must be 3-30 characters, alphanumeric with underscores/hyphens'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
    body('displayName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Display name must be 1-50 characters'),
    handleValidationErrors
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],

  updateProfile: [
    body('displayName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Display name must be 1-50 characters'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters'),
    handleValidationErrors
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number')
      .custom((value, { req }) => value !== req.body.currentPassword)
      .withMessage('New password must be different from current password'),
    handleValidationErrors
  ]
};

/**
 * Creator validation rules
 */
export const creatorValidation = {
  list: [
    ...commonValidations.pagination,
    commonValidations.search,
    query('category')
      .optional()
      .isIn(['Lifestyle', 'Fitness', 'Beauty', 'Fashion', 'Art', 'Photography', 'Travel', 'Cooking', 'Music', 'Entertainment'])
      .withMessage('Invalid category'),
    commonValidations.sortBy(['popular', 'newest', 'rating', 'price_low', 'price_high', 'trending', 'top_performers', 'most_viewed', 'most_liked']),
    handleValidationErrors
  ],

  create: [
    body('displayName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Display name is required and must be 1-50 characters'),
    body('bio')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Bio must be 10-1000 characters'),
    body('categories')
      .isArray({ min: 1, max: 5 })
      .withMessage('Select 1-5 categories'),
    body('categories.*')
      .isIn(['Lifestyle', 'Fitness', 'Beauty', 'Fashion', 'Art', 'Photography', 'Travel', 'Cooking', 'Music', 'Entertainment'])
      .withMessage('Invalid category'),
    body('subscriptionPrice')
      .isFloat({ min: 0, max: 999.99 })
      .withMessage('Subscription price must be between 0 and 999.99'),
    body('socialLinks')
      .optional()
      .isObject()
      .withMessage('Social links must be an object'),
    body('socialLinks.instagram')
      .optional()
      .matches(/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/)
      .withMessage('Invalid Instagram URL'),
    body('socialLinks.twitter')
      .optional()
      .matches(/^https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?$/)
      .withMessage('Invalid Twitter/X URL'),
    handleValidationErrors
  ],

  update: [
    body('displayName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Display name must be 1-50 characters'),
    body('bio')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Bio must be 10-1000 characters'),
    body('categories')
      .optional()
      .isArray({ min: 1, max: 5 })
      .withMessage('Select 1-5 categories'),
    body('subscriptionPrice')
      .optional()
      .isFloat({ min: 0, max: 999.99 })
      .withMessage('Subscription price must be between 0 and 999.99'),
    handleValidationErrors
  ]
};

/**
 * Media validation rules
 */
export const mediaValidation = {
  upload: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title is required and must be 1-100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('categories')
      .optional()
      .isArray({ max: 5 })
      .withMessage('Maximum 5 categories allowed'),
    body('tier')
      .isIn(['free', 'basic', 'premium', 'exclusive'])
      .withMessage('Invalid tier'),
    body('price')
      .optional()
      .isFloat({ min: 0, max: 999.99 })
      .withMessage('Price must be between 0 and 999.99'),
    handleValidationErrors
  ],

  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be 1-100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    body('isPublished')
      .optional()
      .isBoolean()
      .withMessage('isPublished must be a boolean'),
    handleValidationErrors
  ]
};

/**
 * Payment validation rules
 */
export const paymentValidation = {
  createCheckout: [
    body('subscriptionId')
      .isInt({ min: 1 })
      .withMessage('Valid subscription ID is required'),
    body('successUrl')
      .isURL({ require_protocol: true, protocols: ['http', 'https'] })
      .withMessage('Valid success URL is required'),
    body('cancelUrl')
      .isURL({ require_protocol: true, protocols: ['http', 'https'] })
      .withMessage('Valid cancel URL is required'),
    handleValidationErrors
  ],

  createPaymentIntent: [
    body('amount')
      .isFloat({ min: 0.5, max: 999999.99 })
      .withMessage('Amount must be between 0.50 and 999999.99'),
    body('currency')
      .optional()
      .isIn(['usd', 'eur', 'gbp'])
      .withMessage('Invalid currency'),
    handleValidationErrors
  ]
};

/**
 * Subscription validation rules
 */
export const subscriptionValidation = {
  create: [
    body('creatorId')
      .isInt({ min: 1 })
      .withMessage('Valid creator ID is required'),
    body('tier')
      .isIn(['basic', 'premium', 'exclusive'])
      .withMessage('Invalid subscription tier'),
    body('duration')
      .optional()
      .isIn(['monthly', 'yearly'])
      .withMessage('Invalid duration'),
    handleValidationErrors
  ],

  update: [
    body('tier')
      .optional()
      .isIn(['basic', 'premium', 'exclusive'])
      .withMessage('Invalid subscription tier'),
    body('autoRenew')
      .optional()
      .isBoolean()
      .withMessage('autoRenew must be a boolean'),
    handleValidationErrors
  ]
};

/**
 * Sanitize all request inputs
 */
export const sanitizeInputs = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  // Sanitize body parameters
  if (req.body) {
    const sanitizeObject = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].trim();
        } else if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          sanitizeObject(obj[key]);
        }
      });
    };
    sanitizeObject(req.body);
  }

  next();
};

/**
 * Rate limiting rules for different endpoints
 */
export const rateLimitRules = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later'
  },
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later'
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    message: 'Upload limit exceeded, please try again later'
  }
};