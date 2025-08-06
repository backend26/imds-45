import React, { useCallback, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoverImage {
  id: string;
  original_url: string;
  thumbnail_url?: string;
  alt_text?: string;
}

interface CoverImageUploaderProps {
  images: CoverImage[];
  onChange: (images: CoverImage[]) => void;
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

      // Upload to cover-images bucket
      const { error: uploadError } = await supabase.storage
        .from('cover-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('cover-images')
        .getPublicUrl(filePath);

      // TODO: In a real implementation, you'd call an edge function here
      // to generate thumbnails. For now, we'll use the original image as thumbnail
      const coverImage: CoverImage = {
        id: fileName,
        original_url: data.publicUrl,
        thumbnail_url: data.publicUrl,
        alt_text: file.name,
      };

      return coverImage;
    } catch (error) {
      console.error('Error uploading cover image:', error);
      throw error;
    }
  }, [user]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(uploadImage);
      const uploadedImages = await Promise.all(uploadPromises);
      const validImages = uploadedImages.filter(Boolean) as CoverImage[];
      
      onChange([...images, ...validImages]);
      
      toast({
        title: "Success",
        description: `Uploaded ${validImages.length} cover image(s)`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload cover images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [images, onChange, uploadImage, toast]);

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

  const removeImage = useCallback((imageId: string) => {
    onChange(images.filter(img => img.id !== imageId));
  }, [images, onChange]);

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
            {uploading ? 'Uploading images...' : 'Drop cover images here or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports JPG, PNG, WebP (max 10MB each)
          </p>
          <input
            id="cover-image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video relative">
                    <img
                      src={image.thumbnail_url || image.original_url}
                      alt={image.alt_text || 'Cover image'}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};