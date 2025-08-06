import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Settings, BarChart3, Target, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const CookiePolicy = () => {
  const openCookieSettings = () => {
    // Trigger cookie banner to show again
    localStorage.removeItem('cookie_consent');
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">Cookie Policy</h1>
          <p className="text-lg text-muted-foreground">
            I Malati dello Sport - Informativa sui Cookie
          </p>
          <p className="text-sm text-muted-foreground">
            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>

        {/* Cookie Settings */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Gestisci le tue preferenze</h3>
                  <p className="text-sm text-muted-foreground">
                    Puoi modificare le tue preferenze sui cookie in qualsiasi momento
                  </p>
                </div>
              </div>
              <Button onClick={openCookieSettings} variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Modifica Preferenze
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sezioni Cookie Policy */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                1. Cosa sono i Cookie
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo 
                quando visiti un sito web. Vengono utilizzati per far funzionare i siti web 
                in modo più efficiente e per fornire informazioni ai proprietari del sito.
              </p>
              
              <h4>Tipologie di cookie utilizzati:</h4>
              <ul>
                <li><strong>Cookie tecnici</strong>: essenziali per il funzionamento del sito</li>
                <li><strong>Cookie di prestazione</strong>: raccolgono informazioni su come i visitatori utilizzano il sito</li>
                <li><strong>Cookie di funzionalità</strong>: permettono di ricordare le scelte dell'utente</li>
                <li><strong>Cookie di profilazione</strong>: utilizzati per creare profili e mostrare pubblicità personalizzata</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                2. Cookie Necessari
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Questi cookie sono essenziali per il funzionamento del sito web e non possono essere disabilitati.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-2 text-left">Cookie</th>
                      <th className="border border-border p-2 text-left">Finalità</th>
                      <th className="border border-border p-2 text-left">Durata</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-2"><code>session_id</code></td>
                      <td className="border border-border p-2">Gestione sessione utente</td>
                      <td className="border border-border p-2">Sessione</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2"><code>csrf_token</code></td>
                      <td className="border border-border p-2">Protezione da attacchi CSRF</td>
                      <td className="border border-border p-2">Sessione</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2"><code>cookie_consent</code></td>
                      <td className="border border-border p-2">Memorizza le preferenze sui cookie</td>
                      <td className="border border-border p-2">1 anno</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2"><code>theme_preference</code></td>
                      <td className="border border-border p-2">Memorizza il tema scelto (dark/light)</td>
                      <td className="border border-border p-2">1 anno</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                3. Cookie Analitici
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Questi cookie ci aiutano a capire come i visitatori interagiscono con il sito web, 
                fornendoci informazioni su come migliorare l'esperienza utente.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-2 text-left">Servizio</th>
                      <th className="border border-border p-2 text-left">Cookie</th>
                      <th className="border border-border p-2 text-left">Finalità</th>
                      <th className="border border-border p-2 text-left">Durata</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-2">Google Analytics</td>
                      <td className="border border-border p-2"><code>_ga, _ga_*</code></td>
                      <td className="border border-border p-2">Analisi del traffico e comportamento utenti</td>
                      <td className="border border-border p-2">2 anni</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2">Google Analytics</td>
                      <td className="border border-border p-2"><code>_gid</code></td>
                      <td className="border border-border p-2">Identificazione sessioni uniche</td>
                      <td className="border border-border p-2">24 ore</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2">Hotjar</td>
                      <td className="border border-border p-2"><code>_hjid, _hjIncludedInPageviewSample</code></td>
                      <td className="border border-border p-2">Analisi heatmap e registrazioni sessioni</td>
                      <td className="border border-border p-2">1 anno</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Base giuridica:</strong> Legittimo interesse per migliorare il servizio. 
                Puoi opporti in qualsiasi momento modificando le tue preferenze.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                4. Cookie di Marketing
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Questi cookie sono utilizzati per mostrare pubblicità più pertinenti ai tuoi interessi 
                e per misurare l'efficacia delle campagne pubblicitarie.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-2 text-left">Servizio</th>
                      <th className="border border-border p-2 text-left">Cookie</th>
                      <th className="border border-border p-2 text-left">Finalità</th>
                      <th className="border border-border p-2 text-left">Durata</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-2">Google Ads</td>
                      <td className="border border-border p-2"><code>_gcl_*, _gac_*</code></td>
                      <td className="border border-border p-2">Tracciamento conversioni e remarketing</td>
                      <td className="border border-border p-2">90 giorni</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2">Facebook Pixel</td>
                      <td className="border border-border p-2"><code>_fbp, _fbc</code></td>
                      <td className="border border-border p-2">Pubblicità personalizzata su Facebook</td>
                      <td className="border border-border p-2">90 giorni</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2">LinkedIn Insight</td>
                      <td className="border border-border p-2"><code>li_*, bcookie</code></td>
                      <td className="border border-border p-2">Pubblicità su piattaforme LinkedIn</td>
                      <td className="border border-border p-2">2 anni</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Base giuridica:</strong> Consenso esplicito. Puoi revocare il consenso 
                in qualsiasi momento modificando le tue preferenze.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>5. Cookie di Terze Parti</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Alcuni cookie sono impostati da servizi di terze parti che appaiono sulle nostre pagine:
              </p>
              
              <h4>Contenuti incorporati:</h4>
              <ul>
                <li><strong>YouTube</strong>: per video incorporati</li>
                <li><strong>Twitter</strong>: per tweet incorporati</li>
                <li><strong>Instagram</strong>: per post incorporati</li>
                <li><strong>Google Maps</strong>: per mappe incorporate</li>
              </ul>
              
              <p>
                Questi servizi possono impostare i propri cookie per i quali rimandiamo 
                alle rispettive privacy policy:
              </p>
              <ul>
                <li><a href="https://policies.google.com/privacy" className="text-primary hover:underline">Google Privacy Policy</a></li>
                <li><a href="https://twitter.com/privacy" className="text-primary hover:underline">Twitter Privacy Policy</a></li>
                <li><a href="https://help.instagram.com/519522125107875" className="text-primary hover:underline">Instagram Privacy Policy</a></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                6. Come Gestire i Cookie
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Tramite il nostro banner:</h4>
              <p>
                Puoi gestire le tue preferenze usando il banner che appare al primo accesso 
                o cliccando il pulsante "Modifica Preferenze" in cima a questa pagina.
              </p>
              
              <h4>Tramite il browser:</h4>
              <p>
                Puoi anche gestire i cookie direttamente dalle impostazioni del tuo browser:
              </p>
              <ul>
                <li><strong>Chrome</strong>: Impostazioni → Privacy e sicurezza → Cookie e altri dati dei siti</li>
                <li><strong>Firefox</strong>: Impostazioni → Privacy e sicurezza → Cookie e dati dei siti web</li>
                <li><strong>Safari</strong>: Preferenze → Privacy → Gestisci dati dei siti web</li>
                <li><strong>Edge</strong>: Impostazioni → Cookie e autorizzazioni sito</li>
              </ul>
              
              <h4>Strumenti di opt-out:</h4>
              <ul>
                <li><a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline">Google Analytics Opt-out</a></li>
                <li><a href="https://www.facebook.com/settings?tab=ads" className="text-primary hover:underline">Facebook Ads Preferences</a></li>
                <li><a href="https://optout.aboutads.info/" className="text-primary hover:underline">Digital Advertising Alliance Opt-out</a></li>
              </ul>
              
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg mt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong>Attenzione:</strong> Disabilitare tutti i cookie potrebbe limitare 
                    alcune funzionalità del sito e peggiorare l'esperienza di navigazione.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>7. Aggiornamenti</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Questa Cookie Policy può essere aggiornata periodicamente per riflettere 
                cambiamenti nei cookie utilizzati o per motivi normativi.
              </p>
              
              <p>
                Gli aggiornamenti saranno comunicati tramite:
              </p>
              <ul>
                <li>Aggiornamento della data in questa pagina</li>
                <li>Banner informativo sul sito (per modifiche sostanziali)</li>
                <li>Email agli utenti registrati (per modifiche importanti)</li>
              </ul>
              
              <p>
                Ti invitiamo a consultare regolarmente questa pagina per rimanere aggiornato 
                sulle nostre pratiche relative ai cookie.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>8. Contatti</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Per domande o chiarimenti su questa Cookie Policy:
              </p>
              <ul>
                <li><strong>Email</strong>: privacy@imalatidellosport.it</li>
                <li><strong>Data Protection Officer</strong>: dpo@imalatidellosport.it</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;