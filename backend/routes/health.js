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

export default router;
