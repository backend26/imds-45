import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Monitor, Smartphone, Tablet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentPreviewProps {
  title: string;
  content: string;
  coverImage?: string;
  category?: string;
  excerpt?: string;
}

export const ContentPreview = ({ 
  title, 
  content, 
  coverImage, 
  category, 
  excerpt 
}: ContentPreviewProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Parse content to extract headers and format
  const parseContentForPreview = (htmlContent: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Extract headers for table of contents
    const headers = Array.from(tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map((header) => ({
        level: parseInt(header.tagName.charAt(1)),
        text: header.textContent || '',
        id: header.id || `heading-${Math.random().toString(36).substr(2, 9)}`
      }));

    return {
      headers,
      wordCount: tempDiv.textContent?.split(/\s+/).length || 0,
      readingTime: Math.ceil((tempDiv.textContent?.split(/\s+/).length || 0) / 200), // 200 words per minute
      formattedContent: htmlContent
    };
  };

  const previewData = parseContentForPreview(content);

  const deviceSizes = {
    desktop: 'w-full',
    tablet: 'w-[768px] mx-auto',
    mobile: 'w-[375px] mx-auto'
  };

  if (!isVisible) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="p-6 text-center">
          <Button
            variant="outline"
            onClick={() => setIsVisible(true)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Mostra Anteprima Articolo
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Visualizza come apparirà il tuo articolo una volta pubblicato
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Anteprima Articolo
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Device Preview Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('desktop')}
                className="rounded-r-none"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('tablet')}
                className="rounded-none"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
                className="rounded-l-none"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Article Stats */}
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>{previewData.wordCount} parole</span>
          <span>•</span>
          <span>{previewData.readingTime} min di lettura</span>
          {previewData.headers.length > 0 && (
            <>
              <span>•</span>
              <span>{previewData.headers.length} sezioni</span>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Preview Container */}
        <div className="overflow-x-auto">
          <div className={cn(
            "transition-all duration-300 border rounded-lg bg-background",
            deviceSizes[previewDevice]
          )}>
            <article className="p-6 max-w-none">
              {/* Cover Image */}
              {coverImage && (
                <div className="aspect-video w-full rounded-lg overflow-hidden mb-6">
                  <img 
                    src={coverImage} 
                    alt="Copertina articolo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Header */}
              <header className="mb-6">
                {category && (
                  <Badge variant="secondary" className="mb-3">
                    {category}
                  </Badge>
                )}
                <h1 className="text-3xl font-bold text-foreground mb-4 leading-tight">
                  {title || 'Titolo del tuo articolo'}
                </h1>
                {excerpt && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
                  <span>5 min fa</span>
                  <span>•</span>
                  <span>{previewData.readingTime} min di lettura</span>
                </div>
              </header>

              {/* Table of Contents (if headers exist) */}
              {previewData.headers.length > 0 && (
                <div className="mb-8 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-3 text-foreground">Contenuti dell'articolo</h3>
                  <ul className="space-y-1">
                    {previewData.headers.map((header, index) => (
                      <li key={index} className={cn(
                        "text-sm",
                        header.level === 1 && "font-semibold text-foreground",
                        header.level === 2 && "ml-3 text-foreground", 
                        header.level >= 3 && `ml-${header.level * 2} text-muted-foreground`
                      )}>
                        <span className="hover:text-primary cursor-pointer">
                          {header.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none dark:prose-invert
                           prose-headings:text-foreground prose-headings:font-bold
                           prose-h1:text-2xl prose-h1:mb-4
                           prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6
                           prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
                           prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
                           prose-strong:text-foreground prose-strong:font-semibold
                           prose-em:text-foreground
                           prose-blockquote:border-l-primary prose-blockquote:bg-muted/50
                           prose-code:bg-muted prose-code:text-primary prose-code:px-1 prose-code:rounded
                           prose-pre:bg-muted prose-pre:border
                           prose-ul:text-foreground prose-ol:text-foreground
                           prose-li:text-foreground prose-li:mb-1
                           prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: previewData.formattedContent || '<p class="text-muted-foreground italic">Inizia a scrivere per vedere l\'anteprima...</p>' }}
              />
            </article>
          </div>
        </div>

        {/* Preview Info */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Questa è un'anteprima di come apparirà il tuo articolo. Il design finale potrebbe variare leggermente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};