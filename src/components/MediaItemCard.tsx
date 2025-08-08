import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play,
  Image as ImageIcon,
  Lock,
  Eye
} from 'lucide-react';

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

interface MediaItemCardProps {
  item: MediaItem;
  viewMode: 'grid' | 'list';
}

const MediaItemCard: React.FC<MediaItemCardProps> = ({ item, viewMode }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (item.accessLevel === 'free' || item.hasAccess) {
      navigate(`/media/${item.id}`);
    } else {
      navigate('/login');
    }
  };

  const getTierBadge = (tier: string) => {
    const badges = {
      picture: { label: 'Picture', color: 'badge-info' },
      solo_video: { label: 'Solo Video', color: 'badge-void' },
      collab_video: { label: 'Collab Video', color: 'badge-accent' },
    };
    return badges[tier as keyof typeof badges] || badges.picture;
  };

  const getAccessBadge = (accessLevel: string, hasAccess: boolean) => {
    if (accessLevel === 'free') {
      return { label: 'Free', color: 'bg-success/10 text-success border border-success/20' };
    }
    if (hasAccess) {
      return { label: 'Subscribed', color: 'bg-void-accent/10 text-void-accent border border-void-accent/20' };
    }
    return { label: 'Premium', color: 'bg-warning/10 text-warning border border-warning/20' };
  };

  const accessBadge = getAccessBadge(item.accessLevel, item.hasAccess);
  const canView = item.accessLevel === 'free' || item.hasAccess;

  if (viewMode === 'list') {
    return (
      <div className="flex bg-background-secondary rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative w-32 h-24 flex-shrink-0">
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {item.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="h-8 w-8 text-text-on-dark drop-shadow-lg" />
            </div>
          )}
          {!canView && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <Lock className="h-6 w-6 text-text-on-dark" />
            </div>
          )}
        </div>
        
        <div className="flex-1 p-4 flex items-center justify-between">
          <div>
            <h4 className="font-medium text-text-primary mb-1">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-text-secondary line-clamp-1">{item.description}</p>
            )}
            <div className="flex items-center space-x-2 mt-2">
              <span className={`${getTierBadge(item.tier).color}`}>
                {getTierBadge(item.tier).label}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${accessBadge.color}`}>
                {accessBadge.label}
              </span>
              <span className="text-xs text-text-tertiary">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleClick}
            className="btn-secondary-sm"
            disabled={!canView}
          >
            {canView ? (
              <>
                <Eye className="h-4 w-4 mr-1" />
                View
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-1" />
                {item.accessLevel === 'private' ? 'Subscribe' : 'Login'}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      <div className="aspect-square bg-background-secondary rounded-xl overflow-hidden">
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-3 left-3 right-3">
            <h4 className="text-text-on-dark font-medium text-sm mb-1 line-clamp-1">{item.title}</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`${getTierBadge(item.tier).color}`}>
                  {getTierBadge(item.tier).label}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${accessBadge.color}`}>
                  {accessBadge.label}
                </span>
              </div>
              {item.type === 'video' && (
                <Play className="h-4 w-4 text-text-on-dark" />
              )}
            </div>
          </div>
        </div>

        {/* Lock overlay */}
        {!canView && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="text-center text-text-on-dark">
              <Lock className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">
                {item.accessLevel === 'private' ? 'Subscribe to view' : 'Login to view'}
              </p>
            </div>
          </div>
        )}

        {/* Type and Access indicators */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span className={`text-xs px-2 py-1 rounded-full ${accessBadge.color}`}>
            {accessBadge.label}
          </span>
          
          <div>
            {item.type === 'video' ? (
              <div className="bg-black bg-opacity-60 rounded-full p-1">
                <Play className="h-4 w-4 text-text-on-dark fill-current" />
              </div>
            ) : (
              <div className="bg-black bg-opacity-60 rounded-full p-1">
                <ImageIcon className="h-4 w-4 text-text-on-dark" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaItemCard;
