import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const ContentModerationAlert: React.FC = () => {
  return (
    <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <strong>Linee guida per i contenuti:</strong> Assicurati che tutti i contenuti (testo, immagini, video) siano appropriati, 
        non offensivi e rispettino le nostre regole della community. Contenuti espliciti, offensivi o inappropriati verranno rimossi.
      </AlertDescription>
    </Alert>
  );
};