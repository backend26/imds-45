import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Ban,
  Check,
  X
} from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  username: string;
  email: string;
  role: 'registered_user' | 'editor' | 'administrator';
  created_at: string;
  last_login: string;
  login_count: number;
  status: 'active' | 'suspended' | 'banned';
}

interface Post {
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  views: number;
  likes: number;
  comments: number;
}

interface Report {
  id: string;
  post_title: string;
  reporter: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  description: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    pendingReports: 0,
    monthlyGrowth: 0
  });
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is admin
    if (!user || user.user_metadata?.role !== 'administrator') {
      toast({
        title: "Accesso negato",
        description: "Non hai i permessi per accedere a questa sezione",
        variant: "destructive",
      });
      return;
    }

    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    // Mock data since we don't have the database connected
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'MarcoRossi',
        email: 'marco.rossi@email.com',
        role: 'editor',
        created_at: '2024-01-15',
        last_login: '2024-01-20',
        login_count: 25,
        status: 'active'
      },
      {
        id: '2',
        username: 'AnnaBianchi',
        email: 'anna.bianchi@email.com',
        role: 'registered_user',
        created_at: '2024-01-10',
        last_login: '2024-01-19',
        login_count: 42,
        status: 'active'
      }
    ];

    const mockPosts: Post[] = [
      {
        id: '1',
        title: 'Juventus conquista la Champions League',
        author: 'MarcoRossi',
        category: 'Calcio',
        status: 'published',
        created_at: '2024-01-18',
        views: 1520,
        likes: 89,
        comments: 23
      },
      {
        id: '2',
        title: 'Sinner trionfa agli US Open',
        author: 'AnnaBianchi',
        category: 'Tennis',
        status: 'published',
        created_at: '2024-01-17',
        views: 980,
        likes: 156,
        comments: 34
      }
    ];

    const mockReports: Report[] = [
      {
        id: '1',
        post_title: 'Analisi tattica Inter-Milan',
        reporter: 'LucaVerdi',
        reason: 'inaccuracy',
        status: 'pending',
        created_at: '2024-01-19',
        description: 'Informazioni non corrette sul modulo tattico'
      }
    ];

    setUsers(mockUsers);
    setPosts(mockPosts);
    setReports(mockReports);
    setStats({
      totalUsers: mockUsers.length,
      totalPosts: mockPosts.length,
      pendingReports: mockReports.filter(r => r.status === 'pending').length,
      monthlyGrowth: 15.2
    });
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'ban' | 'activate') => {
    // Mock implementation
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, status: action === 'activate' ? 'active' : action === 'suspend' ? 'suspended' : 'banned' }
          : user
      )
    );
    
    toast({
      title: "Azione completata",
      description: `Utente ${action === 'activate' ? 'attivato' : action === 'suspend' ? 'sospeso' : 'bannato'} con successo`,
    });
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'dismiss') => {
    setReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, status: action === 'approve' ? 'resolved' : 'dismissed' }
          : report
      )
    );
    
    toast({
      title: "Segnalazione gestita",
      description: `Segnalazione ${action === 'approve' ? 'approvata' : 'respinta'} con successo`,
    });
  };

  if (!user || user.user_metadata?.role !== 'administrator') {
    return <div>Accesso negato</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header darkMode={darkMode} toggleTheme={() => setDarkMode(!darkMode)} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Amministratore</h1>
          <p className="text-muted-foreground">Gestisci utenti, contenuti e segnalazioni</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.monthlyGrowth}% dal mese scorso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articoli Pubblicati</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                +12.5% dal mese scorso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Segnalazioni Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReports}</div>
              <p className="text-xs text-muted-foreground">
                Richiedono revisione
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crescita Mensile</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.monthlyGrowth}%</div>
              <p className="text-xs text-muted-foreground">
                Nuovi utenti registrati
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Utenti</TabsTrigger>
            <TabsTrigger value="posts">Contenuti</TabsTrigger>
            <TabsTrigger value="reports">Segnalazioni</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Utenti</CardTitle>
                <CardDescription>
                  Visualizza e gestisci tutti gli utenti registrati
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cerca utenti..." className="pl-10" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtri
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utente</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ruolo</TableHead>
                      <TableHead>Ultimo Accesso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'administrator' ? 'destructive' : user.role === 'editor' ? 'default' : 'secondary'}>
                            {user.role === 'administrator' ? 'Admin' : 
                             user.role === 'editor' ? 'Editor' : 'Utente'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.last_login).toLocaleDateString('it-IT')}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status === 'active' ? 'Attivo' : 
                             user.status === 'suspended' ? 'Sospeso' : 'Bannato'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizza
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifica
                              </DropdownMenuItem>
                              {user.status === 'active' ? (
                                <>
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, 'suspend')}>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Sospendi
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, 'ban')}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Banna
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'activate')}>
                                  <Check className="mr-2 h-4 w-4" />
                                  Riattiva
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Contenuti</CardTitle>
                <CardDescription>
                  Modera e gestisci tutti i contenuti pubblicati
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titolo</TableHead>
                      <TableHead>Autore</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Statistiche</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{post.author}</TableCell>
                        <TableCell>{post.category}</TableCell>
                        <TableCell>
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status === 'published' ? 'Pubblicato' : 
                             post.status === 'draft' ? 'Bozza' : 'Archiviato'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {post.views} views • {post.likes} likes • {post.comments} commenti
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizza
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifica
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Elimina
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Gestione Segnalazioni</CardTitle>
                <CardDescription>
                  Rivedi e gestisci le segnalazioni degli utenti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contenuto Segnalato</TableHead>
                      <TableHead>Segnalato da</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.post_title}</TableCell>
                        <TableCell>{report.reporter}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {report.reason === 'abuse' ? 'Abuso' :
                             report.reason === 'spam' ? 'Spam' :
                             report.reason === 'inaccuracy' ? 'Imprecisione' :
                             report.reason === 'inappropriate' ? 'Inappropriato' : 'Errore'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(report.created_at).toLocaleDateString('it-IT')}</TableCell>
                        <TableCell>
                          <Badge variant={report.status === 'pending' ? 'destructive' : 'default'}>
                            {report.status === 'pending' ? 'In attesa' :
                             report.status === 'resolved' ? 'Risolto' :
                             report.status === 'dismissed' ? 'Respinto' : 'Rivisto'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {report.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReportAction(report.id, 'approve')}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approva
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReportAction(report.id, 'dismiss')}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Respingi
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;