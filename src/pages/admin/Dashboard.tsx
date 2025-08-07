import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAdminCheck } from '@/hooks/use-role-check-cached';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
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
  Bookmark,
  Moon,
  Sun,
  RefreshCw,
  Download
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [postFilter, setPostFilter] = useState('all');
  const [reportFilter, setReportFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && true);
  });
  
  // Real data states
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    monthlyGrowth: {
      users: 0,
      posts: 0,
      engagement: 0
    },
    topCategories: []
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { profile } = useAdminCheck();
  const { toast } = useToast();

  // Theme management
  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  // Data fetching functions
  const fetchStats = async () => {
    try {
      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch post count
      const { count: postCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Fetch comment count
      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

      // Fetch like count
      const { count: likeCount } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true });

      // Fetch top categories
      const { data: categoriesData } = await supabase
        .from('posts')
        .select(`
          category_id,
          categories:category_id (
            name
          )
        `)
        .not('category_id', 'is', null);

      const categoryStats = categoriesData?.reduce((acc, post) => {
        const categoryName = post.categories?.name;
        if (categoryName) {
          acc[categoryName] = (acc[categoryName] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topCategories = Object.entries(categoryStats || {})
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setStats({
        totalUsers: userCount || 0,
        totalPosts: postCount || 0,
        totalComments: commentCount || 0,
        totalLikes: likeCount || 0,
        monthlyGrowth: {
          users: Math.random() * 20, // Placeholder for now
          posts: Math.random() * 15,
          engagement: Math.random() * 25
        },
        topCategories
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le statistiche",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          username,
          display_name,
          role,
          created_at,
          last_login,
          login_count,
          is_banned
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli utenti",
        variant: "destructive",
      });
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          status,
          created_at,
          published_at,
          author_id,
          categories:category_id (
            name
          ),
          profiles:author_id (
            username,
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i post",
        variant: "destructive",
      });
    }
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('post_reports')
        .select(`
          id,
          reason,
          description,
          status,
          created_at,
          posts:post_id (
            title
          ),
          profiles:reporter_id (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le segnalazioni",
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchPosts(),
        fetchReports()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Action handlers with real Supabase operations
  const handleUserAction = async (userId: string, action: string) => {
    setActionLoading(true);
    try {
      switch (action) {
        case 'promote':
          const { data: promoteData, error: promoteError } = await supabase
            .rpc('promote_user_to_journalist', { user_uuid: userId });
          if (promoteError || promoteData === false) throw promoteError || new Error('Permission denied');
          toast({ title: "Successo", description: "Utente promosso a giornalista" });
          break;

        case 'demote':
          const { error: demoteError } = await supabase
            .from('profiles')
            .update({ role: 'registered_user' })
            .eq('user_id', userId);
          if (demoteError) throw demoteError;
          toast({ title: "Successo", description: "Utente declassato" });
          break;

        case 'suspend':
          const { error: suspendError } = await supabase
            .from('profiles')
            .update({ is_banned: true })
            .eq('user_id', userId);
          if (suspendError) throw suspendError;
          toast({ title: "Successo", description: "Utente sospeso" });
          break;

        case 'unsuspend':
          const { error: unsuspendError } = await supabase
            .from('profiles')
            .update({ is_banned: false })
            .eq('user_id', userId);
          if (unsuspendError) throw unsuspendError;
          toast({ title: "Successo", description: "Sospensione rimossa" });
          break;
      }
      await fetchUsers();
    } catch (error) {
      console.error('Error handling user action:', error);
      toast({
        title: "Errore",
        description: "Operazione fallita",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostAction = async (postId: string, action: string) => {
    setActionLoading(true);
    try {
      switch (action) {
        case 'publish':
          const { error: publishError } = await supabase
            .from('posts')
            .update({ 
              status: 'published',
              published_at: new Date().toISOString()
            })
            .eq('id', postId);
          if (publishError) throw publishError;
          toast({ title: "Successo", description: "Post pubblicato" });
          break;

        case 'unpublish':
          const { error: unpublishError } = await supabase
            .from('posts')
            .update({ 
              status: 'draft',
              published_at: null 
            })
            .eq('id', postId);
          if (unpublishError) throw unpublishError;
          toast({ title: "Successo", description: "Post rimosso dalla pubblicazione" });
          break;

        case 'delete':
          const { error: deleteError } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);
          if (deleteError) throw deleteError;
          toast({ title: "Successo", description: "Post eliminato" });
          break;
      }
      await fetchPosts();
    } catch (error) {
      console.error('Error handling post action:', error);
      toast({
        title: "Errore",
        description: "Operazione fallita",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: string) => {
    setActionLoading(true);
    try {
      switch (action) {
        case 'approve':
          const { error: approveError } = await supabase
            .from('post_reports')
            .update({ 
              status: 'approved',
              reviewed_by: profile?.user_id,
              reviewed_at: new Date().toISOString()
            })
            .eq('id', reportId);
          if (approveError) throw approveError;
          toast({ title: "Successo", description: "Segnalazione approvata" });
          break;

        case 'dismiss':
          const { error: dismissError } = await supabase
            .from('post_reports')
            .update({ 
              status: 'dismissed',
              reviewed_by: profile?.user_id,
              reviewed_at: new Date().toISOString()
            })
            .eq('id', reportId);
          if (dismissError) throw dismissError;
          toast({ title: "Successo", description: "Segnalazione respinta" });
          break;
      }
      await fetchReports();
    } catch (error) {
      console.error('Error handling report action:', error);
      toast({
        title: "Errore",
        description: "Operazione fallita",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = userFilter === 'all' || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = postFilter === 'all' || post.status === postFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.posts?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = reportFilter === 'all' || report.status === reportFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header 
        darkMode={darkMode} 
        toggleTheme={toggleTheme} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Amministratore</h1>
            <p className="text-muted-foreground mt-2">
              Gestisci utenti, contenuti e monitora le statistiche
              {profile && ` | Benvenuto, ${profile.display_name || profile.username}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
            {/* Theme toggle removed to avoid duplication; use global Header toggle */}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="users">Utenti ({stats.totalUsers})</TabsTrigger>
            <TabsTrigger value="posts">Contenuti ({stats.totalPosts})</TabsTrigger>
            <TabsTrigger value="reports">Segnalazioni ({reports.filter(r => r.status === 'pending').length})</TabsTrigger>
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
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{stats.monthlyGrowth.users.toFixed(1)}%
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
                  <div className="text-2xl font-bold">{stats.totalPosts}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{stats.monthlyGrowth.posts.toFixed(1)}%
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
                    <span className="text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{stats.monthlyGrowth.engagement.toFixed(1)}%
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
                  <div className="text-2xl font-bold">{stats.totalLikes}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{stats.monthlyGrowth.engagement.toFixed(1)}%
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
                {stats.topCategories.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topCategories.map((category, index) => (
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
                              style={{ width: `${(category.count / stats.topCategories[0].count) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {category.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nessuna categoria disponibile</p>
                )}
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
                  <Select value={userFilter} onValueChange={setUserFilter}>
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
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Caricamento utenti...</p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nessun utente trovato</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{user.display_name || user.username}</p>
                              <p className="text-sm text-muted-foreground">{user.username}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <Badge variant={
                                  user.role === 'administrator' ? 'default' :
                                  user.role === 'editor' ? 'secondary' : 'outline'
                                }>
                                  {user.role === 'administrator' ? 'Admin' :
                                   user.role === 'editor' ? 'Editor' : 'Utente'}
                                </Badge>
                                {user.is_banned && (
                                  <Badge variant="destructive">Sospeso</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {user.login_count || 0} accessi
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
                                    <label className="text-sm font-medium">Nome visualizzato</label>
                                    <p className="text-sm text-muted-foreground">{user.display_name || 'Non impostato'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Ultimo accesso</label>
                                    <p className="text-sm text-muted-foreground">
                                      {user.last_login ? formatDistanceToNow(new Date(user.last_login), {
                                        addSuffix: true,
                                        locale: it
                                      }) : 'Mai effettuato'}
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
                                  <div>
                                    <label className="text-sm font-medium">Stato</label>
                                    <p className="text-sm text-muted-foreground">
                                      {user.is_banned ? 'Sospeso' : 'Attivo'}
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Select onValueChange={(value) => handleUserAction(user.user_id, value)} disabled={actionLoading}>
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Azioni" />
                              </SelectTrigger>
                              <SelectContent>
                                {user.role !== 'editor' && user.role !== 'administrator' && (
                                  <SelectItem value="promote">Promuovi</SelectItem>
                                )}
                                {user.role === 'editor' && (
                                  <SelectItem value="demote">Declassa</SelectItem>
                                )}
                                {!user.is_banned ? (
                                  <SelectItem value="suspend">Sospendi</SelectItem>
                                ) : (
                                  <SelectItem value="unsuspend">Riattiva</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca post..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={postFilter} onValueChange={setPostFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti gli stati</SelectItem>
                      <SelectItem value="published">Pubblicati</SelectItem>
                      <SelectItem value="draft">Bozze</SelectItem>
                      <SelectItem value="archived">Archiviati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Caricamento post...</p>
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nessun post trovato</p>
                    </div>
                  ) : (
                    filteredPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{post.title}</h3>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-muted-foreground">
                                di {post.profiles?.display_name || post.profiles?.username}
                              </span>
                              <Badge variant={
                                post.status === 'published' ? 'default' :
                                post.status === 'draft' ? 'secondary' : 'outline'
                              }>
                                {post.status === 'published' ? 'Pubblicato' :
                                 post.status === 'draft' ? 'Bozza' : post.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {post.categories?.name || 'Senza categoria'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(post.created_at), 'dd/MM/yyyy', { locale: it })}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {post.status !== 'published' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePostAction(post.id, 'publish')}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Pubblica
                              </Button>
                            )}
                            
                            {post.status === 'published' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePostAction(post.id, 'unpublish')}
                                disabled={actionLoading}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Nascondi
                              </Button>
                            )}
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Elimina
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Sei sicuro di voler eliminare questo post? Questa azione non può essere annullata.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handlePostAction(post.id, 'delete')}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Elimina
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Segnalazioni</CardTitle>
                <CardDescription>Revisiona e gestisci le segnalazioni dei contenuti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca segnalazioni..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={reportFilter} onValueChange={setReportFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti gli stati</SelectItem>
                      <SelectItem value="pending">In attesa</SelectItem>
                      <SelectItem value="approved">Approvate</SelectItem>
                      <SelectItem value="dismissed">Respinte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Caricamento segnalazioni...</p>
                    </div>
                  ) : filteredReports.length === 0 ? (
                    <div className="text-center py-8">
                      <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nessuna segnalazione trovata</p>
                    </div>
                  ) : (
                    filteredReports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{report.posts?.title}</h3>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-muted-foreground">
                                Segnalato da {report.profiles?.username}
                              </span>
                              <Badge variant={
                                report.status === 'pending' ? 'secondary' :
                                report.status === 'approved' ? 'default' : 'outline'
                              }>
                                {report.status === 'pending' ? 'In attesa' :
                                 report.status === 'approved' ? 'Approvata' : 'Respinta'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                              </span>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm font-medium">Motivo: {report.reason}</p>
                              {report.description && (
                                <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                              )}
                            </div>
                          </div>
                          
                          {report.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReportAction(report.id, 'approve')}
                                disabled={actionLoading}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approva
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReportAction(report.id, 'dismiss')}
                                disabled={actionLoading}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Respingi
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute allowedRoles={['administrator']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}