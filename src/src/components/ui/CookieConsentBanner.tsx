import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Cookie, FileText, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  accepted: boolean;
  timestamp: number;
}

export const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      accepted: true,
      timestamp: Date.now()
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      accepted: true,
      timestamp: Date.now()
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleReject = () => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      accepted: false,
      timestamp: Date.now()
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-md">
      <Card className="bg-background/95 backdrop-blur-sm border-border/80 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                Utilizziamo i cookie
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Usiamo cookie per migliorare la tua esperienza. 
                Continuando accetti la nostra{" "}
                <Link 
                  to="/privacy-policy" 
                  className="text-primary hover:underline font-medium"
                >
                  Privacy Policy
                </Link>{" "}
                e i{" "}
                <Link 
                  to="/terms-and-conditions" 
                  className="text-primary hover:underline font-medium"
                >
                  Termini e Condizioni
                </Link>
                .
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 p-0 hover:bg-secondary/80"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {showDetails && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span>Cookie necessari</span>
                  <span className="text-green-600 font-medium">Sempre attivi</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cookie analitici</span>
                  <span className="text-muted-foreground">Opzionali</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cookie marketing</span>
                  <span className="text-muted-foreground">Opzionali</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button
                onClick={handleAcceptAll}
                size="sm"
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Accetta tutti
              </Button>
              <Button
                onClick={handleAcceptNecessary}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Solo necessari
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="ghost"
                size="sm"
                className="flex-1 text-xs"
              >
                {showDetails ? "Nascondi" : "Dettagli"}
              </Button>
              <Link to="/cookie-policy">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Politica Cookie
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};