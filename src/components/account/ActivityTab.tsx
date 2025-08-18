import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Heart, Bookmark, Edit, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Post = Database['public']['Tables']['posts']['Row'] & { status?: string };
type PostLike = Database['public']['Tables']['post_likes']['Row'];
type BookmarkedPost = Database['public']['Tables']['bookmarked_posts']['Row'];

interface ActivityTabProps {
  onError: (error: any) => void;
}

export const ActivityTab = ({ onError }: ActivityTabProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPosts = async () => {
    if (!user || !profile) return;
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id) // Fixed: using user.id instead of profile.id
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPosts(data || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      onError(error);
    }
  };

  const fetchLikedPosts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select(`
          post_id,
          posts (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const posts = data?.map(like => (like as any).posts).filter(Boolean) || [];
      setLikedPosts(posts);
    } catch (error) {
      console.error('Error fetching liked posts:', error);
      onError(error);
    }
  };

  const fetchBookmarkedPosts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookmarked_posts')
        .select(`
          post_id,
          posts (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const posts = data?.map(bookmark => (bookmark as any).posts).filter(Boolean) || [];
      setBookmarkedPosts(posts);
    } catch (error) {
      console.error('Error fetching bookmarked posts:', error);
      onError(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    };
    
    fetchData();
  }, [user]);

  useEffect(() => {
    if (profile) {
      fetchUserPosts();
      fetchLikedPosts();
      fetchBookmarkedPosts();
    }
  }, [profile]);

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {post.featured_image_url && (
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 mb-1">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(post.created_at).toLocaleDateString('it-IT')}
              <Badge variant={post.published_at ? 'default' : 'secondary'} className="text-xs">
                {post.published_at ? 'Pubblicato' : 'Bozza'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Le Tue Attività
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualizza e gestisci i tuoi contenuti e interazioni
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              I Miei Post ({userPosts.length})
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Post Piaciuti ({likedPosts.length})
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Preferiti ({bookmarkedPosts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {profile?.role === 'journalist' || profile?.role === 'administrator' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">I Tuoi Articoli</h3>
                  <Link to="/editor/new">
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      + Nuovo Post
                    </Badge>
                  </Link>
                </div>
                
                {userPosts.length > 0 ? (
                  <div className="grid gap-4">
                    {userPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Non hai ancora scritto nessun articolo.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Solo i giornalisti possono scrivere articoli.</p>
                <p className="text-sm">Contatta un amministratore per ottenere i permessi.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked" className="space-y-4">
            <h3 className="text-lg font-medium">Articoli che ti sono piaciuti</h3>
            
            {likedPosts.length > 0 ? (
              <div className="grid gap-4">
                {likedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Non hai ancora messo "mi piace" a nessun articolo.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarked" className="space-y-4">
            <h3 className="text-lg font-medium">Articoli salvati nei preferiti</h3>
            
            {bookmarkedPosts.length > 0 ? (
              <div className="grid gap-4">
                {bookmarkedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Non hai ancora salvato nessun articolo nei preferiti.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};