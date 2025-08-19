import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

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

export const useOptimizedComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load comments once on mount
  const loadComments = useCallback(async () => {
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

      // Load comment likes for each comment
      const commentIds = commentsData?.map(c => c.id) || [];
      const { data: likesData } = await supabase
        .from('comment_likes')
        .select('comment_id, user_id')
        .in('comment_id', commentIds);

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
  }, [postId, user]);

  // Load comments on mount and user change
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Optimistic comment addition
  const addComment = useCallback(async (content: string): Promise<boolean> => {
    if (!user) return false;

    // Optimistic update
    const tempComment: Comment = {
      id: 'temp-' + Date.now(),
      content,
      author_id: user.id,
      parent_comment_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: {
        username: 'current-user',
        display_name: 'Tu',
        profile_picture_url: undefined
      },
      likes_count: 0,
      user_has_liked: false,
      replies: []
    };

    setComments(prev => [tempComment, ...prev]);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: content,
          parent_comment_id: null
        })
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
        .single();

      if (error) throw error;

      // Replace temp comment with real one
      setComments(prev => prev.map(comment => 
        comment.id === tempComment.id 
          ? {
              ...data,
              author: data.profiles,
              likes_count: 0,
              user_has_liked: false,
              replies: []
            }
          : comment
      ));

      return true;
    } catch (error) {
      // Remove optimistic comment on error
      setComments(prev => prev.filter(comment => comment.id !== tempComment.id));
      console.error('Error adding comment:', error);
      toast({
        title: "Errore",
        description: "Impossibile pubblicare il commento",
        variant: "destructive"
      });
      return false;
    }
  }, [user, postId]);

  // Optimistic reply addition
  const addReply = useCallback(async (parentId: string, content: string): Promise<boolean> => {
    if (!user) return false;

    const tempReply: Comment = {
      id: 'temp-reply-' + Date.now(),
      content,
      author_id: user.id,
      parent_comment_id: parentId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: {
        username: 'current-user',
        display_name: 'Tu',
        profile_picture_url: undefined
      },
      likes_count: 0,
      user_has_liked: false,
      replies: []
    };

    // Add reply optimistically
    const addReplyToComment = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === parentId) {
          return { ...comment, replies: [...comment.replies, tempReply] };
        }
        if (comment.replies.length > 0) {
          return { ...comment, replies: addReplyToComment(comment.replies) };
        }
        return comment;
      });
    };

    setComments(prev => addReplyToComment(prev));

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: content,
          parent_comment_id: parentId
        })
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
        .single();

      if (error) throw error;

      // Replace temp reply with real one
      const replaceReplyInComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.replies.some(reply => reply.id === tempReply.id)) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === tempReply.id
                  ? {
                      ...data,
                      author: data.profiles,
                      likes_count: 0,
                      user_has_liked: false,
                      replies: []
                    }
                  : reply
              )
            };
          }
          if (comment.replies.length > 0) {
            return { ...comment, replies: replaceReplyInComment(comment.replies) };
          }
          return comment;
        });
      };

      setComments(prev => replaceReplyInComment(prev));
      return true;
    } catch (error) {
      // Remove optimistic reply on error
      const removeReplyFromComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.replies.some(reply => reply.id === tempReply.id)) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply.id !== tempReply.id)
            };
          }
          if (comment.replies.length > 0) {
            return { ...comment, replies: removeReplyFromComment(comment.replies) };
          }
          return comment;
        });
      };

      setComments(prev => removeReplyFromComment(prev));
      console.error('Error adding reply:', error);
      toast({
        title: "Errore",
        description: "Impossibile pubblicare la risposta",
        variant: "destructive"
      });
      return false;
    }
  }, [user, postId]);

  // Optimistic like toggle
  const toggleLike = useCallback(async (commentId: string): Promise<boolean> => {
    if (!user) return false;

    // Find comment and update optimistically
    const findAndUpdateComment = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes_count: comment.user_has_liked 
              ? comment.likes_count - 1 
              : comment.likes_count + 1,
            user_has_liked: !comment.user_has_liked
          };
        }
        if (comment.replies.length > 0) {
          return { ...comment, replies: findAndUpdateComment(comment.replies) };
        }
        return comment;
      });
    };

    const originalComments = comments;
    setComments(prev => findAndUpdateComment(prev));

    try {
      const currentComment = findCommentById(commentId, originalComments);
      if (!currentComment) return false;

      if (currentComment.user_has_liked) {
        // Remove like
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      // Revert optimistic update on error
      setComments(originalComments);
      console.error('Error toggling like:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il like",
        variant: "destructive"
      });
      return false;
    }
  }, [user, comments]);

  // Helper function to find comment by ID
  const findCommentById = (id: string, commentsList: Comment[]): Comment | null => {
    const findInArray = (comments: Comment[]): Comment | null => {
      for (const comment of comments) {
        if (comment.id === id) return comment;
        const found = findInArray(comment.replies);
        if (found) return found;
      }
      return null;
    };
    return findInArray(commentsList);
  };

  // Update comment
  const updateComment = useCallback(async (commentId: string, content: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', commentId)
        .eq('author_id', user.id);

      if (error) throw error;

      // Update local state
      const updateCommentInTree = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, content, updated_at: new Date().toISOString() };
          }
          if (comment.replies.length > 0) {
            return { ...comment, replies: updateCommentInTree(comment.replies) };
          }
          return comment;
        });
      };

      setComments(prev => updateCommentInTree(prev));
      return true;
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il commento",
        variant: "destructive"
      });
      return false;
    }
  }, [user]);

  // Delete comment
  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id);

      if (error) throw error;

      // Remove from local state
      const removeCommentFromTree = (comments: Comment[]): Comment[] => {
        return comments
          .filter(comment => comment.id !== commentId)
          .map(comment => ({
            ...comment,
            replies: removeCommentFromTree(comment.replies)
          }));
      };

      setComments(prev => removeCommentFromTree(prev));
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il commento",
        variant: "destructive"
      });
      return false;
    }
  }, [user]);

  return {
    comments,
    loading,
    addComment,
    addReply,
    toggleLike,
    updateComment,
    deleteComment
  };
};