import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import Underline from '@tiptap/extension-underline';
import { EditorToolbar } from './EditorToolbar';
import { PostSettingsSidebar } from './PostSettingsSidebar';
import { CoverImageUploader } from './CoverImageUploader';
import { ContentModerationAlert } from './ContentModerationAlert';
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
  
  // Form state
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
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  const extensions = useMemo(() => (
    [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        modestBranding: true,
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
    ]
  ), []);

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
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('post-media')
        .getPublicUrl(filePath);

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

  const handleSave = async (publishStatus: 'draft' | 'published' = 'draft') => {
    if (!user || !editor) return;

    if (!title.trim()) {
      toast({
        title: "Errore di validazione",
        description: "Il titolo è obbligatorio",
        variant: "destructive",
      });
      return;
    }

    const contentText = editor.getText().trim();
    if (!contentText) {
      toast({
        title: "Errore di validazione",
        description: "Il contenuto non può essere vuoto",
        variant: "destructive",
      });
      return;
    }

    if (!categoryId) {
      toast({
        title: "Errore di validazione",
        description: "Seleziona una categoria",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

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

      let result;
      if (initialPost) {
        // Update existing post
        result = await supabase
          .from('posts')
          .update(dataWithPublish)
          .eq('id', initialPost.id)
          .select()
          .single();
      } else {
        // Create new post
        result = await supabase
          .from('posts')
          .insert({ ...dataWithPublish, created_at: new Date().toISOString() })
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Operazione riuscita",
        description: `Articolo ${publishStatus === 'published' ? 'pubblicato' : 'salvato'} correttamente`,
      });

      setStatus(publishStatus);

    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Save Error",
        description: "Failed to save post",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const contentText = editor?.getText().trim() ?? '';
  const isTitleOK = title.trim().length > 0;
  const isContentOK = contentText.length > 0;
  const isCategoryOK = !!categoryId;
  const canPublish = isTitleOK && isContentOK && isCategoryOK;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        {/* Content Moderation Alert */}
        <ContentModerationAlert />
        {/* Title and Excerpt */}
        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                className="text-lg font-semibold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Excerpt
              </label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief description of your post..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cover Images */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Images</CardTitle>
          </CardHeader>
          <CardContent>
            <CoverImageUploader
              images={coverImages}
              onChange={setCoverImages}
            />
          </CardContent>
        </Card>

        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {editor && (
                <EditorToolbar 
                  editor={editor} 
                  onImageUpload={handleImageUpload}
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview((v) => !v)}
              >
                {showPreview ? 'Nascondi anteprima' : 'Mostra anteprima'}
              </Button>
            </div>
            <div className="border rounded-lg mt-4 min-h-[400px]">
              <EditorContent editor={editor} />
            </div>
            {showPreview && (
              <div className="border rounded-lg mt-4 p-4 prose max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editor?.getHTML() || '') }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => handleSave('draft')}
            disabled={saving || !canPublish}
            variant="outline"
            className="flex items-center gap-2"
            title={!canPublish ? 'Inserisci titolo, contenuto e categoria per salvare la bozza' : undefined}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave('published')}
            disabled={saving || !canPublish}
            className="flex items-center gap-2"
            title={!canPublish ? 'Completa titolo, contenuto e categoria per pubblicare' : undefined}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {initialPost ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Publish checklist */}
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Checklist pubblicazione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              {isTitleOK ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
              <span>Titolo</span>
            </div>
            <div className="flex items-center gap-2">
              {isContentOK ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
              <span>Contenuto</span>
            </div>
            <div className="flex items-center gap-2">
              {isCategoryOK ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
              <span>Categoria</span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5" />
              <span>Per salvare la bozza sono richiesti titolo, contenuto e categoria.</span>
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
      </div>
    </div>
  );
};