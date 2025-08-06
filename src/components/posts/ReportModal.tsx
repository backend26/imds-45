import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Flag } from "lucide-react";

interface ReportModalProps {
  postId: string;
  postTitle: string;
}

const reportReasons = [
  { value: 'abuse', label: 'Contenuto offensivo o abusivo' },
  { value: 'spam', label: 'Spam o contenuto promozionale' },
  { value: 'inappropriate', label: 'Contenuto inappropriato' },
  { value: 'inaccuracy', label: 'Informazioni imprecise o fuorvianti' },
  { value: 'typo', label: 'Errori di battitura o grammaticali' },
];

export const ReportModal = ({ postId, postTitle }: ReportModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per segnalare contenuti",
        variant: "destructive",
      });
      return;
    }

    if (!reason) {
      toast({
        title: "Motivo richiesto",
        description: "Seleziona un motivo per la segnalazione",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('post_reports')
        .insert({
          post_id: postId,
          reporter_id: user.id,
          reason,
          description: description.trim() || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Segnalazione inviata",
        description: "Grazie per la segnalazione. Il nostro team la esaminerà al più presto.",
      });

      // Reset form and close modal
      setReason('');
      setDescription('');
      setOpen(false);
    } catch (error: any) {
      console.error('Error submitting report:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Segnalazione già presente",
          description: "Hai già segnalato questo articolo",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Errore",
          description: "Impossibile inviare la segnalazione",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
          <Flag className="h-4 w-4 mr-1" />
          Segnala
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Segnala Articolo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-1">Articolo da segnalare:</p>
            <p className="text-sm text-muted-foreground truncate">
              {postTitle}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo della segnalazione *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((reasonOption) => (
                  <SelectItem key={reasonOption.value} value={reasonOption.value}>
                    {reasonOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Dettagli aggiuntivi (opzionale)</Label>
            <Textarea
              id="description"
              placeholder="Fornisci maggiori dettagli sulla segnalazione..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500 caratteri
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Nota:</strong> Le segnalazioni vengono esaminate dal nostro team di moderazione. 
              Gli abusi del sistema di segnalazione possono comportare la sospensione dell'account.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1"
              disabled={loading || !reason}
            >
              {loading ? "Invio..." : "Invia Segnalazione"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};