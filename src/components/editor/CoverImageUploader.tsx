import React, { useCallback, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoverImageUploaderProps {
  images: string;
  onChange: (images: string) => void;
}

export const CoverImageUploader: React.FC<CoverImageUploaderProps> = ({ images, onChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadImage = useCallback(async (file: File) => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to post-media bucket
      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('post-media')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading cover image:', error);
      throw error;
    }
  }, [user]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);

    try {
      // Only upload first file (single image)
      const imageUrl = await uploadImage(files[0]);
      
      if (imageUrl) {
        onChange(imageUrl);
        toast({
          title: "Successo",
          description: "Immagine di copertina caricata",
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Errore di caricamento",
        description: "Impossibile caricare l'immagine di copertina",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [onChange, uploadImage, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const removeImage = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          uploading && "pointer-events-none opacity-50"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => document.getElementById('cover-image-upload')?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground mb-4" />
          )}
          <p className="text-sm text-muted-foreground mb-2">
            {uploading ? 'Caricamento immagine...' : 'Trascina qui l\'immagine di copertina o clicca per caricare'}
          </p>
          <p className="text-xs text-muted-foreground">
            Supporta JPG, PNG, WebP (max 10MB)
          </p>
          <input
            id="cover-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Current Cover Image */}
      {images && (
        <div className="relative group">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video relative">
                <img
                  src={images}
                  alt="Immagine di copertina"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};