import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Edit, Save, X, Camera } from 'lucide-react';
import axios from 'axios';
import BackButton from '../components/BackButton';
import FormInput from '../components/form/FormInput';

interface ProfileFormData {
  displayName: string;
  username: string;
  bio: string;
  profilePicture?: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState<ProfileFormData>({
    displayName: '',
    username: '',
    bio: '',
    profilePicture: '',
  });

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: (user as any).displayName || `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim(),
        username: (user as any).username || '',
        bio: (user as any).bio || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

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
      displayName: (user as any)?.displayName || `${(user as any)?.firstName || ''} ${(user as any)?.lastName || ''}`.trim(),
      username: (user as any)?.username || '',
      bio: (user as any)?.bio || '',
      profilePicture: user?.profilePicture || '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-void-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-void-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <BackButton />
      
      <div className="min-h-screen bg-void-dark-950 py-2 sm:py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-void-dark-900 rounded-2xl shadow-2xl border border-void-500/20 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-lust-violet/20 to-seductive/20 px-6 py-8 border-b border-void-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-void-dark-900 rounded-full flex items-center justify-center border-2 border-void-500/30">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {(user as any).displayName || `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || 'User'}
                    </h1>
                    <p className="text-void-accent-light">@{(user as any).username || 'username'}</p>
                    {(user as any).bio && (
                      <p className="text-gray-300 mt-2 max-w-md">{(user as any).bio}</p>
                    )}
                  </div>
                </div>
                
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-void-accent hover:bg-void-accent-light text-white font-medium rounded-lg transition-colors duration-200"
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
                <div className="mb-6 bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 bg-green-900/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {!isEditing ? (
                /* Profile Display View */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Display Name
                      </label>
                      <div className="w-full px-4 py-3 bg-void-dark-900/50 border border-void-500/30 rounded-lg text-gray-200">
                        {(user as any).displayName || `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || 'Not set'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                      </label>
                      <div className="w-full px-4 py-3 bg-void-dark-900/50 border border-void-500/30 rounded-lg text-gray-200">
                        @{(user as any).username || 'Not set'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <div className="w-full px-4 py-3 bg-void-dark-900/50 border border-void-500/30 rounded-lg text-gray-200 min-h-[100px]">
                        {(user as any).bio || 'No bio added yet'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Member Since
                      </label>
                      <div className="w-full px-4 py-3 bg-void-dark-900/50 border border-void-500/30 rounded-lg text-gray-200">
                        {new Date((user as any).createdAt || Date.now()).toLocaleDateString('en-US', {
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
                <form onSubmit={handleProfileSubmit} className="space-y-6">
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
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                      Bio <span className="text-gray-500">(optional)</span>
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
                    <p className="text-xs text-gray-500 mt-1">
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

                  <div className="flex justify-end space-x-4 pt-4 border-t border-void-500/30">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 px-6 py-3 border border-void-500/30 text-gray-300 font-medium rounded-lg hover:bg-void-dark-900/50 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center space-x-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
