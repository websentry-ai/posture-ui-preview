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

export function CardHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-unbound-border">
      <div>
        <h3 className="text-[14px] font-semibold text-unbound-text-primary">{title}</h3>
        {subtitle && <p className="text-[12px] text-unbound-text-tertiary mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-[20px] font-semibold text-unbound-text-primary">{title}</h1>
        {subtitle && (
          <p className="text-[13px] text-unbound-text-tertiary mt-1">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}
