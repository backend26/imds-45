import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

interface SocialInteractionsProps {
  postId: string;
  initialLikes?: number;
  initialComments?: number;
  className?: string;
}

export const SocialInteractions: React.FC<SocialInteractionsProps> = ({ 
  postId, 
  initialLikes = 0, 
  initialComments = 0,
  className = ""
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user has liked/bookmarked this post
  useEffect(() => {
    if (!user) return;
    
    const checkUserInteractions = async () => {
      try {
        // Check if liked
        const { data: likeData } = await supabase
          .from('post_likes')
          .select('user_id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setIsLiked(!!likeData);

        // Check if bookmarked
        const { data: bookmarkData } = await supabase
          .from('bookmarked_posts')
          .select('user_id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setIsBookmarked(!!bookmarkData);
      } catch (error) {
        console.error('Error checking user interactions:', error);
      }
    };

    checkUserInteractions();
  }, [user, postId]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Effettua l'accesso per mettere like",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setIsLiked(false);
        setLikes(prev => Math.max(0, prev - 1));
      } else {
        // Add like
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        
        if (error) throw error;
        
        setIsLiked(true);
        setLikes(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il like",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Effettua l'accesso per salvare l'articolo",
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
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setIsBookmarked(false);
        toast({
          title: "Rimosso dai salvati",
          description: "L'articolo è stato rimosso dai tuoi salvati",
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarked_posts')
          .insert({ post_id: postId, user_id: user.id });
        
        if (error) throw error;
        
        setIsBookmarked(true);
        toast({
          title: "Salvato",
          description: "L'articolo è stato aggiunto ai tuoi salvati",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare l'articolo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copiato",
          description: "Il link dell'articolo è stato copiato negli appunti",
        });
      } catch (error) {
        toast({
          title: "Errore",
          description: "Impossibile copiare il link",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
        onClick={handleLike}
        disabled={loading}
      >
        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        <Badge variant="secondary" className="text-xs">
          {likes}
        </Badge>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-muted-foreground"
        onClick={() => {/* TODO: Scroll to comments */}}
      >
        <MessageCircle className="h-4 w-4" />
        <Badge variant="secondary" className="text-xs">
          {comments}
        </Badge>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-muted-foreground"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
        <span className="text-xs">Condividi</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center gap-2 ${isBookmarked ? 'text-primary' : 'text-muted-foreground'}`}
        onClick={handleBookmark}
        disabled={loading}
      >
        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        <span className="text-xs">{isBookmarked ? 'Salvato' : 'Salva'}</span>
      </Button>
    </div>
  );
};