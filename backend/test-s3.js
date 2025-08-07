#!/usr/bin/env node

/**
 * S3 Media Storage Test Script
 * Tests the S3/MinIO media storage functionality locally
 */

import dotenv from 'dotenv';
import S3Service from './services/S3Service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

console.log('🧪 Starting S3 Media Storage Test');
console.log('=' .repeat(50));

async function testS3Service() {
  try {
    // Test 1: Initialize S3 service
    console.log('\n1️⃣ Testing S3 Service Initialization...');
    await S3Service.initWithRetry();
    console.log('✅ S3 Service initialized successfully');

    // Test 2: Create a test file buffer (simulating an image)
    console.log('\n2️⃣ Testing File Upload...');
    const testImageData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const uploadResult = await S3Service.uploadFile(
      testImageData,
      'test-image.png',
      'image/png',
      'picture',
      'test-creator-123'
    );
    
    console.log('✅ File uploaded successfully:');
    console.log(`   - Key: ${uploadResult.key}`);
    console.log(`   - URL: ${uploadResult.url}`);
    console.log(`   - Size: ${uploadResult.size} bytes`);

    // Test 3: Generate signed URL
    console.log('\n3️⃣ Testing Signed URL Generation...');
    const signedUrl = await S3Service.getSignedUrl(uploadResult.key, 3600);
    console.log('✅ Signed URL generated successfully:');
    console.log(`   - URL: ${signedUrl.substring(0, 80)}...`);

    // Test 4: Get file metadata
    console.log('\n4️⃣ Testing File Metadata Retrieval...');
    const metadata = await S3Service.getFileMetadata(uploadResult.key);
    console.log('✅ File metadata retrieved:');
    console.log(`   - Content Type: ${metadata.contentType}`);
    console.log(`   - Content Length: ${metadata.contentLength} bytes`);
    console.log(`   - Last Modified: ${metadata.lastModified}`);

    // Test 5: Generate presigned POST URL
    console.log('\n5️⃣ Testing Presigned POST URL...');
    const presignedPost = await S3Service.getPresignedPost(
      'picture',
      'test-creator-456',
      'image/jpeg',
      10 * 1024 * 1024 // 10MB limit
    );
    console.log('✅ Presigned POST generated:');
    console.log(`   - URL: ${presignedPost.url}`);
    console.log(`   - Fields count: ${Object.keys(presignedPost.fields).length}`);

    // Test 6: List files
    console.log('\n6️⃣ Testing File Listing...');
    const fileList = await S3Service.listFiles('test-creator-123', 'picture');
    console.log(`✅ Found ${fileList.length} files`);
    fileList.forEach((file, index) => {
      console.log(`   - File ${index + 1}: ${file.key} (${file.size} bytes)`);
    });

    // Test 7: Delete test file
    console.log('\n7️⃣ Testing File Deletion...');
    const deleteResult = await S3Service.deleteFile(uploadResult.key);
    console.log(`✅ File deleted: ${deleteResult}`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('=' .repeat(50));
    console.log('✅ S3 media storage is working correctly');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Test database connection and media model
async function testDatabaseIntegration() {
  try {
    console.log('\n8️⃣ Testing Database Integration...');
    
    // Import database models
    const { default: sequelize } = await import('./config/database.js');
    const { MediaItem } = await import('./models/index.js');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Test creating a media item record
    const testMediaItem = await MediaItem.create({
      creatorId: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
      title: 'Test Media Item',
      description: 'A test media item for S3 integration',
      type: 'image',
      tier: 'picture',
      mimeType: 'image/png',
      s3Key: 'test/media-item-key.png',
      s3Url: 'https://example.com/test-url',
      fileSize: 1024,
      isPublished: false,
    });
    
    console.log('✅ Media item created in database:');
    console.log(`   - ID: ${testMediaItem.id}`);
    console.log(`   - S3 Key: ${testMediaItem.s3Key}`);
    
    // Test getting signed URL from model method
    console.log('\n9️⃣ Testing Model Integration...');
    const modelSignedUrl = await testMediaItem.getSignedUrl(300); // 5 minutes
    console.log('✅ Signed URL generated from model:');
    console.log(`   - URL: ${modelSignedUrl ? modelSignedUrl.substring(0, 80) + '...' : 'null'}`);
    
    // Clean up test data
    await testMediaItem.destroy();
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('\n❌ Database integration test failed:', error.message);
    throw error;
  }
}

// Main test function
async function runTests() {
  try {
    // Check environment
    console.log('🔧 Environment Configuration:');
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   - S3_ENDPOINT: ${process.env.S3_ENDPOINT}`);
    console.log(`   - S3_BUCKET_NAME: ${process.env.S3_BUCKET_NAME}`);
    console.log(`   - AWS_REGION: ${process.env.AWS_REGION}`);
    
    await testS3Service();
    await testDatabaseIntegration();
    
    console.log('\n🚀 All S3 media storage tests passed!');
    console.log('You can now upload and manage media files securely.');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Handle CLI arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
S3 Media Storage Test Script

Usage:
  node test-s3.js [options]

Options:
  --help, -h     Show this help message
  
Environment Variables Required:
  S3_ENDPOINT           MinIO/S3 endpoint (default: http://localhost:9000)
  AWS_ACCESS_KEY_ID     Access key (default: minioadmin)
  AWS_SECRET_ACCESS_KEY Secret key (default: minioadmin123)
  S3_BUCKET_NAME        Bucket name (default: void-media)
  AWS_REGION            AWS region (default: us-east-1)

Example:
  npm run test:s3
  # or
  node backend/test-s3.js
`);
  process.exit(0);
}

// Run the tests
runTests();
