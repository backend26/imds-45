import { useState, useEffect } from 'react';
import { TrendingUp, Hash, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TrendingTopic = Database['public']['Tables']['trending_topics']['Row'];

export const RealTrendingWidget = () => {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTrendingTopics();
    
    // Set up realtime subscription for trending topics
    const channel = supabase
      .channel('trending-topics-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trending_topics' },
        () => fetchTrendingTopics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTrendingTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .order('score', { ascending: false })
        .limit(8);

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTrendingTopics = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase.rpc('update_trending_topics');
      if (error) throw error;
      
      await fetchTrendingTopics();
    } catch (error) {
      console.error('Error updating trending topics:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getSportBadgeVariant = (sport: string | null) => {
    switch (sport) {
      case 'calcio': return 'default';
      case 'tennis': return 'secondary';
      case 'f1': return 'destructive';
      case 'basket': return 'outline';
      case 'nfl': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSportEmoji = (sport: string | null) => {
    switch (sport) {
      case 'calcio': return '⚽';
      case 'tennis': return '🎾';
      case 'f1': return '🏎️';
      case 'basket': return '🏀';
      case 'nfl': return '🏈';
      default: return '🏆';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend del Momento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trend del Momento
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={updateTrendingTopics}
            disabled={updating}
          >
            {updating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topics.length > 0 ? (
            topics.map((topic, index) => (
              <div 
                key={topic.id} 
                className="group flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-border"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-sm text-muted-foreground w-4 text-center">
                      {index + 1}
                    </span>
                    {topic.sport_category && (
                      <span className="text-sm">{getSportEmoji(topic.sport_category)}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                        {topic.topic}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {topic.sport_category && (
                        <Badge 
                          variant={getSportBadgeVariant(topic.sport_category)} 
                          className="text-xs px-1 py-0 h-4"
                        >
                          {topic.sport_category.toUpperCase()}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {topic.mention_count} {topic.mention_count === 1 ? 'menzione' : 'menzioni'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-primary">
                    {Number(topic.score).toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    score
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Hash className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                Nessun trend disponibile
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={updateTrendingTopics}
                className="mt-2"
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : (
                  <TrendingUp className="h-3 w-3 mr-2" />
                )}
                Aggiorna trend
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};