import React, { useMemo, useState } from 'react';
import { Bell, Filter, CheckSquare, Loader2 } from 'lucide-react';
import { useNotifications, useNotificationActions, NotificationType } from '../hooks/useNotifications';
import NotificationList from '../components/notifications/NotificationList';
import NotificationSettings from '../components/notifications/NotificationSettings';

type TabKey = 'inbox' | 'settings';

const typeOptions: { label: string; value?: NotificationType }[] = [
  { label: 'All types' },
  { label: 'New post', value: 'new_post' },
  { label: 'New comment', value: 'new_comment' },
  { label: 'New follower', value: 'new_follower' },
  { label: 'Suggested creators', value: 'suggestion_creator' },
  { label: 'Suggested content', value: 'suggestion_content' },
  { label: 'Messages', value: 'message' },
  { label: 'Billing success', value: 'billing_success' },
  { label: 'Billing failure', value: 'billing_failure' },
  { label: 'Payment expiring', value: 'billing_expiring' },
];

const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('inbox');
  const [isRead, setIsRead] = useState<boolean | undefined>(undefined);
  const [type, setType] = useState<NotificationType | undefined>(undefined);
  const [page, setPage] = useState(1);
  const limit = 20;

  const filters = useMemo(() => ({ isRead, type, page, limit }), [isRead, type, page]);
  const { notifications, pagination, isLoading, isError, refetch } = useNotifications(filters);
  const { markAllRead } = useNotificationActions(filters);

  const handleMarkAll = async () => {
    await markAllRead.mutateAsync();
    setPage(1);
    refetch();
  };

  const totalPages = pagination?.pages ?? 1;

  return (
    <div className="page-section min-h-screen py-6">
      <div className="container-app">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow-accent">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
              <p className="text-text-muted text-sm">Stay updated with your activity and billing alerts</p>
            </div>
          </div>

          {activeTab === 'inbox' && (
            <button
              onClick={handleMarkAll}
              disabled={markAllRead.isPending || isLoading}
              className="btn-secondary-sm flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {markAllRead.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Marking...</span>
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  <span>Mark all as read</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="mb-4">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'inbox'
                  ? 'bg-void-accent text-text-on-dark shadow-glow-accent'
                  : 'bg-background-card text-text-secondary hover:text-text-primary border border-border-secondary'
              }`}
            >
              Inbox
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-void-accent text-text-on-dark shadow-glow-accent'
                  : 'bg-background-card text-text-secondary hover:text-text-primary border border-border-secondary'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {activeTab === 'inbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <aside className="lg:col-span-4">
              <div className="card">
                <div className="flex items-center space-x-2 mb-4">
                  <Filter className="h-4 w-4 text-text-secondary" />
                  <h3 className="text-text-primary font-semibold">Filters</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="form-label">Read status</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setIsRead(undefined);
                          setPage(1);
                        }}
                        className={`btn-ghost-sm ${
                          isRead === undefined ? 'bg-void-accent/10 text-text-primary' : ''
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setIsRead(false);
                          setPage(1);
                        }}
                        className={`btn-ghost-sm ${
                          isRead === false ? 'bg-void-accent/10 text-text-primary' : ''
                        }`}
                      >
                        Unread
                      </button>
                      <button
                        onClick={() => {
                          setIsRead(true);
                          setPage(1);
                        }}
                        className={`btn-ghost-sm ${
                          isRead === true ? 'bg-void-accent/10 text-text-primary' : ''
                        }`}
                      >
                        Read
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={type ?? ''}
                      onChange={(e) => {
                        const v = e.target.value as NotificationType | '';
                        setType(v === '' ? undefined : v);
                        setPage(1);
                      }}
                    >
                      {typeOptions.map((opt) => (
                        <option key={opt.label} value={opt.value ?? ''}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </aside>

            <section className="lg:col-span-8">
              {isError ? (
                <div className="card">
                  <div className="alert alert-error">
                    <p>Failed to load notifications. Please try again.</p>
                  </div>
                </div>
              ) : (
                <>
                  <NotificationList
                    notifications={notifications}
                    isLoading={isLoading}
                    onChange={(changed) => {
                      // keep page; simply refetch list after change is handled within hooks
                      if (changed) refetch();
                    }}
                  />
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        className="btn-secondary-sm"
                        disabled={page <= 1 || isLoading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </button>
                      <p className="text-text-secondary text-sm">
                        Page {pagination?.page ?? page} of {totalPages}
                      </p>
                      <button
                        className="btn-secondary-sm"
                        disabled={page >= totalPages || isLoading}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-8">
              <NotificationSettings />
            </section>
            <aside className="lg:col-span-4">
              <div className="card">
                <h3 className="text-lg font-semibold text-text-primary mb-2">About notifications</h3>
                <p className="text-text-muted text-sm">
                  Control how you receive updates. Billing alerts are recommended to stay informed about payments and
                  renewals. You can fine-tune categories at any time.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;