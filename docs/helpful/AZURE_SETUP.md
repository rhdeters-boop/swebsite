# Azure Blob Storage Setup Guide

This guide will help you set up Azure Blob Storage for media file storage while keeping user data in PostgreSQL.

## Architecture Overview

- **PostgreSQL**: Stores all user data, subscriptions, payment information, and media metadata
- **Azure Blob Storage**: Stores actual media files (images and videos) with secure access controls
- **Development**: Uses MinIO (S3-compatible) for local development

## Azure Setup Steps

### 1. Create Azure Storage Account

1. Log in to the [Azure Portal](https://portal.azure.com/)
2. Navigate to "Storage accounts"
3. Click "Create"
4. Configure the storage account:
   - **Subscription**: Choose your Azure subscription
   - **Resource Group**: Create or select existing
   - **Storage account name**: Choose a unique name (e.g., `voidmedia[random]`)
   - **Region**: Choose closest to your users
   - **Performance**: Standard (unless you need Premium)
   - **Redundancy**: LRS (Locally-redundant storage) for cost efficiency, or GRS for higher availability

### 2. Create Blob Container

1. Go to your storage account
2. Navigate to "Containers" in the left sidebar
3. Click "Container"
4. Create a new container:
   - **Name**: `void-media` (or your preferred name)
   - **Public access level**: Private (we'll use SAS tokens for access)

### 3. Get Access Keys

1. In your storage account, go to "Access keys"
2. Copy the **Storage account name** and one of the **Key** values
3. These will be your `AZURE_STORAGE_ACCOUNT_NAME` and `AZURE_STORAGE_ACCOUNT_KEY`

### 4. Environment Configuration

Update your backend `.env` file with Azure credentials:

```bash
# Storage Configuration
STORAGE_PROVIDER=azure

# Azure Blob Storage Configuration
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_storage_account_key_here
AZURE_CONTAINER_NAME=void-media
```

### 5. Run Migration

Run the migration script to prepare your database:

```bash
cd backend
node scripts/migrateToAzureStorage.js
```

## Security Features

### Access Control
- All media files are stored privately
- Access is controlled through SAS (Shared Access Signature) tokens
- URLs expire automatically (default: 1 hour)
- Different permissions for upload vs. download

### Tier-based Access
- Files are organized by subscription tier (`picture`, `solo_video`, `collab_video`)
- Access control is enforced at the application level
- Metadata includes tier information for additional security

## Development vs Production

### Development (MinIO)
```bash
STORAGE_PROVIDER=minio
S3_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
```

### Production (Azure)
```bash
STORAGE_PROVIDER=azure
AZURE_STORAGE_ACCOUNT_NAME=your_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_key
AZURE_CONTAINER_NAME=void-media
```

## File Organization

Files are organized in Azure Blob Storage as:
```
media/
├── {creatorId}/
│   ├── picture/
│   │   └── {uuid}.jpg
│   ├── solo_video/
│   │   └── {uuid}.mp4
│   └── collab_video/
│       └── {uuid}.mp4
```

## Monitoring and Costs

### Cost Optimization
- Use Standard tier for cost efficiency
- Enable lifecycle management to archive old files
- Monitor usage through Azure Cost Management

### Monitoring
- Enable diagnostic logging
- Monitor blob access patterns
- Set up alerts for unusual access patterns

## Backup Strategy

1. **Database**: PostgreSQL backups contain all metadata
2. **Media Files**: Azure provides built-in redundancy
3. **Cross-region**: Consider GRS (Geo-redundant storage) for critical data

## API Changes

The StorageService automatically handles the differences between Azure and MinIO:
- Same API methods for both providers
- Automatic provider detection
- Graceful fallbacks

## Migration from MinIO to Azure

1. Set up Azure Blob Storage
2. Update environment variables
3. Run migration script
4. Test file uploads/downloads
5. Optionally migrate existing files using Azure Storage Explorer

## Troubleshooting

### Common Issues
1. **403 Forbidden**: Check access keys and container permissions
2. **Container not found**: Ensure container exists and name matches
3. **CORS errors**: Configure CORS rules in Azure if needed

### Debugging
Enable debug logging by setting `NODE_ENV=development` to see detailed storage operations.

## Future Enhancements

- **CDN Integration**: Add Azure CDN for global content delivery
- **Image Processing**: Integrate Azure Media Services for video processing
- **Analytics**: Use Azure Application Insights for monitoring
- **Auto-scaling**: Implement based on storage usage patterns
