import { useReducer, useCallback, useState } from 'react';
import axios from 'axios';

export interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  newEmail: string;
}

type SecurityAction =
  | { type: 'SET_FIELD'; field: keyof SecuritySettings; value: string }
  | { type: 'RESET_PASSWORD_FIELDS' }
  | { type: 'RESET_EMAIL_FIELDS' }
  | { type: 'RESET_ALL' };

const initialSecurityState: SecuritySettings = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  newEmail: '',
};

const securityReducer = (state: SecuritySettings, action: SecurityAction): SecuritySettings => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };
    case 'RESET_PASSWORD_FIELDS':
      return {
        ...state,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
    case 'RESET_EMAIL_FIELDS':
      return {
        ...state,
        newEmail: '',
      };
    case 'RESET_ALL':
      return initialSecurityState;
    default:
      return state;
  }
};

export interface UseSecuritySettingsReturn {
  securitySettings: SecuritySettings;
  isLoading: boolean;
  error: string;
  success: string;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  updateField: (field: keyof SecuritySettings, value: string) => void;
  resetPasswordFields: () => void;
  resetEmailFields: () => void;
  resetAll: () => void;
  changePassword: () => Promise<void>;
  changeEmail: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

export const useSecuritySettings = (): UseSecuritySettingsReturn => {
  const [securitySettings, dispatch] = useReducer(securityReducer, initialSecurityState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateField = useCallback((field: keyof SecuritySettings, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const resetPasswordFields = useCallback(() => {
    dispatch({ type: 'RESET_PASSWORD_FIELDS' });
  }, []);

  const resetEmailFields = useCallback(() => {
    dispatch({ type: 'RESET_EMAIL_FIELDS' });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

  const changePassword = useCallback(async () => {
    const { currentPassword, newPassword, confirmPassword } = securitySettings;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      await axios.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setSuccess('Password changed successfully!');
      resetPasswordFields();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsLoading(false);
    }
  }, [securitySettings, resetPasswordFields]);

  const changeEmail = useCallback(async () => {
    const { newEmail } = securitySettings;

    if (!newEmail) {
      setError('New email address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      await axios.put('/auth/change-email', { newEmail });

      setSuccess('Email change request sent! Please check your new email for verification.');
      resetEmailFields();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change email.');
    } finally {
      setIsLoading(false);
    }
  }, [securitySettings, resetEmailFields]);

  const deleteAccount = useCallback(async (password: string) => {
    if (!password) {
      setError('Please enter your password to confirm account deletion.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      await axios.delete('/auth/delete-account', {
        data: { password },
      });

      // Note: The component using this hook should handle logout and navigation
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account. Please check your password.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    securitySettings,
    isLoading,
    error,
    success,
    setError,
    setSuccess,
    updateField,
    resetPasswordFields,
    resetEmailFields,
    resetAll,
    changePassword,
    changeEmail,
    deleteAccount,
  };
};
