import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Enhanced3DFootball } from "./Enhanced3DFootball";

import { heroArticles } from "@/data/articles";
import { getImageUrl } from "@/config/images";

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

  // Use database articles if available, fallback to static ones
  const displayArticles = dbHeroArticles && dbHeroArticles.length > 0 ? dbHeroArticles : heroArticles;

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

  return (
    <section className="relative h-[60vh] md:h-[70vh] overflow-hidden group">
      {/* Background Image with Parallax Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out scale-105 group-hover:scale-110"
        style={{ backgroundImage: `url(${getImageUrl(currentArticle.imageUrl)})` }}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl animate-fade-in">
                     <div className="flex items-center space-x-3 mb-4">
             <Badge className="bg-primary text-primary-foreground animate-scale-in">
               {currentArticle.category}
             </Badge>
           </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {currentArticle.title}
          </h1>
          
          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            {currentArticle.excerpt}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:bg-gradient-hover text-white font-semibold px-8 py-3 hover-lift"
            >
              Leggi l'Articolo
            </Button>
            
            {/* Arrow Controls moved here */}
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="h-12 w-12 p-0 bg-white/90 dark:bg-[#3e3e3e] text-[#3e3e3e] dark:text-white hover:bg-white dark:hover:bg-[#2a2a2a] rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="h-12 w-12 p-0 bg-white/90 dark:bg-[#3e3e3e] text-[#3e3e3e] dark:text-white hover:bg-white dark:hover:bg-[#2a2a2a] rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 left-4 right-4 z-20">
        <div className="container mx-auto flex items-center justify-between">
          {/* Slide Indicators */}
          <div className="flex space-x-3">
            {displayArticles.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  currentSlide === index 
                    ? "bg-white scale-125" 
                    : "bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </div>

          {/* Empty space where arrows were - just slide indicators now */}
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