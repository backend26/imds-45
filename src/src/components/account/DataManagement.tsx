import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Trash2, 
  Shield, 
  FileText, 
  HardDrive, 
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface DataExport {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  export_type: 'full' | 'profile_only' | 'posts_only';
  download_url?: string;
  completed_at?: string;
  expires_at?: string;
  file_size_bytes?: number;
  created_at: string;
}

interface DataDeletion {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reason: 'user_request' | 'admin_action' | 'legal_requirement';
  created_at: string;
  processed_at?: string;
}

const mockExports: DataExport[] = [
  {
    id: '1',
    status: 'completed',
    export_type: 'full',
    download_url: '#',
    completed_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    file_size_bytes: 2048576,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  }
];

export const DataManagement = () => {
  const { user } = useAuth();
  const [exports, setExports] = useState<DataExport[]>(mockExports);
  const [deletions, setDeletions] = useState<DataDeletion[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedDataTypes, setSelectedDataTypes] = useState({
    profile: true,
    posts: true,
    comments: true,
    bookmarks: true,
    notifications: true
  });

  const requestDataExport = async (exportType: 'full' | 'profile_only' | 'posts_only') => {
    try {
      // In real implementation, this would create an export request
      const newExport: DataExport = {
        id: Math.random().toString(),
        status: 'pending',
        export_type: exportType,
        created_at: new Date().toISOString()
      };
      
      setExports(prev => [newExport, ...prev]);
      
      toast({
        title: "Richiesta di esportazione inviata",
        description: "Ti invieremo un'email quando i tuoi dati saranno pronti per il download."
      });

      // Simulate processing
      setTimeout(() => {
        setExports(prev => prev.map(exp => 
          exp.id === newExport.id 
            ? { 
                ...exp, 
                status: 'completed', 
                download_url: '#',
                completed_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
                file_size_bytes: Math.floor(Math.random() * 5000000) + 1000000
              }
            : exp
        ));
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile avviare l'esportazione dei dati",
        variant: "destructive"
      });
    }
  };

  const requestDataDeletion = async () => {
    if (deleteConfirm !== 'ELIMINA') {
      toast({
        title: "Errore",
        description: "Digita 'ELIMINA' per confermare",
        variant: "destructive"
      });
      return;
    }

    try {
      const newDeletion: DataDeletion = {
        id: Math.random().toString(),
        status: 'pending',
        reason: 'user_request',
        created_at: new Date().toISOString()
      };
      
      setDeletions(prev => [newDeletion, ...prev]);
      setShowDeleteDialog(false);
      setDeleteConfirm('');
      setDeleteReason('');
      
      toast({
        title: "Richiesta di cancellazione inviata",
        description: "La tua richiesta verrà elaborata entro 30 giorni lavorativi."
      });
      
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile avviare la cancellazione dei dati",
        variant: "destructive"
      });
    }
  };

  const downloadExport = (exportData: DataExport) => {
    if (exportData.download_url) {
      // In real implementation, this would download the actual file
      toast({
        title: "Download avviato",
        description: "Il download dei tuoi dati è iniziato."
      });
    }
  };

  const getExportStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getExportTypeLabel = (type: string) => {
    switch (type) {
      case 'full':
        return 'Tutti i dati';
      case 'profile_only':
        return 'Solo profilo';
      case 'posts_only':
        return 'Solo articoli';
      default:
        return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Esportazione Dati
          </CardTitle>
          <CardDescription>
            Scarica una copia dei tuoi dati in formato JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Puoi richiedere un'esportazione completa dei tuoi dati personali. 
              Il file sarà disponibile per il download per 7 giorni.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              onClick={() => requestDataExport('full')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <HardDrive className="h-6 w-6" />
              <span className="font-medium">Tutti i dati</span>
              <span className="text-xs text-muted-foreground text-center">
                Profilo, articoli, commenti, preferenze
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => requestDataExport('profile_only')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <FileText className="h-6 w-6" />
              <span className="font-medium">Solo profilo</span>
              <span className="text-xs text-muted-foreground text-center">
                Informazioni del profilo e preferenze
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => requestDataExport('posts_only')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <FileText className="h-6 w-6" />
              <span className="font-medium">Solo contenuti</span>
              <span className="text-xs text-muted-foreground text-center">
                Articoli e commenti pubblicati
              </span>
            </Button>
          </div>

          {exports.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Esportazioni recenti</h4>
              {exports.map((exportData) => (
                <div key={exportData.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getExportStatusIcon(exportData.status)}
                      <div>
                        <p className="font-medium text-sm">
                          {getExportTypeLabel(exportData.export_type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Richiesta {formatDistanceToNow(new Date(exportData.created_at), {
                            addSuffix: true,
                            locale: it
                          })}
                        </p>
                        {exportData.file_size_bytes && (
                          <p className="text-xs text-muted-foreground">
                            Dimensione: {formatFileSize(exportData.file_size_bytes)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        exportData.status === 'completed' ? 'default' :
                        exportData.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {exportData.status === 'completed' ? 'Completata' :
                         exportData.status === 'failed' ? 'Fallita' : 
                         exportData.status === 'processing' ? 'In elaborazione' : 'In attesa'}
                      </Badge>
                      
                      {exportData.status === 'completed' && exportData.download_url && (
                        <Button 
                          size="sm" 
                          onClick={() => downloadExport(exportData)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Scarica
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {exportData.status === 'processing' && (
                    <div className="mt-3">
                      <Progress value={45} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Elaborazione in corso...
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Deletion Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Cancellazione Account
          </CardTitle>
          <CardDescription>
            Richiedi la cancellazione permanente del tuo account e di tutti i dati associati
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attenzione:</strong> La cancellazione dell'account è irreversibile. 
              Tutti i tuoi dati, inclusi articoli e commenti, verranno eliminati permanentemente.
            </AlertDescription>
          </Alert>

          {deletions.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium">Richieste di cancellazione</h4>
              {deletions.map((deletion) => (
                <div key={deletion.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="font-medium text-sm">
                          Richiesta di cancellazione account
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Inviata {formatDistanceToNow(new Date(deletion.created_at), {
                            addSuffix: true,
                            locale: it
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {deletion.status === 'pending' ? 'In attesa' : 
                       deletion.status === 'processing' ? 'In elaborazione' : 
                       deletion.status === 'completed' ? 'Completata' : 'Fallita'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Richiedi cancellazione account
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Conferma cancellazione account</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Questa azione è irreversibile. Tutti i tuoi dati verranno eliminati permanentemente.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label>Motivo della cancellazione (opzionale)</Label>
                    <Textarea
                      placeholder="Aiutaci a migliorare il servizio..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Per confermare, digita "ELIMINA"</Label>
                    <Input
                      placeholder="ELIMINA"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      onClick={requestDataDeletion}
                      disabled={deleteConfirm !== 'ELIMINA'}
                      className="flex-1"
                    >
                      Conferma cancellazione
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDeleteDialog(false)}
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
};