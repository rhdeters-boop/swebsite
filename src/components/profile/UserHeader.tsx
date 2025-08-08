import React, { useMemo } from 'react';
import { User, Camera, Edit } from 'lucide-react';

interface UserHeaderProps {
  profileUser: {
    displayName?: string;
    username?: string;
    bio?: string;
    profilePicture?: string;
    bannerImage?: string;
    location?: string;
    website?: string;
    isVerified?: boolean;
    firstName?: string;
    lastName?: string;
    followersCount?: number;
    followingCount?: number;
  } | null;
  profileData: {
    profilePicture?: string;
    bannerImage?: string;
  };
  canEdit: boolean;
  isEditing: boolean;
  viewportWidth: number;
  onStartEditing: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  profileUser,
  profileData,
  canEdit,
  isEditing,
  viewportWidth,
  onStartEditing,
}) => {
  const { bannerWidthPx } = useMemo(() => {
    // Fallback for when viewportWidth is 0 or incorrect (mobile simulation)
    let computedWidth = viewportWidth || 375; // Default mobile width
    if (computedWidth >= 1280) {
      computedWidth = computedWidth * 0.7;
    } else if (computedWidth >= 922) {
      computedWidth = computedWidth * 0.8;
    } else if (computedWidth >= 768) {
      computedWidth = computedWidth * 0.9;
    }
    const bw = Math.round(computedWidth);
    return { bannerWidthPx: bw, bannerHeightPx: Math.round(bw / 3) };
  }, [viewportWidth]);

  return (
    <>
      {/* Profile Banner */}
      <div
        className="relative mx-auto bg-void-gradient overflow-hidden rounded-lg border-2 border-void-accent/30 shadow-glow-accent w-full max-w-5xl aspect-[3/1]"
      >
        <div
          className={`absolute inset-0 bg-center bg-cover bg-no-repeat ${isEditing && canEdit ? 'hover:opacity-80 transition-opacity' : ''}`}
          style={{ backgroundImage: `url('${profileData.bannerImage || profileUser?.bannerImage || '/background2.jpg'}')` }}
        />
        {isEditing && canEdit && <div className="absolute inset-0 bg-background-overlay/0" />}
      </div>

      {/* Profile Header Section */}
      <div>
        <div className="mx-auto pl-2 pr-6 w-full max-w-5xl" style={{ width: `${bannerWidthPx}px` }}>
          <div className="flex items-start justify-between gap-3 min-h-[8rem] md:min-h-[0rem]">
            {/* Left: Avatar + User Info */}
            <div className="flex flex-col items-start flex-1">
              {/* Profile Picture overlapping banner */}
              <div className="relative group -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center border-4 border-black bg-background-tertiary shadow-2xl">
                  {(profileData.profilePicture || profileUser?.profilePicture) ? (
                    <img src={profileData.profilePicture || profileUser?.profilePicture || ''} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-16 w-16 text-void-accent" />
                  )}
                </div>
                {canEdit && (
                  <div
                    className={`absolute inset-0 rounded-full flex items-center justify-center bg-black/60 transition-opacity duration-300 ${
                      isEditing ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Edit Profile button positioned with flexbox */}
            {canEdit && !isEditing && (
              <div className="flex items-start pt-4 flex-shrink-0">
                <button onClick={onStartEditing} className="btn-edit">
                  <span className="hidden sm:inline">Edit profile</span>
                  <Edit className="h-4 w-4 sm:hidden" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
};

export default UserHeader;
