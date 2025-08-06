import { useState, useEffect } from 'react';
import { Button } from './button';
import { X, Cookie, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Switch } from './switch';
import { Label } from './label';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export const CookieConsentBanner = () => {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: true
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = async () => {
    const allPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    await saveConsent(allPreferences);
  };

  const handleAcceptSelected = async () => {
    await saveConsent(preferences);
  };

  const handleRejectAll = async () => {
    const minimalPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    await saveConsent(minimalPreferences);
  };

  const saveConsent = async (prefs: typeof preferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    if (user) {
      try {
        // Save to database when connected
        console.log('Cookie consent saved:', prefs);
      } catch (error) {
        console.error('Error saving cookie consent:', error);
      }
    }
    
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 max-w-sm bg-card border border-border rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-2">Cookie e Privacy</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Utilizziamo cookie per migliorare la tua esperienza. Alcuni sono necessari per il funzionamento del sito.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAcceptAll} className="flex-1">
                  Accetta tutti
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowSettings(true)}
                  className="px-2"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleRejectAll}
                className="text-xs"
              >
                Solo necessari
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={() => setShowBanner(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Impostazioni Cookie</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="font-medium">Cookie Necessari</Label>
                <p className="text-xs text-muted-foreground">
                  Indispensabili per il funzionamento del sito
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="font-medium">Cookie Funzionali</Label>
                <p className="text-xs text-muted-foreground">
                  Migliorano l'esperienza utente
                </p>
              </div>
              <Switch 
                checked={preferences.functional}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, functional: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="font-medium">Cookie Analitici</Label>
                <p className="text-xs text-muted-foreground">
                  Aiutano a capire come viene utilizzato il sito
                </p>
              </div>
              <Switch 
                checked={preferences.analytics}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, analytics: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="font-medium">Cookie Marketing</Label>
                <p className="text-xs text-muted-foreground">
                  Personalizzano pubblicità e contenuti
                </p>
              </div>
              <Switch 
                checked={preferences.marketing}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleAcceptSelected} className="flex-1">
              Salva preferenze
            </Button>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Annulla
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};