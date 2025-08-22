import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  Keyboard, 
  Volume2, 
  Palette, 
  MousePointer,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

export const AccessibilityDashboard = () => {
  // Mock accessibility audit results - in real app this would come from automated testing
  const accessibilityScore = 87;
  const issues = [
    {
      type: 'warning',
      category: 'Color Contrast',
      message: 'Alcuni pulsanti secondari potrebbero avere contrasto insufficiente',
      impact: 'medium'
    },
    {
      type: 'error',
      category: 'Keyboard Navigation',
      message: '2 elementi non sono raggiungibili tramite tastiera',
      impact: 'high'
    },
    {
      type: 'info',
      category: 'Screen Reader',
      message: 'Alcune immagini potrebbero beneficiare di alt text più descrittivi',
      impact: 'low'
    }
  ];

  const features = [
    {
      name: 'Navigazione da Tastiera',
      status: 'good',
      description: 'Tutti gli elementi interattivi sono accessibili tramite Tab',
      icon: Keyboard
    },
    {
      name: 'Contrasto Colori',
      status: 'warning',
      description: 'La maggior parte del testo rispetta WCAG AA',
      icon: Palette
    },
    {
      name: 'Screen Reader',
      status: 'good',
      description: 'Struttura semantica e ARIA labels implementati',
      icon: Volume2
    },
    {
      name: 'Focus Visibile',
      status: 'good',
      description: 'Focus indicators chiari su tutti gli elementi',
      icon: Eye
    },
    {
      name: 'Responsive Design',
      status: 'excellent',
      description: 'Layout ottimizzato per tutti i dispositivi',
      icon: MousePointer
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreGrade = (score: number) => {
    if (score >= 95) return { grade: 'A+', color: 'text-green-500' };
    if (score >= 90) return { grade: 'A', color: 'text-green-500' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-500' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-500' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-500' };
    return { grade: 'F', color: 'text-red-500' };
  };

  const { grade, color } = getScoreGrade(accessibilityScore);

  return (
    <div className="space-y-6">
      {/* Overall Accessibility Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibilità (WCAG 2.1)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`text-6xl font-bold ${color}`}>
                {grade}
              </div>
              <div>
                <p className="text-2xl font-semibold">{accessibilityScore}/100</p>
                <p className="text-muted-foreground">Punteggio complessivo</p>
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant={accessibilityScore >= 90 ? 'default' : 'secondary'}>
                {accessibilityScore >= 90 ? 'Conforme WCAG AA' : 'In miglioramento'}
              </Badge>
            </div>
          </div>
          
          <Progress value={accessibilityScore} className="mb-4" />
          
          <p className="text-sm text-muted-foreground">
            Il sito rispetta {accessibilityScore}% delle linee guida WCAG 2.1 per l'accessibilità web.
          </p>
        </CardContent>
      </Card>

      {/* Accessibility Features */}
      <Card>
        <CardHeader>
          <CardTitle>Funzionalità di Accessibilità</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.name}
                  className={`p-4 border rounded-lg ${getStatusColor(feature.status)}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{feature.name}</h3>
                      <p className="text-sm opacity-90">{feature.description}</p>
                      <Badge 
                        variant="outline" 
                        className="mt-2 text-xs border-current"
                      >
                        {feature.status === 'excellent' ? 'Eccellente' :
                         feature.status === 'good' ? 'Buono' :
                         feature.status === 'warning' ? 'Da migliorare' : 'Critico'}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Issues and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Problemi Rilevati e Raccomandazioni</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {issues.map((issue, index) => (
            <Alert key={index} className={
              issue.type === 'error' ? 'border-red-200 bg-red-50' :
              issue.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }>
              {issue.type === 'error' ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : issue.type === 'warning' ? (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              ) : (
                <Info className="h-4 w-4 text-blue-600" />
              )}
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div>
                    <strong className="block">{issue.category}</strong>
                    <span className="text-sm">{issue.message}</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className={
                      issue.impact === 'high' ? 'border-red-300 text-red-700' :
                      issue.impact === 'medium' ? 'border-yellow-300 text-yellow-700' :
                      'border-blue-300 text-blue-700'
                    }
                  >
                    {issue.impact === 'high' ? 'Alto' :
                     issue.impact === 'medium' ? 'Medio' : 'Basso'}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Ottime pratiche implementate:</strong>
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li>Struttura semantica HTML5 corretta</li>
                <li>Attributi ARIA appropriati</li>
                <li>Alt text descrittivi per le immagini</li>
                <li>Focus trap nei modal</li>
                <li>Skip links per navigazione rapida</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* WCAG Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Linee Guida WCAG 2.1</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Principi Rispettati
              </h3>
              <ul className="space-y-2 text-sm">
                <li>✅ <strong>Percettibile:</strong> Contenuto presentato in modi percettibili</li>
                <li>✅ <strong>Utilizzabile:</strong> Interfaccia navigabile con tastiera</li>
                <li>✅ <strong>Comprensibile:</strong> Informazioni e funzionalità chiare</li>
                <li>⚠️ <strong>Robusto:</strong> Compatibile con tecnologie assistive</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Aree di Miglioramento
              </h3>
              <ul className="space-y-2 text-sm">
                <li>🔧 Migliorare il contrasto di alcuni elementi UI</li>
                <li>🔧 Aggiungere più descrizioni ARIA</li>
                <li>🔧 Testare con screen reader diversi</li>
                <li>🔧 Implementare preferenze utente per accessibilità</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};