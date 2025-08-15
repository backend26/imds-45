import React from "react";
import DOMPurify from 'dompurify';
import { cn } from "@/lib/utils";

interface ContentPreviewProps {
  content: string;
  maxLength?: number;
  className?: string;
  showAsExcerpt?: boolean;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  content,
  maxLength = 150,
  className,
  showAsExcerpt = false
}) => {
  // If showing as excerpt, extract plain text
  if (showAsExcerpt) {
    const textContent = content.replace(/<[^>]*>/g, '').substring(0, maxLength);
    return (
      <p className={cn("text-muted-foreground text-sm line-clamp-2 leading-relaxed", className)}>
        {textContent}{textContent.length >= maxLength ? '...' : ''}
      </p>
    );
  }

  // For rich HTML preview, sanitize with permissive settings
  const sanitizedContent = DOMPurify.sanitize(content, {
    ADD_ATTR: ['style', 'class', 'data-alert-type', 'data-cta', 'data-cta-title', 'data-cta-content', 'data-cta-button'],
    ALLOW_DATA_ATTR: true,
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'u', 'span', 'div', 'br'],
    ALLOWED_ATTR: ['style', 'class']
  });

  // Truncate HTML content if needed
  const truncatedContent = sanitizedContent.length > maxLength * 3 
    ? sanitizedContent.substring(0, maxLength * 3) + '...'
    : sanitizedContent;

  return (
    <div 
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert line-clamp-3",
        "prose-headings:text-base prose-headings:font-semibold prose-headings:mb-1",
        "prose-p:text-sm prose-p:text-muted-foreground prose-p:mb-1",
        className
      )}
      dangerouslySetInnerHTML={{ __html: truncatedContent }}
    />
  );
};