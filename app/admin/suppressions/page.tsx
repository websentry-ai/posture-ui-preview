'use client';

import { useState } from 'react';
import { PageHeader, Card, CardHeader } from '@/components/Card';
import { ShieldAlert, EyeOff, FileDown } from 'lucide-react';
import { Toast } from '@/components/Modal';

const sups = [
  { scope: 'Per-instance', finding: '#2 YOLO on sarah.chen', who: 'ciso@corp', reason: 'SOC-842 in progress', expires: '6d' },
  { scope: 'Device-scoped', finding: 'All types on CI-runner-*', who: 'secops@corp', reason: 'CI runner profile', expires: 'Jun 30' },
  { scope: 'Type-mute', finding: '#13 Stale binary', who: 'ciso@corp', reason: 'CrowdStrike owns this', expires: '—' },
  { scope: 'Per-instance', finding: '#4 MITM on corporate proxy CA', who: 'ciso@corp', reason: 'Approved org PKI', expires: '90d' },
  { scope: 'Per-instance', finding: '#1 raj.patel personal acct', who: 'ciso@corp', reason: 'Contractor pre-SSO', expires: '13d' },
  { scope: 'Device-scoped', finding: 'All types on LAPTOP-test-09', who: 'secops@corp', reason: 'Dedicated malware lab', expires: '—' },
];

export default function Page() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2400); };
  return (
    <>
      <PageHeader
        title="Suppressions"
        meta={`${sups.length} active · 3 expiring ≤7d`}
        right={
          <button onClick={() => showToast('Exported suppressions-audit.csv')} className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
            <FileDown className="w-3.5 h-3.5" /> Export audit CSV
          </button>
        }
      />

      {/* Anomaly alert */}
      <Card className="mb-5 border-sev-critical/40">
        <div className="p-5 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-sev-critical shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-unbound-text-primary">
              Waiver anomaly — potential mute, not accepted risk
            </div>
            <div className="text-[12.5px] text-unbound-text-tertiary mt-1 leading-relaxed">
              91% of QA BU (96 / 105 devices) has "#2 YOLO" waived. Approver <span className="mono">j.kim</span> granted 84% of those on a single Friday afternoon. This pattern typically indicates an alert-fatigue mute rather than an accepted-risk decision.
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => showToast('Re-justification required · 96 waivers reset to pending · owner: j.kim')} className="text-[12px] px-2.5 py-1 rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
                Force re-justification
              </button>
              <button onClick={() => showToast("j.kim's waiver history exported · 142 entries")} className="text-[12px] px-2.5 py-1 rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
                Review approver history
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Active suppressions" />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Scope</th>
              <th className="px-3 py-2.5 font-medium">Finding</th>
              <th className="px-3 py-2.5 font-medium">Approver</th>
              <th className="px-3 py-2.5 font-medium">Reason</th>
              <th className="px-3 py-2.5 font-medium">Expires</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {sups.map((s, i) => (
              <tr key={i} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-unbound-bg border border-unbound-border">
                    <EyeOff className="w-3 h-3" /> {s.scope}
                  </span>
                </td>
                <td className="px-3 py-3 font-medium">{s.finding}</td>
                <td className="px-3 py-3 mono text-[12px] text-unbound-text-tertiary">{s.who}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{s.reason}</td>
                <td className="px-3 py-3 text-unbound-text-secondary">{s.expires}</td>
                <td className="px-3 py-3 text-right space-x-1">
                  <button onClick={() => showToast(`Extended ${s.finding} +30d · audit entry written`)} className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
                    Extend
                  </button>
                  <button onClick={() => showToast(`Revoked · ${s.finding} re-opened`)} className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
                    Revoke
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
