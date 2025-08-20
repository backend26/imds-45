import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Trash2, Edit, Plus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface SportsEvent {
  id: string;
  title: string;
  description: string | null;
  sport_category: string;
  start_datetime: string;
  end_datetime: string | null;
  venue: string | null;
  location: string | null;
  status: string;
  event_type: string;
  teams: any;
  priority: number;
  created_by: string | null;
  created_at: string;
}

const sportCategories = [
  { value: 'calcio', label: 'Calcio' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'f1', label: 'Formula 1' },
  { value: 'basket', label: 'Basket' },
  { value: 'nfl', label: 'NFL' },
];

const eventStatuses = [
  { value: 'scheduled', label: 'Programmato' },
  { value: 'live', label: 'In corso' },
  { value: 'completed', label: 'Completato' },
  { value: 'cancelled', label: 'Cancellato' },
];

const eventTypes = [
  { value: 'match', label: 'Partita' },
  { value: 'tournament', label: 'Torneo' },
  { value: 'news', label: 'Notizia' },
  { value: 'transfer', label: 'Trasferimento' },
];

export const EventsEditor: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<SportsEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport_category: '',
    start_datetime: '',
    end_datetime: '',
    venue: '',
    location: '',
    status: 'scheduled',
    event_type: 'match',
    priority: 1,
    teams: []
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Fallback: No sports_events table, use empty array
      console.warn('Events fetching requires sports_events table to be created');
      setEvents([]);
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

    setSubmitting(true);
    try {
      const eventData = {
        ...formData,
        created_by: user.id,
        teams: formData.teams.length > 0 ? formData.teams : null
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('sports_events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast({
          title: "Evento aggiornato",
          description: "L'evento è stato aggiornato con successo"
        });
      } else {
        const { error } = await supabase
          .from('sports_events')
          .insert(eventData);

        if (error) throw error;
        toast({
          title: "Evento creato",
          description: "L'evento è stato creato con successo"
        });
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare l'evento",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event: SportsEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      sport_category: event.sport_category,
      start_datetime: event.start_datetime,
      end_datetime: event.end_datetime || '',
      venue: event.venue || '',
      location: event.location || '',
      status: event.status,
      event_type: event.event_type,
      priority: event.priority,
      teams: event.teams || []
    });
    setIsCreating(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo evento?')) return;

    try {
      const { error } = await supabase
        .from('sports_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      
      toast({
        title: "Evento eliminato",
        description: "L'evento è stato eliminato con successo"
      });
      
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
      start_datetime: '',
      end_datetime: '',
      venue: '',
      location: '',
      status: 'scheduled',
      event_type: 'match',
      priority: 1,
      teams: []
    });
    setEditingEvent(null);
    setIsCreating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestione Eventi Sportivi</h1>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuovo Evento
        </Button>
      </div>

      {/* Form di creazione/modifica */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEvent ? 'Modifica Evento' : 'Nuovo Evento'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Titolo</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titolo dell'evento"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Sport</label>
                  <Select
                    value={formData.sport_category}
                    onValueChange={(value) => setFormData({ ...formData, sport_category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sportCategories.map(sport => (
                        <SelectItem key={sport.value} value={sport.value}>
                          {sport.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Descrizione</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrizione dell'evento"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data/Ora Inizio</label>
                  <Input
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Data/Ora Fine</label>
                  <Input
                    type="datetime-local"
                    value={formData.end_datetime}
                    onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Venue</label>
                  <Input
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Nome del venue"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Località</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Città, Stato"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Stato</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventStatuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priorità</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annulla
                </Button>
                <Button type="submit" disabled={submitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {submitting ? 'Salvando...' : 'Salva'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista eventi */}
      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <Badge className={`text-white ${getStatusColor(event.status)}`}>
                      {eventStatuses.find(s => s.value === event.status)?.label}
                    </Badge>
                    <Badge variant="outline">
                      {sportCategories.find(s => s.value === event.sport_category)?.label}
                    </Badge>
                  </div>
                  
                  {event.description && (
                    <p className="text-muted-foreground mb-3">{event.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(event.start_datetime), 'dd/MM/yyyy HH:mm', { locale: it })}
                      </span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}{event.location && `, ${event.location}`}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {events.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nessun evento</h3>
              <p className="text-muted-foreground">
                Non ci sono eventi programmati. Crea il primo evento!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};