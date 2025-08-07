/**
 * Azure Blob Storage Configuration Test
 * This script tests the Azure Blob Storage connection and basic operations
 */

import dotenv from 'dotenv';
import AzureBlobService from '../services/AzureBlobService.js';
import StorageService from '../services/StorageService.js';

// Load environment variables
dotenv.config();

const testAzureConnection = async () => {
  console.log('🧪 Testing Azure Blob Storage Configuration...\n');

  try {
    // Test 1: Check if Azure is configured
    console.log('1️⃣ Checking Azure configuration...');
    if (!AzureBlobService.isConfigured()) {
      console.log('❌ Azure Blob Storage is not configured');
      console.log('Required environment variables:');
      console.log('  - AZURE_STORAGE_ACCOUNT_NAME');
      console.log('  - AZURE_STORAGE_ACCOUNT_KEY');
      console.log('  - AZURE_CONTAINER_NAME (optional, defaults to "void-media")');
      return false;
    }
    console.log('✅ Azure configuration found');

    // Test 2: Initialize service
    console.log('\n2️⃣ Initializing Azure Blob Service...');
    await AzureBlobService.init();
    console.log('✅ Azure Blob Service initialized successfully');

    // Test 3: Test StorageService provider selection
    console.log('\n3️⃣ Testing StorageService provider selection...');
    console.log(`Current provider: ${StorageService.getProvider()}`);
    
    if (process.env.STORAGE_PROVIDER === 'azure') {
      console.log('✅ StorageService is configured to use Azure');
      await StorageService.init();
    } else {
      console.log('ℹ️  StorageService is not using Azure (check STORAGE_PROVIDER)');
    }

    // Test 4: Test basic operations (if configured to use Azure)
    if (process.env.STORAGE_PROVIDER === 'azure') {
      console.log('\n4️⃣ Testing basic operations...');
      
      // Test upload with dummy data
      const testData = Buffer.from('test-file-content');
      const uploadResult = await AzureBlobService.uploadFile(
        testData,
        'test.txt',
        'text/plain',
        'picture',
        'test-creator-id'
      );
      console.log('✅ Test file uploaded:', uploadResult.key);

      // Test signed URL generation
      const signedUrl = await AzureBlobService.getSignedUrl(uploadResult.key, 300); // 5 minutes
      console.log('✅ Generated signed URL (expires in 5 minutes)');
      console.log('URL length:', signedUrl.length);

      // Test file listing
      const files = await AzureBlobService.listFiles('test-creator-id', 'picture', 10);
      console.log(`✅ Listed ${files.length} files in test directory`);

      // Cleanup - delete test file
      await AzureBlobService.deleteFile(uploadResult.key);
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 All tests passed! Azure Blob Storage is ready to use.');
    return true;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
};

const testMinIOConnection = async () => {
  console.log('🧪 Testing MinIO/S3 Configuration...\n');

  try {
    // Import S3Service
    const S3Service = (await import('../services/S3Service.js')).default;
    
    console.log('1️⃣ Testing MinIO/S3 connection...');
    await S3Service.init();
    console.log('✅ MinIO/S3 connection successful');

    return true;
  } catch (error) {
    console.error('❌ MinIO/S3 test failed:', error.message);
    return false;
  }
};

// Main test runner
const main = async () => {
  console.log('🔍 Storage Configuration Test\n');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Storage Provider: ${process.env.STORAGE_PROVIDER || 'minio'}\n`);

  const provider = process.env.STORAGE_PROVIDER || 'minio';
  
  let success = false;
  
  if (provider === 'azure') {
    success = await testAzureConnection();
  } else {
    success = await testMinIOConnection();
  }

  if (success) {
    console.log('\n✨ Configuration test completed successfully!');
    process.exit(0);
  } else {
    console.log('\n💥 Configuration test failed!');
    process.exit(1);
  }
};

// Run tests
main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
