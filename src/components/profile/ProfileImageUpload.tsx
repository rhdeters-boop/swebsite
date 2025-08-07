import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useProfileImageUpload } from '../../hooks/useProfileImageUpload';

interface ProfileImageUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUploaded: (imageUrl: string) => void;
  title: string;
  currentImage?: string;
  type: 'profile' | 'banner';
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  isOpen,
  onClose,
  onImageUploaded,
  title,
  currentImage,
  type
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadProfileImage, isUploading, uploadProgress, error, reset, isSuccess, data } = useProfileImageUpload();

  // Handle successful upload
  useEffect(() => {
    if (isSuccess && data) {
      onImageUploaded(data);
      handleClose();
    }
  }, [isSuccess, data, onImageUploaded]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit for profile images)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // Upload to S3 as a profile image
      uploadProfileImage({
        file: selectedFile,
        type: type
      });
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    reset();
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background-overlay/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary rounded-lg border border-border-muted max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-muted">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-background-tertiary rounded transition-colors"
            disabled={isUploading}
          >
            <X className="h-5 w-5 text-text-muted" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Image Preview */}
          {(currentImage || previewUrl) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                {previewUrl ? 'New Image Preview' : 'Current Image'}
              </label>
              <div className={`relative rounded-lg overflow-hidden ${
                type === 'banner' ? 'aspect-[3/1]' : 'aspect-square'
              } bg-background-tertiary`}>
                <img
                  src={previewUrl || currentImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-text-primary">
              Select New Image
            </label>
            
            <div
              className="border-2 border-dashed border-border-muted rounded-lg p-8 text-center hover:border-void-accent transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-void-accent/20 rounded-full">
                    <Camera className="h-8 w-8 text-void-accent" />
                  </div>
                </div>
                
                <div>
                  <p className="text-text-primary font-medium">
                    Drop an image here or click to browse
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    Supports JPG, PNG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-5 w-5 text-void-accent" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Uploading...</span>
                  <span className="text-text-secondary">{uploadProgress.percentage}%</span>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-2">
                  <div 
                    className="bg-void-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border-muted">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
