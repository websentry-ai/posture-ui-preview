'use client';

import { useState } from 'react';
import { PageHeader, Card, CardHeader } from '@/components/Card';
import { heatmap } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

function cell(n: number, tier: 'c' | 'h' | 'm' | 'l') {
  if (n === 0) return <span className="text-unbound-text-muted">—</span>;
  const clsByTier: Record<string, string> = {
    c: 'bg-sev-critical-bg text-sev-critical border-sev-critical/30',
    h: 'bg-sev-high-bg text-sev-high border-sev-high/30',
    m: 'bg-sev-medium-bg text-sev-medium border-sev-medium/30',
    l: 'bg-sev-low-bg text-sev-low border-sev-low/30',
  };
  return (
    <span className={cn('inline-flex items-center justify-center min-w-[36px] px-2 py-1 rounded border text-[12px] font-semibold', clsByTier[tier])}>
      {n}
    </span>
  );
}

type Slice = 'BU' | 'Geo' | 'Agent' | 'Device profile';

const sliceData: Record<Slice, typeof heatmap> = {
  BU: heatmap,
  Geo: [
    { bu: 'US-East', c: 3, h: 2, m: 1, l: 0, waived: 4, mttr: '2.1d' },
    { bu: 'US-West', c: 1, h: 1, m: 0, l: 0, waived: 0, mttr: '1.2d' },
    { bu: 'EU-Dublin', c: 1, h: 0, m: 0, l: 0, waived: 0, mttr: '0.8d' },
    { bu: 'UK-London', c: 1, h: 0, m: 0, l: 0, waived: 8, mttr: '4.7d' },
    { bu: 'IN-Bangalore', c: 0, h: 1, m: 0, l: 0, waived: 2, mttr: '3.4d' },
  ],
  Agent: [
    { bu: 'Claude Code', c: 4, h: 2, m: 1, l: 0, waived: 2, mttr: '2.4d' },
    { bu: 'Cursor', c: 1, h: 0, m: 0, l: 0, waived: 8, mttr: '3.1d' },
    { bu: 'Codex', c: 1, h: 0, m: 0, l: 0, waived: 0, mttr: '0.8d' },
  ],
  'Device profile': [
    { bu: 'corp-managed', c: 4, h: 2, m: 1, l: 0, waived: 4, mttr: '2.1d' },
    { bu: 'BYOD', c: 1, h: 0, m: 0, l: 0, waived: 8, mttr: '4.7d' },
    { bu: 'CI runner', c: 1, h: 0, m: 0, l: 0, waived: 0, mttr: '0.8d' },
  ],
};

export default function HeatmapPage() {
  const [slice, setSlice] = useState<Slice>('BU');
  const rows = sliceData[slice];
  return (
    <>
      <PageHeader
        title="Fleet heatmap"
        meta={`${slice} × Severity · click a cell to drill`}
        right={
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-unbound-text-tertiary">Slice:</span>
            <div className="inline-flex rounded-md border border-unbound-border bg-white overflow-hidden">
              {(['BU', 'Geo', 'Agent', 'Device profile'] as Slice[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSlice(s)}
                  className={cn(
                    'px-2.5 py-1',
                    slice === s ? 'bg-unbound-purple/10 text-unbound-purple font-medium' : 'text-unbound-text-tertiary hover:bg-unbound-bg-hover'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <Card>
        <CardHeader title={`${slice} × Severity`} />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border">
              <th className="px-5 py-2.5 text-left font-medium">BU</th>
              <th className="px-3 py-2.5 text-center font-medium">Critical</th>
              <th className="px-3 py-2.5 text-center font-medium">High</th>
              <th className="px-3 py-2.5 text-center font-medium">Medium</th>
              <th className="px-3 py-2.5 text-center font-medium">Low</th>
              <th className="px-3 py-2.5 text-center font-medium">Waived</th>
              <th className="px-3 py-2.5 text-center font-medium">MTTR</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.bu} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3 font-medium">{row.bu}</td>
                <td className="px-3 py-3 text-center">{cell(row.c, 'c')}</td>
                <td className="px-3 py-3 text-center">{cell(row.h, 'h')}</td>
                <td className="px-3 py-3 text-center">{cell(row.m, 'm')}</td>
                <td className="px-3 py-3 text-center">{cell(row.l, 'l')}</td>
                <td className="px-3 py-3 text-center text-unbound-text-tertiary">{row.waived || '—'}</td>
                <td className="px-3 py-3 text-center mono text-[12px]">{row.mttr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
