import React, { useState } from 'react';
import { User, Edit, Save, X, Camera } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../form/FormInput';

interface ProfileFormData {
  displayName: string;
  username: string;
  bio: string;
  profilePicture?: string;
}

interface ViewerProfileProps {
  user: any;
}

const ViewerProfile: React.FC<ViewerProfileProps> = ({ user }) => {
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState<ProfileFormData>({
    displayName: user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    username: user?.username || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || '',
  });

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
      
      const response = await axios.put('/auth/profile', {
        firstName,
        lastName,
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        profilePicture: profileData.profilePicture,
      });

      // Update the user context with new data
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false); // Exit edit mode after successful update
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original user data
    setProfileData({
      displayName: user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      username: user?.username || '',
      bio: user?.bio || '',
      profilePicture: user?.profilePicture || '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const onSubmit = (e: React.FormEvent) => {
    handleProfileSubmit(e).catch(console.error);
  };

  return (
    <div className="card-elevated overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-lust-violet/20 to-seductive/20 px-6 py-8 border-b border-border-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-background-card rounded-full flex items-center justify-center border-2 border-border-secondary">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-text-muted" />
                )}
              </div>
              {isEditing && (
                <div className="absolute inset-0 bg-background-overlay rounded-full flex items-center justify-center cursor-pointer hover:bg-background-overlay/70 transition-colors">
                  <Camera className="h-6 w-6 text-text-on-dark" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-text-primary text-3xl font-bold">
                {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
              </h1>
              <p className="text-void-accent">@{user.username || 'username'}</p>
              {user.bio && (
                <p className="text-text-secondary mt-2 max-w-md">{user.bio}</p>
              )}
            </div>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="alert-error mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="alert-success mb-6">
            {success}
          </div>
        )}

        {!isEditing ? (
          /* Profile Display View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="form-label">
                  Display Name
                </label>
                <div className="w-full px-4 py-3 bg-background-secondary/50 border border-border-muted rounded-lg text-text-secondary">
                  {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Not set'}
                </div>
              </div>
              
              <div>
                <label className="form-label">
                  Username
                </label>
                <div className="w-full px-4 py-3 bg-background-secondary/50 border border-border-muted rounded-lg text-text-secondary">
                  @{user.username || 'Not set'}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="form-label">
                  Bio
                </label>
                <div className="w-full px-4 py-3 bg-background-secondary/50 border border-border-muted rounded-lg text-text-secondary min-h-24 flex items-start">
                  {user.bio || 'No bio added yet'}
                </div>
              </div>

              <div>
                <label className="form-label">
                  Member Since
                </label>
                <div className="w-full px-4 py-3 bg-background-secondary/50 border border-border-muted rounded-lg text-text-secondary">
                  {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Profile Edit Form */
          <form onSubmit={onSubmit} className="space-y-6">
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

            <div>
              <label htmlFor="bio" className="form-label">
                Bio <span className="text-text-muted">(optional)</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                placeholder="Tell people about yourself..."
                rows={4}
                className="form-input resize-none"
                maxLength={500}
              />
              <p className="form-help">
                {profileData.bio.length}/500 characters
              </p>
            </div>

            <FormInput
              id="profilePicture"
              name="profilePicture"
              label="Profile Picture URL (Optional)"
              value={profileData.profilePicture || ''}
              onChange={handleProfileChange}
              placeholder="https://example.com/your-photo.jpg"
              type="url"
            />

            <div className="flex justify-end space-x-4 pt-4 border-t border-border-secondary">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-outline"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ViewerProfile;
