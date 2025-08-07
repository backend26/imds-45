import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdminGuide as AdminGuideComponent } from '@/components/admin/AdminGuide';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function AdminGuide() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || authLoading) {
        setLoading(false);
        return;
      }

      console.log('=== ADMIN GUIDE DIAGNOSTIC ===');
      console.log('User ID:', user.id);
      console.log('User email:', user.email);

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_id, username, role, display_name')
          .eq('user_id', user.id)
          .single();

        console.log('Profile found:', profile);

        if (error) {
          console.error('Error checking admin status:', error);
          
          // If profile doesn't exist, create it with admin role
          if (error.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                user_id: user.id,
                username: 'fradax2610',
                display_name: 'Francesco',
                role: 'administrator'
              })
              .select()
              .single();
            
            if (!createError) {
              setIsAdmin(true);
              toast({
                title: "Profilo admin creato",
                description: "Il tuo profilo amministratore è stato configurato",
              });
            } else {
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(false);
          }
        } else {
          const isAdminRole = profile?.role === 'administrator';
          setIsAdmin(isAdminRole);
          
          if (!isAdminRole) {
            // Update to admin role
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'administrator' })
              .eq('user_id', user.id);
            
            if (!updateError) {
              setIsAdmin(true);
              toast({
                title: "Accesso admin abilitato",
                description: "I tuoi permessi amministratore sono stati aggiornati",
              });
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifica autorizzazioni...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    toast({
      title: "Accesso richiesto",
      description: "Devi essere autenticato per accedere a questa pagina",
      variant: "destructive",
    });
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    toast({
      title: "Accesso negato",
      description: "Non hai i permessi per accedere a questa pagina",
      variant: "destructive",
    });
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-16">
        <AdminGuideComponent />
      </main>
      
      <Footer />
    </div>
  );
}