import React, { useEffect } from 'react';
import { AdvancedEditor } from '@/components/editor/AdvancedEditor';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useEditorCheck } from '@/hooks/use-role-check-cached';

function NewPostPageContent() {
  const { profile } = useEditorCheck();
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

  return (
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
  );
}

const NewPostPage = () => {
  return (
    <ProtectedRoute allowedRoles={['administrator', 'editor', 'journalist']}>
      <NewPostPageContent />
    </ProtectedRoute>
  );
};

export default NewPostPage;