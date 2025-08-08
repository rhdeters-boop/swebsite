import React from 'react';
import { CheckCircle2, Bell, MessageSquare, CreditCard, AlertTriangle, Info } from 'lucide-react';
import { NotificationItem as NotificationItemType, NotificationType } from '../../hooks/useNotifications';

interface Props {
  item: NotificationItemType;
  onMarkRead?: (id: string) => void;
}

const typeMeta: Record<
  NotificationType,
  { label: string; icon: React.ReactNode; badgeClass: string }
> = {
  new_post: {
    label: 'New Post',
    icon: <Bell className="h-4 w-4" />,
    badgeClass: 'badge-primary',
  },
  new_comment: {
    label: 'New Comment',
    icon: <MessageSquare className="h-4 w-4" />,
    badgeClass: 'badge-secondary',
  },
  new_follower: {
    label: 'New Follower',
    icon: <Bell className="h-4 w-4" />,
    badgeClass: 'badge-primary',
  },
  suggestion_creator: {
    label: 'Suggested Creator',
    icon: <Info className="h-4 w-4" />,
    badgeClass: 'badge',
  },
  suggestion_content: {
    label: 'Suggested Content',
    icon: <Info className="h-4 w-4" />,
    badgeClass: 'badge',
  },
  message: {
    label: 'Message',
    icon: <MessageSquare className="h-4 w-4" />,
    badgeClass: 'badge',
  },
  billing_success: {
    label: 'Payment Succeeded',
    icon: <CreditCard className="h-4 w-4" />,
    badgeClass: 'badge-success',
  },
  billing_failure: {
    label: 'Payment Failed',
    icon: <AlertTriangle className="h-4 w-4" />,
    badgeClass: 'badge-error',
  },
  billing_expiring: {
    label: 'Upcoming Charge',
    icon: <CreditCard className="h-4 w-4" />,
    badgeClass: 'badge-warning',
  },
};

function formatDate(d: string) {
  try {
    const date = new Date(d);
    return date.toLocaleString();
  } catch {
    return d;
  }
}

const NotificationItem: React.FC<Props> = ({ item, onMarkRead }) => {
  const meta = typeMeta[item.type];

  return (
    <div className={`card ${item.isRead ? '' : 'border-border-primary'} hover:shadow-card-hover transition-all`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5 text-void-accent-light">
          {meta?.icon ?? <Bell className="h-4 w-4" />}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge ${meta?.badgeClass ?? 'badge-secondary'}`}>
              {meta?.label ?? item.type}
            </span>
            {!item.isRead && (
              <span className="badge-warning">New</span>
            )}
          </div>

          <p className="text-text-primary">{item.content}</p>

          <div className="mt-2 flex items-center justify-between text-text-muted text-sm">
            <span>{formatDate(item.createdAt)}</span>
            {!item.isRead && (
              <button
                onClick={() => onMarkRead?.(item.id)}
                className="btn-ghost-sm inline-flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;