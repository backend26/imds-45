import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useSessionMonitor } from "@/hooks/use-session-monitor";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProfileCard } from "@/components/account/ProfileCard";
import { PublicProfileTab } from "@/components/account/PublicProfileTab";
import { ActivityTab } from "@/components/account/ActivityTab";
import { SecurityTab } from "@/components/account/SecurityTab";
import { PrivacyTab } from "@/components/account/PrivacyTab";

import { ErrorModal } from "@/components/ErrorModal";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { NotificationPreferencesButton } from "@/components/notifications/NotificationPreferencesButton";
import { UserStats } from "@/components/account/UserStats";
import { 
  User, 
  Activity, 
  Shield, 
  Edit, 
  Eye, 
  Bell, 
  Settings, 
  ChevronRight, 
  Star,
  TrendingUp,
  Heart,
  Bookmark 
} from "lucide-react";

export default function Account() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && true); // Default to dark
  });
  
  const { user, loading } = useAuth();
  const { errorState, handleError, closeModal } = useErrorHandler();
  
  // Monitor session and banned status
  useSessionMonitor();

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    // Applica il tema al mount
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Il Mio Account
              </h1>
            </div>
            <p className="text-muted-foreground">
              Gestisci tutte le impostazioni del tuo profilo e account in un unico posto
            </p>
          </div>

          {/* Quick Actions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Edit className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Modifica Profilo</p>
                      <p className="text-sm text-muted-foreground">Username, bio, foto</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Attività</p>
                      <p className="text-sm text-muted-foreground">Post, like, preferiti</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Shield className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Sicurezza</p>
                      <p className="text-sm text-muted-foreground">Password, 2FA</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Eye className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Privacy</p>
                      <p className="text-sm text-muted-foreground">Visibilità dati</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Layout a due colonne */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Colonna Sinistra - Profile Card + Quick Settings */}
            <div className="lg:col-span-1 space-y-6">
              <ProfileCard onError={handleError} />
              
              {/* Notification Settings Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifiche
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Gestisci quando e come ricevere le notifiche
                  </p>
                  <NotificationPreferencesButton 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configura Notifiche
                  </NotificationPreferencesButton>
                </CardContent>
              </Card>

              {/* Account Stats */}
              <UserStats />
            </div>

            {/* Colonna Destra - Tab Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="public" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border border-border/50 h-auto p-1">
                  <TabsTrigger value="public" className="flex items-center gap-2 py-3">
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Profilo</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2 py-3">
                    <Activity className="h-4 w-4" />
                    <span className="hidden sm:inline">Attività</span>
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="flex items-center gap-2 py-3">
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Privacy</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2 py-3">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Sicurezza</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="public" className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Edit className="h-6 w-6 text-primary" />
                      <div>
                        <h2 className="text-xl font-semibold">Profilo Pubblico</h2>
                        <p className="text-sm text-muted-foreground">Informazioni visibili agli altri utenti</p>
                      </div>
                    </div>
                    <PublicProfileTab onError={handleError} />
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="h-6 w-6 text-primary" />
                      <div>
                        <h2 className="text-xl font-semibold">La Tua Attività</h2>
                        <p className="text-sm text-muted-foreground">Cronologia delle tue interazioni sul sito</p>
                      </div>
                    </div>
                    <ActivityTab onError={handleError} />
                  </div>
                </TabsContent>

                <TabsContent value="privacy" className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Eye className="h-6 w-6 text-primary" />
                      <div>
                        <h2 className="text-xl font-semibold">Impostazioni Privacy</h2>
                        <p className="text-sm text-muted-foreground">Controlla la visibilità delle tue informazioni</p>
                      </div>
                    </div>
                    <PrivacyTab onError={handleError} />
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="h-6 w-6 text-primary" />
                      <div>
                        <h2 className="text-xl font-semibold">Sicurezza Account</h2>
                        <p className="text-sm text-muted-foreground">Proteggi il tuo account con password sicure e 2FA</p>
                      </div>
                    </div>
                    <SecurityTab onError={handleError} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorState.isModalOpen}
        onClose={closeModal}
        errorId={errorState.errorId || ''}
        message={errorState.message || undefined}
      />
    </div>
  );
}