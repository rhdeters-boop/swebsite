import { useState, useEffect } from 'react';
import { subscriptionsApi, type SubscriptionData, type FrontendCreator } from '../utils/api';

interface UseSubscriptionsReturn {
  subscriptions: SubscriptionData[];
  followedCreators: FrontendCreator[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Convert subscription data to frontend creator format for compatibility
const convertSubscriptionToCreator = (subscription: SubscriptionData): FrontendCreator => ({
  id: subscription.creator.id,
  name: subscription.creator.displayName || subscription.creator.user.displayName,
  image: subscription.creator.profilePicture || '/placeholder-avatar.jpg',
  likes: 0, // This would need to come from creator analytics
  subscribers: '0', // This would need to come from creator data
  isOnline: false, // This would need to be determined from user status
  username: subscription.creator.user.username,
  isCreator: true,
  subscriptionType: getSubscriptionTier(subscription.tier),
});

const getSubscriptionTier = (tier: string): 'free' | 'basic' | 'premium' => {
  switch (tier) {
    case 'picture':
      return 'basic';
    case 'solo_video':
      return 'premium';
    case 'collab_video':
      return 'premium';
    default:
      return 'free';
  }
};

export const useSubscriptions = (): UseSubscriptionsReturn => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await subscriptionsApi.getUserCreatorSubscriptions();
      setSubscriptions(response.subscriptions);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Failed to load subscriptions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Convert subscriptions to creator format for compatibility with existing components
  const followedCreators = subscriptions.map(convertSubscriptionToCreator);

  // Group by subscription type for Following page
  const groupedCreators = {
    recent: followedCreators.slice(0, 5), // Most recent 5
    premium: followedCreators.filter(c => c.subscriptionType === 'premium'),
    free: followedCreators.filter(c => c.subscriptionType === 'free'),
    basic: followedCreators.filter(c => c.subscriptionType === 'basic'),
  };

  return {
    subscriptions,
    followedCreators: groupedCreators.recent,
    loading,
    error,
    refetch: fetchSubscriptions,
  };
};

// Separate hook for grouped subscriptions used in Following page
export const useFollowedCreators = () => {
  const { subscriptions, loading, error, refetch } = useSubscriptions();

  const followedCreators = subscriptions.map(convertSubscriptionToCreator);

  return {
    recent: followedCreators.slice(0, 5),
    premium: followedCreators.filter(c => c.subscriptionType === 'premium'),
    free: followedCreators.filter(c => c.subscriptionType === 'free'),
    basic: followedCreators.filter(c => c.subscriptionType === 'basic'),
    loading,
    error,
    refetch,
  };
};
