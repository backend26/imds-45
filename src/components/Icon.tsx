import React from 'react';
import { 
  Heart, MessageCircle, Share2, Bookmark, Eye, Clock, 
  User, Calendar, TrendingUp, Star, ThumbsUp, Users,
  Zap, Activity, Target, Award, Flag, MoreHorizontal,
  ChevronRight, ExternalLink, X, ArrowRight, Search,
  Settings, Bell, Home, Menu, LogOut, Edit, Trash2,
  Plus, Minus, Check, AlertCircle, Info, AlertTriangle,
  Download, Upload, Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, RotateCcw, RefreshCw, Copy,
  Link, Image, Video, FileText, Folder, Mail,
  Phone, MapPin, Globe, Shield, Lock, Unlock,
  Filter, AlignJustify, Grid, List, LayoutGrid, Rows,
  ChevronLeft, ChevronUp, ChevronDown, ArrowUp,
  ArrowDown, ArrowLeft, Save, Send, Reply
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps {
  name: string;
  className?: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  fill?: string;
}

// Enhanced Icon mapping with Lucide React icons
const iconMap: Record<string, React.ComponentType<any>> = {
  // Interaction icons
  'like': Heart,
  'heart': Heart,
  'comment': MessageCircle,
  'message': MessageCircle,
  'share': Share2,
  'bookmark': Bookmark,
  'save': Save,
  'eye': Eye,
  'view': Eye,
  'trending': TrendingUp,
  'fire': TrendingUp,
  
  // User and time
  'user': User,
  'users': Users,
  'clock': Clock,
  'time': Clock,
  'calendar': Calendar,
  'date': Calendar,
  
  // Rating and engagement
  'star': Star,
  'thumbs-up': ThumbsUp,
  'zap': Zap,
  'activity': Activity,
  'target': Target,
  'award': Award,
  
  // Navigation
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'external-link': ExternalLink,
  
  // Actions
  'more': MoreHorizontal,
  'menu': Menu,
  'x': X,
  'close': X,
  'plus': Plus,
  'add': Plus,
  'minus': Minus,
  'check': Check,
  'edit': Edit,
  'trash': Trash2,
  'delete': Trash2,
  'flag': Flag,
  'report': Flag,
  'send': Send,
  'reply': Reply,
  
  // System
  'home': Home,
  'search': Search,
  'settings': Settings,
  'bell': Bell,
  'notification': Bell,
  'logout': LogOut,
  'login': ArrowRight,
  
  // Status
  'info': Info,
  'alert': AlertTriangle,
  'warning': AlertTriangle,
  'error': AlertCircle,
  'success': Check,
  
  // Media
  'image': Image,
  'video': Video,
  'play': Play,
  'pause': Pause,
  'volume': Volume2,
  'mute': VolumeX,
  'download': Download,
  'upload': Upload,
  
  // Layout
  'maximize': Maximize,
  'minimize': Minimize,
  'rotate': RotateCcw,
  'refresh': RefreshCw,
  'copy': Copy,
  'link': Link,
  'grid': Grid,
  'list': List,
  'card': LayoutGrid,
  'table': Rows,
  'filter': Filter,
  'sort': AlignJustify,
  
  // Files
  'file': FileText,
  'folder': Folder,
  'mail': Mail,
  'phone': Phone,
  'map': MapPin,
  'globe': Globe,
  
  // Security
  'shield': Shield,
  'lock': Lock,
  'unlock': Unlock
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className, 
  size = 24, 
  color,
  strokeWidth = 2,
  fill,
  ...props 
}) => {
  const IconComponent = iconMap[name.toLowerCase()];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return (
      <div 
        className={cn(
          "inline-flex items-center justify-center bg-muted text-muted-foreground text-xs rounded",
          className
        )}
        style={{ width: size, height: size }}
        title={`Icon "${name}" not found`}
      >
        ?
      </div>
    );
  }

  return (
    <IconComponent
      className={className}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      fill={fill}
      {...props}
    />
  );
};

// Legacy support for the old Icon component
export default Icon;