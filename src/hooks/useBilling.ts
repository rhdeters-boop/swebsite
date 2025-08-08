import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types
export interface SubscriptionItem {
  id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'unpaid' | string;
  tier?: string;
  price?: number;
  startDate?: string;
  nextBilling?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string | null;
  stripeSubscriptionId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentType = 'tip' | 'subscription' | 'one_time';

export interface PaymentHistoryItem {
  id: string;
  userId: string;
  creatorId?: string | null;
  subscriptionId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeInvoiceId?: string | null;
  amount: number; // cents
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'processing' | 'requires_action';
  type: PaymentType;
  description?: string | null;
  refunded?: boolean;
  refundedAmount?: number;
  metadata?: Record<string, any>;
  processedAt?: string | null;
  createdAt: string;
}

export interface PaymentMethodItem {
  id: string;
  type: 'card' | string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Query keys
const qk = {
  subscriptions: ['billing', 'subscriptions'] as const,
  history: (filters: { page?: number; limit?: number; type?: PaymentType }) =>
    ['billing', 'history', filters] as const,
  paymentMethods: ['billing', 'payment-methods'] as const,
};

// API calls
const fetchSubscriptions = async () => {
  const res = await axios.get('/billing/subscriptions');
  return res.data as {
    success: boolean;
    currentSubscription: SubscriptionItem | null;
    history: SubscriptionItem[];
  };
};

const fetchHistory = async (params: { page?: number; limit?: number; type?: PaymentType }) => {
  const res = await axios.get('/billing/history', { params });
  return res.data as {
    success: boolean;
    payments: PaymentHistoryItem[];
    pagination: Pagination;
  };
};

const fetchPaymentMethods = async () => {
  const res = await axios.get('/billing/payment-methods');
  return res.data as { success: boolean; paymentMethods: PaymentMethodItem[] };
};

const postCancelSubscription = async (payload: { id: string; immediate?: boolean }) => {
  const res = await axios.post(`/billing/subscriptions/${payload.id}/cancel`, {
    immediate: payload.immediate ?? false,
  });
  return res.data as {
    success: boolean;
    message: string;
    subscription: SubscriptionItem;
  };
};

const postRefundRequest = async (payload: { paymentId: string; reason?: string }) => {
  const res = await axios.post('/billing/refund-request', payload);
  return res.data as {
    success: boolean;
    message: string;
    refunded: boolean;
    refundStatus?: string;
  };
};

const postCreateSetupIntent = async () => {
  const res = await axios.post('/billing/payment-methods');
  return res.data as { success: boolean; clientSecret: string; setupIntentId: string };
};

const deletePaymentMethod = async (paymentMethodId: string) => {
  const res = await axios.delete(`/billing/payment-methods/${paymentMethodId}`);
  return res.data as { success: boolean; message: string };
};

// Hooks
export function useSubscriptions() {
  const query = useQuery({
    queryKey: qk.subscriptions,
    queryFn: fetchSubscriptions,
  });

  return {
    ...query,
    current: query.data?.currentSubscription ?? null,
    history: query.data?.history ?? [],
  };
}

export function useBillingHistory(filters: { page?: number; limit?: number; type?: PaymentType } = {}) {
  const query = useQuery({
    queryKey: qk.history(filters),
    queryFn: () => fetchHistory(filters),
    keepPreviousData: true,
  });

  return {
    ...query,
    payments: query.data?.payments ?? [],
    pagination: query.data?.pagination,
  };
}

export function usePaymentMethods() {
  const query = useQuery({
    queryKey: qk.paymentMethods,
    queryFn: fetchPaymentMethods,
  });

  return {
    ...query,
    paymentMethods: query.data?.paymentMethods ?? [],
  };
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postCancelSubscription,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.subscriptions });
      qc.invalidateQueries({ queryKey: ['billing'] });
    },
  });
}

export function useRequestRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postRefundRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing', 'history'] });
    },
  });
}

export function useCreateSetupIntent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postCreateSetupIntent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.paymentMethods });
    },
  });
}

export function useDeletePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.paymentMethods });
    },
  });
}