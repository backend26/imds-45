import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface PostBookmarkSystemProps {
  postId: string;
  className?: string;
}

export const PostBookmarkSystem: React.FC<PostBookmarkSystemProps> = ({
  postId,
  className
}) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkBookmarkStatus();
    }
  }, [user, postId]);

  const checkBookmarkStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookmarked_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking bookmark status:', error);
        return;
      }

      setIsBookmarked(!!data);
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per salvare gli articoli",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarked_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;

        setIsBookmarked(false);
        toast({
          title: "Articolo rimosso",
          description: "L'articolo è stato rimosso dai salvati",
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarked_posts')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        if (error) throw error;

        setIsBookmarked(true);
        toast({
          title: "Articolo salvato",
          description: "L'articolo è stato aggiunto ai salvati",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Errore",
        description: "Impossibile modificare il salvataggio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleBookmark}
      disabled={loading}
      className={cn(
        "transition-colors duration-200",
        isBookmarked 
          ? "text-primary hover:text-primary/80" 
          : "text-muted-foreground hover:text-primary",
        className
      )}
    >
      <Bookmark 
        className={cn(
          "h-4 w-4 transition-all duration-200",
          isBookmarked && "fill-current"
        )} 
      />
    </Button>
  );
};