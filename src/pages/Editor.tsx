import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, 
  FileText, 
  Calendar, 
  BarChart3, 
  Users,
  Eye,
  MessageCircle,
  Heart,
  Edit,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { EventsEditor } from '@/components/events/EventsEditor';

interface Post {
  id: string;
  title: string;
  status: string;
  created_at: string;
  published_at?: string;
  categories?: {
    name: string;
  };
}

interface UserStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalComments: number;
  totalLikes: number;
}

export default function Editor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
    totalComments: 0,
    totalLikes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && true);
  });

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  useEffect(() => {
    if (user) {
      loadUserContent();
    }
  }, [user]);

  const loadUserContent = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load user's posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          status,
          created_at,
          published_at,
          categories:category_id (
            name
          )
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      // Calculate stats
      const totalPosts = postsData?.length || 0;
      const publishedPosts = postsData?.filter(p => p.status === 'published').length || 0;
      const draftPosts = postsData?.filter(p => p.status === 'draft').length || 0;

      // Get engagement stats (simplified for now)
      setStats({
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews: Math.floor(Math.random() * 1000), // Placeholder
        totalComments: Math.floor(Math.random() * 100), // Placeholder
        totalLikes: Math.floor(Math.random() * 500), // Placeholder
      });

    } catch (error) {
      console.error('Error loading user content:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i contenuti',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Bozza</Badge>;
      case 'published':
        return <Badge variant="outline" className="text-green-600 border-green-300">Pubblicato</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-gray-600 border-gray-300">Archiviato</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard Editor</h1>
          <p className="text-muted-foreground mt-2">
            Gestisci i tuoi contenuti, eventi e monitora le performance
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="articles">I Miei Articoli ({stats.totalPosts})</TabsTrigger>
            <TabsTrigger value="co-authoring">Co-Authoring</TabsTrigger>
            <TabsTrigger value="events">Eventi</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => navigate('/editor/new')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-2">
                    <PlusCircle className="h-8 w-8 text-primary" />
                    <span className="text-lg font-semibold">Nuovo Articolo</span>
                  </div>
                  <p className="text-center text-muted-foreground mt-2">
                    Scrivi un nuovo contenuto
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="h-8 w-8 text-primary" />
                    <span className="text-lg font-semibold">Gestisci Eventi</span>
                  </div>
                  <p className="text-center text-muted-foreground mt-2">
                    Crea e modifica eventi sportivi
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center space-x-2">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <span className="text-lg font-semibold">Statistiche</span>
                  </div>
                  <p className="text-center text-muted-foreground mt-2">
                    Visualizza le performance
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Articoli Totali</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPosts}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.publishedPosts} pubblicati, {stats.draftPosts} bozze
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visualizzazioni</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalViews}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12%
                    </span>
                    rispetto al mese scorso
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commenti</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalComments}</div>
                  <p className="text-xs text-muted-foreground">
                    Engagement degli utenti
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mi Piace</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLikes}</div>
                  <p className="text-xs text-muted-foreground">
                    Apprezzamenti ricevuti
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Articles */}
            <Card>
              <CardHeader>
                <CardTitle>Articoli Recenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{post.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{post.categories?.name || 'Nessuna categoria'}</span>
                          <span>{format(new Date(post.created_at), 'dd MMM yyyy', { locale: it })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(post.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/editor/${post.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {posts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Non hai ancora creato nessun articolo</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => navigate('/editor/new')}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Crea il tuo primo articolo
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>I Miei Articoli</CardTitle>
                <Button onClick={() => navigate('/editor/new')}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nuovo Articolo
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{post.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{post.categories?.name || 'Nessuna categoria'}</span>
                          <span>{format(new Date(post.created_at), 'dd MMM yyyy', { locale: it })}</span>
                          {post.published_at && (
                            <span className="text-green-600">
                              Pubblicato: {format(new Date(post.published_at), 'dd MMM yyyy', { locale: it })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(post.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/editor/${post.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {posts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Non hai ancora creato nessun articolo</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => navigate('/editor/new')}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Crea il tuo primo articolo
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Co-Authoring Tab */}
          <TabsContent value="co-authoring">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Articoli in Co-Authoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nessun articolo in collaborazione al momento</p>
                  <p className="text-sm mt-2">
                    Quando verrai invitato a collaborare su articoli, li vedrai qui
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <EventsEditor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}