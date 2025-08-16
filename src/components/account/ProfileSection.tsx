import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { User, Calendar, MapPin, Edit, Upload, Heart, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { AvatarEditor } from "./AvatarEditor";
import { EditProfileModal } from "./EditProfileModal";
import { IntelligentBanner } from "./IntelligentBanner";
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
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-elegant overflow-hidden">
      {/* Intelligent Banner Section */}
      <div className="relative">
        <IntelligentBanner
          currentImageUrl={profile?.banner_url || undefined}
          profileImageUrl={profile?.profile_picture_url || user.user_metadata?.profile_picture_url}
          onImageUpdate={(imageUrl) => {
            setProfile((prev) => prev ? ({ ...prev, banner_url: imageUrl } as any) : prev);
            fetchProfile();
          }}
          height={80}
          disabled={false}
        />
        
        {/* Avatar positioned over banner - adjusted for smaller banner */}
        <div className="absolute -bottom-8 left-6">
          <div className="relative">
            <Avatar className="w-16 h-16 ring-4 ring-background shadow-elegant">
              <AvatarImage 
                src={profile?.profile_picture_url || user.user_metadata?.profile_picture_url} 
                alt="Profile picture" 
              />
              <AvatarFallback className="text-sm font-bold bg-gradient-primary text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              className="absolute -bottom-1 -right-1 rounded-full w-6 h-6 p-0 shadow-lg"
              onClick={() => setShowAvatarEditor(true)}
            >
              <Upload className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Content with adjusted spacing for smaller banner */}
      <CardHeader className="pt-12 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              {profile?.display_name || profile?.username || 'Utente'}
            </h2>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            {profile?.bio && (
              <p className="text-sm text-muted-foreground mt-2 max-w-md line-clamp-3">
                {profile.bio}
              </p>
            )}
          </div>
          
          {user.user_metadata?.role === 'admin' && (
            <Badge variant="default" className="mt-1">
              Amministratore
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profile Details */}
          <div className="space-y-3">
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

            {profile?.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{profile.location}</span>
              </div>
            )}

            {(profile as any)?.favorite_team && (
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{(profile as any).favorite_team}</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            {(profile as any)?.social_links && Object.entries((profile as any).social_links).some(([_, url]) => url) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Link Social
                </h4>
                <div className="space-y-1">
                  {Object.entries((profile as any).social_links).map(([platform, url]) => 
                    url ? (
                      <a 
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-primary hover:underline capitalize"
                      >
                        {platform}
                      </a>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {profile?.preferred_sports && profile.preferred_sports.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Sport Seguiti</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.preferred_sports.slice(0, 4).map((sport) => (
                    <Badge key={sport} variant="secondary" className="text-xs">
                      {sport}
                    </Badge>
                  ))}
                  {profile.preferred_sports.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.preferred_sports.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
            )}
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