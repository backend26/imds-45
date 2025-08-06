import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function CookiePolicy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(true);
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    // Load existing consent
    if (user) {
      loadUserConsent();
    } else {
      loadGuestConsent();
    }
  }, [user]);

  const loadUserConsent = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('cookie_consent')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      const consent = data?.cookie_consent as any;
      setCookieConsent(consent?.consent ?? null);
    } catch (error) {
      console.error('Error loading consent:', error);
    }
  };

  const loadGuestConsent = () => {
    const stored = localStorage.getItem('cookie_consent');
    if (stored) {
      const consent = JSON.parse(stored);
      setCookieConsent(consent.consent);
    }
  };

  const saveConsent = async (consent: boolean) => {
    setLoading(true);
    
    try {
      const consentData = {
        consent,
        date: new Date().toISOString()
      };

      if (user) {
        // Save to database for authenticated users
        const { error } = await supabase
          .from('profiles')
          .update({
            cookie_consent: consentData,
            cookie_consent_date: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Save to localStorage for guests
        localStorage.setItem('cookie_consent', JSON.stringify(consentData));
      }

      setCookieConsent(consent);
      
      toast({
        title: "Preferenze salvate",
        description: `Consenso ai cookie ${consent ? 'accettato' : 'rifiutato'}`,
      });
    } catch (error) {
      console.error('Error saving consent:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le preferenze",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Cookie Policy</h1>
            <p className="text-muted-foreground">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cookie Strettamente Necessari</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Utilizziamo solo cookie strettamente necessari per il funzionamento del sito:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Autenticazione:</strong> Per mantenere la sessione di login</li>
                <li><strong>Preferenze:</strong> Per ricordare le tue scelte di tema e layout</li>
                <li><strong>Sicurezza:</strong> Per proteggere da attacchi CSRF</li>
                <li><strong>Consenso:</strong> Per ricordare la tua scelta sui cookie</li>
              </ul>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Le tue preferenze</h3>
                <div className="flex items-center justify-between">
                  <span>Consenso ai cookie necessari</span>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={cookieConsent === true}
                      onCheckedChange={(checked) => saveConsent(checked)}
                      disabled={loading}
                    />
                    <span className="text-sm text-muted-foreground">
                      {cookieConsent === null ? 'Non impostato' : 
                       cookieConsent ? 'Accettato' : 'Rifiutato'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={() => saveConsent(true)}
                    disabled={loading}
                    variant={cookieConsent === true ? "default" : "outline"}
                  >
                    Accetto
                  </Button>
                  <Button 
                    onClick={() => saveConsent(false)}
                    disabled={loading}
                    variant={cookieConsent === false ? "destructive" : "outline"}
                  >
                    Rifiuto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informazioni Tecniche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Cookie di Sessione</h4>
                  <p className="text-sm text-muted-foreground">
                    Durata: Fino alla chiusura del browser<br/>
                    Finalità: Autenticazione e sicurezza
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Cookie di Preferenze</h4>
                  <p className="text-sm text-muted-foreground">
                    Durata: 1 anno<br/>
                    Finalità: Mantenere le impostazioni utente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>I Tuoi Diritti</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Puoi modificare le tue preferenze sui cookie in qualsiasi momento tornando su questa pagina. 
                Per ulteriori informazioni sul trattamento dei dati, consulta la nostra 
                <a href="/privacy-policy" className="text-primary hover:underline ml-1">Privacy Policy</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}