import React, { useState } from 'react';
import { User, Edit, Save, X, Camera, Star, TrendingUp, DollarSign, Heart } from 'lucide-react';
import axios from 'axios';
import FormInput from '../form/FormInput';

interface CreatorProfileData {
  displayName: string;
  username: string;
  bio: string;
  profilePicture?: string;
  // Creator-specific fields
  creatorDisplayName: string;
  creatorBio: string;
  profileImage?: string;
  coverImage?: string;
  subscriptionPrice: number;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    onlyfans?: string;
  };
  categories: string[];
}

interface CreatorProfileProps {
  user: any;
  creator: any;
}

const CreatorProfile: React.FC<CreatorProfileProps> = ({ user, creator }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState<CreatorProfileData>({
    displayName: user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    username: user?.username || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || '',
    // Creator-specific data
    creatorDisplayName: creator?.displayName || '',
    creatorBio: creator?.bio || '',
    profileImage: creator?.profileImage || '',
    coverImage: creator?.coverImage || '',
    subscriptionPrice: creator?.subscriptionPrice ? creator.subscriptionPrice / 100 : 9.99,
    socialLinks: creator?.socialLinks || {},
    categories: creator?.categories || [],
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'subscriptionPrice') {
      setProfileData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update user profile first
      const nameParts = profileData.displayName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      await axios.put('/auth/profile', {
        firstName,
        lastName,
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        profilePicture: profileData.profilePicture,
      });

      // Update creator profile
      await axios.put('/creators/profile', {
        displayName: profileData.creatorDisplayName,
        bio: profileData.creatorBio,
        profileImage: profileData.profileImage,
        coverImage: profileData.coverImage,
        subscriptionPrice: Math.round(profileData.subscriptionPrice * 100), // Convert to cents
        socialLinks: profileData.socialLinks,
        categories: profileData.categories,
      });

      setSuccess('Creator profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      displayName: user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      username: user?.username || '',
      bio: user?.bio || '',
      profilePicture: user?.profilePicture || '',
      creatorDisplayName: creator?.displayName || '',
      creatorBio: creator?.bio || '',
      profileImage: creator?.profileImage || '',
      coverImage: creator?.coverImage || '',
      subscriptionPrice: creator?.subscriptionPrice ? creator.subscriptionPrice / 100 : 9.99,
      socialLinks: creator?.socialLinks || {},
      categories: creator?.categories || [],
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const onSubmit = (e: React.FormEvent) => {
    handleProfileSubmit(e).catch(console.error);
  };

  return (
    <div className="space-y-6">
      {/* Creator Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-void-accent/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-void-accent" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Followers</p>
              <p className="text-lg font-semibold text-text-primary">{creator?.followerCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-seductive/10 rounded-lg">
              <Star className="h-5 w-5 text-seductive" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Subscribers</p>
              <p className="text-lg font-semibold text-text-primary">{creator?.subscriberCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-lust-violet/10 rounded-lg">
              <Heart className="h-5 w-5 text-lust-violet" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Likes</p>
              <p className="text-lg font-semibold text-text-primary">{creator?.likeCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Monthly Rate</p>
              <p className="text-lg font-semibold text-text-primary">${(creator?.subscriptionPrice / 100 || 9.99).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="card-elevated overflow-hidden">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-lust-violet/20 via-seductive/20 to-void-accent/20 relative">
          {creator?.coverImage && (
            <img
              src={creator.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          {isEditing && (
            <div className="absolute inset-0 bg-background-overlay/50 flex items-center justify-center cursor-pointer hover:bg-background-overlay/70 transition-colors">
              <Camera className="h-8 w-8 text-text-on-dark" />
              <span className="ml-2 text-text-on-dark">Change Cover</span>
            </div>
          )}
        </div>

        {/* Profile Header */}
        <div className="px-6 py-8 border-b border-border-secondary relative">
          <div className="flex items-end justify-between -mt-16">
            <div className="flex items-end space-x-6">
              <div className="relative">
                <div className="w-32 h-32 bg-background-card rounded-full flex items-center justify-center border-4 border-background-primary">
                  {creator?.profileImage || user?.profilePicture ? (
                    <img
                      src={creator?.profileImage || user?.profilePicture}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-text-muted" />
                  )}
                </div>
                {isEditing && (
                  <div className="absolute inset-0 bg-background-overlay rounded-full flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors">
                    <Camera className="h-6 w-6 text-text-on-dark" />
                  </div>
                )}
              </div>
              <div className="mb-4">
                <h1 className="text-text-primary text-3xl font-bold">
                  {creator?.displayName || 'Creator Name'}
                </h1>
                <p className="text-void-accent">@{user?.username || 'username'}</p>
                {creator?.isVerified && (
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-void-accent fill-current" />
                    <span className="ml-1 text-sm text-void-accent">Verified Creator</span>
                  </div>
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

          {creator?.bio && (
            <p className="text-text-secondary mt-4 max-w-2xl">{creator.bio}</p>
          )}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Creator Display Name</label>
                      <div className="w-full px-4 py-3 bg-background-secondary/50 border border-border-muted rounded-lg text-text-secondary">
                        {creator?.displayName || 'Not set'}
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Username</label>
                      <div className="w-full px-4 py-3 bg-background-secondary/50 border border-border-muted rounded-lg text-text-secondary">
                        @{user?.username || 'Not set'}
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Subscription Price</label>
                      <div className="w-full px-4 py-3 bg-background-secondary/50 border border-border-muted rounded-lg text-text-secondary">
                        ${(creator?.subscriptionPrice / 100 || 9.99).toFixed(2)}/month
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links & Categories */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Social Links</h3>
                  <div className="space-y-2">
                    {creator?.socialLinks && Object.keys(creator.socialLinks).length > 0 ? (
                      Object.entries(creator.socialLinks).map(([platform, url]) => {
                        if (!url || typeof url !== 'string' || url.trim() === '') return null;
                        return (
                          <div key={platform} className="flex items-center space-x-2">
                            <span className="capitalize text-text-muted w-16">{platform}:</span>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-void-accent hover:text-seductive transition-colors">
                              {url}
                            </a>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-text-muted">No social links added</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {creator?.categories && creator.categories.length > 0 ? (
                      creator.categories.map((category: string) => (
                        <span key={category} className="px-3 py-1 bg-void-accent/10 text-void-accent rounded-full text-sm">
                          {category}
                        </span>
                      ))
                    ) : (
                      <p className="text-text-muted">No categories selected</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Profile Edit Form */
            <form onSubmit={onSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    id="creatorDisplayName"
                    name="creatorDisplayName"
                    label="Creator Display Name"
                    value={profileData.creatorDisplayName}
                    onChange={handleProfileChange}
                    placeholder="Your creator name"
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

                  <FormInput
                    id="subscriptionPrice"
                    name="subscriptionPrice"
                    label="Monthly Subscription Price ($)"
                    value={profileData.subscriptionPrice.toString()}
                    onChange={handleProfileChange}
                    placeholder="9.99"
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="creatorBio" className="form-label">
                  Creator Bio <span className="text-text-muted">(optional)</span>
                </label>
                <textarea
                  id="creatorBio"
                  name="creatorBio"
                  value={profileData.creatorBio}
                  onChange={handleProfileChange}
                  placeholder="Tell your audience about yourself..."
                  rows={4}
                  className="form-input resize-none"
                  maxLength={1000}
                />
                <p className="form-help">
                  {profileData.creatorBio.length}/1000 characters
                </p>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  id="profileImage"
                  name="profileImage"
                  label="Profile Image URL (Optional)"
                  value={profileData.profileImage || ''}
                  onChange={handleProfileChange}
                  placeholder="https://example.com/profile.jpg"
                  type="url"
                />

                <FormInput
                  id="coverImage"
                  name="coverImage"
                  label="Cover Image URL (Optional)"
                  value={profileData.coverImage || ''}
                  onChange={handleProfileChange}
                  placeholder="https://example.com/cover.jpg"
                  type="url"
                />
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['instagram', 'twitter', 'tiktok', 'onlyfans'].map((platform) => (
                    <div key={platform}>
                      <label className="form-label capitalize">{platform}</label>
                      <input
                        type="url"
                        value={profileData.socialLinks[platform as keyof typeof profileData.socialLinks] || ''}
                        onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                        placeholder={`https://${platform}.com/yourusername`}
                        className="form-input"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
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
    </div>
  );
};

export default CreatorProfile;
