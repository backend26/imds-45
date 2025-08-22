import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RatingSystemProps {
  postId: string;
  initialRating?: number;
  isDisabled?: boolean;
}

export const RatingSystemSimple = ({ postId, initialRating = 0, isDisabled = false }: RatingSystemProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRate = async (newRating: number) => {
    if (isDisabled || loading) return;
    
    setLoading(true);
    try {
      // Simulate API call - will be implemented when database is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      setRating(newRating);
      
      toast({
        title: "Valutazione salvata",
        description: `Hai dato ${newRating} stelle a questo articolo`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare la valutazione",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Valuta:</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            variant="ghost"
            size="sm"
            className="p-1 h-auto hover:scale-110"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRate(star)}
            disabled={isDisabled || loading}
          >
            <Star
              className={cn(
                "h-4 w-4 transition-colors",
                (hoverRating || rating) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              )}
            />
          </Button>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-sm text-muted-foreground">
          {rating}/5
        </span>
      )}
    </div>
  );
};