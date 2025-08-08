import { useState, useCallback, useReducer } from 'react';
import axios from 'axios';

// Privacy settings interface
interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  postVisibility: 'public' | 'followers_only' | 'subscribers_only';
  allowFollowRequests: boolean;
  showOnlineStatus: boolean;
  allowDirectMessages: 'everyone' | 'followers_only' | 'none';
}

// Blocked user interface
interface BlockedUser {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  blockedAt: string;
  reason?: string;
}

// Pagination interface
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Privacy action types
type PrivacyAction =
  | { type: 'SET_PRIVACY_SETTINGS'; payload: PrivacySettings }
  | { type: 'SET_BLOCKED_USERS'; payload: { users: BlockedUser[]; pagination: Pagination } }
  | { type: 'ADD_BLOCKED_USER'; payload: BlockedUser }
  | { type: 'REMOVE_BLOCKED_USER'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_SUCCESS'; payload: string }
  | { type: 'CLEAR_MESSAGES' };

// Initial state
const initialPrivacySettings: PrivacySettings = {
  profileVisibility: 'public',
  postVisibility: 'public',
  allowFollowRequests: true,
  showOnlineStatus: true,
  allowDirectMessages: 'everyone',
};

interface PrivacyState {
  privacySettings: PrivacySettings;
  blockedUsers: BlockedUser[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string;
  success: string;
}

const initialState: PrivacyState = {
  privacySettings: initialPrivacySettings,
  blockedUsers: [],
  pagination: null,
  isLoading: false,
  error: '',
  success: '',
};

// Privacy reducer
const privacyReducer = (state: PrivacyState, action: PrivacyAction): PrivacyState => {
  switch (action.type) {
    case 'SET_PRIVACY_SETTINGS':
      return {
        ...state,
        privacySettings: action.payload,
      };
    case 'SET_BLOCKED_USERS':
      return {
        ...state,
        blockedUsers: action.payload.users,
        pagination: action.payload.pagination,
      };
    case 'ADD_BLOCKED_USER':
      return {
        ...state,
        blockedUsers: [action.payload, ...state.blockedUsers],
      };
    case 'REMOVE_BLOCKED_USER':
      return {
        ...state,
        blockedUsers: state.blockedUsers.filter(user => user.id !== action.payload),
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        success: '',
        isLoading: false,
      };
    case 'SET_SUCCESS':
      return {
        ...state,
        success: action.payload,
        error: '',
        isLoading: false,
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        error: '',
        success: '',
      };
    default:
      return state;
  }
};

// Hook interface
export interface UsePrivacySettingsReturn {
  privacySettings: PrivacySettings;
  blockedUsers: BlockedUser[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string;
  success: string;
  
  // Privacy settings methods
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  
  // Blocking methods
  blockUser: (userId: string, reason?: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  getBlockedUsers: (page?: number) => Promise<void>;
  
  // Account management methods
  pauseAccount: (reason?: string) => Promise<void>;
  unpauseAccount: () => Promise<void>;
  
  // Utility methods
  clearMessages: () => void;
}

export const usePrivacySettings = (): UsePrivacySettingsReturn => {
  const [state, dispatch] = useReducer(privacyReducer, initialState);

  // Clear success/error messages
  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  // Update privacy settings
  const updatePrivacySettings = useCallback(async (settings: Partial<PrivacySettings>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_MESSAGES' });

    try {
      const response = await axios.put('/api/privacy/settings', settings, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        const newSettings = { ...state.privacySettings, ...settings };
        dispatch({ type: 'SET_PRIVACY_SETTINGS', payload: newSettings });
        dispatch({ type: 'SET_SUCCESS', payload: 'Privacy settings updated successfully' });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to update privacy settings'
      });
    }
  }, [state.privacySettings]);

  // Block a user
  const blockUser = useCallback(async (userId: string, reason?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_MESSAGES' });

    try {
      const response = await axios.post(`/api/privacy/block/${userId}`, 
        { reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        const blockedUser = response.data.data;
        dispatch({ type: 'ADD_BLOCKED_USER', payload: blockedUser });
        dispatch({ type: 'SET_SUCCESS', payload: 'User blocked successfully' });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to block user'
      });
    }
  }, []);

  // Unblock a user
  const unblockUser = useCallback(async (userId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_MESSAGES' });

    try {
      const response = await axios.delete(`/api/privacy/block/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        dispatch({ type: 'REMOVE_BLOCKED_USER', payload: userId });
        dispatch({ type: 'SET_SUCCESS', payload: 'User unblocked successfully' });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to unblock user'
      });
    }
  }, []);

  // Get blocked users with pagination
  const getBlockedUsers = useCallback(async (page: number = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_MESSAGES' });

    try {
      const response = await axios.get(`/api/privacy/blocked-users?page=${page}&limit=10`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        dispatch({ 
          type: 'SET_BLOCKED_USERS', 
          payload: {
            users: response.data.data.users,
            pagination: response.data.data.pagination
          }
        });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to load blocked users'
      });
    }
  }, []);

  // Pause account
  const pauseAccount = useCallback(async (reason?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_MESSAGES' });

    try {
      const response = await axios.post('/api/privacy/pause-account', 
        { reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        dispatch({ type: 'SET_SUCCESS', payload: 'Account paused successfully' });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to pause account'
      });
    }
  }, []);

  // Unpause account
  const unpauseAccount = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_MESSAGES' });

    try {
      const response = await axios.post('/api/privacy/unpause-account', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        dispatch({ type: 'SET_SUCCESS', payload: 'Account unpaused successfully' });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to unpause account'
      });
    }
  }, []);

  return {
    privacySettings: state.privacySettings,
    blockedUsers: state.blockedUsers,
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,
    success: state.success,
    
    updatePrivacySettings,
    blockUser,
    unblockUser,
    getBlockedUsers,
    pauseAccount,
    unpauseAccount,
    clearMessages,
  };
};
