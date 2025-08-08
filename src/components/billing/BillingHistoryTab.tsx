import React, { useMemo, useState } from 'react';
import { AlertCircle, Loader2, Receipt, RotateCcw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PaymentHistoryItem, PaymentType, useBillingHistory, useRequestRefund } from '../../hooks/useBilling';

const TypeFilter: React.FC<{
  value: PaymentType | '' ;
  onChange: (v: PaymentType | '') => void;
}> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-secondary">Filter:</span>
      <select
        className="form-select w-44"
        value={value}
        onChange={(e) => onChange((e.target.value || '') as PaymentType | '')}
      >
        <option value="">All</option>
        <option value="subscription">Subscriptions</option>
        <option value="tip">Tips</option>
        <option value="one_time">One-time</option>
      </select>
    </div>
  );
};

const RefundPanel: React.FC<{
  payment: PaymentHistoryItem;
  onCancel: () => void;
  onSubmit: (paymentId: string, reason?: string) => void;
  submitting: boolean;
}> = ({ payment, onCancel, onSubmit, submitting }) => {
  const [reason, setReason] = useState<string>('');
  return (
    <div className="mt-4 border-t border-border-secondary pt-4">
      <p className="text-sm text-text-secondary mb-2">
        Optional: Describe the reason for your refund request (max 500 chars)
      </p>
      <textarea
        className="form-textarea"
        rows={3}
        maxLength={500}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="E.g., duplicate charge, incorrect amount, etc."
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => onSubmit(payment.id, reason?.trim() || undefined)}
          disabled={submitting}
          className="btn-primary-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>
        <button onClick={onCancel} disabled={submitting} className="btn-secondary-sm disabled:opacity-50">
          Cancel
        </button>
      </div>
      <p className="text-xs text-text-muted mt-2">
        Note: Approved refunds may take 5–10 business days to appear on your statement.
      </p>
    </div>
  );
};

const PaymentRow: React.FC<{
  item: PaymentHistoryItem;
  onRefundClick: (id: string) => void;
  showRefund: boolean;
  onCancelRefund: () => void;
  onSubmitRefund: (paymentId: string, reason?: string) => void;
  refundSubmitting: boolean;
}> = ({ item, onRefundClick, showRefund, onCancelRefund, onSubmitRefund, refundSubmitting }) => {
  const amount = useMemo(() => (item.amount / 100).toFixed(2), [item.amount]);

  const statusBadge = (() => {
    const base = 'px-2 py-1 text-xs rounded-full';
    switch (item.status) {
      case 'succeeded':
        return base + ' bg-success/20 text-success';
      case 'failed':
      case 'canceled':
        return base + ' bg-error/20 text-error';
      case 'processing':
      case 'requires_action':
        return base + ' bg-warning/20 text-warning';
      default:
        return base + ' bg-text-muted/20 text-text-secondary';
    }
  })();

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg border border-border-secondary bg-background-secondary flex items-center justify-center">
            <Receipt className="h-5 w-5 text-text-secondary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-text-primary">
                {item.description || (item.type === 'subscription' ? 'Subscription payment' : item.type === 'tip' ? 'Tip' : 'Payment')}
              </h4>
              <span className={statusBadge}>{String(item.status).replace('_', ' ')}</span>
              {item.refunded ? (
                <span className="px-2 py-1 text-xs rounded-full bg-void-accent/20 text-void-accent-light">Refunded</span>
              ) : null}
            </div>
            <div className="mt-1 text-sm text-text-secondary space-x-3">
              <span>${amount}</span>
              <span>•</span>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
              {item.type ? (
                <>
                  <span>•</span>
                  <span className="capitalize">{String(item.type).replace('_', ' ')}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!item.refunded && item.status === 'succeeded' && (
            <button
              onClick={() => onRefundClick(item.id)}
              className="btn-ghost-sm inline-flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Request refund
            </button>
          )}
        </div>
      </div>

      {showRefund && (
        <RefundPanel
          payment={item}
          onCancel={onCancelRefund}
          onSubmit={onSubmitRefund}
          submitting={refundSubmitting}
        />
      )}
    </div>
  );
};

const Pager: React.FC<{
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}> = ({ page, pages, onPageChange }) => {
  if (!pages || pages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="btn-secondary-sm disabled:opacity-50 inline-flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </button>
      <div className="text-sm text-text-secondary">
        Page {page} of {pages}
      </div>
      <button
        onClick={() => onPageChange(Math.min(pages, page + 1))}
        disabled={page >= pages}
        className="btn-secondary-sm disabled:opacity-50 inline-flex items-center gap-2"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

const BillingHistoryTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<PaymentType | ''>('');
  const { payments, pagination, isLoading, isError } = useBillingHistory({ page, limit: 10, type: type || undefined });
  const refund = useRequestRefund();

  const [refundOpenForId, setRefundOpenForId] = useState<string | null>(null);

  const handleRefundClick = (id: string) => {
    setRefundOpenForId((prev) => (prev === id ? null : id));
  };

  const handleCancelRefund = () => {
    setRefundOpenForId(null);
  };

  const handleSubmitRefund = async (paymentId: string, reason?: string) => {
    try {
      await refund.mutateAsync({ paymentId, reason });
      setRefundOpenForId(null);
    } catch {
      // errors surfaced via query tooling or can add inline alerts
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Billing History</h3>
        <TypeFilter value={type} onChange={(v) => { setType(v); setPage(1); }} />
      </div>

      {isLoading && (
        <>
          <div className="card loading-shimmer h-24" />
          <div className="card loading-shimmer h-24" />
        </>
      )}

      {isError && (
        <div className="alert alert-error flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to load billing history.</span>
        </div>
      )}

      {!isLoading && !isError && payments.length === 0 && (
        <div className="card text-text-secondary">No payments found.</div>
      )}

      <div className="space-y-3">
        {payments.map((p) => (
          <PaymentRow
            key={p.id}
            item={p}
            onRefundClick={handleRefundClick}
            showRefund={refundOpenForId === p.id}
            onCancelRefund={handleCancelRefund}
            onSubmitRefund={handleSubmitRefund}
            refundSubmitting={refund.isPending}
          />
        ))}
      </div>

      {pagination && (
        <Pager
          page={pagination.page}
          pages={pagination.pages}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
};

export default BillingHistoryTab;