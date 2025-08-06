import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingSystemProps {
  postId: string;
  className?: string;
}

export const RatingSystem = ({ postId, className }: RatingSystemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRating, setUserRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  useEffect(() => {
    loadRatings();
  }, [postId, user]);

  const loadRatings = async () => {
    try {
      // Get user's rating if authenticated
      if (user) {
        const { data: userRatingData } = await supabase
          .from('post_ratings')
          .select('rating')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();

        setUserRating(userRatingData?.rating || 0);
      }

      // Get average and count
      const { data: ratingsData, error } = await supabase
        .from('post_ratings')
        .select('rating')
        .eq('post_id', postId);

      if (error) throw error;

      if (ratingsData && ratingsData.length > 0) {
        const average = ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length;
        setAverageRating(average);
        setTotalRatings(ratingsData.length);
      } else {
        setAverageRating(0);
        setTotalRatings(0);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per valutare gli articoli",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('post_ratings')
        .upsert({
          user_id: user.id,
          post_id: postId,
          rating,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setUserRating(rating);
      await loadRatings(); // Refresh to get updated average
      
      toast({
        title: "Valutazione salvata",
        description: `Hai assegnato ${rating} stella${rating !== 1 ? 'e' : ''} a questo articolo`,
      });
    } catch (error) {
      console.error('Error saving rating:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la valutazione",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hoveredStar || userRating;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Interactive Stars */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            disabled={loading || !user}
            className={cn(
              "transition-all duration-200 hover:scale-110",
              !user && "cursor-not-allowed opacity-50",
              user && "cursor-pointer"
            )}
          >
            <Star
              className={cn(
                "h-5 w-5 transition-colors",
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-muted-foreground hover:text-yellow-400"
              )}
            />
          </button>
        ))}
        
        {user && (
          <span className="text-sm text-muted-foreground ml-2">
            {userRating ? `La tua valutazione: ${userRating}/5` : "Clicca per valutare"}
          </span>
        )}
      </div>

      {/* Average Rating Display */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-4 w-4",
                star <= Math.round(averageRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-muted-foreground"
              )}
            />
          ))}
        </div>
        
        <span>
          {averageRating > 0 ? (
            <>
              {averageRating.toFixed(1)} ({totalRatings} valutazion{totalRatings !== 1 ? 'i' : 'e'})
            </>
          ) : (
            "Nessuna valutazione"
          )}
        </span>
      </div>

      {!user && (
        <p className="text-xs text-muted-foreground">
          <a href="/login" className="text-primary hover:underline">
            Accedi
          </a> per valutare questo articolo
        </p>
      )}
    </div>
  );
};