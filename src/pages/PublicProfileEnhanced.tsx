import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  MapPin, 
  Calendar, 
  Heart, 
  MessageCircle, 
  FileText,
  Award,
  TrendingUp,
  Share2,
  Trophy,
  Activity,
  Users,
  Target,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PublicProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  bio?: string;
  location?: string;
  birth_date?: string;
  profile_picture_url?: string;
  banner_url?: string;
  role: string;
  preferred_sports?: string[];
  created_at: string;
}

interface UserStats {
  postsCount: number;
  likesReceived: number;
  commentsReceived: number;
  commentsGiven: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'post' | 'comment' | 'like';
  title: string;
  date: string;
  engagement?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_date: string;
}

export default function PublicProfileEnhanced() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    postsCount: 0,
    likesReceived: 0,
    commentsReceived: 0,
    commentsGiven: 0,
    recentActivity: []
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           localStorage.getItem('theme') === 'dark';
  });

  const { toast } = useToast();

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Load profile data
  const loadProfile = async () => {
    if (!username) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.replace('@', ''))
        .eq('is_banned', false)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load user statistics
      const [
        { data: postsData },
        { data: likesData },
        { data: commentsReceivedData },
        { data: commentsGivenData }
      ] = await Promise.all([
        supabase
          .from('posts')
          .select('id, title, created_at, published_at')
          .eq('author_id', profileData.user_id)
          .not('published_at', 'is', null)
          .order('published_at', { ascending: false })
          .limit(10),
        
        supabase
          .from('post_likes')
          .select('id, created_at, posts!inner(author_id)')
          .eq('posts.author_id', profileData.user_id),
        
        supabase
          .from('comments')
          .select('id, created_at, posts!inner(author_id)')
          .eq('posts.author_id', profileData.user_id),
        
        supabase
          .from('comments')
          .select('id, content, created_at, post_id')
          .eq('author_id', profileData.user_id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Build recent activity timeline
      const recentActivity: ActivityItem[] = [];
      
      // Add recent posts
      postsData?.forEach(post => {
        if (post.published_at) {
          recentActivity.push({
            id: `post-${post.id}`,
            type: 'post',
            title: post.title,
            date: post.published_at,
            engagement: Math.floor(Math.random() * 50) // Placeholder engagement
          });
        }
      });

      // Add recent comments
      commentsGivenData?.forEach(comment => {
        recentActivity.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          title: `Commentato: "${comment.content.substring(0, 50)}..."`,
          date: comment.created_at
        });
      });

      // Sort by date
      recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setStats({
        postsCount: postsData?.length || 0,
        likesReceived: likesData?.length || 0,
        commentsReceived: commentsReceivedData?.length || 0,
        commentsGiven: commentsGivenData?.length || 0,
        recentActivity: recentActivity.slice(0, 10)
      });

      // Generate achievements based on stats
      const userAchievements: Achievement[] = [];
      
      if ((postsData?.length || 0) >= 10) {
        userAchievements.push({
          id: 'prolific-writer',
          title: 'Scrittore Prolifico',
          description: 'Ha pubblicato più di 10 articoli',
          icon: '✍️',
          earned_date: new Date().toISOString()
        });
      }

      if ((likesData?.length || 0) >= 50) {
        userAchievements.push({
          id: 'popular-author',
          title: 'Autore Popolare',
          description: 'Ha ricevuto più di 50 like sui suoi contenuti',
          icon: '❤️',
          earned_date: new Date().toISOString()
        });
      }

      if ((commentsGivenData?.length || 0) >= 25) {
        userAchievements.push({
          id: 'active-commenter',
          title: 'Commentatore Attivo',
          description: 'Ha scritto più di 25 commenti',
          icon: '💬',
          earned_date: new Date().toISOString()
        });
      }

      // Community member achievement for all users
      userAchievements.push({
        id: 'community-member',
        title: 'Membro della Community',
        description: 'Benvenuto nella comunità di Malati dello Sport!',
        icon: '🏆',
        earned_date: profileData.created_at
      });

      setAchievements(userAchievements);

    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il profilo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Share profile
  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profilo di ${profile?.display_name} - Malati dello Sport`,
          text: `Scopri il profilo di ${profile?.display_name} su Malati dello Sport`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiato",
        description: "Il link del profilo è stato copiato negli appunti"
      });
    }
  };

  useEffect(() => {
    loadProfile();
  }, [username]);

  useEffect(() => {
    if (profile) {
      document.title = `${profile.display_name} (@${profile.username}) - Malati dello Sport`;
    }
  }, [profile]);

  const getRoleBadge = (role: string) => {
    const roleMap = {
      'administrator': { label: 'Admin', variant: 'destructive' as const },
      'journalist': { label: 'Giornalista', variant: 'default' as const },
      'editor': { label: 'Editor', variant: 'secondary' as const },
      'registered_user': { label: 'Utente', variant: 'outline' as const }
    };
    
    const roleInfo = roleMap[role as keyof typeof roleMap] || roleMap.registered_user;
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Profilo non trovato</h1>
          <p className="text-muted-foreground mb-6">
            Il profilo utente che stai cercando non esiste o è stato rimosso.
          </p>
          <Button asChild>
            <Link to="/">Torna alla Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <div className="relative">
            {/* Banner */}
            {profile.banner_url && (
              <div 
                className="h-48 rounded-t-lg bg-cover bg-center"
                style={{ backgroundImage: `url(${profile.banner_url})` }}
              />
            )}
            
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="relative -mt-16 md:-mt-8">
                  <Avatar className="w-32 h-32 border-4 border-background">
                    <AvatarImage src={profile.profile_picture_url} />
                    <AvatarFallback className="text-2xl">
                      {profile.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                      <p className="text-muted-foreground">@{profile.username}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getRoleBadge(profile.role)}
                        {profile.preferred_sports && profile.preferred_sports.length > 0 && (
                          <div className="flex gap-1">
                            {profile.preferred_sports.slice(0, 3).map(sport => (
                              <Badge key={sport} variant="outline" className="text-xs">
                                {sport}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button onClick={shareProfile} variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Condividi
                    </Button>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-muted-foreground max-w-2xl">{profile.bio}</p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Iscritto {format(new Date(profile.created_at), 'MMMM yyyy', { locale: it })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="text-center p-4">
              <div className="text-2xl font-bold text-primary">{stats.postsCount}</div>
              <p className="text-sm text-muted-foreground">Articoli</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-4">
              <div className="text-2xl font-bold text-red-500">{stats.likesReceived}</div>
              <p className="text-sm text-muted-foreground">Like Ricevuti</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-4">
              <div className="text-2xl font-bold text-blue-500">{stats.commentsReceived}</div>
              <p className="text-sm text-muted-foreground">Commenti Ricevuti</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center p-4">
              <div className="text-2xl font-bold text-green-500">{stats.commentsGiven}</div>
              <p className="text-sm text-muted-foreground">Commenti Scritti</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity">Attività Recente</TabsTrigger>
            <TabsTrigger value="achievements">Riconoscimenti</TabsTrigger>
            <TabsTrigger value="contributions">Contributi</TabsTrigger>
          </TabsList>

          {/* Activity Timeline */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Timeline Attività
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {activity.type === 'post' && <FileText className="h-4 w-4 text-primary" />}
                          {activity.type === 'comment' && <MessageCircle className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'like' && <Heart className="h-4 w-4 text-red-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(activity.date), 'dd MMM yyyy HH:mm', { locale: it })}
                            </span>
                            {activity.engagement && (
                              <Badge variant="outline" className="text-xs">
                                {activity.engagement} interazioni
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nessuna attività recente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Riconoscimenti e Badge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ottenuto il {format(new Date(achievement.earned_date), 'dd MMM yyyy', { locale: it })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Community Contributions */}
          <TabsContent value="contributions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Contributi alla Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 border rounded-lg">
                    <Target className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <div className="text-2xl font-bold">{stats.postsCount}</div>
                    <p className="text-sm text-muted-foreground">Articoli Pubblicati</p>
                  </div>
                  
                  <div className="text-center p-6 border rounded-lg">
                    <MessageCircle className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                    <div className="text-2xl font-bold">{stats.commentsGiven}</div>
                    <p className="text-sm text-muted-foreground">Discussioni Partecipate</p>
                  </div>
                  
                  <div className="text-center p-6 border rounded-lg">
                    <Star className="h-8 w-8 mx-auto mb-3 text-yellow-500" />
                    <div className="text-2xl font-bold">
                      {Math.floor((stats.likesReceived + stats.commentsReceived) / 10)}
                    </div>
                    <p className="text-sm text-muted-foreground">Punteggio Reputazione</p>
                  </div>
                </div>

                <Separator className="my-6" />
                
                <div className="text-center">
                  <h4 className="font-medium mb-2">Impatto sulla Community</h4>
                  <p className="text-muted-foreground text-sm">
                    I contenuti di {profile.display_name} hanno ricevuto un totale di{' '}
                    {stats.likesReceived + stats.commentsReceived} interazioni, contribuendo 
                    alla discussione sportiva della community.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}