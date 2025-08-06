import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { isAllowedEmail, getAllowedDomains } from "@/utils/emailValidator";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";

export default function Register() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean | null;
    message: string;
    allowedDomains: string[];
  }>({
    isValid: null,
    message: "",
    allowedDomains: []
  });
  const { signUp, user, loading } = useAuth();
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

  const validateEmail = async (emailValue: string) => {
    if (!emailValue || !emailValue.includes('@')) {
      setEmailValidation({ isValid: null, message: "", allowedDomains: [] });
      return;
    }

    try {
      const domains = await getAllowedDomains();
      const isValid = await isAllowedEmail(emailValue);
      
      setEmailValidation({
        isValid,
        message: isValid 
          ? "Email valida e dominio consentito" 
          : `Dominio non consentito. Domini accettati: ${domains.join(', ')}`,
        allowedDomains: domains
      });
    } catch (error) {
      setEmailValidation({
        isValid: false,
        message: "Errore durante la verifica del dominio email",
        allowedDomains: []
      });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Debounce validation
    const timeoutId = setTimeout(() => {
      validateEmail(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verifica finale del dominio email
      if (!(await isAllowedEmail(email))) {
        toast({
          title: "Email non consentita",
          description: "Il dominio della tua email non è nella whitelist. Contatta l'amministratore per richiedere l'accesso.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await signUp(email, password, username);
      
      if (error) {
        toast({
          title: "Errore di registrazione",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registrazione completata!",
          description: "Ti abbiamo inviato una email di conferma. Clicca sul link per attivare il tuo account.",
          duration: 6000,
        });
        // Redirect to a dedicated confirmation page instead of login
        navigate("/email-confirmation", { 
          state: { email, message: "Ti abbiamo inviato una email di conferma" }
        });
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
            Crea il tuo Account
          </h1>
          <p className="text-muted-foreground">
            Unisciti alla community degli appassionati di sport
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground">
                Registrati
              </CardTitle>
              <CardDescription>
                Inizia la tua esperienza sportiva
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className={`mt-1 ${emailValidation.isValid === false ? "border-destructive" : ""}`}
                  />
                  {emailValidation.isValid !== null && (
                    <Alert variant={emailValidation.isValid ? "default" : "destructive"} className="mt-2">
                      <div className="flex items-center gap-2">
                        {emailValidation.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <AlertDescription className="text-sm">
                          {emailValidation.message}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1"
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || emailValidation.isValid === false}
                >
                  {isLoading ? "Registrazione in corso..." : "Registrati"}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Hai già un account? </span>
                <Link 
                  to="/login" 
                  className="text-primary hover:underline font-medium"
                >
                  Accedi
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}