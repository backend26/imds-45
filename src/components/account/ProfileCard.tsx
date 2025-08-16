import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { User, Calendar, Upload, Image as ImageIcon } from "lucide-react";
import { AvatarUploader } from "./AvatarUploader";
import { BannerUploader } from "./BannerUploader";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileCardProps {
  onError: (error: any) => void;
}

export const ProfileCard = ({ onError }: ProfileCardProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarUploader, setShowAvatarUploader] = useState(false);
  const [showBannerUploader, setShowBannerUploader] = useState(false);

  const fetchProfile = async (retryCount = 0) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        // Handle 406/409 errors with retry logic
        if ((error.code === 'PGRST116' || error.message?.includes('406') || error.message?.includes('409')) && retryCount < 3) {
          console.log(`Retrying profile fetch (attempt ${retryCount + 1})`);
          setTimeout(() => {
            fetchProfile(retryCount + 1);
          }, Math.pow(2, retryCount) * 1000); // Exponential backoff: 1s, 2s, 4s
          return;
        }
        
        console.error('Error fetching profile:', error);
        onError(error);
        return;
      }
      
      // Se non esiste un profilo, crealo utilizzando la funzione edge
      if (!data) {
        try {
          const { error: signupError } = await supabase.functions.invoke('handle-signup', {
            body: {
              userId: user.id,
              username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
              displayName: user.email?.split('@')[0] || `User ${user.id.slice(0, 8)}`
            }
          });
          
          if (signupError) {
            console.error('Error creating profile via function:', signupError);
          }
          
          // Retry fetching after creation attempt
          const { data: newData, error: newError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (newError) {
            console.error('Error fetching profile after creation:', newError);
            onError(newError);
            return;
          }
          
          setProfile(newData);
        } catch (createError) {
          console.error('Error in profile creation flow:', createError);
          onError(createError);
          return;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      onError(error);
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
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const userInitials = profile?.username?.substring(0, 2).toUpperCase() || 
                      user.email?.substring(0, 2).toUpperCase() || 'US';

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden">
      {/* Banner Section */}
      <div className="relative h-32 bg-gradient-primary">
        {profile?.banner_url ? (
          <img 
            src={profile.banner_url} 
            alt="Profile banner" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-primary" />
        )}
        
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-2 right-2 h-8 w-8 p-0"
          onClick={() => setShowBannerUploader(true)}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      <CardHeader className="text-center pb-4 relative">
        {/* Avatar posizionato sopra il banner */}
        <div className="relative mx-auto -mt-12">
          <Avatar className="w-24 h-24 mx-auto ring-4 ring-background">
            <AvatarImage 
              src={profile?.profile_picture_url} 
              alt="Profile picture" 
            />
            <AvatarFallback className="text-lg font-bold bg-gradient-primary text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <Button
            size="sm"
            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
            onClick={() => setShowAvatarUploader(true)}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Role Badge */}
        {profile?.role === 'administrator' && (
          <Badge variant="default" className="mx-auto w-fit mt-2">
            Amministratore
          </Badge>
        )}
        {profile?.role === 'editor' && (
          <Badge variant="secondary" className="mx-auto w-fit mt-2">
            Editor
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">
            {profile?.username || 'Utente'}
          </h2>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          {profile?.bio && (
            <p className="text-sm text-muted-foreground mt-2 italic">
              "{profile.bio}"
            </p>
          )}
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

          {profile?.location && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Posizione:</span>
              <span className="font-medium">{profile.location}</span>
            </div>
          )}
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Post</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Mi piace</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Commenti</p>
          </div>
        </div>
      </CardContent>

      {/* Uploaders */}
      {showAvatarUploader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <AvatarUploader
              currentImageUrl={profile?.profile_picture_url || undefined}
              onImageUpdate={(url) => {
                if (profile) {
                  setProfile({ ...profile, profile_picture_url: url });
                }
                setShowAvatarUploader(false);
                fetchProfile();
              }}
              disabled={false}
            />
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setShowAvatarUploader(false)}
            >
              Chiudi
            </Button>
          </div>
        </div>
      )}

      {showBannerUploader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <BannerUploader
              currentImageUrl={profile?.banner_url || undefined}
              onImageUpdate={(url) => {
                if (profile) {
                  setProfile({ ...profile, banner_url: url });
                }
                setShowBannerUploader(false);
                fetchProfile();
              }}
              disabled={false}
            />
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setShowBannerUploader(false)}
            >
              Chiudi
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};