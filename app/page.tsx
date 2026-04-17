'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, PageHeader } from '@/components/Card';
import { SevBadge, Chip } from '@/components/SevBadge';
import {
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  ShieldAlert,
  EyeOff,
  Clock3,
  ChevronRight,
  FileDown,
  Zap,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fleet, severityCounts, findings } from '@/lib/mock-data';
import BreakChainModal from '@/components/BreakChainModal';
import { Toast } from '@/components/Modal';
import { useStore, type PendingAction } from '@/lib/store';

function Tile({
  label,
  value,
  delta,
  deltaDir,
  href,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaDir?: 'up' | 'down' | 'flat';
  href?: string;
}) {
  const dirColor =
    deltaDir === 'up'
      ? 'text-sev-critical'
      : deltaDir === 'down'
      ? 'text-sev-low'
      : 'text-unbound-text-muted';
  const Arrow = deltaDir === 'up' ? ArrowUp : deltaDir === 'down' ? ArrowDown : null;
  return (
    <Link
      href={href ?? '/issues'}
      className="block p-4 hover:bg-unbound-bg-hover transition-colors"
    >
      <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted">{label}</div>
      <div className="flex items-baseline gap-2 mt-1">
        <div className="text-[24px] font-semibold text-unbound-text-primary">{value}</div>
        {delta && (
          <div className={cn('text-[12px] font-medium flex items-center gap-0.5', dirColor)}>
            {Arrow && <Arrow className="w-3 h-3" />}
            {delta}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Overview() {
  const sev = severityCounts(findings);
  const [chainOpen, setChainOpen] = useState<null | { chain: string; devices: string[] }>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [toast, setToast] = useState<string | null>(null);
  const [pending, actions] = useStore((s) => s.pendingActions);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2800); };

  return (
    <>
      <PageHeader
        title="Overview"
        meta="Last scan 38 min ago"
        right={
          <div className="flex gap-2">
            <div className="inline-flex rounded-md border border-unbound-border bg-white overflow-hidden text-[12px]">
              {(['day', 'week', 'month'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={cn(
                    'px-3 py-1.5 capitalize',
                    timeRange === t
                      ? 'bg-unbound-purple/10 text-unbound-purple font-medium'
                      : 'text-unbound-text-tertiary hover:bg-unbound-bg-hover'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={() => showToast('Signed PDF generated · posture-Q1-2026.pdf · sha256:7d…a81c')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover"
            >
              <FileDown className="w-3.5 h-3.5" />
              Export signed PDF
            </button>
          </div>
        }
      />

      {/* Consolidated KPI + coverage strip */}
      <Card className="mb-5">
        <div className="grid grid-cols-4 divide-x divide-unbound-border">
          <Tile label="Critical" value={sev.critical} delta="+1" deltaDir="up" href="/issues" />
          <Tile label="High" value={sev.high} delta="+2" deltaDir="up" href="/issues" />
          <Tile label="MTTR Critical" value="2.1d" />
          <Tile label="Dark fleet" value={228} delta="+3" deltaDir="up" href="/fleet/devices" />
        </div>
        <div className="grid grid-cols-4 divide-x divide-t divide-unbound-border border-t border-unbound-border">
          <CoverageTile icon={<Eye className="w-3.5 h-3.5 text-sev-low" />} label="Scanning" value={fleet.scannerInstalled} href="/fleet/devices" />
          <CoverageTile icon={<Clock3 className="w-3.5 h-3.5 text-sev-medium" />} label="Stale >24h" value={fleet.scannerStale} href="/fleet/devices" />
          <CoverageTile icon={<EyeOff className="w-3.5 h-3.5 text-sev-critical" />} label="No scanner" value={228} href="/admin/setup" />
          <CoverageTile icon={<AlertTriangle className="w-3.5 h-3.5 text-sev-high" />} label="BYOD opt-in" value={15} href="/fleet/byod" />
        </div>
      </Card>

      {/* Pending actions — visible side effects from Break chain / Freeze / approvals */}
      {pending.length > 0 && (
        <Card className="mb-5 border-unbound-purple/30">
          <CardHeader title="Pending actions" meta={`${pending.length} live · refreshes every 60s`} right={<Zap className="w-4 h-4 text-unbound-purple" />} />
          <div className="divide-y divide-unbound-border">
            {pending.map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between text-[13px]">
                <div>
                  <div className="font-medium text-unbound-text-primary">{a.label}</div>
                  <div className="text-[12px] text-unbound-text-tertiary mt-0.5">{a.detail}</div>
                </div>
                <div className="flex items-center gap-3">
                  {a.eta && <span className="text-[11px] text-unbound-text-muted">ETA {a.eta}</span>}
                  <button onClick={() => actions.removeAction(a.id)} className="text-[11px] text-unbound-text-tertiary hover:text-unbound-text-primary">
                    Clear
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SLA + WAIVERS */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader title="SLA breaches" />
          <div className="p-5 space-y-3 text-[13px]">
            <Row label="Critical > 24h unresolved" value={<Link href="/issues" className="flex items-center gap-1 font-semibold text-sev-critical">1 <ChevronRight className="w-3.5 h-3.5" /></Link>} />
            <Row label="High > 7d unresolved" value={<span className="font-semibold text-unbound-text-tertiary">0</span>} />
            <Row label="MTTR Critical" value={<span className="font-semibold">2.1d</span>} />
            <Row label="MTTR High" value={<span className="font-semibold">4.2h</span>} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Waiver governance" meta="6 active · 3 expiring ≤7d" />
          <div className="p-5 space-y-3 text-[13px]">
            <Link href="/admin/suppressions" className="block p-3 rounded-md bg-sev-critical-bg border border-sev-critical/20 hover:bg-sev-critical-bg/80">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-sev-critical shrink-0 mt-0.5" />
                <div className="text-[12.5px]">
                  <div className="font-semibold text-sev-critical">Waiver anomaly</div>
                  <div className="text-unbound-text-secondary mt-0.5 leading-snug">
                    91% of QA BU has #2 YOLO waived by a single approver on one Friday. Likely a mute.
                  </div>
                </div>
              </div>
            </Link>
            <Row label="Expiring ≤ 30 days" value={<span className="font-semibold">23</span>} />
          </div>
        </Card>
      </div>

      {/* TOP 5 + ATTACK PATHS */}
      <div className="grid grid-cols-5 gap-5 mb-5">
        <Card className="col-span-3">
          <CardHeader title="Top risk-weighted devices" />
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border">
                <th className="px-5 py-2 font-medium">User</th>
                <th className="px-3 py-2 font-medium">BU</th>
                <th className="px-3 py-2 font-medium">Severity</th>
                <th className="px-3 py-2 font-medium">Escalators</th>
              </tr>
            </thead>
            <tbody>
              {[
                { u: 'sarah.chen', bu: 'Eng-Platform', sev: '3C / 5H', esc: ['cloud creds', 'admin', 'prod repos'], s: 'critical' as const, id: 'HGXF2XKH45' },
                { u: 'devtest-3', bu: 'QA', sev: '2C / 1H', esc: ['IMDS reach', 'no sandbox'], s: 'critical' as const, id: 'K43J9S77Z0' },
                { u: 'marcus.w', bu: 'Finance', sev: '1C / 7H', esc: ['BYOD', 'corp repos', 'MITM CA'], s: 'critical' as const, id: 'PQ77XABC92' },
                { u: 'raj.patel', bu: 'Eng-AI', sev: '1C / 2H', esc: ['personal acct', 'admin'], s: 'critical' as const, id: 'LMQP9P1QV2' },
                { u: 'jenna.l', bu: 'DevOps', sev: '1C / 8H', esc: ['hook!', 'MCP!', 'no-policy'], s: 'critical' as const, id: 'TTY4X0ABCD' },
              ].map((r) => (
                <tr key={r.u} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                  <td className="px-5 py-3">
                    <Link href={`/fleet/devices/${r.id}`} className="text-unbound-text-primary font-medium hover:text-unbound-purple">
                      {r.u}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-unbound-text-tertiary">{r.bu}</td>
                  <td className="px-3 py-3"><SevBadge severity={r.s}>{r.sev}</SevBadge></td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">{r.esc.map((e) => (<Chip key={e}>+{e}</Chip>))}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-2">
          <CardHeader title="Attack-path chains" right={<Zap className="w-4 h-4 text-unbound-purple" />} />
          <div className="p-5 space-y-4 text-[12.5px]">
            <div>
              <div className="flex items-center justify-between mb-2">
                <SevBadge severity="critical">3 devices</SevBadge>
                <button
                  onClick={() => setChainOpen({
                    chain: 'YOLO → sandbox-off → cloud-creds → prod-git-write',
                    devices: ['sarah.chen', 'raj.patel', 'devtest-3'],
                  })}
                  className="text-[11px] text-unbound-purple font-semibold hover:underline"
                >
                  Break chain
                </button>
              </div>
              <div className="mono text-[12px] bg-unbound-bg rounded-md p-3 leading-relaxed">
                YOLO <span className="text-unbound-text-muted">→</span> sandbox-off <span className="text-unbound-text-muted">→</span> cloud-creds <span className="text-unbound-text-muted">→</span> prod-git-write
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <SevBadge severity="critical">1 device</SevBadge>
                <button
                  onClick={() => setChainOpen({
                    chain: 'personal-acct → corp-repos → no-DLP',
                    devices: ['marcus.w'],
                  })}
                  className="text-[11px] text-unbound-purple font-semibold hover:underline"
                >
                  Break chain
                </button>
              </div>
              <div className="mono text-[12px] bg-unbound-bg rounded-md p-3 leading-relaxed">
                personal-acct <span className="text-unbound-text-muted">→</span> corp-repos <span className="text-unbound-text-muted">→</span> no-DLP
              </div>
            </div>
          </div>
        </Card>
      </div>

      <BreakChainModal
        open={!!chainOpen}
        onClose={() => setChainOpen(null)}
        onConfirm={(i) => {
          actions.addAction({
            kind: 'policy-push',
            label: `${i.profileCount} profiles queued · Jamf`,
            detail: `Canary 10% → ${i.deviceCount} devices · rollback on regression`,
            eta: '14 min',
          });
          showToast(`${i.profileCount} profiles queued · visible in Pending actions`);
        }}
        chain={chainOpen?.chain ?? ''}
        devices={chainOpen?.devices ?? []}
      />
      {toast && <Toast message={toast} kind="success" />}
    </>
  );
}

function CoverageTile({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  href?: string;
}) {
  return (
    <Link href={href ?? '#'} className="block p-4 hover:bg-unbound-bg-hover transition">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-unbound-text-muted">
        {icon}
        {label}
      </div>
      <div className="text-[20px] font-semibold text-unbound-text-primary mt-1">{value}</div>
    </Link>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-unbound-text-secondary">{label}</span>
      {value}
    </div>
  );
}
