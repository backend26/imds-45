import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, ExternalLink, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SocialLinksManagerProps {
  socialLinks: Record<string, string>;
  onChange: (links: Record<string, string>) => void;
}

const socialPlatforms = [
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'youtube', label: 'YouTube', icon: '🎥' },
  { value: 'twitch', label: 'Twitch', icon: '🎮' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'website', label: 'Sito Web', icon: '🌐' }
];

export const SocialLinksManager = ({ socialLinks, onChange }: SocialLinksManagerProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState('');

  const addLink = () => {
    if (!selectedPlatform || !linkUrl.trim()) return;

    const updated = { ...socialLinks };
    updated[selectedPlatform] = linkUrl.trim();
    onChange(updated);
    
    setLinkUrl('');
    setSelectedPlatform('');
  };

  const removeLink = (platform: string) => {
    const updated = { ...socialLinks };
    delete updated[platform];
    onChange(updated);
  };

  const availablePlatforms = socialPlatforms.filter(
    platform => !socialLinks[platform.value]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Link Social
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new link */}
        {availablePlatforms.length > 0 && (
          <div className="flex gap-2">
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Piattaforma" />
              </SelectTrigger>
              <SelectContent>
                {availablePlatforms.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    <span className="flex items-center gap-2">
                      <span>{platform.icon}</span>
                      {platform.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLink()}
              className="flex-1"
              type="url"
            />
            
            <Button onClick={addLink} disabled={!selectedPlatform || !linkUrl.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Current links */}
        <div className="space-y-3">
          {Object.entries(socialLinks).map(([platform, url]) => {
            const platformInfo = socialPlatforms.find(p => p.value === platform);
            return (
              <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {platformInfo?.icon || '🔗'}
                  </span>
                  <div>
                    <p className="font-medium">
                      {platformInfo?.label || platform}
                    </p>
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary truncate max-w-xs block"
                    >
                      {url}
                    </a>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink(platform)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {Object.keys(socialLinks).length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            Nessun link social aggiunto
          </p>
        )}

        {availablePlatforms.length === 0 && Object.keys(socialLinks).length > 0 && (
          <p className="text-muted-foreground text-sm">
            Hai aggiunto tutti i link social disponibili
          </p>
        )}
      </CardContent>
    </Card>
  );
};