import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useSessionMonitor = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      try {
        // Check if user is banned
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_banned')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking user status:', error);
          return;
        }

        if (profile?.is_banned) {
          await signOut();
          toast({
            title: "Accesso non consentito",
            description: "Contatta il supporto se credi sia un errore.",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        // Check session validity
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          await signOut();
          toast({
            title: "Sessione scaduta",
            description: "La tua sessione è scaduta. Effettua nuovamente l'accesso.",
            variant: "destructive",
          });
          navigate('/login');
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    // Check immediately
    checkSession();

    // Check every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    // Check when window regains focus
    const handleFocus = () => {
      checkSession();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, signOut, navigate]);
};