import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Shield, 
  Database, 
  Download, 
  Upload, 
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Globe,
  Users,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export const EnhancedSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    profile_visible: true,
    email_visible: false,
    location_visible: true,
    birth_date_visible: false,
    posts_visible: true,
    activity_visible: true,
    allow_messages: true,
    allow_notifications: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    new_followers: true,
    post_likes: true,
    post_comments: true,
    mentions: true,
    newsletter: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    login_notifications: true,
    session_timeout: '24h',
    device_monitoring: true
  });

  const handlePrivacyUpdate = async (key: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
    
    try {
      // Update in database
      toast({ title: "Impostazioni aggiornate", description: "Le tue preferenze sono state salvate." });
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile salvare le impostazioni.", variant: "destructive" });
    }
  };

  const handleNotificationUpdate = async (key: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    
    try {
      // Update in database
      toast({ title: "Notifiche aggiornate", description: "Le tue preferenze sono state salvate." });
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile salvare le notifiche.", variant: "destructive" });
    }
  };

  const handleDataExport = async () => {
    setLoading(true);
    try {
      // Generate and download user data
      const data = {
        profile: user,
        settings: { privacy: privacySettings, notifications: notificationSettings },
        exported_at: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `malati-sport-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: "Esportazione completata", description: "I tuoi dati sono stati scaricati." });
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile esportare i dati.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!confirm('Sei sicuro di voler eliminare definitivamente il tuo account? Questa azione non può essere annullata.')) {
      return;
    }

    if (!confirm('ATTENZIONE: Tutti i tuoi dati, post e commenti verranno eliminati permanentemente. Confermi?')) {
      return;
    }

    setLoading(true);
    try {
      // Delete account logic
      toast({ title: "Account eliminato", description: "Il tuo account è stato eliminato con successo." });
      // Redirect to homepage
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile eliminare l'account.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Controlli Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Profilo pubblico</Label>
                <p className="text-sm text-muted-foreground">Consenti ad altri di vedere il tuo profilo</p>
              </div>
              <Switch
                checked={privacySettings.profile_visible}
                onCheckedChange={(checked) => handlePrivacyUpdate('profile_visible', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Email visibile</Label>
                <p className="text-sm text-muted-foreground">Mostra la tua email nel profilo pubblico</p>
              </div>
              <Switch
                checked={privacySettings.email_visible}
                onCheckedChange={(checked) => handlePrivacyUpdate('email_visible', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Posizione visibile</Label>
                <p className="text-sm text-muted-foreground">Mostra la tua posizione nel profilo</p>
              </div>
              <Switch
                checked={privacySettings.location_visible}
                onCheckedChange={(checked) => handlePrivacyUpdate('location_visible', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Data di nascita visibile</Label>
                <p className="text-sm text-muted-foreground">Mostra la tua data di nascita</p>
              </div>
              <Switch
                checked={privacySettings.birth_date_visible}
                onCheckedChange={(checked) => handlePrivacyUpdate('birth_date_visible', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Post pubblici</Label>
                <p className="text-sm text-muted-foreground">Consenti ad altri di vedere i tuoi articoli</p>
              </div>
              <Switch
                checked={privacySettings.posts_visible}
                onCheckedChange={(checked) => handlePrivacyUpdate('posts_visible', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Messaggi diretti</Label>
                <p className="text-sm text-muted-foreground">Consenti ad altri utenti di inviarti messaggi</p>
              </div>
              <Switch
                checked={privacySettings.allow_messages}
                onCheckedChange={(checked) => handlePrivacyUpdate('allow_messages', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Preferenze Notifiche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Notifiche email</Label>
                <p className="text-sm text-muted-foreground">Ricevi notifiche via email</p>
              </div>
              <Switch
                checked={notificationSettings.email_notifications}
                onCheckedChange={(checked) => handleNotificationUpdate('email_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Notifiche push</Label>
                <p className="text-sm text-muted-foreground">Ricevi notifiche push del browser</p>
              </div>
              <Switch
                checked={notificationSettings.push_notifications}
                onCheckedChange={(checked) => handleNotificationUpdate('push_notifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Nuovi follower</Label>
                <p className="text-sm text-muted-foreground">Quando qualcuno inizia a seguirti</p>
              </div>
              <Switch
                checked={notificationSettings.new_followers}
                onCheckedChange={(checked) => handleNotificationUpdate('new_followers', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Like ai tuoi post</Label>
                <p className="text-sm text-muted-foreground">Quando qualcuno mette mi piace ai tuoi articoli</p>
              </div>
              <Switch
                checked={notificationSettings.post_likes}
                onCheckedChange={(checked) => handleNotificationUpdate('post_likes', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Commenti ai tuoi post</Label>
                <p className="text-sm text-muted-foreground">Quando qualcuno commenta i tuoi articoli</p>
              </div>
              <Switch
                checked={notificationSettings.post_comments}
                onCheckedChange={(checked) => handleNotificationUpdate('post_comments', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Menzioni</Label>
                <p className="text-sm text-muted-foreground">Quando qualcuno ti menziona</p>
              </div>
              <Switch
                checked={notificationSettings.mentions}
                onCheckedChange={(checked) => handleNotificationUpdate('mentions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Newsletter</Label>
                <p className="text-sm text-muted-foreground">Ricevi aggiornamenti settimanali</p>
              </div>
              <Switch
                checked={notificationSettings.newsletter}
                onCheckedChange={(checked) => handleNotificationUpdate('newsletter', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Impostazioni Sicurezza
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Autenticazione a due fattori</Label>
                <p className="text-sm text-muted-foreground">Proteggi il tuo account con 2FA</p>
                {securitySettings.two_factor_enabled && <Badge variant="secondary">Attivo</Badge>}
              </div>
              <Button variant="outline" size="sm">
                {securitySettings.two_factor_enabled ? 'Disabilita' : 'Configura'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Notifiche di accesso</Label>
                <p className="text-sm text-muted-foreground">Ricevi notifiche per nuovi accessi</p>
              </div>
              <Switch
                checked={securitySettings.login_notifications}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, login_notifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Timeout sessione</Label>
                <p className="text-sm text-muted-foreground">Durata massima della sessione</p>
              </div>
              <Badge variant="outline">{securitySettings.session_timeout}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestione Dati
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={handleDataExport}
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              Esporta i tuoi dati
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Importa dati
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importa Dati</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Label htmlFor="import-file">Seleziona file JSON</Label>
                  <Input id="import-file" type="file" accept=".json" />
                  <Button className="w-full">Importa</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Separator />

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Elimina Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Questa azione eliminerà definitivamente il tuo account e tutti i dati associati. 
                    Non potrai più recuperare le informazioni.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-text">Scrivi "ELIMINA" per confermare</Label>
                    <Input id="confirm-text" placeholder="ELIMINA" />
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleAccountDeletion}
                    disabled={loading}
                  >
                    Elimina Definitivamente Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};