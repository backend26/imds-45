import React, { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, Reply, MoreHorizontal, ChevronDown, ChevronUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    display_name: string;
    profile_picture_url: string | null;
    role: string;
  };
  replies: Comment[];
  like_count: number;
  user_has_liked: boolean;
}

interface ImprovedCommentSystemProps {
  postId: string;
  className?: string;
}

export const ImprovedCommentSystem: React.FC<ImprovedCommentSystemProps> = ({
  postId,
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
  const [collapsedReplies, setCollapsedReplies] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId, sortBy]);

  const fetchComments = async () => {
    try {
      setLoading(true);

      // Fetch main comments with author info and like counts
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!comments_author_id_fkey(
            id,
            username,
            display_name,
            profile_picture_url,
            role
          )
        `)
        .eq('post_id', postId)
        .is('parent_comment_id', null)
        .order(sortBy === 'popular' ? 'created_at' : 'created_at', { ascending: false });

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: repliesData } = await supabase
            .from('comments')
            .select(`
              *,
              author:profiles!comments_author_id_fkey(
                id,
                username,
                display_name,
                profile_picture_url,
                role
              )
            `)
            .eq('parent_comment_id', comment.id)
            .order('created_at', { ascending: true });

          // Get like count for main comment
          const { count: likeCount } = await supabase
            .from('comment_likes')
            .select('*', { count: 'exact' })
            .eq('comment_id', comment.id);

          // Check if user has liked
          let userHasLiked = false;
          if (user) {
            const { data: userLike } = await supabase
              .from('comment_likes')
              .select('*')
              .eq('comment_id', comment.id)
              .eq('user_id', user.id)
              .single();
            userHasLiked = !!userLike;
          }

          // Process replies with like info
          const processedReplies = await Promise.all(
            (repliesData || []).map(async (reply) => {
              const { count: replyLikeCount } = await supabase
                .from('comment_likes')
                .select('*', { count: 'exact' })
                .eq('comment_id', reply.id);

              let replyUserHasLiked = false;
              if (user) {
                const { data: replyUserLike } = await supabase
                  .from('comment_likes')
                  .select('*')
                  .eq('comment_id', reply.id)
                  .eq('user_id', user.id)
                  .single();
                replyUserHasLiked = !!replyUserLike;
              }

              return {
                ...reply,
                like_count: replyLikeCount || 0,
                user_has_liked: replyUserHasLiked,
                replies: []
              };
            })
          );

          return {
            ...comment,
            like_count: likeCount || 0,
            user_has_liked: userHasLiked,
            replies: processedReplies
          };
        })
      );

      // Sort by popularity if selected
      if (sortBy === 'popular') {
        commentsWithReplies.sort((a, b) => b.like_count - a.like_count);
      }

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i commenti",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per commentare",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          author_id: user.id,
          post_id: postId
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      toast({
        title: "Successo",
        description: "Commento pubblicato",
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Errore",
        description: "Impossibile pubblicare il commento",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per rispondere",
        variant: "destructive"
      });
      return;
    }

    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: replyText.trim(),
          author_id: user.id,
          post_id: postId,
          parent_comment_id: parentId
        });

      if (error) throw error;

      setReplyText('');
      setReplyingTo(null);
      await fetchComments();
      toast({
        title: "Successo",
        description: "Risposta pubblicata",
      });
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({
        title: "Errore",
        description: "Impossibile pubblicare la risposta",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per mettere like",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Remove like
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        // Add like
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
      }

      await fetchComments();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleRepliesCollapse = (commentId: string) => {
    const newCollapsed = new Set(collapsedReplies);
    if (newCollapsed.has(commentId)) {
      newCollapsed.delete(commentId);
    } else {
      newCollapsed.add(commentId);
    }
    setCollapsedReplies(newCollapsed);
  };

  const navigateToProfile = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'administrator':
        return <Badge variant="destructive" className="text-xs">Admin</Badge>;
      case 'journalist':
        return <Badge variant="default" className="text-xs">Giornalista</Badge>;
      default:
        return null;
    }
  };

  const CommentComponent = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <Card className={cn(
      "transition-colors hover:bg-muted/30",
      isReply && "ml-8 mt-2"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar 
            className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigateToProfile(comment.author.username)}
          >
            <AvatarImage 
              src={comment.author.profile_picture_url || ''} 
              alt={comment.author.display_name}
            />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span 
                className="font-medium text-sm cursor-pointer hover:underline"
                onClick={() => navigateToProfile(comment.author.username)}
              >
                {comment.author.display_name}
              </span>
              {getRoleBadge(comment.author.role)}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { 
                  addSuffix: true, 
                  locale: it 
                })}
              </span>
            </div>
            
            <p className="text-sm leading-relaxed">{comment.content}</p>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleLike(comment.id)}
                className={cn(
                  "text-xs h-7 px-2",
                  comment.user_has_liked && "text-primary"
                )}
              >
                <ThumbsUp className={cn(
                  "h-3 w-3 mr-1",
                  comment.user_has_liked && "fill-current"
                )} />
                {comment.like_count}
              </Button>
              
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-xs h-7 px-2"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Rispondi
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Reply form */}
        {replyingTo === comment.id && (
          <div className="mt-4 ml-11">
            <Textarea
              placeholder="Scrivi una risposta..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={() => handleSubmitReply(comment.id)}
                disabled={!replyText.trim() || submitting}
              >
                Rispondi
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
              >
                Annulla
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Commenti ({comments.length})
        </h3>
        
        <Select value={sortBy} onValueChange={(value: 'popular' | 'recent') => setSortBy(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Più popolari</SelectItem>
            <SelectItem value="recent">Più recenti</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* New comment form */}
      <Card>
        <CardContent className="p-4">
          <Textarea
            placeholder="Scrivi un commento..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-end mt-3">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? 'Pubblicazione...' : 'Pubblica commento'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id}>
            <CommentComponent comment={comment} />
            
            {/* Replies section */}
            {comment.replies.length > 0 && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRepliesCollapse(comment.id)}
                  className="mb-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {collapsedReplies.has(comment.id) ? (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Mostra {comment.replies.length} risposte
                    </>
                  ) : (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Nascondi risposte
                    </>
                  )}
                </Button>
                
                {!collapsedReplies.has(comment.id) && (
                  <div className="space-y-2">
                    {comment.replies.map((reply) => (
                      <CommentComponent key={reply.id} comment={reply} isReply />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessun commento ancora</p>
            <p className="text-sm">Sii il primo a commentare questo articolo!</p>
          </div>
        )}
      </div>
    </div>
  );
};