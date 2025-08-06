import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { User, Calendar, MapPin, Edit, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { AvatarEditor } from "./AvatarEditor";
import { EditProfileModal } from "./EditProfileModal";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

interface StatsProps {
  likes: number;
  comments: number;
  posts: number;
}

const StatsPanel = ({ likes, comments, posts }: StatsProps) => (
  <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-card/30 rounded-lg backdrop-blur-sm">
    <div className="text-center">
      <p className="text-2xl font-bold text-primary">{likes}</p>
      <p className="text-sm text-muted-foreground">Mi piace</p>
    </div>
    <div className="text-center">
      <p className="text-2xl font-bold text-primary">{comments}</p>
      <p className="text-sm text-muted-foreground">Commenti</p>
    </div>
    <div className="text-center">
      <p className="text-2xl font-bold text-primary">{posts}</p>
      <p className="text-sm text-muted-foreground">Articoli</p>
    </div>
  </div>
);

type Profile = Database['public']['Tables']['profiles']['Row'];

export const ProfileSection = () => {
  const { user } = useAuth();
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il profilo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-elegant">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const userInitials = profile?.username?.substring(0, 2).toUpperCase() || 
                      user.email?.substring(0, 2).toUpperCase() || 'US';

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-elegant">
      <CardHeader className="text-center pb-4">
        <div className="relative mx-auto">
          <Avatar className="w-24 h-24 mx-auto ring-4 ring-primary/20">
            <AvatarImage 
              src={user.user_metadata?.profile_picture_url} 
              alt="Profile picture" 
            />
            <AvatarFallback className="text-lg font-bold bg-gradient-primary text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <Button
            size="sm"
            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
            onClick={() => setShowAvatarEditor(true)}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        
        {user.user_metadata?.role === 'admin' && (
          <Badge variant="default" className="mx-auto w-fit mt-2">
            Amministratore
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">
            {profile?.username || 'Utente'}
          </h2>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>

        <div className="space-y-3 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Membro da:</span>
            <span className="font-medium">
              {new Date(profile?.created_at || user.created_at).toLocaleDateString('it-IT')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Ultimo accesso:</span>
            <span className="font-medium">
              {new Date(user.last_sign_in_at || user.created_at).toLocaleDateString('it-IT')}
            </span>
          </div>
        </div>

        <StatsPanel 
          likes={user.user_metadata?.stats?.likes || 0} 
          comments={user.user_metadata?.stats?.comments || 0} 
          posts={user.user_metadata?.stats?.posts || 0} 
        />

        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => setShowEditModal(true)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Modifica Profilo
        </Button>
      </CardContent>

      {showAvatarEditor && (
        <AvatarEditor 
          imageUrl={user.user_metadata?.profile_picture_url}
          onClose={() => setShowAvatarEditor(false)}
          onAvatarUpdated={fetchProfile}
        />
      )}

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onProfileUpdated={fetchProfile}
        />
      )}
    </Card>
  );
};