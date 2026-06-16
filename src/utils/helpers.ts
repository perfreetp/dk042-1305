import type { DispatchStatus, Priority, PlateType, CallResult } from '../types';
import { DISPATCH_STATUS_LABELS, PRIORITY_LABELS, PLATE_TYPE_LABELS, CALL_RESULT_LABELS } from '../types';

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}天${remainingHours > 0 ? `${remainingHours}小时` : ''}${mins > 0 ? `${mins}分钟` : ''}`;
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getStatusLabel(status: DispatchStatus): string {
  return DISPATCH_STATUS_LABELS[status] || status;
}

export function getPriorityLabel(priority: Priority): string {
  return PRIORITY_LABELS[priority] || priority;
}

export function getPlateTypeLabel(type: PlateType): string {
  return PLATE_TYPE_LABELS[type] || type;
}

export function getCallResultLabel(result: CallResult): string {
  return CALL_RESULT_LABELS[result] || result;
}

export function getStatusColor(status: DispatchStatus): string {
  const colors: Record<DispatchStatus, string> = {
    pending: 'bg-alert-yellow/20 text-alert-yellow border-alert-yellow/50',
    dispatched: 'bg-alert-blue/20 text-alert-blue border-alert-blue/50',
    notice_sent: 'bg-alert-orange/20 text-alert-orange border-alert-orange/50',
    communicating: 'bg-alert-orange/30 text-alert-orange border-alert-orange/50',
    moved: 'bg-alert-green/20 text-alert-green border-alert-green/50',
    tow_candidate: 'bg-alert-red/20 text-alert-red border-alert-red/50',
    tow_approved: 'bg-alert-red/30 text-alert-red border-alert-red/50',
    tow_executed: 'bg-alert-red/40 text-alert-red border-alert-red/50',
    closed: 'bg-text-muted/20 text-text-muted border-text-muted/50',
  };
  return colors[status] || colors.pending;
}

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    low: 'bg-text-muted/20 text-text-muted border-text-muted/50',
    medium: 'bg-alert-blue/20 text-alert-blue border-alert-blue/50',
    high: 'bg-alert-orange/20 text-alert-orange border-alert-orange/50',
    urgent: 'bg-alert-red/20 text-alert-red border-alert-red/50 animate-pulse-fast',
  };
  return colors[priority] || colors.low;
}

export function getPlateTypeColor(type: PlateType): string {
  const colors: Record<PlateType, string> = {
    blue: 'bg-blue-600 text-white',
    green: 'bg-green-600 text-white',
    yellow: 'bg-yellow-500 text-black',
    white: 'bg-white text-black',
  };
  return colors[type] || colors.blue;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getOvertimeSeverity(minutes: number): 'normal' | 'warning' | 'danger' {
  if (minutes < 480) return 'normal';
  if (minutes < 1440) return 'warning';
  return 'danger';
}

export function calculatePerformance(rates: { total: number; completed: number; moved: number; tow: number; avgResponse: number; avgProcess: number; contactRate: number }) {
  const completionRate = rates.total > 0 ? (rates.completed / rates.total) * 100 : 0;
  const grade = completionRate >= 90 ? 'A' : completionRate >= 75 ? 'B' : completionRate >= 60 ? 'C' : 'D';
  return { completionRate, grade };
}
