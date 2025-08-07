import React, { useState, useRef } from 'react';
import { Upload, Image, Video, X, Check, AlertCircle } from 'lucide-react';
import { useMediaUpload } from '../../hooks/useMediaUpload';

interface MediaUploadTestProps {
  className?: string;
}

const MediaUploadTest: React.FC<MediaUploadTestProps> = ({ className }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState<'picture' | 'solo_video' | 'collab_video'>('picture');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadMedia, isUploading, uploadProgress, error, reset } = useMediaUpload();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      alert('File size must be less than 100MB');
      return;
    }

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      alert('Please select an image or video file');
      return;
    }

    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    reset(); // Clear any previous errors
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadMedia({
      file: selectedFile,
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      tier
    });
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    reset();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`bg-background-secondary rounded-lg border border-border-muted p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">S3 Media Upload Test</h3>
        {isUploading && (
          <div className="flex items-center gap-2 text-void-accent">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-void-accent"></div>
            <span className="text-sm">Uploading...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-void-accent bg-void-accent/10' 
              : 'border-border-muted hover:border-void-accent-light'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-text-muted" />
            <div>
              <p className="text-lg font-medium text-text-primary mb-1">
                Drop your media files here
              </p>
              <p className="text-sm text-text-secondary">
                Or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-void-accent hover:text-void-accent-light transition-colors"
                >
                  browse to select
                </button>
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Image className="h-3 w-3" />
                Images
              </span>
              <span className="flex items-center gap-1">
                <Video className="h-3 w-3" />
                Videos
              </span>
              <span>Max 100MB</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Preview */}
          <div className="flex items-center justify-between p-4 bg-background-tertiary rounded-lg">
            <div className="flex items-center gap-3">
              {selectedFile.type.startsWith('image/') ? (
                <Image className="h-8 w-8 text-void-accent" />
              ) : (
                <Video className="h-8 w-8 text-void-accent" />
              )}
              <div>
                <p className="font-medium text-text-primary">{selectedFile.name}</p>
                <p className="text-sm text-text-secondary">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="p-1 hover:bg-background-secondary rounded"
              disabled={isUploading}
            >
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Uploading...</span>
                <span className="text-text-secondary">{uploadProgress.percentage}%</span>
              </div>
              <div className="w-full bg-border-muted rounded-full h-2">
                <div 
                  className="bg-void-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                disabled={isUploading}
                className="w-full px-3 py-2 bg-background-primary border border-border-muted rounded-lg text-text-primary"
              >
                <option value="picture">Picture Tier</option>
                <option value="solo_video">Solo Video Tier</option>
                <option value="collab_video">Collab Video Tier</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                placeholder="Enter media title"
                className="w-full px-3 py-2 bg-background-primary border border-border-muted rounded-lg text-text-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                placeholder="Enter media description"
                rows={3}
                className="w-full px-3 py-2 bg-background-primary border border-border-muted rounded-lg text-text-primary"
              />
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={isUploading || !title.trim()}
              className="flex-1 bg-void-accent hover:bg-void-accent-dark disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload to S3
                </>
              )}
            </button>
            <button
              onClick={clearSelection}
              disabled={isUploading}
              className="px-4 py-2 bg-background-tertiary hover:bg-background-muted text-text-primary rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 text-xs text-text-muted">
        <p>🧪 This is a test component for S3 media storage integration</p>
        <p>📦 Files will be uploaded to MinIO/S3 bucket: {import.meta.env.VITE_S3_BUCKET || 'void-media'}</p>
      </div>
    </div>
  );
};

export default MediaUploadTest;
