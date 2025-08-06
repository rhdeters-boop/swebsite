import express from 'express';
import { User } from '../models/index.js';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
});

export default router;
