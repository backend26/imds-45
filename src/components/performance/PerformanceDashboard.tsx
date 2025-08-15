import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Gauge, 
  Wifi, 
  Download, 
  Smartphone, 
  Globe, 
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';
import { usePWA } from '@/hooks/use-pwa';

export const PerformanceDashboard = () => {
  const { metrics, isLoading, grade } = usePerformanceMonitor();
  const { isSupported, isInstalled, isOnline, canInstall, install } = usePWA();

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-yellow-500';
      case 'D': return 'text-orange-500';
      case 'F': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getScoreProgress = (value: number | null, thresholds: number[]) => {
    if (!value) return 0;
    const [good, fair] = thresholds;
    if (value <= good) return 100;
    if (value <= fair) return 70;
    return 30;
  };

  return (
    <div className="space-y-6">
      {/* Overall Performance Grade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`text-6xl font-bold ${getGradeColor(grade)}`}>
                {isLoading ? '...' : grade}
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {grade === 'A' ? 'Eccellente' :
                   grade === 'B' ? 'Buono' :
                   grade === 'C' ? 'Discreto' :
                   grade === 'D' ? 'Da migliorare' : 'Critico'}
                </p>
                <p className="text-muted-foreground">Performance complessiva</p>
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant={grade === 'A' || grade === 'B' ? 'default' : 'destructive'}>
                Core Web Vitals
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              LCP - Largest Contentful Paint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {isLoading ? '...' : metrics.lcp ? `${(metrics.lcp / 1000).toFixed(2)}s` : 'N/A'}
                </span>
                {metrics.lcp && (
                  <Badge variant={metrics.lcp <= 2500 ? 'default' : metrics.lcp <= 4000 ? 'secondary' : 'destructive'}>
                    {metrics.lcp <= 2500 ? 'Buono' : metrics.lcp <= 4000 ? 'Da migliorare' : 'Lento'}
                  </Badge>
                )}
              </div>
              <Progress value={getScoreProgress(metrics.lcp, [2500, 4000])} />
              <p className="text-xs text-muted-foreground">Tempo di caricamento del contenuto principale</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              FID - First Input Delay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {isLoading ? '...' : metrics.fid ? `${metrics.fid.toFixed(0)}ms` : 'N/A'}
                </span>
                {metrics.fid && (
                  <Badge variant={metrics.fid <= 100 ? 'default' : metrics.fid <= 300 ? 'secondary' : 'destructive'}>
                    {metrics.fid <= 100 ? 'Buono' : metrics.fid <= 300 ? 'Da migliorare' : 'Lento'}
                  </Badge>
                )}
              </div>
              <Progress value={getScoreProgress(metrics.fid, [100, 300])} />
              <p className="text-xs text-muted-foreground">Tempo di risposta alla prima interazione</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              CLS - Cumulative Layout Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {isLoading ? '...' : metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                </span>
                {metrics.cls !== null && (
                  <Badge variant={metrics.cls <= 0.1 ? 'default' : metrics.cls <= 0.25 ? 'secondary' : 'destructive'}>
                    {metrics.cls <= 0.1 ? 'Buono' : metrics.cls <= 0.25 ? 'Da migliorare' : 'Instabile'}
                  </Badge>
                )}
              </div>
              <Progress value={getScoreProgress(metrics.cls, [0.1, 0.25])} />
              <p className="text-xs text-muted-foreground">Stabilità visiva del layout</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PWA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Progressive Web App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isSupported ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>PWA Support</span>
              </div>
              <Badge variant={isSupported ? 'default' : 'destructive'}>
                {isSupported ? 'Supportato' : 'Non supportato'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isInstalled ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span>App Installata</span>
              </div>
              <Badge variant={isInstalled ? 'default' : 'secondary'}>
                {isInstalled ? 'Sì' : 'No'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Wifi className={`w-4 h-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
                <span>Connessione</span>
              </div>
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Download className={`w-4 h-4 ${canInstall ? 'text-blue-500' : 'text-gray-500'}`} />
                <span>Installazione</span>
              </div>
              {canInstall ? (
                <Button size="sm" onClick={install}>
                  Installa App
                </Button>
              ) : (
                <Badge variant="outline">Non disponibile</Badge>
              )}
            </div>
          </div>

          {!isOnline && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Sei offline. L'app continua a funzionare grazie al caching intelligente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Suggerimenti Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.lcp && metrics.lcp > 2500 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>LCP lento:</strong> Considera l'ottimizzazione delle immagini e l'uso di un CDN.
                </AlertDescription>
              </Alert>
            )}
            
            {metrics.fid && metrics.fid > 100 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>FID alto:</strong> Riduci il JavaScript non necessario e ottimizza le interazioni.
                </AlertDescription>
              </Alert>
            )}
            
            {metrics.cls && metrics.cls > 0.1 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>CLS instabile:</strong> Specifica dimensioni per immagini e riserva spazio per contenuti dinamici.
                </AlertDescription>
              </Alert>
            )}

            {grade === 'A' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Ottimo lavoro!</strong> La tua app ha performance eccellenti secondo i Core Web Vitals.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};