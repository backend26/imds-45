import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProfileSection } from "@/components/account/ProfileSection";
import { SecurityDashboard } from "@/components/account/SecurityDashboard";
import { DataManagement } from "@/components/account/DataManagement";
import { AdvancedSecurity } from "@/components/account/AdvancedSecurity";
// import { AdvancedSecurity } from "@/components/account/AdvancedSecurity";
import { PreferencesDashboard } from "@/components/account/PreferencesDashboard";
// import { DataManagement } from "@/components/account/DataManagement";
import { User, Settings, Bell, Activity, Download } from "lucide-react";

export default function Account() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });
  const { user, loading } = useAuth();

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
          {/* Page Title - Clean and Integrated */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Il Mio Account
            </h1>
            <p className="text-muted-foreground">
              Gestisci il tuo profilo, la sicurezza e le preferenze
            </p>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Section - Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSection />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profilo</TabsTrigger>
            <TabsTrigger value="preferences">Preferenze</TabsTrigger>
            <TabsTrigger value="security">Sicurezza</TabsTrigger>
            <TabsTrigger value="advanced-security">Sicurezza Avanzata</TabsTrigger>
            <TabsTrigger value="data">Dati</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileSection />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <PreferencesDashboard />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityDashboard />
          </TabsContent>

          <TabsContent value="advanced-security" className="space-y-6">
            <AdvancedSecurity />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataManagement />
          </TabsContent>
        </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}