import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, Heart, MessageCircle, Trophy, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export const PublicProfileComplete = () => {
  const { userId } = useParams();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['public-profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      // Get posts count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId)
        .eq('status', 'published');

      // Get total likes received
      const { count: likesReceived } = await supabase
        .from('post_likes')
        .select('post_id', { count: 'exact', head: true })
        .in('post_id', 
          (await supabase
            .from('posts')
            .select('id')
            .eq('author_id', userId)
          ).data?.map(p => p.id) || []
        );

      // Get followers count
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      return {
        postsCount: postsCount || 0,
        likesReceived: likesReceived || 0,
        followersCount: followersCount || 0
      };
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-muted-foreground">Profilo non trovato</h1>
      </div>
    );
  }

  const socialLinks = profile.social_links || {};
  const favoriteTeams = profile.favorite_teams || {};
  const roleLabels = {
    administrator: 'Amministratore',
    journalist: 'Giornalista', 
    editor: 'Editore',
    registered_user: 'Utente'
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header Card */}
      <Card className="relative overflow-hidden">
        {/* Banner */}
        <div 
          className="h-32 bg-gradient-to-r from-primary/20 to-primary/5"
          style={{
            backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <CardContent className="relative -mt-16 pt-0">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage 
                  src={profile.profile_picture_url} 
                  alt={profile.display_name}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl">
                  {profile.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <Badge variant="secondary" className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                {roleLabels[profile.role]}
              </Badge>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>

              {profile.bio && (
                <p className="text-foreground">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                
                {profile.birth_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(profile.birth_date).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </span>
                )}
                
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Iscritto {formatDistanceToNow(new Date(profile.created_at), { 
                    addSuffix: true, 
                    locale: it 
                  })}
                </span>
              </div>

              {/* Stats */}
              {stats && (
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{stats.postsCount}</span>
                    <span className="text-muted-foreground">articoli</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="font-semibold">{stats.likesReceived}</span>
                    <span className="text-muted-foreground">like ricevuti</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{stats.followersCount}</span>
                    <span className="text-muted-foreground">follower</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Social Links */}
        {Object.keys(socialLinks).length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Link Social
              </h3>
              <div className="space-y-3">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="capitalize">{platform}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Favorite Teams */}
        {Object.keys(favoriteTeams).length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Squadre del Cuore
              </h3>
              <div className="space-y-3">
                {Object.entries(favoriteTeams).map(([sport, teams]) => (
                  <div key={sport}>
                    <p className="text-sm font-medium capitalize mb-2">{sport}</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(teams) ? teams.map((team: string, idx: number) => (
                        <Badge key={idx} variant="outline">{team}</Badge>
                      )) : (
                        <Badge variant="outline">{teams as string}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preferred Sports */}
        {profile.preferred_sports && profile.preferred_sports.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Sport Preferiti</h3>
              <div className="flex flex-wrap gap-2">
                {profile.preferred_sports.map((sport: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="capitalize">
                    {sport}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};