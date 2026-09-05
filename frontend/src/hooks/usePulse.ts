import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import { PulseData } from '../types';
import { usePolling } from './usePolling';

export function usePulse(userId: string | null) {
  const [data, setData] = useState<PulseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMarkedSeen, setHasMarkedSeen] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      if (!data) setIsLoading(true);
      const pulseData = await api.getPulse(userId);
      setData(pulseData);
      setError(null);
      
      if (!hasMarkedSeen) {
        await api.markSeen(userId);
        setHasMarkedSeen(true);
      }
    } catch (e: any) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [userId, data, hasMarkedSeen]);

  usePolling(refresh, 15000);

  return { 
    data, 
    isLoading: isLoading && !data, 
    error, 
    lastUpdated: data?.lastUpdated, 
    refresh 
  };
}
