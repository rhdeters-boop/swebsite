#!/bin/bash

# MinIO Setup Script for Local Development
echo "🚀 Setting up MinIO for local S3-compatible storage..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start MinIO and other services
echo "📦 Starting development services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for MinIO to be ready
echo "⏳ Waiting for MinIO to start..."
sleep 10

# Check if MinIO is accessible
until curl -f http://localhost:9000/minio/health/live 2>/dev/null; do
    echo "⏳ Waiting for MinIO to be ready..."
    sleep 5
done

echo "✅ MinIO is ready!"
echo ""
echo "🎉 Setup complete!"
echo ""
echo "MinIO Console: http://localhost:9001"
echo "Username: minioadmin"
echo "Password: minioadmin123"
echo ""
echo "MinIO API Endpoint: http://localhost:9000"
echo "Bucket Name: void-media"
echo ""
echo "PostgreSQL Database: localhost:5432"
echo "Database Name: swebsite_dev"
echo "Username: postgres"
echo "Password: password"
echo ""
echo "Redis: localhost:6379"
echo ""
echo "To start the development server:"
echo "npm run dev"
echo ""
echo "To stop services:"
echo "npm run stop:services"
