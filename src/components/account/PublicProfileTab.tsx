import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Eye } from 'lucide-react';
import { EnhancedProfileSection } from './EnhancedProfileSection';
import { PrivacySettingsForm } from './PrivacySettingsForm';
import { AvatarUploader } from './AvatarUploader';
import { IntelligentBanner } from './IntelligentBanner';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/use-auth';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface PublicProfileTabProps {
  onError: (error: Error) => void;
}

export const PublicProfileTab = ({ onError }: PublicProfileTabProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (profileData) {
          setProfile(profileData);
          setProfilePictureUrl(profileData.profile_picture_url);
          setBannerUrl(profileData.banner_url);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        onError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, onError]);

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (profileData) {
        setProfile(profileData);
        setProfilePictureUrl(profileData.profile_picture_url);
        setBannerUrl(profileData.banner_url);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Image Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Foto Profilo
          </h3>
          <AvatarUploader
            currentImageUrl={profilePictureUrl || undefined}
            onImageUpdate={(url) => {
              setProfilePictureUrl(url);
              refreshProfile();
            }}
            disabled={false}
          />
        </div>
        <div>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Banner Profilo
          </h3>
          <IntelligentBanner
            currentImageUrl={bannerUrl || undefined}
            profileImageUrl={profilePictureUrl || undefined}
            onImageUpdate={(url) => {
              setBannerUrl(url);
              refreshProfile();
            }}
            height={120}
            disabled={false}
          />
        </div>
      </div>

      {/* Enhanced Profile Management */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Informazioni Profilo
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy e Sicurezza
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <EnhancedProfileSection 
            profile={profile as any}
            onProfileUpdate={refreshProfile}
          />
        </TabsContent>
        
        <TabsContent value="privacy" className="mt-6">
          <PrivacySettingsForm onError={onError} />
        </TabsContent>
      </Tabs>
    </div>
  );
};