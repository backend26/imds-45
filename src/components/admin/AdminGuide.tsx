import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Settings, 
  Shield, 
  BarChart3, 
  PlusCircle,
  UserCheck,
  MessageSquare
} from 'lucide-react';

export const AdminGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Guida Amministratore
        </h1>
        <p className="text-muted-foreground">
          Panoramica completa delle funzionalità amministrative
        </p>
      </div>

      {/* Accesso Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Accesso alla Dashboard Admin
          </CardTitle>
          <CardDescription>
            Come accedere alle funzionalità amministrative
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>URL di accesso:</strong> <code>/admin/dashboard</code>
                <br />
                Solo gli utenti con ruolo "administrator" possono accedere a questa sezione.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Badge variant="outline">Requisiti</Badge>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Account verificato</li>
                  <li>• Ruolo "administrator"</li>
                  <li>• Accesso confermato dall'admin principale</li>
                </ul>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">Funzionalità</Badge>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Gestione utenti completa</li>
                  <li>• Moderazione contenuti</li>
                  <li>• Statistiche avanzate</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sistema di Pubblicazione */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sistema di Pubblicazione Post
          </CardTitle>
          <CardDescription>
            Come creare e gestire i contenuti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Creazione Post
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>URL:</strong> <code>/editor/new</code></p>
                  <p><strong>Accesso:</strong> Editor e Amministratori</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Editor avanzato con toolbar completa</li>
                    <li>• Upload immagini e video</li>
                    <li>• Embedding YouTube e social</li>
                    <li>• Gestione tag e categorie</li>
                    <li>• Impostazioni avanzate (commenti, co-authoring)</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Funzionalità Avanzate
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <ul className="space-y-1">
                    <li>• <strong>Immagini multiple di copertina:</strong> Selezione casuale per homepage</li>
                    <li>• <strong>Markup completo:</strong> Grassetto, corsivo, titoli H1-H6</li>
                    <li>• <strong>Allineamento testo:</strong> Sinistra, centro, destra</li>
                    <li>• <strong>Liste:</strong> Puntate e numerate</li>
                    <li>• <strong>Link e media:</strong> URL, immagini, video YouTube</li>
                    <li>• <strong>Controllo commenti:</strong> Attiva/disattiva per ogni post</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Stati dei Post</h5>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">Draft</Badge>
                <Badge variant="default">Published</Badge>
                <Badge variant="outline">Archived</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestione Utenti */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestione Utenti e Ruoli
          </CardTitle>
          <CardDescription>
            Amministrazione degli account utente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Badge variant="outline" className="mb-2">Utente Registrato</Badge>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Visualizzazione contenuti</li>
                  <li>• Commenti e interazioni</li>
                  <li>• Profilo personalizzabile</li>
                  <li>• Valutazioni e bookmark</li>
                </ul>
              </div>
              <div>
                <Badge variant="default" className="mb-2">Editor/Giornalista</Badge>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Tutte le funzioni utente</li>
                  <li>• Creazione e modifica post</li>
                  <li>• Upload media</li>
                  <li>• Collaborazione articoli</li>
                </ul>
              </div>
              <div>
                <Badge variant="destructive" className="mb-2">Amministratore</Badge>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Controllo completo</li>
                  <li>• Gestione utenti e ruoli</li>
                  <li>• Moderazione contenuti</li>
                  <li>• Accesso statistiche</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interazioni e Moderazione */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Sistema di Interazioni
          </CardTitle>
          <CardDescription>
            Funzionalità per gli utenti sui contenuti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Interazioni Disponibili</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Mi piace:</strong> Sistema di like per i post</li>
                <li>• <strong>Condivisione:</strong> Share sui social network</li>
                <li>• <strong>Bookmark:</strong> Salva nei preferiti</li>
                <li>• <strong>Valutazioni:</strong> Sistema stelle da 1 a 5 (solo utenti registrati)</li>
                <li>• <strong>Commenti:</strong> Sistema di commenti nidificati</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Sistema di Segnalazione</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Abuso:</strong> Contenuto inappropriato</li>
                <li>• <strong>Disinformazione:</strong> Notizie false</li>
                <li>• <strong>Errori:</strong> Typo e imprecisioni</li>
                <li>• <strong>Spam:</strong> Contenuto promozionale</li>
                <li>• <strong>Copyright:</strong> Violazioni diritti</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Azioni Rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-auto p-4">
              <Link to="/admin/dashboard" className="flex flex-col items-center gap-2">
                <Shield className="h-6 w-6" />
                <span>Dashboard Admin</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/editor/new" className="flex flex-col items-center gap-2">
                <PlusCircle className="h-6 w-6" />
                <span>Nuovo Post</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link to="/account" className="flex flex-col items-center gap-2">
                <UserCheck className="h-6 w-6" />
                <span>Il Mio Account</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};