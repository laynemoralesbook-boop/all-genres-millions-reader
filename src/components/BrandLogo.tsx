import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'stacked';
  theme?: 'dark' | 'light';
  className?: string;
}

export function BrandEmblem({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Antique gold star above the book */}
      <polygon
        points="40,7 42.4,13.6 49.4,13.6 43.8,17.8 45.9,24.4 40,20.4 34.1,24.4 36.2,17.8 30.6,13.6 37.6,13.6"
        fill="#C6A15B"
      />
      {/* Sunrise arc and light rays radiating from open book pages */}
      <path
        d="M17 42C22.5 31.5 30.8 26.5 40 26.5C49.2 26.5 57.5 31.5 63 42"
        stroke="#C6A15B"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />
      <line x1="40" y1="27" x2="40" y2="36" stroke="#C6A15B" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="29" y1="30" x2="33" y2="38" stroke="#C6A15B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="51" y1="30" x2="47" y2="38" stroke="#C6A15B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="36" x2="27" y2="42" stroke="#C6A15B" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="60" y1="36" x2="53" y2="42" stroke="#C6A15B" strokeWidth="1.4" strokeLinecap="round" />

      {/* Outer deep burgundy book binding */}
      <path
        d="M9 44.5C18.5 44.5 29.5 47.5 40 54.5C50.5 47.5 61.5 44.5 71 44.5V67C61.5 67 50.5 69.5 40 75C29.5 69.5 18.5 67 9 67V44.5Z"
        fill="#4A1425"
        stroke="#C6A15B"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Warm cream open pages */}
      <path
        d="M13 42C21.5 42 31.2 44.8 40 51.2C48.8 44.8 58.5 42 67 42V62.5C58.5 62.5 48.8 65 40 70.5C31.2 65 21.5 62.5 13 62.5V42Z"
        fill="#F3EBDD"
        stroke="#C6A15B"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Subtle page folds & center spine */}
      <path
        d="M18 47.5C24.5 47.8 31.2 49.6 36.5 53.2"
        stroke="#4A1425"
        strokeOpacity="0.35"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M62 47.5C55.5 47.8 48.8 49.6 43.5 53.2"
        stroke="#4A1425"
        strokeOpacity="0.35"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M18 54C24.5 54.3 31.2 56.1 36.5 59.7"
        stroke="#4A1425"
        strokeOpacity="0.25"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M62 54C55.5 54.3 48.8 56.1 43.5 59.7"
        stroke="#4A1425"
        strokeOpacity="0.25"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line x1="40" y1="51.2" x2="40" y2="70.5" stroke="#4A1425" strokeWidth="1.8" />
    </svg>
  );
}

export function BrandLogo({
  variant = 'full',
  theme = 'dark',
  className = '',
}: BrandLogoProps) {
  const titleColor = theme === 'dark' ? 'text-[#F3EBDD]' : 'text-[#4A1425]';
  const subColor = theme === 'dark' ? 'text-[#C6A15B]' : 'text-[#4A1425]/80';

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <BrandEmblem className="w-9 h-9 shrink-0" />
        <span className={`font-serif font-semibold tracking-wide text-sm whitespace-nowrap ${titleColor}`}>
          ALL GENRES MILLIONS READER
        </span>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center text-center gap-2 ${className}`}>
        <BrandEmblem className="w-16 h-16" />
        <div>
          <div className={`font-serif font-bold tracking-[0.06em] text-xl leading-tight ${titleColor}`}>
            ALL GENRES MILLIONS READER
          </div>
          <div className={`text-[11px] tracking-[0.14em] uppercase mt-1 ${subColor}`}>
            Millions of Stories. Every Genre.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <BrandEmblem className="w-10 h-10 shrink-0" />
      <span className={`font-serif font-bold tracking-[0.04em] text-base sm:text-lg whitespace-nowrap ${titleColor}`}>
        ALL GENRES MILLIONS READER
      </span>
    </div>
  );
}

export function LoadingScreen({ message = 'Opening the Literary Library…' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-[#242126] text-[#F3EBDD] flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="mb-5 animate-pulse">
          <BrandEmblem className="w-20 h-20" />
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-[0.06em] text-[#F3EBDD]">
          ALL GENRES MILLIONS READER
        </h1>
        <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] mt-2">
          Millions of Stories. Every Genre.
        </p>
        <div className="mt-6 w-44 h-[2px] bg-[#4A1425] overflow-hidden rounded-full">
          <div className="h-full w-1/2 bg-[#C6A15B] animate-pulse" />
        </div>
        <p className="mt-3 text-sm text-[#F3EBDD]/70">{message}</p>
      </div>
    </div>
  );
}
