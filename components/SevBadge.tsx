import { cn, sevColor, sevDot, type Severity } from '@/lib/utils';

export function SevBadge({ severity, children }: { severity: Severity; children?: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium uppercase tracking-wide',
        sevColor[severity]
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', sevDot[severity])} />
      {children ?? severity}
    </span>
  );
}

export function SevPill({ severity, label }: { severity: Severity; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[12px]',
        sevColor[severity]
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', sevDot[severity])} />
      {label}
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-unbound-bg text-unbound-text-tertiary border border-unbound-border">
      {children}
    </span>
  );
}
