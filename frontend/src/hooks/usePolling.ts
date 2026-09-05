import { useEffect, useRef } from 'react';

export function usePolling(callback: () => void, intervalMs: number) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let timeoutId: number;

    const tick = () => {
      if (document.visibilityState === 'visible') {
        savedCallback.current();
      }
      timeoutId = window.setTimeout(tick, intervalMs);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        savedCallback.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial call
    savedCallback.current();
    timeoutId = window.setTimeout(tick, intervalMs);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs]);
}
