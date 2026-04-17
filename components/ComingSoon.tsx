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
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-unbound-purple/5 to-white border-b border-unbound-border">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-unbound-purple/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-unbound-purple" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-unbound-purple font-semibold">
                Coming {shipTarget}
              </div>
              <h2 className="text-[16px] font-semibold text-unbound-text-primary mt-0.5">
                What this page will do
              </h2>
              <p className="text-[13px] text-unbound-text-tertiary mt-1 max-w-2xl">
                {subtitle} The sections below describe the contract — schema is already modeled in the detection pipeline.
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {bullets.map((b, i) => (
            <div key={i}>
              <div className="text-[13px] font-semibold text-unbound-text-primary">{b.h}</div>
              <div className="text-[12.5px] text-unbound-text-tertiary mt-0.5 leading-relaxed">{b.d}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
