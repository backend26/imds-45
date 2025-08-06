import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function CookiePolicy() {
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Cookie Policy</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Gestione Cookie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Cookie strettamente necessari</h3>
                  <p className="text-muted-foreground text-sm">
                    Questi cookie sono essenziali per il funzionamento del sito.
                  </p>
                </div>
                <Switch
                  checked={cookieConsent !== false}
                  onCheckedChange={(checked) => setCookieConsent(checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="prose prose-lg max-w-none">
            <h2>Informazioni sui Cookie</h2>
            <p>
              I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo 
              quando visiti il nostro sito web. Utilizziamo solo cookie strettamente necessari 
              per il funzionamento del sito.
            </p>

            <h3>Cookie Utilizzati</h3>
            <ul>
              <li><strong>Cookie di autenticazione:</strong> Per mantenere la sessione utente</li>
              <li><strong>Cookie di preferenze:</strong> Per ricordare le tue impostazioni</li>
              <li><strong>Cookie di sicurezza:</strong> Per proteggere da attacchi</li>
            </ul>

            <h3>Gestione dei Cookie</h3>
            <p>
              Puoi modificare le tue preferenze sui cookie in qualsiasi momento utilizzando 
              il pannello di controllo sopra. Puoi anche configurare il tuo browser per 
              rifiutare i cookie.
            </p>

            <h3>Contatti</h3>
            <p>
              Per domande su questa Cookie Policy, contattaci all'indirizzo: 
              privacy@imalatidellosport.it
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}