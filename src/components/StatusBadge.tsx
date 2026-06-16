import type { DispatchStatus, Priority, PlateType, CallResult } from '../types';
import { getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, getPlateTypeLabel, getPlateTypeColor, getCallResultLabel } from '../utils/helpers';
import { cn } from '../utils/helpers';

interface StatusBadgeProps {
  status: DispatchStatus;
  size?: 'sm' | 'md';
  showCount?: number;
}

export function StatusBadge({ status, size = 'sm', showCount }: StatusBadgeProps) {
  return (
    <span className={cn(
      'status-badge',
      getStatusColor(status),
      size === 'sm' ? 'text-xs' : 'text-sm'
    )}>
      {getStatusLabel(status)}
      {showCount !== undefined && (
        <span className="ml-1 font-bold">{showCount}</span>
      )}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  return (
    <span className={cn(
      'status-badge',
      getPriorityColor(priority),
      size === 'sm' ? 'text-xs' : 'text-sm'
    )}>
      {getPriorityLabel(priority)}
    </span>
  );
}

interface PlateBadgeProps {
  plateNumber: string;
  plateType: PlateType;
}

export function PlateBadge({ plateNumber, plateType }: PlateBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 font-mono font-bold tracking-wider',
      getPlateTypeColor(plateType)
    )}>
      <span className="text-xs mr-1">{getPlateTypeLabel(plateType)}</span>
      {plateNumber}
    </span>
  );
}

interface CallResultBadgeProps {
  result: CallResult;
}

export function CallResultBadge({ result }: CallResultBadgeProps) {
  const colors: Record<CallResult, string> = {
    connected: 'bg-alert-green/20 text-alert-green border-alert-green/50',
    no_answer: 'bg-text-muted/20 text-text-muted border-text-muted/50',
    refused: 'bg-alert-red/20 text-alert-red border-alert-red/50',
    promised: 'bg-alert-blue/20 text-alert-blue border-alert-blue/50',
  };

  return (
    <span className={cn('status-badge', colors[result])}>
      {getCallResultLabel(result)}
    </span>
  );
}
