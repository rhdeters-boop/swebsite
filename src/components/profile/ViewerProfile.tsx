import React, { useState, useEffect } from 'react';
import { User, Edit, Save, X, Camera } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../form/FormInput';
import ProfileImageUpload from './ProfileImageUpload';

interface ProfileFormData {
  displayName: string;
  username: string;
  bio: string;
  profilePicture?: string;
  bannerImage?: string;
}

interface ViewerProfileProps {
  username: string; // Changed from user object to username string
}

const ViewerProfile: React.FC<ViewerProfileProps> = ({ username }) => {
  const { user: currentUser, updateUser } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [showBannerUpload, setShowBannerUpload] = useState(false);

  // Determine if current user can edit this profile
  const canEdit = currentUser && currentUser.username === username;

  const [profileData, setProfileData] = useState<ProfileFormData>({
    displayName: '',
    username: '',
    bio: '',
    profilePicture: '',
    bannerImage: '',
  });

  // Fetch user profile by username
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/users/username/${username}`);
        const userData = response.data.user; // Extract user from the response structure
        setProfileUser(userData);
        
        // Initialize form data
        setProfileData({
          displayName: userData?.displayName || `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
          username: userData?.username || '',
          bio: userData?.bio || '',
          profilePicture: userData?.profilePicture || '',
          bannerImage: userData?.bannerImage || '',
        });
      } catch (err: any) {
        setError('Failed to load profile. User may not exist.');
        console.error('Failed to fetch user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Split name into first and last name for the API
      const nameParts = profileData.displayName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const requestData = {
        firstName,
        lastName,
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        // Only include URLs if they're not empty
        ...(profileData.profilePicture && { profilePicture: profileData.profilePicture }),
        ...(profileData.bannerImage && { bannerImage: profileData.bannerImage }),
      };
      
      console.log('Sending profile update request:', requestData);
      
      const response = await axios.put('/auth/profile', requestData);

      // Update the user context with new data
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false); // Exit edit mode after successful update
    } catch (err: any) {
      console.error('Profile update error:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original user data
    setProfileData({
      displayName: profileUser?.displayName || `${profileUser?.firstName || ''} ${profileUser?.lastName || ''}`.trim(),
      username: profileUser?.username || '',
      bio: profileUser?.bio || '',
      profilePicture: profileUser?.profilePicture || '',
      bannerImage: profileUser?.bannerImage || '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleBannerImageSave = (imageUrl: string) => {
    setProfileData(prev => ({ ...prev, bannerImage: imageUrl }));
    setSuccess('Banner image uploaded successfully!');
  };

  const handleProfilePictureSave = (imageUrl: string) => {
    setProfileData(prev => ({ ...prev, profilePicture: imageUrl }));
    setSuccess('Profile picture uploaded successfully!');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-void-accent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state (user not found)
  if (error && !profileUser) {
    return (
      <div className="w-full min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-text-muted mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Profile Not Found</h1>
          <p className="text-text-secondary">The user @{username} could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background-primary">
      {/* Profile Banner */}
      <div className="relative w-full h-48 sm:h-56 lg:h-64 bg-gradient-to-r from-void-accent/20 to-seductive/20 overflow-hidden">
        {/* Banner Background Image Container */}
        <div className={`absolute inset-0 bg-center bg-cover bg-no-repeat ${isEditing && canEdit ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
             style={{
               backgroundImage: `url('${isEditing ? profileData.bannerImage || '/background2.jpg' : profileUser?.bannerImage || '/background2.jpg'}')`
             }}
             onClick={isEditing && canEdit ? () => setShowBannerUpload(true) : undefined}>
        </div>
        
        {/* Banner edit overlay */}
        {isEditing && canEdit && (
          <div className="absolute inset-0 bg-background-overlay/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
               onClick={() => setShowBannerUpload(true)}>
            <div className="text-center text-white">
              <Camera className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Click to change banner</p>
            </div>
          </div>
        )}
        
        {/* Top gradient overlay for navbar blending */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background-primary/80 via-background-primary/40 to-transparent pointer-events-none"></div>
        
        {/* Bottom gradient overlay for better text contrast */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background-primary/60 via-background-primary/20 to-transparent pointer-events-none"></div>
        
        {/* Profile Picture - Bottom Left */}
        <div className="absolute bottom-4 left-8">
          <div className="relative">
            <div className="w-32 h-32 bg-background-tertiary rounded-full flex items-center justify-center border-4 border-background-primary shadow-2xl">
              {(isEditing ? profileData.profilePicture : profileUser?.profilePicture) ? (
                <img
                  src={isEditing ? profileData.profilePicture : profileUser.profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-void-accent" />
              )}
            </div>
            {isEditing && canEdit && (
              <div className="absolute inset-0 bg-background-overlay/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-background-overlay/90 transition-all duration-200"
                   onClick={() => setShowProfileUpload(true)}>
                <Camera className="h-6 w-6 text-text-on-dark" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info Section - Hide when editing */}
      {!isEditing && (
        <div className="px-4 sm:px-8 py-8 border-b border-border-secondary">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              {/* Profile Details - Positioned to account for profile picture */}
              <div className="w-full lg:pl-40">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-heading text-3xl sm:text-4xl mb-2 leading-tight">
                      {profileUser?.displayName || `${profileUser?.firstName || ''} ${profileUser?.lastName || ''}`.trim() || 'User'}
                    </h1>
                    <p className="text-void-accent text-lg font-medium">@{profileUser?.username || 'username'}</p>
                  </div>
                  
                  {profileUser?.bio && (
                    <div className="max-w-2xl">
                      <p className="text-body text-base leading-relaxed">{profileUser.bio}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-caption">
                    <span className="flex items-center gap-1">
                      📅 Joined {new Date(profileUser?.createdAt || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Button - Only show if user can edit */}
              {canEdit && (
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 sm:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Status Messages */}
          {error && (
            <div className="alert-error mb-8">
              {error}
            </div>
          )}
          {success && (
            <div className="alert-success mb-8">
              {success}
            </div>
          )}

          {!isEditing ? (
            /* Profile Display View */
            <div className="space-y-8">
              {/* Profile content goes here - cards removed */}
            </div>
          ) : (
            /* Profile Edit Form */
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-void-accent/20 rounded-lg flex items-center justify-center">
                  <Edit className="h-6 w-6 text-void-accent" />
                </div>
                <h2 className="text-subheading text-2xl">Edit Profile</h2>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <div className="border-b border-border-muted pb-4">
                    <h3 className="text-subheading text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-void-accent" />
                      Basic Information
                    </h3>
                    <p className="text-caption mt-1">Update your display name and username</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      id="displayName"
                      name="displayName"
                      label="Display Name"
                      value={profileData.displayName}
                      onChange={handleProfileChange}
                      placeholder="Your display name"
                      required
                    />
                    
                    <FormInput
                      id="username"
                      name="username"
                      label="Username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      placeholder="Your unique username"
                      required
                    />
                  </div>
                </div>

                {/* About Section */}
                <div className="space-y-6">
                  <div className="border-b border-border-muted pb-4">
                    <h3 className="text-subheading text-lg flex items-center gap-2">
                      <Edit className="h-5 w-5 text-seductive" />
                      About You
                    </h3>
                    <p className="text-caption mt-1">Tell others about yourself</p>
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="form-label">
                      Bio <span className="text-text-muted text-sm">(optional)</span>
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell people about yourself, your interests, or what you do..."
                      rows={4}
                      className="form-textarea mt-2"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="form-help">
                        Share a bit about yourself to help others get to know you
                      </p>
                      <span className="text-xs text-text-muted">
                        {profileData.bio.length}/500
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Images Section */}
                <div className="space-y-6">
                  <div className="border-b border-border-muted pb-4">
                    <h3 className="text-subheading text-lg flex items-center gap-2">
                      <Camera className="h-5 w-5 text-void-accent" />
                      Profile Images
                    </h3>
                    <p className="text-caption mt-1">Add images to personalize your profile</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      id="profilePicture"
                      name="profilePicture"
                      label="Profile Picture URL"
                      value={profileData.profilePicture || ''}
                      onChange={handleProfileChange}
                      placeholder="https://example.com/your-photo.jpg"
                      type="url"
                    />
                    
                    <FormInput
                      id="bannerImage"
                      name="bannerImage"
                      label="Banner Image URL"
                      value={profileData.bannerImage || ''}
                      onChange={handleProfileChange}
                      placeholder="https://example.com/your-banner.jpg"
                      type="url"
                    />
                  </div>
                  
                  <p className="form-help">
                    Enter URLs to images you'd like to use. Make sure they're public URLs that others can access. You can also click on the banner or profile picture above to change them quickly.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-border-muted">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn-outline flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel Changes</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'Saving Profile...' : 'Save Profile'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* S3 Image Upload Modals */}
      <ProfileImageUpload
        isOpen={showBannerUpload}
        onClose={() => setShowBannerUpload(false)}
        onImageUploaded={(url: string) => {
          handleBannerImageSave(url);
          setShowBannerUpload(false);
        }}
        title="Change Banner Image"
        currentImage={profileData.bannerImage}
        type="banner"
      />

      <ProfileImageUpload
        isOpen={showProfileUpload}
        onClose={() => setShowProfileUpload(false)}
        onImageUploaded={(url: string) => {
          handleProfilePictureSave(url);
          setShowProfileUpload(false);
        }}
        title="Change Profile Picture"
        currentImage={profileData.profilePicture}
        type="profile"
      />
    </div>
  );
};

export default ViewerProfile;
