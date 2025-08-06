import { useState, useEffect } from 'react';
import { creatorsApi, type FrontendCreator } from '../utils/api';

interface UseCreatorsReturn {
  topCreators: FrontendCreator[];
  trendingCreators: FrontendCreator[];
  newCreators: FrontendCreator[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCreators = (): UseCreatorsReturn => {
  const [topCreators, setTopCreators] = useState<FrontendCreator[]>([]);
  const [trendingCreators, setTrendingCreators] = useState<FrontendCreator[]>([]);
  const [newCreators, setNewCreators] = useState<FrontendCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      setError(null);

      const [topData, trendingData, newData] = await Promise.all([
        creatorsApi.getTopCreators(10),
        creatorsApi.getTrendingCreators(10),
        creatorsApi.getNewCreators(10),
      ]);

      setTopCreators(topData);
      setTrendingCreators(trendingData);
      setNewCreators(newData);
    } catch (err) {
      console.error('Error fetching creators:', err);
      setError('Failed to load creators. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  return {
    topCreators,
    trendingCreators,
    newCreators,
    loading,
    error,
    refetch: fetchCreators,
  };
};

interface UseCreatorReturn {
  creator: any | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCreator = (id: number): UseCreatorReturn => {
  const [creator, setCreator] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreator = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await creatorsApi.getCreator(id);
      setCreator(response.creator);
    } catch (err) {
      console.error('Error fetching creator:', err);
      setError('Failed to load creator profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCreator();
    }
  }, [id]);

  return {
    creator,
    loading,
    error,
    refetch: fetchCreator,
  };
};
