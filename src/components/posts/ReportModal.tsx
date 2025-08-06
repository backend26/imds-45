import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Flag, MessageSquare, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string;
}

const REPORT_REASONS = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Contenuto promozionale non desiderato o ripetitivo',
    icon: Zap
  },
  {
    value: 'inappropriate_content',
    label: 'Contenuto inappropriato',
    description: 'Linguaggio offensivo, contenuti per adulti o inappropriati',
    icon: AlertTriangle
  },
  {
    value: 'misinformation',
    label: 'Disinformazione',
    description: 'Informazioni false o fuorvianti',
    icon: Shield
  },
  {
    value: 'harassment',
    label: 'Molestie',
    description: 'Comportamenti di bullismo o molestie verso persone',
    icon: MessageSquare
  },
  {
    value: 'copyright',
    label: 'Violazione copyright',
    description: 'Uso non autorizzato di contenuti protetti da copyright',
    icon: Flag
  },
  {
    value: 'other',
    label: 'Altro',
    description: 'Altri motivi non elencati sopra',
    icon: AlertTriangle
  }
];

export const ReportModal = ({ isOpen, onClose, postId, postTitle }: ReportModalProps) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere autenticato per segnalare contenuti",
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

    setLoading(true);

    try {
      const { error } = await supabase
        .from('post_reports')
        .insert({
          post_id: postId,
          user_id: user.id,
          reason: selectedReason,
          description: description.trim() || null
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Segnalazione già presente",
            description: "Hai già segnalato questo contenuto",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Segnalazione inviata",
        description: "La tua segnalazione è stata ricevuta e verrà esaminata dal nostro team"
      });

      // Reset form
      setSelectedReason('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Errore nell\'invio della segnalazione:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare la segnalazione. Riprova più tardi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedReason('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Segnala Contenuto
          </DialogTitle>
          <DialogDescription>
            {postTitle ? (
              <>Stai segnalando l'articolo: <strong>"{postTitle}"</strong></>
            ) : (
              'Aiutaci a mantenere la community sicura segnalando contenuti inappropriati'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">Motivo della segnalazione</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {REPORT_REASONS.map((reason) => {
                const Icon = reason.icon;
                return (
                  <div key={reason.value} className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={reason.value} id={reason.value} />
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <Label 
                          htmlFor={reason.value} 
                          className="font-medium cursor-pointer"
                        >
                          {reason.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reason.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-medium">
              Descrizione aggiuntiva (opzionale)
            </Label>
            <Textarea
              id="description"
              placeholder="Fornisci dettagli aggiuntivi sulla segnalazione..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500 caratteri
            </p>
          </div>

          <div className="p-4 bg-muted/50 border border-border/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium">Cosa succede dopo la segnalazione</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Il nostro team esaminerà la segnalazione entro 24-48 ore</li>
                  <li>• Se il contenuto viola le nostre regole, verrà rimosso</li>
                  <li>• Riceverai una notifica sull'esito della revisione</li>
                  <li>• Le segnalazioni false possono comportare restrizioni</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? 'Invio...' : 'Invia Segnalazione'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};