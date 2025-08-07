import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Mail, Activity } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

interface PublicPost {
  id: string;
  title: string;
  excerpt: string | null;
  banner_url: string | null;
  created_at: string;
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
  is_banned: boolean | null;
  created_at: string;
  email?: string;
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
  const [isBanned, setIsBanned] = useState(false);
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
    
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // SEO for profile page
  useEffect(() => {
    if (!profile) return;
    document.title = `${profile.display_name || profile.username} | Profilo | I Malati dello Sport`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', `Profilo di ${profile.display_name || profile.username}: articoli, follower e attività.`);
  }, [profile]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
        // Direct query without complex type inference
        const profileQuery = supabase.from('profiles').select('*');
        const { data: profileList, error: directError } = await profileQuery.eq('username', username.replace('@', ''));

        if (directError || !profileList || profileList.length === 0) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const profileData = profileList[0];

        if (profileData.is_banned) {
          setIsBanned(true);
          setLoading(false);
          return;
        }

        // Map to our interface manually
        const mappedProfile: PublicProfileData = {
          id: profileData.id,
          user_id: profileData.user_id,
          username: profileData.username,
          display_name: profileData.display_name,
          bio: profileData.bio,
          location: profileData.location,
          birth_date: profileData.birth_date,
          profile_picture_url: profileData.profile_picture_url,
          banner_url: profileData.banner_url,
          privacy_settings: profileData.privacy_settings as Record<string, any>,
          is_banned: profileData.is_banned,
          created_at: profileData.created_at
        };

        setProfile(mappedProfile);

        // Check privacy settings for posts
        const privacySettings = mappedProfile.privacy_settings || {};
        const showPosts = typeof privacySettings === 'object' && privacySettings.posts !== false;

        if (showPosts) {
          // Use a simpler approach for posts
          const { data: postsList } = await supabase
            .from('posts')
            .select('id,title,excerpt,banner_url,created_at')
            .eq('author_id', mappedProfile.user_id)
            .not('published_at', 'is', null)
            .order('created_at', { ascending: false })
            .limit(6);
          
          if (postsList) {
            const mappedPosts: PublicPost[] = postsList.map((post: any) => ({
              id: post.id,
              title: post.title,
              excerpt: post.excerpt,
              banner_url: post.banner_url,
              created_at: post.created_at
            }));
            setUserPosts(mappedPosts);
          }
        }

      } catch (error) {
        console.error('Error fetching profile:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  // Fetch stats and follow info when profile is ready
  useEffect(() => {
    const loadExtra = async () => {
      if (!profile) return;
      try {
        // Author stats
        const { data: statsData } = await (supabase as any).rpc('get_author_stats', { author_uuid: profile.user_id });
        if (Array.isArray(statsData) && statsData[0]) {
          setStats({
            posts_count: Number(statsData[0].posts_count) || 0,
            likes_received: Number(statsData[0].likes_received) || 0,
            comments_received: Number(statsData[0].comments_received) || 0,
          });
        }
        // Followers / Following counts
        const [{ count: followers }, { count: following }] = await Promise.all([
          (supabase as any).from('follows').select('id', { count: 'exact', head: true }).eq('following_id', profile.user_id),
          (supabase as any).from('follows').select('id', { count: 'exact', head: true }).eq('follower_id', profile.user_id),
        ]);
        setFollowerCount(followers || 0);
        setFollowingCount(following || 0);
        // Following state for current user
        if (user?.id) {
          const { data: rel } = await (supabase as any)
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', profile.user_id)
            .maybeSingle();
          setIsFollowing(!!rel);
        }
      } catch (e) {
        console.error('Error loading profile extras', e);
      }
    };
    loadExtra();
  }, [profile, user]);

  const handleToggleFollow = async () => {
    if (!user || !profile) {
      toast({ title: 'Accedi per seguire', description: 'Devi effettuare il login per seguire gli autori.' });
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const res: any = await (supabase as any)
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.user_id);
        if (res.error) throw res.error;
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
        toast({ title: 'Non segui più', description: `Hai smesso di seguire @${profile.username}` });
      } else {
        const res2: any = await (supabase as any)
          .from('follows')
          .insert({ follower_id: user.id, following_id: profile.user_id });
        if (res2.error) throw res2.error;
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
        toast({ title: 'Ora segui', description: `Stai seguendo @${profile.username}` });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Errore', description: 'Impossibile aggiornare il follow', variant: 'destructive' });
    } finally {
      setFollowLoading(false);
    }
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

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">404</h1>
            <h2 className="text-2xl font-semibold text-muted-foreground">Profilo non trovato</h2>
            <p className="text-muted-foreground">L'utente che stai cercando non esiste.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isBanned) {
    return (
      <div className="min-h-screen bg-background">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-foreground">Account non attivo</h1>
            <p className="text-muted-foreground">Questo account non è più attivo.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) return <Navigate to="/404" replace />;

  const getPrivacySetting = (key: string) => {
    const privacyData = profile.privacy_settings;
    if (!privacyData || typeof privacyData !== 'object') return true;
    return privacyData[key] !== false;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Banner Section */}
          <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-6">
            {profile.banner_url ? (
              <img 
                src={profile.banner_url} 
                alt={`Banner di ${profile.display_name || profile.username}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/40" />
            )}
            
            {/* Avatar */}
            <div className="absolute -bottom-16 left-6">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={profile.profile_picture_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {(profile.display_name || profile.username)?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Profile Info */}
          <div className="ml-6 mt-16 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                {profile.display_name || profile.username}
              </h1>
              <Badge variant="secondary">@{profile.username}</Badge>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span><strong className="text-foreground">{stats?.posts_count ?? 0}</strong> post</span>
                <span><strong className="text-foreground">{followerCount}</strong> follower</span>
                <span><strong className="text-foreground">{followingCount}</strong> seguiti</span>
                <span><strong className="text-foreground">{stats?.likes_received ?? 0}</strong> like</span>
                <span><strong className="text-foreground">{stats?.comments_received ?? 0}</strong> commenti</span>
              </div>
              {user?.id !== profile.user_id && (
                <Button size="sm" onClick={handleToggleFollow} disabled={followLoading} variant={isFollowing ? 'secondary' : 'default'}>
                  {isFollowing ? 'Non seguire' : 'Segui'}
                </Button>
              )}
            </div>
            
            {profile.bio && (
              <p className="text-muted-foreground mb-4 max-w-2xl">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {getPrivacySetting('email') && profile.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
              )}
              
              {getPrivacySetting('location') && profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {getPrivacySetting('birth_date') && profile.birth_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Nato il {format(new Date(profile.birth_date), 'dd MMMM yyyy', { locale: it })}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span>Membro dal {format(new Date(profile.created_at), 'MMMM yyyy', { locale: it })}</span>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Content Section */}
          {getPrivacySetting('posts') && userPosts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Articoli Recenti</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {post.banner_url && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={post.banner_url} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="mt-3 text-xs text-muted-foreground">
                        {format(new Date(post.created_at), 'dd MMM yyyy', { locale: it })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!getPrivacySetting('posts') && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Questo utente ha scelto di non mostrare i suoi contenuti pubblicamente.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}