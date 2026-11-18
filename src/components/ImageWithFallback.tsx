import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
  fallbackSubtitle,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`bg-gradient-to-br from-[#4A1425] via-[#320C18] to-[#242126] flex flex-col items-center justify-center p-6 text-center border border-[#C6A15B]/20 ${className}`}
        role="img"
        aria-label={alt}
      >
        <BookOpen className="w-9 h-9 text-[#C6A15B]/80 mb-3" strokeWidth={1.5} />
        {fallbackTitle && (
          <p className="font-serif text-lg font-semibold text-[#F3EBDD] leading-snug line-clamp-3">
            {fallbackTitle}
          </p>
        )}
        {fallbackSubtitle && (
          <p className="mt-1.5 text-xs text-[#C6A15B] tracking-wide">
            {fallbackSubtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
