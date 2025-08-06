import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ArticleCard } from "@/components/ArticleCard";
import { HorizontalArticleCard } from "@/components/HorizontalArticleCard";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { SortingControls } from "@/components/SortingControls";
import { SportFilters } from "@/components/SportFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Filter } from "lucide-react";
import { Icon } from "@/components/Icon";
import { mockArticles } from "@/data/articles";
import { useGSAPAnimations } from "@/hooks/use-gsap-animations";
import { useLiquidAnimation } from "@/hooks/use-liquid-animation";

const Index = () => {
  const [darkMode, setDarkMode] = useState(true); // Dark mode as default
  const [selectedCategory, setSelectedCategory] = useState("Tutti");
  const [selectedSport, setSelectedSport] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [period, setPeriod] = useState("all");
  const [visibleArticles, setVisibleArticles] = useState(6);
  const { pageRef, animateCardHover, animateIconClick, animateCounter } = useGSAPAnimations();
  useLiquidAnimation();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Set dark mode as default on component mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const categories = [
    { name: "Tutti", count: mockArticles.length },
    { name: "Calcio", count: mockArticles.filter(a => a.category === "Calcio").length },
    { name: "Tennis", count: mockArticles.filter(a => a.category === "Tennis").length },
    { name: "F1", count: mockArticles.filter(a => a.category === "F1").length },
    { name: "NFL", count: mockArticles.filter(a => a.category === "NFL").length },
    { name: "Basket", count: mockArticles.filter(a => a.category === "Basket").length },
  ];

  const filteredArticles = selectedCategory === "Tutti" 
    ? mockArticles 
    : mockArticles.filter(article => article.category === selectedCategory);

  // Animate trending counter on load
  useEffect(() => {
    const counterElement = document.getElementById('trending-counter');
    if (counterElement && animateCounter) {
      animateCounter(counterElement, 24, '%');
    }
  }, [animateCounter]);

  const featuredArticle = mockArticles.find(article => article.featured) || mockArticles[0];
  const regularArticles = mockArticles.filter(article => !article.featured);

  return (
    <div ref={pageRef} className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      {/* Hero Section */}
      <div className="hero-section">
        <HeroSection />
      </div>

      {/* Main Content with Sidebar Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-12">
          <main className="flex-1 max-w-6xl">
            {/* Trending Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Icon name="fire" className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Trending Now</h2>
              </div>
              <Badge className="bg-gradient-primary text-white animate-scale-in">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span id="trending-counter">+2.4</span>% oggi
              </Badge>
            </div>
          </div>

          <SportFilters
            selectedSport={selectedSport}
            onSportChange={setSelectedSport}
          />

          {/* Advanced Sorting Controls */}
          <SortingControls 
            selectedCategory={selectedCategory}
            sortBy={sortBy}
            period={period}
            categories={categories}
            onCategoryChange={setSelectedCategory}
            onSortChange={setSortBy}
            onPeriodChange={setPeriod}
          />

          {/* Featured Article - Full Width */}
          <div className="mb-8 article-card">
            <ArticleCard
              {...featuredArticle}
              featured={true}
              className="w-full"
            />
          </div>

          {/* Regular Articles Grid - Uniform Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.slice(1, visibleArticles).map((article, index) => (
              <div key={index} className="article-card h-full">
                <ArticleCard
                  {...article}
                  className="h-full"
                />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleArticles < filteredArticles.length && (
            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                size="lg"
                className="hover:bg-primary hover:text-primary-foreground transition-colors px-8"
                onClick={() => setVisibleArticles(prev => prev + 6)}
              >
                Carica Altri Articoli ({filteredArticles.length - visibleArticles} rimanenti)
              </Button>
            </div>
          )}
        </section>
          </main>
          
          {/* Sidebar */}
          <div className="sidebar">
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
