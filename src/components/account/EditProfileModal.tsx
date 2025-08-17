import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface EditProfileModalProps {
  profile: Profile | null;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export const EditProfileModal = ({ profile, onClose, onProfileUpdated }: EditProfileModalProps) => {
  const { user } = useAuth();
  const [username, setUsername] = useState(profile?.username || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: username.trim() || null,
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state aggiornate con successo",
      });

      onProfileUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare il profilo. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="edit-profile-description">
        <DialogHeader>
          <DialogTitle>Modifica Profilo</DialogTitle>
          <p id="edit-profile-description" className="text-sm text-muted-foreground">
            Aggiorna le informazioni del tuo profilo pubblico
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nome utente</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 30) {
                  setUsername(value);
                }
              }}
              placeholder="Inserisci il tuo nome utente"
              className="w-full"
              maxLength={30}
            />
            <p className="text-sm text-muted-foreground">
              {username.length}/30 caratteri. Il nome utente verrà mostrato pubblicamente sui tuoi contenuti
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-name">Nome visualizzato</Label>
            <Input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Come comparirai pubblicamente"
              className="w-full"
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Raccontaci di te (max 300 caratteri)"
              className="w-full"
              maxLength={300}
            />
            <p className="text-sm text-muted-foreground">{bio.length}/300</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salva'}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};