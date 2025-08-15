import { useState, useEffect } from 'react';
import { Plus, X, ExternalLink, Instagram, Twitter, Youtube, Facebook, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SocialLink {
  platform: string;
  username: string;
  url: string;
}

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', baseUrl: 'https://instagram.com/' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-blue-400', baseUrl: 'https://twitter.com/' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500', baseUrl: 'https://youtube.com/@' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', baseUrl: 'https://facebook.com/' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', baseUrl: 'https://linkedin.com/in/' },
];

export const SocialLinksManager = () => {
  const { user } = useAuth();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newLink, setNewLink] = useState({ platform: '', username: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSocialLinks();
  }, [user]);

  const loadSocialLinks = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('social_links')
        .eq('user_id', user.id)
        .single();
      
      if (data?.social_links) {
        const links = Object.entries(data.social_links as Record<string, string>).map(([platform, username]) => {
          const platformData = PLATFORMS.find(p => p.id === platform);
          return {
            platform,
            username: username as string,
            url: platformData ? `${platformData.baseUrl}${username}` : `https://${platform}.com/${username}`
          };
        });
        setSocialLinks(links);
      }
    } catch (error) {
      console.error('Error loading social links:', error);
    }
  };

  const saveSocialLinks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const socialLinksObj = socialLinks.reduce((acc, link) => {
        acc[link.platform] = link.username;
        return acc;
      }, {} as Record<string, string>);

      const { error } = await supabase
        .from('profiles')
        .update({ social_links: socialLinksObj })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Social media aggiornati",
        description: "I tuoi link social sono stati salvati con successo"
      });
    } catch (error) {
      console.error('Error saving social links:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare i link social",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSocialLink = () => {
    if (!newLink.platform || !newLink.username) {
      toast({
        title: "Campi richiesti",
        description: "Seleziona una piattaforma e inserisci il tuo username",
        variant: "destructive"
      });
      return;
    }

    if (socialLinks.some(link => link.platform === newLink.platform)) {
      toast({
        title: "Piattaforma esistente",
        description: "Hai già aggiunto questa piattaforma",
        variant: "destructive"
      });
      return;
    }

    const platformData = PLATFORMS.find(p => p.id === newLink.platform);
    if (!platformData) return;

    setSocialLinks(prev => [...prev, {
      platform: newLink.platform,
      username: newLink.username,
      url: `${platformData.baseUrl}${newLink.username}`
    }]);

    setNewLink({ platform: '', username: '' });
  };

  const removeSocialLink = (platform: string) => {
    setSocialLinks(prev => prev.filter(link => link.platform !== platform));
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Link Social Media
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Links */}
        {socialLinks.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">I tuoi profili social</Label>
            {socialLinks.map((link) => {
              const platform = PLATFORMS.find(p => p.id === link.platform);
              const Icon = platform?.icon || ExternalLink;
              
              return (
                <div key={link.platform} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${platform?.color || 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium">{platform?.name || link.platform}</p>
                      <p className="text-sm text-muted-foreground">@{link.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(link.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSocialLink(link.platform)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add New Link */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Aggiungi nuovo profilo social</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform">Piattaforma</Label>
              <Select
                value={newLink.platform}
                onValueChange={(value) => setNewLink(prev => ({ ...prev, platform: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona piattaforma" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS
                    .filter(platform => !socialLinks.some(link => link.platform === platform.id))
                    .map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <SelectItem key={platform.id} value={platform.id}>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${platform.color}`} />
                            {platform.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newLink.username}
                onChange={(e) => setNewLink(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Il tuo username"
              />
            </div>
          </div>
          <Button onClick={addSocialLink} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Profilo Social
          </Button>
        </div>

        {/* Preview */}
        {newLink.platform && newLink.username && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <Label className="text-sm font-medium mb-2 block">Anteprima link</Label>
            <div className="flex items-center gap-2">
              {(() => {
                const platform = PLATFORMS.find(p => p.id === newLink.platform);
                const Icon = platform?.icon || ExternalLink;
                const url = platform ? `${platform.baseUrl}${newLink.username}` : '';
                const isValid = validateUrl(url);
                
                return (
                  <>
                    <Icon className={`h-4 w-4 ${platform?.color || 'text-muted-foreground'}`} />
                    <span className={`text-sm ${isValid ? 'text-foreground' : 'text-destructive'}`}>
                      {url}
                    </span>
                    {isValid ? (
                      <Badge variant="secondary" className="text-xs">Valido</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">Non valido</Badge>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button 
          onClick={saveSocialLinks} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Salvataggio...' : 'Salva Modifiche'}
        </Button>
      </CardContent>
    </Card>
  );
};
