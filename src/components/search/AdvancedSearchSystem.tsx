import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Filter, X, Clock, Star, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

interface SearchFilters {
  category?: string;
  sortBy: 'relevance' | 'date' | 'popularity' | 'trending';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  authors: string[];
  tags: string[];
  minRating?: number;
}

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  rating: number;
  engagement: number;
  relevanceScore: number;
}

interface AdvancedSearchSystemProps {
  onResults: (results: SearchResult[], query: string) => void;
  placeholder?: string;
  className?: string;
}

export const AdvancedSearchSystem = ({ 
  onResults, 
  placeholder = "Cerca articoli, autori, categorie...",
  className 
}: AdvancedSearchSystemProps) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    dateRange: 'all',
    authors: [],
    tags: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search history and metadata
  useEffect(() => {
    const loadMetadata = async () => {
      // Load search history from localStorage
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSearchHistory(history);

      // Load available authors and tags
      const { data: authors } = await supabase
        .from('profiles')
        .select('display_name')
        .not('display_name', 'is', null)
        .limit(50);

      const { data: posts } = await supabase
        .from('posts')
        .select('tags')
        .not('tags', 'is', null)
        .eq('status', 'published')
        .limit(100);

      if (authors) {
        setAvailableAuthors(authors.map(a => a.display_name).filter(Boolean));
      }

      if (posts) {
        const allTags = posts.flatMap(p => p.tags || []);
        const uniqueTags = [...new Set(allTags)];
        setAvailableTags(uniqueTags);
      }
    };

    loadMetadata();
  }, []);

  // Auto-complete suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      const { data } = await supabase
        .from('posts')
        .select('title')
        .ilike('title', `%${debouncedQuery}%`)
        .eq('status', 'published')
        .limit(5);

      if (data) {
        setSuggestions(data.map(p => p.title));
      }
    };

    loadSuggestions();
  }, [debouncedQuery]);

  // Perform advanced search
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      // Build complex query with full-text search
      let query = supabase
        .from('posts')
        .select(`
          id, title, excerpt, featured_image_url, cover_images, published_at, created_at,
          categories:category_id (name),
          profiles:author_id (display_name, username),
          tags
        `)
        .eq('status', 'published');

      // Full-text search on title and content
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
      }

      // Category filter
      if (searchFilters.category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', searchFilters.category)
          .single();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      // Date range filter
      if (searchFilters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (searchFilters.dateRange) {
          case 'today':
            startDate = new Date(now);
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte('published_at', startDate.toISOString());
      }

      const { data: posts } = await query.limit(50);

      if (posts) {
        // Calculate relevance scores and engagement
        let results: SearchResult[] = posts.map(post => {
          const title = post.title || '';
          const excerpt = post.excerpt || '';
          const content = post.excerpt || '';
          
          // Calculate relevance score based on query match
          let relevanceScore = 0;
          const queryLower = searchQuery.toLowerCase();
          
          if (title.toLowerCase().includes(queryLower)) relevanceScore += 10;
          if (excerpt.toLowerCase().includes(queryLower)) relevanceScore += 5;
          if (content.toLowerCase().includes(queryLower)) relevanceScore += 2;
          
          // Boost for exact matches
          if (title.toLowerCase() === queryLower) relevanceScore += 20;
          
          return {
            id: post.id,
            title,
            excerpt: excerpt || content.substring(0, 150) + '...',
            category: post.categories?.name || 'News',
            author: post.profiles?.display_name || post.profiles?.username || 'Redazione',
            publishedAt: post.published_at || post.created_at,
            imageUrl: (typeof post.cover_images === 'string' ? post.cover_images : post.featured_image_url) as string,
            rating: 4.2, // TODO: Implement real ratings
            engagement: Math.floor(Math.random() * 100), // TODO: Calculate real engagement
            relevanceScore
          };
        });

        // Apply sorting
        switch (searchFilters.sortBy) {
          case 'relevance':
            results.sort((a, b) => b.relevanceScore - a.relevanceScore);
            break;
          case 'date':
            results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            break;
          case 'popularity':
            results.sort((a, b) => b.engagement - a.engagement);
            break;
          case 'trending':
            // Trending algorithm: recent + engagement
            results.sort((a, b) => {
              const aHours = (Date.now() - new Date(a.publishedAt).getTime()) / (1000 * 60 * 60);
              const bHours = (Date.now() - new Date(b.publishedAt).getTime()) / (1000 * 60 * 60);
              const aTrending = a.engagement / Math.pow(aHours + 1, 0.5);
              const bTrending = b.engagement / Math.pow(bHours + 1, 0.5);
              return bTrending - aTrending;
            });
            break;
        }

        // Save to search history
        const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));

        // Track search analytics
        await supabase.from('search_analytics').insert({
          query: searchQuery,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          results_count: results.length,
          filters: JSON.stringify(searchFilters)
        });

        onResults(results, searchQuery);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchHistory, onResults]);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    performSearch(finalQuery, filters);
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'relevance',
      dateRange: 'all',
      authors: [],
      tags: []
    });
  };

  const activeFiltersCount = 
    (filters.category ? 1 : 0) +
    (filters.dateRange !== 'all' ? 1 : 0) +
    filters.authors.length +
    filters.tags.length +
    (filters.minRating ? 1 : 0);

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-10 pr-20 h-12 text-base"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "h-8 px-2",
                  activeFiltersCount > 0 && "text-primary bg-primary/10"
                )}
              >
                <Filter className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    Filtri Avanzati
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ordina per</label>
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Rilevanza
                          </div>
                        </SelectItem>
                        <SelectItem value="date">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Data
                          </div>
                        </SelectItem>
                        <SelectItem value="popularity">Popolarità</SelectItem>
                        <SelectItem value="trending">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Trending
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Periodo</label>
                    <Select 
                      value={filters.dateRange} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Sempre</SelectItem>
                        <SelectItem value="today">Oggi</SelectItem>
                        <SelectItem value="week">Ultima settimana</SelectItem>
                        <SelectItem value="month">Ultimo mese</SelectItem>
                        <SelectItem value="year">Ultimo anno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoria</label>
                    <Select 
                      value={filters.category || ''} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, category: value || undefined }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tutte le categorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tutte le categorie</SelectItem>
                        <SelectItem value="calcio">Calcio</SelectItem>
                        <SelectItem value="tennis">Tennis</SelectItem>
                        <SelectItem value="f1">Formula 1</SelectItem>
                        <SelectItem value="basket">Basket</SelectItem>
                        <SelectItem value="nfl">NFL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
          <Button 
            onClick={() => handleSearch()}
            disabled={isLoading}
            size="sm"
            className="h-8 px-3"
          >
            {isLoading ? 'Ricerca...' : 'Cerca'}
          </Button>
        </div>
      </div>

      {/* Search Suggestions */}
      {suggestions.length > 0 && query.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 border shadow-lg">
          <CardContent className="p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm"
                onClick={() => {
                  setQuery(suggestion);
                  handleSearch(suggestion);
                  setSuggestions([]);
                }}
              >
                <Search className="inline h-3 w-3 mr-2 text-muted-foreground" />
                {suggestion}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Search History */}
      {query.length === 0 && searchHistory.length > 0 && inputRef.current === document.activeElement && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 border shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ricerche recenti</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
            {searchHistory.slice(0, 5).map((historyItem, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm flex items-center justify-between"
                onClick={() => {
                  setQuery(historyItem);
                  handleSearch(historyItem);
                }}
              >
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                  {historyItem}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};