import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Heart, 
  Users, 
  Star,
  Grid,
  List,
  ChevronDown,
  UserPlus,
  Eye
} from 'lucide-react';

interface Creator {
  id: string;
  displayName: string;
  bio: string;
  profilePictureUrl?: string;
  categories: string[];
  subscriptionPrice: number;
  followerCount: number;
  subscriberCount: number;
  rating: number;
  ratingCount: number;
  location?: string;
  createdAt: string;
  isFollowing?: boolean;
  isSubscribed?: boolean;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface CreatorSearchResponse {
  success: boolean;
  data: {
    creators: Creator[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Helper functions
const formatPrice = (price: number) => {
  return `$${(price / 100).toFixed(2)}`;
};

const formatRating = (rating: number) => {
  return rating.toFixed(1);
};

const CreatorSearch: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const categories = [
    'All Categories',
    'Lifestyle', 
    'Fitness', 
    'Beauty', 
    'Fashion', 
    'Art', 
    'Photography', 
    'Travel', 
    'Cooking', 
    'Music', 
    'Entertainment'
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ];

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory && selectedCategory !== 'All Categories') params.set('category', selectedCategory);
    if (sortBy !== 'popular') params.set('sortBy', sortBy);
    setSearchParams(params);
  }, [searchTerm, selectedCategory, sortBy, setSearchParams]);

  // Fetch creators
  const { data: creatorsData, isLoading, error, refetch } = useQuery<CreatorSearchResponse>({
    queryKey: ['creators', searchTerm, selectedCategory, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'All Categories') {
        params.append('category', selectedCategory);
      }
      params.append('sortBy', sortBy);
      params.append('limit', '12');

      const response = await fetch(`/api/creators?${params}`, {
        headers: isAuthenticated ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch creators');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleFollow = async (creatorId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`/api/creators/${creatorId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error('Error following creator:', error);
    }
  };

  const handleSubscribe = (creatorId: string) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/creator/${creatorId}/subscribe`);
  };

  const creators = creatorsData?.data?.creators || [];

  return (
    <div className="py-2 sm:py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Discover Amazing Creators
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find and support talented creators sharing exclusive content, from lifestyle and fitness to art and entertainment.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-pink focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-brand-pink focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category === 'All Categories' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>

            {/* Sort By */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-brand-pink focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-brand-pink shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-brand-pink shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Something went wrong. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No creators found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory 
                ? "Try adjusting your search or filters"
                : "Be the first to become a creator!"
              }
            </p>
            {!searchTerm && !selectedCategory && (
              <button
                onClick={() => navigate('/become-creator')}
                className="btn-primary mt-4"
              >
                Become a Creator
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {creatorsData?.data?.pagination?.totalItems || 0} creators found
              </p>
            </div>

            {/* Creator Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {creators.map((creator) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  viewMode={viewMode}
                  onFollow={() => handleFollow(creator.id)}
                  onSubscribe={() => handleSubscribe(creator.id)}
                  onViewProfile={() => navigate(`/creator/${creator.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface CreatorCardProps {
  creator: Creator;
  viewMode: 'grid' | 'list';
  onFollow: () => void;
  onSubscribe: () => void;
  onViewProfile: () => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  viewMode,
  onFollow,
  onSubscribe,
  onViewProfile
}) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <div className="flex">
          <div className="w-48 h-32 bg-gradient-to-br from-brand-pink to-brand-purple flex-shrink-0">
            {creator.profilePictureUrl ? (
              <img
                src={creator.profilePictureUrl}
                alt={creator.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {creator.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900">{creator.displayName}</h3>
              <div className="flex items-center text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="ml-1 text-sm text-gray-600">
                  {formatRating(creator.rating)} ({creator.ratingCount})
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">{creator.bio}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {creator.categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="px-2 py-1 bg-brand-pink/10 text-brand-pink text-xs rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {creator.followerCount}
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {creator.subscriberCount}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-brand-pink">
                  {formatPrice(creator.subscriptionPrice)}/mo
                </span>
                <button
                  onClick={onViewProfile}
                  className="btn-secondary-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
                <button
                  onClick={creator.isFollowing ? undefined : onFollow}
                  className={`btn-sm ${
                    creator.isFollowing
                      ? 'bg-gray-100 text-gray-700 border border-gray-200'
                      : 'btn-primary-sm'
                  }`}
                  disabled={creator.isFollowing}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  {creator.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-brand-pink to-brand-purple">
          {creator.profilePictureUrl ? (
            <img
              src={creator.profilePictureUrl}
              alt={creator.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {creator.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="absolute top-4 right-4">
          <div className="bg-white rounded-full px-2 py-1 flex items-center shadow-lg">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="ml-1 text-xs font-medium">
              {formatRating(creator.rating)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{creator.displayName}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{creator.bio}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {creator.categories.slice(0, 2).map((category) => (
            <span
              key={category}
              className="px-2 py-1 bg-brand-pink/10 text-brand-pink text-xs rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {creator.followerCount}
          </div>
          <div className="flex items-center">
            <Heart className="h-4 w-4 mr-1" />
            {creator.subscriberCount}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-brand-pink">
              {formatPrice(creator.subscriptionPrice)}/mo
            </span>
            <button
              onClick={creator.isFollowing ? undefined : onFollow}
              className={`btn-sm ${
                creator.isFollowing
                  ? 'bg-gray-100 text-gray-700 border border-gray-200'
                  : 'btn-secondary-sm'
              }`}
              disabled={creator.isFollowing}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              {creator.isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onViewProfile}
              className="flex-1 btn-secondary-sm"
            >
              View Profile
            </button>
            <button
              onClick={onSubscribe}
              className="flex-1 btn-primary-sm"
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorSearch;
