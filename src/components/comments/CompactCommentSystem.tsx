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
      <div key={comment.id} className={`${depth > 0 ? 'ml-6 border-l-2 border-border/40 pl-4' : ''} mb-2`}>
        {/* Comment Card */}
        <div className={`
          rounded-lg border bg-card shadow-sm transition-all duration-200 hover:shadow-md
          ${depth > 0 ? 'bg-muted/30' : 'bg-card'}
        `}>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-background">
                <AvatarImage src={comment.author.profile_picture_url} />
                <AvatarFallback className="text-sm font-medium">
                  {comment.author.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate text-foreground">
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem 
                        onClick={() => setReportModalComment(comment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Segnala commento
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Content */}
                <div className="mb-3">
                  <p className="text-sm leading-relaxed break-words text-foreground">
                    {displayContent}
                  </p>
                  
                  {shouldTruncate && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => toggleExpanded(comment.id)}
                      className="h-auto p-0 text-xs text-primary hover:text-primary/80 mt-1"
                    >
                      {isExpanded ? 'Mostra meno' : 'Leggi tutto'}
                    </Button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(comment.id)}
                    className={`h-8 px-3 text-xs rounded-md transition-all duration-200 hover:scale-105 ${
                      comment.user_has_liked 
                        ? 'text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900' 
                        : 'text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 mr-1.5 ${comment.user_has_liked ? 'fill-current' : ''}`} />
                    {comment.likes_count}
                  </Button>
                  
                  {depth < MAX_THREAD_DEPTH && user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                      className="h-8 px-3 text-xs rounded-md transition-all duration-200 hover:scale-105 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                    >
                      <Reply className="h-3.5 w-3.5 mr-1.5" />
                      Rispondi
                    </Button>
                  )}
                  
                  {replyCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRepliesVisibility(comment.id)}
                      className="h-8 px-3 text-xs rounded-md transition-all duration-200 hover:scale-105 text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                    >
                      <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                      {showRepliesForComment ? 'Nascondi' : 'Mostra'} {replyCount} {replyCount === 1 ? 'risposta' : 'risposte'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Reply form */}
            {replyTo === comment.id && user && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex gap-3">
                  <Avatar className="w-7 h-7 flex-shrink-0">
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
                      className="min-h-[80px] text-sm resize-none border-input"
                      maxLength={MAX_COMMENT_CHARS}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {replyText.length}/{MAX_COMMENT_CHARS}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setReplyTo(null)}
                          className="h-8 text-xs"
                        >
                          Annulla
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={submitting || !replyText.trim()}
                          className="h-8 text-xs"
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
        </div>

        {/* Replies with connecting line */}
        {showRepliesForComment && comment.replies.length > 0 && (
          <div className="mt-3 space-y-2">
            {comment.replies.map((reply, index) => (
              <div key={reply.id} className="relative">
                {/* Connecting line for replies */}
                {index === 0 && (
                  <div className="absolute -top-2 left-4 w-px h-4 bg-border/60"></div>
                )}
                {renderComment(reply, depth + 1)}
              </div>
            ))}
          </div>
        )}
        
        {/* Thread continuation for deep replies */}
        {depth >= MAX_THREAD_DEPTH && comment.replies.length > 0 && (
          <div className="mt-3 ml-6">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs border-dashed"
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
      <div className={`${className}`}>
        {/* Loading Comment Container */}
        <div className="border border-border rounded-xl bg-card/50 shadow-sm">
          {/* Header Section Loading */}
          <div className="px-6 py-4 border-b border-border bg-muted/20 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
              <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-8 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Form loading */}
            <div className="bg-muted/30 border border-dashed border-border rounded-lg p-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-20 bg-muted rounded animate-pulse"></div>
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                    <div className="h-9 w-32 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comments loading */}
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-lg border bg-card shadow-sm p-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
                        <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Main Comment Container */}
      <div className="border border-border rounded-xl bg-card/50 shadow-sm">
        {/* Header Section */}
        <div className="px-6 py-4 border-b border-border bg-muted/20 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Commenti
              <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
            </h3>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* New comment form */}
          {user ? (
            <div className="bg-muted/30 border border-dashed border-border rounded-lg p-4">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-primary/20">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-sm font-medium">
                    {user.user_metadata?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Condividi la tua opinione..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] text-sm resize-none border-input bg-background"
                    maxLength={MAX_COMMENT_CHARS}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">
                      {newComment.length}/{MAX_COMMENT_CHARS}
                    </span>
                    <Button 
                      onClick={handleSubmitComment}
                      disabled={submitting || !newComment.trim()}
                      className="h-9 px-4 text-sm font-medium"
                    >
                      {submitting ? 'Pubblicando...' : 'Pubblica Commento'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-border rounded-lg bg-muted/30">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                Accedi per partecipare alla discussione
              </p>
            </div>
          )}

          {/* Comments list with fixed height and scroll */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Nessun commento ancora
                </p>
                <p className="text-xs text-muted-foreground">
                  Sii il primo a condividere la tua opinione!
                </p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2 -mr-2 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent">
                {comments.map(comment => (
                  <div key={comment.id} className="group">
                    {renderComment(comment)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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