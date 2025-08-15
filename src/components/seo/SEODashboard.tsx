import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Globe, 
  Smartphone, 
  Zap,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export const SEODashboard = () => {
  // Mock SEO data - in real app this would come from actual analysis
  const seoScore = 92;
  const metrics = {
    titleTag: { status: 'good', length: 47 },
    metaDescription: { status: 'good', length: 142 },
    headings: { status: 'excellent', h1Count: 1, h2Count: 5 },
    images: { status: 'warning', withAlt: 85, total: 100 },
    internalLinks: { status: 'good', count: 23 },
    loadTime: { status: 'excellent', time: 1.2 },
    mobileOptimized: { status: 'excellent' },
    structuredData: { status: 'good', types: ['NewsArticle', 'Organization'] }
  };

  const issues = [
    {
      type: 'warning',
      title: 'Immagini senza Alt Text',
      description: '15 immagini non hanno testo alternativo',
      impact: 'medium',
      fix: 'Aggiungere attributi alt descrittivi'
    },
    {
      type: 'info',
      title: 'Meta Keywords',
      description: 'Tag meta keywords non utilizzato (deprecato)',
      impact: 'low',
      fix: 'Non necessario, focus su contenuto di qualità'
    }
  ];

  const opportunities = [
    {
      title: 'Canonical URLs',
      description: 'Implementare tag canonical per evitare contenuti duplicati',
      impact: 'high'
    },
    {
      title: 'XML Sitemap',
      description: 'Creare e inviare sitemap dinamica a Google Search Console',
      impact: 'high'
    },
    {
      title: 'Schema Markup',
      description: 'Aggiungere più structured data per eventi sportivi',
      impact: 'medium'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreGrade = (score: number) => {
    if (score >= 95) return { grade: 'A+', color: 'text-green-500' };
    if (score >= 90) return { grade: 'A', color: 'text-green-500' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-500' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-500' };
    return { grade: 'D', color: 'text-red-500' };
  };

  const { grade, color } = getScoreGrade(seoScore);

  return (
    <div className="space-y-6">
      {/* Overall SEO Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`text-6xl font-bold ${color}`}>
                {grade}
              </div>
              <div>
                <p className="text-2xl font-semibold">{seoScore}/100</p>
                <p className="text-muted-foreground">Punteggio SEO</p>
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant={seoScore >= 90 ? 'default' : 'secondary'}>
                {seoScore >= 90 ? 'Ottimizzato' : 'In miglioramento'}
              </Badge>
            </div>
          </div>
          
          <Progress value={seoScore} className="mb-4" />
          
          <p className="text-sm text-muted-foreground">
            Il sito segue {seoScore}% delle best practices SEO per migliorare la visibilità sui motori di ricerca.
          </p>
        </CardContent>
      </Card>

      {/* Technical SEO Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Title Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${getStatusColor(metrics.titleTag.status)}`}>
                  {metrics.titleTag.length} caratteri
                </span>
                <Badge variant={metrics.titleTag.status === 'good' ? 'default' : 'secondary'}>
                  {metrics.titleTag.status === 'good' ? 'Ottimo' : 'Da ottimizzare'}
                </Badge>
              </div>
              <Progress value={Math.min((metrics.titleTag.length / 60) * 100, 100)} />
              <p className="text-xs text-muted-foreground">Lunghezza ideale: 50-60 caratteri</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Meta Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${getStatusColor(metrics.metaDescription.status)}`}>
                  {metrics.metaDescription.length} caratteri
                </span>
                <Badge variant={metrics.metaDescription.status === 'good' ? 'default' : 'secondary'}>
                  {metrics.metaDescription.status === 'good' ? 'Ottimo' : 'Da ottimizzare'}
                </Badge>
              </div>
              <Progress value={Math.min((metrics.metaDescription.length / 160) * 100, 100)} />
              <p className="text-xs text-muted-foreground">Lunghezza ideale: 120-160 caratteri</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Velocità Caricamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${getStatusColor(metrics.loadTime.status)}`}>
                  {metrics.loadTime.time}s
                </span>
                <Badge variant={metrics.loadTime.status === 'excellent' ? 'default' : 'secondary'}>
                  {metrics.loadTime.status === 'excellent' ? 'Veloce' : 'Lento'}
                </Badge>
              </div>
              <Progress value={Math.max(100 - (metrics.loadTime.time / 3 * 100), 0)} />
              <p className="text-xs text-muted-foreground">Obiettivo: &lt; 2 secondi</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Mobile-Friendly</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${getStatusColor(metrics.mobileOptimized.status)}`}>
                  Ottimizzato
                </span>
                <Badge variant="default">
                  Responsivo
                </Badge>
              </div>
              <Progress value={100} />
              <p className="text-xs text-muted-foreground">Design responsive implementato</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Analisi Contenuti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Struttura Headings</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>H1 (Titolo principale)</span>
                  <Badge variant={metrics.headings.h1Count === 1 ? 'default' : 'destructive'}>
                    {metrics.headings.h1Count} trovato/i
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>H2 (Sottotitoli)</span>
                  <Badge variant="default">
                    {metrics.headings.h2Count} trovati
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  ✅ Gerarchia heading corretta implementata
                </p>
              </div>

              <h3 className="font-semibold">Ottimizzazione Immagini</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Immagini con Alt Text</span>
                  <Badge variant={metrics.images.withAlt >= 90 ? 'default' : 'secondary'}>
                    {metrics.images.withAlt}/{metrics.images.total}
                  </Badge>
                </div>
                <Progress value={(metrics.images.withAlt / metrics.images.total) * 100} />
                <p className="text-sm text-muted-foreground">
                  {metrics.images.withAlt >= 90 ? '✅' : '⚠️'} 
                  {' '}Percentuale: {Math.round((metrics.images.withAlt / metrics.images.total) * 100)}%
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Structured Data</h3>
              <div className="space-y-2">
                {metrics.structuredData.types.map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{type}</span>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  ✅ Schema markup implementato correttamente
                </p>
              </div>

              <h3 className="font-semibold">Link Interni</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Link interni trovati</span>
                  <Badge variant="default">
                    {metrics.internalLinks.count}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  ✅ Buona struttura di link interni
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues and Opportunities */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Problemi da Risolvere
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {issues.map((issue, index) => (
              <Alert key={index} className={
                issue.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'
              }>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <strong>{issue.title}</strong>
                      <Badge variant="outline" className="text-xs">
                        {issue.impact === 'high' ? 'Alto' : issue.impact === 'medium' ? 'Medio' : 'Basso'}
                      </Badge>
                    </div>
                    <p className="text-sm">{issue.description}</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Soluzione:</strong> {issue.fix}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Opportunità di Miglioramento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {opportunities.map((opportunity, index) => (
              <Alert key={index} className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <strong>{opportunity.title}</strong>
                      <Badge variant="outline" className="text-xs border-green-300">
                        {opportunity.impact === 'high' ? 'Alto Impatto' : 'Medio Impatto'}
                      </Badge>
                    </div>
                    <p className="text-sm">{opportunity.description}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* SEO Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Risorse e Strumenti SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Google Search Console</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Monitora performance di ricerca e indicizza contenuti
              </p>
              <Badge variant="outline">Raccomandato</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Core Web Vitals</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Ottimizza LCP, FID e CLS per migliori ranking
              </p>
              <Badge variant="outline">In corso</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">XML Sitemap</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Facilita l'indicizzazione di nuovi contenuti
              </p>
              <Badge variant="outline">Da implementare</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};