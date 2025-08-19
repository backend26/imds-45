import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Heart, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string; // Match actual database column
  post_id: string;
  profiles?: {
    username: string;
    role: string;
  };
}

interface SimplifiedCommentSystemProps {
  postId: string;
}

export const SimplifiedCommentSystem: React.FC<SimplifiedCommentSystemProps> = ({ postId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_author_id_fkey (username, role)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i commenti",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: user.id, // Match actual database column
          content: newComment.trim()
        })
        .select(`
          *,
          profiles!comments_author_id_fkey (username, role)
        `)
        .single();

      if (error) throw error;

      setComments(prev => [data, ...prev]);
      setNewComment('');
      toast({
        title: "Commento pubblicato",
        description: "Il tuo commento è stato aggiunto con successo"
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Errore",
        description: "Impossibile pubblicare il commento",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Commenti ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {user ? (
          <div className="space-y-3">
            <Textarea
              placeholder="Scrivi un commento..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Pubblicazione...' : 'Pubblica'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Effettua il login per commentare</p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Link 
                        to={`/@${comment.profiles?.username}`}
                        className="font-medium text-sm hover:text-primary transition-colors"
                      >
                        {comment.profiles?.username || 'Utente'}
                      </Link>
                      {comment.profiles?.role && (
                        <Badge variant="outline" className="text-xs">
                          {comment.profiles.role === 'administrator' ? 'Admin' :
                           comment.profiles.role === 'editor' ? 'Editor' : 
                           comment.profiles.role === 'journalist' ? 'Giornalista' : 'Utente'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { 
                      addSuffix: true, 
                      locale: it 
                    })}
                  </span>
                </div>
                
                <p className="text-sm leading-relaxed">{comment.content}</p>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    <Heart className="h-3 w-3 mr-1" />
                    0
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nessun commento ancora</p>
              <p className="text-sm">Sii il primo a commentare!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};