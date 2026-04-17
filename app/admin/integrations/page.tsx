import { PageHeader, Card } from '@/components/Card';
import { integrations } from '@/lib/mock-data';
import { Check, Plug, AlertCircle } from 'lucide-react';

export default function Page() {
  const byCat: Record<string, typeof integrations> = {};
  for (const i of integrations) {
    if (!byCat[i.category]) byCat[i.category] = [];
    byCat[i.category].push(i);
  }

  return (
    <>
      <PageHeader
        title="Integrations"
        meta="14 connected · 3 not set"
        right={
          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
            <Plug className="w-3.5 h-3.5" /> Add integration
          </button>
        }
      />

      {Object.entries(byCat).map(([cat, items]) => (
        <div key={cat} className="mb-5">
          <div className="text-[11px] uppercase tracking-wider text-unbound-text-muted font-semibold mb-2 px-1">
            {cat}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {items.map((i) => (
              <Card key={i.name} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-[13px] font-semibold text-unbound-text-primary">{i.name}</div>
                  {i.status === 'connected' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide bg-sev-low-bg text-sev-low border border-sev-low/30">
                      <Check className="w-3 h-3" /> live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide bg-unbound-bg text-unbound-text-tertiary border border-unbound-border">
                      <AlertCircle className="w-3 h-3" /> not set
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] text-unbound-text-tertiary space-y-0.5">
                  <div><span className="text-unbound-text-muted">Last event:</span> {i.last}</div>
                  <div><span className="text-unbound-text-muted">Throughput:</span> {i.throughput}</div>
                </div>
                <div className="mt-3 flex gap-1">
                  {i.status === 'connected' ? (
                    <>
                      <button className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
                        Configure
                      </button>
                      <button className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
                        Test
                      </button>
                    </>
                  ) : (
                    <button className="text-[11px] px-2 py-1 rounded bg-unbound-purple text-white hover:bg-unbound-purple-hover">
                      Connect
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
