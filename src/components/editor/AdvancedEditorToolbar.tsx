import React, { useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bold, Italic, Underline, Strikethrough, Code, Highlighter,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Minus, Type, Palette,
  Image as ImageIcon, Video, Link as LinkIcon, Youtube,
  AlertTriangle, Info, CheckCircle, XCircle, Megaphone,
  Superscript, Subscript, Hash, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedEditorToolbarProps {
  editor: Editor;
  onImageUpload: (file: File) => Promise<string | null>;
}

export const AdvancedEditorToolbar: React.FC<AdvancedEditorToolbarProps> = ({ 
  editor, 
  onImageUpload 
}) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertContent, setAlertContent] = useState('');
  const [alertType, setAlertType] = useState<'warning' | 'info' | 'success' | 'error'>('info');
  const [showCtaDialog, setShowCtaDialog] = useState(false);
  const [ctaTitle, setCtaTitle] = useState('');
  const [ctaContent, setCtaContent] = useState('');
  const [ctaButtonText, setCtaButtonText] = useState('');

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await onImageUpload(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor, onImageUpload]);

  const handleAddLink = useCallback(() => {
    if (!linkUrl) return;
    const { from, to, empty } = editor.state.selection;
    if (empty) {
      editor.chain().focus().insertContent(linkUrl).setTextSelection({ from, to: from + linkUrl.length }).setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setLinkUrl('');
    setShowLinkDialog(false);
  }, [editor, linkUrl]);

  const handleAddYoutube = useCallback(() => {
    if (youtubeUrl) {
      editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
      setYoutubeUrl('');
      setShowYoutubeDialog(false);
    }
  }, [editor, youtubeUrl]);

  const handleAddAlert = useCallback(() => {
    if (alertContent) {
      editor.chain().focus().setAlertBox({ type: alertType, content: alertContent }).run();
      setAlertContent('');
      setShowAlertDialog(false);
    }
  }, [editor, alertType, alertContent]);

  const handleAddCta = useCallback(() => {
    if (ctaContent) {
      editor.chain().focus().setCallToAction({ 
        title: ctaTitle, 
        content: ctaContent, 
        buttonText: ctaButtonText 
      }).run();
      setCtaTitle('');
      setCtaContent('');
      setCtaButtonText('');
      setShowCtaDialog(false);
    }
  }, [editor, ctaTitle, ctaContent, ctaButtonText]);

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children, 
    title,
    variant = "ghost"
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode; 
    title: string;
    variant?: "ghost" | "default";
  }) => (
    <Button
      onClick={onClick}
      variant={isActive ? "default" : variant}
      size="sm"
      title={title}
      className={cn("h-8 w-8 p-0", isActive && "bg-primary text-primary-foreground")}
    >
      {children}
    </Button>
  );

  const ColorPicker = ({ 
    command, 
    currentColor, 
    title 
  }: { 
    command: (color: string) => void; 
    currentColor?: string; 
    title: string;
  }) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium">{title}</span>
      <div className="flex flex-wrap gap-1">
        {['#000000', '#dc2626', '#ea580c', '#d97706', '#65a30d', '#059669', '#0891b2', '#2563eb', '#7c3aed', '#c026d3'].map((color) => (
          <button
            key={color}
            onClick={() => command(color)}
            className={cn(
              "w-6 h-6 rounded border-2 border-border hover:scale-110 transition-transform",
              currentColor === color && "ring-2 ring-primary ring-offset-2"
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="border rounded-lg p-3 bg-muted/30 space-y-3">
      {/* Formattazione Base */}
      <div className="flex flex-wrap gap-1 items-center">
        <Badge variant="outline" className="text-xs">Formattazione</Badge>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Grassetto (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Corsivo (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Sottolineato (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Barrato"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Codice Inline"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Evidenziatore"
        >
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Tipografia Avanzata */}
        <Badge variant="outline" className="text-xs">Tipografia</Badge>
        <Select
          value={editor.getAttributes('textStyle').fontFamily || ''}
          onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Default</SelectItem>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="serif">Serif</SelectItem>
            <SelectItem value="monospace">Monospace</SelectItem>
            <SelectItem value="cursive">Cursive</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1">
          <ColorPicker 
            command={(color) => editor.chain().focus().setColor(color).run()}
            currentColor={editor.getAttributes('textStyle').color}
            title="Colore Testo"
          />
        </div>
      </div>

      {/* Struttura e Layout */}
      <div className="flex flex-wrap gap-1 items-center">
        <Badge variant="outline" className="text-xs">Struttura</Badge>
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph')}
          title="Paragrafo"
        >
          <span className="text-xs font-bold">P</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Titolo 1"
        >
          <span className="text-xs font-bold">H1</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Titolo 2"
        >
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Titolo 3"
        >
          <span className="text-xs font-bold">H3</span>
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Allinea Sinistra"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Allinea Centro"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Allinea Destra"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Elenco Puntato"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Elenco Numerato"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Citazione"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Linea Orizzontale"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Avanzate */}
      <div className="flex flex-wrap gap-1 items-center">
        <Badge variant="outline" className="text-xs">Avanzate</Badge>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={editor.isActive('superscript')}
          title="Apice"
        >
          <Superscript className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={editor.isActive('subscript')}
          title="Pedice"
        >
          <Subscript className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Blocco Codice"
        >
          <Hash className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Media e Template */}
      <div className="flex flex-wrap gap-1 items-center">
        <Badge variant="outline" className="text-xs">Media & Template</Badge>
        
        {/* Link Dialog */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" title="Aggiungi Link" className="h-8 w-8 p-0">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aggiungi Link</DialogTitle>
              <DialogDescription>Inserisci un URL per creare un collegamento</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="https://esempio.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddLink}>Aggiungi</Button>
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Annulla</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Upload */}
        <Button
          variant="ghost"
          size="sm"
          title="Carica Immagine"
          className="h-8 w-8 p-0"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* YouTube Dialog */}
        <Dialog open={showYoutubeDialog} onOpenChange={setShowYoutubeDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" title="Incorpora YouTube" className="h-8 w-8 p-0">
              <Youtube className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Incorpora Video YouTube</DialogTitle>
              <DialogDescription>Incolla l'URL del video YouTube</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddYoutube()}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddYoutube}>Incorpora</Button>
                <Button variant="outline" onClick={() => setShowYoutubeDialog(false)}>Annulla</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Separator orientation="vertical" className="h-6" />

        {/* Alert Box Dialog */}
        <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" title="Box Avviso" className="h-8 w-8 p-0">
              <AlertTriangle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crea Box Avviso</DialogTitle>
              <DialogDescription>Aggiungi un avviso colorato al tuo articolo</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={alertType} onValueChange={(value: any) => setAlertType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">ℹ️ Informazione</SelectItem>
                  <SelectItem value="warning">⚠️ Avvertimento</SelectItem>
                  <SelectItem value="success">✅ Successo</SelectItem>
                  <SelectItem value="error">❌ Errore</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Contenuto dell'avviso..."
                value={alertContent}
                onChange={(e) => setAlertContent(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddAlert}>Aggiungi Avviso</Button>
                <Button variant="outline" onClick={() => setShowAlertDialog(false)}>Annulla</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Call to Action Dialog */}
        <Dialog open={showCtaDialog} onOpenChange={setShowCtaDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" title="Call to Action" className="h-8 w-8 p-0">
              <Megaphone className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crea Call to Action</DialogTitle>
              <DialogDescription>Aggiungi un box di richiamo per l'azione</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Titolo (opzionale)"
                value={ctaTitle}
                onChange={(e) => setCtaTitle(e.target.value)}
              />
              <Input
                placeholder="Contenuto principale"
                value={ctaContent}
                onChange={(e) => setCtaContent(e.target.value)}
              />
              <Input
                placeholder="Testo bottone (opzionale)"
                value={ctaButtonText}
                onChange={(e) => setCtaButtonText(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddCta}>Aggiungi CTA</Button>
                <Button variant="outline" onClick={() => setShowCtaDialog(false)}>Annulla</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};