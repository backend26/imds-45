import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface FavoriteTeamsSaveHandlerProps {
  favoriteTeams: string[];
  triggerSave: boolean;
  onSaveComplete: () => void;
}

export const FavoriteTeamsSaveHandler: React.FC<FavoriteTeamsSaveHandlerProps> = ({
  favoriteTeams,
  triggerSave,
  onSaveComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (triggerSave && user) {
      saveFavoriteTeams();
    }
  }, [triggerSave, favoriteTeams, user]);

  const saveFavoriteTeams = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          favorite_teams: favoriteTeams,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Squadre del cuore salvate con successo",
      });

      onSaveComplete();
    } catch (error) {
      console.error('Error saving favorite teams:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le squadre del cuore",
        variant: "destructive"
      });
    }
  };

  return null; // This is a logic-only component
};