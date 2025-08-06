import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { AdvancedEditor } from '@/components/editor/AdvancedEditor';
import { Header } from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Post = Database['public']['Tables']['posts']['Row'];

const EditPostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [postLoading, setPostLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || (user.user_metadata?.role !== 'editor' && user.user_metadata?.role !== 'administrator'))) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId || !user) return;

      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (error) {
          console.error('Error fetching post:', error);
          toast({
            title: "Error",
            description: "Failed to load post for editing",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Check if user can edit this post (author or admin)
        if (data.author_id !== user.id && user.user_metadata?.role !== 'administrator') {
          toast({
            title: "Access Denied",
            description: "You don't have permission to edit this post",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: "Error",
          description: "Failed to load post for editing",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setPostLoading(false);
      }
    };

    if (user && !loading) {
      fetchPost();
    }
  }, [postId, user, loading, navigate, toast]);

  if (loading || postLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header darkMode={false} toggleTheme={() => {}} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || (user.user_metadata?.role !== 'editor' && user.user_metadata?.role !== 'administrator') || !post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={false} toggleTheme={() => {}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Edit Post</h1>
          <p className="text-muted-foreground mt-2">Update your article</p>
        </div>
        <AdvancedEditor initialPost={post} />
      </div>
    </div>
  );
};

export default EditPostPage;