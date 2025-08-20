import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Flag, MessageSquare, User, Search, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface PostReport {
  id: string;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
  post_id: string;
  reporter_id: string;
  posts?: {
    title: string;
    author_id: string;
    profiles?: {
      display_name: string;
      username: string;
    };
  };
  reporter?: {
    display_name: string;
    username: string;
  };
}

interface CommentReport {
  id: string;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
  comment_id: string;
  reporter_id: string;
  comments?: {
    content: string;
    author_id: string;
    profiles?: {
      display_name: string;
      username: string;
    };
  };
  reporter?: {
    display_name: string;
    username: string;
  };
}

interface UserReport {
  id: string;
  user_id: string;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
  reporter_id: string;
  reported_user?: {
    display_name: string;
    username: string;
    is_banned: boolean;
  };
  reporter?: {
    display_name: string;
    username: string;
  };
}

export const AdminModerationCenter: React.FC = () => {
  const [postReports, setPostReports] = useState<PostReport[]>([]);
  const [commentReports, setCommentReports] = useState<CommentReport[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');
  
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      // Load post reports
      let postQuery = supabase
        .from('post_reports')
        .select(`
          id,
          reason,
          description,
          status,
          created_at,
          post_id,
          reporter_id,
          posts:post_id (
            title,
            author_id,
            profiles:author_id (
              display_name,
              username
            )
          ),
          reporter:profiles!post_reports_reporter_id_fkey (
            display_name,
            username
          )
        `);

      if (statusFilter !== 'all') {
        postQuery = postQuery.eq('status', statusFilter);
      }

      const { data: postReportsData, error: postError } = await postQuery
        .order('created_at', { ascending: false });

      if (postError) throw postError;
      setPostReports(postReportsData || []);

      // Load comment reports - Fix Supabase relation query
      let commentQuery = (supabase as any)
        .from('comment_reports')
        .select(`
          id,
          reason,
          description,
          status,
          created_at,
          comment_id,
          reporter_id
        `);

      if (statusFilter !== 'all') {
        commentQuery = commentQuery.eq('status', statusFilter);
      }

      const { data: commentReportsData, error: commentError } = await commentQuery
        .order('created_at', { ascending: false });

      if (commentError) throw commentError;

      // Fetch related data separately to avoid relation issues
      const transformedCommentReports = await Promise.all(
        (commentReportsData || []).map(async (report) => {
          // Get comment details
          const { data: commentData } = await supabase
            .from('comments')
            .select(`
              content,
              author_id,
              profiles:author_id (
                display_name,
                username
              )
            `)
            .eq('id', report.comment_id)
            .maybeSingle();

          // Get reporter details
          const { data: reporterData } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', report.reporter_id)
            .maybeSingle();

          return {
            ...report,
            comments: commentData,
            reporter: reporterData
          };
        })
      );

      setCommentReports(transformedCommentReports);

      // Note: User reports table would need to be created if not exists
      // For now, we'll simulate it with an empty array
      setUserReports([]);

    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le segnalazioni',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostReportAction = async (reportId: string, action: 'approve' | 'dismiss') => {
    try {
      const { error } = await supabase
        .from('post_reports')
        .update({
          status: action === 'approve' ? 'resolved' : 'dismissed',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;

      setPostReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status: action === 'approve' ? 'resolved' : 'dismissed' }
            : report
        )
      );

      toast({
        title: 'Segnalazione gestita',
        description: `Segnalazione ${action === 'approve' ? 'risolta' : 'respinta'}`,
      });
    } catch (error) {
      console.error('Error handling post report:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile gestire la segnalazione',
        variant: 'destructive',
      });
    }
  };

  const handleCommentReportAction = async (reportId: string, action: 'approve' | 'dismiss') => {
    try {
      const { error } = await (supabase as any)
        .from('comment_reports')
        .update({
          status: action === 'approve' ? 'resolved' : 'dismissed',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;

      setCommentReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status: action === 'approve' ? 'resolved' : 'dismissed' }
            : report
        )
      );

      toast({
        title: 'Segnalazione gestita',
        description: `Segnalazione ${action === 'approve' ? 'risolta' : 'respinta'}`,
      });
    } catch (error) {
      console.error('Error handling comment report:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile gestire la segnalazione',
        variant: 'destructive',
      });
    }
  };

  const deleteReportedComment = async (commentId: string, reportId: string) => {
    try {
      // Delete comment
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) throw deleteError;

      // Update report status
      const { error: updateError } = await (supabase as any)
        .from('comment_reports')
        .update({
          status: 'resolved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (updateError) throw updateError;

      setCommentReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, status: 'resolved' }
            : report
        )
      );

      toast({
        title: 'Commento eliminato',
        description: 'Commento eliminato e segnalazione risolta',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare il commento',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">In Attesa</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-600 border-green-300">Risolta</Badge>;
      case 'dismissed':
        return <Badge variant="outline" className="text-red-600 border-red-300">Respinta</Badge>;
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

  const filteredPostReports = postReports.filter(report =>
    report.posts?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.reporter?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommentReports = commentReports.filter(report =>
    report.comments?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.reporter?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Centro Moderazione
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Cerca</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca per contenuto o reporter..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Stato</Label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="pending">In Attesa</SelectItem>
                <SelectItem value="resolved">Risolte</SelectItem>
                <SelectItem value="dismissed">Respinte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Post ({filteredPostReports.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Commenti ({filteredCommentReports.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profili ({userReports.length})
            </TabsTrigger>
          </TabsList>

          {/* Post Reports */}
          <TabsContent value="posts">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredPostReports.length > 0 ? (
                filteredPostReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Flag className={`h-4 w-4 ${getPriorityColor(report.reason)}`} />
                          <span className="font-medium">{report.posts?.title || 'Post eliminato'}</span>
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Motivo:</strong> {report.reason}</p>
                          <p><strong>Segnalato da:</strong> {report.reporter?.display_name || 'Utente sconosciuto'}</p>
                          <p><strong>Autore post:</strong> {report.posts?.profiles?.display_name || 'Autore sconosciuto'}</p>
                          {report.description && (
                            <p><strong>Descrizione:</strong> {report.description}</p>
                          )}
                          <p><strong>Data:</strong> {format(new Date(report.created_at), 'dd MMM yyyy HH:mm', { locale: it })}</p>
                        </div>
                      </div>
                      
                      {report.status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePostReportAction(report.id, 'dismiss')}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Respingi
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePostReportAction(report.id, 'approve')}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Risolvi
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nessuna segnalazione post trovata
                </div>
              )}
            </div>
          </TabsContent>

          {/* Comment Reports */}
          <TabsContent value="comments">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredCommentReports.length > 0 ? (
                filteredCommentReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className={`h-4 w-4 ${getPriorityColor(report.reason)}`} />
                          <span className="font-medium">Commento segnalato</span>
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Motivo:</strong> {report.reason}</p>
                          <p><strong>Segnalato da:</strong> {report.reporter?.display_name || 'Utente sconosciuto'}</p>
                          <p><strong>Autore commento:</strong> {report.comments?.profiles?.display_name || 'Autore sconosciuto'}</p>
                          {report.description && (
                            <p><strong>Descrizione:</strong> {report.description}</p>
                          )}
                          <p><strong>Data:</strong> {format(new Date(report.created_at), 'dd MMM yyyy HH:mm', { locale: it })}</p>
                        </div>

                        <div className="bg-muted/50 p-3 rounded text-sm mt-2">
                          <p><strong>Commento:</strong></p>
                          <p className="mt-1 italic">"{report.comments?.content || 'Commento eliminato'}"</p>
                        </div>
                      </div>
                      
                      {report.status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCommentReportAction(report.id, 'dismiss')}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Respingi
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCommentReportAction(report.id, 'approve')}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Risolvi
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Elimina
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminare commento?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Vuoi eliminare definitivamente questo commento? 
                                  Questa azione non può essere annullata.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteReportedComment(report.comment_id, report.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Elimina
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
                  Nessuna segnalazione commento trovata
                </div>
              )}
            </div>
          </TabsContent>

          {/* User Reports */}
          <TabsContent value="users">
            <div className="text-center py-8 text-muted-foreground">
              Segnalazioni profili utente - Funzionalità in sviluppo
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};