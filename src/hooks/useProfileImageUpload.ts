import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface UploadProfileImageParams {
  file: File;
  type: 'profile' | 'banner';
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const useProfileImageUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: UploadProfileImageParams) => {
      // Step 1: Get presigned POST URL for profile upload
      const presignedResponse = await fetch(`${API_URL}/media/profile/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type,
          contentType: file.type,
          maxFileSize: file.size
        })
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.message || 'Failed to get upload URL');
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
      const uploadPromise = new Promise<string>((resolve, reject) => {
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
            // Generate the backend URL for the profile image
            const key = uploadData.fields.key;
            // Extract userId and filename from the key: profiles/userId/type/filename
            const keyParts = key.split('/');
            const userId = keyParts[1];
            const type = keyParts[2];
            const filename = keyParts[3];
            
            const backendUrl = `${API_URL}/media/profile/${userId}/${type}/${filename}`;
            resolve(backendUrl);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('POST', uploadData.url);
        xhr.send(formData);
      });

      return await uploadPromise;
    },
    onSuccess: () => {
      setUploadProgress(null);
    },
    onError: () => {
      setUploadProgress(null);
    }
  });

  return {
    uploadProfileImage: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    error: uploadMutation.error?.message,
    reset: uploadMutation.reset,
    isSuccess: uploadMutation.isSuccess,
    data: uploadMutation.data
  };
};
