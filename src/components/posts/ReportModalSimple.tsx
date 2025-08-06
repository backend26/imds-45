import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportModalProps {
  postId: string;
}

const reportReasons = [
  { value: "spam", label: "Spam o contenuto promozionale" },
  { value: "abuse", label: "Contenuto offensivo o inappropriato" },
  { value: "typo", label: "Errori di battitura o grammaticali" },
  { value: "inaccuracy", label: "Informazioni inesatte o fuorvianti" },
  { value: "copyright", label: "Violazione del copyright" },
  { value: "other", label: "Altro" },
];

export const ReportModalSimple = ({ postId }: ReportModalProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Errore",
        description: "Seleziona un motivo per la segnalazione",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call - will be implemented when database is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Segnalazione inviata",
        description: "Grazie per la tua segnalazione. La esamineremo al più presto.",
      });
      
      setOpen(false);
      setReason("");
      setDescription("");
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile inviare la segnalazione",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
          <Flag className="h-4 w-4 mr-2" />
          Segnala
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Segnala Articolo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Motivo della segnalazione</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="mt-2">
              {reportReasons.map((reportReason) => (
                <div key={reportReason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reportReason.value} id={reportReason.value} />
                  <Label htmlFor={reportReason.value} className="text-sm">
                    {reportReason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Descrizione aggiuntiva (opzionale)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fornisci maggiori dettagli sulla segnalazione..."
              className="mt-2"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !reason}
              variant="destructive"
            >
              {loading ? "Invio..." : "Invia Segnalazione"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};