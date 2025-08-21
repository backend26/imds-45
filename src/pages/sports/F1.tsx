import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OptimizedArticleCard } from "@/components/posts/OptimizedArticleCard";
import { UltraModernNewsCard } from "@/components/posts/UltraModernNewsCard";
import { SportFilters } from "@/components/SportFilters";
import { Badge } from "@/components/ui/badge";
import { useSportPosts, useFeaturedSportPosts, transformPostForCard } from "@/hooks/useSportPosts";
import { Skeleton } from "@/components/ui/skeleton";

export default function F1() {
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [selectedSport, setSelectedSport] = useState("f1");

  // Fetch real data from Supabase
  const { data: posts, isLoading, error } = useSportPosts('f1');
  const { data: featuredPosts, isLoading: isFeaturedLoading } = useFeaturedSportPosts('f1', 3);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Transform posts for card display
  const transformedPosts = posts?.map(transformPostForCard) || [];
  const transformedFeatured = featuredPosts?.map(transformPostForCard) || [];
  
  const featuredArticles = transformedFeatured.length > 0 ? transformedFeatured : transformedPosts.slice(0, 3);
  const otherArticles = transformedFeatured.length > 0 ? transformedPosts : transformedPosts.slice(3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-gradient-primary text-white text-lg px-4 py-2">
              🏎️ Formula 1
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Tutto sulla Formula 1
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Le ultime notizie dai Gran Premi, analisi tecnica, mercato piloti 
            e tutto il mondo della Formula 1.
          </p>
        </div>

        {/* Sport Filters */}
        <SportFilters 
          selectedSport={selectedSport}
          onSportChange={setSelectedSport}
        />

        {/* Featured Articles */}
        {isLoading || isFeaturedLoading ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Articoli in Evidenza</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-lg" />
              ))}
            </div>
          </section>
        ) : featuredArticles.length > 0 ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Articoli in Evidenza</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article, index) => (
                <OptimizedArticleCard key={article.id || index} {...article} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Other Articles */}
        {isLoading ? (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Altri Articoli</h2>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          </section>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-destructive mb-4">
              Errore nel caricamento
            </h2>
            <p className="text-muted-foreground">
              Si è verificato un errore nel caricamento degli articoli. Riprova più tardi.
            </p>
          </div>
        ) : otherArticles.length > 0 ? (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Altri Articoli</h2>
            <div className="space-y-4">
              {otherArticles.map((article, index) => (
                <UltraModernNewsCard 
                  key={article.id || index}
                  {...article} 
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">
              Nessun articolo disponibile
            </h2>
            <p className="text-muted-foreground">
              Non ci sono ancora articoli di Formula 1 disponibili. Torna presto per gli aggiornamenti!
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
