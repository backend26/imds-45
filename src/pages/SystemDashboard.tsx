import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { AccessibilityDashboard } from '@/components/accessibility/AccessibilityDashboard';
import { SEODashboard } from '@/components/seo/SEODashboard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Gauge, 
  Eye, 
  Search, 
  TrendingUp,
  Globe,
  Smartphone
} from 'lucide-react';

export default function SystemDashboard() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && true);
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              System Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitora performance, accessibilità e SEO della piattaforma
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Gauge className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Performance</p>
                    <p className="text-2xl font-bold text-green-500">A</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Eye className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accessibilità</p>
                    <p className="text-2xl font-bold text-blue-500">87%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Search className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">SEO</p>
                    <p className="text-2xl font-bold text-green-500">92%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Smartphone className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PWA</p>
                    <p className="text-2xl font-bold text-purple-500">✓</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Performance & PWA
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Accessibilità
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                SEO
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-6">
              <PerformanceDashboard />
            </TabsContent>

            <TabsContent value="accessibility" className="space-y-6">
              <AccessibilityDashboard />
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <SEODashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}