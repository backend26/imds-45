// Gestione centralizzata errori per evitare ResizeObserver loop
export const suppressResizeObserverErrors = () => {
  // Cattura e sopprimi gli errori ResizeObserver che non sono critici
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      // Sopprimi questo errore specifico
      return;
    }
    originalError.apply(console, args);
  };

  // Gestione errori window
  const handleGlobalError = (event: ErrorEvent) => {
    if (
      event.message.includes('ResizeObserver loop completed with undelivered notifications')
    ) {
      event.preventDefault();
      return false;
    }
  };

  window.addEventListener('error', handleGlobalError);
  
  return () => {
    console.error = originalError;
    window.removeEventListener('error', handleGlobalError);
  };
};

// Debounce per operazioni frequenti
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  }) as T;
};