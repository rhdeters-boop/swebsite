import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Types
export type NotificationType =
  | 'new_post'
  | 'new_comment'
  | 'new_follower'
  | 'suggestion_creator'
  | 'suggestion_content'
  | 'message'
  | 'billing_success'
  | 'billing_failure'
  | 'billing_expiring';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  content: string;
  isRead: boolean;
  relatedId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  id?: string;
  userId?: string;
  // Global toggles
  emailNotifications?: { enabled: boolean };
  websiteNotifications?: { enabled: boolean };
  // Categories
  newPost?: boolean;
  newComment?: boolean;
  suggestedCreators?: boolean;
  suggestedContent?: boolean;
  messages?: boolean;
  billing?: boolean;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Query keys
const qk = {
  notifications: (filters: { isRead?: boolean; type?: NotificationType; page?: number; limit?: number }) => ['notifications', filters] as const,
  settings: ['notifications', 'settings'] as const,
};

// API helpers
const getNotifications = async (params: { isRead?: boolean; type?: NotificationType; page?: number; limit?: number }) => {
  const res = await axios.get('/notifications', { params });
  return res.data as { success: boolean } & NotificationsResponse;
};

const getSettings = async () => {
  const res = await axios.get('/notifications/settings');
  return res.data as { success: boolean; settings: NotificationSettings };
};

const putSettings = async (payload: Partial<NotificationSettings>) => {
  const res = await axios.put('/notifications/settings', payload);
  return res.data as { success: boolean; message: string; settings: NotificationSettings };
};

const postMarkRead = async (id: string) => {
  const res = await axios.post(`/notifications/${id}/read`);
  return res.data as { success: boolean; message: string };
};

const postMarkAllRead = async () => {
  const res = await axios.post('/notifications/read-all');
  return res.data as { success: boolean; message: string };
};

// Hooks
export function useNotifications(filters: { isRead?: boolean; type?: NotificationType; page?: number; limit?: number } = {}) {
  const query = useQuery({
    queryKey: qk.notifications(filters),
    queryFn: () => getNotifications(filters),
    keepPreviousData: true,
  });
  return {
    ...query,
    notifications: query.data?.notifications ?? [],
    pagination: query.data?.pagination,
  };
}

export function useNotificationSettings() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: qk.settings,
    queryFn: getSettings,
  });

  const updateSettings = useMutation({
    mutationFn: putSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.settings });
    },
  });

  return {
    ...query,
    settings: query.data?.settings,
    updateSettings,
  };
}

export function useNotificationActions(filtersForInvalidate?: { isRead?: boolean; type?: NotificationType; page?: number; limit?: number }) {
  const qc = useQueryClient();

  const markRead = useMutation({
    mutationFn: postMarkRead,
    onSuccess: () => {
      if (filtersForInvalidate) {
        qc.invalidateQueries({ queryKey: qk.notifications(filtersForInvalidate) });
      } else {
        qc.invalidateQueries({ queryKey: ['notifications'] });
      }
    },
  });

  const markAllRead = useMutation({
    mutationFn: postMarkAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return { markRead, markAllRead };
}