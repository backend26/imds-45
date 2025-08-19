import { useState, useCallback, useMemo } from 'react';
import { MessageCircle, Heart, Reply, Flag, MoreHorizontal, Trash2, Edit, Send, Smile, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { CommentReportModal } from './CommentReportModal';
import { useOptimizedComments } from '@/hooks/use-optimized-comments';

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

interface OptimizedCommentSystemProps {
  postId: string;
  className?: string;
}

const emojis = ['😀', '😂', '❤️', '👍', '👎', '😢', '😠', '🎉', '🤔', '👏', '🔥', '💯'];

export const OptimizedCommentSystem = ({ postId, className }: OptimizedCommentSystemProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    comments,
    loading,
    addComment,
    addReply,
    toggleLike,
    updateComment,
    deleteComment
  } = useOptimizedComments(postId);
  
  const [newComment, setNewComment] = useState('');
  const [replyStates, setReplyStates] = useState<Record<string, { active: boolean; content: string }>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [collapsedReplies, setCollapsedReplies] = useState<Set<string>>(new Set());
  const [reportingComment, setReportingComment] = useState<string | null>(null);

  const totalComments = useMemo(() => {
    const countReplies = (comments: Comment[]): number => 
      comments.reduce((total, comment) => total + 1 + countReplies(comment.replies), 0);
    return countReplies(comments);
  }, [comments]);

  const handleSubmitComment = useCallback(async () => {
    if (!user || !newComment.trim()) return;
    
    const success = await addComment(newComment.trim());
    if (success) {
      setNewComment('');
      toast({
        title: "Commento pubblicato",
        description: "Il tuo commento è stato aggiunto con successo"
      });
    }
  }, [user, newComment, addComment]);

  const handleSubmitReply = useCallback(async (parentId: string) => {
    const replyState = replyStates[parentId];
    if (!user || !replyState?.content.trim()) return;

    const success = await addReply(parentId, replyState.content.trim());
    if (success) {
      setReplyStates(prev => ({ ...prev, [parentId]: { active: false, content: '' } }));
      toast({
        title: "Risposta pubblicata",
        description: "La tua risposta è stata aggiunta con successo"
      });
    }
  }, [user, replyStates, addReply]);

  const handleToggleLike = useCallback(async (commentId: string) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere loggato per mettere like",
        variant: "destructive"
      });
      return;
    }
    await toggleLike(commentId);
  }, [user, toggleLike]);

  const handleStartEdit = useCallback((comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  }, []);

  const handleSaveEdit = useCallback(async (commentId: string) => {
    if (!editContent.trim()) return;
    
    const success = await updateComment(commentId, editContent.trim());
    if (success) {
      setEditingId(null);
      setEditContent('');
      toast({
        title: "Commento aggiornato",
        description: "Le modifiche sono state salvate"
      });
    }
  }, [editContent, updateComment]);

  const handleDelete = useCallback(async (commentId: string) => {
    const success = await deleteComment(commentId);
    if (success) {
      toast({
        title: "Commento eliminato",
        description: "Il commento è stato rimosso con successo"
      });
    }
  }, [deleteComment]);

  const toggleReply = useCallback((commentId: string) => {
    setReplyStates(prev => ({
      ...prev,
      [commentId]: {
        active: !prev[commentId]?.active,
        content: prev[commentId]?.content || ''
      }
    }));
  }, []);

  const updateReplyContent = useCallback((commentId: string, content: string) => {
    setReplyStates(prev => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        content
      }
    }));
  }, []);

  const toggleRepliesCollapse = useCallback((commentId: string) => {
    setCollapsedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const handleProfileClick = useCallback((username: string) => {
    navigate(`/@${username}`);
  }, [navigate]);

  const addEmoji = useCallback((emoji: string, commentId?: string) => {
    if (commentId) {
      updateReplyContent(commentId, (replyStates[commentId]?.content || '') + emoji);
    } else {
      setNewComment(prev => prev + emoji);
    }
  }, [replyStates, updateReplyContent]);

  const renderComment = useCallback((comment: Comment, depth = 0) => {
    const isCollapsed = collapsedReplies.has(comment.id);
    const replyState = replyStates[comment.id];
    const maxDepth = 6;
    const shouldShowLine = depth > 0 && depth < maxDepth;

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-3 border-l border-border/30 pl-3' : 'mb-3'} ${depth >= maxDepth ? 'bg-muted/20 rounded-md p-2' : ''}`}>
        <div className="flex gap-2 items-start">
          <Avatar 
            className="h-7 w-7 flex-shrink-0 cursor-pointer hover:ring-1 hover:ring-primary transition-all mt-0.5" 
            onClick={() => handleProfileClick(comment.author.username)}
          >
            <AvatarImage src={comment.author.profile_picture_url} />
            <AvatarFallback className="text-xs">
              {comment.author.display_name?.charAt(0) || comment.author.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="bg-card rounded-lg p-2 border shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => handleProfileClick(comment.author.username)}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {comment.author.display_name || comment.author.username}
                  </button>
                  <span className="text-muted-foreground">@{comment.author.username}</span>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: it
                    })}
                  </span>
                  {comment.updated_at !== comment.created_at && (
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                      Modificato
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                    onClick={() => setReportingComment(comment.id)}
                  >
                    <Flag className="h-3 w-3" />
                  </Button>
                  
                  {user && user.id === comment.author_id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                        <DropdownMenuItem onClick={() => handleStartEdit(comment)}>
                          <Edit className="h-3 w-3 mr-2" />
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(comment.id)}
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
              
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[50px] resize-none text-sm"
                  />
                  <div className="flex gap-1">
                    <Button size="sm" className="h-6 text-xs" onClick={() => handleSaveEdit(comment.id)}>
                      Salva
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-xs"
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
            
            <div className="flex items-center gap-3 mt-1 ml-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-xs transition-colors ${
                  comment.user_has_liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
                }`}
                onClick={() => handleToggleLike(comment.id)}
              >
                <Heart className={`h-3 w-3 mr-1 ${comment.user_has_liked ? 'fill-current' : ''}`} />
                {comment.likes_count}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                onClick={() => toggleReply(comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Rispondi
              </Button>

              {comment.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => toggleRepliesCollapse(comment.id)}
                >
                  {isCollapsed ? (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Mostra {comment.replies.length} rispost{comment.replies.length === 1 ? 'a' : 'e'}
                    </>
                  ) : (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Nascondi risposte
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {replyState?.active && (
              <div className="mt-2 p-2 bg-muted/30 rounded-lg border-l-2 border-primary">
                <div className="flex gap-2 mb-2">
                  <Textarea
                    placeholder={`Rispondi a ${comment.author.display_name || comment.author.username}...`}
                    value={replyState.content}
                    onChange={(e) => updateReplyContent(comment.id, e.target.value)}
                    className="min-h-[50px] resize-none text-sm flex-1"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 bg-background border shadow-lg">
                      <div className="grid grid-cols-6 gap-1">
                        {emojis.map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-lg hover:bg-muted"
                            onClick={() => addEmoji(emoji, comment.id)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="h-6 text-xs"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyState.content.trim()}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Pubblica
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-6 text-xs"
                    onClick={() => toggleReply(comment.id)}
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            )}
            
            {comment.replies.length > 0 && !isCollapsed && (
              <div className="mt-2 space-y-2">
                {comment.replies.map(reply => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [
    collapsedReplies, replyStates, editingId, editContent, user,
    handleProfileClick, handleToggleLike, handleStartEdit, handleSaveEdit,
    handleDelete, toggleReply, updateReplyContent, toggleRepliesCollapse,
    handleSubmitReply, addEmoji
  ]);

  return (
    <div className={`bg-background rounded-lg border shadow-sm ${className}`}>
      <div className="p-4 border-b">
        <h3 className="flex items-center gap-2 font-semibold">
          <MessageCircle className="h-5 w-5 text-primary" />
          Commenti ({totalComments})
        </h3>
      </div>
      
      <div className="p-4 space-y-4">
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
                  className="min-h-[70px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Smile className="h-4 w-4 mr-2" />
                        Emoji
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 bg-background border shadow-lg">
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
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
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

        <div className="border-t pt-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Caricamento commenti...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {comments.map(comment => renderComment(comment))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Nessun commento ancora. Sii il primo a commentare!
              </p>
            </div>
          )}
        </div>
      </div>

      {reportingComment && (
        <CommentReportModal
          commentId={reportingComment}
          onClose={() => setReportingComment(null)}
        />
      )}
    </div>
  );
};