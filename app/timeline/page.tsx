'use client';

import { useState } from 'react';
import { PageHeader, Card, CardHeader } from '@/components/Card';
import { FileDown } from 'lucide-react';
import { Toast } from '@/components/Modal';
import { Help } from '@/components/Help';

type Event = { t: string; a: string; detail: string; actor: string; kind: 'detection' | 'waiver' | 'policy' | 'user' | 'system' | 'pivot' };

const events: Event[] = [
  { t: '2026-04-17 02:00', a: 'Waiver proposal', detail: 'auto-generated for F-00272 (#4 MITM on marcus.w)', actor: 'system', kind: 'waiver' },
  { t: '2026-04-16 08:00', a: 'Auto-assignment', detail: 'F-00273 (#22 IMDS egress) → cloud-sec team', actor: 'system', kind: 'system' },
  { t: '2026-04-15 21:30', a: 'Detection', detail: 'F-00273 (#22) on devtest-3 — new critical', actor: 'scanner', kind: 'detection' },
  { t: '2026-04-15 18:00', a: 'Detection', detail: 'F-00301 (#9 malicious hook) on TTY4X0ABCD · classifier 0.97', actor: 'scanner', kind: 'detection' },
  { t: '2026-04-15 17:12', a: 'Detection', detail: 'F-00272 (#4 MITM) on PQ77XABC92 — env + cert store', actor: 'scanner', kind: 'detection' },
  { t: '2026-04-15 11:00', a: 'Finding reopened', detail: 'F-00271 on HGXF2XKH45 — claimed fixed, still present', actor: 'scanner', kind: 'detection' },
  { t: '2026-04-15 08:12', a: 'User reply', detail: '"fixed, please rescan" — sarah.chen', actor: 'user', kind: 'user' },
  { t: '2026-04-14 14:00', a: 'Forward user-step fix', detail: 'F-00271 → sarah.chen via email (CISO)', actor: 'vis@unboundsecurity.ai', kind: 'pivot' },
  { t: '2026-04-14 12:17', a: 'Policy deployed', detail: 'claude-perm-ceiling.mobileconfig → 324 devices via Jamf', actor: 'vis@unboundsecurity.ai', kind: 'policy' },
  { t: '2026-04-14 11:03', a: 'Detection', detail: 'F-00284 (#6 unvetted MCP) on TTY4X0ABCD', actor: 'scanner', kind: 'detection' },
  { t: '2026-04-14 09:22', a: 'Detection', detail: 'F-00271 (#2 YOLO) on HGXF2XKH45 — first scan', actor: 'scanner', kind: 'detection' },
  { t: '2026-04-13 17:00', a: 'Snapshot', detail: 'Friday signed snapshot · sha256:e8…91', actor: 'system', kind: 'system' },
];

const kindColor: Record<Event['kind'], string> = {
  detection: 'border-sev-critical bg-sev-critical',
  waiver: 'border-sev-medium bg-sev-medium',
  policy: 'border-sev-low bg-sev-low',
  user: 'border-unbound-purple bg-unbound-purple',
  pivot: 'border-unbound-purple bg-unbound-purple',
  system: 'border-unbound-text-muted bg-unbound-text-muted',
};

type Grouping = 'chronological' | 'actor' | 'kind';

export default function Page() {
  const [toast, setToast] = useState<string | null>(null);
  const [grouping, setGrouping] = useState<Grouping>('chronological');
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2400); };

  const grouped = (() => {
    if (grouping === 'chronological') return { 'All events': events };
    const key = grouping === 'actor' ? 'actor' : 'kind';
    const g: Record<string, Event[]> = {};
    for (const e of events) {
      const k = e[key as keyof Event] as string;
      (g[k] ??= []).push(e);
    }
    return g;
  })();
  return (
    <>
      <PageHeader
        title="Timeline"
        meta={<>Tamper-evident · <Help term="signed hash chain" explain="Every event is SHA-256 chained and anchored hourly to Sigstore/Rekor public transparency log. Third parties can verify evidence wasn't retroactively edited." /></>}
        right={
          <div className="flex items-center gap-2">
            <select
              value={grouping}
              onChange={(e) => setGrouping(e.target.value as Grouping)}
              className="px-3 py-1.5 text-[12px] border border-unbound-border rounded-md bg-white"
            >
              <option value="chronological">Chronological</option>
              <option value="actor">Group by actor</option>
              <option value="kind">Group by kind</option>
            </select>
            <button onClick={() => showToast('timeline-2026Q1.csv + .json · signed manifest · 28 events · 12 anchor hashes')} className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
              <FileDown className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        }
      />

      <Card>
        <CardHeader title="Events" meta={`${events.length} total · chain verified · ${Object.keys(grouped).length} group${Object.keys(grouped).length > 1 ? 's' : ''}`} />
        <div className="p-5 space-y-5">
          {Object.entries(grouped).map(([groupName, groupEvents]) => (
            <div key={groupName}>
              {grouping !== 'chronological' && (
                <div className="text-[11px] uppercase tracking-wider text-unbound-text-muted font-semibold mb-2 flex items-center gap-2">
                  <span>{groupName}</span>
                  <span className="text-unbound-text-tertiary normal-case tracking-normal">· {groupEvents.length} event{groupEvents.length > 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="relative pl-0.5">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-unbound-border" />
                <ol className="space-y-3">
                  {groupEvents.map((e, i) => (
                    <li key={i} className="flex gap-3">
                      <div className={`w-4 h-4 rounded-full bg-white border-2 shrink-0 mt-0.5 ${kindColor[e.kind].split(' ')[0]}`} />
                      <div className="flex-1">
                        <div className="text-[13px] text-unbound-text-primary">
                          <span className="font-semibold">{e.a}</span>
                          <span className="text-unbound-text-tertiary"> — {e.detail}</span>
                        </div>
                        <div className="text-[11px] text-unbound-text-muted mt-0.5">
                          <span className="mono">{e.t}</span> · actor: {e.actor} · kind: {e.kind}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {toast && <Toast message={toast} kind="success" />}
    </>
  );
}
