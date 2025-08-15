import React, { useState, useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { createLowlight } from 'lowlight';
import { AdvancedEditorToolbar } from './AdvancedEditorToolbar';
import { AlertBox } from './extensions/AlertBox';
import { CallToAction } from './extensions/CallToAction';
import { PostSettingsSidebar } from './PostSettingsSidebar';
import { CoverImageUploader } from './CoverImageUploader';
import { ContentModerationAlert } from './ContentModerationAlert';
import { PublishSuccessModal } from './PublishSuccessModal';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import DOMPurify from 'dompurify';
import type { Database } from '@/integrations/supabase/types';

type Post = Database['public']['Tables']['posts']['Row'];

interface AdvancedEditorProps {
  initialPost?: Post | null;
}

export const AdvancedEditor: React.FC<AdvancedEditorProps> = ({ initialPost }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Stato form
  const [title, setTitle] = useState(initialPost?.title || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [categoryId, setCategoryId] = useState<string>(initialPost?.category_id || '');
  const [tags, setTags] = useState<string[]>(initialPost?.tags || []);
  const [commentsEnabled, setCommentsEnabled] = useState((initialPost as any)?.comments_enabled ?? true);
  const [coAuthoringEnabled, setCoAuthoringEnabled] = useState((initialPost as any)?.co_authoring_enabled ?? false);
  const [coverImages, setCoverImages] = useState<any[]>((initialPost as any)?.cover_images || []);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(
    (initialPost as any)?.status as 'draft' | 'published' | 'archived' || 'draft'
  );
  const [isHero, setIsHero] = useState<boolean>((initialPost as any)?.is_hero ?? false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedPost, setPublishedPost] = useState<{ id: string; title: string } | null>(null);

  const lowlight = useMemo(() => createLowlight(), []);

  const rawExtensions = useMemo(() => ([
    StarterKit.configure({
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
      underline: false, // Disabilita underline di default
      link: false,      // Disabilita link di default
    }),
    Underline,
    TextStyle,
    Color,
    FontFamily,
    Highlight.configure({ multicolor: true }),
    CodeBlockLowlight.configure({
      lowlight,
      HTMLAttributes: {
        class: 'bg-muted rounded-lg p-4 my-4 text-sm font-mono overflow-x-auto',
      },
    }),
    Blockquote.configure({
      HTMLAttributes: {
        class: 'border-l-4 border-primary pl-4 my-4 italic text-muted-foreground',
      },
    }),
    HorizontalRule.configure({
      HTMLAttributes: { class: 'my-6 border-border' },
    }),
    Superscript,
    Subscript,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary underline cursor-pointer hover:text-primary/80',
      },
    }),
    Image.configure({
      HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-4' },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Youtube.configure({
      controls: false,
      nocookie: true,
      modestBranding: true,
      HTMLAttributes: { class: 'rounded-lg my-4' },
    }),
    AlertBox,
    CallToAction,
  ]), [lowlight]);

  // Filtro per rimuovere estensioni duplicate
  const extensions = useMemo(() => {
    const seen = new Set<string>();
    return rawExtensions.filter((ext: any) => {
      const name = (ext as any)?.name;
      if (!name) return true;
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [rawExtensions]);

  const editor = useEditor({
    extensions,
    content: initialPost?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    if (!user) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('post-media').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Errore di caricamento",
        description: "Impossibile caricare l’immagine",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  const resetEditor = () => {
    setTitle('');
    setExcerpt('');
    setCategoryId('');
    setTags([]);
    setCoverImages([]);
    setCommentsEnabled(true);
    setCoAuthoringEnabled(false);
    setIsHero(false);
    setStatus('draft');
    editor?.commands.clearContent();
  };

  const handleSave = async (publishStatus: 'draft' | 'published') => {
    if (!user || !editor) return;
    if (!title.trim()) {
      toast({ title: "Errore di validazione", description: "Il titolo è obbligatorio", variant: "destructive" });
      return;
    }
    if (!editor.getText().trim()) {
      toast({ title: "Errore di validazione", description: "Il contenuto non può essere vuoto", variant: "destructive" });
      return;
    }
    if (!categoryId) {
      toast({ title: "Errore di validazione", description: "Seleziona una categoria", variant: "destructive" });
      return;
    }

    const isPublishAction = publishStatus === 'published';
    if (isPublishAction) {
      setPublishing(true);
    } else {
      setSaving(true);
    }

    try {
      const sanitizedContent = DOMPurify.sanitize(editor.getHTML());
      const baseData = {
        title: title.trim(),
        content: sanitizedContent,
        excerpt: excerpt.trim(),
        author_id: user.id,
        category_id: categoryId,
        tags,
        cover_images: coverImages,
        comments_enabled: commentsEnabled,
        co_authoring_enabled: coAuthoringEnabled,
        is_hero: isHero,
        status: publishStatus,
        updated_at: new Date().toISOString(),
      } as any;
      
      const dataWithPublish = publishStatus === 'published'
        ? { ...baseData, published_at: new Date().toISOString() }
        : baseData;
        
      const result = initialPost
        ? await supabase.from('posts').update(dataWithPublish).eq('id', initialPost.id).select().single()
        : await supabase.from('posts').insert({ ...dataWithPublish, created_at: new Date().toISOString() }).select().single();
        
      if (result.error) throw result.error;

      if (publishStatus === 'published') {
        setPublishedPost({ id: result.data.id, title: result.data.title });
        setShowSuccessModal(true);
        resetEditor();
      } else {
        toast({ title: "Operazione riuscita", description: 'Bozza salvata' });
      }
      
      setStatus(publishStatus);
    } catch (error) {
      console.error('Error saving post:', error);
      toast({ title: "Errore", description: "Impossibile salvare l'articolo", variant: "destructive" });
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const canPublish = !!title.trim() && !!editor?.getText().trim() && !!categoryId;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <ContentModerationAlert />
        {/* Titolo + Estratto */}
        <Card>
          <CardHeader><CardTitle>Dettagli Articolo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titolo *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Inserisci il titolo..." className="text-lg font-semibold" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estratto</label>
              <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Breve descrizione..." rows={3} />
            </div>
          </CardContent>
        </Card>
        {/* Cover */}
        <Card>
          <CardHeader><CardTitle>Cover Images</CardTitle></CardHeader>
          <CardContent>
            <CoverImageUploader images={coverImages} onChange={setCoverImages} />
          </CardContent>
        </Card>
        {/* Editor */}
        <Card>
          <CardHeader><CardTitle>Contenuto</CardTitle></CardHeader>
          <CardContent>
            {editor && <AdvancedEditorToolbar editor={editor} onImageUpload={handleImageUpload} />}
            <div className="border rounded-lg min-h-[400px] p-4">
              <EditorContent editor={editor} />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1 space-y-6">
        <Card className="sticky top-24">
          <CardHeader><CardTitle>Checklist pubblicazione</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              {title.trim() ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <AlertCircle className="h-4 w-4 text-destructive" />} Titolo
            </div>
            <div className="flex items-center gap-2">
              {editor?.getText().trim() ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <AlertCircle className="h-4 w-4 text-destructive" />} Contenuto
            </div>
            <div className="flex items-center gap-2">
              {categoryId ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <AlertCircle className="h-4 w-4 text-destructive" />} Categoria
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5" /> Per salvare: titolo, contenuto, categoria.
            </div>
          </CardContent>
        </Card>
        <PostSettingsSidebar
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          tags={tags}
          setTags={setTags}
          commentsEnabled={commentsEnabled}
          setCommentsEnabled={setCommentsEnabled}
          coAuthoringEnabled={coAuthoringEnabled}
          setCoAuthoringEnabled={setCoAuthoringEnabled}
          isHero={isHero}
          setIsHero={setIsHero}
          status={status}
          setStatus={setStatus}
        />
        
        {/* Azioni in fondo alla sidebar */}
        <Card>
          <CardHeader><CardTitle>Azioni</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => handleSave('draft')} 
              disabled={saving || publishing || !canPublish} 
              variant="outline"
              className="w-full"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} 
              Salva Bozza
            </Button>
            <Button 
              onClick={() => handleSave('published')} 
              disabled={saving || publishing || !canPublish}
              className="w-full bg-gradient-primary hover:bg-gradient-hover"
            >
              {publishing && <Loader2 className="h-4 w-4 animate-spin mr-2" />} 
              {initialPost ? 'Aggiorna' : 'Pubblica'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal di successo pubblicazione */}
      {publishedPost && (
        <PublishSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          postId={publishedPost.id}
          postTitle={publishedPost.title}
          onCreateNew={resetEditor}
        />
      )}
    </div>
  );
};
