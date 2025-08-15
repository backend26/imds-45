import { useState, useEffect } from 'react';
import { Plus, Calendar, Edit, Trash2, Eye, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type SportsEvent = Database['public']['Tables']['sports_events']['Row'];

export const EventsManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<SportsEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport_category: '',
    event_type: 'match',
    location: '',
    venue: '',
    start_datetime: '',
    end_datetime: '',
    status: 'scheduled',
    priority: 1,
    streaming_url: '',
    ticket_url: '',
    teams: []
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sports_events')
        .select('*')
        .order('start_datetime', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli eventi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const eventData = {
        ...formData,
        created_by: user.id,
        teams: formData.teams.length > 0 ? formData.teams : []
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('sports_events')
          .update(eventData)
          .eq('id', editingEvent.id);
        
        if (error) throw error;
        toast({ title: "Successo", description: "Evento aggiornato con successo" });
      } else {
        const { error } = await supabase
          .from('sports_events')
          .insert([eventData]);
        
        if (error) throw error;
        toast({ title: "Successo", description: "Evento creato con successo" });
      }

      setIsModalOpen(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare l'evento",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (event: SportsEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      sport_category: event.sport_category,
      event_type: event.event_type,
      location: event.location || '',
      venue: event.venue || '',
      start_datetime: new Date(event.start_datetime).toISOString().slice(0, 16),
      end_datetime: event.end_datetime ? new Date(event.end_datetime).toISOString().slice(0, 16) : '',
      status: event.status,
      priority: event.priority,
      streaming_url: event.streaming_url || '',
      ticket_url: event.ticket_url || '',
      teams: Array.isArray(event.teams) ? event.teams : []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo evento?')) return;

    try {
      const { error } = await supabase
        .from('sports_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast({ title: "Successo", description: "Evento eliminato con successo" });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'evento",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      sport_category: '',
      event_type: 'match',
      location: '',
      venue: '',
      start_datetime: '',
      end_datetime: '',
      status: 'scheduled',
      priority: 1,
      streaming_url: '',
      ticket_url: '',
      teams: []
    });
  };

  const openNewEventModal = () => {
    setEditingEvent(null);
    resetForm();
    setIsModalOpen(true);
  };

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestione Eventi Sportivi</h1>
          <p className="text-muted-foreground">Crea e gestisci eventi sportivi per il calendario</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewEventModal} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuovo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Modifica Evento' : 'Nuovo Evento'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Titolo Evento *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Descrizione</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="sport_category">Sport *</Label>
                  <Select
                    value={formData.sport_category}
                    onValueChange={(value) => setFormData({ ...formData, sport_category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calcio">⚽ Calcio</SelectItem>
                      <SelectItem value="tennis">🎾 Tennis</SelectItem>
                      <SelectItem value="f1">🏎️ Formula 1</SelectItem>
                      <SelectItem value="basket">🏀 Basket</SelectItem>
                      <SelectItem value="nfl">🏈 NFL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="event_type">Tipo Evento</Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="match">Partita</SelectItem>
                      <SelectItem value="race">Gara</SelectItem>
                      <SelectItem value="tournament">Torneo</SelectItem>
                      <SelectItem value="training">Allenamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Località</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="es. Milano, Italia"
                  />
                </div>

                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="es. Stadio San Siro"
                  />
                </div>

                <div>
                  <Label htmlFor="start_datetime">Data e Ora Inizio *</Label>
                  <Input
                    id="start_datetime"
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_datetime">Data e Ora Fine</Label>
                  <Input
                    id="end_datetime"
                    type="datetime-local"
                    value={formData.end_datetime}
                    onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Stato</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Programmato</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="finished">Finito</SelectItem>
                      <SelectItem value="cancelled">Annullato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priorità (1-5)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div>
                  <Label htmlFor="streaming_url">Link Streaming</Label>
                  <Input
                    id="streaming_url"
                    type="url"
                    value={formData.streaming_url}
                    onChange={(e) => setFormData({ ...formData, streaming_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor="ticket_url">Link Biglietti</Label>
                  <Input
                    id="ticket_url"
                    type="url"
                    value={formData.ticket_url}
                    onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit">
                  {editingEvent ? 'Aggiorna' : 'Crea'} Evento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nessun evento</h3>
              <p className="text-muted-foreground mb-4">Inizia creando il tuo primo evento sportivo</p>
              <Button onClick={openNewEventModal}>
                <Plus className="h-4 w-4 mr-2" />
                Crea il primo evento
              </Button>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getSportIcon(event.sport_category)}</span>
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(event.status)}>
                      {event.status === 'live' ? 'LIVE' :
                       event.status === 'scheduled' ? 'PROGRAMMATO' :
                       event.status === 'finished' ? 'FINITO' : 'ANNULLATO'}
                    </Badge>
                    {event.priority >= 4 && (
                      <Badge variant="secondary">Alta Priorità</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(event.start_datetime).toLocaleString('it-IT')}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                  </div>

                  {event.teams && Array.isArray(event.teams) && event.teams.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {event.teams.map((team: any) => team.name).join(' vs ')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifica
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Elimina
                    </Button>
                    {event.streaming_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={event.streaming_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-1" />
                          Streaming
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};