import { useState, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, AtSign, Hash, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<boolean>;
  placeholder?: string;
  replyingTo?: string | null;
  onCancel?: () => void;
  userAvatar?: string;
  className?: string;
  initialValue?: string;
}

export const CommentInput = ({ 
  onSubmit, 
  placeholder = "Condividi la tua opinione...", 
  replyingTo,
  onCancel,
  userAvatar,
  className,
  initialValue = ''
}: CommentInputProps) => {
  const [content, setContent] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Character limit for comments
  const MAX_CHARACTERS = 300;
  const remainingChars = MAX_CHARACTERS - content.length;

  // Parse content for mentions and hashtags
  const parseContent = (text: string) => {
    return text
      .replace(/@(\w+)/g, '<span class="text-primary font-medium">@$1</span>')
      .replace(/#(\w+)/g, '<span class="text-blue-500 font-medium">#$1</span>');
  };

  // Handle mentions
  const handleMentionInput = useCallback((value: string, position: number) => {
    const beforeCursor = value.substring(0, position);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    
    if (value.length <= MAX_CHARACTERS) {
      setContent(value);
      setCursorPosition(position);
      handleMentionInput(value, position);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() || loading) return;
    
    setLoading(true);
    try {
      const success = await onSubmit(content);
      if (success) {
        setContent('');
        setShowMentions(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const insertMention = (username: string) => {
    const beforeCursor = content.substring(0, cursorPosition);
    const afterCursor = content.substring(cursorPosition);
    const beforeMention = beforeCursor.replace(/@\w*$/, '');
    
    const newContent = beforeMention + `@${username} ` + afterCursor;
    setContent(newContent);
    setShowMentions(false);
    
    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  // Real users for mentions - simplified for now
  const mockUsers = [
    { username: 'redazione', display_name: 'Redazione' },
    { username: 'sport_italia', display_name: 'Sport Italia' },
    { username: 'calcio_fan', display_name: 'Calcio Fan' }
  ].filter(user => 
    mentionQuery && (
      user.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      user.display_name.toLowerCase().includes(mentionQuery.toLowerCase())
    )
  );

  return (
    <div className={cn("space-y-3", className)}>
      {replyingTo && (
        <div className="text-sm text-muted-foreground">
          Rispondendo a <span className="font-medium text-primary">{replyingTo}</span>
        </div>
      )}
      
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="bg-primary/10">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2 relative">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              value={content}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className={cn(
                "min-h-[80px] resize-none border-2 focus:border-primary transition-colors",
                remainingChars < 50 && "border-orange-300",
                remainingChars < 0 && "border-destructive"
              )}
              maxLength={MAX_CHARACTERS}
            />
            
            {/* Character counter */}
            <div className="absolute bottom-2 right-2">
              <span className={cn(
                "text-xs px-2 py-1 rounded bg-background/80 backdrop-blur-sm",
                remainingChars < 50 && "text-orange-600",
                remainingChars < 0 && "text-destructive"
              )}>
                {remainingChars}
              </span>
            </div>
          </div>

          {/* Mentions dropdown */}
          {showMentions && mockUsers.length > 0 && (
            <div className="absolute z-10 w-full bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {mockUsers.map((user) => (
                <button
                  key={user.username}
                  className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2"
                  onClick={() => insertMention(user.username)}
                >
                  <AtSign className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">{user.display_name}</div>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <AtSign className="h-3 w-3" />
                menzioni
              </span>
              <span className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                hashtag
              </span>
            </div>
            
            <div className="flex gap-2">
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Annulla
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || loading || remainingChars < 0}
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {replyingTo ? 'Rispondi' : 'Pubblica'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};