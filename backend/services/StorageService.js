import S3Service from './S3Service.js';
import AzureBlobService from './AzureBlobService.js';

/**
 * Unified storage service that abstracts between different storage providers
 * Currently supports:
 * - Azure Blob Storage (production)
 * - MinIO/S3 (development)
 */
class StorageService {
  constructor() {
    this.provider = process.env.STORAGE_PROVIDER || 'minio'; // 'azure' or 'minio'
    this.service = null;
    this.initialized = false;
    
    this.initializeProvider();
  }

  /**
   * Initialize the appropriate storage provider
   */
  initializeProvider() {
    switch (this.provider.toLowerCase()) {
      case 'azure':
        if (AzureBlobService.isConfigured()) {
          this.service = AzureBlobService;
          console.log('📦 Using Azure Blob Storage for media');
        } else {
          console.warn('⚠️  Azure Blob Storage not configured, falling back to MinIO');
          this.service = S3Service;
          this.provider = 'minio';
        }
        break;
      case 'minio':
      case 's3':
      default:
        this.service = S3Service;
        console.log('📦 Using MinIO/S3 for media storage');
        break;
    }
  }

  /**
   * Initialize the storage service
   */
  async init() {
    if (this.initialized) return;

    if (!this.service) {
      throw new Error('No storage service configured');
    }

    await this.service.init();
    this.initialized = true;
  }

  /**
   * Initialize with retry logic
   */
  async initWithRetry(maxRetries = 3, delay = 2000) {
    if (this.initialized) return;

    if (!this.service) {
      console.error('❌ No storage service configured');
      return;
    }

    await this.service.initWithRetry(maxRetries, delay);
    this.initialized = true;
  }

  /**
   * Upload a file to storage
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - File MIME type
   * @param {string} tier - Subscription tier
   * @param {string} creatorId - Creator ID
   * @returns {Promise<{key: string, url: string, size: number}>}
   */
  async uploadFile(fileBuffer, originalName, mimeType, tier, creatorId) {
    if (!this.service) {
      throw new Error('Storage service not initialized');
    }

    return await this.service.uploadFile(fileBuffer, originalName, mimeType, tier, creatorId);
  }

  /**
   * Generate a signed URL for secure file access
   * @param {string} key - File key/blob name
   * @param {number} expiresIn - URL expiration time in seconds
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(key, expiresIn = 3600) {
    if (!this.service) {
      throw new Error('Storage service not initialized');
    }

    return await this.service.getSignedUrl(key, expiresIn);
  }

  /**
   * Delete a file from storage
   * @param {string} key - File key/blob name
   * @returns {Promise<boolean>}
   */
  async deleteFile(key) {
    if (!this.service) {
      throw new Error('Storage service not initialized');
    }

    return await this.service.deleteFile(key);
  }

  /**
   * List files in a creator's tier directory
   * @param {string} creatorId - Creator ID
   * @param {string} tier - Subscription tier
   * @param {number} maxResults - Maximum number of results
   * @returns {Promise<Array>} Array of file objects
   */
  async listFiles(creatorId, tier, maxResults = 1000) {
    if (!this.service) {
      throw new Error('Storage service not initialized');
    }

    return await this.service.listFiles(creatorId, tier, maxResults);
  }

  /**
   * Get file metadata
   * @param {string} key - File key/blob name
   * @returns {Promise<object>} File metadata
   */
  async getFileMetadata(key) {
    if (!this.service) {
      throw new Error('Storage service not initialized');
    }

    return await this.service.getFileMetadata(key);
  }

  /**
   * Generate presigned upload URL for profile uploads (profile picture, banner)
   * @param {string} type - Upload type (profile or banner)
   * @param {string} userId - User ID
   * @param {string} contentType - File MIME type
   * @param {number} maxFileSize - Maximum file size in bytes
   * @returns {Promise<object>} Upload URL data
   */
  async getPresignedProfileUploadUrl(type, userId, contentType, maxFileSize = 10 * 1024 * 1024) {
    if (!this.service) {
      throw new Error('Storage service not initialized');
    }

    if (this.provider === 'azure' && this.service.getPresignedProfileUploadUrl) {
      return await this.service.getPresignedProfileUploadUrl(type, userId, contentType, maxFileSize);
    } else if (this.provider === 'minio' && this.service.getPresignedPost) {
      // Use the existing S3 presigned POST method but with profile path
      return await this.service.getPresignedPost('profile', userId, contentType, type);
    } else {
      throw new Error('Presigned profile uploads not supported by current storage provider');
    }
  }

  /**
   * Generate presigned upload URL (if supported by provider)
   * @param {string} tier - Subscription tier
   * @param {string} creatorId - Creator ID
   * @param {string} contentType - File MIME type
   * @param {number} expiresIn - URL expiration time in seconds
   * @returns {Promise<object>} Upload URL data
   */
  async getPresignedUploadUrl(tier, creatorId, contentType, expiresIn = 3600) {
    if (!this.service) {
      throw new Error('Storage service not initialized');
    }

    if (this.provider === 'azure' && this.service.getPresignedUploadUrl) {
      return await this.service.getPresignedUploadUrl(tier, creatorId, contentType, expiresIn);
    } else if (this.provider === 'minio' && this.service.getPresignedPost) {
      return await this.service.getPresignedPost(tier, creatorId, contentType);
    } else {
      throw new Error('Presigned uploads not supported by current storage provider');
    }
  }

  /**
   * Get the current storage provider
   * @returns {string}
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Check if storage service is configured and ready
   * @returns {boolean}
   */
  isReady() {
    return !!(this.service && this.initialized);
  }
}

// Export singleton instance
export default new StorageService();
