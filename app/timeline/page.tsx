'use client';

import { useState } from 'react';
import { PageHeader, Card, CardHeader } from '@/components/Card';
import { FileDown } from 'lucide-react';
import { Toast } from '@/components/Modal';

const events = [
  { t: '2026-04-17 02:00', a: 'Waiver proposal', detail: 'auto-generated for F-00272 (#4 MITM on marcus.w)', actor: 'system' },
  { t: '2026-04-16 08:00', a: 'Auto-assignment', detail: 'F-00273 (#22 IMDS egress) → cloud-sec team', actor: 'system' },
  { t: '2026-04-15 21:30', a: 'Detection', detail: 'F-00273 (#22) on devtest-3 — new critical', actor: 'scanner' },
  { t: '2026-04-15 18:00', a: 'Detection', detail: 'F-00301 (#9 malicious hook) on TTY4X0ABCD · classifier 0.97', actor: 'scanner' },
  { t: '2026-04-15 17:12', a: 'Detection', detail: 'F-00272 (#4 MITM) on PQ77XABC92 — env + cert store', actor: 'scanner' },
  { t: '2026-04-15 11:00', a: 'Finding reopened', detail: 'F-00271 on HGXF2XKH45 — claimed fixed, still present', actor: 'scanner' },
  { t: '2026-04-15 08:12', a: 'User reply', detail: '"fixed, please rescan" — sarah.chen', actor: 'user' },
  { t: '2026-04-14 14:00', a: 'Forward user-step fix', detail: 'F-00271 → sarah.chen via email (CISO)', actor: 'vis@unboundsecurity.ai' },
  { t: '2026-04-14 12:17', a: 'Policy deployed', detail: 'claude-perm-ceiling.mobileconfig → 324 devices via Jamf', actor: 'vis@unboundsecurity.ai' },
  { t: '2026-04-14 11:03', a: 'Detection', detail: 'F-00284 (#6 unvetted MCP) on TTY4X0ABCD', actor: 'scanner' },
  { t: '2026-04-14 09:22', a: 'Detection', detail: 'F-00271 (#2 YOLO) on HGXF2XKH45 — first scan', actor: 'scanner' },
  { t: '2026-04-13 17:00', a: 'Snapshot', detail: 'Friday signed snapshot · sha256:e8…91', actor: 'system' },
];

export default function Page() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2400); };
  return (
    <>
      <PageHeader
        title="Timeline"
        meta="Tamper-evident · signed hash chain"
        right={
          <div className="flex items-center gap-2">
            <select className="px-3 py-1.5 text-[12px] border border-unbound-border rounded-md bg-white">
              <option>Scope: Fleet</option>
              <option>Scope: Eng-Platform BU</option>
              <option>Scope: sarah.chen</option>
            </select>
            <select className="px-3 py-1.5 text-[12px] border border-unbound-border rounded-md bg-white">
              <option>Range: Q1 2026</option>
              <option>Range: Q4 2025</option>
              <option>Range: Last 30 days</option>
              <option>Range: Custom…</option>
            </select>
            <button onClick={() => showToast('timeline-2026Q1.csv + .json · signed manifest · 28 events · 12 anchor hashes')} className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
              <FileDown className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        }
      />

      <Card>
        <CardHeader title="Events" meta={`${events.length} · chain verified`} />
        <div className="p-5">
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-unbound-border" />
            <ol className="space-y-4">
              {events.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-4 h-4 rounded-full bg-white border-2 border-unbound-purple shrink-0 mt-0.5" />
                  <div className="flex-1 flex items-baseline justify-between">
                    <div>
                      <div className="text-[13px] text-unbound-text-primary">
                        <span className="font-semibold">{e.a}</span>
                        <span className="text-unbound-text-tertiary"> — {e.detail}</span>
                      </div>
                      <div className="text-[11px] text-unbound-text-muted mt-0.5">
                        <span className="mono">{e.t}</span> · actor: {e.actor}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Card>
      {toast && <Toast message={toast} kind="success" />}
    </>
  );
}
