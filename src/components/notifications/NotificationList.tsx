import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Sparkles } from 'lucide-react';
import type { NotificationItem as NotificationItemType } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: NotificationItemType[];
  isLoading?: boolean;
  onMarkRead?: (id: string) => void;
  emptyMessage?: string;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading = false,
  onMarkRead,
  emptyMessage = 'No notifications yet.',
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-background-card/80 border border-border-secondary loading-shimmer"
          />
        ))}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="card text-center py-12 animate-fade-in" role="status" aria-live="polite">
        <Bell className="h-10 w-10 text-text-muted mx-auto mb-3" aria-hidden="true" />
        <p className="text-text-secondary mb-3">{emptyMessage}</p>
        <Link to="/creators" className="btn-primary-sm inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Explore creators
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-live="polite">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          item={n}
          onMarkRead={onMarkRead ? () => onMarkRead(n.id) : undefined}
        />
      ))}
    </div>
  );
};

export default NotificationList;