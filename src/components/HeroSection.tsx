import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Enhanced3DFootball } from "./Enhanced3DFootball";

import { heroArticles } from "@/data/articles";
import { getImageUrl } from "@/config/images";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroArticles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + heroArticles.length) % heroArticles.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroArticles.length);
    setIsAutoPlaying(false);
  };

  const currentArticle = heroArticles[currentSlide];

  return (
    <section className="relative h-[60vh] md:h-[70vh] overflow-hidden group">
      {/* Background Image with Parallax Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out scale-105 group-hover:scale-110"
        style={{ backgroundImage: `url(${getImageUrl(currentArticle.imageUrl)})` }}
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      {/* 3D Element - Enhanced Football */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 w-48 h-48 opacity-90 hidden lg:block">
        <ErrorBoundary fallback={
            <div className="h-64 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-6xl mb-4">⚽</div>
                <p className="text-lg font-semibold">Malati dello Sport</p>
              </div>
            </div>
          }>
            <Suspense fallback={
              <div className="h-64 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin text-4xl mb-4">⚽</div>
                  <p>Caricamento...</p>
                </div>
              </div>
            }>
              <Enhanced3DFootball size={1.5} />
            </Suspense>
          </ErrorBoundary>
      </div>

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

                     <div className="flex flex-col sm:flex-row gap-4">
             <Button 
               size="lg" 
               className="bg-gradient-primary hover:bg-gradient-hover text-white font-semibold px-8 py-3 hover-lift"
             >
               Leggi l'Articolo
             </Button>
           </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 left-4 right-4 z-20">
        <div className="container mx-auto flex items-center justify-between">
          {/* Slide Indicators */}
          <div className="flex space-x-3">
            {heroArticles.map((_, index) => (
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

          {/* Arrow Controls */}
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              className="h-10 w-10 p-0 bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              className="h-10 w-10 p-0 bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
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