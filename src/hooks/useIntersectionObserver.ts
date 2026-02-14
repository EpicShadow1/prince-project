/**
 * Intersection Observer Hook for Lazy Loading
 * Optimized performance for images and components
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook to detect when an element enters the viewport
 */
export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
) {
  const { threshold = 0, root = null, rootMargin = '0px', triggerOnce = true } = options;
  
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<T>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Don't observe if already triggered and triggerOnce is true
    if (triggerOnce && hasTriggered) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      { threshold, root, rootMargin }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, triggerOnce, hasTriggered]);
  
  return { ref: elementRef, isIntersecting, hasTriggered };
}

/**
 * Hook for lazy loading images with blur-up effect
 */
export function useLazyImage(src: string, placeholderSrc?: string) {
  const [imageSrc, setImageSrc] = useState(placeholderSrc || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { ref, isIntersecting } = useIntersectionObserver<HTMLImageElement>({
    rootMargin: '50px', // Start loading 50px before entering viewport
    triggerOnce: true,
  });
  
  useEffect(() => {
    if (!isIntersecting) return;
    
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setError(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
    
    // If image is already cached, onload might not fire
    if (img.complete) {
      setImageSrc(src);
      setIsLoaded(true);
    }
  }, [isIntersecting, src]);
  
  return { ref, imageSrc, isLoaded, error };
}

/**
 * Hook for infinite scrolling
 */
export function useInfiniteScroll<T extends Element = HTMLDivElement>(
  onLoadMore: () => void,
  options: { threshold?: number; hasMore: boolean; isLoading: boolean } = { hasMore: true, isLoading: false }
) {
  const { threshold = 100, hasMore, isLoading } = options;
  
  const [sentinelRef, setSentinelRef] = useState<T | null>(null);
  
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );
  
  useEffect(() => {
    if (!sentinelRef) return;
    
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`,
    });
    
    observer.observe(sentinelRef);
    
    return () => {
      observer.disconnect();
    };
  }, [sentinelRef, handleIntersection, threshold]);
  
  return { setSentinelRef };
}

/**
 * Hook for visibility change detection
 * Pause expensive operations when tab is not visible
 */
export function useVisibilityChange() {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return isVisible;
}

/**
 * Hook for responsive images with srcset
 */
export function useResponsiveImage(
  src: string,
  widths: number[] = [320, 640, 960, 1280, 1920]
) {
  // Generate srcset for responsive images
  const srcSet = widths
    .map((width) => {
      // Assuming images are served with width parameter or different sizes
      const url = src.includes('?') 
        ? `${src}&w=${width}` 
        : `${src}?w=${width}`;
      return `${url} ${width}w`;
    })
    .join(', ');
  
  // Calculate sizes attribute based on viewport
  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  
  return { srcSet, sizes };
}
