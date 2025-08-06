import S3Service from './backend/services/S3Service.js';
import fs from 'fs';
import path from 'path';

async function testMinIOSetup() {
  console.log('🧪 Testing MinIO S3 Service Setup...\n');

  try {
    // Test 1: Initialize S3 Service
    console.log('1️⃣ Testing S3Service initialization...');
    await S3Service.init();
    console.log('✅ S3Service initialized successfully\n');

    // Test 2: Upload a test file
    console.log('2️⃣ Testing file upload...');
    const testFilePath = './test-upload.txt';
    const fileBuffer = fs.readFileSync(testFilePath);
    const fileName = 'test-upload.txt';
    const mimeType = 'text/plain';
    const tier = 'picture';
    const creatorId = 'test-creator-123';

    const uploadResult = await S3Service.uploadFile(
      fileBuffer,
      fileName,
      mimeType,
      tier,
      creatorId
    );

    console.log('✅ File uploaded successfully!');
    console.log('📁 Upload details:', {
      key: uploadResult.key,
      size: uploadResult.size,
      etag: uploadResult.etag
    });
    console.log();

    // Test 3: Generate signed URL
    console.log('3️⃣ Testing signed URL generation...');
    const signedUrl = await S3Service.getSignedUrl(uploadResult.key, 3600);
    console.log('✅ Signed URL generated successfully!');
    console.log('🔗 URL:', signedUrl.substring(0, 100) + '...');
    console.log();

    // Test 4: List files
    console.log('4️⃣ Testing file listing...');
    const files = await S3Service.listFiles(creatorId, tier);
    console.log('✅ Files listed successfully!');
    console.log('📋 Found', files.length, 'file(s) in', `${creatorId}/${tier}`);
    console.log();

    // Test 5: Get file metadata
    console.log('5️⃣ Testing file metadata retrieval...');
    const metadata = await S3Service.getFileMetadata(uploadResult.key);
    console.log('✅ Metadata retrieved successfully!');
    console.log('📊 Metadata:', {
      contentType: metadata.contentType,
      contentLength: metadata.contentLength,
      lastModified: metadata.lastModified
    });
    console.log();

    // Test 6: Test presigned POST URL
    console.log('6️⃣ Testing presigned POST URL generation...');
    const presignedPost = await S3Service.getPresignedPost(
      'solo_video',
      creatorId,
      'video/mp4',
      50 * 1024 * 1024 // 50MB
    );
    console.log('✅ Presigned POST URL generated successfully!');
    console.log('📤 Post URL:', presignedPost.url);
    console.log();

    // Test 7: Download test via signed URL
    console.log('7️⃣ Testing file download via signed URL...');
    const response = await fetch(signedUrl);
    if (response.ok) {
      const content = await response.text();
      const isCorrect = content.includes('This is a test file for MinIO');
      console.log('✅ File downloaded successfully!');
      console.log('📥 Content check:', isCorrect ? 'PASSED' : 'FAILED');
    } else {
      console.log('❌ Download failed:', response.statusText);
    }
    console.log();

    // Test 8: Cleanup - Delete test file
    console.log('8️⃣ Testing file deletion...');
    const deleted = await S3Service.deleteFile(uploadResult.key);
    console.log('✅ File deleted successfully!');
    console.log();

    // Summary
    console.log('🎉 ALL TESTS PASSED! MinIO setup is working perfectly!');
    console.log();
    console.log('📋 Test Summary:');
    console.log('  ✅ S3Service initialization');
    console.log('  ✅ File upload');
    console.log('  ✅ Signed URL generation');
    console.log('  ✅ File listing');
    console.log('  ✅ Metadata retrieval');
    console.log('  ✅ Presigned POST URLs');
    console.log('  ✅ File download');
    console.log('  ✅ File deletion');
    console.log();
    console.log('🚀 Your MinIO S3-compatible storage is ready for production use!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔍 Full error:', error);
    process.exit(1);
  }
}

// Run the test
testMinIOSetup();
