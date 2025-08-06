import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Download, Trash2, FileText, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DataExport {
  id: string;
  export_type: 'full' | 'profile_only' | 'posts_only';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  download_url?: string;
  file_size_bytes?: number;
}

interface DataDeletion {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reason: 'user_request' | 'admin_action' | 'legal_requirement';
  created_at: string;
  processed_at?: string;
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'N/A';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'processing':
      return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
    case 'failed':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

export const DataManagement = () => {
  const [exports, setExports] = useState<DataExport[]>([]);
  const [deletions, setDeletions] = useState<DataDeletion[]>([]);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();

  const requestDataExport = async (exportType: 'full' | 'profile_only' | 'posts_only') => {
    if (!user) return;

    try {
      setIsExporting(true);
      setExportProgress(0);

      // Mock export process
      const newExport: DataExport = {
        id: `export_${Date.now()}`,
        export_type: exportType,
        status: 'processing',
        created_at: new Date().toISOString()
      };

      setExports(prev => [newExport, ...prev]);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsExporting(false);
            
            // Update export to completed
            setExports(prevExports => 
              prevExports.map(exp => 
                exp.id === newExport.id 
                  ? {
                      ...exp,
                      status: 'completed',
                      completed_at: new Date().toISOString(),
                      download_url: `https://example.com/export_${exp.id}.zip`,
                      file_size_bytes: Math.floor(Math.random() * 10000000) + 1000000
                    }
                  : exp
              )
            );

            toast({
              title: "Export completato",
              description: "I tuoi dati sono pronti per il download",
            });

            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

    } catch (error) {
      setIsExporting(false);
      toast({
        title: "Errore",
        description: "Impossibile avviare l'export dei dati",
        variant: "destructive",
      });
    }
  };

  const requestDataDeletion = async () => {
    if (!user) return;

    try {
      const newDeletion: DataDeletion = {
        id: `deletion_${Date.now()}`,
        status: 'pending',
        reason: 'user_request',
        created_at: new Date().toISOString()
      };

      setDeletions(prev => [newDeletion, ...prev]);

      toast({
        title: "Richiesta inviata",
        description: "La tua richiesta di cancellazione dati è stata registrata. Riceverai una conferma via email.",
      });

    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile inviare la richiesta di cancellazione",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Esporta Dati
          </CardTitle>
          <CardDescription>
            Scarica una copia dei tuoi dati personali in formato JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Preparazione export in corso...</span>
                <span>{Math.round(exportProgress)}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => requestDataExport('profile_only')}
              disabled={isExporting}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Solo Profilo</p>
                <p className="text-xs text-muted-foreground">Dati account e preferenze</p>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => requestDataExport('posts_only')}
              disabled={isExporting}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Solo Contenuti</p>
                <p className="text-xs text-muted-foreground">Articoli e commenti</p>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => requestDataExport('full')}
              disabled={isExporting}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Export Completo</p>
                <p className="text-xs text-muted-foreground">Tutti i tuoi dati</p>
              </div>
            </Button>
          </div>

          {exports.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Export Recenti</h4>
              {exports.slice(0, 3).map((exportItem) => (
                <div
                  key={exportItem.id}
                  className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(exportItem.status)}
                    <div>
                      <p className="text-sm font-medium">
                        Export {exportItem.export_type === 'full' ? 'Completo' : 
                               exportItem.export_type === 'profile_only' ? 'Profilo' : 'Contenuti'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exportItem.created_at).toLocaleDateString('it-IT')}
                        {exportItem.file_size_bytes && ` • ${formatFileSize(exportItem.file_size_bytes)}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      exportItem.status === 'completed' ? 'default' :
                      exportItem.status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {exportItem.status === 'completed' ? 'Completato' :
                       exportItem.status === 'failed' ? 'Fallito' :
                       exportItem.status === 'processing' ? 'In corso' : 'In attesa'}
                    </Badge>
                    
                    {exportItem.status === 'completed' && exportItem.download_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={exportItem.download_url} download>
                          <Download className="h-3 w-3 mr-1" />
                          Scarica
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Deletion */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Cancella Account
          </CardTitle>
          <CardDescription>
            Richiedi la cancellazione permanente del tuo account e di tutti i dati associati
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Attenzione: Azione irreversibile</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Tutti i tuoi dati verranno eliminati definitivamente</li>
              <li>• Non sarà possibile recuperare l'account</li>
              <li>• I contenuti pubblicati potrebbero rimanere anonimi</li>
              <li>• Il processo richiede fino a 30 giorni per il completamento</li>
            </ul>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Richiedi Cancellazione Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive">
                  Conferma Cancellazione Account
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Sei sicuro di voler cancellare definitivamente il tuo account? 
                  Questa azione non può essere annullata e tutti i tuoi dati verranno eliminati permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction
                  onClick={requestDataDeletion}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Confermo, cancella account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {deletions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Richieste di Cancellazione</h4>
              {deletions.map((deletion) => (
                <div
                  key={deletion.id}
                  className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(deletion.status)}
                    <div>
                      <p className="text-sm font-medium">Richiesta di cancellazione</p>
                      <p className="text-xs text-muted-foreground">
                        Richiesta il {new Date(deletion.created_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant={
                    deletion.status === 'completed' ? 'default' :
                    deletion.status === 'failed' ? 'destructive' : 'secondary'
                  }>
                    {deletion.status === 'completed' ? 'Completato' :
                     deletion.status === 'failed' ? 'Fallito' :
                     deletion.status === 'processing' ? 'In elaborazione' : 'In attesa'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};