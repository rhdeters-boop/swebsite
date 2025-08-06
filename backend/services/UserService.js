import { User } from '../models/index.js';

class UserService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, { firstName, lastName, displayName, profilePicture }) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updateData = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      displayName: displayName || user.displayName,
      profilePicture: profilePicture || user.profilePicture
    };

    await user.update(updateData);

    return user.toJSON();
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username) {
    const user = await User.findOne({
      where: { username },
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    const user = await User.findOne({
      where: { email },
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Check if user exists by email
   */
  async checkUserExists(email) {
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'email']
    });

    return !!user;
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'createdAt', 'lastLoginAt']
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate basic stats
    const accountAge = Math.floor(
      (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
    );

    const lastLogin = user.lastLoginAt 
      ? Math.floor((new Date() - new Date(user.lastLoginAt)) / (1000 * 60 * 60 * 24))
      : null;

    return {
      accountAgeInDays: accountAge,
      lastLoginDaysAgo: lastLogin,
      // These would come from other tables in a real implementation
      totalSubscriptions: 0,
      totalSpent: 0,
      totalContentViewed: 0
    };
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // In a real implementation, you might have an 'isActive' field
    // For now, we'll just update a field to mark as deactivated
    await user.update({ 
      isActive: false,
      deactivatedAt: new Date()
    });

    return {
      message: 'Account deactivated successfully'
    };
  }

  /**
   * Reactivate user account
   */
  async reactivateAccount(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ 
      isActive: true,
      deactivatedAt: null
    });

    return {
      message: 'Account reactivated successfully'
    };
  }
}

export default new UserService();
