import { v4 as uuidv4 } from 'uuid';

export interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: string;
}

class ErrorService {
  private errors: ErrorInfo[] = [];

  /**
   * Registra un errore critico e genera un ID univoco
   */
  reportError(error: Error, context?: Record<string, any>): string {
    const errorId = uuidv4();
    
    const errorInfo: ErrorInfo = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: context?.userId,
    };

    this.errors.push(errorInfo);
    
    // In produzione, potresti inviare questo a un servizio di logging
    console.error('Error reported:', errorInfo);
    
    return errorId;
  }

  /**
   * Ottiene i dettagli di un errore per ID
   */
  getErrorDetails(errorId: string): string {
    const error = this.errors.find(e => e.id === errorId);
    if (!error) return 'Errore non trovato';

    return `
ID Errore: ${error.id}
Timestamp: ${error.timestamp.toISOString()}
Messaggio: ${error.message}
URL: ${error.url}
User Agent: ${error.userAgent}
${error.stack ? `\nStack Trace:\n${error.stack}` : ''}
    `.trim();
  }

  /**
   * Copia i dettagli dell'errore negli appunti
   */
  async copyErrorDetails(errorId: string): Promise<boolean> {
    try {
      const details = this.getErrorDetails(errorId);
      await navigator.clipboard.writeText(details);
      return true;
    } catch (error) {
      console.error('Impossibile copiare negli appunti:', error);
      return false;
    }
  }

  /**
   * Gestisce errori API con messaggi user-friendly
   */
  handleApiError(error: any): { message: string; isToast: boolean; errorId?: string } {
    // Errori di form o validazione -> Toast
    if (error?.status === 400 || error?.status === 422) {
      return {
        message: error.message || 'Dati non validi. Controlla i campi e riprova.',
        isToast: true
      };
    }

    // Errori di autenticazione -> Toast
    if (error?.status === 401 || error?.status === 403) {
      return {
        message: 'Accesso non autorizzato. Effettua nuovamente il login.',
        isToast: true
      };
    }

    // Errori critici -> Modal
    const errorId = this.reportError(error);
    return {
      message: 'Si è verificato un errore inatteso. Il nostro team è stato notificato.',
      isToast: false,
      errorId
    };
  }
}

export const errorService = new ErrorService();