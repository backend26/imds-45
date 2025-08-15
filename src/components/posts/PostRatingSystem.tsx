import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface PostRatingSystemProps {
  postId: string;
  currentRating?: number | null;
  onRatingChange: (rating: number) => void;
  isLoading?: boolean;
  className?: string;
}

export const PostRatingSystem: React.FC<PostRatingSystemProps> = ({
  postId,
  currentRating,
  onRatingChange,
  isLoading = false,
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleRatingClick = (rating: number) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per valutare gli articoli",
        variant: "destructive"
      });
      return;
    }
    
    onRatingChange(rating);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isActive = hoveredRating ? i <= hoveredRating : currentRating ? i <= currentRating : false;
      
      stars.push(
        <Button
          key={i}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-transparent"
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(null)}
          onClick={() => handleRatingClick(i)}
          disabled={isLoading}
          title={`Dai ${i} ${i === 1 ? 'stella' : 'stelle'}`}
        >
          <Star
            className={cn(
              "h-5 w-5 transition-all duration-200",
              isActive 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-muted-foreground hover:text-yellow-400"
            )}
          />
        </Button>
      );
    }
    return stars;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Valuta questo articolo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {renderStars()}
          </div>
          <div className="text-sm text-muted-foreground">
            {currentRating ? (
              <span>Hai dato {currentRating} {currentRating === 1 ? 'stella' : 'stelle'}</span>
            ) : (
              <span>Nessuna valutazione</span>
            )}
          </div>
        </div>
        {!user && (
          <p className="text-xs text-muted-foreground mt-2">
            Effettua il login per valutare questo articolo
          </p>
        )}
      </CardContent>
    </Card>
  );
};