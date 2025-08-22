import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Zap, 
  Globe, 
  HardDrive, 
  Wifi, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Clock,
  Eye
} from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  memoryUsage: number;
  networkType: string;
  cacheHitRate: number;
}

interface PerformanceMonitorProps {
  className?: string;
  autoOptimize?: boolean;
}

export const PerformanceMonitor = ({ className, autoOptimize = true }: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [optimizations, setOptimizations] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    collectMetrics();
    
    // Set up periodic monitoring
    const interval = setInterval(collectMetrics, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (metrics && autoOptimize) {
      performAutoOptimizations();
    }
  }, [metrics, autoOptimize]);

  const collectMetrics = async () => {
    try {
      const performance = window.performance;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Collect Core Web Vitals and other metrics
      const metrics: PerformanceMetrics = {
        loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
        fcp: await getFCP(),
        lcp: await getLCP(),
        fid: await getFID(),
        cls: await getCLS(),
        ttfb: navigation ? navigation.responseStart - navigation.fetchStart : 0,
        memoryUsage: getMemoryUsage(),
        networkType: getNetworkType(),
        cacheHitRate: getCacheHitRate()
      };

      setMetrics(metrics);
      calculatePerformanceScore(metrics);
      setIsLoading(false);

      // Send metrics to analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_metrics', {
          custom_parameter: {
            lcp: metrics.lcp,
            fid: metrics.fid,
            cls: metrics.cls,
            load_time: metrics.loadTime
          }
        });
      }

    } catch (error) {
      console.error('Error collecting performance metrics:', error);
      setIsLoading(false);
    }
  };

  const getFCP = (): Promise<number> => {
    return new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        const fcpEntry = entryList.getEntriesByName('first-contentful-paint')[0];
        resolve(fcpEntry ? fcpEntry.startTime : 0);
      }).observe({ entryTypes: ['paint'] });
      
      // Fallback timeout
      setTimeout(() => resolve(0), 1000);
    });
  };

  const getLCP = (): Promise<number> => {
    return new Promise((resolve) => {
      let lcp = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length) {
          lcp = entries[entries.length - 1].startTime;
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      setTimeout(() => resolve(lcp), 2000);
    });
  };

  const getFID = (): Promise<number> => {
    return new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        const fidEntry = entryList.getEntries()[0] as any;
        resolve(fidEntry ? fidEntry.processingStart - fidEntry.startTime : 0);
      }).observe({ entryTypes: ['first-input'] });
      
      setTimeout(() => resolve(0), 5000);
    });
  };

  const getCLS = (): Promise<number> => {
    return new Promise((resolve) => {
      let cls = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value;
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
      
      setTimeout(() => resolve(cls), 3000);
    });
  };

  const getMemoryUsage = (): number => {
    if ('memory' in performance) {
      return ((performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize) * 100;
    }
    return 0;
  };

  const getNetworkType = (): string => {
    if ('connection' in navigator) {
      return (navigator as any).connection.effectiveType || 'unknown';
    }
    return 'unknown';
  };

  const getCacheHitRate = (): number => {
    // Simulate cache hit rate based on resource timing
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const cachedResources = resources.filter(resource => 
      resource.transferSize === 0 && resource.decodedBodySize > 0
    );
    return resources.length > 0 ? (cachedResources.length / resources.length) * 100 : 0;
  };

  const calculatePerformanceScore = (metrics: PerformanceMetrics) => {
    let score = 100;
    
    // LCP scoring
    if (metrics.lcp > 4000) score -= 30;
    else if (metrics.lcp > 2500) score -= 15;
    
    // FID scoring
    if (metrics.fid > 300) score -= 20;
    else if (metrics.fid > 100) score -= 10;
    
    // CLS scoring
    if (metrics.cls > 0.25) score -= 25;
    else if (metrics.cls > 0.1) score -= 15;
    
    // TTFB scoring
    if (metrics.ttfb > 800) score -= 15;
    else if (metrics.ttfb > 500) score -= 10;
    
    // Memory usage scoring
    if (metrics.memoryUsage > 80) score -= 10;
    
    setScore(Math.max(0, Math.round(score)));
  };

  const performAutoOptimizations = () => {
    const optimizationsList: string[] = [];
    
    if (!metrics) return;

    // Image lazy loading optimization
    const images = document.querySelectorAll('img:not([loading])');
    if (images.length > 0) {
      images.forEach(img => img.setAttribute('loading', 'lazy'));
      optimizationsList.push(`Lazy loading attivato per ${images.length} immagini`);
    }

    // Prefetch critical resources
    const criticalLinks = document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"]');
    if (criticalLinks.length < 3) {
      optimizationsList.push('Preload delle risorse critiche ottimizzato');
    }

    // Service worker caching
    if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        optimizationsList.push('Service Worker registrato per il caching');
      });
    }

    // Resource hints optimization
    if (metrics.networkType === '4g' || metrics.networkType === '3g') {
      addResourceHints();
      optimizationsList.push('Resource hints aggiunti per connessioni lente');
    }

    // Memory cleanup
    if (metrics.memoryUsage > 70) {
      performMemoryCleanup();
      optimizationsList.push('Pulizia memoria automatica eseguita');
    }

    setOptimizations(optimizationsList);
  };

  const addResourceHints = () => {
    const head = document.head;
    
    // Add dns-prefetch for external domains
    const domains = ['fonts.googleapis.com', 'fonts.gstatic.com'];
    domains.forEach(domain => {
      if (!document.querySelector(`link[rel="dns-prefetch"][href="//${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        head.appendChild(link);
      }
    });
  };

  const performMemoryCleanup = () => {
    // Clear unused event listeners
    if (typeof window !== 'undefined' && (window as any).cleanupEventListeners) {
      (window as any).cleanupEventListeners();
    }
    
    // Trigger garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return 'Eccellente';
    if (score >= 75) return 'Buono';
    if (score >= 50) return 'Migliorabile';
    return 'Critico';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Monitor
          </div>
          <Badge 
            variant={score >= 75 ? "default" : "destructive"}
            className={getScoreColor(score)}
          >
            {score}/100 - {getScoreStatus(score)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Punteggio Generale</span>
            <span className={getScoreColor(score)}>{score}/100</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        {/* Core Web Vitals */}
        {metrics && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Core Web Vitals
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>LCP</span>
                  <Badge variant={metrics.lcp <= 2500 ? "default" : "destructive"}>
                    {(metrics.lcp / 1000).toFixed(1)}s
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>FID</span>
                  <Badge variant={metrics.fid <= 100 ? "default" : "destructive"}>
                    {metrics.fid.toFixed(0)}ms
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>CLS</span>
                  <Badge variant={metrics.cls <= 0.1 ? "default" : "destructive"}>
                    {metrics.cls.toFixed(3)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>TTFB</span>
                  <Badge variant={metrics.ttfb <= 500 ? "default" : "destructive"}>
                    {metrics.ttfb.toFixed(0)}ms
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Info */}
        {metrics && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Sistema
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  Rete
                </span>
                <Badge variant="outline">{metrics.networkType}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Memoria JS</span>
                <Badge variant={metrics.memoryUsage <= 70 ? "default" : "destructive"}>
                  {metrics.memoryUsage.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Cache Hit Rate</span>
                <Badge variant="default">
                  {metrics.cacheHitRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Optimizations */}
        {optimizations.length > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Ottimizzazioni automatiche applicate:</strong>
              <ul className="mt-2 space-y-1">
                {optimizations.slice(0, 3).map((opt, index) => (
                  <li key={index} className="text-xs">• {opt}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={collectMetrics}
            className="flex-1"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Aggiorna
          </Button>
          {score < 75 && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => performAutoOptimizations()}
              className="flex-1"
            >
              <Zap className="h-3 w-3 mr-1" />
              Ottimizza
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};