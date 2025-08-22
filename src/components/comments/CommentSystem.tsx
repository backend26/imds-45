import React, { useState, useEffect } from 'react';
import { Send, Reply, MoreVertical, Heart, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from '@/utils/dateUtilsV3';
import { it } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    username: string;
    display_name: string;
    profile_picture_url: string | null;
  };
  replies?: Comment[];
  likes_count?: number;
  is_liked?: boolean;
}

interface CommentSystemProps {
  postId: string;
  className?: string;
}

export const CommentSystem: React.FC<CommentSystemProps> = ({ postId, className = "" }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:author_id (
            username,
            display_name,
            profile_picture_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments with replies
      const commentMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];

      data.forEach(comment => {
        const commentWithAuthor: Comment = {
          ...comment,
          author: comment.profiles,
          replies: [],
          likes_count: 0,
          is_liked: false
        };
        commentMap.set(comment.id, commentWithAuthor);

        if (!comment.parent_comment_id) {
          topLevelComments.push(commentWithAuthor);
        }
      });

      // Add replies to parent comments
      data.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies!.push(commentMap.get(comment.id)!);
          }
        }
      });

      setComments(topLevelComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i commenti",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per commentare",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Commento vuoto",
        description: "Scrivi qualcosa prima di inviare",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: newComment.trim(),
          parent_comment_id: null
        });

      if (error) throw error;

      setNewComment('');
      await loadComments();
      
      toast({
        title: "Commento inviato",
        description: "Il tuo commento è stato pubblicato"
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare il commento",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (parentId: string) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per rispondere",
        variant: "destructive"
      });
      return;
    }

    if (!replyText.trim()) {
      toast({
        title: "Risposta vuota",
        description: "Scrivi qualcosa prima di rispondere",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: replyText.trim(),
          parent_comment_id: parentId
        });

      if (error) throw error;

      setReplyText('');
      setReplyTo(null);
      await loadComments();
      
      toast({
        title: "Risposta inviata",
        description: "La tua risposta è stata pubblicata"
      });
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({
        title: "Errore",
        description: "Impossibile inviare la risposta",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-4' : 'mb-6'}`}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.author?.profile_picture_url || ''} />
              <AvatarFallback>
                {comment.author?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {comment.author?.display_name || comment.author?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { 
                      addSuffix: true
                    })}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Flag className="mr-2 h-4 w-4" />
                      Segnala
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="mt-2 text-sm">{comment.content}</p>
              <div className="flex items-center mt-3 space-x-2">
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Heart className="h-4 w-4 mr-1" />
                  <span className="text-xs">{comment.likes_count || 0}</span>
                </Button>
                {!isReply && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    <span className="text-xs">Rispondi</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply form */}
      {replyTo === comment.id && (
        <div className="mt-4 ml-8">
          <div className="flex space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.user_metadata?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Scrivi una risposta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setReplyTo(null)}
                >
                  Annulla
                </Button>
                <Button 
                  size="sm"
                  onClick={() => submitReply(comment.id)}
                  disabled={submitting || !replyText.trim()}
                >
                  {submitting ? 'Inviando...' : 'Rispondi'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render replies */}
      {comment.replies?.map(reply => renderComment(reply, true))}
    </div>
  );

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="comments-section" className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Commenti ({comments.length})
        </h3>
        
        {user ? (
          <div className="flex space-x-3 mb-6">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.user_metadata?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Scrivi un commento..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={submitComment}
                  disabled={submitting || !newComment.trim()}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Inviando...' : 'Invia'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Card className="p-4 mb-6">
            <p className="text-center text-muted-foreground">
              <Button variant="link" className="p-0 h-auto font-normal">
                Accedi
              </Button>
              {' '}per partecipare alla discussione
            </p>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              Nessun commento ancora. Sii il primo a commentare!
            </p>
          </Card>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};