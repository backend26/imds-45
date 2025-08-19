import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Send, Reply, Heart, Flag, MoreVertical, Smile, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    display_name: string;
    profile_picture_url: string | null;
    role: string;
  };
  replies?: Comment[];
  likes_count?: number;
  is_liked?: boolean;
}

interface EnhancedCommentSystemProps {
  postId: string;
  className?: string;
}

type SortOrder = 'popular' | 'recent';

export const EnhancedCommentSystem: React.FC<EnhancedCommentSystemProps> = ({ 
  postId, 
  className = "" 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('popular');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const loadComments = useCallback(async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      // First get comments with author profiles
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_author_id_fkey (
            username,
            display_name,
            profile_picture_url,
            role
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: sortOrder === 'recent' });

      if (commentsError) throw commentsError;

      // Get likes count for each comment
      const commentIds = commentsData?.map(c => c.id) || [];
      const { data: likesData, error: likesError } = await supabase
        .from('comment_likes')
        .select('comment_id, user_id')
        .in('comment_id', commentIds);

      if (likesError) throw likesError;

      // Process likes data
      const likesMap = new Map<string, { count: number; isLiked: boolean }>();
      likesData?.forEach(like => {
        const existing = likesMap.get(like.comment_id) || { count: 0, isLiked: false };
        existing.count++;
        if (like.user_id === user?.id) existing.isLiked = true;
        likesMap.set(like.comment_id, existing);
      });

      // Combine data and organize into threaded structure
      const commentMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];

      commentsData?.forEach(comment => {
        const likes = likesMap.get(comment.id) || { count: 0, isLiked: false };
        const commentWithData: Comment = {
          ...comment,
          replies: [],
          likes_count: likes.count,
          is_liked: likes.isLiked
        };
        commentMap.set(comment.id, commentWithData);

        if (!comment.parent_comment_id) {
          topLevelComments.push(commentWithData);
        }
      });

      // Add replies to parent comments (max 3 levels deep)
      commentsData?.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies!.push(commentMap.get(comment.id)!);
          }
        }
      });

      // Sort based on selected order
      if (sortOrder === 'popular') {
        topLevelComments.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      }

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
  }, [postId, sortOrder, user?.id, toast]);

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
      setShowEmojiPicker(false);
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
      setShowReplyEmojiPicker(false);
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

  const toggleLike = async (commentId: string, isLiked: boolean) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per mettere like",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
        
        if (error) throw error;
      }

      // Refresh comments to update like counts
      await loadComments();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il like",
        variant: "destructive"
      });
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setNewComment(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const onReplyEmojiClick = (emojiData: any) => {
    setReplyText(prev => prev + emojiData.emoji);
    setShowReplyEmojiPicker(false);
  };

  const toggleRepliesVisibility = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'administrator':
        return <Badge variant="destructive" className="text-xs">Admin</Badge>;
      case 'journalist':
        return <Badge variant="default" className="text-xs">Giornalista</Badge>;
      case 'editor':
        return <Badge variant="secondary" className="text-xs">Editor</Badge>;
      default:
        return null;
    }
  };

  const renderComment = (comment: Comment, isReply = false, depth = 0) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies.has(comment.id);
    
    return (
      <div key={comment.id} className={`${isReply ? 'ml-6 mt-4' : 'mb-6'} ${depth > 2 ? 'opacity-75' : ''}`}>
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Link to={`/@${comment.profiles?.username}`} className="flex-shrink-0">
                <Avatar className="w-10 h-10 hover:ring-2 hover:ring-primary/20 transition-all">
                  <AvatarImage src={comment.profiles?.profile_picture_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                    {comment.profiles?.display_name?.charAt(0) || comment.profiles?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/@${comment.profiles?.username}`}
                      className="font-medium text-sm hover:text-primary transition-colors"
                    >
                      {comment.profiles?.display_name || comment.profiles?.username || 'Utente'}
                    </Link>
                    {comment.profiles?.role && getRoleBadge(comment.profiles.role)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { 
                        addSuffix: true, 
                        locale: it 
                      })}
                    </span>
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
                </div>
                
                <p className="text-sm leading-relaxed mb-3">{comment.content}</p>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-8 px-2 ${comment.is_liked ? 'text-red-500' : ''}`}
                    onClick={() => toggleLike(comment.id, comment.is_liked || false)}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${comment.is_liked ? 'fill-current' : ''}`} />
                    <span className="text-xs">{comment.likes_count || 0}</span>
                  </Button>
                  
                  {depth < 2 && (
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
                  
                  {hasReplies && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => toggleRepliesVisibility(comment.id)}
                    >
                      <span className="text-xs">
                        {isExpanded ? 'Nascondi' : 'Mostra'} risposte ({comment.replies!.length})
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reply form */}
        {replyTo === comment.id && (
          <Card className="mt-4 ml-6">
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.user_metadata?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="relative">
                    <Textarea
                      placeholder="Scrivi una risposta..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[80px] resize-none pr-10"
                    />
                    <Popover open={showReplyEmojiPicker} onOpenChange={setShowReplyEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute bottom-2 right-2 h-8 w-8 p-0"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <EmojiPicker onEmojiClick={onReplyEmojiClick} />
                      </PopoverContent>
                    </Popover>
                  </div>
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
            </CardContent>
          </Card>
        )}

        {/* Render replies */}
        {hasReplies && isExpanded && (
          <div className="mt-4">
            {comment.replies!.map(reply => renderComment(reply, true, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Commenti ({comments.length})
          </CardTitle>
          
          <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Più popolari
                </div>
              </SelectItem>
              <SelectItem value="recent">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Più recenti
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {user ? (
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                    {user.user_metadata?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="relative">
                    <Textarea
                      placeholder="Scrivi un commento..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px] resize-none pr-10"
                    />
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute bottom-2 right-2 h-8 w-8 p-0"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                      </PopoverContent>
                    </Popover>
                  </div>
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
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4">
              <p className="text-center text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">
                  Accedi
                </Link>
                {' '}per partecipare alla discussione
              </p>
            </CardContent>
          </Card>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nessun commento ancora</p>
                  <p className="text-sm">Sii il primo a commentare!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </div>
      </CardContent>
    </Card>
  );
};