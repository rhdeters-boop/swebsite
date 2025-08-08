import React from 'react';
import { AlertCircle, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCancelSubscription, useSubscriptions } from '../../hooks/useBilling';

const SubscriptionRow: React.FC<{
  sub: any;
  onCancel: (id: string, immediate?: boolean) => void;
  isCancelling: boolean;
}> = ({ sub, onCancel, isCancelling }) => {
  const statusBadge = (() => {
    const base = 'px-2 py-1 text-xs rounded-full';
    switch (sub.status) {
      case 'active':
        return base + ' bg-success/20 text-success';
      case 'canceled':
        return base + ' bg-error/20 text-error';
      case 'past_due':
      case 'unpaid':
        return base + ' bg-warning/20 text-warning';
      default:
        return base + ' bg-text-muted/20 text-text-secondary';
    }
  })();

  return (
    <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-3 animate-fade-in" role="listitem">
      <div>
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-text-primary">{sub.tier || 'Subscription'}</h4>
          <span className={statusBadge} aria-label={`Status ${String(sub.status).replace('_', ' ')}`}>
            {String(sub.status).replace('_', ' ')}
          </span>
        </div>
        <div className="mt-2 text-sm text-text-secondary space-x-3">
          {sub.price ? <span>${sub.price}/month</span> : null}
          {sub.currentPeriodEnd ? (
            <span>Renews: {new Date(sub.currentPeriodEnd).toLocaleDateString()}</span>
          ) : sub.nextBilling ? (
            <span>Next billing: {new Date(sub.nextBilling).toLocaleDateString()}</span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {sub.status === 'active' && (
          <>
            <button
              onClick={() => onCancel(sub.id, false)}
              disabled={isCancelling}
              className="btn-secondary-sm disabled:opacity-50"
              aria-label={`Cancel ${sub.tier || 'subscription'} at period end`}
            >
              {isCancelling ? 'Updating…' : 'Cancel at period end'}
            </button>
            <button
              onClick={() => onCancel(sub.id, true)}
              disabled={isCancelling}
              className="btn-ghost-sm text-error hover:text-error-600"
              aria-label={`Cancel ${sub.tier || 'subscription'} immediately`}
              title="Cancel immediately"
            >
              {isCancelling ? 'Updating…' : 'Cancel immediately'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const SubscriptionTab: React.FC = () => {
  const { current, history, isLoading, isError } = useSubscriptions();
  const cancelSub = useCancelSubscription();

  const onCancel = (id: string, immediate?: boolean) => {
    cancelSub.mutate({ id, immediate });
  };

  if (isLoading) {
    return <div className="card loading-shimmer h-28" role="status" aria-live="polite" aria-busy="true" />;
  }

  if (isError) {
    return (
      <div className="alert alert-error flex items-center gap-2" role="alert">
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <span>Failed to load subscriptions. Please try again later.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live region for cancellation updates */}
      <div className="sr-only" role="status" aria-live="polite">
        {cancelSub.isPending ? 'Updating subscription…' : cancelSub.isSuccess ? 'Subscription updated.' : ''}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Current Subscription</h3>
        {current ? (
          <div role="list" aria-label="Current subscription">
            <SubscriptionRow
              sub={current}
              onCancel={onCancel}
              isCancelling={cancelSub.isPending}
            />
          </div>
        ) : (
          <div className="card text-center py-10 animate-fade-in">
            <Layers className="h-10 w-10 text-text-muted mx-auto mb-3" aria-hidden="true" />
            <p className="text-text-secondary mb-3">No active subscription</p>
            <Link to="/creators" className="btn-primary-sm inline-flex items-center gap-2">
              Explore creators
            </Link>
          </div>
        )}
      </div>

      <div className="border-t border-border-secondary pt-6">
        <h3 className="text-lg font-semibold text-text-primary mb-3">Subscription History</h3>
        {history && history.length > 0 ? (
          <div className="space-y-3" role="list" aria-label="Subscription history">
            {history.map((sub) => (
              <div key={sub.id} className="card animate-fade-in" role="listitem">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-text-primary">{sub.tier || 'Subscription'}</h4>
                      <span className="text-xs text-text-secondary">
                        {new Date(sub.createdAt || sub.startDate || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-text-secondary">
                      Status: <span className="capitalize">{String(sub.status).replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-10 animate-fade-in">
            <Layers className="h-10 w-10 text-text-muted mx-auto mb-3" aria-hidden="true" />
            <p className="text-text-secondary">No past subscriptions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionTab;