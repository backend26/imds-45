import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditions() {
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
            <h1 className="text-4xl font-bold text-foreground">Termini e Condizioni</h1>
            <p className="text-muted-foreground">
              Data di pubblicazione: {new Date().toLocaleDateString('it-IT')}<br/>
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. Accettazione dei Termini</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Accedendo e utilizzando il sito "I Malati dello Sport", accetti automaticamente 
                i presenti termini e condizioni. Se non accetti questi termini, ti preghiamo 
                di non utilizzare il nostro servizio.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Descrizione del Servizio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                "I Malati dello Sport" è una piattaforma digitale dedicata alle notizie sportive, 
                che offre contenuti editoriali, sistemi di interazione (like, commenti, valutazioni) 
                e funzionalità social per gli appassionati di sport.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Registrazione e Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Requisiti di Registrazione</h4>
                <p className="text-sm text-muted-foreground">
                  • Età minima: 16 anni<br/>
                  • Email valida e verificata<br/>
                  • Informazioni accurate e aggiornate<br/>
                  • Un solo account per persona
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold">Responsabilità dell'Account</h4>
                <p className="text-sm text-muted-foreground">
                  Sei responsabile della sicurezza del tuo account e di tutte le attività 
                  che avvengono sotto le tue credenziali. Devi notificarci immediatamente 
                  qualsiasi uso non autorizzato.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Contenuti e Proprietà Intellettuale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Contenuti del Sito</h4>
                <p className="text-sm text-muted-foreground">
                  Tutti i contenuti editoriali (articoli, immagini, video) sono protetti da copyright 
                  e appartengono a "I Malati dello Sport" o ai rispettivi proprietari. 
                  È vietata la riproduzione senza autorizzazione.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold">Contenuti Utente</h4>
                <p className="text-sm text-muted-foreground">
                  Pubblicando contenuti (commenti, valutazioni), concedi una licenza non esclusiva 
                  per utilizzarli nell'ambito del servizio. Rimani proprietario dei tuoi contenuti.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Codice di Condotta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">È vietato:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                <li>Pubblicare contenuti offensivi, diffamatori o illegali</li>
                <li>Utilizzare il servizio per spam o attività commerciali non autorizzate</li>
                <li>Impersonare altre persone o entità</li>
                <li>Interferire con il funzionamento del sito</li>
                <li>Violare i diritti di proprietà intellettuale</li>
                <li>Condividere informazioni private di altri utenti</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Moderazione e Sanzioni</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ci riserviamo il diritto di moderare, rimuovere contenuti e sospendere o 
                terminare account che violano questi termini. Le decisioni di moderazione 
                sono a nostra discrezione e possono essere applicate senza preavviso.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Limitazione di Responsabilità</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Il servizio è fornito "così com'è" senza garanzie di alcun tipo. 
                Non siamo responsabili per danni diretti, indiretti o consequenziali 
                derivanti dall'uso del servizio. La responsabilità è limitata al 
                massimo consentito dalla legge italiana.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Modifiche ai Termini</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Possiamo modificare questi termini in qualsiasi momento. Le modifiche 
                sostanziali saranno notificate via email o tramite avviso sul sito. 
                L'uso continuato del servizio dopo le modifiche costituisce accettazione 
                dei nuovi termini.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Risoluzione delle Controversie</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                I presenti termini sono regolati dalla legge italiana. 
                Per controversie, ci impegniamo prima a cercare una soluzione amichevole. 
                In caso di mancato accordo, sarà competente il Tribunale di Milano.
                <br/><br/>
                <strong>Contatti:</strong> legal@malatidellosport.it
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}