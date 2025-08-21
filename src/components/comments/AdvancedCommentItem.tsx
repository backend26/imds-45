import { useState } from 'react';
import { Heart, Reply, MoreHorizontal, Trash2, Edit, ChevronDown, ChevronUp, CornerDownRight, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatTimeAgo } from '@/utils/timeFormat';
import { CommentContent } from './CommentContent';
import { CommentInput } from './CommentInput';
import { CommentReportModal } from './CommentReportModal';
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
  depth?: number;
}

interface AdvancedCommentItemProps {
  comment: Comment;
  currentUser?: any;
  isAdmin: boolean;
  onLike: (commentId: string) => Promise<boolean>;
  onReply: (parentId: string, content: string) => Promise<boolean>;
  onEdit: (commentId: string, content: string) => Promise<boolean>;
  onDelete: (commentId: string) => Promise<boolean>;
  depth?: number;
  replyingToAuthor?: string;
}

export const AdvancedCommentItem = ({ 
  comment, 
  currentUser, 
  isAdmin,
  onLike,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
  replyingToAuthor
}: AdvancedCommentItemProps) => {
  const [showReplies, setShowReplies] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const isOwner = currentUser?.id === comment.author_id;
  const canModerate = isAdmin || isOwner;
  
  // Limit nesting depth (TikTok-style)
  const maxDepth = 3;
  const isMaxDepth = depth >= maxDepth;
  
  const handleReplySubmit = async (content: string) => {
    const success = await onReply(comment.id, content);
    if (success) {
      setIsReplying(false);
    }
    return success;
  };

  const handleEditSubmit = async (content: string) => {
    const success = await onEdit(comment.id, content);
    if (success) {
      setIsEditing(false);
    }
    return success;
  };

  const handleLike = async () => {
    if (onLike) {
      await onLike(comment.id);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(comment.id);
    }
  };

  return (
    <div className={cn(
      "space-y-3",
      depth === 1 && "ml-6 border-l-2 border-l-muted/30 pl-4",
    )}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.profile_picture_url} />
          <AvatarFallback className="text-xs bg-primary/10">
            {comment.author.display_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="bg-card/50 rounded-lg border border-border/50 p-3 hover:bg-card transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">
                  {comment.author.display_name}
                </span>
                {replyingToAuthor && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CornerDownRight className="h-3 w-3" />
                    <span className="text-xs">@{replyingToAuthor}</span>
                  </div>
                )}
                <span className="text-muted-foreground text-xs">
                  {formatTimeAgo(comment.created_at)}
                </span>
                {comment.updated_at !== comment.created_at && (
                  <span className="text-muted-foreground text-xs italic">
                    (modificato)
                  </span>
                )}
              </div>
              
              {currentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isOwner && (
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifica
                      </DropdownMenuItem>
                    )}
                    {canModerate && (
                      <DropdownMenuItem 
                        onClick={handleDelete} 
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Elimina
                      </DropdownMenuItem>
                    )}
                    {!isOwner && (
                      <DropdownMenuItem onClick={() => setShowReportModal(true)}>
                        <Flag className="h-4 w-4 mr-2" />
                        Segnala
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {/* Content */}
            {isEditing ? (
              <CommentInput
                onSubmit={handleEditSubmit}
                placeholder="Modifica il tuo commento..."
                onCancel={() => setIsEditing(false)}
                initialValue={comment.content}
                className="mt-2"
              />
            ) : (
              <CommentContent
                content={comment.content}
                isExpanded={isExpanded}
                onToggleExpanded={() => setIsExpanded(!isExpanded)}
                className="mb-3"
              />
            )}
            
            {/* Actions */}
            {!isEditing && (
              <div className="flex items-center gap-1 border-t border-border/50 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2 text-xs hover:bg-muted",
                    comment.user_has_liked && 'text-red-500'
                  )}
                  onClick={handleLike}
                >
                  <Heart 
                    className={cn(
                      "h-3 w-3 mr-1",
                      comment.user_has_liked && "fill-current"
                    )} 
                  />
                  {comment.likes_count}
                </Button>
                
                {currentUser && !isMaxDepth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs hover:bg-muted"
                    onClick={() => setIsReplying(true)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Rispondi
                  </Button>
                )}
                
                {comment.replies.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs hover:bg-muted ml-auto"
                    onClick={() => setShowReplies(!showReplies)}
                  >
                    {showReplies ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Nascondi risposte ({comment.replies.length})
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Mostra risposte ({comment.replies.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3">
              <CommentInput
                onSubmit={handleReplySubmit}
                placeholder={`Rispondi a ${comment.author.display_name}...`}
                replyingTo={comment.author.display_name}
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}
          
          {/* Replies */}
          {showReplies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => (
                <AdvancedCommentItem
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                  onLike={onLike}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  depth={1} // All replies at same indentation level
                  replyingToAuthor={comment.author.display_name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Report Modal */}
      {showReportModal && (
        <CommentReportModal
          commentId={comment.id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};