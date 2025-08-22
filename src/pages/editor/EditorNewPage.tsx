import React, { useEffect } from 'react';
import { AdvancedEditor } from '@/components/editor/AdvancedEditor';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EditorErrorBoundary } from '@/components/editor/EditorErrorBoundary';
import { useJournalistCheckCached } from '@/hooks/use-role-check-cached';


function NewPostPageContent() {
  const { profile, isLoading, hasAccess, error } = useJournalistCheckCached();
  const [darkMode, setDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    document.title = 'Nuovo Articolo | Editor - Malati dello Sport';
    const desc = 'Crea e pubblica un nuovo articolo con editor avanzato: titolo, categoria, copertina e contenuti.';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Editor Page Debug:', {
      isLoading,
      hasAccess,
      error,
      profile: profile ? { 
        username: profile.username, 
        role: profile.role,
        display_name: profile.display_name 
      } : null
    });
  }, [isLoading, hasAccess, error, profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Accesso Negato</h1>
            <p className="text-muted-foreground">{error || 'Non hai i permessi per accedere a questa pagina'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EditorErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Crea Nuovo Articolo</h1>
            <p className="text-muted-foreground mt-2">
              Scrivi e pubblica il tuo prossimo articolo
              {profile && ` | ${profile.display_name || profile.username}`}
            </p>
          </div>
          <AdvancedEditor />
        </div>
      </div>
    </EditorErrorBoundary>
  );
}

const NewPostPage = () => {
  return (
    <ProtectedRoute allowedRoles={['administrator', 'journalist']}>
      <NewPostPageContent />
    </ProtectedRoute>
  );
};

export default NewPostPage;