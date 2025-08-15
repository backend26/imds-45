import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChiSiamo() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    document.title = "Chi Siamo | I Malati dello Sport";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Scopri chi siamo e la nostra passione per lo sport. Il team di I Malati dello Sport.');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Chi Siamo
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Siamo una community di appassionati che vive lo sport con intensità e dedizione assoluta
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">La Nostra Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Portare la passione sportiva italiana nel digitale, creando uno spazio dove i veri 
                appassionati possono condividere emozioni, analisi e momenti indimenticabili.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">I Nostri Valori</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Passione autentica per lo sport</li>
                <li>• Rispetto per tutti gli atleti</li>
                <li>• Community inclusiva e accogliente</li>
                <li>• Qualità dei contenuti</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">La Nostra Visione</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Diventare il punto di riferimento per gli appassionati di sport in Italia, 
                dove la passione si trasforma in contenuti di qualità e connessioni autentiche.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-center mb-4">La Nostra Storia</CardTitle>
              <CardDescription className="text-center text-lg">
                Nati dalla passione, cresciuti con la community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                "I Malati dello Sport" nasce dall'idea di creare uno spazio digitale dove la passione 
                sportiva italiana possa esprimersi liberamente. Siamo partiti da un piccolo gruppo di 
                amici che condividevano la stessa ossessione per il calcio, il tennis, la Formula 1 e 
                tutti gli sport che fanno battere il cuore.
              </p>
              
              <p className="text-muted-foreground text-lg leading-relaxed">
                Con il tempo, abbiamo capito che questa passione era condivisa da migliaia di persone 
                in tutta Italia. Così abbiamo deciso di costruire una piattaforma che potesse unire 
                tutti i "malati" dello sport: un luogo dove le emozioni, le analisi e i momenti 
                indimenticabili potessero essere condivisi e celebrati insieme.
              </p>

              <p className="text-muted-foreground text-lg leading-relaxed">
                Oggi siamo una community in crescita costante, fatta di giornalisti sportivi, 
                ex-atleti, semplici appassionati e tutti coloro che credono che lo sport sia 
                molto più di un semplice gioco: è passione, è vita, è condivisione.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Unisciti alla Famiglia
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Se anche tu sei un "malato" dello sport, se vivi ogni partita, ogni gara, ogni momento 
            sportivo con il cuore in gola, allora sei nel posto giusto. Benvenuto nella famiglia!
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}