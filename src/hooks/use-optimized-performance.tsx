import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

/**
 * FASE 2: PERFORMANCE OPTIMIZATION HOOKS
 * Optimized performance hooks with memory management
 */

// Optimized performance monitoring with reduced overhead
export const useOptimizedPerformance = () => {
  const [metrics, setMetrics] = useState({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    memoryUsage: 0
  });

  const observersRef = useRef<PerformanceObserver[]>([]);

  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    const observers: PerformanceObserver[] = [];

    // Optimized paint observer with single callback
    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const updates: Partial<typeof metrics> = {};
      
      for (const entry of entries) {
        if (entry.name === 'first-contentful-paint') {
          updates.fcp = entry.startTime;
        }
      }
      
      if (Object.keys(updates).length > 0) {
        setMetrics(prev => ({ ...prev, ...updates }));
      }
    });

    // Optimized LCP observer
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      }
    });

    // Memory usage monitoring (throttled)
    const memoryObserver = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({ 
          ...prev, 
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
        }));
      }
    }, 5000); // Every 5 seconds

    try {
      paintObserver.observe({ entryTypes: ['paint'] });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      observers.push(paintObserver, lcpObserver);
    } catch (e) {
      console.warn('Performance observers not fully supported');
    }

    observersRef.current = observers;

    return () => {
      observers.forEach(observer => observer.disconnect());
      clearInterval(memoryObserver);
    };
  }, []);

  return metrics;
};

// Optimized debounce with cleanup
export const useOptimizedDebounce = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Update callback ref without causing re-renders
  useEffect(() => {
    callbackRef.current = callback;
  });

  const debouncedCallback = useCallback((...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Optimized throttle with better performance
export const useOptimizedThrottle = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  const throttledCallback = useCallback((...args: T) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun.current;

    if (timeSinceLastRun >= delay) {
      callbackRef.current(...args);
      lastRun.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        lastRun.current = Date.now();
      }, delay - timeSinceLastRun);
    }
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

// Optimized intersection observer with cleanup
export const useOptimizedIntersection = (
  options?: IntersectionObserverInit
) => {
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([]);
  const observerRef = useRef<IntersectionObserver>();
  const elementsRef = useRef<Set<Element>>(new Set());

  const observe = useCallback((element: Element) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver((entries) => {
        setEntries(prev => {
          const newEntries = [...prev];
          entries.forEach(entry => {
            const index = newEntries.findIndex(e => e.target === entry.target);
            if (index >= 0) {
              newEntries[index] = entry;
            } else {
              newEntries.push(entry);
            }
          });
          return newEntries;
        });
      }, options);
    }

    elementsRef.current.add(element);
    observerRef.current.observe(element);
  }, [options]);

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
      elementsRef.current.delete(element);
      setEntries(prev => prev.filter(entry => entry.target !== element));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      elementsRef.current.clear();
    };
  }, []);

  return { entries, observe, unobserve };
};

// Optimized image preloader with priority queue
export const useOptimizedImagePreloader = (urls: string[], priority: 'high' | 'low' = 'low') => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const abortControllerRef = useRef<AbortController>();

  const preloadImage = useCallback((url: string, signal: AbortSignal): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        if (!signal.aborted) {
          resolve(url);
        }
      };
      
      img.onerror = () => {
        if (!signal.aborted) {
          reject(new Error(`Failed to load image: ${url}`));
        }
      };
      
      signal.addEventListener('abort', () => {
        img.src = '';
        reject(new Error('Aborted'));
      });
      
      // Set loading priority
      if (priority === 'high') {
        img.loading = 'eager';
        img.fetchPriority = 'high';
      } else {
        img.loading = 'lazy';
        img.fetchPriority = 'low';
      }
      
      img.src = url;
    });
  }, [priority]);

  useEffect(() => {
    if (!urls.length) {
      setIsLoading(false);
      return;
    }

    // Cancel previous preloading
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const preloadAll = async () => {
      const loaded = new Set<string>();
      
      // Process images in batches to avoid overwhelming the browser
      const batchSize = 3;
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        
        try {
          const results = await Promise.allSettled(
            batch.map(url => preloadImage(url, signal))
          );
          
          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              loaded.add(result.value);
            }
          });
          
          if (!signal.aborted) {
            setLoadedImages(new Set(loaded));
          }
          
          // Small delay between batches
          if (i + batchSize < urls.length && !signal.aborted) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        } catch (error) {
          if (!signal.aborted) {
            console.warn('Image preloading batch failed:', error);
          }
        }
      }
      
      if (!signal.aborted) {
        setIsLoading(false);
      }
    };

    preloadAll();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [urls, preloadImage]);

  return { loadedImages, isLoading };
};

// Optimized query with smart caching
export const useOptimizedQuery = <TData = unknown>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: {
    staleTime?: number;
    cacheTime?: number;
    refetchOnWindowFocus?: boolean;
  }
) => {
  const optimizedOptions = useMemo(() => ({
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    cacheTime: options?.cacheTime ?? 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: (failureCount: number, error: any) => {
      // Smart retry logic
      if (failureCount >= 3) return false;
      if (error?.status === 404 || error?.status === 403) return false;
      return true;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  }), [options]);

  return useQuery({
    queryKey,
    queryFn,
    ...optimizedOptions
  });
};

// Network speed estimation with caching
export const useNetworkSpeed = () => {
  const [speed, setSpeed] = useState({
    downlink: 0,
    effectiveType: 'unknown' as string,
    rtt: 0,
    saveData: false
  });

  useEffect(() => {
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setSpeed({
          downlink: connection.downlink || 0,
          effectiveType: connection.effectiveType || 'unknown',
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        });
      }
    };

    updateNetworkInfo();

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return speed;
};