import { useState, useCallback, useMemo } from 'react';
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
  depth?: number;
}

interface CommentWithLikes extends Comment {
  replies: CommentWithLikes[];
}

export const useEnhancedComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithLikes[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Load comments with likes
  const loadComments = useCallback(async () => {
    setLoading(true);
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

      // Build nested comment tree with proper depth tracking
      const commentMap = new Map<string, CommentWithLikes>();
      const rootComments: CommentWithLikes[] = [];

      processedComments.forEach((comment: CommentWithLikes) => {
        comment.depth = 0; // Initialize depth
        commentMap.set(comment.id, comment);
      });

      processedComments.forEach((comment: CommentWithLikes) => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            comment.depth = (parent.depth || 0) + 1;
            // Limit depth to prevent infinite nesting (TikTok-style)
            if (comment.depth > 3) {
              comment.depth = 3;
            }
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

  // Optimistic comment addition
  const addComment = useCallback(async (content: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: content.trim()
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

      // Reload comments to get the updated structure
      loadComments();

      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Errore",
        description: "Impossibile pubblicare il commento",
        variant: "destructive"
      });
      return false;
    }
  }, [user, postId, loadComments]);

  // Optimistic reply addition
  const addReply = useCallback(async (parentId: string, content: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: content.trim(),
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

      // Reload comments to get the updated structure
      loadComments();

      return true;
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Errore",
        description: "Impossibile pubblicare la risposta",
        variant: "destructive"
      });
      return false;
    }
  }, [user, postId, loadComments]);

  // Toggle like
  const toggleLike = useCallback(async (commentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
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

      // Reload comments to update like counts
      loadComments();
      return true;
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il like",
        variant: "destructive"
      });
      return false;
    }
  }, [user, loadComments]);

  // Update comment
  const updateComment = useCallback(async (commentId: string, content: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ 
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('author_id', user.id);

      if (error) throw error;

      // Reload comments
      loadComments();
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
  }, [user, loadComments]);

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

      // Reload comments
      loadComments();
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
  }, [user, loadComments]);

  // Total comments count (including nested)
  const totalComments = useMemo(() => {
    const countReplies = (comments: CommentWithLikes[]): number => 
      comments.reduce((total, comment) => total + 1 + countReplies(comment.replies), 0);
    return countReplies(comments);
  }, [comments]);

  return {
    comments,
    loading,
    collapsed,
    setCollapsed,
    totalComments,
    loadComments,
    addComment,
    addReply,
    toggleLike,
    updateComment,
    deleteComment
  };
};