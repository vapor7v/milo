import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, AlertTriangle, XCircle, Shield } from 'lucide-react';

export type RiskLevelType = 1 | 2 | 3 | 4 | 5;

interface RiskLevelProps {
  level: RiskLevelType;
  className?: string;
  showDescription?: boolean;
}

const riskLevelConfig = {
  1: {
    label: 'Wellbeing',
    description: 'You\'re doing great! Keep up the healthy habits.',
    icon: CheckCircle,
    color: 'text-wellness-safe',
    bgColor: 'bg-wellness-safe/10',
    borderColor: 'border-wellness-safe/20'
  },
  2: {
    label: 'Mild Symptoms',
    description: 'Some signs of stress. Let\'s work on some coping strategies.',
    icon: Shield,
    color: 'text-wellness-calm',
    bgColor: 'bg-wellness-calm/10',
    borderColor: 'border-wellness-calm/20'
  },
  3: {
    label: 'Moderate',
    description: 'Noticeable symptoms affecting daily life. Regular support recommended.',
    icon: AlertCircle,
    color: 'text-wellness-warm',
    bgColor: 'bg-wellness-warm/10',
    borderColor: 'border-wellness-warm/20'
  },
  4: {
    label: 'Severe',
    description: 'Significant impact on daily functioning. Professional help strongly recommended.',
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20'
  },
  5: {
    label: 'Crisis',
    description: 'Immediate professional intervention needed. Please reach out for help now.',
    icon: XCircle,
    color: 'text-wellness-critical',
    bgColor: 'bg-wellness-critical/10',
    borderColor: 'border-wellness-critical/20'
  }
};

export const RiskLevel = ({ level, className, showDescription = false }: RiskLevelProps) => {
  const config = riskLevelConfig[level];
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-2xl border',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <Icon className={cn('w-6 h-6 mt-0.5', config.color)} />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">Level {level}</span>
          <span className={cn('font-semibold', config.color)}>{config.label}</span>
        </div>
        {showDescription && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {config.description}
          </p>
        )}
      </div>
    </div>
  );
};