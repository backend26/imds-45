import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdvancedSearchSystem } from '@/components/search/AdvancedSearchSystem';
import { EnhancedPostCard } from '@/components/posts/EnhancedPostCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Filter, Clock, TrendingUp } from 'lucide-react';

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

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    const initialQuery = searchParams.get('q') || '';
    setQuery(initialQuery);
  }, [searchParams]);

  const handleSearchResults = (searchResults: SearchResult[], searchQuery: string) => {
    setResults(searchResults);
    setQuery(searchQuery);
    setTotalResults(searchResults.length);

    // Update URL with search query
    const newSearchParams = new URLSearchParams(searchParams);
    if (searchQuery) {
      newSearchParams.set('q', searchQuery);
    } else {
      newSearchParams.delete('q');
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  const getResultsText = () => {
    if (totalResults === 0 && query) {
      return `Nessun risultato per "${query}"`;
    }
    if (totalResults > 0) {
      return `${totalResults} risultat${totalResults === 1 ? 'o' : 'i'} per "${query}"`;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />

      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Cerca su Malati dello Sport
            </h1>
            <p className="text-xl text-muted-foreground">
              Trova articoli, autori e contenuti sportivi con la ricerca avanzata
            </p>
          </div>

          <AdvancedSearchSystem
            onResults={handleSearchResults}
            placeholder="Cerca articoli, autori, categorie..."
            className="mx-auto"
          />
        </div>

        {/* Results Grid */}
        {results.length > 0 ? (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <SearchIcon className="h-6 w-6" />
              {getResultsText()}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map(result => (
                <EnhancedPostCard
                  key={result.id}
                  postId={result.id}
                  title={result.title}
                  excerpt={result.excerpt}
                  category={result.category}
                  authorName={result.author}
                  publishedAt={result.publishedAt}
                  imageUrl={result.imageUrl}
                  className="h-full"
                  onClick={() => navigate(`/post/${result.id}`)}
                />
              ))}
            </div>
          </div>
        ) : query ? (
          <Card className="max-w-2xl mx-auto p-12">
            <CardContent className="text-center">
              <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Nessun risultato trovato</h3>
              <p className="text-muted-foreground">Prova con termini diversi o filtri più ampi</p>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Funzionalità di Ricerca</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <SearchIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Ricerca Avanzata</h3>
                  <p className="text-sm text-muted-foreground">
                    Filtri per categoria, data e rilevanza
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Trending</h3>
                  <p className="text-sm text-muted-foreground">
                    Articoli più discussi del momento
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Cronologia</h3>
                  <p className="text-sm text-muted-foreground">
                    Ricerche recenti salvate
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}