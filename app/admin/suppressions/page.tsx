'use client';

import { useState } from 'react';
import { PageHeader, Card, CardHeader } from '@/components/Card';
import { ShieldAlert, EyeOff, FileDown, AlertTriangle, Users, Clock } from 'lucide-react';
import { Toast } from '@/components/Modal';
import { cn } from '@/lib/utils';

const sups = [
  { scope: 'Per-instance', finding: '#2 YOLO on sarah.chen', who: 'ciso@corp', reason: 'SOC-842 in progress', expires: '6d' },
  { scope: 'Device-scoped', finding: 'All types on CI-runner-*', who: 'secops@corp', reason: 'CI runner profile', expires: 'Jun 30' },
  { scope: 'Type-mute', finding: '#13 Stale binary', who: 'ciso@corp', reason: 'CrowdStrike owns this', expires: '—' },
  { scope: 'Per-instance', finding: '#4 MITM on corporate proxy CA', who: 'ciso@corp', reason: 'Approved org PKI', expires: '90d' },
  { scope: 'Per-instance', finding: '#1 raj.patel personal acct', who: 'ciso@corp', reason: 'Contractor pre-SSO', expires: '13d' },
  { scope: 'Device-scoped', finding: 'All types on LAPTOP-test-09', who: 'secops@corp', reason: 'Dedicated malware lab', expires: '—' },
];

const approvers = [
  { name: 'j.kim', role: 'SOC Lead', waivers90d: 142, waiversOnOneFriday: 96, concentrationPct: 68, riskLevel: 'critical' as const, note: 'Batch-approved 96 YOLO waivers on Fri 2026-03-28 within 11 min window' },
  { name: 'secops@corp', role: 'SecOps team', waivers90d: 34, waiversOnOneFriday: 0, concentrationPct: 12, riskLevel: 'low' as const, note: 'Distributed approvals · no concentration pattern' },
  { name: 'ciso@corp', role: 'CISO', waivers90d: 18, waiversOnOneFriday: 0, concentrationPct: 6, riskLevel: 'low' as const, note: 'Executive-level approvals · documented reasons' },
];

const patterns = [
  { pattern: 'Same finding type, same approver, same day, ≥30 waivers', cases: 1, severity: 'critical' as const, example: 'j.kim / #2 YOLO / 2026-03-28 / 96 waivers in 11 min' },
  { pattern: 'BU with >80% waiver rate on a finding type', cases: 1, severity: 'critical' as const, example: 'QA BU / #2 YOLO / 91% waived' },
  { pattern: 'Waiver reason uses ≤3 distinct strings across ≥20 waivers', cases: 2, severity: 'high' as const, example: 'j.kim uses "noisy" on 72 waivers' },
  { pattern: 'Waiver expiring ≤7d without renewal ticket', cases: 3, severity: 'medium' as const, example: '3 critical findings expiring between Apr 18-22' },
];

type Tab = 'active' | 'anomaly' | 'audit';

export default function Page() {
  const [tab, setTab] = useState<Tab>('anomaly');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2400); };

  return (
    <>
      <PageHeader
        title="Suppressions"
        meta={`${sups.length} active · 3 expiring ≤7d · 4 anomaly patterns detected`}
        right={
          <button onClick={() => showToast('Exported suppressions-audit.csv')} className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
            <FileDown className="w-3.5 h-3.5" /> Export audit CSV
          </button>
        }
      />

      <div className="flex items-center gap-6 border-b border-unbound-border mb-4 text-[13px]">
        {([
          ['anomaly', <>Anomaly review <span className="ml-1 inline-flex items-center px-1.5 py-0 rounded-full bg-sev-critical text-white text-[10px] font-semibold">4</span></>, 'anomaly' as Tab],
          ['active', `Active suppressions (${sups.length})`, 'active' as Tab],
          ['audit', 'Audit log', 'audit' as Tab],
        ] as const).map(([key, label, val]) => (
          <button
            key={key}
            onClick={() => setTab(val)}
            className={cn(
              'py-2 flex items-center gap-1',
              tab === val
                ? 'border-b-2 border-unbound-purple font-semibold text-unbound-text-primary'
                : 'text-unbound-text-tertiary hover:text-unbound-text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'anomaly' && <AnomalyTab showToast={showToast} />}
      {tab === 'active' && <ActiveTab sups={sups} showToast={showToast} />}
      {tab === 'audit' && <AuditTab />}

      {toast && <Toast message={toast} kind="success" />}
    </>
  );
}

function AnomalyTab({ showToast }: { showToast: (m: string) => void }) {
  return (
    <>
      {/* Headline */}
      <Card className="mb-5 border-sev-critical/40">
        <div className="p-5 flex items-start gap-3 bg-sev-critical-bg/40">
          <ShieldAlert className="w-5 h-5 text-sev-critical shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold text-unbound-text-primary">
              Waiver governance is drifting from policy
            </div>
            <div className="text-[12.5px] text-unbound-text-tertiary mt-1 leading-relaxed">
              The waiver ledger shows <span className="font-semibold text-unbound-text-primary">4 patterns</span> that typically indicate alert-fatigue suppression rather than accepted-risk decisions. Review each below.
            </div>
          </div>
        </div>
      </Card>

      {/* Patterns */}
      <Card className="mb-5">
        <CardHeader title="Detected patterns" meta="auto-run nightly · thresholds configurable in /admin/rules" />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Pattern</th>
              <th className="px-3 py-2.5 font-medium">Cases</th>
              <th className="px-3 py-2.5 font-medium">Example</th>
              <th className="px-3 py-2.5 font-medium">Severity</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {patterns.map((p, i) => (
              <tr key={i} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3 text-unbound-text-secondary">{p.pattern}</td>
                <td className="px-3 py-3 font-semibold">{p.cases}</td>
                <td className="px-3 py-3 text-[11.5px] text-unbound-text-tertiary mono">{p.example}</td>
                <td className="px-3 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase',
                      p.severity === 'critical' ? 'bg-sev-critical-bg text-sev-critical border border-sev-critical/30' :
                      p.severity === 'high' ? 'bg-sev-high-bg text-sev-high border border-sev-high/30' :
                      'bg-sev-medium-bg text-sev-medium border border-sev-medium/30'
                    )}
                  >
                    {p.severity}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <button onClick={() => showToast(`Opened pattern drilldown: ${p.pattern}`)} className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Approver concentration */}
      <Card>
        <CardHeader
          title="Approver concentration"
          meta="who's waiving how much — outliers flagged"
          right={<Users className="w-4 h-4 text-unbound-purple" />}
        />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Approver</th>
              <th className="px-3 py-2.5 font-medium">Role</th>
              <th className="px-3 py-2.5 font-medium">Waivers (90d)</th>
              <th className="px-3 py-2.5 font-medium">Worst single day</th>
              <th className="px-3 py-2.5 font-medium">Fleet share</th>
              <th className="px-3 py-2.5 font-medium">Signal</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {approvers.map((a) => (
              <tr key={a.name} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3 mono font-medium">{a.name}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{a.role}</td>
                <td className={cn('px-3 py-3 font-semibold', a.riskLevel === 'critical' ? 'text-sev-critical' : '')}>
                  {a.waivers90d}
                </td>
                <td className={cn('px-3 py-3', a.waiversOnOneFriday > 50 ? 'text-sev-critical font-semibold' : 'text-unbound-text-tertiary')}>
                  {a.waiversOnOneFriday > 0 ? `${a.waiversOnOneFriday} in one day` : '—'}
                </td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{a.concentrationPct}%</td>
                <td className="px-3 py-3 text-[11.5px] text-unbound-text-tertiary">{a.note}</td>
                <td className="px-3 py-3 text-right">
                  {a.riskLevel === 'critical' && (
                    <button
                      onClick={() => showToast(`Re-justification required · ${a.waivers90d} waivers from ${a.name} reset to pending`)}
                      className="text-[11px] px-2 py-1 rounded bg-sev-critical text-white hover:bg-sev-critical/90"
                    >
                      Force re-justify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 text-[11px] text-unbound-text-tertiary flex items-center gap-1.5">
        <AlertTriangle className="w-3 h-3" />
        Anomaly detection runs nightly. Rule thresholds (approver concentration %, BU waiver %, pattern duplication) are configurable in Detection Rules.
      </div>
    </>
  );
}

function ActiveTab({ sups, showToast }: { sups: any[]; showToast: (m: string) => void }) {
  return (
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
          {(sups as any[]).map((s: any, i: number) => (
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
  );
}

function AuditTab() {
  const events = [
    { t: '2026-04-17 09:12', e: 'Anomaly detection ran · 4 patterns flagged' },
    { t: '2026-04-16 14:00', e: 'Waiver granted · #2 YOLO on sarah.chen · ciso@corp · 7d expiry' },
    { t: '2026-04-15 11:00', e: 'Waiver auto-revoked · #4 MITM marcus.w · scanner confirmed recurrence' },
    { t: '2026-03-28 17:12', e: 'Batch approval · j.kim · 96 waivers of #2 YOLO in 11 min · FLAGGED BY PATTERN' },
  ];
  return (
    <Card>
      <CardHeader title="Audit log" meta="tamper-evident · signed hash chain · last 90d" />
      <ol className="p-5 space-y-2 text-[12.5px]">
        {events.map((x, i) => (
          <li key={i} className="flex gap-3 items-start">
            <Clock className="w-3 h-3 text-unbound-text-muted mt-1 shrink-0" />
            <span className="mono text-[11px] text-unbound-text-muted w-36 shrink-0">{x.t}</span>
            <span className="text-unbound-text-secondary flex-1">{x.e}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
