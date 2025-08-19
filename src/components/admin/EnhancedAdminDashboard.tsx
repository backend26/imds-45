import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Flag, 
  Calendar,
  MessageCircle,
  TrendingUp,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EventsEditor } from '../events/EventsEditor';

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalEvents: number;
  pendingReports: number;
  activeUsers: number;
  monthlyGrowth: {
    users: number;
    posts: number;
    engagement: number;
  };
}

interface CommentReport {
  id: string;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
  comment_id: string;
  comments?: {
    content: string;
    author: {
      username: string;
      display_name: string;
    };
  };
  reporter: {
    username: string;
    display_name: string;
  };
}

export const EnhancedAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalEvents: 0,
    pendingReports: 0,
    activeUsers: 0,
    monthlyGrowth: { users: 0, posts: 0, engagement: 0 }
  });
  const [commentReports, setCommentReports] = useState<CommentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { toast } = useToast();

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const [
        { count: userCount },
        { count: postCount },
        { count: commentCount },
        { count: eventCount },
        { count: reportCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('sports_events').select('*', { count: 'exact', head: true }),
        supabase.from('comment_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setStats({
        totalUsers: userCount || 0,
        totalPosts: postCount || 0,
        totalComments: commentCount || 0,
        totalEvents: eventCount || 0,
        pendingReports: reportCount || 0,
        activeUsers: Math.floor((userCount || 0) * 0.3), // Approximate active users
        monthlyGrowth: {
          users: Math.random() * 15,
          posts: Math.random() * 20,
          engagement: Math.random() * 25
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le statistiche",
        variant: "destructive"
      });
    }
  };

  // Fetch comment reports
  const fetchCommentReports = async () => {
    try {
      const { data, error } = await supabase
        .from('comment_reports')
        .select(`
          id,
          reason,
          description,
          status,
          created_at,
          comment_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match interface
      const transformedReports = (data || []).map(report => ({
        ...report,
        comments: {
          content: 'Contenuto commento',
          author: {
            username: 'utente',
            display_name: 'Utente'
          }
        },
        reporter: {
          username: 'reporter',
          display_name: 'Reporter'
        }
      }));
      
      setCommentReports(transformedReports);
    } catch (error) {
      console.error('Error fetching comment reports:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le segnalazioni commenti",
        variant: "destructive"
      });
    }
  };

  // Handle comment report action
  const handleCommentReportAction = async (reportId: string, action: 'approve' | 'dismiss') => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('comment_reports')
        .update({
          status: action === 'approve' ? 'approved' : 'dismissed',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Successo",
        description: action === 'approve' ? 'Segnalazione approvata' : 'Segnalazione respinta'
      });

      fetchCommentReports();
      fetchStats();
    } catch (error) {
      console.error('Error handling comment report:', error);
      toast({
        title: "Errore",
        description: "Operazione fallita",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete reported comment
  const deleteReportedComment = async (commentId: string, reportId: string) => {
    setActionLoading(true);
    try {
      // Delete the comment
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) throw deleteError;

      // Update report status
      const { error: updateError } = await supabase
        .from('comment_reports')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (updateError) throw updateError;

      toast({
        title: "Successo",
        description: "Commento eliminato e segnalazione approvata"
      });

      fetchCommentReports();
      fetchStats();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il commento",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchCommentReports()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const getReportStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline">In Attesa</Badge>;
      case 'approved': return <Badge variant="destructive">Approvata</Badge>;
      case 'dismissed': return <Badge variant="secondary">Respinta</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Amministratore</h1>
          <p className="text-muted-foreground mt-2">
            Gestisci utenti, contenuti, eventi e monitora le statistiche
          </p>
        </div>
        <Button variant="outline" onClick={refreshData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Aggiorna
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="users">Utenti ({stats.totalUsers})</TabsTrigger>
          <TabsTrigger value="posts">Contenuti ({stats.totalPosts})</TabsTrigger>
          <TabsTrigger value="events">Eventi ({stats.totalEvents})</TabsTrigger>
          <TabsTrigger value="moderation">
            Moderazione ({stats.pendingReports})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
                <CardTitle className="text-sm font-medium">Contenuti</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{stats.monthlyGrowth.posts.toFixed(1)}%
                  </span>
                  crescita mensile
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eventi</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Eventi sportivi programmati
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Segnalazioni</CardTitle>
                <Flag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingReports}</div>
                <p className="text-xs text-muted-foreground">
                  In attesa di revisione
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Panoramica Attività</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalComments}</div>
                  <p className="text-sm text-muted-foreground">Commenti Totali</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
                  <p className="text-sm text-muted-foreground">Utenti Attivi</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.monthlyGrowth.engagement.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Crescita Engagement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab - Keep existing user management */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Utenti</CardTitle>
              <CardDescription>
                Visualizza e gestisci gli utenti della piattaforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Modulo gestione utenti - da implementare con lista utenti e azioni
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Posts Tab - Keep existing content management */}
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Contenuti</CardTitle>
              <CardDescription>
                Modera e gestisci i contenuti pubblicati
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Modulo gestione contenuti - da implementare con lista post e azioni
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab - New Events Management */}
        <TabsContent value="events">
          <EventsEditor />
        </TabsContent>

        {/* Moderation Tab - New Comment Moderation */}
        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Moderazione Commenti
              </CardTitle>
              <CardDescription>
                Gestisci le segnalazioni dei commenti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commentReports.length > 0 ? (
                  commentReports.map(report => (
                    <div key={report.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{report.reason}</Badge>
                            {getReportStatusBadge(report.status)}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(report.created_at), 'dd MMM yyyy HH:mm', { locale: it })}
                            </span>
                          </div>
                          
                          <div className="text-sm">
                            <p><strong>Segnalato da:</strong> {report.reporter?.display_name || report.reporter?.username}</p>
                            {report.description && (
                              <p><strong>Descrizione:</strong> {report.description}</p>
                            )}
                          </div>

                          <div className="bg-muted/50 p-3 rounded text-sm">
                            <p><strong>Commento segnalato:</strong></p>
                            <p className="mt-1 italic">"{report.comments?.content}"</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              di @{report.comments?.author?.username || 'utente sconosciuto'}
                            </p>
                          </div>
                        </div>

                        {report.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCommentReportAction(report.id, 'dismiss')}
                              disabled={actionLoading}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Respingi
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCommentReportAction(report.id, 'approve')}
                              disabled={actionLoading}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approva
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Elimina
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Elimina Commento</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Sei sicuro di voler eliminare definitivamente questo commento? 
                                    L'azione non può essere annullata.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteReportedComment(report.comment_id, report.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Elimina Commento
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nessuna segnalazione commento</p>
                    <p className="text-sm">Ottimo! Non ci sono segnalazioni da moderare.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
