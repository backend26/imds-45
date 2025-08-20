import { useState, useCallback, useMemo } from 'react';
import { MessageCircle, Heart, Reply, Flag, MoreHorizontal, Trash2, Edit, Send, User, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useRoleCheck } from '@/hooks/use-role-check';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { CommentReportModal } from './CommentReportModal';
import { CommentItem } from './CommentItem';
import { useOptimizedComments } from '@/hooks/use-optimized-comments';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  author: {
    username: string;
    display_name: string;
    profile_picture_url?: string;
  };
  likes_count: number;
  user_has_liked: boolean;
  replies: Comment[];
}

interface EnhancedCommentSystemProps {
  postId: string;
  className?: string;
}

type SortOption = 'recent' | 'popular' | 'oldest';

export const EnhancedCommentSystem = ({ postId, className }: EnhancedCommentSystemProps) => {
  // Use ModernCommentSystem instead
  const { ModernCommentSystem } = require('./ModernCommentSystem');
  return <ModernCommentSystem postId={postId} className={className} />;
};