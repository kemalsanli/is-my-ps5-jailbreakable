'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'none' | 'blue' | 'success' | 'warning' | 'error';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className = '',
  hover = false,
  glow = 'none',
  padding = 'md',
}: CardProps) {
  const glowClasses = {
    none: '',
    blue: 'shadow-[0_0_20px_rgba(0,112,204,0.3)]',
    success: 'shadow-[0_0_20px_rgba(0,214,96,0.2)]',
    warning: 'shadow-[0_0_20px_rgba(255,165,0,0.2)]',
    error: 'shadow-[0_0_20px_rgba(255,51,51,0.2)]',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-12',
  };

  return (
    <div
      className={`ps5-card ${hover ? 'ps5-card-hover cursor-pointer' : ''} ${glowClasses[glow]} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
