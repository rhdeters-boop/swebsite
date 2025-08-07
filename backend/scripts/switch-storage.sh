#!/bin/bash

# Storage Provider Switch Script
# This script helps switch between MinIO and Azure Blob Storage

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$BACKEND_DIR/.env"

show_usage() {
    echo "Usage: $0 [minio|azure|status]"
    echo ""
    echo "Commands:"
    echo "  minio   - Switch to MinIO/S3 storage (development)"
    echo "  azure   - Switch to Azure Blob Storage (production)"
    echo "  status  - Show current storage configuration"
    echo ""
}

show_status() {
    echo "📊 Current Storage Configuration:"
    echo ""
    
    if [ -f "$ENV_FILE" ]; then
        STORAGE_PROVIDER=$(grep "^STORAGE_PROVIDER=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' || echo "minio")
        echo "Provider: $STORAGE_PROVIDER"
        
        case $STORAGE_PROVIDER in
            "azure")
                echo "Azure Configuration:"
                grep "^AZURE_" "$ENV_FILE" | sed 's/^/  /'
                ;;
            "minio"|*)
                echo "MinIO Configuration:"
                grep "^S3_\|^AWS_" "$ENV_FILE" | sed 's/^/  /'
                ;;
        esac
    else
        echo "❌ .env file not found at $ENV_FILE"
        echo "Please create one based on .env.example"
    fi
}

switch_to_minio() {
    echo "🔄 Switching to MinIO storage..."
    
    if [ -f "$ENV_FILE" ]; then
        # Update STORAGE_PROVIDER
        if grep -q "^STORAGE_PROVIDER=" "$ENV_FILE"; then
            sed -i.bak 's/^STORAGE_PROVIDER=.*/STORAGE_PROVIDER=minio/' "$ENV_FILE"
        else
            echo "STORAGE_PROVIDER=minio" >> "$ENV_FILE"
        fi
        echo "✅ Updated STORAGE_PROVIDER to minio"
    else
        echo "❌ .env file not found. Please create one based on .env.example"
        exit 1
    fi
    
    echo "📋 Make sure MinIO is running with Docker Compose:"
    echo "   docker-compose -f docker-compose.dev.yml up -d minio"
    echo ""
    echo "🧪 Test the configuration:"
    echo "   npm run test:storage"
}

switch_to_azure() {
    echo "🔄 Switching to Azure Blob Storage..."
    
    if [ -f "$ENV_FILE" ]; then
        # Update STORAGE_PROVIDER
        if grep -q "^STORAGE_PROVIDER=" "$ENV_FILE"; then
            sed -i.bak 's/^STORAGE_PROVIDER=.*/STORAGE_PROVIDER=azure/' "$ENV_FILE"
        else
            echo "STORAGE_PROVIDER=azure" >> "$ENV_FILE"
        fi
        echo "✅ Updated STORAGE_PROVIDER to azure"
        
        # Check if Azure credentials exist
        if ! grep -q "^AZURE_STORAGE_ACCOUNT_NAME=" "$ENV_FILE" || ! grep -q "^AZURE_STORAGE_ACCOUNT_KEY=" "$ENV_FILE"; then
            echo "⚠️  Azure credentials not found in .env file"
            echo "Please add the following variables to $ENV_FILE:"
            echo ""
            echo "AZURE_STORAGE_ACCOUNT_NAME=your_storage_account_name"
            echo "AZURE_STORAGE_ACCOUNT_KEY=your_storage_account_key"
            echo "AZURE_CONTAINER_NAME=void-media"
            echo ""
            echo "📚 See docs/AZURE_SETUP.md for detailed setup instructions"
        fi
    else
        echo "❌ .env file not found. Please create one based on .env.example"
        exit 1
    fi
    
    echo "📋 Next steps:"
    echo "1. Ensure Azure credentials are configured in .env"
    echo "2. Run migration: npm run migrate:azure"
    echo "3. Test configuration: npm run test:storage"
}

# Main script logic
case "${1:-}" in
    "minio")
        switch_to_minio
        ;;
    "azure")
        switch_to_azure
        ;;
    "status")
        show_status
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
