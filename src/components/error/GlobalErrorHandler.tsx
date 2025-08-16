import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export const GlobalErrorHandler = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Ignora errori ResizeObserver
      if (event.message.includes('ResizeObserver loop completed')) {
        event.preventDefault();
        return;
      }

      // Altri errori non critici da ignorare
      const ignoredErrors = [
        'Non-Error promise rejection captured',
        'Script error',
        'Network request failed',
      ];

      const shouldIgnore = ignoredErrors.some(ignoredError => 
        event.message.includes(ignoredError)
      );

      if (!shouldIgnore) {
        console.error('Global Error:', event.error);
        
        toast({
          title: "Si è verificato un errore",
          description: "Ricarica la pagina se il problema persiste",
          variant: "destructive",
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Gestisci promise rejection
      if (event.reason?.message?.includes('ResizeObserver')) {
        event.preventDefault();
        return;
      }

      console.error('Unhandled Promise Rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // Questo componente non renderizza nulla
};