import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2, Camera, Crop } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Props {
  currentImageUrl?: string;
  onImageUpdate: (imageUrl: string | null) => void;
  disabled?: boolean;
}

// Banner di default con gradiente elegante
const DEFAULT_BANNER = "/assets/images/default-banner.jpg";

export const EnhancedBannerUploader = ({ currentImageUrl, onImageUpdate, disabled }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayImage = currentImageUrl || DEFAULT_BANNER;

  const uploadImage = useCallback(async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      // Validazione file
      if (!file.type.startsWith('image/')) {
        throw new Error('Seleziona un file immagine valido');
      }

      // Dimensione massima 15MB per banner
      if (file.size > 15 * 1024 * 1024) {
        throw new Error('File troppo grande. Massimo 15MB');
      }

      // Compressione automatica se necessario
      let processedFile = file;
      if (file.size > 2 * 1024 * 1024) {
        processedFile = await compressImage(file);
      }

      // Nome file unico con path utente
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `banner-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, processedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(data.path);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ banner_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onImageUpdate(publicUrl);
      setPreviewImage(null);
      
      toast({
        title: "Banner aggiornato",
        description: "Il tuo banner è stato caricato con successo"
      });

    } catch (error: any) {
      console.error('Error uploading banner:', error);
      toast({
        title: "Errore upload", 
        description: error.message || "Impossibile caricare l'immagine",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [user, onImageUpdate, toast]);

  const compressImage = useCallback((file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Dimensioni ottimali per banner: 1200x400
        const targetWidth = 1200;
        const targetHeight = 400;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Draw e compressione
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.85);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    
    const file = files[0];
    
    // Preview immediato
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    
    // Upload
    await uploadImage(file);
  }, [uploadImage]);

  const removeImage = useCallback(async () => {
    if (!user) return;

    setUploading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ banner_url: null })
        .eq('user_id', user.id);

      if (error) throw error;

      onImageUpdate(null);
      setPreviewImage(null);
      
      toast({
        title: "Banner rimosso",
        description: "Banner ripristinato a quello di default"
      });

    } catch (error: any) {
      console.error('Error removing banner:', error);
      toast({
        title: "Errore",
        description: "Impossibile rimuovere il banner",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [user, onImageUpdate, toast]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Banner Preview */}
      <div className="relative overflow-hidden rounded-lg group">
        <div className="aspect-[3/1] w-full">
          <img
            src={previewImage || displayImage}
            alt="Banner profile"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Overlay con controlli */}
          <div className={cn(
            "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2",
            uploading && "opacity-100"
          )}>
            {uploading ? (
              <div className="flex items-center gap-2 text-white">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm font-medium">Caricamento...</span>
              </div>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Cambia
                </Button>
                {currentImageUrl && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={removeImage}
                    disabled={disabled}
                    className="bg-red-500/20 backdrop-blur-sm text-white border-red-300/30 hover:bg-red-500/30"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rimuovi
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          dragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          uploading && "pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-6 text-center space-y-3">
          <div className={cn(
            "mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center transition-colors",
            dragOver && "bg-primary/20"
          )}>
            <Upload className={cn(
              "h-6 w-6 transition-colors",
              dragOver ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {dragOver ? "Rilascia per caricare" : "Carica un nuovo banner"}
            </p>
            <p className="text-xs text-muted-foreground">
              Trascina qui un'immagine o clicca per selezionare
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WebP • Max 15MB • Dimensioni consigliate: 1200x400px
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Input nascosto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Info aggiuntive */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>💡 <span className="font-medium">Suggerimenti:</span></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Usa immagini in formato orizzontale per risultati migliori</li>
          <li>Il banner verrà automaticamente ottimizzato per le prestazioni</li>
          <li>Senza banner personalizzato, verrà mostrato quello di default</li>
        </ul>
      </div>
    </div>
  );
};