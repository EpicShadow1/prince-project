/**
 * Debounce and Throttle Hooks
 * Performance optimization for search inputs and expensive operations
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to debounce a value
 * Useful for search inputs to reduce API calls
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Clean up the timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Hook to debounce a callback function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Hook to throttle a callback function
 * Useful for scroll and resize events
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const inThrottle = useRef(false);
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  );
}

/**
 * Hook for optimized search with debouncing
 */
export function useSearchDebounce(
  onSearch: (query: string) => void,
  delay = 300
) {

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, delay);
  
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);
  
  return { searchQuery, setSearchQuery, debouncedQuery };
}

/**
 * Hook to delay execution until user stops typing
 */
export function useTypingDelay(
  callback: () => void,
  delay = 500
) {

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const trigger = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay]);
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return { trigger, cancel };
}

/**
 * Hook for request animation frame throttling
 * Best for smooth animations and scroll handlers
 */
export function useRafThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T
): (...args: Parameters<T>) => void {
  const rafId = useRef<number | null>(null);
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      
      rafId.current = requestAnimationFrame(() => {
        callback(...args);
      });
    },
    [callback]
  );
}

/**
 * Hook for leading edge debounce (execute immediately, then wait)
 */
export function useLeadingDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasExecuted = useRef(false);
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (!hasExecuted.current) {
        callback(...args);
        hasExecuted.current = true;
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        hasExecuted.current = false;
      }, delay);
    },
    [callback, delay]
  );
}
