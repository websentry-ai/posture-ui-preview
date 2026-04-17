'use client';

import { useState } from 'react';
import { PageHeader, Card, CardHeader } from '@/components/Card';
import { GitBranch, Eye } from 'lucide-react';
import Link from '@/components/AppLink';
import { Toast } from '@/components/Modal';
import { cn } from '@/lib/utils';

const drifts = [
  {
    device: 'HGXF2XKH45',
    user: 'sarah.chen',
    agent: 'Claude',
    type: 'sandbox.enabled: true → false',
    detected: '2h ago',
    material: true,
    diff: [
      { before: '"sandbox": { "enabled": true }', after: '"sandbox": { "enabled": false }' },
    ],
  },
  {
    device: 'TTY4X0ABCD',
    user: 'jenna.l',
    agent: 'Cursor',
    type: 'mcp.json: +unofficial-gh-mcp@latest',
    detected: '4h ago',
    material: true,
  },
  {
    device: 'K43J9S77Z0',
    user: 'devtest-3',
    agent: 'Codex',
    type: 'writable_roots: ["./"] → ["/"]',
    detected: '1d ago',
    material: true,
  },
  {
    device: 'PQ77XABC92',
    user: 'marcus.w',
    agent: 'Claude',
    type: 'prettier hook added to settings',
    detected: '5h ago',
    material: false,
  },
];

export default function Page() {
  const [filter, setFilter] = useState<'material' | 'all'>('material');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2400); };
  const rows = filter === 'material' ? drifts.filter((d) => d.material) : drifts;
  return (
    <>
      <PageHeader
        title="Drift"
        meta="287 baselined · 12,418 signed snapshots · hourly Sigstore anchor · key sha256:7d…a81c"
        right={
          <div className="inline-flex rounded-md border border-unbound-border bg-white overflow-hidden text-[12px]">
            <button onClick={() => setFilter('material')} className={cn('px-3 py-1.5', filter === 'material' ? 'bg-unbound-purple/10 text-unbound-purple font-medium' : 'text-unbound-text-tertiary hover:bg-unbound-bg-hover')}>Material only</button>
            <button onClick={() => setFilter('all')} className={cn('px-3 py-1.5', filter === 'all' ? 'bg-unbound-purple/10 text-unbound-purple font-medium' : 'text-unbound-text-tertiary hover:bg-unbound-bg-hover')}>All drift</button>
          </div>
        }
      />

      <Card>
        <CardHeader
          title="Recent drift events"
          meta="#25 · signed baseline · diff on material change"
          right={<GitBranch className="w-4 h-4 text-unbound-purple" />}
        />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Device</th>
              <th className="px-3 py-2.5 font-medium">Agent</th>
              <th className="px-3 py-2.5 font-medium">Drift type</th>
              <th className="px-3 py-2.5 font-medium">Detected</th>
              <th className="px-3 py-2.5 font-medium">Material?</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => (
              <tr key={i} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3 mono text-[12px]">
                  <Link href={`/fleet/devices/${d.device}`} className="text-unbound-purple hover:underline">
                    {d.device}
                  </Link>
                  <div className="text-[11px] text-unbound-text-tertiary font-sans">{d.user}</div>
                </td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{d.agent}</td>
                <td className="px-3 py-3 mono text-[12px]">{d.type}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{d.detected}</td>
                <td className="px-3 py-3">
                  {d.material ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sev-critical-bg text-sev-critical border border-sev-critical/30">
                      YES
                    </span>
                  ) : (
                    <span className="text-unbound-text-muted">no</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right space-x-1">
                  <button onClick={() => showToast(`Diff opened for ${d.device}`)} className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
                    <Eye className="w-3 h-3 inline mr-0.5" /> Diff
                  </button>
                  <button onClick={() => showToast('Marked expected · baseline updated')} className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
                    Mark expected
                  </button>
                  <button onClick={() => showToast(`${d.device} re-baselined · signed sha256:${Math.random().toString(16).slice(2, 6)}…`)} className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
                    Re-baseline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {toast && <Toast message={toast} kind="success" />}
    </>
  );
}
