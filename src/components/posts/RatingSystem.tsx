import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface RatingSystemProps {
  postId: string;
  className?: string;
}

export const RatingSystem = ({ postId, className = "" }: RatingSystemProps) => {
  const [userRating, setUserRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadRatings();
  }, [postId, user]);

  const loadRatings = async () => {
    try {
      // Carica la media e il totale delle valutazioni
      const { data: averageData } = await supabase
        .rpc('get_post_average_rating', { post_id: postId });
      
      const { data: countData } = await supabase
        .rpc('get_post_rating_count', { post_id: postId });

      setAverageRating(averageData || 0);
      setTotalRatings(countData || 0);

      // Se l'utente è autenticato, carica la sua valutazione
      if (user) {
        const { data: userRatingData } = await supabase
          .from('post_ratings')
          .select('rating')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();

        setUserRating(userRatingData?.rating || 0);
      }
    } catch (error) {
      console.error('Errore nel caricamento delle valutazioni:', error);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere autenticato per valutare questo articolo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('post_ratings')
        .upsert({
          post_id: postId,
          user_id: user.id,
          rating: rating
        }, {
          onConflict: 'post_id,user_id'
        });

      if (error) throw error;

      setUserRating(rating);
      await loadRatings(); // Ricarica per aggiornare la media

      toast({
        title: "Valutazione salvata",
        description: `Hai valutato questo articolo con ${rating} stelle`
      });
    } catch (error) {
      console.error('Errore nel salvare la valutazione:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la valutazione",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isFilled = starNumber <= rating;
      
      return (
        <Star
          key={index}
          className={`h-5 w-5 transition-colors ${
            interactive ? 'cursor-pointer' : ''
          } ${
            isFilled 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-muted-foreground'
          } ${
            interactive && hoveredRating >= starNumber 
              ? 'fill-yellow-300 text-yellow-300' 
              : ''
          }`}
          onClick={interactive ? () => handleRating(starNumber) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(starNumber) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        />
      );
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Media generale */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {renderStars(averageRating)}
        </div>
        <div className="text-sm text-muted-foreground">
          {averageRating > 0 ? (
            <>
              {averageRating.toFixed(1)} su 5 
              {totalRatings > 0 && (
                <span> ({totalRatings} valutazion{totalRatings === 1 ? 'e' : 'i'})</span>
              )}
            </>
          ) : (
            "Nessuna valutazione"
          )}
        </div>
      </div>

      {/* Valutazione utente */}
      {user && (
        <div className="border-t border-border/50 pt-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">La tua valutazione:</span>
            <div className="flex items-center gap-1">
              {renderStars(hoveredRating || userRating, true)}
            </div>
            {userRating > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRating(0)}
                disabled={loading}
                className="text-xs"
              >
                Rimuovi
              </Button>
            )}
          </div>
          {loading && (
            <p className="text-xs text-muted-foreground mt-1">
              Salvando valutazione...
            </p>
          )}
        </div>
      )}

      {/* Messaggio per utenti non autenticati */}
      {!user && (
        <div className="border-t border-border/50 pt-3">
          <p className="text-sm text-muted-foreground">
            <a href="/login" className="text-primary hover:underline">
              Accedi
            </a> per valutare questo articolo
          </p>
        </div>
      )}
    </div>
  );
};