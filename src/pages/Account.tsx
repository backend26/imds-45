import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { User, Activity, Shield, Edit, Eye } from "lucide-react";

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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard Account
            </h1>
            <p className="text-muted-foreground">
              Gestisci il tuo profilo, le tue attività e le impostazioni di sicurezza
            </p>
          </div>

          {/* Layout a due colonne */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Colonna Sinistra - Profile Card */}
            <div className="lg:col-span-1">
              <ProfileCard onError={handleError} />
            </div>

            {/* Colonna Destra - Tab Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="public" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border border-border/50">
                  <TabsTrigger value="public" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Profilo Pubblico
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Attività
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Privacy
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Sicurezza
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="public" className="space-y-6">
                  <PublicProfileTab onError={handleError} />
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <ActivityTab onError={handleError} />
                </TabsContent>

                <TabsContent value="privacy" className="space-y-6">
                  <PrivacyTab onError={handleError} />
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <SecurityTab onError={handleError} />
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