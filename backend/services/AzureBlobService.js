import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

class AzureBlobService {
  constructor() {
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    this.accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    this.containerName = process.env.AZURE_CONTAINER_NAME || 'void-media';
    
    if (!this.accountName || !this.accountKey) {
      console.warn('⚠️  Azure storage credentials not found. Service will initialize later when needed.');
      this.blobServiceClient = null;
      return;
    }

    // Create credential and blob service client
    const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
    this.blobServiceClient = new BlobServiceClient(
      `https://${this.accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    this.initialized = false;
  }

  /**
   * Initialize the Azure Blob service and create container if it doesn't exist
   */
  async init() {
    if (this.initialized || !this.blobServiceClient) return;

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      // Check if container exists, create if it doesn't
      const exists = await containerClient.exists();
      if (!exists) {
        console.log(`📦 Creating Azure container '${this.containerName}'...`);
        await containerClient.create({
          access: 'private' // Private access by default for premium content
        });
        console.log(`✅ Created Azure container '${this.containerName}'`);
      } else {
        console.log(`✅ Azure container '${this.containerName}' exists`);
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Error initializing Azure Blob service:', error.message);
      throw error;
    }
  }

  /**
   * Initialize with retry logic for development
   */
  async initWithRetry(maxRetries = 3, delay = 2000) {
    if (this.initialized || !this.blobServiceClient) return;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.init();
        return;
      } catch (_error) {
        console.log(`🔄 Azure Blob connection attempt ${attempt}/${maxRetries} failed`);
        
        if (attempt === maxRetries) {
          console.log('⚠️  Azure Blob service will initialize later when needed');
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Upload a file to Azure Blob Storage
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - File MIME type
   * @param {string} tier - Subscription tier (picture, solo_video, collab_video)
   * @param {string} creatorId - Creator ID
   * @returns {Promise<{key: string, url: string, size: number}>}
   */
  async uploadFile(fileBuffer, originalName, mimeType, tier, creatorId) {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob service not configured');
    }

    await this.init();

    const fileExtension = path.extname(originalName);
    const fileName = `${uuidv4()}${fileExtension}`;
    const blobName = `media/${creatorId}/${tier}/${fileName}`;

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Set blob metadata and properties
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: mimeType,
        },
        metadata: {
          'original-name': originalName,
          'creator-id': creatorId,
          'tier': tier,
          'upload-date': new Date().toISOString(),
          'access': 'Premium'
        },
        tags: {
          Access: 'Premium',
          Tier: tier,
          CreatorId: creatorId
        }
      };

      const uploadResult = await blockBlobClient.upload(fileBuffer, fileBuffer.length, uploadOptions);

      return {
        key: blobName,
        url: blockBlobClient.url,
        size: fileBuffer.length,
        etag: uploadResult.etag
      };
    } catch (error) {
      console.error('❌ Error uploading file to Azure Blob:', error.message);
      throw new Error('Failed to upload file to Azure Blob Storage');
    }
  }

  /**
   * Generate a SAS URL for secure file access
   * @param {string} blobName - Blob name (key)
   * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns {Promise<string>} SAS URL
   */
  async getSignedUrl(blobName, expiresIn = 3600) {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob service not configured');
    }

    await this.init();

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);

      // Generate SAS token
      const startsOn = new Date();
      const expiresOn = new Date(startsOn.getTime() + (expiresIn * 1000));

      const sasOptions = {
        containerName: this.containerName,
        blobName: blobName,
        permissions: BlobSASPermissions.parse('r'), // Read permission only
        startsOn,
        expiresOn,
      };

      const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
      const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

      return `${blobClient.url}?${sasToken}`;
    } catch (error) {
      console.error('❌ Error generating SAS URL:', error.message);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Delete a file from Azure Blob Storage
   * @param {string} blobName - Blob name (key)
   * @returns {Promise<boolean>}
   */
  async deleteFile(blobName) {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob service not configured');
    }

    await this.init();

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);
      
      await blobClient.deleteIfExists();
      return true;
    } catch (error) {
      console.error('❌ Error deleting file from Azure Blob:', error.message);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * List files in a specific creator's tier directory
   * @param {string} creatorId - Creator ID
   * @param {string} tier - Subscription tier
   * @param {number} maxPageSize - Maximum number of results per page
   * @returns {Promise<Array>} Array of file objects
   */
  async listFiles(creatorId, tier, maxPageSize = 1000) {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob service not configured');
    }

    await this.init();

    const prefix = `media/${creatorId}/${tier}/`;

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const listOptions = {
        prefix: prefix,
        includeMetadata: true,
        includeTags: true
      };

      const files = [];
      for await (const blob of containerClient.listBlobsFlat(listOptions)) {
        files.push({
          key: blob.name,
          lastModified: blob.properties.lastModified,
          size: blob.properties.contentLength,
          etag: blob.properties.etag,
          metadata: blob.metadata,
          tags: blob.tags
        });

        if (files.length >= maxPageSize) break;
      }

      return files;
    } catch (error) {
      console.error('❌ Error listing files from Azure Blob:', error.message);
      throw new Error('Failed to list files');
    }
  }

  /**
   * Get file metadata
   * @param {string} blobName - Blob name (key)
   * @returns {Promise<object>} File metadata
   */
  async getFileMetadata(blobName) {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob service not configured');
    }

    await this.init();

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);
      
      const properties = await blobClient.getProperties();
      const tags = await blobClient.getTags();

      return {
        contentType: properties.contentType,
        contentLength: properties.contentLength,
        lastModified: properties.lastModified,
        etag: properties.etag,
        metadata: properties.metadata,
        tags: tags.tags
      };
    } catch (error) {
      console.error('❌ Error getting file metadata from Azure Blob:', error.message);
      throw new Error('Failed to get file metadata');
    }
  }

  /**
   * Generate a presigned upload URL for direct browser uploads
   * @param {string} tier - Subscription tier
   * @param {string} creatorId - Creator ID
   * @param {string} contentType - File MIME type
   * @param {number} expiresIn - URL expiration time in seconds
   * @returns {Promise<{url: string, blobName: string}>}
   */
  async getPresignedUploadUrl(tier, creatorId, contentType, expiresIn = 3600) {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob service not configured');
    }

    await this.init();

    const fileName = `${uuidv4()}${path.extname(contentType)}`;
    const blobName = `media/${creatorId}/${tier}/${fileName}`;

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlockBlobClient(blobName);

      // Generate SAS token for upload
      const startsOn = new Date();
      const expiresOn = new Date(startsOn.getTime() + (expiresIn * 1000));

      const sasOptions = {
        containerName: this.containerName,
        blobName: blobName,
        permissions: BlobSASPermissions.parse('w'), // Write permission
        startsOn,
        expiresOn,
      };

      const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
      const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

      return {
        url: `${blobClient.url}?${sasToken}`,
        blobName: blobName
      };
    } catch (error) {
      console.error('❌ Error generating presigned upload URL:', error.message);
      throw new Error('Failed to generate presigned upload URL');
    }
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!(this.accountName && this.accountKey && this.blobServiceClient);
  }
}

// Export singleton instance
export default new AzureBlobService();
