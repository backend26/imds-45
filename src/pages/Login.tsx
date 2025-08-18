import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { useRateLimit } from "@/hooks/use-rate-limit";
import { ValidationSchemas, sanitizeInput } from "@/utils/security";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export default function Login() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, loading } = useAuth();
  const { checkRateLimit, recordAttempt } = useRateLimit();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    // Ensure dark mode is applied on mount
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
        title: "Hai già effettuato l'accesso",
        description: "Sei già connesso al tuo account",
      });
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
      toast({
        title: "Troppi tentativi",
        description: rateCheck.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Sanitize inputs
      const cleanEmail = sanitizeInput(email.trim());
      const cleanPassword = password;
      let loginEmail = cleanEmail;
      
      // Se l'input non contiene @, è un username - ottieni l'email
      if (!cleanEmail.includes('@')) {
        const { data: emailFromUsername, error: emailError } = await supabase
          .rpc('get_email_by_username', { username_input: cleanEmail });
        
        if (emailError || !emailFromUsername) {
          toast({
            title: "Username non trovato",
            description: "L'username inserito non esiste",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        loginEmail = emailFromUsername;
      }

      const { error } = await signIn(loginEmail, cleanPassword);
      
      if (error) {
        recordAttempt(false);
        const rateCheck = checkRateLimit();
        
        toast({
          title: "Errore di accesso",
          description: `${error.message}${rateCheck.message ? ` ${rateCheck.message}` : ''}`,
          variant: "destructive",
        });
      } else {
        recordAttempt(true);
        toast({
          title: "Accesso effettuato con successo",
          description: "Benvenuto nella community degli appassionati di sport!",
          duration: 4000,
        });
        // Clear form and redirect
        setEmail("");
        setPassword("");
        navigate("/", { replace: true });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Accedi al tuo Account
          </h1>
          <p className="text-muted-foreground">
            Inserisci le tue credenziali per continuare
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground">
                Accedi
              </CardTitle>
              <CardDescription>
                Benvenuto di nuovo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email o Username</Label>
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                    placeholder="mario@example.com o mario_123"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Accesso in corso..." : "Accedi"}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm space-y-2">
                <div>
                  <Link 
                    to="/reset-password" 
                    className="text-primary hover:underline text-sm"
                  >
                    Password dimenticata?
                  </Link>
                </div>
                <div>
                  <span className="text-muted-foreground">Non hai un account? </span>
                  <Link 
                    to="/registrati" 
                    className="text-primary hover:underline font-medium"
                  >
                    Registrati
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}