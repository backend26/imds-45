import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, 
  Smile, 
  Hash, 
  AtSign, 
  Heart, 
  Reply, 
  Flag, 
  ChevronDown, 
  ChevronUp,
  MoreHorizontal,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EmojiPicker from 'emoji-picker-react';
import { CommentReportModal } from './CommentReportModal';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  post_id: string;
  parent_comment_id: string | null;
  profiles?: {
    username: string;
    display_name: string;
    role: string;
    profile_picture_url?: string;
  };
  replies?: Comment[];
  likes_count?: number;
  is_liked?: boolean;
}

interface UserSuggestion {
  id: string;
  username: string;
  display_name: string;
  profile_picture_url?: string;
}

interface AdvancedCommentSystemProps {
  postId: string;
  className?: string;
}

const MAX_COMMENT_LENGTH = 500;
const SMART_TIME_CUTOFF = 60; // seconds for smart time format

// Smart time formatter
const formatSmartTime = (date: string): string => {
  const now = new Date();
  const commentDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mesi`;
  return `${Math.floor(diffInSeconds / 31536000)}anni`;
};

// Common emoji shortcuts
const emojiShortcuts: { [key: string]: string } = {
  ':)': '😊',
  ':D': '😃',
  ':(': '😔',
  ':P': '😛',
  '<3': '❤️',
  '</3': '💔',
  ':fire:': '🔥',
  ':100:': '💯',
  ':clap:': '👏',
  ':heart:': '❤️',
  ':thumbsup:': '👍',
  ':thumbsdown:': '👎'
};

export const AdvancedCommentSystem: React.FC<AdvancedCommentSystemProps> = ({ 
  postId, 
  className = "" 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Core state
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Comment composition state
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  
  // Interactive features state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReplyEmojiPicker, setShowReplyEmojiPicker] = useState<string | null>(null);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [reportingComment, setReportingComment] = useState<string | null>(null);
  
  // Refs for mentions and text area management
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load comments
  const loadComments = useCallback(async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_author_id_fkey (
            username,
            display_name,
            role,
            profile_picture_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Organize comments with replies in linear format
      const topLevelComments: Comment[] = [];
      const repliesMap = new Map<string, Comment[]>();

      data.forEach(comment => {
        const commentWithProfile: Comment = {
          ...comment,
          profiles: comment.profiles,
          likes_count: 0,
          is_liked: false
        };

        if (!comment.parent_comment_id) {
          topLevelComments.push(commentWithProfile);
        } else {
          if (!repliesMap.has(comment.parent_comment_id)) {
            repliesMap.set(comment.parent_comment_id, []);
          }
          repliesMap.get(comment.parent_comment_id)!.push(commentWithProfile);
        }
      });

      // Add replies to parent comments
      topLevelComments.forEach(comment => {
        comment.replies = repliesMap.get(comment.id) || [];
      });

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
  }, [postId, toast]);

  // Search users for mentions
  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setUserSuggestions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, profile_picture_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(5);

      if (error) throw error;

      setUserSuggestions(data.map(profile => ({
        id: profile.user_id,
        username: profile.username,
        display_name: profile.display_name,
        profile_picture_url: profile.profile_picture_url
      })));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }, []);

  // Handle mentions and hashtags
  const handleTextChange = useCallback((text: string, isReply = false) => {
    // Process emoji shortcuts
    let processedText = text;
    Object.entries(emojiShortcuts).forEach(([shortcut, emoji]) => {
      processedText = processedText.replace(new RegExp(shortcut.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emoji);
    });

    if (isReply) {
      setReplyText(processedText);
    } else {
      setNewComment(processedText);
    }

    // Handle mentions
    const mentionMatch = text.match(/@(\w+)$/);
    if (mentionMatch) {
      setShowUserSuggestions(true);
      searchUsers(mentionMatch[1]);
    } else {
      setShowUserSuggestions(false);
      setUserSuggestions([]);
    }
  }, [searchUsers]);

  // Insert mention
  const insertMention = useCallback((user: UserSuggestion, isReply = false) => {
    const textarea = isReply ? replyTextareaRef.current : textareaRef.current;
    const currentText = isReply ? replyText : newComment;
    
    const mentionText = `@${user.username} `;
    const newText = currentText.replace(/@\w*$/, mentionText);
    
    handleTextChange(newText, isReply);
    setShowUserSuggestions(false);
    textarea?.focus();
  }, [newComment, replyText, handleTextChange]);

  // Submit new comment
  const submitComment = async () => {
    if (!user || !newComment.trim()) return;

    if (newComment.length > MAX_COMMENT_LENGTH) {
      toast({
        title: "Commento troppo lungo",
        description: `Massimo ${MAX_COMMENT_LENGTH} caratteri consentiti`,
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

  // Submit reply
  const submitReply = async (parentId: string) => {
    if (!user || !replyText.trim()) return;

    if (replyText.length > MAX_COMMENT_LENGTH) {
      toast({
        title: "Risposta troppo lunga",
        description: `Massimo ${MAX_COMMENT_LENGTH} caratteri consentiti`,
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
      await loadComments();
      
      toast({
        title: "Risposta pubblicata",
        description: "La tua risposta è stata aggiunta con successo"
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

  // Toggle expanded comment
  const toggleExpandedComment = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  // Count total comments including replies
  const totalCommentsCount = comments.reduce((total, comment) => {
    return total + 1 + (comment.replies?.length || 0);
  }, 0);

  // Render comment content with smart truncation
  const renderCommentContent = (content: string, commentId: string) => {
    const isExpanded = expandedComments.has(commentId);
    const shouldTruncate = content.length > 280;
    
    if (!shouldTruncate) return content;
    
    return (
      <div>
        <span>{isExpanded ? content : `${content.substring(0, 280)}...`}</span>
        <button
          onClick={() => toggleExpandedComment(commentId)}
          className="ml-2 text-primary hover:text-primary/80 text-sm font-medium"
        >
          {isExpanded ? 'Mostra meno' : 'Leggi tutto'}
        </button>
      </div>
    );
  };

  // Render comment component
  const renderComment = (comment: Comment, isReply = false, parentAuthor?: string) => (
    <div 
      key={comment.id} 
      className={`group border rounded-lg p-4 transition-colors hover:bg-muted/50 ${
        isReply ? 'ml-6 border-l-4 border-l-primary/20' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            {comment.profiles?.profile_picture_url ? (
              <img 
                src={comment.profiles.profile_picture_url} 
                alt={comment.profiles.display_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-primary">
                {comment.profiles?.display_name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Comment header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                to={`/@${comment.profiles?.username}`}
                className="font-medium text-sm hover:text-primary transition-colors"
              >
                {comment.profiles?.display_name || 'Utente'}
              </Link>
              
              {/* Reply indicator */}
              {isReply && parentAuthor && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3" />
                  <span>@{parentAuthor}</span>
                </div>
              )}
              
              {/* Role badge */}
              {comment.profiles?.role && comment.profiles.role !== 'registered_user' && (
                <Badge variant="outline" className="text-xs">
                  {comment.profiles.role === 'administrator' ? 'Admin' :
                   comment.profiles.role === 'editor' ? 'Editor' : 
                   comment.profiles.role === 'journalist' ? 'Giornalista' : ''}
                </Badge>
              )}
              
              <span className="text-xs text-muted-foreground">
                {formatSmartTime(comment.created_at)}
              </span>
            </div>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setReportingComment(comment.id)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Segnala
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Comment content */}
          <div className="text-sm leading-relaxed mb-3">
            {renderCommentContent(comment.content, comment.id)}
          </div>

          {/* Comment actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Heart className="h-3 w-3 mr-1" />
              {comment.likes_count || 0}
            </Button>
            
            {!isReply && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Rispondi
              </Button>
            )}
          </div>

          {/* Reply form */}
          {replyTo === comment.id && (
            <div className="mt-4 space-y-3">
              <div className="relative">
                <Textarea
                  ref={replyTextareaRef}
                  placeholder={`Rispondi a ${comment.profiles?.display_name}...`}
                  value={replyText}
                  onChange={(e) => handleTextChange(e.target.value, true)}
                  className="min-h-[80px] pr-20 resize-none"
                  maxLength={MAX_COMMENT_LENGTH}
                />
                
                {/* Reply actions */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setShowReplyEmojiPicker(showReplyEmojiPicker === comment.id ? null : comment.id)}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>

                {/* Reply emoji picker */}
                {showReplyEmojiPicker === comment.id && (
                  <div className="absolute bottom-12 right-0 z-50">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setReplyText(prev => prev + emojiData.emoji);
                        setShowReplyEmojiPicker(null);
                      }}
                      width={300}
                      height={400}
                    />
                  </div>
                )}
              </div>

              {/* Reply character count */}
              <div className="flex items-center justify-between">
                <span className={`text-xs ${
                  replyText.length > MAX_COMMENT_LENGTH * 0.9 
                    ? 'text-destructive' 
                    : 'text-muted-foreground'
                }`}>
                  {replyText.length}/{MAX_COMMENT_LENGTH}
                </span>

                <div className="flex gap-2">
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
                    disabled={submitting || !replyText.trim() || replyText.length > MAX_COMMENT_LENGTH}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    {submitting ? 'Invio...' : 'Rispondi'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
        setShowReplyEmojiPicker(null);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowUserSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Commenti ({totalCommentsCount})
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Comment form */}
          {user ? (
            <div className="space-y-3">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Scrivi un commento... (usa @username per menzionare, #hashtag per argomenti)"
                  value={newComment}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="min-h-[100px] pr-20 resize-none"
                  maxLength={MAX_COMMENT_LENGTH}
                />
                
                {/* Comment input actions */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>

                {/* Emoji picker */}
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-12 right-0 z-50">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setNewComment(prev => prev + emojiData.emoji);
                        setShowEmojiPicker(false);
                      }}
                      width={300}
                      height={400}
                    />
                  </div>
                )}

                {/* User suggestions */}
                {showUserSuggestions && userSuggestions.length > 0 && (
                  <div ref={suggestionsRef} className="absolute bottom-12 left-0 right-12 bg-background border rounded-lg shadow-lg z-40 max-h-40 overflow-y-auto">
                    {userSuggestions.map(user => (
                      <button
                        key={user.id}
                        onClick={() => insertMention(user)}
                        className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                          {user.profile_picture_url ? (
                            <img 
                              src={user.profile_picture_url} 
                              alt={user.display_name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            user.display_name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{user.display_name}</div>
                          <div className="text-xs text-muted-foreground">@{user.username}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Character count and submit */}
              <div className="flex items-center justify-between">
                <span className={`text-xs ${
                  newComment.length > MAX_COMMENT_LENGTH * 0.9 
                    ? 'text-destructive' 
                    : 'text-muted-foreground'
                }`}>
                  {newComment.length}/{MAX_COMMENT_LENGTH}
                </span>

                <Button 
                  onClick={submitComment}
                  disabled={submitting || !newComment.trim() || newComment.length > MAX_COMMENT_LENGTH}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Pubblicazione...' : 'Pubblica'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>
                <Link to="/login" className="text-primary hover:underline">
                  Accedi
                </Link>
                {' '}per partecipare alla discussione
              </p>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto overflow-x-hidden">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id}>
                  {/* Parent comment */}
                  {renderComment(comment)}
                  
                  {/* Replies */}
                  {comment.replies?.map(reply => 
                    renderComment(reply, true, comment.profiles?.username)
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nessun commento ancora</p>
                <p className="text-sm">Sii il primo a commentare!</p>
              </div>
            )}
          </div>
        </CardContent>
      )}

      {/* Report modal */}
      {reportingComment && (
        <CommentReportModal
          commentId={reportingComment}
          onClose={() => setReportingComment(null)}
        />
      )}
    </Card>
  );
};