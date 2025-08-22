import { useState, useCallback } from 'react';
import { errorService } from '@/services/ErrorService';
import { toast } from '@/hooks/use-toast';

interface ErrorState {
  isModalOpen: boolean;
  errorId: string | null;
  message: string | null;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    isModalOpen: false,
    errorId: null,
    message: null,
  });

  const handleError = useCallback((error: any, context?: Record<string, any>) => {
    const result = errorService.handleApiError(error);
    
    if (result.isToast) {
      // Mostra toast per errori meno gravi
      toast({
        title: "Errore",
        description: result.message,
        variant: "destructive",
      });
    } else {
      // Mostra modal per errori critici
      setErrorState({
        isModalOpen: true,
        errorId: result.errorId!,
        message: result.message,
      });
    }
  }, []);

  const closeModal = useCallback(() => {
    setErrorState({
      isModalOpen: false,
      errorId: null,
      message: null,
    });
  }, []);

  return {
    errorState,
    handleError,
    closeModal,
  };
};