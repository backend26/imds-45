import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  Search,
  Filter,
  MoreHorizontal,
  Flag,
  User,
  FileText,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface Report {
  id: string;
  type: 'post' | 'comment' | 'user';
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'rejected';
  created_at: string;
  reporter_name: string;
  content_title?: string;
  content_author?: string;
}

interface PendingContent {
  id: string;
  type: 'post' | 'comment';
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const ContentModerationDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingContent, setPendingContent] = useState<PendingContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed'>('pending');

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    setLoading(true);
    try {
      // Load reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('post_reports')
        .select(`
          id,
          reason,
          description,
          status,
          created_at,
          reporter:profiles!post_reports_reporter_id_fkey(display_name),
          post:posts!post_reports_post_id_fkey(title, author:profiles!posts_author_id_fkey(display_name))
        `)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      const formattedReports: Report[] = (reportsData || []).map(report => ({
        id: report.id,
        type: 'post',
        reason: report.reason,
        description: report.description,
        status: report.status as 'pending' | 'reviewed' | 'resolved' | 'rejected',
        created_at: report.created_at,
        reporter_name: report.reporter?.display_name || 'Utente anonimo',
        content_title: report.post?.title || 'Post eliminato',
        content_author: report.post?.author?.display_name || 'Autore sconosciuto'
      }));

      setReports(formattedReports);

      // Load pending content (posts awaiting approval)
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          created_at,
          status,
          author:profiles!posts_author_id_fkey(display_name)
        `)
        .eq('status', 'draft')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const formattedPending: PendingContent[] = (postsData || []).map(post => ({
        id: post.id,
        type: 'post',
        title: post.title,
        content: post.content?.substring(0, 200) + '...' || '',
        author_name: post.author?.display_name || 'Autore sconosciuto',
        created_at: post.created_at,
        status: 'pending'
      }));

      setPendingContent(formattedPending);

    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati di moderazione",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      const newStatus = action === 'approve' ? 'resolved' : 'rejected';
      
      const { error } = await supabase
        .from('post_reports')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus }
            : report
        )
      );

      toast({
        title: "Segnalazione gestita",
        description: `Segnalazione ${action === 'approve' ? 'risolta' : 'rifiutata'} con successo`
      });
    } catch (error) {
      console.error('Error handling report:', error);
      toast({
        title: "Errore",
        description: "Impossibile gestire la segnalazione",
        variant: "destructive"
      });
    }
  };

  const handleContentAction = async (contentId: string, action: 'approve' | 'reject') => {
    try {
      const newStatus = action === 'approve' ? 'published' : 'rejected';
      const updates: any = { status: newStatus };
      
      if (action === 'approve') {
        updates.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', contentId);

      if (error) throw error;

      setPendingContent(prev => 
        prev.filter(content => content.id !== contentId)
      );

      toast({
        title: "Contenuto gestito",
        description: `Contenuto ${action === 'approve' ? 'approvato e pubblicato' : 'rifiutato'} con successo`
      });
    } catch (error) {
      console.error('Error handling content:', error);
      toast({
        title: "Errore",
        description: "Impossibile gestire il contenuto",
        variant: "destructive"
      });
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.content_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reporter_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredContent = pendingContent.filter(content => 
    content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">In attesa</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-600 border-green-300">Risolto</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300">Rifiutato</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'spam':
      case 'harassment':
      case 'hate_speech':
        return 'text-red-500';
      case 'misinformation':
      case 'inappropriate':
        return 'text-orange-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Dashboard Moderazione Contenuti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Segnalazioni Attive</span>
              </div>
              <p className="text-2xl font-bold">
                {reports.filter(r => r.status === 'pending').length}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Contenuti in Attesa</span>
              </div>
              <p className="text-2xl font-bold">
                {pendingContent.length}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Risolte Oggi</span>
              </div>
              <p className="text-2xl font-bold">
                {reports.filter(r => r.status === 'resolved').length}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Priorità Alta</span>
              </div>
              <p className="text-2xl font-bold">
                {reports.filter(r => ['spam', 'harassment', 'hate_speech'].includes(r.reason.toLowerCase())).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Cerca</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca per titolo, autore o reporter..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Stato</Label>
              <div className="flex gap-2">
                {['all', 'pending', 'reviewed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status as any)}
                  >
                    {status === 'all' ? 'Tutti' : status === 'pending' ? 'In attesa' : 'Revisionati'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Segnalazioni ({filteredReports.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Contenuti in Attesa ({filteredContent.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Segnalazioni da Moderare</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground">Caricamento segnalazioni...</p>
                    </div>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="text-center p-8">
                    <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nessuna segnalazione trovata</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Flag className={`h-4 w-4 ${getPriorityColor(report.reason)}`} />
                              <span className="font-medium">{report.content_title}</span>
                              {getStatusBadge(report.status)}
                            </div>
                            
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p><strong>Motivo:</strong> {report.reason}</p>
                              <p><strong>Segnalato da:</strong> {report.reporter_name}</p>
                              <p><strong>Autore contenuto:</strong> {report.content_author}</p>
                              {report.description && (
                                <p><strong>Descrizione:</strong> {report.description}</p>
                              )}
                              <p><strong>Data:</strong> {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: it })}</p>
                            </div>
                          </div>
                          
                          {report.status === 'pending' && (
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReportAction(report.id, 'approve')}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Risolvi
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReportAction(report.id, 'reject')}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rifiuta
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Contenuti in Attesa di Approvazione</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground">Caricamento contenuti...</p>
                    </div>
                  </div>
                ) : filteredContent.length === 0 ? (
                  <div className="text-center p-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nessun contenuto in attesa</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredContent.map((content) => (
                      <div key={content.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">{content.title}</span>
                              <Badge variant="outline" className="text-yellow-600 border-yellow-300">In attesa</Badge>
                            </div>
                            
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p><strong>Autore:</strong> {content.author_name}</p>
                              <p><strong>Anteprima:</strong> {content.content}</p>
                              <p><strong>Creato:</strong> {formatDistanceToNow(new Date(content.created_at), { addSuffix: true, locale: it })}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContentAction(content.id, 'approve')}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approva
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContentAction(content.id, 'reject')}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rifiuta
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};