import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArticleCard } from '@/components/ArticleCard';
import { SearchSystem } from '@/components/search/SearchSystem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, SortAsc, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { SmartImage } from '@/components/ui/smart-image';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string;
  cover_images: any;
  categories: { name: string; slug: string } | null;
  profiles: { username: string; display_name: string } | null;
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && true);
  });
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [category, setCategory] = useState('all');

  const query = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialSort = searchParams.get('sort') || 'relevance';

  useEffect(() => {
    setCategory(initialCategory);
    setSortBy(initialSort);
  }, [initialCategory, initialSort]);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, category, sortBy]);

  const performSearch = async () => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('posts')
        .select(`
          id,
          title,
          excerpt,
          content,
          published_at,
          cover_images,
          categories:category_id (name, slug),
          profiles:author_id (username, display_name)
        `)
        .not('published_at', 'is', null);

      // Add search filter
      if (query) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`
        );
      }

      // Add category filter
      if (category !== 'all') {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category)
          .single();
        
        if (categoryData) {
          queryBuilder = queryBuilder.eq('category_id', categoryData.id);
        }
      }

      // Add sorting
      switch (sortBy) {
        case 'date':
          queryBuilder = queryBuilder.order('published_at', { ascending: false });
          break;
        case 'popularity':
          // For now, we'll sort by published_at. In a real app, you'd have engagement metrics
          queryBuilder = queryBuilder.order('published_at', { ascending: false });
          break;
        default:
          queryBuilder = queryBuilder.order('published_at', { ascending: false });
      }

      const { data, error } = await queryBuilder.limit(50);

      if (error) throw error;

      setResults(data || []);

      // Track search analytics
      if (user) {
        await supabase.from('search_analytics').insert({
          user_id: user.id,
          query,
          filters: { category, sort: sortBy },
          results_count: data?.length || 0
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Search className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Risultati di ricerca</h1>
            </div>
            
            {query && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-muted-foreground">Ricerca per:</span>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  "{query}"
                </Badge>
                <span className="text-muted-foreground">
                  • {results.length} {results.length === 1 ? 'risultato' : 'risultati'}
                </span>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-card/50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtri:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Categoria:</span>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutte</SelectItem>
                    <SelectItem value="calcio">Calcio</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="f1">Formula 1</SelectItem>
                    <SelectItem value="nfl">NFL</SelectItem>
                    <SelectItem value="basket">Basket</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ordina:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Rilevanza</SelectItem>
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="popularity">Popolarità</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Ricerca in corso...</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((article) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  excerpt={article.excerpt || ''}
                  author={article.profiles?.display_name || article.profiles?.username || 'Redazione'}
                  publishedAt={article.published_at}
                  imageUrl={article.cover_images}
                  category={article.categories?.name || 'News'}
                  readTime="3 min"
                  likes={0}
                  comments={0}
                />
              ))}
            </div>
          ) : query ? (
            <Card className="p-8 text-center">
              <CardContent>
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Nessun risultato trovato</h3>
                <p className="text-muted-foreground mb-4">
                  Non abbiamo trovato articoli corrispondenti a "{query}"
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Suggerimenti:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Controlla l'ortografia delle parole chiave</li>
                    <li>Prova termini più generici</li>
                    <li>Usa parole chiave diverse</li>
                    <li>Rimuovi i filtri per ampliare la ricerca</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <CardContent>
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Inizia una ricerca</h3>
                <p className="text-muted-foreground mb-4">
                  Usa la barra di ricerca per trovare articoli, autori e argomenti
                </p>
                <SearchSystem onSearch={() => {}} />
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}