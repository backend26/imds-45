import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Heart, Plus, X, Save } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  sport: string;
  logo?: string;
}

const AVAILABLE_TEAMS: Team[] = [
  // Calcio
  { id: 'juventus', name: 'Juventus', sport: 'calcio', logo: '⚫⚪' },
  { id: 'milan', name: 'AC Milan', sport: 'calcio', logo: '🔴⚫' },
  { id: 'inter', name: 'Inter', sport: 'calcio', logo: '🔵⚫' },
  { id: 'napoli', name: 'Napoli', sport: 'calcio', logo: '🔵' },
  { id: 'roma', name: 'AS Roma', sport: 'calcio', logo: '🟡🔴' },
  { id: 'lazio', name: 'Lazio', sport: 'calcio', logo: '🔵⚪' },
  { id: 'atalanta', name: 'Atalanta', sport: 'calcio', logo: '🔵⚫' },
  { id: 'fiorentina', name: 'Fiorentina', sport: 'calcio', logo: '🟣' },
  
  // Basket
  { id: 'lakers', name: 'Los Angeles Lakers', sport: 'basket', logo: '🟡🟣' },
  { id: 'warriors', name: 'Golden State Warriors', sport: 'basket', logo: '🔵🟡' },
  { id: 'bulls', name: 'Chicago Bulls', sport: 'basket', logo: '🔴⚫' },
  { id: 'celtics', name: 'Boston Celtics', sport: 'basket', logo: '🟢⚪' },
  
  // Tennis
  { id: 'federer', name: 'Roger Federer', sport: 'tennis', logo: '🎾' },
  { id: 'nadal', name: 'Rafael Nadal', sport: 'tennis', logo: '🎾' },
  { id: 'djokovic', name: 'Novak Djokovic', sport: 'tennis', logo: '🎾' },
  { id: 'sinner', name: 'Jannik Sinner', sport: 'tennis', logo: '🇮🇹' },
  
  // F1
  { id: 'ferrari', name: 'Ferrari', sport: 'f1', logo: '🏎️🔴' },
  { id: 'mercedes', name: 'Mercedes', sport: 'f1', logo: '🏎️⚫' },
  { id: 'redbull', name: 'Red Bull Racing', sport: 'f1', logo: '🏎️🔵' },
  { id: 'mclaren', name: 'McLaren', sport: 'f1', logo: '🏎️🟠' },
  
  // NFL
  { id: 'patriots', name: 'New England Patriots', sport: 'nfl', logo: '🏈🔵' },
  { id: 'chiefs', name: 'Kansas City Chiefs', sport: 'nfl', logo: '🏈🔴' },
  { id: 'cowboys', name: 'Dallas Cowboys', sport: 'nfl', logo: '🏈⭐' },
  { id: 'packers', name: 'Green Bay Packers', sport: 'nfl', logo: '🏈🟢' }
];

export const FavoriteTeamsSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoriteTeams();
  }, [user]);

  const loadFavoriteTeams = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('favorite_teams')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data?.favorite_teams && Array.isArray(data.favorite_teams)) {
        setFavoriteTeams(data.favorite_teams.filter(team => typeof team === 'string'));
      }
    } catch (error) {
      console.error('Error loading favorite teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFavoriteTeams = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ favorite_teams: favoriteTeams })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Squadre del cuore salvate con successo"
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving favorite teams:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le squadre del cuore",
        variant: "destructive"
      });
    }
  };

  const toggleTeam = (teamId: string) => {
    setFavoriteTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const removeTeam = (teamId: string) => {
    setFavoriteTeams(prev => prev.filter(id => id !== teamId));
  };

  const getFavoriteTeamDetails = () => {
    return favoriteTeams.map(teamId => 
      AVAILABLE_TEAMS.find(team => team.id === teamId)
    ).filter(Boolean) as Team[];
  };

  const groupTeamsBySport = () => {
    const grouped: { [sport: string]: Team[] } = {};
    AVAILABLE_TEAMS.forEach(team => {
      if (!grouped[team.sport]) grouped[team.sport] = [];
      grouped[team.sport].push(team);
    });
    return grouped;
  };

  const getSportName = (sport: string) => {
    const names: { [key: string]: string } = {
      calcio: 'Calcio',
      basket: 'Basket',
      tennis: 'Tennis',
      f1: 'Formula 1',
      nfl: 'NFL'
    };
    return names[sport] || sport;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const favoriteTeamDetails = getFavoriteTeamDetails();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Squadre del Cuore
          </CardTitle>
          <Button
            variant={isEditing ? "outline" : "default"}
            size="sm"
            onClick={() => isEditing ? saveFavoriteTeams() : setIsEditing(true)}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salva
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Modifica
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          favoriteTeamDetails.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(
                favoriteTeamDetails.reduce((acc, team) => {
                  if (!acc[team.sport]) acc[team.sport] = [];
                  acc[team.sport].push(team);
                  return acc;
                }, {} as { [sport: string]: Team[] })
              ).map(([sport, teams]) => (
                <div key={sport}>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    {getSportName(sport)}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {teams.map(team => (
                      <Badge key={team.id} variant="secondary" className="flex items-center gap-1">
                        <span>{team.logo}</span>
                        <span>{team.name}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Non hai ancora selezionato nessuna squadra del cuore</p>
              <p className="text-sm">Clicca su "Modifica" per iniziare</p>
            </div>
          )
        ) : (
          <div className="space-y-6">
            {/* Selected Teams */}
            {favoriteTeams.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Squadre Selezionate ({favoriteTeams.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {getFavoriteTeamDetails().map(team => (
                    <Badge 
                      key={team.id} 
                      variant="default" 
                      className="flex items-center gap-2 pr-1"
                    >
                      <span>{team.logo}</span>
                      <span>{team.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeTeam(team.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available Teams by Sport */}
            <div className="space-y-4">
              <h4 className="font-medium">Seleziona le tue squadre preferite</h4>
              {Object.entries(groupTeamsBySport()).map(([sport, teams]) => (
                <div key={sport}>
                  <h5 className="font-medium text-sm text-muted-foreground mb-2">
                    {getSportName(sport)}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {teams.map(team => (
                      <div key={team.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={team.id}
                          checked={favoriteTeams.includes(team.id)}
                          onCheckedChange={() => toggleTeam(team.id)}
                        />
                        <Label 
                          htmlFor={team.id} 
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <span>{team.logo}</span>
                          <span className="text-sm">{team.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  loadFavoriteTeams(); // Reset to original state
                }}
              >
                Annulla
              </Button>
              <Button onClick={saveFavoriteTeams}>
                <Save className="h-4 w-4 mr-2" />
                Salva Modifiche
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};