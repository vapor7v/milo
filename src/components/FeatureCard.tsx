import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBoxColor?: string;
}

export const FeatureCard = ({ 
  icon,
  title,
  description,
  iconBoxColor,
  className,
  ...props 
}: FeatureCardProps) => {
  return (
    <Card 
      className={cn(
        'group flex flex-col justify-between p-5 h-full transform transition-all duration-300 hover:scale-[1.03] hover:shadow-xl', 
        className
      )}
      {...props}
    >
      <div>
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
          iconBoxColor
        )}>
          {icon}
        </div>
        <h3 className="font-bold text-lg mb-1 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-muted-foreground self-end transition-transform duration-300 group-hover:translate-x-1" />
    </Card>
  );
};