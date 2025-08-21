import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface PostInteractionState {
  isLiked: boolean;
  isBookmarked: boolean;
  likesCount: number;
  commentsCount: number;
  userRating: number | null;
}

export function usePostInteractions(postId: string, initialState: Partial<PostInteractionState> = {}) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [state, setState] = useState<PostInteractionState>({
    isLiked: false,
    isBookmarked: false,
    likesCount: 0,
    commentsCount: 0,
    userRating: null,
    ...initialState
  });

  const [isLoading, setIsLoading] = useState(false);

  const toggleLike = useCallback(async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per mettere like",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (state.isLiked) {
        // Remove like
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setState(prev => ({
          ...prev,
          isLiked: false,
          likesCount: Math.max(0, prev.likesCount - 1)
        }));
      } else {
        // Add like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;

        setState(prev => ({
          ...prev,
          isLiked: true,
          likesCount: prev.likesCount + 1
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il like",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, postId, state.isLiked, toast]);

  const toggleBookmark = useCallback(async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per salvare articoli",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (state.isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarked_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setState(prev => ({ ...prev, isBookmarked: false }));
        
        toast({
          title: "Rimosso dai salvati",
          description: "Articolo rimosso dalla tua lista"
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarked_posts')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;

        setState(prev => ({ ...prev, isBookmarked: true }));
        
        toast({
          title: "Salvato",
          description: "Articolo aggiunto alla tua lista"
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare i salvati",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, postId, state.isBookmarked, toast]);

  const setRating = useCallback(async (rating: number) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per valutare articoli",
        variant: "destructive"
      });
      return;
    }

    if (rating < 1 || rating > 5) {
      toast({
        title: "Valutazione non valida",
        description: "La valutazione deve essere tra 1 e 5 stelle",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
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

      setState(prev => ({ ...prev, userRating: rating }));
      
      toast({
        title: "Valutazione salvata",
        description: `Hai dato ${rating} ${rating === 1 ? 'stella' : 'stelle'} a questo articolo`
      });
    } catch (error) {
      console.error('Error setting rating:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la valutazione",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, postId, toast]);

  const reportPost = useCallback(async (reason: string, description?: string) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per segnalare contenuti",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('post_reports')
        .insert({
          post_id: postId,
          reporter_id: user.id,
          reason: reason,
          description: description || null
        });

      if (error) throw error;

      toast({
        title: "Segnalazione inviata",
        description: "Grazie per aver segnalato questo contenuto"
      });
    } catch (error) {
      console.error('Error reporting post:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare la segnalazione",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, postId, toast]);

  return {
    ...state,
    isLoading,
    toggleLike,
    toggleBookmark,
    setRating,
    reportPost
  };
}