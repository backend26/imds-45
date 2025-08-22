import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealProfiles } from '@/hooks/use-real-profiles';

interface CommentContentProps {
  content: string;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  className?: string;
}

const MAX_PREVIEW_LENGTH = 300;

export const CommentContent = ({ 
  content, 
  isExpanded = true, 
  onToggleExpanded,
  className = "" 
}: CommentContentProps) => {
  const navigate = useNavigate();
  const { findProfileByUsername } = useRealProfiles();
  
  const needsTruncation = content.length > MAX_PREVIEW_LENGTH;
  const displayContent = (!isExpanded && needsTruncation) 
    ? content.substring(0, MAX_PREVIEW_LENGTH) + "..." 
    : content;

  // Parse mentions and hashtags
  const parseContent = (text: string) => {
    // Split text by spaces to handle mentions and hashtags individually
    return text.split(' ').map((word, index) => {
      if (word.startsWith('@')) {
        const username = word.substring(1).replace(/[^\w]/g, '');
        const userProfile = findProfileByUsername(username);
        
        // Only create clickable link if user exists in database
        if (userProfile) {
          return (
            <span key={index}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/@${username}`);
                }}
                className="text-primary font-medium hover:underline hover:text-primary/80"
                title={userProfile.display_name}
              >
                @{username}
              </button>
              {word.substring(username.length + 1)} {/* Any punctuation after username */}
            </span>
          );
        } else {
          // Show as regular text if user doesn't exist
          return <span key={index} className="text-muted-foreground">{word} </span>;
        }
      } else if (word.startsWith('#')) {
        const hashtag = word.substring(1).replace(/[^\w]/g, '');
        return (
          <span key={index}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/search?q=%23${hashtag}`);
              }}
              className="text-blue-500 font-medium hover:underline hover:text-blue-600 dark:hover:text-blue-400"
            >
              #{hashtag}
            </button>
            {word.substring(hashtag.length + 1)} {/* Any punctuation after hashtag */}
          </span>
        );
      } else {
        return <span key={index}>{word} </span>;
      }
    });
  };

  return (
    <div className={className}>
      <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
        {parseContent(displayContent)}
      </div>
      
      {needsTruncation && onToggleExpanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpanded();
          }}
          className="text-primary text-sm font-medium hover:underline mt-1 inline-block"
        >
          {isExpanded ? 'Mostra meno' : 'Leggi tutto'}
        </button>
      )}
    </div>
  );
};