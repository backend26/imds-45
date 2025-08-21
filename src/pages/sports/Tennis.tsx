import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UltraModernNewsCard } from "@/components/posts/UltraModernNewsCard";
import { SportFilters } from "@/components/SportFilters";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { getTimeAgo } from "@/utils/dateUtils";

export default function Tennis() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [selectedSport, setSelectedSport] = useState("tennis");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    const fetchTennisPosts = async () => {
      try {
        setLoading(true);
        
        // First, get the category ID for Tennis
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', 'tennis')
          .single();

        if (!categoryData) {
          console.warn('Categoria Tennis non trovata');
          setPosts([]);
          return;
        }

        // Fetch posts for this category
        const { data: postsData } = await supabase
          .from('posts')
          .select(`
            id, title, excerpt, content, cover_images, featured_image_url, 
            published_at, created_at, author_id, category_id,
            categories:category_id (name),
            profiles:author_id (username, display_name)
          `)
          .eq('category_id', categoryData.id)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(20);

        setPosts(postsData || []);
      } catch (error) {
        console.error('Error fetching tennis posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTennisPosts();
  }, []);

  const mapPostToCard = (post: any) => {
    const date = post.published_at || post.created_at;
    const authorName = post.profiles?.display_name || post.profiles?.username || 'Redazione';
    
    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || '',
      imageUrl: post.cover_images,
      category: post.categories?.name || 'Tennis',
      publishedAt: new Date(date).toLocaleDateString('it-IT'),
      timeAgo: getTimeAgo(date),
      author: authorName,
      likes: Math.floor(Math.random() * 50) + 10,
      comments: Math.floor(Math.random() * 20) + 2,
      views: Math.floor(Math.random() * 1000) + 100,
      article: post,
    };
  };

  const featuredArticles = posts.slice(0, 3);
  const otherArticles = posts.slice(3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-lg px-4 py-2">
              🎾 Tennis
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Tutto sul Tennis
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Le ultime notizie dai tornei ATP e WTA, analisi dei match e aggiornamenti 
            sui tuoi giocatori preferiti.
          </p>
        </div>

        {/* Sport Filters */}
        <SportFilters 
          selectedSport={selectedSport}
          onSportChange={setSelectedSport}
        />

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Articoli in Evidenza</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredArticles.map((article) => (
                    <UltraModernNewsCard
                      key={article.id}
                      {...mapPostToCard(article)}
                      onClick={() => navigate(`/post/${article.id}`)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Other Articles */}
            {otherArticles.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-6">Altri Articoli</h2>
                <div className="space-y-4">
                  {otherArticles.map((article) => (
                    <UltraModernNewsCard
                      key={article.id}
                      {...mapPostToCard(article)}
                      onClick={() => navigate(`/post/${article.id}`)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* No articles message */}
            {posts.length === 0 && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-muted-foreground mb-4">
                  Nessun articolo disponibile
                </h2>
                <p className="text-muted-foreground">
                  Non ci sono ancora articoli di tennis disponibili. Torna presto per gli aggiornamenti!
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
