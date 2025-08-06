import { useState, useEffect, useRef } from "react";
import { Search, X, Filter, Calendar, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { SafeLink } from "@/lib/router-utils";

interface SearchResult {
  id: string;
  type: 'post' | 'user' | 'category';
  title: string;
  excerpt?: string;
  author?: {
    username: string;
    profile_picture_url?: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  tags?: string[];
  created_at: string;
  featured_image_url?: string;
}

interface SearchFilters {
  type: 'all' | 'posts' | 'users' | 'categories';
  category: string;
  dateRange: 'all' | 'week' | 'month' | 'year';
  author: string;
}

export const SearchSystem = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    category: '',
    dateRange: 'all',
    author: ''
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (query.trim().length > 2) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
    }
  }, [query, filters]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Mock search results since we don't have the database connected
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'post' as const,
          title: 'Juventus conquista la Champions League: analisi tattica',
          excerpt: 'Un\'analisi approfondita della vittoria bianconera in finale...',
          author: {
            username: 'MarcoRossi',
            profile_picture_url: undefined
          },
          category: {
            name: 'Calcio',
            slug: 'calcio'
          },
          tags: ['juventus', 'champions', 'tattica'],
          created_at: new Date().toISOString(),
          featured_image_url: '/assets/images/juventus-mercato.jpg'
        },
        {
          id: '2',
          type: 'post' as const,
          title: 'Sinner trionfa agli US Open: il tennis italiano al top',
          excerpt: 'Jannik Sinner conquista il suo primo US Open...',
          author: {
            username: 'AnnaBianchi',
            profile_picture_url: undefined
          },
          category: {
            name: 'Tennis',
            slug: 'tennis'
          },
          tags: ['sinner', 'usopen', 'tennis'],
          created_at: new Date().toISOString(),
          featured_image_url: '/assets/images/hero-sinner-usopen.jpg'
        },
        {
          id: '3',
          type: 'user' as const,
          title: 'MarcoRossi',
          excerpt: 'Giornalista sportivo specializzato in calcio',
          author: {
            username: 'MarcoRossi',
            profile_picture_url: undefined
          },
          created_at: new Date().toISOString()
        }
      ].filter(result => {
        // Apply filters
        if (filters.type !== 'all' && result.type !== filters.type.slice(0, -1)) {
          return false;
        }
        
        // Apply search query
        const searchTerm = query.toLowerCase();
        return (
          result.title.toLowerCase().includes(searchTerm) ||
          result.excerpt?.toLowerCase().includes(searchTerm) ||
          result.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      });

      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToRecentSearches = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    addToRecentSearches(searchQuery);
  };

  const openSearchDialog = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={openSearchDialog}
        className="hover:bg-secondary/60 hover:text-primary transition-all duration-200 hover:scale-105 flex items-center space-x-2 bg-background/50 border border-border/30 backdrop-blur-sm shadow-lg hover:shadow-xl"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline text-sm font-medium">Cerca...</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Cerca contenuti
            </DialogTitle>
          </DialogHeader>

          <div className="px-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Cerca articoli, utenti, categorie..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    handleSearch(query);
                  }
                }}
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Search Filters */}
            <div className="flex items-center gap-2 mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-3 w-3 mr-1" />
                    Filtri
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}>
                    Tutti i contenuti
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, type: 'posts' }))}>
                    Solo articoli
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, type: 'users' }))}>
                    Solo utenti
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, type: 'categories' }))}>
                    Solo categorie
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {filters.type !== 'all' && (
                <Badge variant="secondary" className="h-8">
                  {filters.type === 'posts' ? 'Articoli' : 
                   filters.type === 'users' ? 'Utenti' : 'Categorie'}
                </Badge>
              )}
            </div>
          </div>

          <Separator className="mx-6" />

          <ScrollArea className="flex-1 max-h-96">
            <div className="px-6 pb-6">
              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Ricerche recenti</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearRecentSearches}
                      className="text-xs h-6"
                    >
                      Cancella
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSearch(search)}
                        className="w-full justify-start h-8 text-sm"
                      >
                        <Search className="h-3 w-3 mr-2" />
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {query && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">
                      Risultati per "{query}"
                    </h3>
                    {results.length > 0 && (
                      <Badge variant="outline">
                        {results.length} risultat{results.length === 1 ? 'o' : 'i'}
                      </Badge>
                    )}
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : results.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nessun risultato trovato per "{query}"
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {results.map((result) => (
                        <Card
                          key={result.id}
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setIsOpen(false)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {result.type === 'user' ? (
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={result.author?.profile_picture_url} />
                                  <AvatarFallback>
                                    {result.author?.username?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              ) : result.featured_image_url ? (
                                <img
                                  src={result.featured_image_url}
                                  alt={result.title}
                                  className="h-10 w-16 object-cover rounded"
                                />
                              ) : (
                                <div className="h-10 w-16 bg-muted rounded flex items-center justify-center">
                                  {result.type === 'post' ? (
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm truncate">
                                    {result.title}
                                  </h4>
                                  <Badge variant="outline" className="text-xs">
                                    {result.type === 'post' ? 'Articolo' :
                                     result.type === 'user' ? 'Utente' : 'Categoria'}
                                  </Badge>
                                </div>

                                {result.excerpt && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                    {result.excerpt}
                                  </p>
                                )}

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {result.author && result.type === 'post' && (
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {result.author.username}
                                    </span>
                                  )}
                                  {result.category && (
                                    <span className="flex items-center gap-1">
                                      <Tag className="h-3 w-3" />
                                      {result.category.name}
                                    </span>
                                  )}
                                </div>

                                {result.tags && result.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {result.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
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
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};