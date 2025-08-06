import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Download, Trash2, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PrivacyPolicy = () => {
  const { user } = useAuth();

  const handleDataExport = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere autenticato per esportare i tuoi dati",
        variant: "destructive"
      });
      return;
    }

    try {
      // Crea richiesta di esportazione dati
      const { data, error } = await supabase
        .from('data_exports')
        .insert({
          user_id: user.id,
          status: 'pending',
          export_type: 'full'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Richiesta inviata",
        description: "La tua richiesta di esportazione dati è stata inviata. Riceverai un'email quando sarà pronta."
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare la richiesta di esportazione",
        variant: "destructive"
      });
    }
  };

  const handleAccountDeletion = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere autenticato per eliminare il tuo account",
        variant: "destructive"
      });
      return;
    }

    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile."
    );

    if (!confirmed) return;

    try {
      // Crea richiesta di cancellazione dati
      const { error } = await supabase
        .from('data_deletions')
        .insert({
          user_id: user.id,
          status: 'pending',
          reason: 'user_request'
        });

      if (error) throw error;

      toast({
        title: "Richiesta inviata",
        description: "La tua richiesta di cancellazione account è stata inviata. Riceverai conferma via email."
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare la richiesta di cancellazione",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            I Malati dello Sport - Informativa sulla Privacy
          </p>
          <p className="text-sm text-muted-foreground">
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>

        {/* GDPR Actions per utenti autenticati */}
        {user && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                I Tuoi Diritti GDPR
              </CardTitle>
              <CardDescription>
                Gestisci i tuoi dati personali in conformità al GDPR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={handleDataExport} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Esporta i Miei Dati
                </Button>
                <Button onClick={handleAccountDeletion} variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Elimina Account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sezioni Privacy Policy */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                1. Titolare del Trattamento
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Il titolare del trattamento dei dati personali è <strong>I Malati dello Sport</strong>.
              </p>
              <p>
                <strong>Contatti:</strong><br />
                Email: privacy@imalatidellosport.it<br />
                Data Protection Officer: dpo@imalatidellosport.it
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                2. Tipologie di Dati Raccolti
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Dati forniti volontariamente:</h4>
              <ul>
                <li>Indirizzo email (per registrazione e comunicazioni)</li>
                <li>Username (per identificazione pubblica)</li>
                <li>Bio e foto profilo (opzionali)</li>
                <li>Preferenze sportive</li>
              </ul>
              
              <h4>Dati raccolti automaticamente:</h4>
              <ul>
                <li>Indirizzo IP</li>
                <li>Informazioni sul browser e dispositivo</li>
                <li>Cookie tecnici e di analytics</li>
                <li>Log di accesso e attività sul sito</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>3. Base Giuridica del Trattamento</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <ul>
                <li><strong>Consenso</strong>: per newsletter, cookie di marketing e profilazione</li>
                <li><strong>Esecuzione del contratto</strong>: per fornire i servizi richiesti</li>
                <li><strong>Legittimo interesse</strong>: per analytics, sicurezza e miglioramento del servizio</li>
                <li><strong>Obbligo legale</strong>: per conservazione dati fiscali e legali</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>4. Finalità del Trattamento</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <ul>
                <li>Gestione account utente e autenticazione</li>
                <li>Pubblicazione e gestione contenuti</li>
                <li>Invio comunicazioni e newsletter (con consenso)</li>
                <li>Analytics e miglioramento del sito</li>
                <li>Sicurezza e prevenzione frodi</li>
                <li>Adempimenti legali e fiscali</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>5. Conservazione dei Dati</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <ul>
                <li><strong>Dati account</strong>: fino alla cancellazione dell'account</li>
                <li><strong>Contenuti pubblicati</strong>: fino alla loro rimozione</li>
                <li><strong>Log di accesso</strong>: 12 mesi</li>
                <li><strong>Cookie analytics</strong>: 24 mesi</li>
                <li><strong>Dati fiscali</strong>: 10 anni (obbligo legale)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>6. I Tuoi Diritti</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>Ai sensi del GDPR hai diritto a:</p>
              <ul>
                <li><strong>Accesso</strong>: ottenere copia dei tuoi dati</li>
                <li><strong>Rettifica</strong>: correggere dati inesatti</li>
                <li><strong>Cancellazione</strong>: richiedere la rimozione dei dati</li>
                <li><strong>Limitazione</strong>: limitare il trattamento</li>
                <li><strong>Portabilità</strong>: ottenere i dati in formato strutturato</li>
                <li><strong>Opposizione</strong>: opporti al trattamento</li>
                <li><strong>Revoca consenso</strong>: ritirare il consenso in qualsiasi momento</li>
              </ul>
              <p>
                Per esercitare questi diritti, contatta: <strong>privacy@imalatidellosport.it</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>7. Cookie e Tecnologie di Tracciamento</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Per informazioni dettagliate sui cookie utilizzati, consulta la nostra{' '}
                <a href="/cookie-policy" className="text-primary hover:underline">
                  Cookie Policy
                </a>.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>8. Sicurezza dei Dati</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Adottiamo misure tecniche e organizzative appropriate per proteggere i tuoi dati:
              </p>
              <ul>
                <li>Crittografia dei dati in transito (HTTPS/TLS)</li>
                <li>Crittografia dei dati a riposo</li>
                <li>Controlli di accesso e autenticazione</li>
                <li>Monitoraggio e log di sicurezza</li>
                <li>Backup regolari e piani di disaster recovery</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                9. Contatti
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Per qualsiasi domanda relativa a questa Privacy Policy o per esercitare i tuoi diritti:
              </p>
              <ul>
                <li><strong>Email Privacy</strong>: privacy@imalatidellosport.it</li>
                <li><strong>Data Protection Officer</strong>: dpo@imalatidellosport.it</li>
                <li><strong>Autorità di controllo</strong>: Garante per la protezione dei dati personali (www.garanteprivacy.it)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;