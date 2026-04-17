import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export const sevColor: Record<Severity, string> = {
  critical: 'bg-sev-critical-bg text-sev-critical border-sev-critical/20',
  high: 'bg-sev-high-bg text-sev-high border-sev-high/20',
  medium: 'bg-sev-medium-bg text-sev-medium border-sev-medium/20',
  low: 'bg-sev-low-bg text-sev-low border-sev-low/20',
  info: 'bg-sev-info-bg text-sev-info border-sev-info/20',
};

export const sevDot: Record<Severity, string> = {
  critical: 'bg-sev-critical',
  high: 'bg-sev-high',
  medium: 'bg-sev-medium',
  low: 'bg-sev-low',
  info: 'bg-sev-info',
};
