import { MediaItem } from '../models/index.js';
import StorageService from './StorageService.js';
import AnalyticsService from './AnalyticsService.js';

class MediaService {
  /**
   * Get media items by tier with access control
   */
  async getMediaByTier(tier, userId, subscription, { page = 1, limit = 12 } = {}) {
    // Check if user has access to this tier
    if (!subscription.hasAccessTo(tier)) {
      throw new Error(`${tier} subscription tier required`);
    }

    const offset = (page - 1) * limit;

    const { rows: mediaItems, count } = await MediaItem.findAndCountAll({
      where: {
        tier,
        isPublished: true
      },
      order: [['publishedAt', 'DESC'], ['sortOrder', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Generate signed URLs for each media item
    const mediaWithSignedUrls = await this._generateSignedUrls(mediaItems);

    return {
      mediaItems: mediaWithSignedUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get all accessible media for user based on subscription
   */
  async getAccessibleMedia(userId, subscription, { page = 1, limit = 12 } = {}) {
    const offset = (page - 1) * limit;

    // Determine accessible tiers based on subscription
    const accessibleTiers = this._getAccessibleTiers(subscription);

    const { rows: mediaItems, count } = await MediaItem.findAndCountAll({
      where: {
        tier: accessibleTiers,
        isPublished: true
      },
      order: [['publishedAt', 'DESC'], ['sortOrder', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Generate signed URLs for each media item
    const mediaWithSignedUrls = await this._generateSignedUrls(mediaItems);

    return {
      mediaItems: mediaWithSignedUrls,
      accessibleTiers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get single media item with access control
   */
  async getMediaItem(id, userId, subscription) {
    const mediaItem = await MediaItem.findByPk(id);

    if (!mediaItem) {
      throw new Error('Media item not found');
    }

    // Check if user has access to this tier
    if (!subscription.hasAccessTo(mediaItem.tier)) {
      throw new Error(`${mediaItem.tier} subscription tier required`);
    }

    // Generate signed URL
    const signedUrl = mediaItem.s3Key 
      ? await StorageService.getSignedUrl(mediaItem.s3Key, 3600)
      : null;

    // Record view analytics (async, don't wait for completion)
    AnalyticsService.recordView(id, userId)
      .catch(error => console.error('Error recording view:', error));

    return {
      ...mediaItem.toJSON(),
      signedUrl,
      s3Key: undefined // Don't expose S3 key
    };
  }

  /**
   * Upload media file
   */
  async uploadMediaFile(file, { tier, title, description }, creatorId) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    if (!tier || !['picture', 'solo_video', 'collab_video'].includes(tier)) {
      throw new Error('Valid tier is required (picture, solo_video, collab_video)');
    }

    // Upload file to storage
    const uploadResult = await StorageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      tier,
      creatorId
    );

    // Create MediaItem record
    const mediaItem = await MediaItem.create({
      title: title || file.originalname,
      description: description || '',
      tier,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      mimeType: file.mimetype,
      fileSize: file.size,
      s3Key: uploadResult.key,
      s3Url: uploadResult.url,
      s3Bucket: process.env.AZURE_CONTAINER_NAME || process.env.S3_BUCKET_NAME || 'void-media',
      storageProvider: StorageService.getProvider(),
      creatorId,
      isPublished: false, // Require manual publishing
      publishedAt: null,
      sortOrder: 0
    });

    return {
      ...mediaItem.toJSON(),
      s3Key: undefined // Don't expose S3 key
    };
  }

  /**
   * Get presigned POST URL for direct browser uploads
   */
  async getPresignedUploadUrl({ tier, contentType, maxFileSize }, creatorId) {
    if (!tier || !['picture', 'solo_video', 'collab_video'].includes(tier)) {
      throw new Error('Valid tier is required (picture, solo_video, collab_video)');
    }

    if (!contentType) {
      throw new Error('Content type is required');
    }

    const presignedPost = await StorageService.getPresignedUploadUrl(
      tier,
      creatorId,
      contentType,
      maxFileSize || 100 * 1024 * 1024 // 100MB default
    );

    return presignedPost;
  }

  /**
   * Delete media item
   */
  async deleteMediaItem(id, creatorId) {
    const mediaItem = await MediaItem.findByPk(id);

    if (!mediaItem) {
      throw new Error('Media item not found');
    }

    // Check if user owns this media item
    if (mediaItem.creatorId !== creatorId) {
      throw new Error('You can only delete your own media');
    }

    // Delete from storage
    if (mediaItem.s3Key) {
      await StorageService.deleteFile(mediaItem.s3Key);
    }

    // Delete from database
    await mediaItem.destroy();

    return {
      message: 'Media item deleted successfully'
    };
  }

  /**
   * Update media item
   */
  async updateMediaItem(id, updateData, creatorId) {
    const mediaItem = await MediaItem.findByPk(id);

    if (!mediaItem) {
      throw new Error('Media item not found');
    }

    // Check if user owns this media item
    if (mediaItem.creatorId !== creatorId) {
      throw new Error('You can only update your own media');
    }

    const allowedFields = ['title', 'description', 'tier', 'isPublished', 'sortOrder'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // If publishing, set publishedAt
    if (filteredData.isPublished && !mediaItem.isPublished) {
      filteredData.publishedAt = new Date();
    }

    await mediaItem.update(filteredData);

    return {
      ...mediaItem.toJSON(),
      s3Key: undefined // Don't expose S3 key
    };
  }

  /**
   * Get media items by creator
   */
  async getMediaByCreator(creatorId, { page = 1, limit = 12, includeUnpublished = false } = {}) {
    const offset = (page - 1) * limit;
    
    const where = { creatorId };
    if (!includeUnpublished) {
      where.isPublished = true;
    }

    const { rows: mediaItems, count } = await MediaItem.findAndCountAll({
      where,
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Generate signed URLs for published items only
    const mediaWithSignedUrls = await Promise.all(
      mediaItems.map(async (item) => {
        let signedUrl = null;
        if (item.isPublished && item.s3Key) {
          signedUrl = await StorageService.getSignedUrl(item.s3Key, 3600);
        }
        
        return {
          ...item.toJSON(),
          signedUrl,
          s3Key: undefined
        };
      })
    );

    return {
      mediaItems: mediaWithSignedUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get media analytics for creator
   */
  async getMediaAnalytics(creatorId, { startDate, endDate, mediaItemId } = {}) {
    // This would integrate with AnalyticsService
    return await AnalyticsService.getMediaAnalytics({
      creatorId,
      startDate,
      endDate,
      mediaItemId
    });
  }

  /**
   * Generate signed URLs for media items
   * @private
   */
  async _generateSignedUrls(mediaItems) {
    return await Promise.all(
      mediaItems.map(async (item) => {
        const signedUrl = item.s3Key 
          ? await StorageService.getSignedUrl(item.s3Key, 3600) // 1 hour expiry
          : null;
        
        return {
          ...item.toJSON(),
          signedUrl,
          s3Key: undefined // Don't expose S3 key to frontend
        };
      })
    );
  }

  /**
   * Determine accessible tiers based on subscription
   * @private
   */
  _getAccessibleTiers(subscription) {
    if (subscription.hasAccessTo('collab_video')) {
      return ['picture', 'solo_video', 'collab_video'];
    } else if (subscription.hasAccessTo('solo_video')) {
      return ['picture', 'solo_video'];
    } else {
      return ['picture'];
    }
  }
}

export default new MediaService();
