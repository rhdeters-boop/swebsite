import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface NotificationSettings {
  emailNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export interface AccountData {
  createdAt: string;
  lastLoginAt: string;
  isEmailVerified: boolean;
  totalSessions: number;
  subscription?: {
    tier: string;
    status: string;
    nextBilling: string;
  };
}

export interface Subscription {
  id: string;
  tier: string;
  status: 'active' | 'cancelled' | 'past_due';
  price: number;
  nextBilling: string;
  startDate: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string; // for PayPal
  isDefault: boolean;
}

export interface UseAccountDataReturn {
  accountData: AccountData;
  notificationSettings: NotificationSettings;
  subscriptions: Subscription[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string;
  success: string;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  refetchData: () => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  deletePaymentMethod: (paymentMethodId: string) => Promise<void>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>;
}

const defaultNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  marketingEmails: false,
  securityAlerts: true,
};

const defaultAccountData: AccountData = {
  createdAt: '',
  lastLoginAt: '',
  isEmailVerified: false,
  totalSessions: 0,
};

export const useAccountData = (): UseAccountDataReturn => {
  const [accountData, setAccountData] = useState<AccountData>(defaultAccountData);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/auth/account-info');
      setAccountData(response.data.account || defaultAccountData);
      setNotificationSettings(response.data.notifications || defaultNotificationSettings);
      setSubscriptions(response.data.subscriptions || []);
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (err) {
      console.error('Failed to load account data:', err);
      setError('Failed to load account data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateNotificationSettings = useCallback(async (settings: NotificationSettings) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      await axios.put('/auth/notification-settings', settings);
      setNotificationSettings(settings);
      setSuccess('Notification settings updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update notification settings.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async (subscriptionId: string) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      await axios.post(`/billing/cancel-subscription/${subscriptionId}`);
      setSuccess('Subscription cancelled successfully!');
      await refetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel subscription.');
    } finally {
      setIsLoading(false);
    }
  }, [refetchData]);

  const deletePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      await axios.delete(`/billing/payment-method/${paymentMethodId}`);
      setSuccess('Payment method removed successfully!');
      await refetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove payment method.');
    } finally {
      setIsLoading(false);
    }
  }, [refetchData]);

  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      await axios.put(`/billing/payment-method/${paymentMethodId}/default`);
      setSuccess('Default payment method updated!');
      await refetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update default payment method.');
    } finally {
      setIsLoading(false);
    }
  }, [refetchData]);

  useEffect(() => {
    refetchData();
  }, [refetchData]);

  return {
    accountData,
    notificationSettings,
    subscriptions,
    paymentMethods,
    isLoading,
    error,
    success,
    setError,
    setSuccess,
    refetchData,
    updateNotificationSettings,
    cancelSubscription,
    deletePaymentMethod,
    setDefaultPaymentMethod,
  };
};
