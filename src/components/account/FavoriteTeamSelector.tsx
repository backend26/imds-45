import { useState, useEffect } from 'react';
import { Search, Star, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  sport: string;
  league: string;
  country: string;
  logo?: string;
}

const POPULAR_TEAMS: Record<string, Team[]> = {
  calcio: [
    { id: 'juventus', name: 'Juventus', sport: 'calcio', league: 'Serie A', country: 'Italia' },
    { id: 'inter', name: 'Inter Milano', sport: 'calcio', league: 'Serie A', country: 'Italia' },
    { id: 'milan', name: 'AC Milan', sport: 'calcio', league: 'Serie A', country: 'Italia' },
    { id: 'napoli', name: 'SSC Napoli', sport: 'calcio', league: 'Serie A', country: 'Italia' },
    { id: 'roma', name: 'AS Roma', sport: 'calcio', league: 'Serie A', country: 'Italia' },
    { id: 'lazio', name: 'SS Lazio', sport: 'calcio', league: 'Serie A', country: 'Italia' },
    { id: 'barcelona', name: 'FC Barcelona', sport: 'calcio', league: 'La Liga', country: 'Spagna' },
    { id: 'real_madrid', name: 'Real Madrid', sport: 'calcio', league: 'La Liga', country: 'Spagna' },
    { id: 'liverpool', name: 'Liverpool FC', sport: 'calcio', league: 'Premier League', country: 'Inghilterra' },
    { id: 'man_city', name: 'Manchester City', sport: 'calcio', league: 'Premier League', country: 'Inghilterra' },
  ],
  basket: [
    { id: 'lakers', name: 'Los Angeles Lakers', sport: 'basket', league: 'NBA', country: 'USA' },
    { id: 'warriors', name: 'Golden State Warriors', sport: 'basket', league: 'NBA', country: 'USA' },
    { id: 'celtics', name: 'Boston Celtics', sport: 'basket', league: 'NBA', country: 'USA' },
    { id: 'heat', name: 'Miami Heat', sport: 'basket', league: 'NBA', country: 'USA' },
    { id: 'olimpia_milano', name: 'EA7 Emporio Armani Milano', sport: 'basket', league: 'Serie A', country: 'Italia' },
    { id: 'virtus_bologna', name: 'Virtus Segafredo Bologna', sport: 'basket', league: 'Serie A', country: 'Italia' },
  ],
  nfl: [
    { id: 'patriots', name: 'New England Patriots', sport: 'nfl', league: 'NFL', country: 'USA' },
    { id: 'cowboys', name: 'Dallas Cowboys', sport: 'nfl', league: 'NFL', country: 'USA' },
    { id: 'packers', name: 'Green Bay Packers', sport: 'nfl', league: 'NFL', country: 'USA' },
    { id: 'steelers', name: 'Pittsburgh Steelers', sport: 'nfl', league: 'NFL', country: 'USA' },
    { id: 'chiefs', name: 'Kansas City Chiefs', sport: 'nfl', league: 'NFL', country: 'USA' },
  ],
  f1: [
    { id: 'ferrari', name: 'Scuderia Ferrari', sport: 'f1', league: 'Formula 1', country: 'Italia' },
    { id: 'red_bull', name: 'Red Bull Racing', sport: 'f1', league: 'Formula 1', country: 'Austria' },
    { id: 'mercedes', name: 'Mercedes AMG F1', sport: 'f1', league: 'Formula 1', country: 'Germania' },
    { id: 'mclaren', name: 'McLaren F1 Team', sport: 'f1', league: 'Formula 1', country: 'Regno Unito' },
  ],
  tennis: [
    { id: 'sinner', name: 'Jannik Sinner', sport: 'tennis', league: 'ATP', country: 'Italia' },
    { id: 'berrettini', name: 'Matteo Berrettini', sport: 'tennis', league: 'ATP', country: 'Italia' },
    { id: 'djokovic', name: 'Novak Djokovic', sport: 'tennis', league: 'ATP', country: 'Serbia' },
    { id: 'nadal', name: 'Rafael Nadal', sport: 'tennis', league: 'ATP', country: 'Spagna' },
  ]
};

export const FavoriteTeamSelector = () => {
  const { user } = useAuth();
  const [selectedTeams, setSelectedTeams] = useState<Record<string, Team>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFavoriteTeams();
  }, [user]);

  const loadFavoriteTeams = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('favorite_team, preferred_sports')
        .eq('user_id', user.id)
        .single();
      
      if (data?.favorite_team) {
        // Parse the favorite team JSON if it exists
        const teams = typeof data.favorite_team === 'string' 
          ? JSON.parse(data.favorite_team) 
          : data.favorite_team;
        
        if (teams) {
          setSelectedTeams(teams);
        }
      }
    } catch (error) {
      console.error('Error loading favorite teams:', error);
    }
  };

  const saveFavoriteTeams = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ favorite_team: JSON.stringify(selectedTeams) })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Squadre del cuore aggiornate",
        description: "Le tue squadre preferite sono state salvate con successo"
      });
    } catch (error) {
      console.error('Error saving favorite teams:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le squadre preferite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTeam = (sport: string, team: Team) => {
    setSelectedTeams(prev => {
      const updated = { ...prev };
      if (updated[sport]?.id === team.id) {
        delete updated[sport];
      } else {
        updated[sport] = team;
      }
      return updated;
    });
  };

  const getFilteredTeams = (sport: string) => {
    const teams = POPULAR_TEAMS[sport] || [];
    if (!searchQuery) return teams;
    
    return teams.filter(team =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.league.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Squadre del Cuore
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca squadre, club o atleti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Teams Display */}
        {Object.keys(selectedTeams).length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Le tue squadre del cuore</Label>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(selectedTeams).map(([sport, team]) => (
                <div key={sport} className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{team.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {sport} • {team.league}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{team.country}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sport Tabs */}
        <Tabs defaultValue="calcio" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="calcio">Calcio</TabsTrigger>
            <TabsTrigger value="basket">Basket</TabsTrigger>
            <TabsTrigger value="nfl">NFL</TabsTrigger>
            <TabsTrigger value="f1">F1</TabsTrigger>
            <TabsTrigger value="tennis">Tennis</TabsTrigger>
          </TabsList>
          
          {Object.entries(POPULAR_TEAMS).map(([sport, teams]) => (
            <TabsContent key={sport} value={sport}>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {getFilteredTeams(sport).map((team) => {
                    const isSelected = selectedTeams[sport]?.id === team.id;
                    
                    return (
                      <div
                        key={team.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-primary/50 hover:bg-muted/50'
                        }`}
                        onClick={() => toggleTeam(sport, team)}
                      >
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{team.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {team.league} • {team.country}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Star className="h-5 w-5 text-primary fill-current" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        {/* Save Button */}
        <Button 
          onClick={saveFavoriteTeams} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Salvataggio...' : 'Salva Squadre del Cuore'}
        </Button>
      </CardContent>
    </Card>
  );
};