import { MediaAnalytics, MediaItem } from '../models/index.js';
import { Op } from 'sequelize';

class AnalyticsService {
  /**
   * Record a view event for a media item
   * @param {string} mediaItemId - UUID of the media item
   * @param {string} userId - UUID of the user (optional, for unique viewer tracking)
   * @param {number} watchTime - Time watched in seconds (for videos)
   */
  static async recordView(mediaItemId, userId = null, watchTime = 0) {
    try {
      // Increment view count in MediaItem table for quick access
      await MediaItem.increment('viewCount', { where: { id: mediaItemId } });

      // Record detailed analytics
      const isUniqueViewer = userId ? await this.isUniqueViewerToday(mediaItemId, userId) : false;
      await MediaAnalytics.incrementViews(mediaItemId, 1);

      // Record watch time if provided (for videos)
      if (watchTime > 0) {
        await MediaAnalytics.recordWatchTime(mediaItemId, watchTime, isUniqueViewer);
      }

      return { success: true };
    } catch (error) {
      console.error('Error recording view:', error);
      throw error;
    }
  }

  /**
   * Record a like event
   * @param {string} mediaItemId - UUID of the media item
   */
  static async recordLike(mediaItemId) {
    try {
      await MediaAnalytics.incrementLikes(mediaItemId, 1);
      return { success: true };
    } catch (error) {
      console.error('Error recording like:', error);
      throw error;
    }
  }

  /**
   * Record a share event
   * @param {string} mediaItemId - UUID of the media item
   */
  static async recordShare(mediaItemId) {
    try {
      await MediaAnalytics.incrementShares(mediaItemId, 1);
      return { success: true };
    } catch (error) {
      console.error('Error recording share:', error);
      throw error;
    }
  }

  /**
   * Get analytics for a specific media item over a date range
   * @param {string} mediaItemId - UUID of the media item
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   */
  static async getMediaAnalytics(mediaItemId, startDate, endDate) {
    try {
      const dailyAnalytics = await MediaAnalytics.getAnalyticsForPeriod(
        mediaItemId, 
        startDate, 
        endDate
      );

      const aggregatedAnalytics = await MediaAnalytics.getAggregatedAnalytics(
        mediaItemId, 
        startDate, 
        endDate
      );

      return {
        daily: dailyAnalytics,
        summary: aggregatedAnalytics,
      };
    } catch (error) {
      console.error('Error getting media analytics:', error);
      throw error;
    }
  }

  /**
   * Get analytics for all media items of a creator
   * @param {string} creatorId - UUID of the creator
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   */
  static async getCreatorAnalytics(creatorId, startDate, endDate) {
    try {
      const mediaItems = await MediaItem.findAll({
        where: { creatorId },
        include: [
          {
            model: MediaAnalytics,
            as: 'analytics',
            where: {
              date: {
                [Op.between]: [startDate, endDate],
              },
            },
            required: false,
          },
        ],
      });

      // Aggregate analytics across all media items
      let totalViews = 0;
      let totalLikes = 0;
      let totalShares = 0;
      let totalWatchTime = 0;
      let totalRevenue = 0;

      const mediaAnalytics = [];

      mediaItems.forEach((mediaItem) => {
        const analytics = mediaItem.analytics || [];
        const mediaStats = {
          mediaId: mediaItem.id,
          title: mediaItem.title,
          type: mediaItem.type,
          publishedAt: mediaItem.publishedAt,
          daily: analytics,
          totals: {
            views: analytics.reduce((sum, day) => sum + day.dailyViews, 0),
            likes: analytics.reduce((sum, day) => sum + day.dailyLikes, 0),
            shares: analytics.reduce((sum, day) => sum + day.dailyShares, 0),
            watchTime: analytics.reduce((sum, day) => sum + day.watchTime, 0),
            revenue: analytics.reduce((sum, day) => sum + parseFloat(day.revenue), 0),
          },
        };

        mediaAnalytics.push(mediaStats);

        totalViews += mediaStats.totals.views;
        totalLikes += mediaStats.totals.likes;
        totalShares += mediaStats.totals.shares;
        totalWatchTime += mediaStats.totals.watchTime;
        totalRevenue += mediaStats.totals.revenue;
      });

      return {
        summary: {
          totalViews,
          totalLikes,
          totalShares,
          totalWatchTime,
          totalRevenue,
          mediaCount: mediaItems.length,
        },
        mediaAnalytics,
      };
    } catch (error) {
      console.error('Error getting creator analytics:', error);
      throw error;
    }
  }

  /**
   * Get dashboard analytics for the last 30 days
   * @param {string} creatorId - UUID of the creator
   */
  static async getDashboardAnalytics(creatorId) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    try {
      const analytics = await this.getCreatorAnalytics(creatorId, startDate, endDate);

      // Get daily totals for charting
      const dailyTotals = {};
      analytics.mediaAnalytics.forEach((media) => {
        media.daily.forEach((day) => {
          const date = day.date;
          if (!dailyTotals[date]) {
            dailyTotals[date] = {
              date,
              views: 0,
              likes: 0,
              shares: 0,
              revenue: 0,
            };
          }
          dailyTotals[date].views += day.dailyViews;
          dailyTotals[date].likes += day.dailyLikes;
          dailyTotals[date].shares += day.dailyShares;
          dailyTotals[date].revenue += parseFloat(day.revenue);
        });
      });

      const chartData = Object.values(dailyTotals).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      return {
        ...analytics,
        chartData,
        dateRange: { startDate, endDate },
      };
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      throw error;
    }
  }

  /**
   * Check if a user has already viewed this media item today
   * @param {string} mediaItemId - UUID of the media item
   * @param {string} userId - UUID of the user
   */
  static async isUniqueViewerToday(mediaItemId, userId) {
    // This would require a separate table to track individual user views
    // For now, we'll implement a simple cache-based solution
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `view_${mediaItemId}_${userId}_${today}`;
    
    // In a real implementation, you'd use Redis or a UserViews table
    // For now, we'll return false and implement proper tracking later
    return false;
  }

  /**
   * Get top performing media items for a creator
   * @param {string} creatorId - UUID of the creator
   * @param {number} limit - Number of items to return
   * @param {string} metric - Metric to sort by (views, likes, shares, revenue)
   * @param {number} days - Number of days to look back (default 30)
   */
  static async getTopPerformingMedia(creatorId, limit = 10, metric = 'views', days = 30) {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const mediaItems = await MediaItem.findAll({
        where: { creatorId },
        include: [
          {
            model: MediaAnalytics,
            as: 'analytics',
            where: {
              date: {
                [Op.between]: [startDate, endDate],
              },
            },
            required: false,
          },
        ],
      });

      // Calculate totals and sort
      const mediaWithTotals = mediaItems.map((media) => {
        const analytics = media.analytics || [];
        const totals = {
          views: analytics.reduce((sum, day) => sum + day.dailyViews, 0),
          likes: analytics.reduce((sum, day) => sum + day.dailyLikes, 0),
          shares: analytics.reduce((sum, day) => sum + day.dailyShares, 0),
          revenue: analytics.reduce((sum, day) => sum + parseFloat(day.revenue), 0),
        };

        return {
          ...media.toJSON(),
          totals,
          sortValue: totals[metric] || 0,
        };
      });

      return mediaWithTotals
        .sort((a, b) => b.sortValue - a.sortValue)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top performing media:', error);
      throw error;
    }
  }
}

export default AnalyticsService;
