import React from 'react';
import { AdvancedEditor } from '@/components/editor/AdvancedEditor';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useEditorCheck } from '@/hooks/use-role-check';

function NewPostPageContent() {
  const { profile } = useEditorCheck();

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={false} toggleTheme={() => {}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Create New Post</h1>
          <p className="text-muted-foreground mt-2">
            Write and publish your next article
            {profile && ` | ${profile.display_name || profile.username}`}
          </p>
        </div>
        <AdvancedEditor />
      </div>
    </div>
  );
}

const NewPostPage = () => {
  return (
    <ProtectedRoute allowedRoles={['administrator', 'editor']}>
      <NewPostPageContent />
    </ProtectedRoute>
  );
};

export default NewPostPage;