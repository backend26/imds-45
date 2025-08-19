import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageCircle, 
  Heart, 
  MoreVertical, 
  Reply, 
  Flag,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  is_liked: boolean;
  author?: {
    id: string;
    username: string;
    display_name?: string;
    profile_picture_url?: string;
  };
  replies?: Comment[];
  replies_count: number;
}

interface AdvancedCommentSystemProps {
  postId: string;
}

export const AdvancedCommentSystem: React.FC<AdvancedCommentSystemProps> = ({ postId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          author_id,
          post_id,
          parent_id,
          created_at,
          updated_at,
          likes_count,
          profiles!author_id (
            id,
            username,
            display_name,
            profile_picture_url
          )
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order(sortBy === 'popular' ? 'likes_count' : 'created_at', { 
          ascending: sortBy === 'recent' ? false : false 
        });

      if (error) throw error;

      // Count replies per comment
      const { data: repliesCount } = await supabase
        .from('comments')
        .select('parent_id, count(*)')
        .eq('post_id', postId)
        .not('parent_id', 'is', null)
        .group('parent_id');

      const processedComments = (commentsData || []).map(comment => ({
        ...comment,
        author: comment.profiles,
        replies_count: repliesCount?.find(r => r.parent_id === comment.id)?.count || 0,
        is_liked: false, // TODO: Check if user liked comment
        replies: []
      }));

      setComments(processedComments);
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
  }, [postId, sortBy, toast]);

  const fetchReplies = useCallback(async (commentId: string) => {
    setLoadingReplies(prev => new Set([...prev, commentId]));
    try {
      const { data: repliesData, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          author_id,
          post_id,
          parent_id,
          created_at,
          updated_at,
          likes_count,
          profiles!author_id (
            id,
            username,
            display_name,
            profile_picture_url
          )
        `)
        .eq('parent_id', commentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const processedReplies = (repliesData || []).map(reply => ({
        ...reply,
        author: reply.profiles,
        is_liked: false, // TODO: Check if user liked reply
        replies_count: 0
      }));

      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: processedReplies }
          : comment
      ));
    } catch (error) {
      console.error('Error fetching replies:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le risposte",
        variant: "destructive"
      });
    } finally {
      setLoadingReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  }, [toast]);

  const toggleReplies = (commentId: string) => {
    const isExpanded = expandedReplies.has(commentId);
    
    if (isExpanded) {
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      setExpandedReplies(prev => new Set([...prev, commentId]));
      // Fetch replies if not already loaded
      const comment = comments.find(c => c.id === commentId);
      if (comment && (!comment.replies || comment.replies.length === 0) && comment.replies_count > 0) {
        fetchReplies(commentId);
      }
    }
  };

  const submitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          content: newComment.trim(),
          author_id: user.id,
          post_id: postId
        }]);

      if (error) throw error;

      setNewComment('');
      toast({
        title: "Successo",
        description: "Commento pubblicato con successo"
      });
      
      fetchComments();
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

  const submitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          content: replyContent.trim(),
          author_id: user.id,
          post_id: postId,
          parent_id: parentId
        }]);

      if (error) throw error;

      setReplyContent('');
      setReplyingTo(null);
      toast({
        title: "Successo",
        description: "Risposta pubblicata con successo"
      });
      
      // Refresh replies for this comment
      fetchReplies(parentId);
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
    if (!user) return;
    
    // TODO: Implement like functionality
    toast({
      title: "Funzionalità in arrivo",
      description: "Il sistema di like sarà presto disponibile"
    });
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => (
    <div className={cn("space-y-3", isReply && "ml-12 border-l-2 border-muted pl-4")}>
      <div className="flex items-start gap-3">
        <Link to={`/${comment.author?.username}`} className="flex-shrink-0">
          <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary/20 transition-all">
            <AvatarImage src={comment.author?.profile_picture_url} />
            <AvatarFallback className="text-xs">
              {comment.author?.display_name?.[0] || comment.author?.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Link 
              to={`/${comment.author?.username}`}
              className="font-medium text-sm hover:text-primary transition-colors"
            >
              {comment.author?.display_name || comment.author?.username}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { 
                addSuffix: true, 
                locale: it 
              })}
            </span>
          </div>
          
          <p className="text-sm leading-relaxed">{comment.content}</p>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs hover:text-primary"
              onClick={() => toggleLike(comment.id)}
            >
              <Heart className={cn(
                "h-3 w-3 mr-1",
                comment.is_liked && "fill-current text-red-500"
              )} />
              {comment.likes_count}
            </Button>
            
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs hover:text-primary"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Rispondi
              </Button>
            )}
            
            {!isReply && comment.replies_count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs hover:text-primary"
                onClick={() => toggleReplies(comment.id)}
                disabled={loadingReplies.has(comment.id)}
              >
                {loadingReplies.has(comment.id) ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : expandedReplies.has(comment.id) ? (
                  <ChevronUp className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronDown className="h-3 w-3 mr-1" />
                )}
                {expandedReplies.has(comment.id) ? 'Nascondi' : `Mostra ${comment.replies_count}`} risposta
                {comment.replies_count !== 1 ? 'e' : ''}
              </Button>
            )}
          </div>
          
          {replyingTo === comment.id && (
            <div className="space-y-2 pt-2">
              <Textarea
                placeholder="Scrivi una risposta..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => submitReply(comment.id)}
                  disabled={submitting || !replyContent.trim()}
                >
                  {submitting && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  Rispondi
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                >
                  Annulla
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Replies */}
      {expandedReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3 ml-4">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="border-2 border-muted/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Commenti ({comments.length})
          </CardTitle>
          
          <Select value={sortBy} onValueChange={(value: 'popular' | 'recent') => setSortBy(value)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Più popolari</SelectItem>
              <SelectItem value="recent">Più recenti</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        {user ? (
          <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {user.user_metadata?.full_name || 'Utente'}
              </span>
            </div>
            <Textarea
              placeholder="Scrivi un commento..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button 
                onClick={submitComment}
                disabled={submitting || !newComment.trim()}
              >
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Pubblica commento
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-muted/20 rounded-lg">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              Accedi per lasciare un commento
            </p>
            <Button asChild>
              <Link to="/login">Accedi</Link>
            </Button>
          </div>
        )}
        
        {/* Comments List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium mb-2">Nessun commento</h3>
            <p className="text-sm text-muted-foreground">
              Sii il primo a commentare questo articolo!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};