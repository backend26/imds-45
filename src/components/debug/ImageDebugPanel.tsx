import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageUrlProcessor } from '@/utils/imageUrlProcessor';
import { useCacheInvalidation } from '@/hooks/use-cache-invalidation';
import { RefreshCw, Bug, Trash2 } from 'lucide-react';

interface ImageDebugPanelProps {
  posts?: any[];
  visible?: boolean;
}

export const ImageDebugPanel: React.FC<ImageDebugPanelProps> = ({ 
  posts = [], 
  visible = import.meta.env.DEV 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { clearAllCaches, invalidatePosts } = useCacheInvalidation();

  if (!visible) return null;

  const analyzeImageUrls = () => {
    return posts.slice(0, 5).map(post => {
      const rawCoverImages = post.cover_images;
      const result = ImageUrlProcessor.process(rawCoverImages);
      
      return {
        postId: post.id,
        title: post.title?.substring(0, 30) + '...',
        rawCoverImages,
        extractedUrl: result.originalInput,
        finalUrl: result.url,
        hasError: !result.isValid,
        isEmpty: result.source === 'fallback'
      };
    });
  };

  const imageAnalysis = analyzeImageUrls();
  const errorCount = imageAnalysis.filter(img => img.hasError).length;
  const emptyCount = imageAnalysis.filter(img => img.isEmpty).length;

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className={`bg-background/90 backdrop-blur-sm ${
            errorCount > 0 ? 'border-destructive text-destructive' : ''
          }`}
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug Images
          {errorCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {errorCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-hidden">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Image Debug Panel</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={invalidatePosts}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                onClick={clearAllCaches}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
          <div className="flex gap-2 text-xs">
            <Badge variant={errorCount > 0 ? "destructive" : "secondary"}>
              Errors: {errorCount}
            </Badge>
            <Badge variant={emptyCount > 0 ? "secondary" : "default"}>
              Empty: {emptyCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 max-h-64 overflow-y-auto">
          <div className="space-y-2 text-xs">
            {imageAnalysis.map((img, idx) => (
              <div 
                key={idx}
                className={`p-2 rounded border ${
                  img.hasError ? 'border-destructive/50 bg-destructive/5' : 
                  img.isEmpty ? 'border-yellow-500/50 bg-yellow-500/5' : 
                  'border-border'
                }`}
              >
                <div className="font-medium truncate">{img.title}</div>
                <div className="mt-1 space-y-1">
                  <div>
                    <span className="text-muted-foreground">Raw:</span>
                    <div className="font-mono text-[10px] truncate">
                      {typeof img.rawCoverImages === 'string' 
                        ? img.rawCoverImages.substring(0, 50) + '...'
                        : JSON.stringify(img.rawCoverImages).substring(0, 50) + '...'
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Final:</span>
                    <div className="font-mono text-[10px] truncate">
                      {img.finalUrl.substring(0, 50) + '...'}
                    </div>
                  </div>
                  {img.hasError && (
                    <Badge variant="destructive" className="text-[10px]">
                      BRACKETS DETECTED
                    </Badge>
                  )}
                  {img.isEmpty && (
                    <Badge variant="secondary" className="text-[10px]">
                      FALLBACK USED
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};