import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UltraModernArticleCard } from "@/components/posts/UltraModernArticleCard";
import { UltraModernNewsCard } from "@/components/posts/UltraModernNewsCard";
import { SportFilters } from "@/components/SportFilters";
import { Badge } from "@/components/ui/badge";
import { mockArticles } from "@/data/articles";

export default function Calcio() {
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [selectedSport, setSelectedSport] = useState("calcio");

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Filter articles for football/calcio
  const calcioArticles = mockArticles.filter(article => 
    article.category.toLowerCase() === 'calcio'
  );

  const featuredArticles = calcioArticles.slice(0, 3);
  const otherArticles = calcioArticles.slice(3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-gradient-primary text-white text-lg px-4 py-2">
              ⚽ Calcio
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Tutto sul Calcio
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Le ultime notizie, analisi e approfondimenti dal mondo del calcio. 
            Serie A, Champions League, mercato e molto altro.
          </p>
        </div>

        {/* Sport Filters */}
        <SportFilters 
          selectedSport={selectedSport}
          onSportChange={setSelectedSport}
        />

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Articoli in Evidenza</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article, index) => (
                <UltraModernArticleCard key={index} {...article} />
              ))}
            </div>
          </section>
        )}

        {/* Other Articles */}
        {otherArticles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Altri Articoli</h2>
            <div className="space-y-4">
              {otherArticles.map((article, index) => (
                <UltraModernNewsCard 
                  key={index} 
                  {...article} 
                  views={article.views || Math.floor(Math.random() * 1000) + 100}
                />
              ))}
            </div>
          </section>
        )}

        {/* No articles message */}
        {calcioArticles.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">
              Nessun articolo disponibile
            </h2>
            <p className="text-muted-foreground">
              Non ci sono ancora articoli di calcio disponibili. Torna presto per gli aggiornamenti!
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
