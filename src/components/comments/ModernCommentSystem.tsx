import { useState, useCallback, useMemo, useEffect } from 'react';
import { MessageCircle, Heart, Reply, Flag, MoreHorizontal, Trash2, Edit, Send, User, ChevronDown, ChevronUp, ArrowUpDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useRoleCheck } from '@/hooks/use-role-check';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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

type SortOption = 'recent' | 'popular' | 'oldest';

export const ModernCommentSystem = ({ postId, className }: ModernCommentSystemProps) => {
  const { user } = useAuth();
  const { hasAccess: isAdmin } = useRoleCheck({ allowedRoles: ['administrator'] });
  const navigate = useNavigate();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Load comments
  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to nested structure
      const processedComments = (data || []).map((comment: any) => ({
        ...comment,
        author: comment.profiles,
        likes_count: 0, // Will be fetched separately if needed
        user_has_liked: false,
        replies: []
      }));

      // Separate parent comments and replies
      const parentComments = processedComments.filter(c => !c.parent_comment_id);
      const replies = processedComments.filter(c => c.parent_comment_id);

      // Nest replies under parent comments
      const commentsWithReplies = parentComments.map(parent => ({
        ...parent,
        replies: replies.filter(reply => reply.parent_comment_id === parent.id)
      }));

      setComments(commentsWithReplies);
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
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Sort comments
  const sortedComments = useMemo(() => {
    const sortComments = (comments: Comment[]): Comment[] => {
      return [...comments]
        .sort((a, b) => {
          switch (sortBy) {
            case 'popular':
              return (b.likes_count + b.replies.length * 0.5) - (a.likes_count + a.replies.length * 0.5);
            case 'oldest':
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case 'recent':
            default:
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
        })
        .map(comment => ({
          ...comment,
          replies: sortComments(comment.replies)
        }));
    };
    return sortComments(comments);
  }, [comments, sortBy]);

  const totalComments = useMemo(() => {
    const countReplies = (comments: Comment[]): number => 
      comments.reduce((total, comment) => total + 1 + countReplies(comment.replies), 0);
    return countReplies(sortedComments);
  }, [sortedComments]);

  // Add comment
  const handleSubmitComment = useCallback(async () => {
    if (!user || !newComment.trim()) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      loadComments();
      toast({
        title: "Commento pubblicato",
        description: "Il tuo commento è stato aggiunto con successo"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Errore",
        description: "Impossibile pubblicare il commento",
        variant: "destructive"
      });
    }
  }, [user, newComment, postId, loadComments]);

  // Add reply
  const handleSubmitReply = useCallback(async (parentId: string) => {
    if (!user || !replyContent.trim()) return;
    
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

      setReplyContent('');
      setReplyingTo(null);
      loadComments();
      toast({
        title: "Risposta pubblicata",
        description: "La tua risposta è stata aggiunta con successo"
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Errore",
        description: "Impossibile pubblicare la risposta",
        variant: "destructive"
      });
    }
  }, [user, replyContent, postId, loadComments]);

  // Delete comment
  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id);

      if (error) throw error;

      loadComments();
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
  }, [user, loadComments]);

  // Toggle replies visibility
  const toggleReplies = (commentId: string) => {
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

  // Comment Item Component
  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={cn("space-y-3", isReply && "ml-12 border-l-2 border-l-muted pl-4")}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.profile_picture_url} />
          <AvatarFallback className="text-xs bg-primary/10">
            {comment.author.display_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">{comment.author.display_name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: it
              })}
            </span>
          </div>
          
          {editingComment === comment.id ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Salva
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingComment(null)}>
                  Annulla
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground mb-3 leading-relaxed">
              {comment.content}
            </p>
          )}

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs hover:bg-red-50 hover:text-red-600"
            >
              <Heart className="h-3 w-3 mr-1" />
              {comment.likes_count}
            </Button>
            
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setReplyingTo(comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Rispondi
              </Button>
            )}

            {(user?.id === comment.author_id || isAdmin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => setEditingComment(comment.id)}>
                    <Edit className="h-3 w-3 mr-2" />
                    Modifica
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Elimina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div className="ml-11 space-y-2">
          <Textarea
            placeholder="Scrivi una risposta..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[60px] text-sm"
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleSubmitReply(comment.id)}
              disabled={!replyContent.trim()}
            >
              <Send className="h-3 w-3 mr-1" />
              Rispondi
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
              Annulla
            </Button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="ml-11">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleReplies(comment.id)}
            className="h-6 px-2 text-xs text-primary mb-2"
          >
            {expandedReplies.has(comment.id) ? (
              <><ChevronUp className="h-3 w-3 mr-1" /> Nascondi {comment.replies.length} risposte</>
            ) : (
              <><ChevronDown className="h-3 w-3 mr-1" /> Mostra {comment.replies.length} risposte</>
            )}
          </Button>
          
          {expandedReplies.has(comment.id) && (
            <div className="space-y-4">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Card className={cn("shadow-lg border-2", className)}>
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span>Commenti</span>
            <Badge variant="secondary" className="ml-2">
              {totalComments}
            </Badge>
          </CardTitle>
          
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="text-sm">
                    {sortBy === 'popular' ? 'Popolari' : sortBy === 'recent' ? 'Recenti' : 'Meno recenti'}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Più popolari</SelectItem>
              <SelectItem value="recent">Più recenti</SelectItem>
              <SelectItem value="oldest">Meno recenti</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* New Comment Form */}
        {user ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="bg-primary/10">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Condividi la tua opinione..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] resize-none border-2 focus:border-primary"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Sii rispettoso e costruttivo nei tuoi commenti
                  </span>
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    className="bg-gradient-to-r from-primary to-primary/80"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Pubblica commento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold mb-2">Partecipa alla discussione</h3>
            <p className="text-muted-foreground mb-4">
              Accedi per condividere la tua opinione e interagire con la community
            </p>
            <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-primary to-primary/80">
              Accedi ora
            </Button>
          </div>
        )}

        <Separator />

        {/* Comments List */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-20 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold mb-2">Nessun commento ancora</h3>
            <p className="text-muted-foreground">
              Sii il primo a condividere la tua opinione su questo articolo
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedComments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};