import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, ArrowLeft, Search, User } from 'lucide-react';
import Cropper from 'react-easy-crop';
import FormInput from '../form/FormInput';
import { useProfileImageUpload } from '../../hooks/useProfileImageUpload';

interface ProfileFormData {
  displayName: string;
  username: string;
  bio: string;
  profilePicture?: string;
  bannerImage?: string;
  location?: string;
  website?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  profileData: ProfileFormData;
  onProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  bannerImageUrl: string;
  profileImageUrl: string;
  onBannerImageChange: (url: string) => void;
  onProfileImageChange: (url: string) => void;
  originalUsername?: string; // For username change validation
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  isSaving,
  onClose,
  onSave,
  profileData,
  onProfileChange,
  bannerImageUrl,
  profileImageUrl,
  onBannerImageChange,
  onProfileImageChange,
  originalUsername,
}) => {
  const [isCropping, setIsCropping] = useState(false);
  const [cropType, setCropType] = useState<'profile' | 'banner' | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showUsernameConfirmation, setShowUsernameConfirmation] = useState(false);
  const { uploadProfileImage, isUploading, isSuccess, data, reset: resetUpload, error: uploadError } = useProfileImageUpload();

  // Check if username is being changed
  const isUsernameChanged = originalUsername && profileData.username !== originalUsername;

  // Handle save with username change confirmation
  const handleSave = () => {
    if (isUsernameChanged && !showUsernameConfirmation) {
      setShowUsernameConfirmation(true);
      return;
    }
    setShowUsernameConfirmation(false);
    onSave();
  };

  // Handle confirmation dialog
  const handleConfirmUsernameChange = () => {
    setShowUsernameConfirmation(false);
    onSave();
  };

  const handleCancelUsernameChange = () => {
    setShowUsernameConfirmation(false);
  };

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }
    setCropType(type);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsCropping(true);
    event.target.value = '';
  };

  const applyCroppedImage = async () => {
    if (!selectedFile || !previewUrl || !croppedAreaPixels || !cropType) return;
    const blob = await getCroppedBlob(previewUrl, croppedAreaPixels, cropType, selectedFile.type || 'image/jpeg');
    const croppedFile = new File(
      [blob],
      selectedFile.name.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '') + '-cropped.' + (selectedFile.type.includes('png') ? 'png' : 'jpg'),
      { type: blob.type }
    );
    uploadProfileImage({ file: croppedFile, type: cropType });
  };

  useEffect(() => {
    if (isSuccess && data) {
      if (cropType === 'banner') {
        onBannerImageChange(data);
      } else if (cropType === 'profile') {
        onProfileImageChange(data);
      }
      // Reset crop state
      setIsCropping(false);
      setSelectedFile(null);
      setPreviewUrl('');
      resetUpload();
    }
  }, [isSuccess, data]);

  return (
    <div className="fixed inset-0 bg-background-overlay/70 z-[60] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-background-secondary rounded-lg border border-border-muted w-full sm:w-[90vw] md:w-[70vw] lg:w-[50vw] max-w-3xl h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-muted">
          {isCropping ? (
            <button onClick={() => setIsCropping(false)} className="p-2 hover:bg-background-tertiary rounded flex items-center">
              <ArrowLeft className="h-5 w-5 text-text-muted" />
            </button>
          ) : (
            <button onClick={onClose} className="p-2 hover:bg-background-tertiary rounded">
              <X className="h-5 w-5 text-text-muted" />
            </button>
          )}
          <h3 className="text-base font-semibold text-text-primary">{isCropping ? 'Edit media' : 'Edit profile'}</h3>
          {isCropping ? (
            <button onClick={applyCroppedImage} disabled={isUploading} className="px-4 py-1.5 rounded-full bg-void-accent text-white text-sm font-semibold disabled:opacity-50 min-w-[90px] text-center">
              {isUploading ? 'Uploading…' : 'Apply'}
            </button>
          ) : (
            <button onClick={handleSave} disabled={isSaving} className="px-4 py-1.5 rounded-full bg-void-accent text-white text-sm font-semibold disabled:opacity-50 min-w-[90px] text-center">
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-0 flex-1 overflow-auto min-h-0">
          {isCropping ? (
            <div className="px-4 pt-4 pb-2 h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <div className="relative overflow-hidden rounded-lg bg-black h-full w-full">
                  <Cropper
                    image={previewUrl}
                    crop={crop}
                    zoom={zoom}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, area) => setCroppedAreaPixels(area)}
                    aspect={cropType === 'banner' ? 3 / 1 : 1}
                    cropShape={cropType === 'profile' ? 'round' : 'rect'}
                    showGrid={false}
                    restrictPosition={true}
                    objectFit="contain"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 px-2">
                <Search className="h-4 w-4 text-text-secondary" />
                <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full" />
              </div>
              {uploadError && <p className="text-xs text-error mt-2">{uploadError}</p>}
            </div>
          ) : (
            <>
              {/* Banner and avatar editors */}
              <div className="relative w-full bg-background-tertiary">
                <div
                  className="w-full aspect-[3/1] bg-center bg-cover"
                  style={{ backgroundImage: `url('${bannerImageUrl}')` }}
                  onClick={() => { setCropType('banner'); bannerFileInputRef.current?.click(); }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="p-2 rounded-full bg-black/50 hover:bg-black/60" onClick={(e) => { e.stopPropagation(); setCropType('banner'); bannerFileInputRef.current?.click(); }}>
                      <Camera className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
                {/* Overlapping avatar */}
                <div className="absolute left-4 -bottom-10 md:-bottom-12">
                  <div className="relative group">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-black bg-background-secondary">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-void-accent m-auto mt-6 md:mt-8" />
                      )}
                    </div>
                    <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50" onClick={(e) => { e.stopPropagation(); setCropType('profile'); profileFileInputRef.current?.click(); }}>
                      <Camera className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-16 sm:pt-20 md:pt-24">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                  {/* Basic Information Section */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormInput id="displayName" name="displayName" label="Display Name" value={profileData.displayName} onChange={onProfileChange} placeholder="Your display name" required />
                      <div>
                        <FormInput id="username" name="username" label="Username" value={profileData.username} onChange={onProfileChange} placeholder="Your unique username" required />
                        {isUsernameChanged && (
                          <p className="text-warning text-xs mt-1">
                            ⚠️ Username can only be changed once per month. This will update your profile URL.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="bio" className="form-label mb-1">Bio <span className="text-text-muted text-sm">(optional)</span></label>
                      <textarea id="bio" name="bio" value={profileData.bio} onChange={onProfileChange} placeholder="Tell people about yourself..." rows={2} className="form-textarea mt-0 h-16" maxLength={500} />
                      <div className="flex justify-end items-center mt-1"><span className="text-xs text-text-muted">{profileData.bio.length}/500</span></div>
                    </div>
                  </div>

                  {/* Public Details */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormInput id="location" name="location" label="Location" value={profileData.location || ''} onChange={onProfileChange} placeholder="e.g., Seattle, WA" />
                      <FormInput id="website" name="website" label="Website" value={profileData.website || ''} onChange={onProfileChange} placeholder="https://your-site.com" type="url" />
                    </div>
                  </div>

                  <p className="text-xs text-text-muted">Click your banner or avatar on your profile to update images.</p>
                </form>
              </div>

              {/* Hidden file inputs for inline cropping */}
              <input ref={bannerFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'banner')} />
              <input ref={profileFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'profile')} />
            </>
          )}
        </div>
      </div>

      {/* Username Change Confirmation Dialog */}
      {showUsernameConfirmation && (
        <div className="fixed inset-0 bg-background-overlay/90 z-[70] flex items-center justify-center p-4">
          <div className="bg-background-secondary rounded-xl border border-border-muted max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              Confirm Username Change
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              You're about to change your username from <span className="font-medium text-text-primary">@{originalUsername}</span> to <span className="font-medium text-text-primary">@{profileData.username}</span>.
            </p>
            <div className="space-y-2 text-sm text-text-muted mb-6">
              <p>• Usernames can only be changed once per month</p>
              <p>• Your profile URL will change to /user/{profileData.username}</p>
              <p>• Old links to your profile may not work</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelUsernameChange}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUsernameChange}
                className="px-4 py-2 bg-void-accent hover:bg-void-accent/90 text-white rounded-lg font-medium transition-colors"
              >
                Change Username
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfileModal;

// ===== Helper to crop image to a blob of required aspect sizes =====
async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  type: 'profile' | 'banner',
  mimeType: string
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  
  // Set target dimensions based on type
  const targetSize = type === 'profile' ? 512 : 1500;
  const targetWidth = targetSize;
  const targetHeight = type === 'profile' ? targetSize : Math.round(targetSize / 3);
  
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );
  
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), mimeType.includes('png') ? 'image/png' : 'image/jpeg', 0.92)
  );
  return blob;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}


