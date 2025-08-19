import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, FileText, Eye, Edit, Trash2, CheckCircle, XCircle, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Post {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  published_at?: string;
  author_id: string;
  excerpt?: string;
  tags?: string[];
  categories?: {
    name: string;
  };
  profiles?: {
    username: string;
    display_name: string;
  };
}

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export const AdminContentManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [filterAuthor, setFilterAuthor] = useState('');
  
  const { toast } = useToast();

  const searchPosts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          status,
          created_at,
          published_at,
          author_id,
          excerpt,
          tags,
          categories:category_id (
            name
          ),
          profiles:author_id (
            username,
            display_name
          )
        `)
        .limit(50);

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      // Apply status filter
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      let filteredData = data || [];
      
      // Apply author filter (client-side since it's a join)
      if (filterAuthor.trim()) {
        filteredData = filteredData.filter(post => 
          post.profiles?.username?.toLowerCase().includes(filterAuthor.toLowerCase()) ||
          post.profiles?.display_name?.toLowerCase().includes(filterAuthor.toLowerCase())
        );
      }

      setPosts(filteredData);
    } catch (error) {
      console.error('Error searching posts:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile cercare i contenuti',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load posts initially
  useEffect(() => {
    searchPosts();
  }, [filterStatus]);

  const updatePostStatus = async (postId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === 'published' && !posts.find(p => p.id === postId)?.published_at) {
        updates.published_at = new Date().toISOString();
      } else if (newStatus === 'draft') {
        updates.published_at = null;
      }

      const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, status: newStatus, published_at: updates.published_at }
          : post
      ));

      if (selectedPost?.id === postId) {
        setSelectedPost({ 
          ...selectedPost, 
          status: newStatus, 
          published_at: updates.published_at 
        });
      }

      toast({
        title: 'Stato aggiornato',
        description: `Post ${newStatus === 'published' ? 'pubblicato' : newStatus === 'draft' ? 'rimosso dalla pubblicazione' : 'archiviato'}`,
      });
    } catch (error) {
      console.error('Error updating post status:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare lo stato del post',
        variant: 'destructive',
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      setDetailsOpen(false);

      toast({
        title: 'Post eliminato',
        description: 'Il post è stato eliminato definitivamente',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare il post',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetails = (post: Post) => {
    setSelectedPost(post);
    setDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className={statusColors.draft}>Bozza</Badge>;
      case 'published':
        return <Badge className={statusColors.published}>Pubblicato</Badge>;
      case 'archived':
        return <Badge className={statusColors.archived}>Archiviato</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Gestione Contenuti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search">Cerca contenuto</Label>
              <Input
                id="search"
                placeholder="Cerca per titolo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPosts()}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="author">Cerca autore</Label>
              <Input
                id="author"
                placeholder="Cerca per username o nome autore..."
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPosts()}
              />
            </div>
            <Button 
              onClick={searchPosts} 
              disabled={isLoading}
              className="mt-6"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="space-y-2">
              <Label>Stato</Label>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as typeof filterStatus)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="draft">Bozze</SelectItem>
                  <SelectItem value="published">Pubblicati</SelectItem>
                  <SelectItem value="archived">Archiviati</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium line-clamp-1">{post.title}</h3>
                    {getStatusBadge(post.status)}
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.profiles?.display_name || 'Autore sconosciuto'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.created_at), 'dd MMM yyyy', { locale: it })}
                      </span>
                      {post.published_at && (
                        <span className="text-green-600">
                          Pubblicato: {format(new Date(post.published_at), 'dd MMM yyyy', { locale: it })}
                        </span>
                      )}
                    </div>
                    {post.categories && (
                      <p>Categoria: {post.categories.name}</p>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{post.tags.length - 3} altri
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(post)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Select 
                    value={post.status} 
                    onValueChange={(value) => updatePostStatus(post.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Bozza</SelectItem>
                      <SelectItem value="published">Pubblicato</SelectItem>
                      <SelectItem value="archived">Archiviato</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminare post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Vuoi eliminare definitivamente il post "{post.title}"? 
                          Questa azione non può essere annullata.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deletePost(post.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Elimina
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterStatus !== 'all' || filterAuthor
                ? 'Nessun contenuto trovato con i filtri applicati'
                : 'Nessun contenuto trovato'
              }
            </div>
          )}
        </div>

        {/* Post Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dettagli Contenuto</DialogTitle>
            </DialogHeader>
            {selectedPost && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
                    {getStatusBadge(selectedPost.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Autore:</strong> {selectedPost.profiles?.display_name || 'Sconosciuto'}
                    </div>
                    <div>
                      <strong>Categoria:</strong> {selectedPost.categories?.name || 'Nessuna'}
                    </div>
                    <div>
                      <strong>Creato:</strong> {format(new Date(selectedPost.created_at), 'dd MMMM yyyy HH:mm', { locale: it })}
                    </div>
                    {selectedPost.published_at && (
                      <div>
                        <strong>Pubblicato:</strong> {format(new Date(selectedPost.published_at), 'dd MMMM yyyy HH:mm', { locale: it })}
                      </div>
                    )}
                  </div>

                  {selectedPost.excerpt && (
                    <div>
                      <h4 className="font-medium mb-2">Riassunto:</h4>
                      <p className="text-sm text-muted-foreground">{selectedPost.excerpt}</p>
                    </div>
                  )}

                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tag:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPost.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">#{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Contenuto:</h4>
                    <div 
                      className="prose max-w-none text-sm border rounded p-4 max-h-64 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                    />
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};