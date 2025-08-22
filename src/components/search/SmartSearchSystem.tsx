import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, Clock, TrendingUp, X, Hash, User, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDebounce } from '@/hooks/use-debounce';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  created_at: string;
  author: {
    display_name: string;
    profile_picture_url?: string;
  };
  category: {
    name: string;
    slug: string;
  };
  tags: string[];
  likes_count?: number;
  comments_count?: number;
}

interface SearchFilters {
  category: string;
  author: string;
  dateRange: string;
  sortBy: 'relevance' | 'date' | 'popularity';
  tags: string[];
}

export const SmartSearchSystem = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    author: '',
    dateRange: '',
    sortBy: 'relevance',
    tags: []
  });

  const debouncedQuery = useDebounce(query, 300);

  // Search function
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          excerpt,
          created_at,
          tags,
          profiles:author_id (
            display_name,
            profile_picture_url
          ),
          categories:category_id (
            name,
            slug
          )
        `)
        .eq('status', 'published')
        .textSearch('title', searchQuery, { type: 'websearch' });

      // Apply filters
      if (searchFilters.category) {
        queryBuilder = queryBuilder.eq('category_id', searchFilters.category);
      }

      if (searchFilters.author) {
        queryBuilder = queryBuilder.eq('author_id', searchFilters.author);
      }

      if (searchFilters.dateRange) {
        const now = new Date();
        let dateFilter: Date;
        switch (searchFilters.dateRange) {
          case 'day':
            dateFilter = new Date(now.setDate(now.getDate() - 1));
            break;
          case 'week':
            dateFilter = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            dateFilter = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'year':
            dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          default:
            dateFilter = new Date(0);
        }
        queryBuilder = queryBuilder.gte('created_at', dateFilter.toISOString());
      }

      // Apply sorting
      switch (searchFilters.sortBy) {
        case 'date':
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
          break;
        case 'popularity':
          // Note: This would require a computed column or separate query for likes/comments
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
          break;
        default:
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }

      const { data, error } = await queryBuilder.limit(20);

      if (error) throw error;

      const searchResults: SearchResult[] = (data || []).map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        created_at: post.created_at,
        tags: post.tags || [],
        author: post.profiles,
        category: post.categories
      }));

      setResults(searchResults);
      setTotalResults(searchResults.length);

      // Save to recent searches
      if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
        const newRecentSearches = [searchQuery.trim(), ...recentSearches.slice(0, 4)];
        setRecentSearches(newRecentSearches);
        localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      }

    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [recentSearches]);

  // Load suggestions
  const loadSuggestions = useCallback(async (input: string) => {
    if (!input.trim() || input.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      // Get trending tags
      const { data: tagsData } = await supabase
        .from('trending_topics')
        .select('topic')
        .ilike('topic', `%${input}%`)
        .limit(5);

      // Get popular search terms (from posts titles)
      const { data: postsData } = await supabase
        .from('posts')
        .select('title')
        .textSearch('title', input)
        .eq('status', 'published')
        .limit(5);

      const tagSuggestions = tagsData?.map(t => t.topic) || [];
      const titleSuggestions = postsData?.map(p => p.title) || [];
      
      setSuggestions([...tagSuggestions, ...titleSuggestions].slice(0, 8));
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Perform search when query or filters change
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery, filters);
    }
  }, [debouncedQuery, filters, performSearch]);

  // Load suggestions when typing
  useEffect(() => {
    if (query.trim() && query !== debouncedQuery) {
      loadSuggestions(query);
    }
  }, [query, debouncedQuery, loadSuggestions]);

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900">{part}</mark> : 
        part
    );
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setTotalResults(0);
  };

  const addTagFilter = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTagFilter = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const hasActiveFilters = filters.category || filters.author || filters.dateRange || filters.tags.length > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cerca articoli, autori, hashtag..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-2 ${hasActiveFilters ? 'bg-primary/10 text-primary' : ''}`}
                >
                  <Filter className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium">Filtri di ricerca</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Categoria</label>
                      <Select value={filters.category} onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, category: value }))
                      }>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Tutte" />
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

                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Periodo</label>
                      <Select value={filters.dateRange} onValueChange={(value) => 
                        setFilters(prev => ({ ...prev, dateRange: value }))
                      }>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Sempre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sempre</SelectItem>
                          <SelectItem value="day">Ultimo giorno</SelectItem>
                          <SelectItem value="week">Ultima settimana</SelectItem>
                          <SelectItem value="month">Ultimo mese</SelectItem>
                          <SelectItem value="year">Ultimo anno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Ordina per</label>
                    <Select value={filters.sortBy} onValueChange={(value: any) => 
                      setFilters(prev => ({ ...prev, sortBy: value }))
                    }>
                      <SelectTrigger className="h-8 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Rilevanza</SelectItem>
                        <SelectItem value="date">Data</SelectItem>
                        <SelectItem value="popularity">Popolarità</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {filters.tags.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Tag attivi</label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {filters.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer" 
                              onClick={() => removeTagFilter(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({
                        category: '',
                        author: '',
                        dateRange: '',
                        sortBy: 'relevance',
                        tags: []
                      })}
                      className="w-full"
                    >
                      Rimuovi filtri
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {(suggestions.length > 0 || recentSearches.length > 0) && query.trim() && !loading && results.length === 0 && (
          <Card className="absolute top-full mt-1 w-full z-50 border shadow-lg">
            <CardContent className="p-0">
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Suggerimenti
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-8 text-sm"
                      onClick={() => setQuery(suggestion)}
                    >
                      <Search className="h-3 w-3 mr-2" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}

              {recentSearches.length > 0 && (
                <>
                  {suggestions.length > 0 && <Separator />}
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Ricerche recenti
                    </div>
                    {recentSearches.map((recent, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start h-8 text-sm"
                        onClick={() => setQuery(recent)}
                      >
                        <Clock className="h-3 w-3 mr-2" />
                        {recent}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      {query.trim() && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {loading ? (
                'Ricerca in corso...'
              ) : (
                `${totalResults} risultati per "${query}"`
              )}
            </div>
            {hasActiveFilters && (
              <Badge variant="outline" className="text-xs">
                {Object.values(filters).filter(Boolean).length} filtri attivi
              </Badge>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-16 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results List */}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map(result => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-1">
                          {highlightText(result.title, query)}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <User className="h-3 w-3" />
                          <span>{result.author.display_name}</span>
                          <Calendar className="h-3 w-3 ml-2" />
                          <span>
                            {formatDistanceToNow(new Date(result.created_at), {
                              addSuffix: true,
                              locale: it
                            })}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {result.category.name}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {highlightText(
                            result.excerpt || result.content.substring(0, 200) + '...', 
                            query
                          )}
                        </p>

                        {result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {result.tags.slice(0, 5).map(tag => (
                              <Button
                                key={tag}
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => addTagFilter(tag)}
                              >
                                <Hash className="h-2 w-2 mr-1" />
                                {tag}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && query.trim() && results.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  Nessun risultato per "{query}"
                </p>
                <p className="text-sm text-muted-foreground">
                  Prova a modificare i termini di ricerca o rimuovere i filtri
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};