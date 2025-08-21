import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Mail, Activity, Heart, MessageCircle, FileText, Users, UserPlus, UserMinus, ExternalLink, Instagram, Twitter, Globe } from "lucide-react";
import { format } from '@/utils/dateUtilsV3';
import { it } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
// Remove framer-motion for now to avoid dependency issues

interface PublicPost {
  id: string;
  title: string;
  excerpt: string | null;
  banner_url: string | null;
  created_at: string;
  published_at: string;
}

interface PublicProfileData {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  location: string | null;
  birth_date: string | null;
  profile_picture_url: string | null;
  banner_url: string | null;
  privacy_settings: Record<string, any> | null;
  created_at: string;
  role: string;
  preferred_sports: string[];
  social_links?: Record<string, string>;
}

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && true);
  });
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<PublicPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [stats, setStats] = useState<{ posts_count: number; likes_received: number; comments_received: number } | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const { user } = useAuth();

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // SEO per pagina profilo
  useEffect(() => {
    if (!profile) return;
    const displayName = profile.display_name || profile.username;
    document.title = `${displayName} | I Malati dello Sport`;
    
    const description = profile.bio 
      ? `${displayName}: ${profile.bio.slice(0, 140)}...`
      : `Profilo di ${displayName} su I Malati dello Sport. Scopri i suoi articoli, follower e attività.`;
    
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (meta) meta.content = description;
  }, [profile]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
        const cleanUsername = username.replace('@', '');
        
        const { data: profileList, error: directError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', cleanUsername);

        if (directError || !profileList || profileList.length === 0) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const profileData = profileList[0];
        
        // Transform the data to match our interface
        const transformedProfile: PublicProfileData = {
          id: profileData.id,
          user_id: profileData.user_id,
          username: profileData.username,
          display_name: profileData.display_name,
          bio: profileData.bio,
          location: profileData.location,
          birth_date: profileData.birth_date,
          profile_picture_url: profileData.profile_picture_url,
          banner_url: profileData.banner_url,
          privacy_settings: profileData.privacy_settings as Record<string, any> || {},
          created_at: profileData.created_at,
          role: profileData.role,
          preferred_sports: profileData.preferred_sports || [],
          social_links: {}
        };
        
        setProfile(transformedProfile);

        // Carica post se l'utente lo permette
        const privacySettings = transformedProfile.privacy_settings || {};
        const showPosts = (privacySettings as any).posts !== false;

        if (showPosts) {
          const { data: postsList } = await supabase
            .from('posts')
            .select('id, title, excerpt, banner_url, created_at, published_at')
            .eq('author_id', profileData.user_id)
            .not('published_at', 'is', null)
            .order('published_at', { ascending: false })
            .limit(6);
          
          setUserPosts(postsList || []);
        }

        // Carica statistiche
        const { data: statsData } = await supabase.rpc('get_author_stats', { 
          author_uuid: profileData.user_id 
        });
        if (Array.isArray(statsData) && statsData[0]) {
          setStats({
            posts_count: Number(statsData[0].posts_count) || 0,
            likes_received: Number(statsData[0].likes_received) || 0,
            comments_received: Number(statsData[0].comments_received) || 0,
          });
        }

        // Carica follower/following (using count without selecting specific columns)
        const [{ count: followers }, { count: following }] = await Promise.all([
          supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileData.user_id),
          supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileData.user_id),
        ]);
        setFollowerCount(followers || 0);
        setFollowingCount(following || 0);

        // Controlla se l'utente corrente segue questo profilo
        if (user?.id) {
          const { data: followRelation } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', user.id)
            .eq('following_id', profileData.user_id)
            .maybeSingle();
          setIsFollowing(!!followRelation);
        }

      } catch (error) {
        console.error('Error fetching profile:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, user]);

  const handleToggleFollow = async () => {
    if (!user || !profile) {
      toast({ 
        title: 'Accedi per seguire', 
        description: 'Devi effettuare il login per seguire gli autori.' 
      });
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.user_id);
        
        if (error) throw error;
        
        setIsFollowing(false);
        setFollowerCount(c => Math.max(0, c - 1));
        toast({ 
          title: 'Non segui più', 
          description: `Hai smesso di seguire @${profile.username}` 
        });
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: profile.user_id });
        
        if (error) throw error;
        
        setIsFollowing(true);
        setFollowerCount(c => c + 1);
        toast({ 
          title: 'Ora segui', 
          description: `Stai seguendo @${profile.username}` 
        });
      }
    } catch (error) {
      console.error(error);
      toast({ 
        title: 'Errore', 
        description: 'Impossibile aggiornare il follow', 
        variant: 'destructive' 
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const getPrivacySetting = (key: string) => {
    const privacyData = profile?.privacy_settings;
    if (!privacyData || typeof privacyData !== 'object') return true;
    return privacyData[key] !== false;
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      administrator: 'Amministratore',
      editor: 'Editore', 
      journalist: 'Giornalista',
      registered_user: 'Utente'
    };
    return roleLabels[role as keyof typeof roleLabels] || 'Utente';
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      administrator: 'bg-red-500',
      editor: 'bg-blue-500',
      journalist: 'bg-green-500',
      registered_user: 'bg-gray-500'
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Caricamento profilo...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">404</h1>
            <h2 className="text-2xl font-semibold text-muted-foreground">Profilo non trovato</h2>
            <p className="text-muted-foreground">L'utente che stai cercando non esiste.</p>
            <Button asChild>
              <Link to="/">Torna alla Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section con Banner Ottimizzato */}
          <div className="relative h-32 md:h-40 rounded-xl overflow-hidden mb-6 shadow-lg animate-fade-in">
            {profile.banner_url ? (
              <img 
                src={profile.banner_url} 
                alt={`Banner di ${profile.display_name || profile.username}`}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = '/assets/images/default-banner.jpg';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/20 to-accent/30" />
            )}
            
            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Sezione Profilo Principale */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Avatar e Info Base */}
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-xl mx-auto md:mx-0">
                <AvatarImage src={profile.profile_picture_url || undefined} />
                <AvatarFallback className="text-2xl md:text-3xl font-bold">
                  {(profile.display_name || profile.username)?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Informazioni Utente */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                        {profile.display_name || profile.username}
                      </h1>
                      <Badge variant="secondary" className="text-sm">
                        @{profile.username}
                      </Badge>
                      <Badge className={`text-white ${getRoleColor(profile.role)}`}>
                        {getRoleLabel(profile.role)}
                      </Badge>
                    </div>
                    
                    {profile.bio && (
                      <p className="text-muted-foreground max-w-2xl leading-relaxed text-sm md:text-base">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                {user?.id !== profile.user_id && (
                  <Button 
                    onClick={handleToggleFollow} 
                    disabled={followLoading}
                    variant={isFollowing ? 'outline' : 'default'}
                    className="flex-shrink-0"
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Non seguire
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Segui
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Statistiche Utente */}
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary mr-1" />
                        <span className="font-bold text-lg text-foreground">{stats?.posts_count ?? 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Articoli</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary mr-1" />
                        <span className="font-bold text-lg text-foreground">{followerCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Follower</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary mr-1" />
                        <span className="font-bold text-lg text-foreground">{followingCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Seguiti</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center">
                        <Heart className="h-4 w-4 text-primary mr-1" />
                        <span className="font-bold text-lg text-foreground">{stats?.likes_received ?? 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Like ricevuti</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-primary mr-1" />
                        <span className="font-bold text-lg text-foreground">{stats?.comments_received ?? 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Commenti</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informazioni Dettagliate */}
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 space-y-4">
                  {/* Informazioni personali */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {getPrivacySetting('location') && profile.location && (
                      <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-foreground">{profile.location}</span>
                      </div>
                    )}
                    
                    {getPrivacySetting('birth_date') && profile.birth_date && (
                      <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-foreground">Nato il {format(new Date(profile.birth_date), 'dd MMMM yyyy')}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="text-foreground">Membro dal {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
                    </div>
                  </div>

                  {/* Sport preferiti */}
                  {profile.preferred_sports && profile.preferred_sports.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm text-foreground">Sport preferiti</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.preferred_sports.map((sport) => (
                          <Badge key={sport} variant="outline" className="text-xs">
                            {sport.charAt(0).toUpperCase() + sport.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Link social */}
                  {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm text-foreground">Social Links</h3>
                      <div className="flex gap-3">
                        {Object.entries(profile.social_links).map(([platform, url]) => {
                          if (!url) return null;
                          const Icon = platform === 'instagram' ? Instagram : 
                                      platform === 'twitter' ? Twitter : Globe;
                          return (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors bg-muted/50 px-3 py-1 rounded-full"
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-sm capitalize">{platform}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Sezione Contenuti */}
          {getPrivacySetting('posts') && userPosts.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Articoli Recenti
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPosts.map((post, index) => (
                  <div key={post.id}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                      {post.banner_url && (
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={post.banner_url} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = '/assets/images/default-banner.jpg';
                            }}
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{format(new Date(post.published_at), 'dd MMM yyyy')}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-xs p-1 h-auto"
                          >
                            <Link to={`/post/${post.id}`}>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ) : !getPrivacySetting('posts') ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Contenuti privati</h3>
              <p className="text-muted-foreground">
                Questo utente ha scelto di non mostrare i suoi contenuti pubblicamente.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nessun articolo</h3>
              <p className="text-muted-foreground">
                Questo utente non ha ancora pubblicato articoli.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}