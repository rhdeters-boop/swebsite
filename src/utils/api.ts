import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Creator interface matching backend data structure
// Backend Creator interface with analytics
interface Creator {
  id: string; // Changed from number to string to match UUID
  userId: string;
  displayName: string;
  profilePicture?: string;
  likeCount: number;
  followerCount: number;
  isOnline: boolean;
  user: {
    displayName: string;
    username: string;
    email?: string;
  };
  mediaItems?: {
    id: string;
    title: string;
    mediaType: string;
    analytics: {
      totalViews: number;
      totalLikes: number;
      weeklyViews: number;
      avgRating: number;
    };
  }[];
}

// Frontend interface for compatibility with existing components
export interface FrontendCreator {
  id: string; // Changed from number to string to match UUID
  name: string;
  image: string;
  likes: number;
  subscribers: string;
  isOnline: boolean;
  totalViews?: number;
  weeklyEngagement?: number;
  username?: string; // Added username for routing
  isCreator?: boolean; // Added to distinguish creators from regular users
  subscriptionType?: 'free' | 'basic' | 'premium'; // Added for subscription filtering
}

// API response interfaces
export interface CreatorsResponse {
  success: boolean;
  creators: Creator[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    categories: string[];
  };
}

export interface CreatorResponse {
  success: boolean;
  creator: Creator;
}

// Subscription interfaces
export interface SubscriptionData {
  id: string;
  userId: string;
  creatorId: string;
  tier: string;
  status: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    displayName: string;
    profilePicture?: string;
    subscriptionPrice: number;
    categories: string[];
    user: {
      displayName: string;
      username: string;
    };
  };
}

export interface UserSubscriptionsResponse {
  success: boolean;
  subscriptions: SubscriptionData[];
}

// Utility function to format subscriber count
const formatSubscriberCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// Convert backend creator to frontend format
function convertCreatorToFrontend(creator: Creator): FrontendCreator {
  const totalViews = creator.mediaItems?.reduce((sum, item) => 
    sum + (item.analytics?.totalViews || 0), 0) || 0;
  const weeklyViews = creator.mediaItems?.reduce((sum, item) => 
    sum + (item.analytics?.weeklyViews || 0), 0) || 0;
  const totalLikes = creator.mediaItems?.reduce((sum, item) => 
    sum + (item.analytics?.totalLikes || 0), 0) || 0;
  
  const weeklyEngagement = weeklyViews + totalLikes;
  
  return {
    id: creator.id, // Now string UUID
    name: creator.displayName,
    image: creator.profilePicture || '/placeholder-avatar.jpg',
    likes: creator.likeCount || 0,
    subscribers: formatSubscriberCount(creator.followerCount || 0),
    isOnline: creator.isOnline || false,
    totalViews,
    weeklyEngagement,
    username: creator.user?.username,
    isCreator: true
  };
}

// Creator API functions
export const creatorsApi = {
  // Get all creators with optional filters
  getCreators: async (params?: {
    search?: string;
    category?: string;
    sortBy?: 'newest' | 'popular' | 'rating' | 'price_low' | 'price_high';
    page?: number;
    limit?: number;
  }): Promise<CreatorsResponse> => {
    const response = await api.get('/creators', { params });
    return response.data;
  },

  // Get creator by ID
  getCreator: async (id: string): Promise<CreatorResponse> => {
    const response = await api.get(`/creators/${id}`);
    return response.data;
  },

  // Get creator by username
  getCreatorByUsername: async (username: string): Promise<CreatorResponse> => {
    const response = await api.get(`/creators/username/${username}`);
    return response.data;
  },

  // Follow/unfollow creator
  followCreator: async (id: string): Promise<{ success: boolean; message: string; isFollowed: boolean }> => {
    const response = await api.post(`/creators/${id}/follow`);
    return response.data;
  },

  // Get creators by category (using sortBy parameter)
  getCreatorsByCategory: async (sortBy: string, limit: number = 10): Promise<FrontendCreator[]> => {
    try {
      const response = await creatorsApi.getCreators({ 
        sortBy: sortBy as any, 
        limit 
      });
      return response.creators.map(convertCreatorToFrontend);
    } catch (error) {
      console.error(`Error fetching ${sortBy} creators:`, error);
      return [];
    }
  },

  // Get top creators (analytics-based)
  getTopCreators: async (limit: number = 10): Promise<FrontendCreator[]> => {
    try {
      const response = await api.get('/creators/top-performers', { params: { limit } });
      return response.data.creators.map(convertCreatorToFrontend);
    } catch (error) {
      console.error('Error fetching top creators:', error);
      return [];
    }
  },

  // Get trending creators (analytics-based)
  getTrendingCreators: async (limit: number = 10): Promise<FrontendCreator[]> => {
    try {
      const response = await api.get('/creators/trending', { params: { limit } });
      return response.data.creators.map(convertCreatorToFrontend);
    } catch (error) {
      console.error('Error fetching trending creators:', error);
      return [];
    }
  },

  // Get new creators
  getNewCreators: async (limit: number = 10): Promise<FrontendCreator[]> => {
    try {
      const response = await api.get('/creators/new-rising', { params: { limit } });
      return response.data.creators.map(convertCreatorToFrontend);
    } catch (error) {
      console.error('Error fetching new creators:', error);
      return [];
    }
  },
};

// Subscription API functions
export const subscriptionsApi = {
  // Get user's creator subscriptions
  getUserCreatorSubscriptions: async (): Promise<UserSubscriptionsResponse> => {
    const response = await api.get('/subscriptions/my-creators');
    return response.data;
  },

  // Subscribe to a creator
  subscribeToCreator: async (creatorId: string, tier: string): Promise<{ success: boolean; message: string; subscription: SubscriptionData }> => {
    const response = await api.post(`/subscriptions/creator/${creatorId}/subscribe`, { tier });
    return response.data;
  },

  // Unsubscribe from a creator
  unsubscribeFromCreator: async (creatorId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/subscriptions/creator/${creatorId}/unsubscribe`);
    return response.data;
  },

  // Get current subscription status
  getCurrentSubscription: async (): Promise<{ success: boolean; subscription: any }> => {
    const response = await api.get('/subscriptions/current');
    return response.data;
  },
};

export default api;
