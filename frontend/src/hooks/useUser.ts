import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function useUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initUser() {
      let storedId = localStorage.getItem('pulse-user-id');
      if (!storedId) {
        storedId = crypto.randomUUID();
        localStorage.setItem('pulse-user-id', storedId);
      }
      try {
        await api.createUser(storedId);
      } catch (e) {
        console.error("Failed to ensure user on backend", e);
      }
      setUserId(storedId);
      setIsLoading(false);
    }
    initUser();
  }, []);

  return { userId, isLoading };
}
