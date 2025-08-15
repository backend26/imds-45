import { useEffect } from 'react';

export const DisableBeforeUnload = () => {
  useEffect(() => {
    // Disable all beforeunload event listeners to prevent page reload prompts
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return;
    };

    // Remove any existing beforeunload listeners
    window.removeEventListener('beforeunload', handleBeforeUnload);
    
    // Add our passive handler that prevents default behavior
    window.addEventListener('beforeunload', handleBeforeUnload, { passive: true });

    // Also prevent visibilitychange prompts
    const handleVisibilityChange = () => {
      // Do nothing - just prevent other handlers
    };

    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
};