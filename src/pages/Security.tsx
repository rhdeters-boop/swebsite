import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Eye, 
  AlertTriangle,
  Settings,
  Users,
  Trash2,
  Pause,
  Play,
  User
} from 'lucide-react';
import { useSecuritySettings } from '../hooks/useSecuritySettings';
import { usePrivacySettings } from '../hooks/usePrivacySettings';
import { useAccountDeletion } from '../hooks/useAccountDeletion';

type TabType = 'security' | 'privacy' | 'danger';

const Security: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Use existing security settings hook
  const {
    securitySettings,
    isLoading: securityLoading,
    error: securityError,
    success: securitySuccess,
    updateField: updateSecurityField,
    resetPasswordFields,
    resetEmailFields,
    changePassword,
    changeEmail,
    logoutAllSessions,
    deleteAccount,
  } = useSecuritySettings();

  const [activeTab, setActiveTab] = useState<TabType>('security');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  
  // Privacy settings hook
  const {
    privacySettings,
    blockedUsers,
    isLoading: privacyLoading,
    error: privacyError,
    success: privacySuccess,
    updatePrivacySettings,
    blockUser,
    unblockUser,
    pauseAccount,
    unpauseAccount,
    clearMessages: clearPrivacyMessages,
  } = usePrivacySettings();
  
  // Account deletion hook
  const {
    isLoading: deletionLoading,
    error: deletionError,
    success: deletionSuccess,
    deletionRequested,
    requestDeletion,
    confirmDeletion,
    cancelDeletion,
    clearMessages: clearDeletionMessages,
  } = useAccountDeletion();
  
  // Account pause state (temporary)
  const [isAccountPaused, setIsAccountPaused] = useState(false);

  const handlePasswordReset = async () => {
    await changePassword();
    if (securitySuccess) {
      setShowPasswordForm(false);
      resetPasswordFields();
    }
  };

  const handleEmailChange = async () => {
    await changeEmail();
    if (securitySuccess) {
      setShowEmailForm(false);
      resetEmailFields();
    }
  };

  const handleDeleteAccount = async () => {
    await requestDeletion(deletePassword);
    if (deletionSuccess) {
      logout();
      navigate('/');
    }
  };

  const handlePrivacyChange = async (setting: keyof typeof privacySettings, value: any) => {
    await updatePrivacySettings({ [setting]: value });
  };

  const handlePauseAccount = async () => {
    await pauseAccount();
    if (privacySuccess) {
      setIsAccountPaused(true);
    }
  };

  const handleUnpauseAccount = async () => {
    await unpauseAccount();
    if (privacySuccess) {
      setIsAccountPaused(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-void-gradient flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'security', label: 'Account Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-void-gradient py-8">
      <div className="container-content">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-seductive/10 border border-border-muted">
              <Settings className="h-12 w-12 text-seductive" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient font-serif mb-4">
            Security & Privacy
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Manage your account security, privacy settings, and account preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-border-muted mb-8">
          <nav className="flex justify-center space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-seductive text-seductive'
                      : 'border-transparent text-secondary hover:text-primary hover:border-border-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {/* Success/Error Messages */}
          {(securityError || securitySuccess || privacyError || privacySuccess || deletionError || deletionSuccess) && (
            <div className={`mb-6 p-4 rounded-xl border ${
              (securityError || privacyError || deletionError)
                ? 'bg-error/10 border-border-error text-error' 
                : 'bg-success/10 border-border-success text-success'
            }`}>
              {securityError || securitySuccess || privacyError || privacySuccess || deletionError || deletionSuccess}
            </div>
          )}

          {/* Account Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="rounded-xl border border-border-muted shadow-card p-8">
                <h2 className="text-3xl font-semibold text-primary mb-6">Account Security</h2>
                
                {/* Password Section */}
                <div className="space-y-6 mb-8">
                  <div className="rounded-xl border border-border-muted p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold text-primary mb-2">Password</h3>
                        <p className="text-secondary">••••••••••••</p>
                      </div>
                      {!showPasswordForm ? (
                        <button
                          onClick={() => setShowPasswordForm(true)}
                          className="btn-secondary"
                        >
                          Change Password
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowPasswordForm(false);
                            resetPasswordFields();
                          }}
                          className="text-secondary hover:text-primary"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    
                    {showPasswordForm && (
                      <div className="mt-6 space-y-4 border-t border-border-muted pt-6">
                        <div>
                          <label className="form-label">Current Password</label>
                          <input
                            type="password"
                            value={securitySettings.currentPassword}
                            onChange={(e) => updateSecurityField('currentPassword', e.target.value)}
                            className="form-input"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div>
                          <label className="form-label">New Password</label>
                          <input
                            type="password"
                            value={securitySettings.newPassword}
                            onChange={(e) => updateSecurityField('newPassword', e.target.value)}
                            className="form-input"
                            placeholder="Enter new password (min 8 characters)"
                          />
                        </div>
                        <div>
                          <label className="form-label">Confirm New Password</label>
                          <input
                            type="password"
                            value={securitySettings.confirmPassword}
                            onChange={(e) => updateSecurityField('confirmPassword', e.target.value)}
                            className="form-input"
                            placeholder="Confirm new password"
                          />
                        </div>
                        <button
                          onClick={handlePasswordReset}
                          disabled={(securityLoading || privacyLoading || deletionLoading) || !securitySettings.currentPassword || !securitySettings.newPassword || !securitySettings.confirmPassword}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {(securityLoading || privacyLoading || deletionLoading) ? 'Changing Password...' : 'Update Password'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Section */}
                <div className="space-y-6 border-t border-border-muted pt-8">
                  <div className="rounded-xl border border-border-muted p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold text-primary mb-2">Email Address</h3>
                        <p className="text-secondary">{user?.email || 'No email set'}</p>
                      </div>
                      {!showEmailForm ? (
                        <button
                          onClick={() => setShowEmailForm(true)}
                          className="btn-secondary"
                        >
                          Change Email
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowEmailForm(false);
                            resetEmailFields();
                          }}
                          className="text-secondary hover:text-primary"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    
                    {showEmailForm && (
                      <div className="mt-6 space-y-4 border-t border-border-muted pt-6">
                        <div>
                          <label className="form-label">New Email Address</label>
                          <input
                            type="email"
                            value={securitySettings.newEmail}
                            onChange={(e) => updateSecurityField('newEmail', e.target.value)}
                            className="form-input"
                            placeholder="Enter new email address"
                          />
                        </div>
                        <button
                          onClick={handleEmailChange}
                          disabled={(securityLoading || privacyLoading || deletionLoading) || !securitySettings.newEmail}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {(securityLoading || privacyLoading || deletionLoading) ? 'Sending Verification...' : 'Update Email'}
                        </button>
                        <p className="text-sm text-tertiary">
                          You will receive a verification email at your new address. Your email will be updated after verification.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Session Management */}
                <div className="border-t border-border-muted pt-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-semibold text-primary mb-2">Active Sessions</h3>
                      <p className="text-secondary">Manage your active login sessions</p>
                    </div>
                    <button
                      onClick={logoutAllSessions}
                      disabled={securityLoading || privacyLoading || deletionLoading}
                      className="btn-outline hover:border-secondary disabled:opacity-50"
                    >
                      {(securityLoading || privacyLoading || deletionLoading) ? 'Logging out...' : 'Logout All Sessions'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-8">
              <div className="rounded-xl border border-border-muted shadow-card p-8">
                <h2 className="text-3xl font-semibold text-primary mb-6">Privacy Settings</h2>
                
                {/* Profile Privacy */}
                <div className="space-y-6 mb-8">
                  <div className="rounded-xl border border-border-muted p-6">
                    <h3 className="text-2xl font-semibold text-primary mb-4">Profile Privacy</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-primary">Profile Visibility</h4>
                          <p className="text-sm text-secondary">Control who can see your profile</p>
                        </div>
                        <select
                          value={privacySettings.profileVisibility}
                          onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                          className="form-select w-auto"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-primary">Post Visibility</h4>
                          <p className="text-sm text-secondary">Who can see your posts</p>
                        </div>
                        <select
                          value={privacySettings.postVisibility}
                          onChange={(e) => handlePrivacyChange('postVisibility', e.target.value)}
                          className="form-select w-auto"
                        >
                          <option value="public">Everyone</option>
                          <option value="followers_only">Followers Only</option>
                          <option value="subscribers_only">Subscribers Only</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Communication Settings */}
                <div className="space-y-6 border-t border-border-muted pt-8">
                  <div className="rounded-xl border border-border-muted p-6">
                    <h3 className="text-2xl font-semibold text-primary mb-4">Communication</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-primary">Direct Messages</h4>
                          <p className="text-sm text-secondary">Who can send you direct messages</p>
                        </div>
                        <select
                          value={privacySettings.allowDirectMessages}
                          onChange={(e) => handlePrivacyChange('allowDirectMessages', e.target.value)}
                          className="form-select w-auto"
                        >
                          <option value="everyone">Everyone</option>
                          <option value="followers_only">Followers Only</option>
                          <option value="none">No One</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-primary">Show Online Status</h4>
                          <p className="text-sm text-secondary">Let others see when you're online</p>
                        </div>
                        <button
                          onClick={() => handlePrivacyChange('showOnlineStatus', !privacySettings.showOnlineStatus)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            privacySettings.showOnlineStatus ? 'bg-seductive' : 'bg-border-muted'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-primary transition-transform ${
                              privacySettings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blocked Users */}
                <div className="border-t border-border-muted pt-8">
                  <div className="rounded-xl border border-border-muted p-6">
                    <h3 className="text-2xl font-semibold text-primary mb-4">Blocked Users</h3>
                    <p className="text-secondary mb-4">Manage users you have blocked</p>
                    
                    {/* Blocked users list */}
                    {blockedUsers.length > 0 ? (
                      <div className="space-y-3">
                        {blockedUsers.map((blockedUser) => (
                          <div key={blockedUser.id} className="flex items-center justify-between p-4 border border-border-muted rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-background-secondary rounded-full flex items-center justify-center">
                                {blockedUser.profilePicture ? (
                                  <img
                                    src={blockedUser.profilePicture}
                                    alt={blockedUser.displayName}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="h-5 w-5 text-muted" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-primary">{blockedUser.displayName}</p>
                                <p className="text-sm text-secondary">@{blockedUser.username}</p>
                                {blockedUser.reason && (
                                  <p className="text-xs text-tertiary">Reason: {blockedUser.reason}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => unblockUser(blockedUser.id)}
                              disabled={privacyLoading}
                              className="btn-outline text-sm hover:border-success hover:text-success disabled:opacity-50"
                            >
                              {privacyLoading ? 'Unblocking...' : 'Unblock'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-border-muted rounded-xl">
                        <Users className="h-12 w-12 text-muted mx-auto mb-4" />
                        <p className="text-muted">No blocked users</p>
                        <p className="text-sm text-tertiary mt-2">
                          Users you block will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="space-y-8">
              <div className="rounded-xl border border-red-600/50 shadow-card p-8 bg-error/5">
                <h2 className="text-3xl font-semibold text-error mb-6">Danger Zone</h2>
                
                {/* Account Pause */}
                <div className="space-y-6 mb-8">
                  <div className="rounded-xl border border-border-muted p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold text-primary mb-2">
                          {isAccountPaused ? 'Account Paused' : 'Pause Account'}
                        </h3>
                        <p className="text-secondary">
                          {isAccountPaused 
                            ? 'Your account is currently paused and invisible to others'
                            : 'Temporarily hide your profile while keeping your data'
                          }
                        </p>
                      </div>
                      {!isAccountPaused ? (
                        <button
                          onClick={handlePauseAccount}
                          className="btn-outline border-warning text-warning hover:bg-warning hover:text-primary"
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Account
                        </button>
                      ) : (
                        <button
                          onClick={handleUnpauseAccount}
                          className="btn-outline border-success text-success hover:bg-success hover:text-primary"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Unpause Account
                        </button>
                      )}
                    </div>
                    
                    {isAccountPaused && (
                      <div className="mt-4 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                        <div className="flex items-center">
                          <Pause className="h-5 w-5 text-warning mr-3" />
                          <div>
                            <p className="text-warning font-medium">Account is paused</p>
                            <p className="text-sm text-tertiary">
                              Your profile is hidden but all data is preserved
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Deletion */}
                <div className="border-t border-border-muted pt-8">
                  <div className="rounded-xl border border-error/50 p-6 bg-error/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold text-error mb-2">Delete Account</h3>
                        <p className="text-secondary">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      {!showDeleteConfirm && (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="btn-danger"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </button>
                      )}
                    </div>
                    
                    {showDeleteConfirm && (
                      <div className="mt-6 space-y-4 border-t border-error/30 pt-6">
                        <div className="p-4 bg-error/10 border border-error/30 rounded-lg">
                          <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-error mr-3 mt-0.5" />
                            <div>
                              <p className="text-error font-medium mb-2">This action cannot be undone</p>
                              <ul className="text-sm text-secondary space-y-1">
                                <li>• Your profile will be permanently deleted</li>
                                <li>• All your content will be removed</li>
                                <li>• Your subscriptions will be cancelled</li>
                                <li>• You will lose access to all purchased content</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="form-label text-error">
                            Enter your password to confirm deletion:
                          </label>
                          <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="form-input border-error focus:border-error focus:ring-error"
                            placeholder="Enter your password"
                          />
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={(securityLoading || privacyLoading || deletionLoading) || !deletePassword}
                            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {(securityLoading || privacyLoading || deletionLoading) ? 'Deleting...' : 'Confirm Delete'}
                          </button>
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeletePassword('');
                            }}
                            className="btn-secondary"
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
  );
};

export default Security;
