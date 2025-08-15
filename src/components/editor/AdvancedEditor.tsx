import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { useBlocker } from 'react-router-dom';
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
import { EditorErrorBoundary } from './EditorErrorBoundary';
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
  const [coverImages, setCoverImages] = useState<string>((initialPost as any)?.cover_images || '');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(
    (initialPost as any)?.status as 'draft' | 'published' | 'archived' || 'draft'
  );
  const [isHero, setIsHero] = useState<boolean>((initialPost as any)?.is_hero ?? false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedPost, setPublishedPost] = useState<{ id: string; title: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // Enhanced anti-reload system
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Hai modifiche non salvate. Sei sicuro di voler uscire?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
        class: 'focus:outline-none min-h-[400px] p-4 text-foreground editor-content',
      },
    },
    onCreate: ({ editor }) => {
      // Restore content from localStorage if available
      const storageKey = initialPost ? `editor:edit:${initialPost.id}` : 'editor:new';
      const saved = localStorage.getItem(storageKey);
      if (saved && !initialPost) {
        try {
          const data = JSON.parse(saved);
          if (data.content && !editor.getHTML().includes('<p>')) {
            editor.commands.setContent(data.content);
            setTitle(data.title || '');
            setExcerpt(data.excerpt || '');
            setCategoryId(data.categoryId || '');
            setTags(data.tags || []);
            setCoverImages(data.coverImages || '');
            setCommentsEnabled(data.commentsEnabled ?? true);
            setCoAuthoringEnabled(data.coAuthoringEnabled ?? false);
            setIsHero(data.isHero ?? false);
            setStatus(data.status || 'draft');
          }
        } catch (error) {
          console.error('Failed to restore editor content:', error);
        }
      }
    },
    onUpdate: () => {
      setHasUnsavedChanges(true);
    },
  });

  // Set up auto-save and cleanup
  useEffect(() => {
    if (!editor) return;
    
    const storageKey = initialPost ? `editor:edit:${initialPost.id}` : 'editor:new';
    
    // Enhanced auto-save with debugging
    const interval = setInterval(() => {
      if (title || excerpt || editor?.getText()) {
        const data = {
          title,
          excerpt,
          categoryId,
          tags,
          coverImages,
          commentsEnabled,
          coAuthoringEnabled,
          isHero,
          status,
          content: editor?.getHTML() || '',
          timestamp: Date.now()
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
        console.log('✅ Auto-save completed:', { title: title.slice(0, 30), hasContent: !!editor?.getText() });
      }
    }, 10000); // Every 10 seconds (faster)

    // Clear old auto-saves (older than 24 hours)
    const cleanupOldSaves = () => {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('editor:')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            const age = Date.now() - (data.timestamp || 0);
            if (age > 24 * 60 * 60 * 1000) { // 24 hours
              localStorage.removeItem(key);
            }
          } catch (error) {
            localStorage.removeItem(key); // Remove corrupted data
          }
        }
      });
    };

    cleanupOldSaves();
    return () => clearInterval(interval);
  }, [title, excerpt, categoryId, tags, coverImages, commentsEnabled, coAuthoringEnabled, isHero, status, initialPost, editor]);

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
    setCoverImages('');
    setCommentsEnabled(true);
    setCoAuthoringEnabled(false);
    setIsHero(false);
    setStatus('draft');
    setHasUnsavedChanges(false);
    editor?.commands.clearContent();
    
    // Clear localStorage
    const storageKey = initialPost ? `editor:edit:${initialPost.id}` : 'editor:new';
    localStorage.removeItem(storageKey);
  };

  const handleSave = async (publishStatus: 'draft' | 'published') => {
    if (!user || !editor) return;
    
    console.log('💾 Starting save process:', { publishStatus, title: title.slice(0, 30) });
    
    // Enhanced validation for publishing
    if (publishStatus === 'published') {
      const validationErrors = [];
      if (!title.trim()) validationErrors.push("Titolo obbligatorio");
      if (!editor.getText().trim()) validationErrors.push("Contenuto non può essere vuoto");
      if (!categoryId) validationErrors.push("Categoria obbligatoria");
      
      if (validationErrors.length > 0) {
        toast({ 
          title: "Errore di validazione", 
          description: validationErrors.join(", "), 
          variant: "destructive" 
        });
        return;
      }
    }
    
    // Validation for drafts
    if (publishStatus === 'draft') {
      if (!title.trim() && !editor.getText().trim()) {
        toast({ 
          title: "Errore di validazione", 
          description: "Inserisci almeno un titolo o del contenuto", 
          variant: "destructive" 
        });
        return;
      }
    }

    const isPublishAction = publishStatus === 'published';
    if (isPublishAction) {
      setPublishing(true);
    } else {
      setSaving(true);
    }

    try {
      const sanitizedContent = DOMPurify.sanitize(editor.getHTML());
      
      // Enhanced data structure with debugging
      const baseData = {
        title: title.trim(),
        content: sanitizedContent,
        excerpt: excerpt.trim(),
        author_id: user.id,
        category_id: categoryId || null,
        tags,
        cover_images: coverImages || null,
        comments_enabled: commentsEnabled,
        co_authoring_enabled: coAuthoringEnabled,
        is_hero: isHero,
        status: publishStatus,
        updated_at: new Date().toISOString(),
        published_at: publishStatus === 'published' ? new Date().toISOString() : null,
      } as any;
      
      console.log('📦 Saving data:', { 
        status: baseData.status, 
        hasContent: !!baseData.content, 
        hasCover: !!baseData.cover_images,
        isUpdate: !!initialPost 
      });
        
      const result = initialPost
        ? await supabase.from('posts').update(baseData).eq('id', initialPost.id).select().single()
        : await supabase.from('posts').insert({ ...baseData, created_at: new Date().toISOString() }).select().single();
        
      if (result.error) {
        console.error('❌ Database error:', result.error);
        throw result.error;
      }

      console.log('✅ Save successful:', result.data);

      if (publishStatus === 'published') {
        setPublishedPost({ id: result.data.id, title: result.data.title });
        setShowSuccessModal(true);
        setHasUnsavedChanges(false);
        resetEditor();
        toast({ title: "Pubblicato!", description: "Articolo pubblicato con successo" });
      } else {
        toast({ title: "Bozza salvata", description: "Le modifiche sono state salvate" });
        setHasUnsavedChanges(false);
      }
      
      setStatus(publishStatus);
    } catch (error) {
      console.error('❌ Error saving post:', error);
      toast({ title: "Errore", description: `Impossibile salvare l'articolo: ${error.message}`, variant: "destructive" });
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const canPublish = !!title.trim() && !!editor?.getText().trim() && !!categoryId;
  const canSaveDraft = !!title.trim() || !!editor?.getText().trim();

  return (
    <EditorErrorBoundary>
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
          <CardHeader><CardTitle>Immagine di Copertina</CardTitle></CardHeader>
          <CardContent>
            <CoverImageUploader images={coverImages} onChange={setCoverImages} />
          </CardContent>
        </Card>
        {/* Editor */}
        <Card>
          <CardHeader><CardTitle>Contenuto</CardTitle></CardHeader>
          <CardContent>
            {editor && <AdvancedEditorToolbar editor={editor} onImageUpload={handleImageUpload} />}
            <div className="border rounded-lg min-h-[400px] p-4 bg-card">
              <EditorContent 
                editor={editor} 
                className="focus:outline-none min-h-[400px] editor-content prose prose-lg max-w-none" 
                style={{ fontSize: '16px', lineHeight: '1.7' }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1 space-y-6">
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
        
        <Card>
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
        
        {/* Azioni in fondo alla sidebar */}
        <Card>
          <CardHeader><CardTitle>Azioni</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => handleSave('draft')} 
              disabled={saving || publishing || !canSaveDraft} 
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
    </EditorErrorBoundary>
  );
};
