import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Upload, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AvatarEditorProps {
  imageUrl?: string;
  onClose: () => void;
  onAvatarUpdated?: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc: string, pixelCrop: CropArea): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Cannot get canvas context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      }
    }, 'image/jpeg', 0.95);
  });
};

export const AvatarEditor = ({ imageUrl, onClose, onAvatarUpdated }: AvatarEditorProps) => {
  const [imageSrc, setImageSrc] = useState(imageUrl || '');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          setImageSrc(reader.result);
        }
      });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return;

    setIsUploading(true);
    try {
      // Crop l'immagine
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      // Genera un nome file unico
      const fileName = `avatar-${user.id}-${Date.now()}.jpg`;
      
      // Upload su Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedImageBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Errore upload: ${uploadError.message}`);
      }

      // Ottieni l'URL pubblico
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Aggiorna sia i metadati dell'utente che il profilo
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          profile_picture_url: urlData.publicUrl
        }
      });

      if (updateError) {
        throw new Error(`Errore aggiornamento profilo: ${updateError.message}`);
      }

      toast({
        title: "Avatar aggiornato",
        description: "La tua immagine profilo è stata aggiornata con successo",
      });

      onAvatarUpdated?.();
      onClose();
    } catch (error) {
      console.error('Errore salvataggio avatar:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'avatar. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!imageSrc ? (
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Clicca per caricare un'immagine
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                JPG, PNG fino a 5MB
              </p>
            </div>
          ) : (
            <div>
              <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium">Zoom</label>
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {imageSrc ? 'Cambia' : 'Carica'}
            </Button>
            
            {imageSrc && (
              <Button 
                className="flex-1" 
                onClick={handleSave}
                disabled={isUploading || !croppedAreaPixels}
              >
                <Save className="h-4 w-4 mr-2" />
                {isUploading ? 'Salvando...' : 'Salva'}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};