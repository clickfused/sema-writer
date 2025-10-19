import React from 'react';

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
    
    return processed;
  };

  return (
    <div 
      className={`prose prose-lg max-w-none blog-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
};
