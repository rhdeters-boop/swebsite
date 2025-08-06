import React from 'react';
import MediaItemCard from './MediaItemCard';
import { Grid, List } from 'lucide-react';

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

interface ContentStats {
  totalContent: number;
  freeContent: number;
  privateContent: number;
  totalVideos: number;
}

interface AuthenticatedContentProps {
  filteredMedia: MediaItem[];
  stats: ContentStats;
  selectedTier: string;
  setSelectedTier: (tier: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const tierOptions = [
  { value: 'all', label: 'All Content' },
  { value: 'picture', label: 'Pictures' },
  { value: 'solo_video', label: 'Solo Videos' },
  { value: 'collab_video', label: 'Collab Videos' },
];

const AuthenticatedContent: React.FC<AuthenticatedContentProps> = ({
  filteredMedia,
  stats,
  selectedTier,
  setSelectedTier,
  viewMode,
  setViewMode
}) => {
  return (
    <>
      {/* Controls */}
      <div className="flex items-center space-x-4 mb-6">
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

      {/* Content Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-background-secondary rounded-xl">
          <div className="text-2xl font-bold text-void-accent">{stats.totalContent}</div>
          <div className="text-sm text-text-tertiary">Total Items</div>
        </div>
        <div className="text-center p-4 bg-background-secondary rounded-xl">
          <div className="text-2xl font-bold text-success">{stats.freeContent}</div>
          <div className="text-sm text-text-tertiary">Free</div>
        </div>
        <div className="text-center p-4 bg-background-secondary rounded-xl">
          <div className="text-2xl font-bold text-void-accent">{stats.privateContent}</div>
          <div className="text-sm text-text-tertiary">Exclusive</div>
        </div>
        <div className="text-center p-4 bg-background-secondary rounded-xl">
          <div className="text-2xl font-bold text-info">{stats.totalVideos}</div>
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
    </>
  );
};

export default AuthenticatedContent;
