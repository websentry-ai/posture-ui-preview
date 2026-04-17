import { cn } from '@/lib/utils';

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-unbound-border',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, meta, subtitle, right }: { title: string; meta?: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-unbound-border">
      <div className="flex items-baseline gap-2">
        <h3 className="text-[14px] font-semibold text-unbound-text-primary">{title}</h3>
        {(meta ?? subtitle) && <span className="text-[11px] text-unbound-text-muted">{meta ?? subtitle}</span>}
      </div>
      {right}
    </div>
  );
}

export function PageHeader({
  title,
  meta,
  subtitle,
  right,
}: {
  title: string;
  meta?: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-5 gap-4">
      <div>
        <h1 className="text-[22px] font-bold text-unbound-text-primary tracking-tight">{title}</h1>
        {(meta ?? subtitle) && (
          <p className="text-[12px] text-unbound-text-muted mt-1">{meta ?? subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}
