import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lightweight native-tooltip wrapper. Uses browser `title` so we get
// accessibility for free, no z-index bugs, no JS cost. Short text only.
export function Help({
  term,
  explain,
  className,
}: {
  term: React.ReactNode;
  explain: string;
  className?: string;
}) {
  return (
    <span title={explain} className={cn('inline-flex items-center gap-0.5 cursor-help decoration-dotted underline underline-offset-2', className)}>
      {term}
      <Info className="w-3 h-3 text-unbound-text-muted shrink-0" aria-hidden />
    </span>
  );
}
