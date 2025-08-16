import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && true); // Default to dark
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
    document.title = "404 - Pagina Non Trovata | I Malati dello Sport";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Pagina non trovata. Torna alla home di I Malati dello Sport per continuare a leggere le migliori notizie sportive.');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-2xl w-full border-border/50 bg-card/50 backdrop-blur-sm text-center">
          <CardHeader className="pb-4">
            <div className="text-8xl font-bold text-primary mb-4">404</div>
            <CardTitle className="text-3xl mb-2">
              Oops! Pagina Non Trovata
            </CardTitle>
            <CardDescription className="text-lg">
              La pagina che stai cercando non esiste, è stata spostata o non è più disponibile.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Non preoccuparti! Puoi tornare alla home per scoprire le ultime notizie sportive 
              o utilizzare la ricerca per trovare quello che stavi cercando.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" />
                  Torna alla Home
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-5 w-5" />
                Torna Indietro
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Pagine Popolari
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link 
                  to="/calcio" 
                  className="text-primary hover:underline p-2 rounded bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  Notizie Calcio
                </Link>
                <Link 
                  to="/tennis" 
                  className="text-primary hover:underline p-2 rounded bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  Notizie Tennis
                </Link>
                <Link 
                  to="/f1" 
                  className="text-primary hover:underline p-2 rounded bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  Formula 1
                </Link>
                <Link 
                  to="/nba" 
                  className="text-primary hover:underline p-2 rounded bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  NBA News
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}