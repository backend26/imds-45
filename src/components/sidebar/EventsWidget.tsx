import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from '@/utils/dateUtilsV3';
import type { Database } from '@/integrations/supabase/types';

type SportsEvent = Database['public']['Tables']['sports_events']['Row'];

export const EventsWidget = () => {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('sports_events')
          .select('*')
          .gte('start_datetime', new Date().toISOString())
          .order('priority', { ascending: false })
          .order('start_datetime', { ascending: true })
          .limit(4);

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);

    // Set up realtime subscription
    const channel = supabase
      .channel('events-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sports_events' },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'live': return 'destructive';
      case 'scheduled': return 'default';
      case 'finished': return 'secondary';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'calcio': return '⚽';
      case 'tennis': return '🎾';
      case 'f1': return '🏎️';
      case 'basket': return '🏀';
      case 'nfl': return '🏈';
      default: return '🏆';
    }
  };

  const formatEventTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'In corso';
    if (diff < 24 * 60 * 60 * 1000) {
      return `Tra ${formatDistanceToNow(date)}`;
    }
    return date.toLocaleDateString('it-IT', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prossimi Eventi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
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
          <Calendar className="h-5 w-5 text-primary" />
          Prossimi Eventi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessun evento in programma</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getSportIcon(event.sport_category)}</span>
                    <Badge variant={getStatusBadgeVariant(event.status)} className="text-xs">
                      {event.status === 'live' ? 'LIVE' : 
                       event.status === 'scheduled' ? 'PROGRAMMATO' :
                       event.status === 'finished' ? 'FINITO' : 'ANNULLATO'}
                    </Badge>
                  </div>
                  {event.priority >= 4 && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
                
                <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                  {event.title}
                </h4>
                
                {event.teams && Array.isArray(event.teams) && event.teams.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {event.teams.map((team: any) => team.name).join(' vs ')}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatEventTime(event.start_datetime)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                </div>

                {(event.streaming_url || event.ticket_url) && (
                  <div className="flex gap-2 mt-2">
                    {event.streaming_url && (
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Guarda
                      </Button>
                    )}
                    {event.ticket_url && (
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Biglietti
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};