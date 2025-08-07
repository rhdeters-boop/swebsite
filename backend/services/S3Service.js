import { 
  S3Client, 
  CreateBucketCommand, 
  HeadBucketCommand, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  ListObjectsV2Command,
  HeadObjectCommand,
  PutBucketPolicyCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

class S3Service {
  constructor() {
    // Configure AWS SDK v3 for MinIO
    this.s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'minioadmin',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin123',
      },
      region: process.env.AWS_REGION || 'us-east-1',
      forcePathStyle: true, // Required for MinIO
    });

    this.bucketName = process.env.S3_BUCKET_NAME || 'void-media';
    this.initialized = false;
  }

  /**
   * Initialize the S3 service and create bucket if it doesn't exist
   */
  async init() {
    if (this.initialized) return;

    try {
      // Check if bucket exists
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      console.log(`✅ S3 bucket '${this.bucketName}' exists`);
    } catch (error) {
      console.log(`🔍 Bucket check failed: ${error.name} - ${error.message}`);
      
      if (error.name === 'NotFound' || error.name === 'NoSuchBucket' || error.$metadata?.httpStatusCode === 404) {
        // Create bucket if it doesn't exist
        console.log(`📦 Creating bucket '${this.bucketName}'...`);
        await this.createBucket();
      } else {
        console.error('❌ Error checking S3 bucket:', error.name, error.message);
        throw error;
      }
    }

    this.initialized = true;
  }

  /**
   * Initialize the S3 service with better error handling for development
   */
  async initWithRetry(maxRetries = 3, delay = 2000) {
    if (this.initialized) return;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.init();
        return;
      } catch (_error) {
        console.log(`🔄 S3 connection attempt ${attempt}/${maxRetries} failed`);
        
        if (attempt === maxRetries) {
          console.log('⚠️  S3 service will initialize later when needed');
          return; // Don't throw error, allow server to start
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Create a new S3 bucket
   */
  async createBucket() {
    try {
      // For MinIO with us-east-1, we don't need CreateBucketConfiguration
      const createParams = { Bucket: this.bucketName };
      
      // Only add CreateBucketConfiguration if not us-east-1
      if (process.env.AWS_REGION && process.env.AWS_REGION !== 'us-east-1') {
        createParams.CreateBucketConfiguration = {
          LocationConstraint: process.env.AWS_REGION
        };
      }

      await this.s3Client.send(new CreateBucketCommand(createParams));
      
      console.log(`✅ Created S3 bucket '${this.bucketName}'`);

      // Note: Bucket policies might not work with MinIO in the same way as AWS S3
      // Skip bucket policy for local development
      if (!process.env.S3_ENDPOINT || process.env.S3_ENDPOINT.includes('amazonaws.com')) {
        const bucketPolicy = {
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'AllowSecureAccess',
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
              Condition: {
                StringEquals: {
                  's3:ExistingObjectTag/Access': 'Premium'
                }
              }
            }
          ]
        };

        await this.s3Client.send(new PutBucketPolicyCommand({
          Bucket: this.bucketName,
          Policy: JSON.stringify(bucketPolicy)
        }));

        console.log(`✅ Set bucket policy for '${this.bucketName}'`);
      } else {
        console.log(`ℹ️  Skipping bucket policy for MinIO development setup`);
      }
    } catch (error) {
      console.error('❌ Error creating S3 bucket:', error.message);
      throw error;
    }
  }

  /**
   * Upload a file to S3
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - File MIME type
   * @param {string} tier - Subscription tier (picture, solo_video, collab_video)
   * @param {string} creatorId - Creator ID
   * @returns {Promise<{key: string, url: string, size: number}>}
   */
  async uploadFile(fileBuffer, originalName, mimeType, tier, creatorId) {
    await this.init();

    const fileExtension = path.extname(originalName);
    const fileName = `${uuidv4()}${fileExtension}`;
    const key = `media/${creatorId}/${tier}/${fileName}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      Metadata: {
        'original-name': originalName,
        'creator-id': creatorId,
        'tier': tier,
        'upload-date': new Date().toISOString()
      },
      Tagging: `Access=Premium&Tier=${tier}&CreatorId=${creatorId}`
    };

    try {
      const result = await this.s3Client.send(new PutObjectCommand(uploadParams));
      
      return {
        key: key,
        url: `${process.env.S3_ENDPOINT || 'http://localhost:9000'}/${this.bucketName}/${key}`,
        size: fileBuffer.length,
        etag: result.ETag
      };
    } catch (error) {
      console.error('❌ Error uploading file to S3:', error.message);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Generate a presigned URL for secure file access
   * @param {string} key - S3 object key
   * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns {Promise<string>} Presigned URL
   */
  async getSignedUrl(key, expiresIn = 3600) {
    await this.init();

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error('❌ Error generating signed URL:', error.message);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Delete a file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<boolean>}
   */
  async deleteFile(key) {
    await this.init();

    try {
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      }));

      return true;
    } catch (error) {
      console.error('❌ Error deleting file from S3:', error.message);
      throw new Error('Failed to delete file');
    }
  }

    /**
   * Generate presigned POST URL for browser uploads
   * @param {string} tier - Subscription tier (picture, solo_video, collab_video) OR 'profile'
   * @param {string} creatorId - Creator ID OR User ID for profiles
   * @param {string} contentType - File MIME type
   * @param {number|string} maxFileSize - Maximum file size in bytes OR profile type (profile, banner)
   * @returns {Promise<object>} Presigned POST data
   */
  async getPresignedPost(tier, creatorId, contentType, maxFileSize = 100 * 1024 * 1024) {
    await this.init();

    let key;
    let tags;
    let conditions;
    
    // Handle profile uploads differently
    if (tier === 'profile') {
      const profileType = typeof maxFileSize === 'string' ? maxFileSize : 'profile';
      const actualMaxSize = typeof maxFileSize === 'string' ? 10 * 1024 * 1024 : maxFileSize;
      
      key = `profiles/${creatorId}/${profileType}/${uuidv4()}`;
      tags = `Access=Public&Type=Profile&UserId=${creatorId}`;
      conditions = [
        ['content-length-range', 0, actualMaxSize],
        ['starts-with', '$Content-Type', 'image/'], // Only allow images for profiles
        ['eq', '$x-amz-meta-user-id', creatorId]
      ];
    } else {
      // Regular media uploads
      key = `media/${creatorId}/${tier}/${uuidv4()}`;
      tags = `Access=Premium&Tier=${tier}&CreatorId=${creatorId}`;
      conditions = [
        ['content-length-range', 0, maxFileSize],
        ['starts-with', '$Content-Type', contentType.split('/')[0]],
        ['eq', '$x-amz-meta-tier', tier]
      ];
    }
    
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Fields: {
        'Content-Type': contentType,
        'x-amz-meta-creator-id': creatorId,
        'x-amz-meta-user-id': creatorId,
        'x-amz-meta-tier': tier,
        'x-amz-tagging': tags
      },
      Conditions: conditions,
      Expires: 3600 // 1 hour
    };

    try {
      const signedPost = await createPresignedPost(this.s3Client, params);
      return signedPost;
    } catch (error) {
      console.error('❌ Error generating presigned POST:', error.message);
      throw new Error('Failed to generate presigned POST URL');
    }
  }

  /**
   * List files in a specific creator's tier directory
   * @param {string} creatorId - Creator ID
   * @param {string} tier - Subscription tier
   * @param {number} maxKeys - Maximum number of keys to return
   * @returns {Promise<Array>} Array of file objects
   */
  async listFiles(creatorId, tier, maxKeys = 1000) {
    await this.init();

    const prefix = `media/${creatorId}/${tier}/`;

    try {
      const result = await this.s3Client.send(new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys
      }));

      return (result.Contents || []).map(obj => ({
        key: obj.Key,
        lastModified: obj.LastModified,
        size: obj.Size,
        etag: obj.ETag
      }));
    } catch (error) {
      console.error('❌ Error listing files:', error.message);
      throw new Error('Failed to list files');
    }
  }

  /**
   * Get file metadata
   * @param {string} key - S3 object key
   * @returns {Promise<object>} File metadata
   */
  async getFileMetadata(key) {
    await this.init();

    try {
      const result = await this.s3Client.send(new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key
      }));

      return {
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        etag: result.ETag,
        metadata: result.Metadata,
        tags: result.TagSet
      };
    } catch (error) {
      console.error('❌ Error getting file metadata:', error.message);
      throw new Error('Failed to get file metadata');
    }
  }
}

// Export singleton instance
export default new S3Service();
