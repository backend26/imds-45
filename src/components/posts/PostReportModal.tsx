import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Flag, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface PostReportModalProps {
  postId: string;
  onReport: (reason: string, description?: string) => Promise<void>;
  isLoading?: boolean;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam o contenuto promozionale' },
  { value: 'misinformation', label: 'Disinformazione o notizie false' },
  { value: 'inappropriate', label: 'Contenuto inappropriato' },
  { value: 'copyright', label: 'Violazione copyright' },
  { value: 'harassment', label: 'Molestie o bullismo' },
  { value: 'typo', label: 'Errore di battitura o imprecisione' },
  { value: 'other', label: 'Altro' }
];

export const PostReportModal: React.FC<PostReportModalProps> = ({
  postId,
  onReport,
  isLoading = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per segnalare contenuti",
        variant: "destructive"
      });
      return;
    }

    if (!selectedReason) {
      toast({
        title: "Motivo richiesto",
        description: "Seleziona un motivo per la segnalazione",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await onReport(selectedReason, description.trim() || undefined);
      setIsOpen(false);
      setSelectedReason('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedReason('');
      setDescription('');
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          title="Segnala articolo"
        >
          <Flag className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Segnala articolo</DialogTitle>
          <DialogDescription>
            Aiutaci a mantenere la community sicura segnalando contenuti inappropriati.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Motivo della segnalazione</Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
              className="mt-2"
            >
              {REPORT_REASONS.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label htmlFor={reason.value} className="text-sm">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Descrizione aggiuntiva (opzionale)
            </Label>
            <Textarea
              id="description"
              placeholder="Fornisci dettagli aggiuntivi sulla tua segnalazione..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={submitting}
            >
              Annulla
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedReason || submitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Invia segnalazione
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};