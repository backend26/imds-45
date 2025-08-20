import React from 'react';
import { useNavigate } from 'react-router-dom';

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
        return (
          <React.Fragment key={index}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${username}`);
              }}
              className="text-primary font-medium hover:underline"
            >
              @{username}
            </button>
            {word.substring(username.length + 1)} {/* Any punctuation after username */}
          </React.Fragment>
        );
      } else if (word.startsWith('#')) {
        const hashtag = word.substring(1).replace(/[^\w]/g, '');
        return (
          <React.Fragment key={index}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/search?q=${encodeURIComponent(`#${hashtag}`)}`);
              }}
              className="text-blue-500 font-medium hover:underline"
            >
              #{hashtag}
            </button>
            {word.substring(hashtag.length + 1)} {/* Any punctuation after hashtag */}
          </React.Fragment>
        );
      } else {
        return <span key={index}>{word} </span>;
      }
    });
  };

  return (
    <div className={className}>
      <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
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