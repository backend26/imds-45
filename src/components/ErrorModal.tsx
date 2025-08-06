import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Copy, CheckCircle } from 'lucide-react';
import { errorService } from '@/services/ErrorService';
import { toast } from '@/hooks/use-toast';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorId: string;
  message?: string;
}

export const ErrorModal = ({ isOpen, onClose, errorId, message }: ErrorModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyDetails = async () => {
    const success = await errorService.copyErrorDetails(errorId);
    if (success) {
      setCopied(true);
      toast({
        title: "Dettagli copiati",
        description: "I dettagli dell'errore sono stati copiati negli appunti",
      });
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast({
        title: "Errore",
        description: "Impossibile copiare i dettagli",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Oops! Qualcosa è andato storto
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {message || 'Si è verificato un errore inatteso. Il nostro team è stato automaticamente notificato.'}
          </p>
          
          <div className="bg-muted/50 rounded-lg p-3 border">
            <p className="text-sm font-medium mb-1">ID Errore:</p>
            <p className="text-xs font-mono text-muted-foreground break-all">
              {errorId}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyDetails}
              className="flex-1"
              disabled={copied}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copiato!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copia Dettagli
                </>
              )}
            </Button>
            
            <Button onClick={onClose} className="flex-1">
              Chiudi
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Se il problema persiste, contatta il supporto includendo l'ID errore.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};