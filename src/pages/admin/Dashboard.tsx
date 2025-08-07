import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Flag, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  MessageCircle,
  Heart,
  Bookmark
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

// Mock data
const mockUsers = [
  {
    id: '1',
    username: 'MarcoSport',
    email: 'marco@example.com',
    role: 'editor',
    created_at: '2024-01-15T10:00:00Z',
    last_login: '2024-01-20T15:30:00Z',
    login_count: 45,
    posts_count: 12,
    status: 'active'
  },
  {
    id: '2',
    username: 'TifosaInter',
    email: 'inter@example.com',
    role: 'registered_user',
    created_at: '2024-01-10T08:00:00Z',
    last_login: '2024-01-20T12:00:00Z',
    login_count: 23,
    posts_count: 0,
    status: 'active'
  }
];

const mockPosts = [
  {
    id: '1',
    title: 'Juventus conquista la Champions League',
    author: 'MarcoSport',
    status: 'published',
    created_at: '2024-01-19T14:00:00Z',
    views: 1250,
    likes: 89,
    comments: 34,
    category: 'Calcio'
  },
  {
    id: '2',
    title: 'Derby della Madonnina: Inter vs Milan',
    author: 'SportEditor',
    status: 'draft',
    created_at: '2024-01-18T16:00:00Z',
    views: 0,
    likes: 0,
    comments: 0,
    category: 'Calcio'
  }
];

const mockReports = [
  {
    id: '1',
    post_title: 'Juventus conquista la Champions League',
    reporter: 'UserABC',
    reason: 'inaccuracy',
    description: 'Informazioni non verificate',
    status: 'pending',
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    post_title: 'Sinner vince gli US Open',
    reporter: 'TennisLover',
    reason: 'typo',
    description: 'Errori grammaticali nel testo',
    status: 'reviewed',
    created_at: '2024-01-19T15:00:00Z'
  }
];

const mockStats = {
  totalUsers: 1234,
  totalPosts: 456,
  totalComments: 2341,
  totalLikes: 8901,
  monthlyGrowth: {
    users: 12.5,
    posts: 8.3,
    engagement: 15.2
  },
  topCategories: [
    { name: 'Calcio', count: 180 },
    { name: 'Tennis', count: 95 },
    { name: 'Formula 1', count: 78 },
    { name: 'Basket', count: 65 },
    { name: 'NFL', count: 38 }
  ]
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || authLoading) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(profile?.role === 'administrator');
        }
      } catch (error) {
        console.error('Error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading && !loading && (!user || !isAdmin)) {
      if (!user) {
        toast({
          title: "Accesso richiesto",
          description: "Devi essere autenticato per accedere a questa pagina",
          variant: "destructive",
        });
        navigate('/login');
      } else if (!isAdmin) {
        toast({
          title: "Accesso negato",
          description: "Non hai i permessi per accedere a questa pagina",
          variant: "destructive",
        });
        navigate('/');
      }
    }
  }, [user, authLoading, loading, isAdmin, navigate]);

  const handleUserAction = (userId: string, action: string) => {
    console.log(`User ${userId} - ${action}`);
    // Implement user actions (ban, promote, etc.)
  };

  const handlePostAction = (postId: string, action: string) => {
    console.log(`Post ${postId} - ${action}`);
    // Implement post actions (publish, unpublish, delete)
  };

  const handleReportAction = (reportId: string, action: string) => {
    console.log(`Report ${reportId} - ${action}`);
    // Implement report actions (approve, dismiss)
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header darkMode={false} toggleTheme={() => {}} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-4">Verifica autorizzazioni...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={false} toggleTheme={() => {}} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard Amministratore</h1>
          <p className="text-muted-foreground mt-2">Gestisci utenti, contenuti e monitora le statistiche</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="users">Utenti</TabsTrigger>
            <TabsTrigger value="posts">Contenuti</TabsTrigger>
            <TabsTrigger value="reports">Segnalazioni</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{mockStats.monthlyGrowth.users}%
                    </span>
                    rispetto al mese scorso
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Articoli Totali</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalPosts}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{mockStats.monthlyGrowth.posts}%
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
                  <div className="text-2xl font-bold">{mockStats.totalComments}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{mockStats.monthlyGrowth.engagement}%
                    </span>
                    engagement
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mi Piace</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalLikes}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{mockStats.monthlyGrowth.engagement}%
                    </span>
                    interazioni
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categorie più Popolari</CardTitle>
                <CardDescription>Distribuzione degli articoli per categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStats.topCategories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(category.count / mockStats.topCategories[0].count) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {category.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Utenti</CardTitle>
                <CardDescription>Visualizza e gestisci tutti gli utenti registrati</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca utenti..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Ruolo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i ruoli</SelectItem>
                      <SelectItem value="administrator">Amministratore</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="registered_user">Utente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {mockUsers.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge variant={
                                user.role === 'administrator' ? 'default' :
                                user.role === 'editor' ? 'secondary' : 'outline'
                              }>
                                {user.role === 'administrator' ? 'Admin' :
                                 user.role === 'editor' ? 'Editor' : 'Utente'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {user.posts_count} articoli
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {user.login_count} accessi
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Dettagli
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Dettagli Utente</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Nome utente</label>
                                  <p className="text-sm text-muted-foreground">{user.username}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Ultimo accesso</label>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(user.last_login), {
                                      addSuffix: true,
                                      locale: it
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Registrato</label>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(user.created_at), {
                                      addSuffix: true,
                                      locale: it
                                    })}
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Select onValueChange={(value) => handleUserAction(user.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Azioni" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="promote">Promuovi</SelectItem>
                              <SelectItem value="demote">Declassa</SelectItem>
                              <SelectItem value="suspend">Sospendi</SelectItem>
                              <SelectItem value="delete">Elimina</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Contenuti</CardTitle>
                <CardDescription>Modera e gestisci tutti gli articoli pubblicati</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{post.title}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-muted-foreground">
                              di {post.author}
                            </span>
                            <Badge variant={
                              post.status === 'published' ? 'default' :
                              post.status === 'draft' ? 'secondary' : 'outline'
                            }>
                              {post.status === 'published' ? 'Pubblicato' :
                               post.status === 'draft' ? 'Bozza' : post.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {post.category}
                            </span>
                            {post.status === 'published' && (
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {post.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {post.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {post.comments}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: it
                            })}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3 mr-1" />
                            Modifica
                          </Button>
                          
                          <Select onValueChange={(value) => handlePostAction(post.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Azioni" />
                            </SelectTrigger>
                            <SelectContent>
                              {post.status === 'draft' ? (
                                <SelectItem value="publish">Pubblica</SelectItem>
                              ) : (
                                <SelectItem value="unpublish">Nascondi</SelectItem>
                              )}
                              <SelectItem value="feature">In evidenza</SelectItem>
                              <SelectItem value="archive">Archivia</SelectItem>
                              <SelectItem value="delete">Elimina</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Segnalazioni</CardTitle>
                <CardDescription>Gestisci le segnalazioni inviate dagli utenti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Flag className="h-4 w-4 text-red-500" />
                            <h3 className="font-medium">{report.post_title}</h3>
                            <Badge variant={
                              report.status === 'pending' ? 'destructive' :
                              report.status === 'reviewed' ? 'default' : 'secondary'
                            }>
                              {report.status === 'pending' ? 'In attesa' :
                               report.status === 'reviewed' ? 'Esaminata' : 'Risolta'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm">
                              <strong>Segnalato da:</strong> {report.reporter}
                            </p>
                            <p className="text-sm">
                              <strong>Motivo:</strong> {
                                report.reason === 'abuse' ? 'Abuso' :
                                report.reason === 'typo' ? 'Errore grammaticale' :
                                report.reason === 'inaccuracy' ? 'Informazioni inesatte' :
                                report.reason === 'spam' ? 'Spam' : 'Contenuto inappropriato'
                              }
                            </p>
                            {report.description && (
                              <p className="text-sm">
                                <strong>Descrizione:</strong> {report.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(report.created_at), {
                                addSuffix: true,
                                locale: it
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {report.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReportAction(report.id, 'approve')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approva
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReportAction(report.id, 'dismiss')}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Ignora
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {mockReports.length === 0 && (
                  <div className="text-center py-8">
                    <Flag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">Nessuna segnalazione in attesa</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}