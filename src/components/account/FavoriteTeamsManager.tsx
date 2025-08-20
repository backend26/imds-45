import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Trophy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FavoriteTeamsManagerProps {
  favoriteTeams: Record<string, string[]>;
  onChange: (teams: Record<string, string[]>) => void;
}

const sports = [
  { value: 'calcio', label: 'Calcio' },
  { value: 'basket', label: 'Basket' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'f1', label: 'Formula 1' },
  { value: 'nfl', label: 'NFL' }
];

export const FavoriteTeamsManager = ({ favoriteTeams, onChange }: FavoriteTeamsManagerProps) => {
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [teamName, setTeamName] = useState('');

  const addTeam = () => {
    if (!selectedSport || !teamName.trim()) return;

    const updated = { ...favoriteTeams };
    if (!updated[selectedSport]) {
      updated[selectedSport] = [];
    }
    
    if (!updated[selectedSport].includes(teamName.trim())) {
      updated[selectedSport] = [...updated[selectedSport], teamName.trim()];
      onChange(updated);
    }
    
    setTeamName('');
  };

  const removeTeam = (sport: string, teamToRemove: string) => {
    const updated = { ...favoriteTeams };
    updated[sport] = updated[sport].filter(team => team !== teamToRemove);
    
    if (updated[sport].length === 0) {
      delete updated[sport];
    }
    
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Squadre del Cuore
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new team */}
        <div className="flex gap-2">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sport" />
            </SelectTrigger>
            <SelectContent>
              {sports.map((sport) => (
                <SelectItem key={sport.value} value={sport.value}>
                  {sport.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            placeholder="Nome squadra"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTeam()}
            className="flex-1"
          />
          
          <Button onClick={addTeam} disabled={!selectedSport || !teamName.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Current teams by sport */}
        <div className="space-y-4">
          {Object.entries(favoriteTeams).map(([sport, teams]) => (
            <div key={sport} className="space-y-2">
              <h4 className="font-medium capitalize">
                {sports.find(s => s.value === sport)?.label || sport}
              </h4>
              <div className="flex flex-wrap gap-2">
                {teams.map((team, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    {team}
                    <button
                      onClick={() => removeTeam(sport, team)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(favoriteTeams).length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            Nessuna squadra del cuore aggiunta
          </p>
        )}
      </CardContent>
    </Card>
  );
};