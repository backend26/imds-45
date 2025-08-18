import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, FileText, Filter, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  type: 'article' | 'author';
  relevanceScore: number;
}

interface SearchSystemProps {
  onResults?: (results: SearchResult[], query: string) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  compact?: boolean;
}

export const SearchSystem: React.FC<SearchSystemProps> = ({
  onResults,
  placeholder = "Cerca articoli e autori...",
  className,
  showFilters = true,
  compact = false
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    dateRange: 'all',
    type: 'all'
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const recent = localStorage.getItem('recent-searches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

    try {
      const searchResults: SearchResult[] = [];

      // Search articles
      if (filters.type === 'all' || filters.type === 'articles') {
        let articlesQuery = supabase
          .from('posts')
          .select(`
            id,
            title,
            excerpt,
            published_at,
            featured_image_url,
            categories (name),
            profiles!posts_author_id_fkey (username, display_name)
          `)
          .not('published_at', 'is', null)
          .or(`title.ilike.%${searchQuery}%, excerpt.ilike.%${searchQuery}%, content.ilike.%${searchQuery}%`);

        if (filters.categories.length > 0) {
          articlesQuery = articlesQuery.in('category_id', filters.categories);
        }

        if (filters.dateRange !== 'all') {
          const date = new Date();
          switch (filters.dateRange) {
            case 'week':
              date.setDate(date.getDate() - 7);
              break;
            case 'month':
              date.setMonth(date.getMonth() - 1);
              break;
            case 'year':
              date.setFullYear(date.getFullYear() - 1);
              break;
          }
          articlesQuery = articlesQuery.gte('published_at', date.toISOString());
        }

        const { data: articles } = await articlesQuery.limit(10);

        if (articles) {
          articles.forEach(article => {
            const author = article.profiles as any;
            searchResults.push({
              id: article.id,
              title: article.title,
              excerpt: article.excerpt || '',
              category: (article.categories as any)?.name || 'Generale',
              author: author?.display_name || author?.username || 'Anonimo',
              publishedAt: article.published_at!,
              imageUrl: article.featured_image_url || undefined,
              type: 'article',
              relevanceScore: calculateRelevance(searchQuery, article.title, article.excerpt)
            });
          });
        }
      }

      // Search authors
      if (filters.type === 'all' || filters.type === 'authors') {
        const { data: authors } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, bio, profile_picture_url')
          .or(`username.ilike.%${searchQuery}%, display_name.ilike.%${searchQuery}%, bio.ilike.%${searchQuery}%`)
          .in('role', ['journalist', 'administrator'])
          .limit(5);

        if (authors) {
          authors.forEach(author => {
            searchResults.push({
              id: author.user_id,
              title: author.display_name || author.username,
              excerpt: author.bio || '',
              category: 'Autore',
              author: author.username,
              publishedAt: new Date().toISOString(),
              imageUrl: author.profile_picture_url || undefined,
              type: 'author',
              relevanceScore: calculateRelevance(searchQuery, author.display_name || author.username, author.bio)
            });
          });
        }
      }

      // Sort by relevance
      searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      setResults(searchResults);
      onResults?.(searchResults, searchQuery);
      saveRecentSearch(searchQuery);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRelevance = (query: string, title: string, content?: string | null) => {
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();
    const contentLower = content?.toLowerCase() || '';
    
    let score = 0;
    
    // Exact match in title
    if (titleLower.includes(queryLower)) score += 10;
    
    // Partial match in title
    const titleWords = titleLower.split(' ');
    const queryWords = queryLower.split(' ');
    queryWords.forEach(word => {
      if (titleWords.some(titleWord => titleWord.includes(word))) score += 5;
    });
    
    // Match in content
    if (contentLower.includes(queryLower)) score += 3;
    
    return score;
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'article') {
      navigate(`/post/${result.id}`);
    } else if (result.type === 'author') {
      navigate(`/@${result.author}`);
    }
    setShowResults(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-md", className)}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(query.length > 0 || recentSearches.length > 0)}
            className={cn(
              "pl-9 pr-20",
              compact ? "h-8 text-sm" : "h-10"
            )}
          />
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            {showFilters && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <Filter className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Tipo di contenuto</Label>
                      <Select
                        value={filters.type}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tutto</SelectItem>
                          <SelectItem value="articles">Solo Articoli</SelectItem>
                          <SelectItem value="authors">Solo Autori</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Periodo</Label>
                      <Select
                        value={filters.dateRange}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tutto il tempo</SelectItem>
                          <SelectItem value="week">Ultima settimana</SelectItem>
                          <SelectItem value="month">Ultimo mese</SelectItem>
                          <SelectItem value="year">Ultimo anno</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </form>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto border shadow-lg">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="flex items-start gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    {result.imageUrl ? (
                      <img
                        src={result.imageUrl}
                        alt=""
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        {result.type === 'author' ? (
                          <User className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium line-clamp-1">{result.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {result.type === 'author' ? 'Autore' : result.category}
                        </Badge>
                      </div>
                      {result.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.excerpt}
                        </p>
                      )}
                      {result.type === 'article' && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>di {result.author}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(result.publishedAt), {
                              addSuffix: true,
                              locale: it
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-4 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nessun risultato per "{query}"</p>
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Ricerche recenti</span>
                </div>
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setQuery(search);
                      performSearch(search);
                    }}
                  >
                    <span className="text-sm">{search}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = recentSearches.filter((_, i) => i !== index);
                        setRecentSearches(updated);
                        localStorage.setItem('recent-searches', JSON.stringify(updated));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};