import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, BadgeCheck } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
// Form inputs handled inside EditProfileModal
import EditProfileModal from '../../components/profile/EditProfileModal';
import UserHeader from '../../components/profile/UserHeader';
import SocialLinks from '../../components/profile/SocialLinks';

interface ProfileFormData {
  displayName: string;
  username: string;
  bio: string;
  profilePicture?: string;
  bannerImage?: string;
  location?: string;
  website?: string;
}

// Minimal user shape needed for this component
interface UserProfileData {
  displayName?: string;
  username?: string;
  bio?: string;
  profilePicture?: string;
  bannerImage?: string;
  location?: string;
  website?: string;
  createdAt?: string;
  isVerified?: boolean;
  firstName?: string;
  lastName?: string;
  followersCount?: number;
  followingCount?: number;
}

function mapUserToProfileFormData(user: Partial<UserProfileData> | null | undefined): ProfileFormData {
  return {
    displayName: user?.displayName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    profilePicture: user?.profilePicture || '',
    bannerImage: user?.bannerImage || '',
    location: user?.location || '',
    website: user?.website || '',
  };
}

interface UserProfileProps {
  username: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ username }) => {
  const { user: currentUser, updateUser } = useAuth();
  const { showSuccess, showError } = useAlert();
  const [profileUser, setProfileUser] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = currentUser && currentUser.username === username;

  const [profileData, setProfileData] = useState<ProfileFormData>(mapUserToProfileFormData(null));
  const [initialProfileData, setInitialProfileData] = useState<ProfileFormData | null>(null);

  // Fetch user profile by username
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/users/username/${username}`);
        const userData: UserProfileData = response.data.user;
        setProfileUser(userData);
        const mapped = mapUserToProfileFormData(userData);
        setProfileData(mapped);
        setInitialProfileData(mapped);
      } catch (err: any) {
        showError('Failed to load profile. User may not exist.');
        console.error('Failed to fetch user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) fetchUserProfile();
  }, [username]);

  // Track viewport width for responsive, exact pixel sizing
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate content width matching UserHeader
  const { contentWidthPx } = useMemo(() => {
    let computedWidth = viewportWidth;
    if (computedWidth >= 1280) {
      computedWidth = viewportWidth * 0.7;
    } else if (computedWidth >= 922) {
      computedWidth = viewportWidth * 0.8;
    } else if (computedWidth >= 768) {
      computedWidth = viewportWidth * 0.9;
    }
    const cw = Math.round(computedWidth);
    return { contentWidthPx: cw };
  }, [viewportWidth]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const requestData = {
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        location: profileData.location?.trim() || undefined,
        website: profileData.website?.trim() || undefined,
        ...(profileData.profilePicture && { profilePicture: profileData.profilePicture }),
        ...(profileData.bannerImage && { bannerImage: profileData.bannerImage }),
      };

      const response = await axios.put('/auth/profile', requestData);
      const updatedUser: UserProfileData = response.data.user;

      updateUser(updatedUser);
      setProfileUser(updatedUser);
      const mapped = mapUserToProfileFormData(updatedUser);
      setProfileData(mapped);
      setInitialProfileData(mapped);

      showSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Profile update error:', err.response?.data);
      showError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    const hasUnsaved = initialProfileData && JSON.stringify(initialProfileData) !== JSON.stringify(profileData);
    if (hasUnsaved && !confirm('Discard unsaved changes?')) {
      return;
    }
    setProfileData(mapUserToProfileFormData(profileUser || undefined));
    setIsEditing(false);
  };

  // Warn on page unload if editing with unsaved changes
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsaved = initialProfileData && JSON.stringify(initialProfileData) !== JSON.stringify(profileData);
      if (isEditing && hasUnsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [isEditing, profileData, initialProfileData]);

  const startEditing = () => {
    setIsEditing(true);
    setInitialProfileData({ ...profileData });
  };

  const onSaveClick = () => {
    handleProfileSubmit({ preventDefault: () => {} } as any);
  };

  const handleBannerImageSave = (imageUrl: string) => {
    setProfileData(prev => ({ ...prev, bannerImage: imageUrl }));
    setProfileUser((prev: any) => prev ? { ...prev, bannerImage: imageUrl } : prev);
    if (canEdit && currentUser) {
      updateUser({ ...currentUser, bannerImage: imageUrl });
    }
    showSuccess('Banner image uploaded successfully!');
  };

  const handleProfilePictureSave = (imageUrl: string) => {
    setProfileData(prev => ({ ...prev, profilePicture: imageUrl }));
    setProfileUser((prev: any) => prev ? { ...prev, profilePicture: imageUrl } : prev);
    if (canEdit && currentUser) {
      updateUser({ ...currentUser, profilePicture: imageUrl });
    }
    showSuccess('Profile picture uploaded successfully!');
  };

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

  if (!profileUser && !isLoading) {
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
    <div className="w-full min-h-screen bg-background-primary pt-1">
      <UserHeader
        profileUser={profileUser}
        profileData={profileData}
        canEdit={!!canEdit}
        isEditing={isEditing}
        viewportWidth={viewportWidth}
        onStartEditing={startEditing}
      />

      {/* Main Content */}
      <div className="py-2">
        {/* User Information moved from header - matching UserHeader width */}
        <div className="mx-auto relative border border-void-accent/20 rounded-xl backdrop-blur-sm" style={{ width: `${contentWidthPx}px` }}>
          <div className="space-y-6">
            {/* User Name and Verification */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 pl-4 flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-gradient truncate">
                    {profileUser?.displayName?.trim() || 'User'}
                  </h1>
                  {profileUser?.isVerified && (
                    <BadgeCheck className="h-6 w-6 text-void-accent shrink-0" />
                  )}
                </div>
                {/* Follower/Following Stats moved here */}
                <div className="flex items-center gap-8 p-3 border border-void-accent/30 rounded-lg bg-background-secondary/30">
                  <div className="text-center">
                    <div className="text-s font-bold text-primary">{profileUser?.followingCount || 0}</div>
                    <div className="text-xs font-medium text-secondary">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-s font-bold text-primary">{profileUser?.followersCount || 0}</div>
                    <div className="text-xs font-medium text-secondary">Followers</div>
                  </div>
                </div>
              </div>
              <p className="text-base font-normal text-secondary mb-2 pl-4 -mt-4">@{profileUser?.username || 'username'}</p>
            </div>

            {/* Bio Section with Social Links */}
            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 p-4 border border-void-accent/20 rounded-lg bg-background-secondary/30">
              {profileUser?.bio && (
                <div className="flex-1">
                  <p className="text-base font-normal text-secondary leading-relaxed">{profileUser.bio}</p>
                </div>
              )}
              
              {/* Social Links Section - positioned on the right on desktop, below on mobile */}
              <div className="flex-shrink-0">
                <SocialLinks
                  website={profileUser?.website || "https://example.com"}
                  snapchat="https://snapchat.com/add/test" // Testing: show all icons
                  instagram="https://instagram.com/test"
                  reddit="https://reddit.com/u/test"
                  x="https://x.com/test"
                />
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Hidden file inputs for inline cropping */}
      {/* Hidden file inputs kept to reserve DOM spots; now handled in modal */}
      <input ref={bannerFileInputRef} type="file" accept="image/*" className="hidden" />
      <input ref={profileFileInputRef} type="file" accept="image/*" className="hidden" />

      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfileModal
          isOpen={isEditing}
          isSaving={isLoading}
          onClose={handleCancelEdit}
          onSave={onSaveClick}
          profileData={profileData}
          onProfileChange={handleProfileChange}
          bannerImageUrl={profileData.bannerImage || profileUser?.bannerImage || '/background2.jpg'}
          profileImageUrl={profileData.profilePicture || profileUser?.profilePicture || ''}
          onBannerImageChange={handleBannerImageSave}
          onProfileImageChange={handleProfilePictureSave}
        />
      )}
    </div>
  );
};

export default UserProfile;


