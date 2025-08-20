import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Enhanced3DFootball } from "./Enhanced3DFootball";
import { SmartImage } from "@/components/ui/smart-image";

interface HeroArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  category: string;
}

interface HeroSectionProps {
  heroArticles?: HeroArticle[];
}

export const HeroSection = ({ heroArticles: dbHeroArticles }: HeroSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Use database articles if available, show empty state if none
  const displayArticles = dbHeroArticles && dbHeroArticles.length > 0 ? dbHeroArticles : [];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayArticles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, displayArticles.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + displayArticles.length) % displayArticles.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % displayArticles.length);
    setIsAutoPlaying(false);
  };

  const currentArticle = displayArticles[currentSlide];

  // Show empty state if no articles
  if (!displayArticles || displayArticles.length === 0) {
    return (
      <section className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <h2 className="text-2xl font-bold mb-2">Nessun articolo in evidenza</h2>
          <p>Gli articoli in evidenza appariranno qui una volta pubblicati.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden group hero-section">
      {/* Background Image with Responsive Parallax Effect */}
      <div className="absolute inset-0">
        <SmartImage
          src={currentArticle?.imageUrl}
          alt={currentArticle?.title || "Hero image"}
          className="object-cover object-center scale-105 group-hover:scale-110 transition-all duration-1000 ease-out"
        />
      </div>
      
      {/* Responsive Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20 sm:from-black/70 sm:via-black/40 sm:to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-full sm:max-w-2xl lg:max-w-3xl animate-fade-in scroll-animate">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <Badge className="bg-primary text-primary-foreground animate-scale-in text-xs sm:text-sm">
              {currentArticle?.category || 'Notizia'}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {currentArticle?.title || 'Articolo in caricamento...'}
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 leading-relaxed line-clamp-3 sm:line-clamp-none">
            {currentArticle?.excerpt || 'Caricamento contenuto...'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start">
            <Button 
              size="lg" 
              onClick={() => currentArticle?.id && (window.location.href = `/post/${currentArticle.id}`)}
              disabled={!currentArticle?.id}
              className="bg-gradient-primary hover:bg-gradient-hover text-white font-semibold px-6 sm:px-8 py-3 hover-lift transition-all duration-300 w-full sm:w-auto disabled:opacity-50"
            >
              Leggi l'Articolo
            </Button>
            
            {/* Arrow Controls - responsive positioning */}
            <div className="flex space-x-2 justify-center sm:justify-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="h-10 w-10 sm:h-12 sm:w-12 p-0 bg-white/90 dark:bg-[#3e3e3e] text-[#3e3e3e] dark:text-white hover:bg-white dark:hover:bg-[#2a2a2a] rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="h-10 w-10 sm:h-12 sm:w-12 p-0 bg-white/90 dark:bg-[#3e3e3e] text-[#3e3e3e] dark:text-white hover:bg-white dark:hover:bg-[#2a2a2a] rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Navigation Controls */}
      <div className="absolute bottom-4 sm:bottom-6 left-4 right-4 z-20">
        <div className="container mx-auto flex items-center justify-center sm:justify-between">
          {/* Slide Indicators */}
          <div className="flex space-x-2 sm:space-x-3">
            {displayArticles.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300",
                  currentSlide === index 
                    ? "bg-white scale-125" 
                    : "bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Auto-play Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{
              width: '0%',
              animation: 'progress 5000ms linear infinite'
            }}
          />
        </div>
      )}

    </section>
  );
};