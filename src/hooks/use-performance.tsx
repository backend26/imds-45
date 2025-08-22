import { useEffect, useState, useCallback, useRef } from 'react';

// Performance monitoring hook
export const usePerformance = () => {
  const [metrics, setMetrics] = useState({
    fcp: 0, // First Contentful Paint
    lcp: 0, // Largest Contentful Paint
    fid: 0, // First Input Delay
    cls: 0, // Cumulative Layout Shift
    ttfb: 0, // Time to First Byte
  });

  useEffect(() => {
    // Check if Performance Observer is supported
    if (!('PerformanceObserver' in window)) return;

    const observers: PerformanceObserver[] = [];

    // Measure FCP and LCP
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        }
      }
    });

    try {
      paintObserver.observe({ entryTypes: ['paint'] });
      observers.push(paintObserver);
    } catch (e) {
      console.warn('Paint observer not supported');
    }

    // Measure LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // Measure FID
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
      }
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
      observers.push(fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Measure CLS
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      setMetrics(prev => ({ ...prev, cls: clsValue }));
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }

    // Measure TTFB
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      setMetrics(prev => ({ ...prev, ttfb: navEntry.responseStart - navEntry.requestStart }));
    }

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  return metrics;
};

// Debounced function hook for performance
export const useDebounce = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback((...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Throttled function hook for performance
export const useThrottle = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const lastRun = useRef(Date.now());

  const throttledCallback = useCallback((...args: T) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);

  return throttledCallback;
};

// Memory usage monitoring
export const useMemoryUsage = () => {
  const [usage, setUsage] = useState({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
  });

  useEffect(() => {
    const updateUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setUsage({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      }
    };

    updateUsage();
    const interval = setInterval(updateUsage, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return usage;
};

// Network speed estimation
export const useNetworkSpeed = () => {
  const [speed, setSpeed] = useState({
    downlink: 0,
    effectiveType: 'unknown',
    rtt: 0,
  });

  useEffect(() => {
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setSpeed({
          downlink: connection.downlink || 0,
          effectiveType: connection.effectiveType || 'unknown',
          rtt: connection.rtt || 0,
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

// Image preloader hook
export const useImagePreloader = (urls: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!urls.length) {
      setIsLoading(false);
      return;
    }

    let loaded = 0;
    const total = urls.length;
    const newLoadedImages = new Set<string>();

    urls.forEach(url => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        newLoadedImages.add(url);
        setLoadedImages(new Set(newLoadedImages));
        
        if (loaded === total) {
          setIsLoading(false);
        }
      };
      img.onerror = () => {
        loaded++;
        if (loaded === total) {
          setIsLoading(false);
        }
      };
      img.src = url;
    });
  }, [urls]);

  return { loadedImages, isLoading };
};