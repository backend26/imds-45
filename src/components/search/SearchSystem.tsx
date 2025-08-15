import { useState } from 'react';
import { Search, X, Clock, TrendingUp, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface SearchFilters {
  category?: string;
  dateRange: string;
  tags: string[];
  sortBy: string;
}

const mockRecentSearches = [
  'Juventus Champions League',
  'Inter Milano derby',
  'Sinner US Open',
  'Formula 1 Monza',
  'Lakers Warriors'
];

const mockTrendingSearches = [
  'Calciomercato',
  'Serie A classifica',
  'Champions League',
  'Formula 1',
  'NBA playoff'
];

const availableCategories = [
  { value: 'calcio', label: 'Calcio' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'f1', label: 'Formula 1' },
  { value: 'nfl', label: 'NFL' },
  { value: 'basket', label: 'Basket' }
];

const availableTags = [
  'Champions League', 'Serie A', 'Premier League', 'La Liga',
  'ATP', 'WTA', 'US Open', 'Wimbledon',
  'Formula 1', 'MotoGP', 'NBA', 'NFL'
];

interface SearchSystemProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
}

export const SearchSystem = ({ onSearch }: SearchSystemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: undefined,
    dateRange: '',
    tags: [],
    sortBy: 'relevance'
  });
  const [recentSearches, setRecentSearches] = useState(mockRecentSearches);
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; excerpt: string; category: string; readTime: string }[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== searchQuery);
      return [searchQuery, ...filtered].slice(0, 5);
    });

    supabase
      .from('posts')
      .select('id,title,excerpt,published_at,created_at')
      .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        const results = (data || []).map((p) => ({
          id: p.id as unknown as string,
          title: (p as any).title,
          excerpt: (p as any).excerpt || '',
          category: 'News',
          readTime: '3 min',
        }));
        setSearchResults(results);
        onSearch?.(searchQuery, filters);
      });
  };

  const clearRecentSearches = () => setRecentSearches([]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: undefined,
      dateRange: '',
      tags: [],
      sortBy: 'relevance'
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Search className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Cerca</DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-4">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca articoli, autori, tag..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => handleSearch()}>
                Cerca
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {showFilters && (
              <div className="bg-muted/30 rounded-lg p-4 mb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Filtri di ricerca</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Pulisci filtri
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Categoria</Label>
                    <Select 
                      value={filters.category ?? ""} 
                      onValueChange={(value) => handleFilterChange('category', value === "" ? undefined : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tutte le categorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tutte le categorie</SelectItem>
                        {availableCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Ordina per</Label>
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ordina per" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Rilevanza</SelectItem>
                        <SelectItem value="date">Data</SelectItem>
                        <SelectItem value="popularity">Popolarità</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Tag</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <ScrollArea className="h-96">
              {query && searchResults.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Risultati per "{query}" ({searchResults.length})
                  </h3>
                  {searchResults.map((article) => (
                    <div key={article.id} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                      <h4 className="font-medium mb-1">{article.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : query ? (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">Nessun risultato trovato per "{query}"</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-sm flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Ricerche recenti
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={clearRecentSearches}
                          className="text-xs"
                        >
                          Cancella
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setQuery(search);
                              handleSearch(search);
                            }}
                            className="w-full text-left p-2 rounded hover:bg-muted/50 text-sm"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium text-sm flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4" />
                      Trend del momento
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {mockTrendingSearches.map((item, index) => (
                        <Badge key={index} variant="outline" className="cursor-pointer">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
