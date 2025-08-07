import express from 'express';
import S3Service from '../services/S3Service.js';
import { connectDB } from '../config/database.js';

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  const health = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    services: {
      database: 'unknown',
      s3: 'unknown'
    }
  };

  try {
    // Check database
    await connectDB();
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    // Check S3
    await S3Service.init();
    health.services.s3 = 'healthy';
  } catch (error) {
    health.services.s3 = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// S3 specific health check
router.get('/s3', async (req, res) => {
  try {
    await S3Service.init();
    res.json({
      status: 'healthy',
      bucket: process.env.S3_BUCKET_NAME || 'void-media',
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      suggestion: 'Ensure MinIO is running with: npm run dev:services'
    });
  }
});

// Test S3 storage functionality
router.get('/test-s3', async (req, res) => {
  try {
    console.log('🧪 Testing S3 storage...');
    
    // Initialize S3 service
    await S3Service.initWithRetry(3, 1000);
    
    // Test file upload with a small buffer
    const testBuffer = Buffer.from('This is a test file for S3 storage', 'utf8');
    const result = await S3Service.uploadFile(
      testBuffer,
      'test-file.txt',
      'text/plain',
      'picture',
      'test-creator-' + Date.now()
    );
    
    // Test signed URL generation
    const signedUrl = await S3Service.getSignedUrl(result.key, 300); // 5 minutes
    
    // Test file deletion
    const deleteResult = await S3Service.deleteFile(result.key);
    
    res.json({
      success: true,
      message: 'S3 storage test completed successfully',
      results: {
        upload: {
          key: result.key,
          size: result.size,
          url: result.url
        },
        signedUrl: signedUrl.substring(0, 80) + '...',
        deleteResult
      }
    });
    
  } catch (error) {
    console.error('❌ S3 test failed:', error);
    res.status(500).json({
      success: false,
      message: 'S3 storage test failed',
      error: error.message
    });
  }
});

export default router;
