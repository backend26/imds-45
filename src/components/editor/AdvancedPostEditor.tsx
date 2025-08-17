import { useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';

const lowlight = createLowlight();
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Bold, 
  Italic, 
  Underline, 
  Code, 
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
  Save,
  Eye,
  Send,
  Calendar,
  Tag,
  Settings,
  Upload,
  X
} from 'lucide-react';

interface AdvancedPostEditorProps {
  initialContent?: string;
  initialTitle?: string;
  initialCoverImage?: string;
  initialTags?: string[];
  postId?: string;
  onSave?: (data: any) => void;
  onPublish?: (data: any) => void;
}

export const AdvancedPostEditor = ({
  initialContent = '',
  initialTitle = '',
  initialCoverImage = '',
  initialTags = [],
  postId,
  onSave,
  onPublish
}: AdvancedPostEditorProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialTitle);
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('calcio');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200 dark:bg-yellow-900 px-1 rounded',
        },
      }),
      
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-muted p-4 rounded-lg font-mono text-sm',
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    if (!user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `post-image-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('post-media')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('post-media')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Errore upload",
        description: "Impossibile caricare l'immagine",
        variant: "destructive"
      });
      return null;
    }
  }, [user]);

  const insertImage = useCallback(async () => {
    if (!fileInputRef.current) return;
    
    fileInputRef.current.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const imageUrl = await handleImageUpload(file);
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
  }, [editor, handleImageUpload]);

  const handleCoverImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = await handleImageUpload(file);
    if (imageUrl) {
      setCoverImage(imageUrl);
    }
  }, [handleImageUpload]);

  const addTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  }, [newTag, tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const saveDraft = useCallback(async () => {
    if (!user || !editor) return;

    setLoading(true);
    try {
      const content = editor.getHTML();
      const postData = {
        title: title.trim(),
        content,
        cover_images: coverImage ? [coverImage] : [],
        tags,
        status: 'draft',
        author_id: user.id,
        category_id: '00000000-0000-0000-0000-000000000000',
        updated_at: new Date().toISOString()
      };

      if (postId) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([postData]);
        
        if (error) throw error;
      }

      toast({
        title: "Bozza salvata",
        description: "La tua bozza è stata salvata con successo"
      });

      onSave?.(postData);
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la bozza",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, editor, title, coverImage, tags, postId, onSave]);

  const publishPost = useCallback(async () => {
    if (!user || !editor || !title.trim()) {
      toast({
        title: "Campi obbligatori",
        description: "Titolo e contenuto sono obbligatori",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const content = editor.getHTML();
      const postData = {
        title: title.trim(),
        content,
        cover_images: coverImage ? [coverImage] : [],
        tags,
        status: 'published',
        published_at: new Date().toISOString(),
        author_id: user.id,
        category_id: '00000000-0000-0000-0000-000000000000',
        updated_at: new Date().toISOString()
      };

      if (postId) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', postId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([postData]);
        
        if (error) throw error;
      }

      toast({
        title: "Articolo pubblicato",
        description: "Il tuo articolo è stato pubblicato con successo"
      });

      onPublish?.(postData);
    } catch (error: any) {
      console.error('Error publishing post:', error);
      toast({
        title: "Errore",
        description: "Impossibile pubblicare l'articolo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, editor, title, coverImage, tags, postId, onPublish]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Caricamento editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Editor Avanzato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Titolo *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Inserisci il titolo dell'articolo..."
              className="text-lg font-medium"
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Immagine di copertina</Label>
            {coverImage ? (
              <div className="relative">
                <img 
                  src={coverImage} 
                  alt="Cover" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setCoverImage('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">Carica immagine di copertina</p>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('cover-upload')?.click()}
                >
                  Seleziona immagine
                </Button>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tag</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Aggiungi tag..."
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1"
              />
              <Button onClick={addTag} size="sm">
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X 
                      className="h-3 w-3 ml-1"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contenuto</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={isPreview ? "outline" : "default"}
                size="sm"
                onClick={() => setIsPreview(false)}
              >
                Editor
              </Button>
              <Button
                variant={isPreview ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPreview(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Anteprima
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isPreview && (
            <>
              {/* Toolbar */}
              <div className="border-b border-border mb-4 pb-4">
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-muted' : ''}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-muted' : ''}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={editor.isActive('code') ? 'bg-muted' : ''}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-muted' : ''}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'bg-muted' : ''}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive('blockquote') ? 'bg-muted' : ''}
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={insertImage}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  
                  <Separator orientation="vertical" className="h-6" />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <EditorContent editor={editor} />
            </>
          )}
          
          {isPreview && (
            <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto">
              <h1>{title || 'Titolo dell\'articolo'}</h1>
              {coverImage && (
                <img src={coverImage} alt="Cover" className="w-full rounded-lg" />
              )}
              <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={saveDraft}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Salva bozza
              </Button>
            </div>
            
            <Button
              onClick={publishPost}
              disabled={loading || !title.trim()}
              className="bg-gradient-primary hover:bg-gradient-primary/90"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Pubblicazione...' : 'Pubblica'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};