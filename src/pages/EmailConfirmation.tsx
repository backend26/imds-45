import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

export default function EmailConfirmation() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const email = location.state?.email || "";
  const message = location.state?.message || "Controlla la tua email per completare la registrazione";

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

  // Redirect authenticated users
  useEffect(() => {
    if (user && !loading) {
      toast({
        title: "Account verificato!",
        description: "Il tuo account è stato confermato con successo",
      });
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifica account in corso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Verifica la tua Email
              </CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Email inviata a: <strong className="text-foreground">{email}</strong></span>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                  <p className="mb-2">Cosa fare ora:</p>
                  <ul className="space-y-1 text-left">
                    <li>• Controlla la tua casella email</li>
                    <li>• Cerca una email da "Malati dello Sport"</li>
                    <li>• Clicca sul link di conferma</li>
                    <li>• Tornerai automaticamente al sito</li>
                  </ul>
                </div>

                <div className="text-xs text-muted-foreground">
                  Non hai ricevuto l'email? Controlla la cartella spam o 
                  <Link to="/registrati" className="text-primary hover:underline ml-1">
                    riprova la registrazione
                  </Link>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate("/registrati")}
                >
                  Registrati di Nuovo
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => navigate("/login")}
                >
                  Vai al Login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}