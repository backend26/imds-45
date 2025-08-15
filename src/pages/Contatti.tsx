import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Contatti() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    oggetto: '',
    messaggio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    document.title = "Contatti | I Malati dello Sport";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Contattaci per qualsiasi domanda o collaborazione. Il team di I Malati dello Sport è qui per te.');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulazione invio form (in futuro si può implementare con Edge Function)
    setTimeout(() => {
      toast({
        title: "Messaggio inviato!",
        description: "Grazie per averci contattato. Ti risponderemo presto!",
        duration: 5000,
      });
      
      setFormData({
        nome: '',
        email: '',
        oggetto: '',
        messaggio: ''
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Contattaci
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hai domande, suggerimenti o vuoi collaborare con noi? Siamo sempre pronti ad ascoltare i nostri lettori!
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form di contatto */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Invia un Messaggio</CardTitle>
              <CardDescription>
                Compila il form e ti risponderemo il prima possibile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Il tuo nome"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="la-tua-email@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="oggetto">Oggetto *</Label>
                  <Input
                    id="oggetto"
                    name="oggetto"
                    type="text"
                    value={formData.oggetto}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Di cosa vuoi parlare?"
                  />
                </div>
                
                <div>
                  <Label htmlFor="messaggio">Messaggio *</Label>
                  <Textarea
                    id="messaggio"
                    name="messaggio"
                    value={formData.messaggio}
                    onChange={handleInputChange}
                    required
                    className="mt-1 min-h-[120px]"
                    placeholder="Scrivi qui il tuo messaggio..."
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Invio in corso..." : "Invia Messaggio"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Informazioni di contatto */}
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">I Nostri Contatti</CardTitle>
                <CardDescription>
                  Puoi raggiungerci attraverso questi canali
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <p className="text-muted-foreground">info@imalatidellosport.it</p>
                    <p className="text-sm text-muted-foreground">
                      Rispondiamo entro 24 ore
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Redazione</h3>
                    <p className="text-muted-foreground">Milano, Italia</p>
                    <p className="text-sm text-muted-foreground">
                      Nel cuore dello sport italiano
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Collaborazioni</h3>
                    <p className="text-muted-foreground">partnership@imalatidellosport.it</p>
                    <p className="text-sm text-muted-foreground">
                      Per proposte commerciali e collaborazioni
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Orari di Risposta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Lunedì - Venerdì:</strong> 9:00 - 18:00</p>
                  <p><strong className="text-foreground">Weekend:</strong> Risposte entro il lunedì</p>
                  <p><strong className="text-foreground">Eventi Sportivi:</strong> Copertura H24</p>
                </div>
                
                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-foreground">
                    <strong>💡 Suggerimento:</strong> Per richieste urgenti durante eventi sportivi live, 
                    contattaci sui nostri social media per una risposta più veloce!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Vuoi Collaborare?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            Sei un giornalista sportivo, un blogger o semplicemente un appassionato con contenuti di qualità? 
            Ci piacerebbe conoscerti e valutare una collaborazione!
          </p>
          <Button size="lg" className="text-lg px-8">
            Proponi una Collaborazione
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}