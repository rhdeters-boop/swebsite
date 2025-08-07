import React, { useState, useRef } from 'react';
import { X, Upload, Link, Camera } from 'lucide-react';
import FormInput from '../form/FormInput';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
  title: string;
  currentImage?: string;
  placeholder?: string;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  currentImage = '',
  placeholder = 'https://example.com/image.jpg'
}) => {
  const [imageUrl, setImageUrl] = useState(currentImage);
  const [selectedTab, setSelectedTab] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (imageUrl.trim()) {
      onSave(imageUrl.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    setImageUrl(currentImage);
    setSelectedTab('url');
    onClose();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Create a temporary URL for preview
      const tempUrl = URL.createObjectURL(file);
      setImageUrl(tempUrl);
      
      // Here you would typically upload to your server/S3
      // For now, we'll just use the temporary URL
      // In production, you'd want to upload the file and get back a permanent URL
      
      // Simulated upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background-overlay/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background-primary border border-border-muted rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-muted">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-void-accent/20 rounded-lg flex items-center justify-center">
              <Camera className="h-5 w-5 text-void-accent" />
            </div>
            <h2 className="text-subheading text-xl">{title}</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tab Selection */}
          <div className="flex rounded-lg bg-background-secondary p-1">
            <button
              onClick={() => setSelectedTab('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'url'
                  ? 'bg-background-primary text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Link className="h-4 w-4" />
              URL
            </button>
            <button
              onClick={() => setSelectedTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedTab === 'upload'
                  ? 'bg-background-primary text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          </div>

          {/* URL Input Tab */}
          {selectedTab === 'url' && (
            <div className="space-y-4">
              <FormInput
                id="imageUrl"
                name="imageUrl"
                label="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={placeholder}
                type="url"
              />
              <p className="form-help">
                Enter a direct link to an image. Make sure it's publicly accessible.
              </p>
            </div>
          )}

          {/* File Upload Tab */}
          {selectedTab === 'upload' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="form-label">Choose Image File</label>
                <div
                  className="border-2 border-dashed border-border-muted rounded-lg p-8 text-center hover:border-void-accent/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-void-accent mx-auto"></div>
                      <p className="text-text-secondary text-sm">Uploading...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-text-muted mx-auto" />
                      <p className="text-text-primary font-medium">Click to choose file</p>
                      <p className="text-text-muted text-sm">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
              <p className="form-help">
                Upload an image from your device. It will be processed and hosted securely.
              </p>
            </div>
          )}

          {/* Preview */}
          {imageUrl && (
            <div className="space-y-2">
              <label className="form-label">Preview</label>
              <div className="aspect-video bg-background-secondary rounded-lg overflow-hidden border border-border-muted">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/background2.jpg'; // Fallback image
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-border-muted">
          <button
            onClick={handleCancel}
            className="btn-outline"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={!imageUrl.trim() || isUploading}
          >
            Save Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
