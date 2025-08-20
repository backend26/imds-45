import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EnhancedBirthdateSelectorProps {
  profile: any;
  onUpdate: () => void;
}

export const EnhancedBirthdateSelector = ({ profile, onUpdate }: EnhancedBirthdateSelectorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    profile?.birth_date ? new Date(profile.birth_date) : undefined
  );
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.privacy_settings) {
      setIsPublic(profile.privacy_settings.birth_date !== false);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const updates: any = {
        birth_date: birthDate?.toISOString().split('T')[0] || null,
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

  const calculateAge = (date: Date) => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Data di Nascita
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Seleziona la tua data di nascita</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal mt-2",
                    !birthDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthDate ? (
                    <div className="flex items-center gap-2">
                      <span>{format(birthDate, "dd MMMM yyyy", { locale: it })}</span>
                      <span className="text-muted-foreground text-sm">
                        ({calculateAge(birthDate)} anni)
                      </span>
                    </div>
                  ) : (
                    <span>Seleziona una data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={setBirthDate}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  captionLayout="dropdown"
                  fromYear={1930}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <Label className="text-sm font-medium">
                  Visibilità pubblica
                </Label>
                <p className="text-xs text-muted-foreground">
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

          {birthDate && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Anteprima:</strong> {calculateAge(birthDate)} anni
                {isPublic ? ' (visibile nel profilo)' : ' (privato)'}
              </p>
            </div>
          )}
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Salvataggio...' : 'Salva Modifiche'}
        </Button>
      </CardContent>
    </Card>
  );
};