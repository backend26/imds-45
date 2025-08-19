import React, { useState, useEffect } from 'react';
import { TrendingUp, Hash, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface TrendingTopic {
  id: string;
  topic: string;
  score: number;
  mention_count: number;
  sport_category: string;
  created_at: string;
}

export const EnhancedTrendingWidget: React.FC = () => {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const fetchTrendingTopics = async () => {
    try {
      setLoading(true);
      
      // First, update trending topics with real data
      await updateTrendingTopics();
      
      // Then fetch the updated data
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .order('score', { ascending: false })
        .limit(8);

      if (error) {
        console.error('Error fetching trending topics:', error);
        return;
      }

      setTopics(data || []);
    } catch (error) {
      console.error('Error in fetchTrendingTopics:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTrendingTopics = async () => {
    try {
      // Call the database function to update trending topics
      const { error } = await supabase.rpc('update_trending_topics');
      
      if (error) {
        console.error('Error updating trending topics:', error);
      }
    } catch (error) {
      console.error('Error in updateTrendingTopics:', error);
    }
  };

  const getSportIcon = (sport: string) => {
    switch (sport?.toLowerCase()) {
      case 'calcio': return '⚽';
      case 'tennis': return '🎾';
      case 'f1': return '🏎️';
      case 'basket': return '🏀';
      case 'nfl': return '🏈';
      default: return '🏆';
    }
  };

  const getSportColor = (sport: string) => {
    switch (sport?.toLowerCase()) {
      case 'calcio': return 'bg-green-100 text-green-800';
      case 'tennis': return 'bg-yellow-100 text-yellow-800';
      case 'f1': return 'bg-red-100 text-red-800';
      case 'basket': return 'bg-orange-100 text-orange-800';
      case 'nfl': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trend del momento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted/60 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trend del momento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topics.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nessun trend disponibile</p>
            <p className="text-xs mt-1">I trend si basano sui tag più utilizzati negli articoli</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic, index) => (
              <div 
                key={topic.id} 
                className="flex items-center justify-between group hover:bg-muted/50 p-2 rounded transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-sm capitalize">
                        {topic.topic}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getSportColor(topic.sport_category)}`}
                      >
                        {getSportIcon(topic.sport_category)} {topic.sport_category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {topic.mention_count} menzioni
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-primary">
                    {Math.round(topic.score)}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(topic.created_at), { 
                      addSuffix: true, 
                      locale: it 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t">
          <div className="text-xs text-muted-foreground text-center">
            Trend aggiornati in base all'attività degli ultimi 7 giorni
          </div>
        </div>
      </CardContent>
    </Card>
  );
};