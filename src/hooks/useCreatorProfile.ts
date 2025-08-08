import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

type MediaPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

interface CreatorQueryResponse {
  success: boolean;
  creator: any;
  mediaPagination?: MediaPagination;
}

const isUuid = (val?: string) =>
  !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export const useCreatorProfile = (
  creatorId: string | undefined,
  isAuthenticated: boolean,
  page: number = 1,
  limit: number = 24
) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Determine if creatorId is a username or UUID
  const isUsername = creatorId && !isUuid(creatorId);

  const headers = isAuthenticated
    ? { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
    : undefined;

  const buildUrl = (p: number, l: number) =>
    (isUsername
      ? `/api/creators/username/${creatorId}`
      : `/api/creators/${creatorId}`) + `?page=${p}&limit=${l}`;

  // Fetch creator profile (server-paginated media)
  const {
    data: creatorData,
    isLoading,
    error,
  } = useQuery<CreatorQueryResponse>({
    queryKey: ['creator', creatorId, isUsername ? 'username' : 'id', page, limit],
    queryFn: async () => {
      if (!creatorId) throw new Error('Missing creator id');
      const response = await fetch(buildUrl(page, limit), { headers });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Creator not found');
        }
        throw new Error('Failed to fetch creator profile');
      }
      return response.json();
    },
    enabled: !!creatorId,
    staleTime: 60_000,
  });

  // Prefetch adjacent pages for smoother UX
  const prefetchPages = async (pages: number[]) => {
    if (!creatorId) return;
    await Promise.all(
      pages.map((p) =>
        queryClient.prefetchQuery({
          queryKey: ['creator', creatorId, isUsername ? 'username' : 'id', p, limit],
          queryFn: async () => {
            const res = await fetch(buildUrl(p, limit), { headers });
            if (!res.ok) throw new Error('Prefetch failed');
            return res.json();
          },
          staleTime: 60_000,
        })
      )
    );
  };

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const actualCreatorId = (creatorData as any)?.creator?.id;
      if (!actualCreatorId) {
        throw new Error('Creator ID not available');
      }

      const response = await fetch(`/api/creators/${actualCreatorId}/follow`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to follow creator');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all pages for this creator
      queryClient.invalidateQueries({ queryKey: ['creator', creatorId] });
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
    mediaPagination: (creatorData as any)?.mediaPagination as MediaPagination | undefined,
    isLoading,
    error,
    followMutation,
    handleFollow,
    handleSubscribe,
    handleTip,
    prefetchPages,
  };
};
