import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, Cookie, Shield, BarChart3, Target } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_TYPES = [
  {
    id: 'necessary',
    name: 'Cookie Necessari',
    description: 'Essenziali per il funzionamento del sito',
    icon: Shield,
    required: true
  },
  {
    id: 'analytics',
    name: 'Cookie Analitici',
    description: 'Ci aiutano a migliorare il sito analizzando il comportamento degli utenti',
    icon: BarChart3,
    required: false
  },
  {
    id: 'marketing',
    name: 'Cookie Marketing',
    description: 'Utilizzati per mostrare pubblicità personalizzata',
    icon: Target,
    required: false
  }
] as const;

export const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  });
  const { user } = useAuth();

  useEffect(() => {
    checkCookieConsent();
  }, [user]);

  const checkCookieConsent = async () => {
    if (user) {
      // Per utenti autenticati, controlla il database
      const { data } = await supabase
        .from('profiles')
        .select('cookie_consent')
        .eq('user_id', user.id)
        .single();
      
      if (!data?.cookie_consent) {
        setIsVisible(true);
      }
    } else {
      // Per ospiti, controlla localStorage
      const consent = localStorage.getItem('cookie_consent');
      if (!consent) {
        setIsVisible(true);
      }
    }
  };

  const handleAcceptAll = async () => {
    const fullPreferences = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    
    await saveCookiePreferences(fullPreferences);
    setIsVisible(false);
  };

  const handleAcceptSelected = async () => {
    await saveCookiePreferences(preferences);
    setIsVisible(false);
  };

  const handleRejectAll = async () => {
    const minimalPreferences = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    
    await saveCookiePreferences(minimalPreferences);
    setIsVisible(false);
  };

  const saveCookiePreferences = async (prefs: CookiePreferences) => {
    const consentData = {
      ...prefs,
      timestamp: new Date().toISOString()
    };

    if (user) {
      // Salva nel database per utenti autenticati
      const { error } = await supabase
        .from('profiles')
        .update({
          cookie_consent: consentData,
          cookie_consent_date: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Errore",
          description: "Impossibile salvare le preferenze cookie",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Salva in localStorage per ospiti
      localStorage.setItem('cookie_consent', JSON.stringify(consentData));
    }

    // Applica le preferenze immediatamente
    applyCookiePreferences(prefs);
    
    toast({
      title: "Preferenze salvate",
      description: "Le tue preferenze sui cookie sono state aggiornate"
    });
  };

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Configura Google Analytics se abilitato
    if (prefs.analytics && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }

    // Configura cookie marketing se abilitati
    if (prefs.marketing && window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: 'granted'
      });
    }
  };

  const updatePreference = (type: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Cookie e Privacy</CardTitle>
              <CardDescription>
                Utilizziamo i cookie per migliorare la tua esperienza su I Malati dello Sport
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {!showDetails ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Utilizziamo cookie necessari per il funzionamento del sito e cookie opzionali 
                per analisi e marketing. Puoi scegliere quali accettare.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleAcceptAll} className="flex-1 min-w-[120px]">
                  Accetta Tutti
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetails(true)}
                  className="flex-1 min-w-[120px]"
                >
                  Personalizza
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleRejectAll}
                  className="flex-1 min-w-[120px]"
                >
                  Rifiuta Opzionali
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {COOKIE_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.id} className="flex items-start space-x-3 p-3 border border-border/50 rounded-lg">
                      <div className="flex items-center space-x-2 flex-1">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <div className="flex-1">
                          <Label className="text-sm font-medium">{type.name}</Label>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                      <Checkbox
                        checked={preferences[type.id as keyof CookiePreferences]}
                        onCheckedChange={(checked) => 
                          updatePreference(type.id as keyof CookiePreferences, Boolean(checked))
                        }
                        disabled={type.required}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleAcceptSelected} className="flex-1 min-w-[120px]">
                  Salva Preferenze
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetails(false)}
                  className="flex-1 min-w-[120px]"
                >
                  Indietro
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Leggi la nostra{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>{' '}
            e i{' '}
            <a href="/terms" className="text-primary hover:underline">
              Termini di Servizio
            </a>{' '}
            per maggiori informazioni.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};