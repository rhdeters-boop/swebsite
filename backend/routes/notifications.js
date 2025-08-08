import express from 'express';
import { query, body, param, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import NotificationService from '../services/NotificationService.js';

const router = express.Router();

// GET / - list notifications for authenticated user
router.get(
  '/',
  authenticateToken,
  [
    query('isRead').optional().isBoolean().toBoolean(),
    query('type').optional().isString(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
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

      const { isRead, type, page = 1, limit = 20 } = req.query;
      const result = await NotificationService.getNotifications(req.user.id, {
        isRead,
        type,
        page,
        limit,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /settings - get notification settings
router.get('/settings', authenticateToken, async (req, res, next) => {
  try {
    const settings = await NotificationService.getNotificationSettings(req.user.id);
    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /settings - update notification settings
router.put(
  '/settings',
  authenticateToken,
  [
    body('emailNotifications').optional().isObject(),
    body('websiteNotifications').optional().isObject(),
    body('newPost').optional().isBoolean(),
    body('newComment').optional().isBoolean(),
    body('suggestedCreators').optional().isBoolean(),
    body('suggestedContent').optional().isBoolean(),
    body('messages').optional().isBoolean(),
    body('billing').optional().isBoolean(),
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

      const updated = await NotificationService.updateNotificationSettings(req.user.id, req.body);
      res.json({
        success: true,
        message: 'Notification settings updated',
        settings: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /:id/read - mark single notification as read
router.post(
  '/:id/read',
  authenticateToken,
  [param('id').isUUID()],
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
      const result = await NotificationService.markAsRead(id, req.user.id);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error.message === 'Notification not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
);

// POST /read-all - mark all as read
router.post('/read-all', authenticateToken, async (req, res, next) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user.id);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;