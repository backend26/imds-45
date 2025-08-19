import React, { useState, useCallback } from 'react';
import { Heart, Reply, MoreVertical, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useOptimizedComments } from '@/hooks/use-optimized-comments';
import { CommentReportModal } from './CommentReportModal';
import { formatDistanceToNow } from 'date-fns';
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

interface CompactCommentSystemProps {
  postId: string;
  className?: string;
}

const MAX_COMMENT_LENGTH = 300;
const MAX_COMMENT_CHARS = 1000;
const MAX_THREAD_DEPTH = 2;

export const CompactCommentSystem: React.FC<CompactCommentSystemProps> = ({ 
  postId, 
  className = "" 
}) => {
  const { user } = useAuth();
  const { 
    comments, 
    loading, 
    addComment, 
    addReply, 
    toggleLike 
  } = useOptimizedComments(postId);

  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const [reportModalComment, setReportModalComment] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleExpanded = useCallback((commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const toggleRepliesVisibility = useCallback((commentId: string) => {
    setShowReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;
    
    setSubmitting(true);
    const success = await addComment(newComment.trim());
    if (success) {
      setNewComment('');
    }
    setSubmitting(false);
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || submitting) return;
    
    setSubmitting(true);
    const success = await addReply(parentId, replyText.trim());
    if (success) {
      setReplyText('');
      setReplyTo(null);
    }
    setSubmitting(false);
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const isExpanded = expandedComments.has(comment.id);
    const shouldTruncate = comment.content.length > MAX_COMMENT_LENGTH;
    const displayContent = shouldTruncate && !isExpanded 
      ? comment.content.substring(0, MAX_COMMENT_LENGTH) + '...'
      : comment.content;
    
    const showRepliesForComment = showReplies.has(comment.id);
    const replyCount = comment.replies.length;

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-4' : ''} mb-3`}>
        {/* Comment */}
        <div className="border-l-2 border-muted pl-3 py-2 hover:border-primary/30 transition-colors">
          <div className="flex items-start gap-2">
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarImage src={comment.author.profile_picture_url} />
              <AvatarFallback className="text-xs">
                {comment.author.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {comment.author.display_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { 
                      addSuffix: true, 
                      locale: it 
                    })}
                  </span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem 
                      onClick={() => setReportModalComment(comment.id)}
                      className="text-destructive"
                    >
                      Segnala
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Content */}
              <p className="text-sm mt-1 leading-relaxed break-words">
                {displayContent}
              </p>
              
              {shouldTruncate && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => toggleExpanded(comment.id)}
                  className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                >
                  {isExpanded ? 'Mostra meno' : 'Leggi tutto'}
                </Button>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(comment.id)}
                  className={`h-6 px-2 text-xs hover:bg-red-50 hover:text-red-600 transition-colors ${
                    comment.user_has_liked ? 'text-red-600 bg-red-50' : 'text-muted-foreground'
                  }`}
                >
                  <Heart className={`h-3 w-3 mr-1 ${comment.user_has_liked ? 'fill-current' : ''}`} />
                  {comment.likes_count}
                </Button>
                
                {depth < MAX_THREAD_DEPTH && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="h-6 px-2 text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Rispondi
                  </Button>
                )}
                
                {replyCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRepliesVisibility(comment.id)}
                    className="h-6 px-2 text-xs hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    {showRepliesForComment ? 'Nascondi' : 'Mostra'} {replyCount}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Reply form */}
          {replyTo === comment.id && user && (
            <div className="mt-3 ml-8 border-t border-muted pt-3">
              <div className="flex gap-2">
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {user.user_metadata?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Scrivi una risposta..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[60px] text-sm resize-none"
                    maxLength={MAX_COMMENT_CHARS}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {replyText.length}/{MAX_COMMENT_CHARS}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setReplyTo(null)}
                        className="h-7 text-xs"
                      >
                        Annulla
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={submitting || !replyText.trim()}
                        className="h-7 text-xs"
                      >
                        {submitting ? 'Invio...' : 'Rispondi'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Replies */}
        {showRepliesForComment && comment.replies.map(reply => renderComment(reply, depth + 1))}
        
        {/* Thread continuation for deep replies */}
        {depth >= MAX_THREAD_DEPTH && comment.replies.length > 0 && (
          <div className="ml-4 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 text-xs"
              onClick={() => {/* Future: Open modal with full thread */}}
            >
              Continua discussione ({comment.replies.length})
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-muted rounded w-1/4"></div>
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-12 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Commenti ({comments.length})
        </h3>
      </div>
      
      {/* New comment form */}
      {user ? (
        <div className="border rounded-lg p-3 bg-muted/20">
          <div className="flex gap-2">
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="text-xs">
                {user.user_metadata?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Scrivi un commento..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] text-sm resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
                maxLength={MAX_COMMENT_CHARS}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {newComment.length}/{MAX_COMMENT_CHARS}
                </span>
                <Button 
                  onClick={handleSubmitComment}
                  disabled={submitting || !newComment.trim()}
                  size="sm"
                  className="h-7 text-xs"
                >
                  {submitting ? 'Pubblicando...' : 'Pubblica'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 border rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Accedi per partecipare alla discussione
          </p>
        </div>
      )}

      {/* Comments list with fixed height and scroll */}
      <div className="max-h-[500px] overflow-y-auto space-y-1 pr-2 -mr-2">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Nessun commento ancora. Sii il primo a commentare!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {comments.map(comment => (
              <div key={comment.id} className="group">
                {renderComment(comment)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportModalComment && (
        <CommentReportModal
          commentId={reportModalComment}
          onClose={() => setReportModalComment(null)}
        />
      )}
    </div>
  );
};