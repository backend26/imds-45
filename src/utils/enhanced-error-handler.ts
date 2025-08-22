import { toast } from '@/hooks/use-toast';

/**
 * FASE 5: MONITORING & ERROR HANDLING
 * Enhanced error handling with logging and user feedback
 */

interface ErrorDetails {
  message: string;
  stack?: string;
  component?: string;
  userId?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'authentication' | 'validation' | 'runtime' | 'security';
  metadata?: Record<string, any>;
}

interface ErrorReport {
  id: string;
  details: ErrorDetails;
  attempts: number;
  resolved: boolean;
}

class EnhancedErrorHandler {
  private errorQueue: ErrorReport[] = [];
  private readonly maxQueueSize = 100;
  private readonly retryDelays = [1000, 3000, 5000]; // ms
  private isOnline = navigator.onLine;

  constructor() {
    this.setupGlobalHandlers();
    this.setupNetworkListener();
    this.setupPeriodicCleanup();
  }

  private setupGlobalHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message), {
        severity: 'high',
        category: 'runtime',
        component: 'global',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          severity: 'high',
          category: 'runtime',
          component: 'promise',
          metadata: { reason: event.reason }
        }
      );
    });

    // React error boundary errors (will be caught by error boundaries)
    // This is handled in the ErrorBoundary component
  }

  private setupNetworkListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private setupPeriodicCleanup() {
    // Clean up old errors every hour
    setInterval(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      this.errorQueue = this.errorQueue.filter(
        report => report.details.timestamp > oneHourAgo || !report.resolved
      );
    }, 60 * 60 * 1000);
  }

  handleError(error: Error, options: Partial<ErrorDetails> = {}) {
    const details: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      severity: options.severity || 'medium',
      category: options.category || 'runtime',
      component: options.component,
      userId: options.userId,
      metadata: options.metadata,
    };

    const report: ErrorReport = {
      id: this.generateErrorId(),
      details,
      attempts: 0,
      resolved: false,
    };

    this.addToQueue(report);
    this.showUserFeedback(details);
    this.processErrorQueue();

    // Console logging for development
    if (import.meta.env.DEV) {
      console.group(`🚨 Error [${details.severity.toUpperCase()}]`);
      console.error('Message:', details.message);
      console.error('Component:', details.component);
      console.error('Category:', details.category);
      console.error('Stack:', details.stack);
      console.error('Metadata:', details.metadata);
      console.groupEnd();
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToQueue(report: ErrorReport) {
    this.errorQueue.push(report);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
    }
  }

  private showUserFeedback(details: ErrorDetails) {
    // Don't show toast for low severity errors
    if (details.severity === 'low') return;

    const userMessages = {
      network: 'Problema di connessione. Riprova tra poco.',
      authentication: 'Problema di autenticazione. Effettua il login.',
      validation: 'Dati non validi. Controlla e riprova.',
      runtime: 'Si è verificato un errore. La pagina verrà ricaricata.',
      security: 'Rilevata attività sospetta. Contatta il supporto.',
    };

    const message = userMessages[details.category] || 'Si è verificato un errore imprevisto.';

    toast({
      title: details.severity === 'critical' ? 'Errore Critico' : 'Errore',
      description: message,
      variant: details.severity === 'critical' ? 'destructive' : 'default',
      duration: details.severity === 'critical' ? 10000 : 5000,
    });

    // Auto-reload for critical runtime errors
    if (details.severity === 'critical' && details.category === 'runtime') {
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }

  private async processErrorQueue() {
    if (!this.isOnline) return;

    const unprocessedErrors = this.errorQueue.filter(
      report => !report.resolved && report.attempts < this.retryDelays.length
    );

    for (const report of unprocessedErrors) {
      try {
        await this.sendErrorReport(report);
        report.resolved = true;
      } catch (error) {
        report.attempts++;
        
        // Schedule retry with exponential backoff
        if (report.attempts < this.retryDelays.length) {
          setTimeout(() => {
            this.processErrorQueue();
          }, this.retryDelays[report.attempts - 1]);
        }
      }
    }
  }

  private async sendErrorReport(report: ErrorReport): Promise<void> {
    // In a real implementation, you would send this to your error tracking service
    // For now, we'll store in localStorage for debugging
    
    if (import.meta.env.DEV) {
      const stored = localStorage.getItem('error_reports') || '[]';
      const reports = JSON.parse(stored);
      reports.push(report);
      
      // Keep only last 50 reports
      if (reports.length > 50) {
        reports.splice(0, reports.length - 50);
      }
      
      localStorage.setItem('error_reports', JSON.stringify(reports));
    }

    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('Failed to send error report'));
        }
      }, 100);
    });
  }

  // Method to manually report errors
  reportError(error: Error | string, context?: {
    component?: string;
    action?: string;
    userId?: string;
    severity?: ErrorDetails['severity'];
    category?: ErrorDetails['category'];
    metadata?: Record<string, any>;
  }) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    this.handleError(errorObj, {
      component: context?.component,
      userId: context?.userId,
      severity: context?.severity || 'medium',
      category: context?.category || 'runtime',
      metadata: {
        ...context?.metadata,
        action: context?.action,
        reportedManually: true,
      }
    });
  }

  // Get error statistics for monitoring
  getErrorStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const recentErrors = this.errorQueue.filter(
      report => now - report.details.timestamp < oneHour
    );

    const dailyErrors = this.errorQueue.filter(
      report => now - report.details.timestamp < oneDay
    );

    const errorsByCategory = dailyErrors.reduce((acc, report) => {
      acc[report.details.category] = (acc[report.details.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorsBySeverity = dailyErrors.reduce((acc, report) => {
      acc[report.details.severity] = (acc[report.details.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      recentErrors: recentErrors.length,
      dailyErrors: dailyErrors.length,
      totalErrors: this.errorQueue.length,
      errorsByCategory,
      errorsBySeverity,
      resolvedErrors: this.errorQueue.filter(r => r.resolved).length,
    };
  }

  // Clear error queue (for testing)
  clearErrors() {
    this.errorQueue = [];
    localStorage.removeItem('error_reports');
  }
}

// Global error handler instance
export const errorHandler = new EnhancedErrorHandler();

// Error boundary hook
export const useErrorHandler = () => {
  const reportError = (error: Error | string, context?: Parameters<typeof errorHandler.reportError>[1]) => {
    errorHandler.reportError(error, context);
  };

  const getStats = () => errorHandler.getErrorStats();
  const clearErrors = () => errorHandler.clearErrors();

  return {
    reportError,
    getStats,
    clearErrors,
  };
};

// Network error handler
export const handleNetworkError = (error: any, context?: {
  endpoint?: string;
  method?: string;
  userId?: string;
}) => {
  let category: ErrorDetails['category'] = 'network';
  let severity: ErrorDetails['severity'] = 'medium';

  // Categorize network errors
  if (error?.status === 401 || error?.status === 403) {
    category = 'authentication';
    severity = 'high';
  } else if (error?.status >= 400 && error?.status < 500) {
    category = 'validation';
    severity = 'medium';
  } else if (error?.status >= 500) {
    severity = 'high';
  }

  errorHandler.handleError(
    new Error(`Network Error: ${error?.message || 'Unknown network error'}`),
    {
      category,
      severity,
      component: 'network',
      metadata: {
        status: error?.status,
        endpoint: context?.endpoint,
        method: context?.method,
        response: error?.response,
      },
      userId: context?.userId,
    }
  );
};

// Security error handler
export const handleSecurityError = (error: string, context?: {
  action?: string;
  userId?: string;
  suspicious?: boolean;
}) => {
  errorHandler.handleError(
    new Error(`Security Error: ${error}`),
    {
      category: 'security',
      severity: context?.suspicious ? 'critical' : 'high',
      component: 'security',
      metadata: {
        action: context?.action,
        suspicious: context?.suspicious,
        timestamp: Date.now(),
      },
      userId: context?.userId,
    }
  );
};
