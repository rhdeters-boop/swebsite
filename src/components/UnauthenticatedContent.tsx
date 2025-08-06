import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import MediaItemCard from './MediaItemCard';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description?: string;
  thumbnailUrl: string;
  tier: 'picture' | 'solo_video' | 'collab_video';
  accessLevel: 'free' | 'private';
  createdAt: string;
  hasAccess: boolean;
}

interface UnauthenticatedContentProps {
  freeMedia: MediaItem[];
  stats: {
    freeContent: number;
    privateContent: number;
  };
  creatorName: string;
}

const UnauthenticatedContent: React.FC<UnauthenticatedContentProps> = ({
  freeMedia,
  stats,
  creatorName
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Show free content if available */}
      {stats.freeContent > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Free Content</h3>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            {freeMedia.slice(0, 6).map((item) => (
              <MediaItemCard
                key={item.id}
                item={item}
                viewMode="grid"
              />
            ))}
          </div>
          {freeMedia.length > 6 && (
            <div className="text-center mt-4">
              <p className="text-sm text-text-secondary">
                +{freeMedia.length - 6} more free items
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Call to action for private content */}
      {stats.privateContent > 0 && (
        <div className="text-center py-12 border-t border-border-secondary">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <Lock className="h-16 w-16 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Exclusive Content Available
              </h3>
              <p className="text-text-secondary">
                Join our community to view {creatorName}'s {stats.privateContent} exclusive {stats.privateContent === 1 ? 'item' : 'items'} and connect with other members.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/register')}
                className="btn-primary w-full"
              >
                Create Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary w-full"
              >
                Already have an account? Sign In
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border-secondary">
              <p className="text-sm text-text-tertiary">
                Get access to all {stats.privateContent} exclusive items
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* No content message */}
      {stats.freeContent === 0 && stats.privateContent === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📷</div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No content yet</h3>
          <p className="text-text-secondary">
            This creator hasn't uploaded any content yet.
          </p>
        </div>
      )}
    </>
  );
};

export default UnauthenticatedContent;
