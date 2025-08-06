import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Data di pubblicazione: {new Date().toLocaleDateString('it-IT')}<br/>
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. Titolare del Trattamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <strong>I Malati dello Sport</strong><br/>
                Email: info@malatidellosport.it<br/>
                La presente privacy policy descrive le modalità di raccolta, utilizzo e protezione dei dati personali.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Dati Raccolti e Finalità</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Dati di Registrazione</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Dati:</strong> Email, username, password (crittografata)<br/>
                  <strong>Finalità:</strong> Creazione e gestione dell'account utente<br/>
                  <strong>Base giuridica:</strong> Esecuzione del contratto (Art. 6.1.b GDPR)<br/>
                  <strong>Durata:</strong> Fino alla cancellazione dell'account
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Dati di Profilo</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Dati:</strong> Biografia, foto profilo, sport preferiti<br/>
                  <strong>Finalità:</strong> Personalizzazione dell'esperienza utente<br/>
                  <strong>Base giuridica:</strong> Consenso (Art. 6.1.a GDPR)<br/>
                  <strong>Durata:</strong> Fino alla modifica o cancellazione da parte dell'utente
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Dati di Interazione</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Dati:</strong> Like, bookmark, commenti, valutazioni<br/>
                  <strong>Finalità:</strong> Funzionamento del servizio e interazioni sociali<br/>
                  <strong>Base giuridica:</strong> Legittimo interesse (Art. 6.1.f GDPR)<br/>
                  <strong>Durata:</strong> 3 anni dall'ultima interazione
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Dati Tecnici</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Dati:</strong> Indirizzo IP, browser, sessioni di accesso<br/>
                  <strong>Finalità:</strong> Sicurezza, prevenzione frodi, statistiche anonime<br/>
                  <strong>Base giuridica:</strong> Legittimo interesse (Art. 6.1.f GDPR)<br/>
                  <strong>Durata:</strong> 6 mesi per i log, 30 giorni per le sessioni
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Storage e Sicurezza</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                I tuoi dati sono memorizzati su server sicuri localizzati nell'Unione Europea (Supabase/AWS EU). 
                Implementiamo misure di sicurezza tecniche e organizzative appropriate, inclusi:
              </p>
              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                <li>Crittografia dei dati sensibili</li>
                <li>Accesso limitato al personale autorizzato</li>
                <li>Backup regolari e sicuri</li>
                <li>Monitoraggio continuo delle attività</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. I Tuoi Diritti (GDPR)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ai sensi del Regolamento UE 2016/679, hai diritto a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Accesso:</strong> Ottenere copia dei tuoi dati (disponibile in /account)</li>
                <li><strong>Rettifica:</strong> Correggere dati inesatti (modificabile in /account)</li>
                <li><strong>Cancellazione:</strong> Richiedere la rimozione dei dati (opzione in /account)</li>
                <li><strong>Portabilità:</strong> Esportare i tuoi dati in formato leggibile</li>
                <li><strong>Opposizione:</strong> Opporti al trattamento per finalità di marketing</li>
                <li><strong>Limitazione:</strong> Richiedere la sospensione del trattamento</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Per esercitare questi diritti, contatta: info@malatidellosport.it
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Condivisione con Terzi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Non vendiamo né condividiamo i tuoi dati personali con terzi per scopi commerciali. 
                Condividiamo dati solo quando:
              </p>
              <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                <li>Richiesto dalla legge o da autorità competenti</li>
                <li>Necessario per fornitori di servizi essenziali (hosting, email)</li>
                <li>Con il tuo consenso esplicito</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Modifiche e Contatti</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ci riserviamo il diritto di aggiornare questa privacy policy. 
                Le modifiche sostanziali saranno comunicate via email o tramite avviso sul sito.
                <br/><br/>
                Per domande sulla privacy: <strong>privacy@malatidellosport.it</strong><br/>
                Autorità di controllo: <strong>Garante per la Protezione dei Dati Personali</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}