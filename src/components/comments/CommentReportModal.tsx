import { useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CommentReportModalProps {
  commentId: string;
  onClose: () => void;
}

const reportReasons = [
  { value: 'spam', label: 'Spam o contenuto indesiderato' },
  { value: 'harassment', label: 'Molestie o bullismo' },
  { value: 'hate_speech', label: 'Linguaggio d\'odio o discriminatorio' },
  { value: 'misinformation', label: 'Informazioni false o fuorvianti' },
  { value: 'inappropriate', label: 'Contenuto inappropriato' },
  { value: 'copyright', label: 'Violazione del copyright' },
  { value: 'other', label: 'Altro' }
];

export const CommentReportModal = ({ commentId, onClose }: CommentReportModalProps) => {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !selectedReason) return;

    setSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('comment_reports')
        .insert({
          comment_id: commentId,
          reporter_id: user.id,
          reason: selectedReason,
          description: description.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Segnalazione inviata",
        description: "La tua segnalazione è stata registrata e sarà revisionata dai moderatori."
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting comment report:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare la segnalazione. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Accesso richiesto
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              Devi essere loggato per segnalare un commento.
            </p>
            <Button onClick={onClose} className="mt-4">
              Chiudi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Segnala commento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Motivo della segnalazione
            </Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
              className="space-y-2"
            >
              {reportReasons.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label 
                    htmlFor={reason.value} 
                    className="text-sm cursor-pointer flex-1"
                  >
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Dettagli aggiuntivi (opzionale)
            </Label>
            <Textarea
              id="description"
              placeholder="Fornisci maggiori dettagli sulla segnalazione..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {description.length}/500
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Cosa succede dopo?</p>
                <p>I nostri moderatori esamineranno la segnalazione entro 24 ore. Riceverai una notifica se dovessimo prendere provvedimenti.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Annulla
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedReason || submitting}
              className="flex-1"
            >
              {submitting ? 'Invio...' : 'Invia segnalazione'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};