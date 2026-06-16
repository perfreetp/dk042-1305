import { cn } from '../utils/helpers';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'orange' | 'red' | 'green' | 'blue' | 'yellow';
  trend?: number;
  subtitle?: string;
  onClick?: () => void;
}

const colorClasses = {
  orange: 'from-alert-orange/20 to-alert-orange/5 border-alert-orange/30 hover:border-alert-orange/50',
  red: 'from-alert-red/20 to-alert-red/5 border-alert-red/30 hover:border-alert-red/50',
  green: 'from-alert-green/20 to-alert-green/5 border-alert-green/30 hover:border-alert-green/50',
  blue: 'from-alert-blue/20 to-alert-blue/5 border-alert-blue/30 hover:border-alert-blue/50',
  yellow: 'from-alert-yellow/20 to-alert-yellow/5 border-alert-yellow/30 hover:border-alert-yellow/50',
};

const iconColors = {
  orange: 'text-alert-orange',
  red: 'text-alert-red',
  green: 'text-alert-green',
  blue: 'text-alert-blue',
  yellow: 'text-alert-yellow',
};

const valueColors = {
  orange: 'text-alert-orange',
  red: 'text-alert-red',
  green: 'text-alert-green',
  blue: 'text-alert-blue',
  yellow: 'text-alert-yellow',
};

export function StatCard({ title, value, icon, color, trend, subtitle, onClick }: StatCardProps) {
  return (
    <div
      className={cn(
        'card p-4 bg-gradient-to-br transition-all duration-300 cursor-pointer',
        colorClasses[color],
        onClick && 'hover:shadow-glow hover:-translate-y-0.5'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-secondary text-xs font-medium mb-1">{title}</p>
          <p className={cn(
            'data-display text-3xl tracking-tight',
            valueColors[color],
            (color === 'red' || color === 'orange') && trend && trend > 0 && 'animate-pulse'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-text-muted text-xs mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend >= 0 ? (
                <TrendingUp className="w-3 h-3 text-alert-red" />
              ) : (
                <TrendingDown className="w-3 h-3 text-alert-green" />
              )}
              <span className={cn(
                'text-xs font-medium',
                trend >= 0 ? 'text-alert-red' : 'text-alert-green'
              )}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className={cn('p-2 rounded bg-bg-primary/50', iconColors[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
