import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface UploadMediaParams {
  file: File;
  title?: string;
  description?: string;
  tier: 'picture' | 'solo_video' | 'collab_video';
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const useMediaUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, title, description, tier }: UploadMediaParams) => {
      // Step 1: Get presigned POST URL from backend
      const presignedResponse = await fetch(`${API_URL}/media/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tier,
          contentType: file.type,
          maxFileSize: file.size
        })
      });

      if (!presignedResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadData } = await presignedResponse.json();
      
      // Step 2: Upload file directly to S3/MinIO using presigned POST
      const formData = new FormData();
      
      // Add all the required fields from presigned POST
      Object.entries(uploadData.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      
      // Add the file last
      formData.append('file', file);
      
      // Upload with progress tracking
      const uploadPromise = new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            setUploadProgress({
              loaded: event.loaded,
              total: event.total,
              percentage
            });
          }
        };

        xhr.onload = () => {
          if (xhr.status === 204) { // S3 returns 204 for successful uploads
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('POST', uploadData.url);
        xhr.send(formData);
      });

      await uploadPromise;

      // Step 3: Create media record in database
      const mediaResponse = await fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          s3Key: uploadData.fields.key,
          tier,
          title: title || file.name,
          description,
          mimeType: file.type,
          fileSize: file.size,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        })
      });

      if (!mediaResponse.ok) {
        throw new Error('Failed to create media record');
      }

      return await mediaResponse.json();
    },
    onSuccess: () => {
      // Invalidate media queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setUploadProgress(null);
    },
    onError: () => {
      setUploadProgress(null);
    }
  });

  return {
    uploadMedia: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    error: uploadMutation.error?.message,
    reset: uploadMutation.reset
  };
};

// Hook for fetching media gallery
export const useMediaGallery = (tier?: string) => {
  const fetchGallery = async () => {
    const url = tier 
      ? `${API_URL}/media/gallery/${tier}`
      : `${API_URL}/media/gallery`;
      
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch media gallery');
    }

    return response.json();
  };

  return fetchGallery;
};

// Hook for getting signed URL for media access
export const useMediaAccess = () => {
  const getMediaUrl = async (mediaId: string) => {
    const response = await fetch(`${API_URL}/media/${mediaId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get media access');
    }

    const { mediaItem } = await response.json();
    return mediaItem;
  };

  return { getMediaUrl };
};
