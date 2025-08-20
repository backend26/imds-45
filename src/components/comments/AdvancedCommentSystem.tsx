import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { CommentInput } from './CommentInput';
import { AdvancedCommentItem } from './AdvancedCommentItem';
import { useEnhancedComments } from '@/hooks/use-enhanced-comments';

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

interface AdvancedCommentSystemProps {
  postId: string;
  className?: string;
}

type SortOption = 'recent' | 'popular' | 'oldest';

export const AdvancedCommentSystem = ({ postId, className }: AdvancedCommentSystemProps) => {
  const { user } = useAuth();
  const { userRole } = useRoleCheck({ allowedRoles: ['administrator', 'journalist', 'editor'] });
  const isAdmin = userRole === 'administrator';
  const isEditor = ['administrator', 'journalist', 'editor'].includes(userRole || '');
  const navigate = useNavigate();
  
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [reportingComment, setReportingComment] = useState<string | null>(null);

  const {
    comments,
    loading,
    totalComments,
    addComment,
    addReply,
    toggleLike,
    updateComment,
    deleteComment,
    loadComments
  } = useEnhancedComments(postId);

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const sortedComments = useMemo(() => {
    const sortComments = (commentsList: Comment[]): Comment[] => {
      const sorted = [...commentsList].sort((a, b) => {
        switch (sortBy) {
          case 'popular':
            return b.likes_count - a.likes_count;
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'recent':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });

      return sorted.map(comment => ({
        ...comment,
        replies: sortComments(comment.replies)
      }));
    };

    return sortComments(comments);
  }, [comments, sortBy]);

  const handleAddComment = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim() || !user) return false;

    const success = await addComment(content.trim());
    return success;
  }, [user, addComment]);

  const handleReply = useCallback(async (parentId: string, content: string): Promise<boolean> => {
    if (!user) return false;
    return await addReply(parentId, content.trim());
  }, [user, addReply]);

  const handleReport = useCallback((commentId: string) => {
    setReportingComment(commentId);
  }, []);

  if (loading && comments.length === 0) {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header con conteggio e controlli */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{totalComments} Commenti</span>
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {!isCollapsed && (
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Recenti</span>
                </div>
              </SelectItem>
              <SelectItem value="popular">
                <div className="flex items-center space-x-2">
                  <Heart className="w-3 h-3" />
                  <span>Popolari</span>
                </div>
              </SelectItem>
              <SelectItem value="oldest">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-3 h-3 rotate-180" />
                  <span>Meno recenti</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Input per nuovo commento */}
      {!isCollapsed && user && (
        <CommentInput
          onSubmit={handleAddComment}
          placeholder="Scrivi un commento..."
          className="mb-6"
        />
      )}

      {!isCollapsed && !user && (
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Accedi per partecipare alla discussione
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/login')}
          >
            Accedi
          </Button>
        </div>
      )}

      {/* Lista commenti */}
      {!isCollapsed && (
        <div className="space-y-4">
          {sortedComments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nessun commento ancora</p>
              <p className="text-sm text-muted-foreground mt-1">
                Sii il primo a commentare questo articolo!
              </p>
            </div>
          ) : (
            sortedComments.map((comment) => (
              <AdvancedCommentItem
                key={comment.id}
                comment={comment}
                currentUser={user}
                isAdmin={isAdmin}
                onReply={handleReply}
                onLike={toggleLike}
                onEdit={updateComment}
                onDelete={deleteComment}
                depth={0}
              />
            ))
          )}
        </div>
      )}

      {/* Modal per segnalazione */}
      {reportingComment && (
        <CommentReportModal
          commentId={reportingComment}
          onClose={() => setReportingComment(null)}
        />
      )}
    </div>
  );
};

// Wrapper per retrocompatibilità
export const EnhancedCommentSystem = AdvancedCommentSystem;