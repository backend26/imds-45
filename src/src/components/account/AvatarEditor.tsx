import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AvatarEditorProps {
  imageUrl?: string;
  onClose: () => void;
  onAvatarUpdated?: () => void;
}

export const AvatarEditor = ({ imageUrl, onClose, onAvatarUpdated }: AvatarEditorProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File troppo grande",
          description: "L'immagine deve essere inferiore a 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
        }
      });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    try {
      // Generate unique filename
      const fileName = `avatar-${user.id}-${Date.now()}.${selectedFile.name.split('.').pop()}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedFile, {
          contentType: selectedFile.type,
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user metadata and profile
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          profile_picture_url: urlData.publicUrl
        }
      });

      if (updateError) {
        throw new Error(`Profile update error: ${updateError.message}`);
      }

      toast({
        title: "Avatar aggiornato",
        description: "La tua immagine profilo è stata aggiornata con successo",
      });

      onAvatarUpdated?.();
      onClose();
    } catch (error) {
      console.error('Avatar save error:', error);
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
          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <div className="space-y-4">
                <img 
                  src={previewUrl} 
                  alt="Avatar preview" 
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-border"
                />
                <p className="text-sm text-muted-foreground">
                  Clicca per cambiare immagine
                </p>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Clicca per caricare un'immagine
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  JPG, PNG fino a 5MB
                </p>
              </>
            )}
          </div>

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
              {previewUrl ? 'Cambia' : 'Carica'}
            </Button>
            
            {selectedFile && (
              <Button 
                className="flex-1" 
                onClick={handleSave}
                disabled={isUploading}
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