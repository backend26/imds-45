import { useState } from 'react';
import { Heart, Reply, Flag, MoreHorizontal, Trash2, Edit, Send, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from '@/utils/dateUtilsV3';
import { it } from 'date-fns/locale';

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

interface CommentItemProps {
  comment: Comment;
  currentUser?: any;
  isAdmin: boolean;
  onLike: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: (parentId: string) => void;
  onCancelReply: () => void;
  editingComment: string | null;
  editContent: string;
  setEditContent: (content: string) => void;
  onUpdateComment: (commentId: string) => void;
  onCancelEdit: () => void;
  depth?: number;
}

export const CommentItem = ({ 
  comment, 
  currentUser, 
  isAdmin,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onReport,
  replyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  onCancelReply,
  editingComment,
  editContent,
  setEditContent,
  onUpdateComment,
  onCancelEdit,
  depth = 0
}: CommentItemProps) => {
  const [showReplies, setShowReplies] = useState(true);
  const isOwner = currentUser?.id === comment.author_id;
  const canModerate = isAdmin || isOwner;
  const isReplying = replyingTo === comment.id;
  const isEditing = editingComment === comment.id;

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l border-border pl-4' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.profile_picture_url} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {comment.author.display_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="bg-card rounded-lg border">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">
                    {comment.author.display_name}
                  </span>
                  <span className="text-muted-foreground text-xs">
        {formatDistanceToNow(new Date(comment.created_at), {
          addSuffix: true
        })}
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
                        <>
                          <DropdownMenuItem onClick={onEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifica
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={onDelete} 
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Elimina
                          </DropdownMenuItem>
                        </>
                      )}
                      {!isOwner && (
                        <DropdownMenuItem onClick={onReport}>
                          <Flag className="h-4 w-4 mr-2" />
                          Segnala
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[60px] resize-none"
                    placeholder="Modifica il tuo commento..."
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onUpdateComment(comment.id)}
                      size="sm"
                      disabled={!editContent.trim()}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Salva
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onCancelEdit}
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground leading-relaxed">
                  {comment.content}
                </p>
              )}
            </div>
            
            {!isEditing && (
              <div className="flex items-center gap-1 px-3 pb-3 border-t border-border/50 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 text-xs ${
                    comment.user_has_liked 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={onLike}
                >
                  <Heart 
                    className={`h-3 w-3 mr-1 ${
                      comment.user_has_liked ? 'fill-current' : ''
                    }`} 
                  />
                  {comment.likes_count}
                </Button>
                
                {currentUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs hover:bg-muted"
                    onClick={onReply}
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
            <div className="mt-3 ml-6">
              <div className="flex gap-3">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder={`Rispondi a ${comment.author.display_name}...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onSubmitReply(comment.id)}
                      size="sm"
                      disabled={!replyContent.trim()}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Rispondi
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onCancelReply}
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Replies */}
          {showReplies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  isAdmin={isAdmin}
                  onLike={() => onLike}
                  onReply={() => onReply}
                  onEdit={() => onEdit}
                  onDelete={() => onDelete}
                  onReport={() => onReport}
                  replyingTo={replyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onSubmitReply={onSubmitReply}
                  onCancelReply={onCancelReply}
                  editingComment={editingComment}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  onUpdateComment={onUpdateComment}
                  onCancelEdit={onCancelEdit}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};