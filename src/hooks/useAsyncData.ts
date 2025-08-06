import { useState, useEffect, useCallback } from 'react';

export interface UseAsyncDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
}

export interface UseAsyncDataOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useAsyncData = <T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: UseAsyncDataOptions = {}
): UseAsyncDataReturn<T> => {
  const { immediate = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [...dependencies, fetchData, immediate]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    setData,
  };
};
