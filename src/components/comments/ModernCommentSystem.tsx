import { useState, useEffect } from 'react';
import { MessageCircle, Heart, Reply, Flag, MoreHorizontal, Trash2, Edit, Send, Smile, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  author: {
    username: string;
    display_name: string;
    profile_picture_url?: string;
  };
  likes_count: number;
  user_has_liked: boolean;
  replies: Comment[];
}

interface ModernCommentSystemProps {
  postId: string;
  className?: string;
}

const emojis = ['😀', '😂', '❤️', '👍', '👎', '😢', '😠', '🎉', '🤔', '👏', '🔥', '💯'];

export const ModernCommentSystem = ({ postId, className }: ModernCommentSystemProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          author_id,
          parent_comment_id,
          created_at,
          updated_at,
          profiles:author_id (
            username,
            display_name,
            profile_picture_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Load comment likes - temporarily disable since comment_likes table doesn't exist
      const commentIds = commentsData?.map(c => c.id) || [];
      const likesData: any[] = []; // Empty array for now

      const processedComments = (commentsData || []).map((comment: any) => {
        const commentLikes = likesData?.filter(l => l.comment_id === comment.id) || [];
        return {
          ...comment,
          author: comment.profiles,
          likes_count: commentLikes.length,
          user_has_liked: user ? commentLikes.some(l => l.user_id === user.id) : false,
          replies: []
        };
      });

      // Build comment tree
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      processedComments.forEach((comment: Comment) => {
        commentMap.set(comment.id, comment);
      });

      processedComments.forEach((comment: Comment) => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      setComments(rootComments);
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
    if (!user || !newComment.trim()) return;

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
        title: "Commento pubblicato",
        description: "Il tuo commento è stato aggiunto con successo"
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

  const submitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: replyContent.trim(),
          parent_comment_id: parentId
        });

      if (error) throw error;

      setReplyTo(null);
      setReplyContent('');
      await loadComments();
      
      toast({
        title: "Risposta pubblicata",
        description: "La tua risposta è stata aggiunta con successo"
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

  const toggleCommentLike = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per mettere like",
        variant: "destructive"
      });
      return;
    }

    try {
      const comment = findCommentById(commentId);
      if (!comment) return;

      if (comment.user_has_liked) {
        // Comment likes temporarily disabled
        console.log('Comment like removal - feature disabled');
      } else {
        // Comment likes temporarily disabled  
        console.log('Comment like addition - feature disabled');
      }

      await loadComments();
    } catch (error) {
      console.error('Error toggling comment like:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il like",
        variant: "destructive"
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id);

      if (error) throw error;

      await loadComments();
      toast({
        title: "Commento eliminato",
        description: "Il commento è stato rimosso con successo"
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il commento",
        variant: "destructive"
      });
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const saveEdit = async (commentId: string) => {
    if (!user || !editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId)
        .eq('author_id', user.id);

      if (error) throw error;

      setEditingId(null);
      setEditContent('');
      await loadComments();
      
      toast({
        title: "Commento aggiornato",
        description: "Le modifiche sono state salvate"
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il commento",
        variant: "destructive"
      });
    }
  };

  const findCommentById = (id: string): Comment | null => {
    const findInArray = (comments: Comment[]): Comment | null => {
      for (const comment of comments) {
        if (comment.id === id) return comment;
        const found = findInArray(comment.replies);
        if (found) return found;
      }
      return null;
    };
    return findInArray(comments);
  };

  const handleProfileClick = (username: string) => {
    navigate(`/@${username}`);
  };

  const addEmoji = (emoji: string, isReply: boolean = false) => {
    if (isReply) {
      setReplyContent(prev => prev + emoji);
    } else {
      setNewComment(prev => prev + emoji);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-6 mt-3 border-l-2 border-border pl-4' : 'mb-4'}`}>
      <div className="flex gap-3">
        <Avatar 
          className="h-8 w-8 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all" 
          onClick={() => handleProfileClick(comment.author.username)}
        >
          <AvatarImage src={comment.author.profile_picture_url} />
          <AvatarFallback>
            {comment.author.display_name?.charAt(0) || comment.author.username?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="bg-card rounded-xl p-3 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleProfileClick(comment.author.username)}
                  className="font-medium text-sm hover:text-primary transition-colors cursor-pointer"
                >
                  {comment.author.display_name || comment.author.username}
                </button>
                <span className="text-xs text-muted-foreground">
                  @{comment.author.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: it
                  })}
                </span>
                {comment.updated_at !== comment.created_at && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    Modificato
                  </Badge>
                )}
              </div>
              
              {user && user.id === comment.author_id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => startEdit(comment)}>
                      <Edit className="h-3 w-3 mr-2" />
                      Modifica
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteComment(comment.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Elimina
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {editingId === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveEdit(comment.id)}>
                    Salva
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setEditingId(null)}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>
          
          <div className="flex items-center gap-4 mt-2 ml-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 text-xs transition-colors ${
                comment.user_has_liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
              }`}
              onClick={() => toggleCommentLike(comment.id)}
            >
              <Heart className={`h-3 w-3 mr-1 ${comment.user_has_liked ? 'fill-current' : ''}`} />
              {comment.likes_count}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Rispondi
            </Button>
          </div>
          
          {replyTo === comment.id && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg border-l-2 border-primary">
              <div className="flex gap-2 mb-2">
                <Textarea
                  placeholder={`Rispondi a ${comment.author.display_name || comment.author.username}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[60px] resize-none text-sm"
                />
                <div className="flex flex-col gap-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                      <div className="grid grid-cols-6 gap-1">
                        {emojis.map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-lg hover:bg-muted"
                            onClick={() => addEmoji(emoji, true)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => submitReply(comment.id)}
                  disabled={!replyContent.trim() || submitting}
                  className="h-7"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Pubblica
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setReplyTo(null)}
                  className="h-7"
                >
                  Annulla
                </Button>
              </div>
            </div>
          )}
          
          {comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Commenti ({comments.reduce((total, comment) => total + 1 + comment.replies.length, 0)})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        {user ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Scrivi un commento..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Smile className="h-4 w-4 mr-2" />
                        Emoji
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2">
                      <div className="grid grid-cols-6 gap-1">
                        {emojis.map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-lg hover:bg-muted"
                            onClick={() => addEmoji(emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Button 
                    onClick={submitComment}
                    disabled={!newComment.trim() || submitting}
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Pubblica commento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Effettua il login per lasciare un commento
            </p>
          </div>
        )}

        <Separator />

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Caricamento commenti...</p>
          </div>
        ) : comments.length > 0 ? (
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-4">
              {comments.map(comment => renderComment(comment))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Nessun commento ancora. Sii il primo a commentare!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};