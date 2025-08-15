import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
}

interface PerformanceState {
  metrics: PerformanceMetrics;
  isLoading: boolean;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export const usePerformanceMonitor = () => {
  const [state, setState] = useState<PerformanceState>({
    metrics: {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null
    },
    isLoading: true,
    grade: 'C'
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let metrics: PerformanceMetrics = {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null
    };

    // Function to calculate performance grade
    const calculateGrade = (metrics: PerformanceMetrics): 'A' | 'B' | 'C' | 'D' | 'F' => {
      let score = 100;
      
      if (metrics.lcp) {
        if (metrics.lcp > 4000) score -= 25;
        else if (metrics.lcp > 2500) score -= 15;
        else if (metrics.lcp > 1500) score -= 5;
      }
      
      if (metrics.fid) {
        if (metrics.fid > 300) score -= 25;
        else if (metrics.fid > 100) score -= 10;
      }
      
      if (metrics.cls) {
        if (metrics.cls > 0.25) score -= 25;
        else if (metrics.cls > 0.1) score -= 10;
      }

      if (score >= 90) return 'A';
      if (score >= 80) return 'B';
      if (score >= 70) return 'C';
      if (score >= 60) return 'D';
      return 'F';
    };

    // Measure FCP and LCP using PerformanceObserver
    if ('PerformanceObserver' in window) {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.lcp = lastEntry.startTime;
        
        setState(prev => ({
          ...prev,
          metrics: { ...prev.metrics, lcp: metrics.lcp },
          grade: calculateGrade(metrics)
        }));
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            metrics.fid = (entry as any).processingStart - entry.startTime;
            
            setState(prev => ({
              ...prev,
              metrics: { ...prev.metrics, fid: metrics.fid },
              grade: calculateGrade(metrics)
            }));
          }
        }
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            metrics.cls = clsValue;
            
            setState(prev => ({
              ...prev,
              metrics: { ...prev.metrics, cls: metrics.cls },
              grade: calculateGrade(metrics)
            }));
          }
        }
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // FCP using PerformanceObserver
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            metrics.fcp = entry.startTime;
            
            setState(prev => ({
              ...prev,
              metrics: { ...prev.metrics, fcp: metrics.fcp }
            }));
          }
        }
      });

      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('FCP observer not supported');
      }
    }

    // TTFB using Navigation Timing
    const measureTTFB = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          const navigationTiming = navigationEntries[0];
          metrics.ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
          
          setState(prev => ({
            ...prev,
            metrics: { ...prev.metrics, ttfb: metrics.ttfb }
          }));
        }
      }
    };

    // Wait for page load to measure TTFB
    if (document.readyState === 'complete') {
      measureTTFB();
    } else {
      window.addEventListener('load', measureTTFB);
    }

    // Set loading to false after a delay
    const timer = setTimeout(() => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        grade: calculateGrade(metrics)
      }));
    }, 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', measureTTFB);
    };
  }, []);

  return state;
};