import React from 'react';
import DOMPurify from 'dompurify';

interface BlogContentDisplayProps {
  content: string;
  className?: string;
}

export const BlogContentDisplay: React.FC<BlogContentDisplayProps> = ({ content, className = '' }) => {
  // Sanitize and process content for proper HTML display
  const processContent = (html: string) => {
    let processed = html;
    
    // Remove markdown symbols if present
    processed = processed.replace(/^#{1,6}\s+/gm, ''); // Remove # headers
    processed = processed.replace(/^\*\s+/gm, ''); // Remove * bullets
    processed = processed.replace(/^-\s+/gm, ''); // Remove - bullets
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // **bold**
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>'); // *italic*
    
    // Sanitize HTML to prevent XSS attacks
    const clean = DOMPurify.sanitize(processed, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 
        'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote',
        'code', 'pre', 'mark', 'span', 'div'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
      ALLOWED_URI_REGEXP: /^(?:(?:f|ht)tps?|mailto|tel|#):/i,
      KEEP_CONTENT: true
    });
    
    return clean;
  };

  return (
    <div 
      className={`prose prose-lg max-w-none blog-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
};
