import React from 'react';
import { NotificationItem as NotificationItemType } from '../../hooks/useNotifications';
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
      <div className="space-y-3">
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
      <div className="card text-center py-12">
        <p className="text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onMarkRead={onMarkRead ? () => onMarkRead(n.id) : undefined}
        />
      ))}
    </div>
  );
};

export default NotificationList;