/**
 * Migration script to add Azure Blob Storage support
 * This script adds the storageProvider column to the MediaItems table
 * and updates existing records to use the current storage provider
 */

import { MediaItem } from '../models/index.js';
import sequelize from '../config/database.js';

const migrate = async () => {
  try {
    console.log('🔄 Starting Azure Blob Storage migration...');

    // Add the storageProvider column if it doesn't exist
    await sequelize.query(`
      ALTER TABLE "MediaItems" 
      ADD COLUMN IF NOT EXISTS "storageProvider" 
      VARCHAR(10) DEFAULT '${process.env.STORAGE_PROVIDER || 'minio'}';
    `);

    console.log('✅ Added storageProvider column');

    // Update existing records to set the storage provider
    const currentProvider = process.env.STORAGE_PROVIDER || 'minio';
    const [updatedCount] = await MediaItem.update(
      { storageProvider: currentProvider },
      { 
        where: { storageProvider: null },
        returning: true 
      }
    );

    console.log(`✅ Updated ${updatedCount} existing media items with storage provider: ${currentProvider}`);

    // Update the s3Bucket field to use the appropriate container name
    const containerName = currentProvider === 'azure' 
      ? process.env.AZURE_CONTAINER_NAME || 'void-media'
      : process.env.S3_BUCKET_NAME || 'void-media';

    await MediaItem.update(
      { s3Bucket: containerName },
      { where: {} }
    );

    console.log(`✅ Updated container/bucket names to: ${containerName}`);

    console.log('🎉 Azure Blob Storage migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default migrate;
