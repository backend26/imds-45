import { useState, useCallback, useMemo } from 'react';
import { MessageCircle, Heart, Reply, Flag, MoreHorizontal, Trash2, Edit, Send, User, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useRoleCheck } from '@/hooks/use-role-check';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { CommentReportModal } from './CommentReportModal';
import { CommentItem } from './CommentItem';
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

interface EnhancedCommentSystemProps {
  postId: string;
  className?: string;
}

type SortOption = 'recent' | 'popular' | 'oldest';

export const EnhancedCommentSystem = ({ postId, className }: EnhancedCommentSystemProps) => {
  const { user } = useAuth();
  const { hasAccess: isAdmin } = useRoleCheck({ allowedRoles: ['administrator'] });
  const navigate = useNavigate();
  const {
    comments: rawComments,
    loading,
    addComment,
    addReply,
    toggleLike,
    updateComment,
    deleteComment
  } = useOptimizedComments(postId);
  
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [reportingComment, setReportingComment] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Sort comments based on selected option
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
    return sortComments(rawComments);
  }, [rawComments, sortBy]);

  const totalComments = useMemo(() => {
    const countReplies = (comments: Comment[]): number => 
      comments.reduce((total, comment) => total + 1 + countReplies(comment.replies), 0);
    return countReplies(sortedComments);
  }, [sortedComments]);

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
    if (!user || !replyContent.trim()) return;
    
    const success = await addReply(parentId, replyContent.trim());
    if (success) {
      setReplyContent('');
      setReplyingTo(null);
      toast({
        title: "Risposta pubblicata",
        description: "La tua risposta è stata aggiunta con successo"
      });
    }
  }, [user, replyContent, addReply]);

  const handleUpdateComment = useCallback(async (commentId: string) => {
    if (!user || !editContent.trim()) return;
    
    const success = await updateComment(commentId, editContent.trim());
    if (success) {
      setEditContent('');
      setEditingComment(null);
      toast({
        title: "Commento aggiornato",
        description: "Il commento è stato modificato con successo"
      });
    }
  }, [user, editContent, updateComment]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!user) return;
    
    const success = await deleteComment(commentId);
    if (success) {
      toast({
        title: "Commento eliminato",
        description: "Il commento è stato rimosso con successo"
      });
    }
  }, [user, deleteComment]);

  const startEditing = (commentId: string, currentContent: string) => {
    setEditingComment(commentId);
    setEditContent(currentContent);
  };

  const startReplying = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };

  return (
    <div className={`bg-background rounded-xl border shadow-sm ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <MessageCircle className="h-5 w-5 text-primary" />
            Commenti ({totalComments})
          </h3>
          
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-36">
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
      </div>
      
      <div className="p-4 space-y-4">
        {/* New Comment Form */}
        {user ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="bg-primary/10">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Scrivi un commento..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
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
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="mb-2">Accedi per partecipare alla discussione</p>
            <Button variant="outline" onClick={() => navigate('/login')}>
              Accedi
            </Button>
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-9 h-9 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-16 bg-muted rounded mb-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nessun commento ancora</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={user}
                isAdmin={isAdmin}
                onLike={() => toggleLike(comment.id)}
                onReply={() => startReplying(comment.id)}
                onEdit={() => startEditing(comment.id, comment.content)}
                onDelete={() => handleDeleteComment(comment.id)}
                onReport={() => setReportingComment(comment.id)}
                replyingTo={replyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                onSubmitReply={handleSubmitReply}
                onCancelReply={() => setReplyingTo(null)}
                editingComment={editingComment}
                editContent={editContent}
                setEditContent={setEditContent}
                onUpdateComment={handleUpdateComment}
                onCancelEdit={() => setEditingComment(null)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportingComment && (
        <CommentReportModal
          commentId={reportingComment}
          onClose={() => setReportingComment(null)}
        />
      )}
    </div>
  );
};