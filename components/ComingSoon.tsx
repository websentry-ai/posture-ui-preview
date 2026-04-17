import { PageHeader, Card } from '@/components/Card';
import { Sparkles } from 'lucide-react';

export default function ComingSoon({
  title,
  subtitle,
  bullets,
  shipTarget,
}: {
  title: string;
  subtitle: string;
  bullets: { h: string; d: string }[];
  shipTarget: string;
}) {
  return (
    <>
      <PageHeader title={title} meta={`Shipping ${shipTarget}`} />
      <Card className="p-5">
        <div className="flex items-start gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-unbound-purple shrink-0 mt-0.5" />
          <p className="text-[13px] text-unbound-text-secondary leading-relaxed">{subtitle}</p>
        </div>
        <ul className="space-y-1 text-[12.5px] text-unbound-text-tertiary">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-unbound-text-muted">·</span>
              <span><span className="font-medium text-unbound-text-secondary">{b.h}.</span> {b.d}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
