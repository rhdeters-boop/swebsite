import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreatorLikeButton from '../components/CreatorLikeButton';
import MediaItemCard from '../components/MediaItemCard';
import UnauthenticatedContent from '../components/UnauthenticatedContent';
import AuthenticatedContent from '../components/AuthenticatedContent';
import SubscriptionCard from '../components/SubscriptionCard';
import { useCreatorProfile } from '../hooks/useCreatorProfile';
import MediaPaginator from '../components/navigation/MediaPaginator';
import {
  Users,
  MapPin,
  Instagram,
  Twitter,
  Globe,
  Star
} from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description?: string;
  thumbnailUrl: string;
  url?: string;
  tier: 'picture' | 'solo_video' | 'collab_video';
  accessLevel: 'free' | 'private';
  createdAt: string;
  hasAccess: boolean;
}

const CreatorProfile: React.FC = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination: read from URL (?page=1), default 1, page-size 24
  const initialPage = Number.parseInt(searchParams.get('page') || '1', 10);
  const page = Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1;
  const limit = 24;

  const {
    creatorData,
    mediaPagination,
    isLoading,
    error,
    followMutation,
    handleFollow,
    handleSubscribe,
    handleTip,
    prefetchPages,
  } = useCreatorProfile(creatorId, isAuthenticated, page, limit);

  const filteredMedia = creatorData?.creator?.mediaItems?.filter((item: MediaItem) => {
    if (!isAuthenticated && item.accessLevel === 'private') {
      return false;
    }
    if (selectedTier === 'all') return true;
    return item.tier === selectedTier;
  }) || [];

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

  if (error || !creatorData?.creator) {
    return (
      <div className="py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">😢</div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Creator Not Found
          </h1>
          <p className="text-text-secondary mb-8">
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

  const creator = creatorData?.creator;
  const freeMedia = creator?.mediaItems?.filter((item: MediaItem) => item.accessLevel === 'free') || [];
  const privateMedia = creator?.mediaItems?.filter((item: MediaItem) => item.accessLevel === 'private') || [];
  
  const stats = {
    // Prefer server total if available (for overall count), fallback to current page length
    totalContent: mediaPagination?.total ?? (creator?.mediaItems?.length || 0),
    totalImages: creator?.mediaItems?.filter((item: MediaItem) => item.type === 'image').length || 0,
    totalVideos: creator?.mediaItems?.filter((item: MediaItem) => item.type === 'video').length || 0,
    freeContent: freeMedia.length,
    privateContent: privateMedia.length
  };

  if (!creator) {
    return (
      <div className="py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Creator not found</h1>
          <p className="text-text-secondary">The creator you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // Clamp invalid page to valid bounds when data is known
  useEffect(() => {
    if (!mediaPagination) return;
    const max = Math.max(1, mediaPagination.pages);
    const clamped = Math.min(Math.max(page, 1), max);
    if (clamped !== page) {
      const sp = new URLSearchParams(searchParams);
      sp.set('page', String(clamped));
      setSearchParams(sp);
    }
  }, [mediaPagination, page, searchParams, setSearchParams]);

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
          
          <div className="absolute inset-0 bg-background-overlay/20"></div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-end space-x-6">
              <div className="w-24 h-24 rounded-full bg-background-primary p-1 shadow-elevated">
                {(creator.profileImageUrl || creator.profileImage) ? (
                  <img
                    src={creator.profileImageUrl || creator.profileImage}
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
                    <Star className="h-4 w-4 mr-1" />
                    {creator.subscriberCount} subscribers
                  </div>
                  <div className="flex items-center">
                    <CreatorLikeButton 
                      creatorId={creator.id} 
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
                {creator.categories.map((category: string) => (
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
                        className="flex items-center justify-center w-10 h-10 bg-text-muted/10 text-text-muted rounded-full hover:bg-text-muted/20 transition-colors"
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
              </div>

              {!isAuthenticated ? (
                <UnauthenticatedContent
                  freeMedia={freeMedia}
                  stats={stats}
                  creatorName={creator.displayName}
                />
              ) : (
                <>
                  <AuthenticatedContent
                    filteredMedia={filteredMedia}
                    stats={stats}
                    selectedTier={selectedTier}
                    setSelectedTier={setSelectedTier}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                  />

                  {/* Pagination */}
                  {mediaPagination && mediaPagination.pages > 1 && (
                    <div className="mt-6">
                      <MediaPaginator
                        currentPage={page}
                        totalPages={mediaPagination.pages}
                        makeHref={(p) => {
                          const sp = new URLSearchParams(searchParams);
                          sp.set('page', String(p));
                          const path = window.location.pathname;
                          return `${path}?${sp.toString()}`;
                        }}
                        onNavigate={(p) => {
                          const sp = new URLSearchParams(searchParams);
                          sp.set('page', String(p));
                          setSearchParams(sp);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        onPrefetch={(pages) => prefetchPages?.(pages)}
                        windowSize={2}
                        className="mt-4"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SubscriptionCard
              creator={creator}
              followMutation={followMutation}
              onSubscribe={handleSubscribe}
              onFollow={handleFollow}
              onTip={handleTip}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
