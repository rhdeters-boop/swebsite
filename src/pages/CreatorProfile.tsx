import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import CreatorLikeButton from '../components/CreatorLikeButton';
import { 
  Heart, 
  Users, 
  MapPin,
  Instagram,
  Twitter,
  Globe,
  UserPlus,
  UserCheck,
  Play,
  Image as ImageIcon,
  Lock,
  Eye,
  Grid,
  List
} from 'lucide-react';

interface Creator {
  id: string;
  displayName: string;
  bio: string;
  profilePictureUrl?: string;
  coverImageUrl?: string;
  categories: string[];
  subscriptionPrice: number;
  followerCount: number;
  subscriberCount: number;
  likeCount: number;
  location?: string;
  createdAt: string;
  isActive: boolean;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    onlyfans?: string;
  };
  user: {
    displayName: string;
    username: string;
  };
  isFollowing?: boolean;
  isSubscribed?: boolean;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description?: string;
  thumbnailUrl: string;
  url?: string; // Only if user has access
  tier: 'picture' | 'solo_video' | 'collab_video';
  createdAt: string;
  hasAccess: boolean;
}

interface CreatorResponse {
  success: boolean;
  data: {
    creator: Creator;
    mediaItems: MediaItem[];
    stats: {
      totalContent: number;
      totalImages: number;
      totalVideos: number;
    };
  };
}

const CreatorProfile: React.FC = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch creator profile
  const { data: creatorData, isLoading, error } = useQuery<CreatorResponse>({
    queryKey: ['creator', creatorId],
    queryFn: async () => {
      const response = await fetch(`/api/creators/${creatorId}`, {
        headers: isAuthenticated ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Creator not found');
        }
        throw new Error('Failed to fetch creator profile');
      }

      return response.json();
    },
    enabled: !!creatorId,
  });

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/creators/${creatorId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to follow creator');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', creatorId] });
    },
  });

  const handleFollow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    followMutation.mutate();
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/creator/${creatorId}/subscribe`);
  };

  const handleTip = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/creator/${creatorId}/tip`);
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const filteredMedia = creatorData?.data.mediaItems.filter(item => {
    if (selectedTier === 'all') return true;
    return item.tier === selectedTier;
  }) || [];

  const tierOptions = [
    { value: 'all', label: 'All Content' },
    { value: 'picture', label: 'Pictures' },
    { value: 'solo_video', label: 'Solo Videos' },
    { value: 'collab_video', label: 'Collab Videos' },
  ];

  if (isLoading) {
    return (
      <div className="py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-300 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-8"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-300 rounded-xl"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-300 rounded-2xl"></div>
                <div className="h-24 bg-gray-300 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !creatorData?.data.creator) {
    return (
      <div className="py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">😢</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Creator Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            {error instanceof Error ? error.message : 'This creator profile could not be found.'}
          </p>
          <button
            onClick={() => navigate('/creators')}
            className="btn-primary"
          >
            Browse Other Creators
          </button>
        </div>
      </div>
    );
  }

  const creator = creatorData.data.creator;
  const stats = creatorData.data.stats;

  return (
    <div className="py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Cover Image & Profile */}
        <div className="relative bg-gradient-primary rounded-card overflow-hidden mb-8">
          {creator.coverImageUrl ? (
            <img
              src={creator.coverImageUrl}
              alt="Cover"
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64"></div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-end space-x-6">
              <div className="w-24 h-24 rounded-full bg-background-primary p-1 shadow-elevated">
                {creator.profilePictureUrl ? (
                  <img
                    src={creator.profilePictureUrl}
                    alt={creator.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-text-on-dark text-2xl font-bold">
                      {creator.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-text-on-dark">
                <h1 className="text-display text-text-on-dark mb-2">{creator.displayName}</h1>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {creator.followerCount} followers
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {creator.subscriberCount} subscribers
                  </div>
                  <div className="flex items-center">
                    <CreatorLikeButton 
                      creatorId={Number(creator.id)} 
                      className="flex-1"
                    />
                  </div>
                  {creator.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {creator.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* About Section */}
            <div className="card mb-8">
              <h2 className="text-display-sm text-text-primary mb-4">About</h2>
              <p className="text-text-secondary leading-relaxed mb-6">{creator.bio}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {creator.categories.map((category) => (
                  <span
                    key={category}
                    className="category-tag"
                  >
                    {category}
                  </span>
                ))}
              </div>

              {/* Social Links */}
              {Object.keys(creator.socialLinks).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Connect</h3>
                  <div className="flex space-x-4">
                    {creator.socialLinks.instagram && (
                      <a
                        href={`https://instagram.com/${creator.socialLinks.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 bg-void-accent/10 text-void-accent rounded-full hover:bg-void-accent/20 transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {creator.socialLinks.twitter && (
                      <a
                        href={`https://twitter.com/${creator.socialLinks.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 bg-info/10 text-info rounded-full hover:bg-info/20 transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {creator.socialLinks.tiktok && (
                      <a
                        href={`https://tiktok.com/@${creator.socialLinks.tiktok}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 bg-text-tertiary/10 text-text-tertiary rounded-full hover:bg-text-tertiary/20 transition-colors"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-display-sm text-text-primary">Content</h2>
                
                <div className="flex items-center space-x-4">
                  {/* Tier Filter */}
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="form-select"
                  >
                    {tierOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex bg-background-secondary rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-background-primary text-void-accent shadow-sm'
                          : 'text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'list'
                          ? 'bg-background-primary text-void-accent shadow-sm'
                          : 'text-text-tertiary hover:text-text-secondary'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-background-secondary rounded-xl">
                  <div className="text-2xl font-bold text-void-accent">{stats.totalContent}</div>
                  <div className="text-sm text-text-tertiary">Total Items</div>
                </div>
                <div className="text-center p-4 bg-background-secondary rounded-xl">
                  <div className="text-2xl font-bold text-void-accent">{stats.totalImages}</div>
                  <div className="text-sm text-text-tertiary">Pictures</div>
                </div>
                <div className="text-center p-4 bg-background-secondary rounded-xl">
                  <div className="text-2xl font-bold text-void-accent">{stats.totalVideos}</div>
                  <div className="text-sm text-text-tertiary">Videos</div>
                </div>
              </div>

              {/* Media Grid */}
              {filteredMedia.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📷</div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">No content yet</h3>
                  <p className="text-text-secondary">
                    This creator hasn't uploaded any content in this category yet.
                  </p>
                </div>
              ) : (
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 md:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredMedia.map((item) => (
                    <MediaItemCard
                      key={item.id}
                      item={item}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <div className="card">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-void-accent mb-2">
                  {formatPrice(creator.subscriptionPrice)}
                  <span className="text-lg font-normal text-text-secondary">/month</span>
                </div>
                <p className="text-text-secondary">Get exclusive access to all content</p>
              </div>

              <div className="space-y-3">
                {creator.isSubscribed ? (
                  <div className="w-full bg-success/10 text-success border border-success/20 rounded-xl py-3 px-4 text-center font-medium">
                    ✓ Subscribed
                  </div>
                ) : (
                  <button
                    onClick={handleSubscribe}
                    className="btn-primary w-full"
                  >
                    Subscribe Now
                  </button>
                )}

                <button
                  onClick={creator.isFollowing ? undefined : handleFollow}
                  disabled={creator.isFollowing || followMutation.isPending}
                  className={`w-full btn ${
                    creator.isFollowing
                      ? 'bg-background-secondary text-text-secondary border border-border-secondary'
                      : 'btn-secondary'
                  }`}
                >
                  {creator.isFollowing ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {followMutation.isPending ? 'Following...' : 'Follow'}
                    </>
                  )}
                </button>

                <button
                  onClick={handleTip}
                  className="btn-outline w-full"
                >
                  💝 Send a Tip
                </button>
              </div>
            </div>

            {/* Creator Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Creator Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Member since</span>
                  <span className="font-medium">{formatDate(creator.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Content items</span>
                  <span className="font-medium">{stats.totalContent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Followers</span>
                  <span className="font-medium">{creator.followerCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Subscribers</span>
                  <span className="font-medium">{creator.subscriberCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MediaItemCardProps {
  item: MediaItem;
  viewMode: 'grid' | 'list';
}

const MediaItemCard: React.FC<MediaItemCardProps> = ({ item, viewMode }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (item.hasAccess) {
      navigate(`/media/${item.id}`);
    } else {
      // Show subscription prompt
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

  if (viewMode === 'list') {
    return (
      <div className="flex bg-background-secondary rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative w-32 h-24 flex-shrink-0">
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          {item.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="h-8 w-8 text-text-on-dark drop-shadow-lg" />
            </div>
          )}
          {!item.hasAccess && (
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
              <span className="text-xs text-text-tertiary">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleClick}
            className="btn-secondary-sm"
            disabled={!item.hasAccess}
          >
            {item.hasAccess ? (
              <>
                <Eye className="h-4 w-4 mr-1" />
                View
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-1" />
                Subscribe
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
              <span className={`${getTierBadge(item.tier).color}`}>
                {getTierBadge(item.tier).label}
              </span>
              {item.type === 'video' && (
                <Play className="h-4 w-4 text-text-on-dark" />
              )}
            </div>
          </div>
        </div>

        {/* Lock overlay for non-subscribers */}
        {!item.hasAccess && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="text-center text-text-on-dark">
              <Lock className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm font-medium">Subscribe to view</p>
            </div>
          </div>
        )}

        {/* Type indicator */}
        <div className="absolute top-3 right-3">
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
  );
};

export default CreatorProfile;
