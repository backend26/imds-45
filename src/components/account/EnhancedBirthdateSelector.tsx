import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarIcon, Eye, EyeOff, Cake, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EnhancedBirthdateSelectorProps {
  profile: any;
  onUpdate: () => void;
}

const MONTHS = [
  { value: 1, label: "Gennaio" },
  { value: 2, label: "Febbraio" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Aprile" },
  { value: 5, label: "Maggio" },
  { value: 6, label: "Giugno" },
  { value: 7, label: "Luglio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Settembre" },
  { value: 10, label: "Ottobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Dicembre" }
];

export const EnhancedBirthdateSelector = ({ profile, onUpdate }: EnhancedBirthdateSelectorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  // Initialize from profile data
  useEffect(() => {
    if (profile?.birth_date) {
      const birthDate = new Date(profile.birth_date);
      setSelectedDay(birthDate.getDate());
      setSelectedMonth(birthDate.getMonth() + 1);
      setSelectedYear(birthDate.getFullYear());
    }
    
    if (profile?.privacy_settings) {
      setIsPublic(profile.privacy_settings.birth_date !== false);
    }
  }, [profile]);

  const calculateAge = () => {
    if (!selectedDay || !selectedMonth || !selectedYear) return null;
    
    const today = new Date();
    const birthDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const isValidDate = () => {
    if (!selectedDay || !selectedMonth || !selectedYear) return false;
    
    const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
    const today = new Date();
    const minDate = new Date(1900, 0, 1);
    
    return date <= today && date >= minDate && 
           date.getDate() === selectedDay &&
           date.getMonth() === selectedMonth - 1 &&
           date.getFullYear() === selectedYear;
  };

  const getDaysInMonth = () => {
    if (!selectedMonth || !selectedYear) return 31;
    return new Date(selectedYear, selectedMonth, 0).getDate();
  };

  const handleSave = async () => {
    if (!user || loading || !isValidDate()) return;

    setLoading(true);
    try {
      const birthDate = selectedDay && selectedMonth && selectedYear
        ? new Date(selectedYear, selectedMonth - 1, selectedDay).toISOString().split('T')[0]
        : null;

      const updates = {
        birth_date: birthDate,
        privacy_settings: {
          ...profile?.privacy_settings,
          birth_date: isPublic
        },
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Data di nascita aggiornata",
        description: "Le modifiche sono state salvate con successo"
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating birth date:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la data di nascita",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const age = calculateAge();
  const isComplete = selectedDay && selectedMonth && selectedYear && isValidDate();

  return (
    <Card className="border border-border/50">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cake className="h-5 w-5 text-primary" />
          Data di Nascita
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Date Selectors */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-foreground">
            Seleziona la tua data di nascita
          </Label>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Day Selector */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Giorno</Label>
              <Select value={selectedDay?.toString() || ""} onValueChange={(value) => setSelectedDay(parseInt(value))}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="GG" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {Array.from({ length: getDaysInMonth() }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      {day.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Selector */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Mese</Label>
              <Select value={selectedMonth?.toString() || ""} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Mese" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Selector */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Anno</Label>
              <Select value={selectedYear?.toString() || ""} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="AAAA" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {Array.from({ length: new Date().getFullYear() - 1930 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Age Display */}
          {isComplete && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Hai {age} anni
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Settings */}
        <div className="space-y-4">
          <Separator />
          
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <Label className="text-sm font-medium">
                  Visibilità pubblica
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {isPublic 
                    ? "La tua età sarà visibile nel profilo pubblico" 
                    : "La tua data di nascita sarà privata"
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
        </div>

        {/* Preview */}
        {isComplete && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Anteprima profilo</h4>
            <div className="text-sm text-muted-foreground">
              <strong>Età:</strong> {age} anni
              {isPublic ? ' (visibile)' : ' (privata)'}
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={loading || !isComplete}
          className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          {loading ? 'Salvataggio...' : 'Salva Data di Nascita'}
        </Button>
      </CardContent>
    </Card>
  );
};