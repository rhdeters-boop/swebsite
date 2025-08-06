import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface CreatorResponse {
  success: boolean;
  creator: any;
}

export const useCreatorProfile = (creatorId: string | undefined, isAuthenticated: boolean) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Determine if creatorId is a username or UUID
  const isUsername = creatorId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(creatorId);

  // Fetch creator profile
  const { data: creatorData, isLoading, error } = useQuery<CreatorResponse>({
    queryKey: ['creator', creatorId, isUsername ? 'username' : 'id'],
    queryFn: async () => {
      const url = isUsername 
        ? `/api/creators/username/${creatorId}`
        : `/api/creators/${creatorId}`;
      
      const response = await fetch(url, {
        headers: isAuthenticated ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Creator not found');
        }
        throw new Error('Failed to fetch creator profile');
      }

      return response.json();
    },
    enabled: !!creatorId,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const actualCreatorId = creatorData?.creator?.id;
      if (!actualCreatorId) {
        throw new Error('Creator ID not available');
      }

      const response = await fetch(`/api/creators/${actualCreatorId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to follow creator');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', creatorId, isUsername ? 'username' : 'id'] });
    },
  });

  // Handler functions
  const handleFollow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    followMutation.mutate();
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/creator/${creatorId}/subscribe`);
  };

  const handleTip = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/creator/${creatorId}/tip`);
  };

  return {
    creatorData,
    isLoading,
    error,
    followMutation,
    handleFollow,
    handleSubscribe,
    handleTip
  };
};
