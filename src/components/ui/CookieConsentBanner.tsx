import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

export const CookieConsentBanner = () => {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConsentStatus();
  }, [user]);

  const checkConsentStatus = async () => {
    try {
      if (user) {
        // Check database for authenticated users
        const { data, error } = await supabase
          .from('profiles')
          .select('cookie_consent')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        const consent = data?.cookie_consent as any;
        setShowBanner(!consent?.consent && consent?.consent !== false);
      } else {
        // Check localStorage for guests
        const stored = localStorage.getItem('cookie_consent');
        if (!stored) {
          setShowBanner(true);
        } else {
          const consent = JSON.parse(stored);
          setShowBanner(!consent.consent && consent.consent !== false);
        }
      }
    } catch (error) {
      console.error('Error checking consent:', error);
      // Show banner on error to be safe
      setShowBanner(true);
    }
  };

  const handleConsent = async (consent: boolean) => {
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

      setShowBanner(false);
      
      // Apply consent logic
      if (consent) {
        // Enable necessary cookies
        document.cookie = "consent=true; path=/; max-age=31536000; SameSite=Lax";
      } else {
        // Disable non-essential cookies
        document.cookie = "consent=false; path=/; max-age=31536000; SameSite=Lax";
      }
    } catch (error) {
      console.error('Error saving consent:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl bg-card/95 backdrop-blur-sm border shadow-lg">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Cookie e Privacy
              </h3>
              <p className="text-sm text-muted-foreground">
                Utilizziamo cookie strettamente necessari per il funzionamento del sito 
                (autenticazione, sicurezza, preferenze). Non utilizziamo cookie di 
                tracciamento o marketing.
              </p>
              <p className="text-xs text-muted-foreground">
                Consulta la nostra{" "}
                <a 
                  href="/cookie-policy" 
                  className="text-primary hover:underline"
                >
                  Cookie Policy
                </a>
                {" "}e{" "}
                <a 
                  href="/privacy-policy" 
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </a>
                {" "}per maggiori dettagli.
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBanner(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              onClick={() => handleConsent(true)}
              disabled={loading}
              className="flex-1 min-w-0"
            >
              Accetto i Cookie
            </Button>
            <Button
              onClick={() => handleConsent(false)}
              disabled={loading}
              variant="outline"
              className="flex-1 min-w-0"
            >
              Rifiuto
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="whitespace-nowrap"
            >
              <a href="/cookie-policy">
                Personalizza
              </a>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};