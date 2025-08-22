import { useState } from 'react';
import { Flag, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PostReportSystemProps {
  postId: string;
  className?: string;
}

const reportReasons = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Contenuto ripetitivo o promozionale non richiesto'
  },
  {
    value: 'inappropriate',
    label: 'Contenuto inappropriato',
    description: 'Contenuto offensivo, volgare o inadatto'
  },
  {
    value: 'misinformation',
    label: 'Disinformazione',
    description: 'Informazioni false o fuorvianti'
  },
  {
    value: 'harassment',
    label: 'Molestie',
    description: 'Comportamento offensivo verso altri utenti'
  },
  {
    value: 'copyright',
    label: 'Violazione copyright',
    description: 'Uso non autorizzato di contenuti protetti'
  },
  {
    value: 'other',
    label: 'Altro',
    description: 'Altri motivi non elencati sopra'
  }
];

export const PostReportSystem = ({ postId, className }: PostReportSystemProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per segnalare un post",
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

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('post_reports')
        .insert({
          post_id: postId,
          reporter_id: user.id,
          reason: selectedReason,
          description: description.trim() || null
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Già segnalato",
            description: "Hai già segnalato questo post",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Segnalazione inviata",
        description: "Grazie per la tua segnalazione. Il nostro team la esaminerà."
      });

      setIsOpen(false);
      setSelectedReason('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare la segnalazione. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedReason('');
    setDescription('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-muted-foreground hover:text-destructive transition-colors ${className}`}
        >
          <Flag className="h-4 w-4 mr-2" />
          Segnala
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Segnala Post
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-base font-medium mb-3 block">
              Perché stai segnalando questo post?
            </Label>
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
              className="space-y-3"
            >
              {reportReasons.map((reason) => (
                <Card 
                  key={reason.value} 
                  className={`cursor-pointer transition-colors ${
                    selectedReason === reason.value 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedReason(reason.value)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem 
                        value={reason.value} 
                        id={reason.value}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
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
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-medium mb-2 block">
              Dettagli aggiuntivi (opzionale)
            </Label>
            <Textarea
              id="description"
              placeholder="Fornisci maggiori dettagli sulla tua segnalazione..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {description.length}/500 caratteri
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Importante:</p>
                <p>Le segnalazioni false o abusive possono comportare limitazioni al tuo account.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            variant="destructive"
          >
            {isSubmitting ? 'Invio...' : 'Invia Segnalazione'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};