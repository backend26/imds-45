import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class EditorErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Editor Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRestart = () => {
    // Clear localStorage autosave data that might be corrupted
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('editor:')) {
        localStorage.removeItem(key);
      }
    });
    
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Errore Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Si è verificato un errore nell'editor. Questo può essere causato da dati corrotti nel salvataggio automatico.
            </p>
            
            {this.state.error && (
              <details className="bg-muted p-3 rounded text-sm">
                <summary className="cursor-pointer font-medium">Dettagli errore</summary>
                <pre className="mt-2 whitespace-pre-wrap">{this.state.error.message}</pre>
                {this.state.errorInfo && (
                  <pre className="mt-2 whitespace-pre-wrap text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
            
            <div className="flex gap-2">
              <Button onClick={this.handleRestart} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Riavvia Editor
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
              >
                Torna alla Home
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}