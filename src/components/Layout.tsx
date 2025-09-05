import React from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'gradient' | 'subtle';
}

export const Layout = ({ children, className, background = 'default' }: LayoutProps) => {
  const backgroundClasses = {
    default: 'bg-background',
    gradient: 'bg-gradient-subtle',
    subtle: 'bg-muted/30',
  };

  return (
    <div className={cn(
      'min-h-screen',
      backgroundClasses[background],
      className
    )}>
      {children}
    </div>
  );
};

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Container = ({ children, className, size = 'md' }: ContainerProps) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className={cn(
      'mx-auto px-6 py-8',
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
};