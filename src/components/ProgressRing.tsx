import { cn } from '../utils/helpers';

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: 'orange' | 'green' | 'blue' | 'red';
}

const colorMap = {
  orange: '#f97316',
  green: '#10b981',
  blue: '#3b82f6',
  red: '#ef4444',
};

export function ProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  label,
  color = 'orange',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;
  const percentage = Math.round(progress * 100);

  const strokeColor = colorMap[color];

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#334155"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${strokeColor}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="data-display text-2xl" style={{ color: strokeColor }}>
          {percentage}%
        </span>
        {label && (
          <span className="text-text-muted text-xs mt-0.5">{label}</span>
        )}
      </div>
    </div>
  );
}
