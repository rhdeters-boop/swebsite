import { useState, useCallback } from 'react';
import axios from 'axios';

// Account deletion state interface
interface AccountDeletionState {
  isLoading: boolean;
  error: string;
  success: string;
  deletionRequested: boolean;
  confirmationToken: string | null;
}

// Hook interface
export interface UseAccountDeletionReturn {
  isLoading: boolean;
  error: string;
  success: string;
  deletionRequested: boolean;
  
  // Account deletion methods
  requestDeletion: (password: string) => Promise<void>;
  confirmDeletion: (token: string) => Promise<void>;
  cancelDeletion: () => Promise<void>;
  
  // Utility methods
  clearMessages: () => void;
}

export const useAccountDeletion = (): UseAccountDeletionReturn => {
  const [state, setState] = useState<AccountDeletionState>({
    isLoading: false,
    error: '',
    success: '',
    deletionRequested: false,
    confirmationToken: null,
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<AccountDeletionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear success/error messages
  const clearMessages = useCallback(() => {
    updateState({ error: '', success: '' });
  }, [updateState]);

  // Request account deletion
  const requestDeletion = useCallback(async (password: string) => {
    updateState({ 
      isLoading: true, 
      error: '', 
      success: '' 
    });

    try {
      const response = await axios.post('/api/auth/request-account-deletion', 
        { password },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        updateState({
          isLoading: false,
          deletionRequested: true,
          confirmationToken: response.data.data?.token || null,
          success: 'Account deletion requested. Please check your email for confirmation instructions.',
        });
      }
    } catch (error: any) {
      updateState({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to request account deletion. Please try again.',
      });
    }
  }, [updateState]);

  // Confirm account deletion with token
  const confirmDeletion = useCallback(async (token: string) => {
    updateState({ 
      isLoading: true, 
      error: '', 
      success: '' 
    });

    try {
      const response = await axios.post('/api/auth/confirm-account-deletion', 
        { token },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        updateState({
          isLoading: false,
          success: 'Account deletion confirmed. Your account and all data will be permanently deleted within 24 hours.',
        });

        // Clear local storage and redirect will be handled by the component
        localStorage.removeItem('token');
      }
    } catch (error: any) {
      updateState({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to confirm account deletion. Please try again.',
      });
    }
  }, [updateState]);

  // Cancel account deletion request
  const cancelDeletion = useCallback(async () => {
    updateState({ 
      isLoading: true, 
      error: '', 
      success: '' 
    });

    try {
      const response = await axios.post('/api/auth/cancel-account-deletion', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        updateState({
          isLoading: false,
          deletionRequested: false,
          confirmationToken: null,
          success: 'Account deletion request cancelled successfully.',
        });
      }
    } catch (error: any) {
      updateState({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to cancel account deletion request.',
      });
    }
  }, [updateState]);

  return {
    isLoading: state.isLoading,
    error: state.error,
    success: state.success,
    deletionRequested: state.deletionRequested,
    
    requestDeletion,
    confirmDeletion,
    cancelDeletion,
    clearMessages,
  };
};
