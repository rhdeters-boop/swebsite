import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MediaAnalytics = sequelize.define('MediaAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  mediaItemId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'media_item_id', // Explicitly map to snake_case column
    references: {
      model: 'media_items', // Use the actual table name with underscores
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  date: {
    type: DataTypes.DATEONLY, // YYYY-MM-DD format
    allowNull: false,
  },
  dailyViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  dailyLikes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  dailyShares: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  dailyComments: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  dailyDownloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  uniqueViewers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  watchTime: {
    type: DataTypes.INTEGER, // Total watch time in seconds for videos
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  averageWatchTime: {
    type: DataTypes.FLOAT, // Average watch time in seconds
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  bounceRate: {
    type: DataTypes.FLOAT, // Percentage of users who viewed and left immediately
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  conversionRate: {
    type: DataTypes.FLOAT, // Percentage leading to subscriptions
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  revenue: {
    type: DataTypes.DECIMAL(10, 2), // Daily revenue generated from this media
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  metadata: {
    type: DataTypes.JSONB, // For additional metrics or platform-specific data
    defaultValue: {},
  },
}, {
  // Table options
  tableName: 'media_analytics', // Use snake_case for table name
  timestamps: true, // Adds createdAt and updatedAt
  indexes: [
    // Unique constraint for one entry per media item per date
    {
      unique: true,
      fields: ['media_item_id', 'date'],
      name: 'unique_media_date',
    },
    // Index for quick date range queries
    {
      fields: ['date'],
      name: 'idx_media_analytics_date',
    },
    // Index for quick media item queries
    {
      fields: ['media_item_id'],
      name: 'idx_media_analytics_media_item',
    },
    // Composite index for creator analytics
    {
      fields: ['media_item_id', 'date'],
      name: 'idx_media_analytics_media_date',
    },
  ],
});

// Class methods for analytics operations
MediaAnalytics.incrementViews = async function(mediaItemId, incrementBy = 1) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const [analytics, created] = await this.findOrCreate({
    where: {
      mediaItemId: mediaItemId, // Use the model attribute name
      date: today,
    },
    defaults: {
      mediaItemId: mediaItemId, // Use the model attribute name
      date: today,
      dailyViews: incrementBy,
    },
  });

  if (!created) {
    await analytics.increment('dailyViews', { by: incrementBy });
  }

  return analytics;
};

MediaAnalytics.incrementLikes = async function(mediaItemId, incrementBy = 1) {
  const today = new Date().toISOString().split('T')[0];
  
  const [analytics, created] = await this.findOrCreate({
    where: {
      mediaItemId: mediaItemId, // Use the model attribute name
      date: today,
    },
    defaults: {
      mediaItemId: mediaItemId, // Use the model attribute name
      date: today,
      dailyLikes: incrementBy,
    },
  });

  if (!created) {
    await analytics.increment('dailyLikes', { by: incrementBy });
  }

  return analytics;
};

MediaAnalytics.incrementShares = async function(mediaItemId, incrementBy = 1) {
  const today = new Date().toISOString().split('T')[0];
  
  const [analytics, created] = await this.findOrCreate({
    where: {
      mediaItemId: mediaItemId, // Use the model attribute name
      date: today,
    },
    defaults: {
      mediaItemId: mediaItemId, // Use the model attribute name
      date: today,
      dailyShares: incrementBy,
    },
  });

  if (!created) {
    await analytics.increment('dailyShares', { by: incrementBy });
  }

  return analytics;
};

MediaAnalytics.recordWatchTime = async function(mediaItemId, watchTimeSeconds, isUniqueViewer = false) {
  const today = new Date().toISOString().split('T')[0];
  
  const [analytics, created] = await this.findOrCreate({
    where: {
      mediaItemId: mediaItemId, // Use the model attribute name
      date: today,
    },
    defaults: {
      mediaItemId: mediaItemId, // Use the model attribute name
      date: today,
      watchTime: watchTimeSeconds,
      uniqueViewers: isUniqueViewer ? 1 : 0,
    },
  });

  if (!created) {
    await analytics.increment('watchTime', { by: watchTimeSeconds });
    if (isUniqueViewer) {
      await analytics.increment('uniqueViewers', { by: 1 });
    }
    
    // Update average watch time
    await analytics.reload();
    const avgWatchTime = analytics.dailyViews > 0 ? analytics.watchTime / analytics.dailyViews : 0;
    await analytics.update({ averageWatchTime: avgWatchTime });
  }

  return analytics;
};

// Get analytics for a date range
MediaAnalytics.getAnalyticsForPeriod = async function(mediaItemId, startDate, endDate) {
  const { Op } = await import('sequelize');
  
  return await this.findAll({
    where: {
      mediaItemId: mediaItemId, // Use the model attribute name
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    order: [['date', 'ASC']],
  });
};

// Get aggregated analytics for a media item
MediaAnalytics.getAggregatedAnalytics = async function(mediaItemId, startDate, endDate) {
  const { Op, fn, col } = await import('sequelize');
  
  return await this.findOne({
    where: {
      mediaItemId: mediaItemId, // Use the model attribute name
      ...(startDate && endDate && {
        date: {
          [Op.between]: [startDate, endDate],
        },
      }),
    },
    attributes: [
      [fn('SUM', col('daily_views')), 'totalViews'],
      [fn('SUM', col('daily_likes')), 'totalLikes'],
      [fn('SUM', col('daily_shares')), 'totalShares'],
      [fn('SUM', col('daily_comments')), 'totalComments'],
      [fn('SUM', col('daily_downloads')), 'totalDownloads'],
      [fn('MAX', col('unique_viewers')), 'maxUniqueViewers'],
      [fn('SUM', col('watch_time')), 'totalWatchTime'],
      [fn('AVG', col('average_watch_time')), 'avgWatchTime'],
      [fn('AVG', col('bounce_rate')), 'avgBounceRate'],
      [fn('AVG', col('conversion_rate')), 'avgConversionRate'],
      [fn('SUM', col('revenue')), 'totalRevenue'],
    ],
    raw: true,
  });
};

export default MediaAnalytics;
