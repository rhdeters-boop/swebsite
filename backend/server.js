import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import creatorRoutes from './routes/creators.js';
import subscriptionRoutes from './routes/subscriptions.js';
import mediaRoutes from './routes/media.js';
import paymentRoutes from './routes/payments.js';
import healthRoutes from './routes/health.js';
import analyticsRoutes from './routes/analytics.js';
import likesRoutes from './routes/likes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

// Import database connection
import { connectDB } from './config/database.js';

// Import services
import S3Service from './services/S3Service.js';
import LogRotator from './utils/LogRotator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Create logs directory if it doesn't exist
const logsDir = join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for access logs
const accessLogPath = join(logsDir, 'access.log');
const accessLogStream = fs.createWriteStream(accessLogPath, { flags: 'a' });

// Initialize log rotator
const logRotator = new LogRotator(accessLogPath);

// Check for log rotation every hour
setInterval(() => {
  logRotator.rotateIfNeeded();
}, 60 * 60 * 1000);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// Configure Morgan logging based on environment
if (process.env.NODE_ENV === 'production') {
  // In production, log to file only
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  // In development, log errors to console but access logs to file
  app.use(morgan('combined', { 
    stream: accessLogStream,
    skip: (req, res) => res.statusCode < 400 // Only log errors to file in dev
  }));
  // Optional: Keep a minimal console log for development (only errors)
  app.use(morgan('dev', {
    skip: (req, res) => res.statusCode < 400
  }));
}

app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/health', healthRoutes); // Health checks (public)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Changed: Remove auth middleware to allow public routes
app.use('/api/subscriptions', authenticateToken, subscriptionRoutes);
app.use('/api/media', authenticateToken, mediaRoutes);
app.use('/api/analytics', analyticsRoutes); // Mixed public and protected routes
app.use('/api/payments', paymentRoutes); // Some payment routes need to be public for webhooks
app.use('/api/creators', creatorRoutes); // Mixed public and protected routes
app.use('/api/likes', likesRoutes); // Like/dislike functionality

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  
  // Initialize S3 service with retry logic for development
  try {
    await S3Service.initWithRetry();
    console.log(`📦 S3 Service ready with bucket: ${process.env.S3_BUCKET_NAME || 'void-media'}`);
  } catch (error) {
    console.log('⚠️  S3 service will be available when MinIO starts');
  }
});

export default app;
