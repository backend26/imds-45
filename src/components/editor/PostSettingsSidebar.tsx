// src/components/editor/PostSettingsSidebar.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];

interface Props {
  categoryId: string;
  setCategoryId: (id: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  commentsEnabled: boolean;
  setCommentsEnabled: (enabled: boolean) => void;
  coAuthoringEnabled: boolean;
  setCoAuthoringEnabled: (enabled: boolean) => void;
  isHero: boolean;
  setIsHero: (enabled: boolean) => void;
  status: 'draft' | 'published' | 'archived';
  setStatus: (status: 'draft' | 'published' | 'archived') => void;
}

export const PostSettingsSidebar: React.FC<Props> = ({
  categoryId,
  setCategoryId,
  tags,
  setTags,
  commentsEnabled,
  setCommentsEnabled,
  coAuthoringEnabled,
  setCoAuthoringEnabled,
  isHero,
  setIsHero,
  status,
  setStatus,
}) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (error) throw error;
        // 🔒 Evita ID vuoti/undefined che generano <SelectItem value="">
        setCategories((data || []).filter(c => c && c.id != null && String(c.id).trim() !== ''));
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({ title: "Error", description: "Failed to load categories", variant: "destructive" });
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [toast]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };
  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

  return (
    <div className="space-y-6">
      {/* Post Status */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Stato Articolo</CardTitle></CardHeader>
        <CardContent>
          <Select value={status} onValueChange={(v: 'draft' | 'published' | 'archived') => setStatus(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Bozza</SelectItem>
              <SelectItem value="published">Pubblicato</SelectItem>
              <SelectItem value="archived">Archiviato</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Category */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Categoria</CardTitle></CardHeader>
        <CardContent>
          <Select
            // ✅ placeholder via undefined (mai stringa vuota)
            value={categoryId || undefined}
            onValueChange={(value) => setCategoryId(value === 'none' ? '' : value)}
            disabled={categoriesLoading}
          >
            <SelectTrigger><SelectValue placeholder="Seleziona una categoria" /></SelectTrigger>
            <SelectContent>
              {/* ✅ opzione “nessuna” con value NON vuoto */}
              <SelectItem value="none">Nessuna categoria</SelectItem>
              {categories.map((c) => (
                <SelectItem key={String(c.id)} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Tags</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Aggiungi un tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ',') ? (e.preventDefault(), addTag()) : undefined}
              onBlur={addTag}
            />
            <Button type="button" size="sm" disabled={!tagInput.trim()} onClick={addTag}>Aggiungi</Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button type="button" variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => removeTag(tag)}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Impostazioni</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="comments-enabled" className="text-sm font-medium">Abilita Commenti</Label>
            <Switch id="comments-enabled" checked={commentsEnabled} onCheckedChange={setCommentsEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="co-authoring-enabled" className="text-sm font-medium">Abilita Co-autoring</Label>
            <Switch id="co-authoring-enabled" checked={coAuthoringEnabled} onCheckedChange={setCoAuthoringEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is-hero" className="text-sm font-medium">Articolo Hero</Label>
            <Switch id="is-hero" checked={isHero} onCheckedChange={setIsHero} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
