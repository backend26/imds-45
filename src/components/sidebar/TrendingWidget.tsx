import { useState, useEffect } from 'react';
import { TrendingUp, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TrendingTopic = Database['public']['Tables']['trending_topics']['Row'];

export const TrendingWidget = () => {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        const { data, error } = await supabase
          .from('trending_topics')
          .select('*')
          .order('score', { ascending: false })
          .limit(6);

        if (error) throw error;
        setTopics(data || []);
      } catch (error) {
        console.error('Error fetching trending topics:', error);
      } finally {
        setLoading(false);
      }
    };

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

  const getSportBadgeVariant = (sport: string | null) => {
    switch (sport) {
      case 'calcio': return 'default';
      case 'tennis': return 'secondary';
      case 'f1': return 'destructive';
      case 'basket': return 'outline';
      default: return 'secondary';
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
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trend del Momento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topics.map((topic, index) => (
            <div key={topic.id} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-muted-foreground">
                  {index + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-sm">{topic.topic}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {topic.sport_category && (
                      <Badge variant={getSportBadgeVariant(topic.sport_category)} className="text-xs px-1 py-0">
                        {topic.sport_category.toUpperCase()}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {topic.mention_count} menzioni
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-primary">
                  {Number(topic.score).toFixed(1)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};