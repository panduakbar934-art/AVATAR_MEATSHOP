import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
  asLink = true,
}) => {
  const isDark = variant === 'dark';

  const sizeClasses = {
    sm: { icon: 'w-7 h-7', textTitle: 'text-base', textSub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', textTitle: 'text-xl', textSub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', textTitle: 'text-2xl', textSub: 'text-xs' },
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* Brand Icon: Modern Butcher Emblem */}
      <div
        className={`relative ${sizeClasses.icon} flex items-center justify-center rounded-lg bg-gradient-to-br from-[#FF3B20] to-[#D92B17] shadow-sm shadow-[#FF3B20]/25 text-white flex-shrink-0 p-1.5`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-white"
        >
          {/* Cleaver / Meat Craft Silhouette */}
          <path d="M19 3v4a2 2 0 0 1-2 2H8L4 13v-2l4-4h9a2 2 0 0 0 2-2V3z" fill="currentColor" fillOpacity="0.25" />
          <path d="M4 14l3.5 3.5a2 2 0 0 0 2.8 0L19 9" />
          <path d="M14 17l4 4" />
          <path d="M17 14l3 3" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-none">
        <span
          className={`font-black tracking-tight ${sizeClasses.textTitle} ${
            isDark ? 'text-[#191919]' : 'text-white'
          }`}
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          AVATAR<span className="text-[#FF3B20]">.</span>
          <span className="text-xs ml-1 font-semibold tracking-wider uppercase opacity-85">MEATSHOP</span>
        </span>
        <span
          className={`font-semibold tracking-widest uppercase mt-0.5 ${sizeClasses.textSub} ${
            isDark ? 'text-[#777777]' : 'text-white/70'
          }`}
        >
          Fresh Meat & Quality Cuts
        </span>
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="inline-block transition-transform hover:opacity-95 focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};
