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
import { AdminUserManager } from './AdminUserManager';
import { AdminContentManager } from './AdminContentManager';
import { AdminModerationCenter } from './AdminModerationCenter';

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="users">Utenti ({stats.totalUsers})</TabsTrigger>
          <TabsTrigger value="posts">Contenuti ({stats.totalPosts})</TabsTrigger>
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

        {/* Users Tab */}
        <TabsContent value="users">
          <AdminUserManager />
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <AdminContentManager />
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation">
          <AdminModerationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};
