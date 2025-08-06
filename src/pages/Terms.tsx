import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, Scale, Shield, Users } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">Termini di Servizio</h1>
          <p className="text-lg text-muted-foreground">
            I Malati dello Sport - Condizioni d'Uso
          </p>
          <p className="text-sm text-muted-foreground">
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>

        {/* Alert */}
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">
                  <strong>Importante:</strong> Utilizzando il servizio "I Malati dello Sport" accetti automaticamente 
                  questi termini di servizio. Se non sei d'accordo, non utilizzare il servizio.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sezioni Termini */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                1. Oggetto del Servizio
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                "I Malati dello Sport" è una piattaforma digitale che offre:
              </p>
              <ul>
                <li>Contenuti editoriali sportivi originali</li>
                <li>Sistema di commenti e interazione community</li>
                <li>Funzionalità di registrazione e profilo utente</li>
                <li>Sistema di valutazioni e preferiti</li>
                <li>Newsletter e notifiche personalizzate</li>
              </ul>
              <p>
                Il servizio è fornito gratuitamente con possibili funzionalità premium future.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                2. Registrazione e Account Utente
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Requisiti per la registrazione:</h4>
              <ul>
                <li>Età minima: 13 anni (con consenso genitoriale se minore di 16)</li>
                <li>Email valida e verificabile</li>
                <li>Username univoco e appropriato</li>
                <li>Accettazione di Privacy Policy e Termini di Servizio</li>
              </ul>
              
              <h4>Responsabilità dell'utente:</h4>
              <ul>
                <li>Fornire informazioni veritiere e aggiornate</li>
                <li>Mantenere riservate le credenziali di accesso</li>
                <li>Notificare immediatamente accessi non autorizzati</li>
                <li>Utilizzare il servizio in conformità alle regole</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                3. Regole di Comportamento
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>È vietato:</h4>
              <ul>
                <li>Pubblicare contenuti diffamatori, offensivi o discriminatori</li>
                <li>Condividere contenuti protetti da copyright senza autorizzazione</li>
                <li>Utilizzare linguaggio volgare o inappropriato</li>
                <li>Fare spam o pubblicità non autorizzata</li>
                <li>Impersonare altre persone o entità</li>
                <li>Tentare di accedere illegalmente ad account altrui</li>
                <li>Interferire con il normale funzionamento del servizio</li>
                <li>Pubblicare contenuti illegali o che incitano alla violenza</li>
              </ul>
              
              <h4>Conseguenze delle violazioni:</h4>
              <ul>
                <li>Avvertimento formale</li>
                <li>Rimozione del contenuto</li>
                <li>Sospensione temporanea dell'account</li>
                <li>Eliminazione definitiva dell'account</li>
                <li>Segnalazione alle autorità competenti (se necessario)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>4. Proprietà Intellettuale</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Contenuti della piattaforma:</h4>
              <p>
                Tutti i contenuti originali pubblicati da "I Malati dello Sport" 
                (articoli, immagini, video, loghi) sono protetti da copyright e rimangono 
                di proprietà esclusiva della piattaforma.
              </p>
              
              <h4>Contenuti degli utenti:</h4>
              <ul>
                <li>Mantieni la proprietà dei contenuti che pubblichi</li>
                <li>Concedi a "I Malati dello Sport" licenza per utilizzare, modificare e distribuire i tuoi contenuti</li>
                <li>Garantisci di avere tutti i diritti sui contenuti che pubblichi</li>
                <li>Accetti che i tuoi contenuti possano essere moderati o rimossi</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>5. Privacy e Dati Personali</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Il trattamento dei dati personali è disciplinato dalla nostra{' '}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>, che costituisce parte integrante di questi Termini di Servizio.
              </p>
              
              <h4>Punti chiave:</h4>
              <ul>
                <li>Raccogliamo solo i dati necessari per il servizio</li>
                <li>Non vendiamo i tuoi dati a terzi</li>
                <li>Puoi richiedere l'esportazione o cancellazione dei tuoi dati</li>
                <li>Utilizziamo misure di sicurezza appropriate</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                6. Limitazioni di Responsabilità
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>"I Malati dello Sport" non è responsabile per:</h4>
              <ul>
                <li>Interruzioni temporanee del servizio per manutenzione</li>
                <li>Perdita di dati dovuta a problemi tecnici</li>
                <li>Contenuti pubblicati da altri utenti</li>
                <li>Danni derivanti dall'uso improprio del servizio</li>
                <li>Incompatibilità con dispositivi o software specifici</li>
              </ul>
              
              <h4>Disponibilità del servizio:</h4>
              <p>
                Il servizio è fornito "così com'è" senza garanzie di funzionamento continuo. 
                Ci impegniamo a mantenere la massima disponibilità possibile.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>7. Modifiche ai Termini</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                "I Malati dello Sport" si riserva il diritto di modificare questi 
                Termini di Servizio in qualsiasi momento per:
              </p>
              <ul>
                <li>Conformità a nuove normative</li>
                <li>Miglioramento del servizio</li>
                <li>Chiarimenti o correzioni</li>
              </ul>
              
              <p>
                <strong>Notifica delle modifiche:</strong>
              </p>
              <ul>
                <li>Email a tutti gli utenti registrati</li>
                <li>Banner informativo sul sito</li>
                <li>Aggiornamento della data in questa pagina</li>
              </ul>
              
              <p>
                Le modifiche entreranno in vigore 30 giorni dopo la notifica. 
                L'uso continuato del servizio costituisce accettazione delle modifiche.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>8. Risoluzione Controversie</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Legge applicabile:</h4>
              <p>
                Questi Termini sono disciplinati dalla legge italiana in conformità 
                alle normative europee (GDPR, Digital Services Act).
              </p>
              
              <h4>Risoluzione extragiudiziale:</h4>
              <p>
                Prima di adire le vie legali, le parti si impegnano a tentare 
                una risoluzione amichevole tramite:
              </p>
              <ul>
                <li>Contatto diretto: legal@imalatidellosport.it</li>
                <li>Mediazione attraverso organismi riconosciuti</li>
                <li>Procedure ADR (Alternative Dispute Resolution)</li>
              </ul>
              
              <h4>Giurisdizione:</h4>
              <p>
                Per eventuali controversie non risolte, è competente il 
                Tribunale di Milano, Italia.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>9. Contatti</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Per domande sui Termini di Servizio o per questioni legali:
              </p>
              <ul>
                <li><strong>Email legale</strong>: legal@imalatidellosport.it</li>
                <li><strong>Email generale</strong>: info@imalatidellosport.it</li>
                <li><strong>Segnalazioni</strong>: report@imalatidellosport.it</li>
              </ul>
              
              <p>
                <strong>Tempo di risposta:</strong> Normalmente entro 72 ore lavorative.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;