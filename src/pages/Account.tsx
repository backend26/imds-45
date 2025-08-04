import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { User, Settings, Bookmark, Heart } from "lucide-react";

export default function Account() {
  const { user, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      // Load user profile data from Supabase
      setUsername(user.user_metadata?.username || "");
    }
  }, [user]);

  if (loading) {
    return <div>Caricamento...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // TODO: Implement profile update logic with Supabase
      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche sono state salvate con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={true} toggleTheme={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Il Mio Account
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestisci il tuo profilo e le tue preferenze
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profilo
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Attività
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Impostazioni
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Informazioni Profilo</CardTitle>
                  <CardDescription>
                    Aggiorna le informazioni del tuo profilo pubblico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Raccontaci qualcosa di te..."
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email || ""}
                        disabled
                        className="mt-1 bg-muted"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        L'email non può essere modificata
                      </p>
                    </div>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Aggiornamento..." : "Salva Modifiche"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bookmark className="h-5 w-5" />
                      Articoli Salvati
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Nessun articolo salvato al momento
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Articoli Apprezzati
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Nessun like al momento
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Impostazioni Account</CardTitle>
                  <CardDescription>
                    Gestisci le impostazioni di sicurezza e privacy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Cambia Password</h3>
                    <Button variant="outline">
                      Aggiorna Password
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notifiche</h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      Gestisci le tue preferenze di notifica
                    </p>
                    <Button variant="outline">
                      Gestisci Notifiche
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}