import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Shield, 
  Bell, 
  CreditCard, 
  AlertTriangle,
  Check,
  X,
  Plus,
  Trash2
} from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  newEmail: string;
}

interface AccountData {
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

interface Subscription {
  id: string;
  tier: string;
  status: 'active' | 'cancelled' | 'past_due';
  price: number;
  nextBilling: string;
  startDate: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string; // for PayPal
  isDefault: boolean;
}

const AccountSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'billing' | 'danger'>('security');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newEmail: '',
  });

  const [accountData, setAccountData] = useState<AccountData>({
    createdAt: '',
    lastLoginAt: '',
    isEmailVerified: false,
    totalSessions: 0,
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Load account data
  useEffect(() => {
    const loadAccountData = async () => {
      try {
        const response = await axios.get('/auth/account-info');
        setAccountData(response.data.account);
        setNotificationSettings(response.data.notifications || notificationSettings);
        // Load billing data
        setSubscriptions(response.data.subscriptions || []);
        setPaymentMethods(response.data.paymentMethods || []);
        // Security settings are now form fields, no need to load from server
      } catch (err) {
        console.error('Failed to load account data:', err);
      }
    };
    loadAccountData();
  }, []);

  const handleNotificationChange = async (setting: keyof NotificationSettings, value: boolean) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const newSettings = { ...notificationSettings, [setting]: value };
      await axios.put('/auth/notification-settings', newSettings);
      setNotificationSettings(newSettings);
      setSuccess('Notification settings updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update notification settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityChange = (field: keyof SecuritySettings, value: string) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordReset = async () => {
    if (!securitySettings.currentPassword || !securitySettings.newPassword || !securitySettings.confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (securitySettings.newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put('/auth/change-password', {
        currentPassword: securitySettings.currentPassword,
        newPassword: securitySettings.newPassword
      });
      
      setSuccess('Password changed successfully!');
      setSecuritySettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setShowPasswordForm(false); // Hide the form after success
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!securitySettings.newEmail) {
      setError('New email address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(securitySettings.newEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put('/auth/change-email', {
        newEmail: securitySettings.newEmail
      });
      
      setSuccess('Email change request sent! Please check your new email for verification.');
      setSecuritySettings(prev => ({
        ...prev,
        newEmail: ''
      }));
      setShowEmailForm(false); // Hide the form after success
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Please enter your password to confirm account deletion.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.delete('/auth/delete-account', {
        data: { password: deletePassword }
      });
      
      logout();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account. Please check your password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/auth/logout-all-sessions');
      setSuccess('All sessions have been logged out successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to logout all sessions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`/billing/cancel-subscription/${subscriptionId}`);
      setSuccess('Subscription cancelled successfully!');
      // Reload subscriptions
      const response = await axios.get('/auth/account-info');
      setSubscriptions(response.data.subscriptions || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel subscription.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.delete(`/billing/payment-method/${paymentMethodId}`);
      setSuccess('Payment method removed successfully!');
      // Reload payment methods
      const response = await axios.get('/auth/account-info');
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove payment method.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`/billing/payment-method/${paymentMethodId}/default`);
      setSuccess('Default payment method updated!');
      // Reload payment methods
      const response = await axios.get('/auth/account-info');
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update default payment method.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Account Settings</h1>
            <p className="text-pink-100 mt-2">Manage your account security, notifications, and preferences</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                  activeTab === 'security'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                  activeTab === 'notifications'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                  activeTab === 'billing'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Billing</span>
              </button>
              <button
                onClick={() => setActiveTab('danger')}
                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center space-x-2 ${
                  activeTab === 'danger'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Danger Zone</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Password & Email Settings</h3>
                  
                  {/* Change Password Section */}
                  <div className="space-y-4 mb-8">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">Password</h4>
                          <p className="text-sm text-gray-600">••••••••••••</p>
                        </div>
                        {!showPasswordForm ? (
                          <button
                            onClick={() => setShowPasswordForm(true)}
                            className="btn-secondary-sm"
                          >
                            Change Password
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setShowPasswordForm(false);
                              setSecuritySettings(prev => ({
                                ...prev,
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                              }));
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      
                      {showPasswordForm && (
                        <div className="mt-6 space-y-4 border-t border-gray-200 pt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              value={securitySettings.currentPassword}
                              onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Enter current password"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={securitySettings.newPassword}
                              onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Enter new password (min 8 characters)"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={securitySettings.confirmPassword}
                              onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Confirm new password"
                            />
                          </div>
                          <button
                            onClick={handlePasswordReset}
                            disabled={isLoading || !securitySettings.currentPassword || !securitySettings.newPassword || !securitySettings.confirmPassword}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Changing Password...' : 'Update Password'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Change Email Section */}
                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">Email Address</h4>
                          <p className="text-sm text-gray-600">{user?.email || 'No email set'}</p>
                        </div>
                        {!showEmailForm ? (
                          <button
                            onClick={() => setShowEmailForm(true)}
                            className="btn-secondary-sm"
                          >
                            Change Email
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setShowEmailForm(false);
                              setSecuritySettings(prev => ({
                                ...prev,
                                newEmail: ''
                              }));
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      
                      {showEmailForm && (
                        <div className="mt-6 space-y-4 border-t border-gray-200 pt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Email Address
                            </label>
                            <input
                              type="email"
                              value={securitySettings.newEmail}
                              onChange={(e) => handleSecurityChange('newEmail', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                              placeholder="Enter new email address"
                            />
                          </div>
                          <button
                            onClick={handleEmailChange}
                            disabled={isLoading || !securitySettings.newEmail}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Sending Verification...' : 'Update Email'}
                          </button>
                          <p className="text-sm text-gray-600">
                            You will receive a verification email at your new address. Your email will be updated after verification.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-700">Account Created</h4>
                      <p className="text-sm text-gray-600">
                        {accountData.createdAt ? new Date(accountData.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-700">Last Login</h4>
                      <p className="text-sm text-gray-600">
                        {accountData.lastLoginAt ? new Date(accountData.lastLoginAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-700">Email Verification</h4>
                      <div className="flex items-center space-x-2">
                        {accountData.isEmailVerified ? (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">Verified</span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600">Not Verified</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-700">Active Sessions</h4>
                      <p className="text-sm text-gray-600">{accountData.totalSessions || 1} session(s)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    onClick={handleLogoutAllSessions}
                    disabled={isLoading}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    {isLoading ? 'Logging out...' : 'Logout All Sessions'}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive important updates via email</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('emailNotifications', !notificationSettings.emailNotifications)}
                        disabled={isLoading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.emailNotifications ? 'bg-pink-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium">Marketing Emails</h4>
                        <p className="text-sm text-gray-600">Receive updates about new features and promotions</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('marketingEmails', !notificationSettings.marketingEmails)}
                        disabled={isLoading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.marketingEmails ? 'bg-pink-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationSettings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium">Security Alerts</h4>
                        <p className="text-sm text-gray-600">Important security notifications (recommended)</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange('securityAlerts', !notificationSettings.securityAlerts)}
                        disabled={isLoading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.securityAlerts ? 'bg-pink-500' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationSettings.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                {/* Active Subscriptions Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Active Subscriptions</h3>
                  
                  {subscriptions.length > 0 ? (
                    <div className="space-y-4">
                      {subscriptions.map((subscription) => (
                        <div key={subscription.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-800">{subscription.tier}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  subscription.status === 'active' 
                                    ? 'bg-green-100 text-green-800'
                                    : subscription.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                                </span>
                                <span className="text-sm text-gray-600">
                                  ${subscription.price}/month
                                </span>
                              </div>
                            </div>
                            {subscription.status === 'active' && (
                              <button
                                onClick={() => handleCancelSubscription(subscription.id)}
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                              >
                                Cancel Subscription
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Start Date:</span>
                              <span className="ml-2">{new Date(subscription.startDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Next Billing:</span>
                              <span className="ml-2">{new Date(subscription.nextBilling).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 border border-gray-200 rounded-lg text-center">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-3">No active subscriptions</p>
                      <button className="btn-primary">
                        View Subscription Plans
                      </button>
                    </div>
                  )}
                </div>

                {/* Saved Payment Methods Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Saved Payment Methods</h3>
                    <button className="btn-secondary-sm flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Payment Method</span>
                    </button>
                  </div>
                  
                  {paymentMethods.length > 0 ? (
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-6 bg-gray-100 rounded border flex items-center justify-center">
                                {method.type === 'card' ? (
                                  <CreditCard className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <span className="text-xs font-bold text-blue-600">PP</span>
                                )}
                              </div>
                              <div>
                                {method.type === 'card' ? (
                                  <div>
                                    <p className="font-medium">
                                      {method.brand?.toUpperCase()} •••• {method.last4}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Expires {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="font-medium">PayPal</p>
                                    <p className="text-sm text-gray-600">{method.email}</p>
                                  </div>
                                )}
                                {method.isDefault && (
                                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {!method.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultPaymentMethod(method.id)}
                                  disabled={isLoading}
                                  className="text-pink-600 hover:text-pink-800 text-sm font-medium disabled:opacity-50"
                                >
                                  Make Default
                                </button>
                              )}
                              <button
                                onClick={() => handleDeletePaymentMethod(method.id)}
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                title="Remove payment method"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 border border-gray-200 rounded-lg text-center">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-3">No saved payment methods</p>
                      <button className="btn-primary flex items-center space-x-2 mx-auto">
                        <Plus className="h-4 w-4" />
                        <span>Add Payment Method</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="space-y-6">
                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                  <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-red-700">Delete Account</h4>
                      <p className="text-sm text-red-600 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      
                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          Delete Account
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-red-700 mb-2">
                              Enter your password to confirm:
                            </label>
                            <input
                              type="password"
                              value={deletePassword}
                              onChange={(e) => setDeletePassword(e.target.value)}
                              className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                              placeholder="Enter your password"
                            />
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={handleDeleteAccount}
                              disabled={isLoading || !deletePassword}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                              {isLoading ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeletePassword('');
                              }}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
