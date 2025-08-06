# MinIO Setup for Local Development

This project uses MinIO as an S3-compatible storage solution for local development.

## Quick Start

1. **Start MinIO and other services:**
   ```bash
   ./scripts/setup-minio.sh
   ```
   
   Or manually:
   ```bash
   npm run dev:services
   ```

2. **Create environment file:**
   ```bash
   cp backend/.env.example backend/.env
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## MinIO Access

- **MinIO Console:** http://localhost:9001
  - Username: `minioadmin`
  - Password: `minioadmin123`

- **MinIO API Endpoint:** http://localhost:9000
- **Bucket Name:** `void-media`

## Environment Variables

The following environment variables are configured for MinIO:

```bash
# MinIO Configuration
S3_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
AWS_REGION=us-east-1
S3_BUCKET_NAME=void-media
```

## File Upload Flow

1. **Direct Upload (Recommended):**
   - Get presigned POST URL: `POST /api/media/upload-url`
   - Upload directly to MinIO from frontend
   - File is stored with automatic tagging and metadata

2. **Server Upload:**
   - Upload through server: `POST /api/media/upload`
   - Server handles the S3 upload

## File Access

- Media files are protected with signed URLs
- URLs expire after 1 hour by default
- Access is controlled by subscription tiers

## Development Commands

```bash
# Start all services (PostgreSQL, MinIO, Redis)
npm run dev:services

# Start frontend and backend
npm run dev

# Start everything together
npm run dev:full

# Stop services
npm run stop:services
```

## Production Setup

For production, replace MinIO with AWS S3:

1. Create an S3 bucket
2. Update environment variables:
   ```bash
   # Remove S3_ENDPOINT for AWS S3
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_region
   S3_BUCKET_NAME=your_bucket_name
   ```

## File Structure

```
media/
├── {creatorId}/
│   ├── picture/
│   │   ├── {uuid}.jpg
│   │   └── {uuid}.png
│   ├── solo_video/
│   │   └── {uuid}.mp4
│   └── collab_video/
│       └── {uuid}.mp4
```

## Security Features

- **Signed URLs:** All media access uses time-limited signed URLs
- **Bucket Policies:** Restrict access to premium content
- **File Tagging:** Automatic tagging for access control
- **Metadata:** Creator ID and tier information stored with each file

## Troubleshooting

### MinIO not starting
```bash
# Check Docker status
docker ps

# Check MinIO logs
docker logs swebsite-minio

# Restart services
docker-compose -f docker-compose.dev.yml restart minio
```

### Connection issues
- Ensure Docker is running
- Check if port 9000 and 9001 are available
- Verify environment variables are set correctly
