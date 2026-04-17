'use client';

import { useState } from 'react';
import { PageHeader, Card, CardHeader } from '@/components/Card';
import { SevBadge } from '@/components/SevBadge';
import { SlidersHorizontal, Play, Info } from 'lucide-react';
import { Toast } from '@/components/Modal';

const rules = [
  { id: 1, name: 'Personal account on managed device', base: 'critical' as const, fp: 1.2, fired: 47, tune: false },
  { id: 2, name: 'YOLO / Bypass mode enabled', base: 'critical' as const, fp: 0, fired: 12, tune: false },
  { id: 3, name: 'Full-access / disabled sandbox', base: 'high' as const, fp: 0.4, fired: 18, tune: false },
  { id: 4, name: 'Base-URL / root-CA override (MITM)', base: 'critical' as const, fp: 3.1, fired: 6, tune: true },
  { id: 5, name: 'Plaintext API keys near agent', base: 'critical' as const, fp: 5.8, fired: 32, tune: true },
  { id: 6, name: 'Unvetted MCP server', base: 'high' as const, fp: 4.2, fired: 47, tune: false },
  { id: 7, name: 'MCP auto-approve for write tools', base: 'high' as const, fp: 2.1, fired: 21, tune: false },
  { id: 8, name: 'Broad Bash auto-allow', base: 'high' as const, fp: 1.8, fired: 88, tune: false },
  { id: 9, name: 'Shell-executing hook (LLM-classified)', base: 'high' as const, fp: 7.8, fired: 38, tune: true },
  { id: 22, name: 'IMDS egress reachable', base: 'critical' as const, fp: 0, fired: 8, tune: false },
];

export default function Page() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2400); };
  return (
    <>
      <PageHeader
        title="Detection rules"
        meta="23 active · 2 info · FP rate · tune"
        right={
          <button onClick={() => showToast('Rule sandbox opened · paste a config to test')} className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Test a rule
          </button>
        }
      />

      <Card>
        <CardHeader
          title="Active rules"
          meta="edit severity · escalators · suppression · test"
        />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">#</th>
              <th className="px-3 py-2.5 font-medium">Rule</th>
              <th className="px-3 py-2.5 font-medium">Base severity</th>
              <th className="px-3 py-2.5 font-medium">FP rate (30d)</th>
              <th className="px-3 py-2.5 font-medium">Fired (30d)</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3 mono text-[12px] text-unbound-text-muted">#{r.id}</td>
                <td className="px-3 py-3 font-medium">{r.name}</td>
                <td className="px-3 py-3"><SevBadge severity={r.base} /></td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={r.fp > 5 ? 'text-sev-high font-medium' : 'text-unbound-text-secondary'}>{r.fp.toFixed(1)}%</span>
                    {r.tune && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sev-medium-bg text-sev-medium">
                        tune?
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{r.fired}</td>
                <td className="px-3 py-3 text-right">
                  <button onClick={() => showToast(`Ran rule #${r.id} against sample corpus · would fire on 4 / 100 configs`)} className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
                    <Play className="w-3 h-3 inline mr-0.5" /> Test
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex items-center gap-2 text-[11.5px] text-unbound-text-tertiary">
        <Info className="w-3.5 h-3.5 shrink-0" />
        FP rate tracked via admin "Not risky" + "Override classification" actions. Published quarterly as the noise-floor SLA (target ≤ 2% on hook classification).
      </div>
      {toast && <Toast message={toast} kind="success" />}
    </>
  );
}
