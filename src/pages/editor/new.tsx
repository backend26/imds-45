import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { AdvancedEditor } from '@/components/editor/AdvancedEditor';
import { Header } from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';

const NewPostPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || (user.user_metadata?.role !== 'editor' && user.user_metadata?.role !== 'administrator'))) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
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

  if (!user || (user.user_metadata?.role !== 'editor' && user.user_metadata?.role !== 'administrator')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={false} toggleTheme={() => {}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Create New Post</h1>
          <p className="text-muted-foreground mt-2">Write and publish your next article</p>
        </div>
        <AdvancedEditor />
      </div>
    </div>
  );
};

export default NewPostPage;