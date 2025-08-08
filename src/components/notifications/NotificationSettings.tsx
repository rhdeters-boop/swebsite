import React, { useMemo } from 'react';
import { useNotificationSettings } from '../../hooks/useNotifications';

type ToggleKey =
  | 'emailNotifications'
  | 'websiteNotifications'
  | 'newPost'
  | 'newComment'
  | 'suggestedCreators'
  | 'suggestedContent'
  | 'messages'
  | 'billing';

interface NotificationSettingsProps {
  className?: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className = '' }) => {
  const { settings, isLoading, isError, updateSettings } = useNotificationSettings();

  const toggles = useMemo(() => {
    return [
      {
        id: 'emailNotifications' as ToggleKey,
        label: 'Email Notifications',
        description: 'Receive important updates via email.',
        checked: settings?.emailNotifications?.enabled !== false,
        onChange: (val: boolean) => {
          updateSettings.mutate({
            emailNotifications: { enabled: val },
          });
        },
      },
      {
        id: 'websiteNotifications' as ToggleKey,
        label: 'Website Notifications',
        description: 'Show in-app notifications.',
        checked: settings?.websiteNotifications?.enabled !== false,
        onChange: (val: boolean) => {
          updateSettings.mutate({
            websiteNotifications: { enabled: val },
          });
        },
      },
      {
        id: 'newPost' as ToggleKey,
        label: 'When someone you follow posts',
        description: 'Get notified when creators you follow publish new content.',
        checked: settings?.newPost !== false,
        onChange: (val: boolean) => updateSettings.mutate({ newPost: val }),
      },
      {
        id: 'newComment' as ToggleKey,
        label: 'When someone comments',
        description: 'Get notified about new comments.',
        checked: settings?.newComment !== false,
        onChange: (val: boolean) => updateSettings.mutate({ newComment: val }),
      },
      {
        id: 'suggestedCreators' as ToggleKey,
        label: 'Suggested creators',
        description: 'Receive suggestions for new creators.',
        checked: settings?.suggestedCreators !== false,
        onChange: (val: boolean) => updateSettings.mutate({ suggestedCreators: val }),
      },
      {
        id: 'suggestedContent' as ToggleKey,
        label: 'Suggested content',
        description: 'Get recommendations based on your activity.',
        checked: settings?.suggestedContent !== false,
        onChange: (val: boolean) => updateSettings.mutate({ suggestedContent: val }),
      },
      {
        id: 'messages' as ToggleKey,
        label: 'Messages',
        description: 'Direct messages and important announcements.',
        checked: settings?.messages !== false,
        onChange: (val: boolean) => updateSettings.mutate({ messages: val }),
      },
      {
        id: 'billing' as ToggleKey,
        label: 'Billing',
        description: 'Payments, renewals, and expiring method alerts.',
        checked: settings?.billing !== false,
        onChange: (val: boolean) => updateSettings.mutate({ billing: val }),
      },
    ];
  }, [settings, updateSettings]);

  if (isLoading) {
    return (
      <div className={`card animate-fade-in ${className}`}>
        <div className="h-6 w-48 loading-shimmer rounded mb-4" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded bg-background-card/80 border border-border-secondary loading-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`card animate-fade-in ${className}`}>
        <div className="alert alert-error">
          <p>Failed to load notification settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card animate-fade-in ${className}`}>
      <h3 className="text-lg font-semibold text-text-primary mb-4">Notification Preferences</h3>
      <div className="space-y-3" role="list" aria-label="Notification preferences">
        {toggles.map((t) => {
          const titleId = `label-${t.id}`;
          const descId = `desc-${t.id}`;
          return (
            <div
              key={t.id}
              className="flex items-center justify-between p-4 border border-border-secondary rounded-xl bg-background-card/50"
              role="listitem"
            >
              <div className="mr-4">
                <p id={titleId} className="font-medium text-text-primary">{t.label}</p>
                <p id={descId} className="text-sm text-text-muted">{t.description}</p>
              </div>
              <button
                onClick={() => t.onChange(!t.checked)}
                disabled={updateSettings.isPending}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus-ring ${
                  t.checked ? 'bg-void-accent' : 'bg-void-dark-300'
                } ${updateSettings.isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
                role="switch"
                aria-checked={t.checked}
                aria-labelledby={titleId}
                aria-describedby={descId}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    t.checked ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
      {updateSettings.isError && (
        <div className="mt-4 alert alert-error">
          <p>Failed to update settings. Please try again.</p>
        </div>
      )}
      {updateSettings.isSuccess && (
        <div className="mt-4 alert alert-success">
          <p>Settings updated.</p>
        </div>
      )}
      <div aria-live="polite" role="status" className="sr-only">
        {updateSettings.isPending ? 'Updating settings…' : updateSettings.isSuccess ? 'Settings updated.' : ''}
      </div>
    </div>
  );
};

export default NotificationSettings;