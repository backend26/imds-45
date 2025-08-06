import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];

interface PostSettingsSidebarProps {
  categoryId: string;
  setCategoryId: (id: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  commentsEnabled: boolean;
  setCommentsEnabled: (enabled: boolean) => void;
  coAuthoringEnabled: boolean;
  setCoAuthoringEnabled: (enabled: boolean) => void;
  status: 'draft' | 'published' | 'archived';
  setStatus: (status: 'draft' | 'published' | 'archived') => void;
}

export const PostSettingsSidebar: React.FC<PostSettingsSidebarProps> = ({
  categoryId,
  setCategoryId,
  tags,
  setTags,
  commentsEnabled,
  setCommentsEnabled,
  coAuthoringEnabled,
  setCoAuthoringEnabled,
  status,
  setStatus,
}) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [tagInput, setTagInput] = useState('');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Post Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Post Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={status} onValueChange={(value: 'draft' | 'published' | 'archived') => setStatus(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={categoryId} 
            onValueChange={setCategoryId}
            disabled={categoriesLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              onBlur={addTag}
            />
            <Button 
              type="button" 
              onClick={addTag}
              size="sm"
              disabled={!tagInput.trim()}
            >
              Add
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 w-4 h-4"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="comments-enabled" className="text-sm font-medium">
              Enable Comments
            </Label>
            <Switch
              id="comments-enabled"
              checked={commentsEnabled}
              onCheckedChange={setCommentsEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="co-authoring-enabled" className="text-sm font-medium">
              Enable Co-authoring
            </Label>
            <Switch
              id="co-authoring-enabled"
              checked={coAuthoringEnabled}
              onCheckedChange={setCoAuthoringEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};