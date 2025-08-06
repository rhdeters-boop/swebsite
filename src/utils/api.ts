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
export interface Creator {
  id: number;
  displayName: string;
  bio?: string;
  categories: string[];
  subscriptionPrice: number;
  rating: number;
  ratingCount: number;
  followerCount: number;
  subscriberCount: number;
  isVerified: boolean;
  isActive: boolean;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
  };
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  isFollowed?: boolean;
  isSubscribed?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Frontend interface for compatibility with existing components
export interface FrontendCreator {
  id: number;
  name: string;
  image: string;
  rating: number;
  subscribers: string;
  isOnline: boolean;
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
export const convertCreatorToFrontend = (creator: Creator): FrontendCreator => ({
  id: creator.id,
  name: creator.displayName,
  image: creator.profileImageUrl || '/api/placeholder/300/400',
  rating: Math.round(creator.rating * 10) / 10,
  subscribers: formatSubscriberCount(creator.followerCount),
  isOnline: Math.random() > 0.3, // Random online status for now
});

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
  getCreator: async (id: number): Promise<CreatorResponse> => {
    const response = await api.get(`/creators/${id}`);
    return response.data;
  },

  // Follow/unfollow creator
  followCreator: async (id: number): Promise<{ success: boolean; message: string; isFollowed: boolean }> => {
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

  // Get top creators
  getTopCreators: async (limit: number = 10): Promise<FrontendCreator[]> => {
    return creatorsApi.getCreatorsByCategory('popular', limit);
  },

  // Get trending creators
  getTrendingCreators: async (limit: number = 10): Promise<FrontendCreator[]> => {
    return creatorsApi.getCreatorsByCategory('rating', limit);
  },

  // Get new creators
  getNewCreators: async (limit: number = 10): Promise<FrontendCreator[]> => {
    return creatorsApi.getCreatorsByCategory('newest', limit);
  },
};

export default api;
