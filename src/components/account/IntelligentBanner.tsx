import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getCachedColors, ExtractedColors } from '@/utils/colorExtractor';

interface Props {
  currentImageUrl?: string;
  profileImageUrl?: string;
  onImageUpdate: (imageUrl: string | null) => void;
  height?: number;
  disabled?: boolean;
}

export const IntelligentBanner = ({ 
  currentImageUrl, 
  profileImageUrl, 
  onImageUpdate, 
  height = 80,
  disabled 
}: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [colors, setColors] = useState<ExtractedColors | null>(null);
  const [useProfileColors, setUseProfileColors] = useState(false);

  // Extract colors from profile image when available
  useEffect(() => {
    const extractColors = async () => {
      if (profileImageUrl && !currentImageUrl) {
        try {
          const extractedColors = await getCachedColors(profileImageUrl);
          setColors(extractedColors);
          setUseProfileColors(true);
        } catch (error) {
          console.warn('Failed to extract colors:', error);
        }
      }
    };

    extractColors();
  }, [profileImageUrl, currentImageUrl]);

  const uploadImage = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Seleziona un file immagine valido');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File troppo grande. Massimo 10MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(data.path);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ banner_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onImageUpdate(publicUrl);
      setUseProfileColors(false);
      toast({
        title: "Banner aggiornato",
        description: "Il banner è stato caricato con successo"
      });

    } catch (error: any) {
      toast({
        title: "Errore upload", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (!user) return;

    setUploading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ banner_url: null })
        .eq('user_id', user.id);

      if (error) throw error;

      onImageUpdate(null);
      setUseProfileColors(true);
      toast({
        title: "Banner rimosso",
        description: "Ora viene usato il banner intelligente"
      });

    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile rimuovere il banner",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getBannerStyle = () => {
    if (currentImageUrl) {
      return {
        backgroundImage: `url(${currentImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: `${height}px`
      };
    }

    if (colors && useProfileColors) {
      return {
        background: colors.gradient,
        height: `${height}px`
      };
    }

    // Default gradient
    return {
      background: 'linear-gradient(135deg, hsl(355 100% 60%), hsl(355 100% 45%))',
      height: `${height}px`
    };
  };

  return (
    <div className="relative">
      {/* Banner */}
      <div 
        className="w-full rounded-t-lg overflow-hidden relative group"
        style={getBannerStyle()}
      >
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          </div>
        )}

        {/* Overlay controls - show on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
              className="hidden"
              id="banner-upload"
              disabled={disabled || uploading}
            />
            <Button
              size="sm"
              variant="secondary"
              asChild
              disabled={disabled || uploading}
              className="bg-white/90 hover:bg-white text-black"
            >
              <label htmlFor="banner-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Carica
              </label>
            </Button>
            
            {currentImageUrl && (
              <Button
                size="sm"
                variant="secondary"
                onClick={removeImage}
                disabled={disabled || uploading}
                className="bg-white/90 hover:bg-white text-black"
              >
                <X className="h-4 w-4 mr-2" />
                Rimuovi
              </Button>
            )}

            {!currentImageUrl && colors && (
              <Button
                size="sm"
                variant="secondary"
                disabled
                className="bg-white/90 text-black"
              >
                <Palette className="h-4 w-4 mr-2" />
                Smart
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info text */}
      {!currentImageUrl && useProfileColors && colors && (
        <div className="absolute top-2 left-2">
          <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Palette className="h-3 w-3" />
            Colori dalla foto profilo
          </div>
        </div>
      )}
    </div>
  );
};