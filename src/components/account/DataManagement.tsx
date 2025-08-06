import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash2, FileText, Calendar, AlertTriangle } from "lucide-react";

export const DataManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    
    setExportLoading(true);
    try {
      // Create export request
      const { data, error } = await supabase
        .from('data_exports')
        .insert({
          user_id: user.id,
          export_type: 'full',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Richiesta inviata",
        description: "Ti invieremo un'email quando l'esportazione sarà pronta (entro 24 ore).",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Errore",
        description: "Impossibile avviare l'esportazione",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleteLoading(true);
    try {
      // Create deletion request
      const { data, error } = await supabase
        .from('data_deletions')
        .insert({
          user_id: user.id,
          reason: 'user_request',
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Richiesta di cancellazione inviata",
        description: "Il tuo account sarà eliminato entro 30 giorni. Riceverai una conferma via email.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Errore",
        description: "Impossibile avviare la cancellazione",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Esporta i Tuoi Dati
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Scarica una copia completa di tutti i dati associati al tuo account in formato JSON.
          </p>
          
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dati inclusi nell'esportazione:
            </h4>
            <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-1">
              <li>Informazioni del profilo (username, bio, email)</li>
              <li>Tutti i tuoi post e commenti</li>
              <li>Like e bookmark effettuati</li>
              <li>Valutazioni assegnate</li>
              <li>Cronologia delle sessioni (ultimi 30 giorni)</li>
              <li>Preferenze e impostazioni</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Tempo di elaborazione: fino a 24 ore</span>
          </div>

          <Button 
            onClick={handleExportData} 
            disabled={exportLoading}
            className="w-full"
          >
            {exportLoading ? "Preparazione in corso..." : "Richiedi Esportazione"}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Elimina Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Attenzione: Questa azione è irreversibile</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La cancellazione dell'account comporterà:
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-1">
              <li>Eliminazione permanente del profilo e delle impostazioni</li>
              <li>Rimozione di tutti i tuoi post e commenti</li>
              <li>Cancellazione di like, bookmark e valutazioni</li>
              <li>Impossibilità di recuperare i dati</li>
            </ul>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Processo di cancellazione:</h4>
            <p className="text-sm text-muted-foreground">
              1. Invio richiesta di cancellazione<br/>
              2. Periodo di grazia di 7 giorni (puoi annullare)<br/>
              3. Eliminazione definitiva entro 30 giorni<br/>
              4. Conferma via email
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full"
                disabled={deleteLoading}
              >
                Elimina il Mio Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sei sicuro di voler eliminare il tuo account?</AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione non può essere annullata. Tutti i tuoi dati verranno 
                  eliminati permanentemente dopo un periodo di grazia di 7 giorni.
                  <br/><br/>
                  Se cambi idea, potrai annullare la richiesta entro 7 giorni 
                  contattando il supporto.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Elaborazione..." : "Conferma Eliminazione"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <p className="text-xs text-muted-foreground text-center">
            Hai bisogno di aiuto? Contatta{" "}
            <a href="mailto:support@malatidellosport.it" className="text-primary hover:underline">
              support@malatidellosport.it
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};