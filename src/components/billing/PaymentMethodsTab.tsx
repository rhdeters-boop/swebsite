import React, { useMemo, useState } from 'react';
import { CreditCard, Plus, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCreateSetupIntent, useDeletePaymentMethod, usePaymentMethods } from '../../hooks/useBilling';
import { useQueryClient } from '@tanstack/react-query';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

// Inline form used inside the Elements wrapper to confirm setup
const AddPaymentMethodForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const qc = useQueryClient();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!stripe || !elements) return;
    setSubmitting(true);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        // Optionally provide a return_url if you want redirect flow
      },
      redirect: 'if_required',
    });

    if (error) {
      setError(error.message || 'Failed to add payment method. Please try again.');
      setSubmitting(false);
      return;
    }

    // If setupIntent is succeeded or requires no further action, close and refresh list
    if (setupIntent?.status === 'succeeded' || setupIntent?.status === 'processing' || setupIntent?.status === 'requires_confirmation') {
      await qc.invalidateQueries({ queryKey: ['billing', 'payment-methods'] });
      setSubmitting(false);
      onClose();
    } else {
      setError('Payment method setup was not completed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-lg border border-border-secondary bg-background-card">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div className="alert alert-error flex items-center space-x-2">
          <XCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!stripe || !elements || submitting}
          className="btn-primary-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {submitting ? 'Saving...' : 'Save Payment Method'}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="btn-secondary-sm disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const PaymentMethodsTab: React.FC = () => {
  const { paymentMethods, isLoading, isError } = usePaymentMethods();
  const createSetupIntent = useCreateSetupIntent();
  const deleteMethod = useDeletePaymentMethod();

  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const isAdding = useMemo(() => !!clientSecret, [clientSecret]);

  const handleStartAdd = async () => {
    try {
      const res = await createSetupIntent.mutateAsync();
      setClientSecret(res.clientSecret);
    } catch {
      // handled in UI via mutate error states if needed
    }
  };

  const handleCloseAdd = () => {
    setClientSecret(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Saved Payment Methods</h3>
        {!isAdding && (
          <button
            onClick={handleStartAdd}
            disabled={createSetupIntent.isPending}
            className="btn-secondary-sm flex items-center gap-2 disabled:opacity-50"
          >
            {createSetupIntent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {createSetupIntent.isPending ? 'Preparing…' : 'Add Payment Method'}
          </button>
        )}
      </div>

      {isAdding && clientSecret && (
        <div className="card space-y-4 border border-border-primary">
          <h4 className="font-medium text-text-primary">Add a new payment method</h4>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <AddPaymentMethodForm onClose={handleCloseAdd} />
          </Elements>
        </div>
      )}

      <div className="space-y-3">
        {isLoading && (
          <div className="card loading-shimmer h-24"></div>
        )}
        {isError && (
          <div className="alert alert-error">Failed to load payment methods.</div>
        )}

        {!isLoading && !isError && paymentMethods.length === 0 && !isAdding && (
          <div className="card text-center py-10">
            <CreditCard className="h-10 w-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary mb-3">No saved payment methods</p>
            <button onClick={handleStartAdd} className="btn-primary-sm inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Payment Method
            </button>
          </div>
        )}

        {paymentMethods.map((pm) => (
          <div key={pm.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-background-secondary rounded border border-border-secondary flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-text-secondary" />
              </div>
              <div>
                <p className="font-medium text-text-primary">
                  {pm.type === 'card'
                    ? `${pm.card?.brand?.toUpperCase() || 'CARD'} •••• ${pm.card?.last4 || '••••'}`
                    : 'Payment Method'}
                </p>
                {pm.type === 'card' && (
                  <p className="text-sm text-text-secondary">
                    Expires {pm.card?.expMonth?.toString().padStart(2, '0')}/{pm.card?.expYear}
                  </p>
                )}
                {pm.isDefault && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-void-accent/20 text-void-accent-light rounded-full">
                    Default
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => deleteMethod.mutate(pm.id)}
                disabled={deleteMethod.isPending}
                className="text-error hover:text-error-600 p-2 rounded-md hover:bg-error/10 disabled:opacity-50"
                title="Remove payment method"
              >
                {deleteMethod.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodsTab;