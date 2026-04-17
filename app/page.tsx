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
  Eye,
  Clock3,
  ChevronRight,
  FileDown,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fleet, severityCounts, findings } from '@/lib/mock-data';
import BreakChainModal from '@/components/BreakChainModal';

function DeltaTile({
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
      className="block p-4 border border-unbound-border rounded-lg bg-white hover:bg-unbound-bg-hover transition-colors"
    >
      <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted">{label}</div>
      <div className="flex items-baseline gap-2 mt-1">
        <div className="text-[22px] font-semibold text-unbound-text-primary">{value}</div>
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

  return (
    <>
      <PageHeader
        title="Posture Overview"
        subtitle={`Mon Apr 20 2026 · 09:00 UTC · Fleet ${fleet.total} managed · ${fleet.unmanaged} unmanaged · Coverage ${fleet.coveragePct}% · Last scan 38 min ago`}
        right={
          <div className="flex gap-2">
            <div className="inline-flex rounded-md border border-unbound-border bg-white overflow-hidden text-[12px]">
              <button className="px-3 py-1.5 text-unbound-text-tertiary hover:bg-unbound-bg-hover">Day</button>
              <button className="px-3 py-1.5 bg-unbound-purple/10 text-unbound-purple font-medium">Week</button>
              <button className="px-3 py-1.5 text-unbound-text-tertiary hover:bg-unbound-bg-hover">Month</button>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
              <FileDown className="w-3.5 h-3.5" />
              Export signed PDF
            </button>
          </div>
        }
      />

      {/* DELTA SINCE FRIDAY */}
      <Card className="mb-5">
        <CardHeader
          title="Delta since Friday 17:00"
          subtitle="Trend vs last-week snapshot — click any tile to drill in"
        />
        <div className="grid grid-cols-4 gap-0 divide-x divide-unbound-border">
          <DeltaTile label="Critical" value={sev.critical} delta="+1" deltaDir="up" href="/issues?sev=critical" />
          <DeltaTile label="High" value={sev.high} delta="+2" deltaDir="up" href="/issues?sev=high" />
          <DeltaTile label="Closed" value={3} delta="-3" deltaDir="down" href="/issues?state=closed" />
          <DeltaTile label="Reopened" value={1} delta="+1" deltaDir="up" href="/issues?state=open" />
        </div>
        <div className="grid grid-cols-4 gap-0 divide-x divide-t divide-unbound-border border-t border-unbound-border">
          <DeltaTile label="New MCPs" value={3} delta="2 unvetted" deltaDir="up" href="/admin/catalogs/mcp" />
          <DeltaTile label="New CAs" value={1} delta="in catalog" deltaDir="flat" />
          <DeltaTile label="New hooks" value={1} delta="malicious" deltaDir="up" />
          <DeltaTile label="Drift events" value={4} delta="+4" deltaDir="up" href="/drift" />
        </div>
      </Card>

      {/* FLEET VISIBILITY — the CISO buy trigger */}
      <Card className="mb-5 border-sev-medium/40">
        <CardHeader
          title="Fleet visibility — who we can see, who we can't"
          subtitle="The dark fleet is where breaches live. Every unknown device is a finding waiting to happen."
          right={<EyeOff className="w-4 h-4 text-sev-medium" />}
        />
        <div className="grid grid-cols-4 gap-0 divide-x divide-unbound-border">
          <CoverageTile
            icon={<Eye className="w-4 h-4 text-sev-low" />}
            label="Scanner installed"
            value={fleet.scannerInstalled}
            caption="Healthy scan in last 24h"
            href="/fleet/devices"
          />
          <CoverageTile
            icon={<Clock3 className="w-4 h-4 text-sev-medium" />}
            label="Scanner stale"
            value={fleet.scannerStale}
            caption=">24h since last check-in"
            href="/fleet/devices"
          />
          <CoverageTile
            icon={<EyeOff className="w-4 h-4 text-sev-critical" />}
            label="No scanner installed"
            value={fleet.unmanaged - 167 + 167}
            caption="Dark fleet · enrol via MDM"
            href="/admin/setup"
          />
          <CoverageTile
            icon={<AlertTriangle className="w-4 h-4 text-sev-high" />}
            label="Total blind"
            value={fleet.unmanaged}
            caption="Cannot assess risk"
            href="/fleet/devices"
          />
        </div>
        <div className="grid grid-cols-3 gap-0 divide-x divide-t divide-unbound-border border-t border-unbound-border">
          {fleet.scanners.map((s) => (
            <div key={s.agent} className="p-4">
              <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted">{s.agent} scanner</div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="text-[14px] font-semibold text-unbound-text-primary">
                  {s.devices} <span className="text-[12px] font-normal text-unbound-text-tertiary">devices</span>
                </div>
                <span
                  className={cn(
                    'text-[11px] px-2 py-0.5 rounded-full',
                    s.status === 'healthy'
                      ? 'bg-sev-low-bg text-sev-low border border-sev-low/20'
                      : 'bg-sev-high-bg text-sev-high border border-sev-high/20'
                  )}
                >
                  {s.lastScan}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SLA + WAIVERS */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader title="SLA breaches" subtitle="Unresolved past threshold — immediate action required" />
          <div className="p-5 space-y-3 text-[13px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-sev-critical" />
                <span>Critical &gt; 24h unresolved</span>
              </div>
              <Link href="/issues" className="flex items-center gap-1 font-semibold text-sev-critical">
                1 <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-sev-high" />
                <span>High &gt; 7d unresolved</span>
              </div>
              <Link href="/issues" className="flex items-center gap-1 font-semibold text-sev-high">
                0 <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span>MTTR Critical</span>
              <span className="font-semibold">2.1d</span>
            </div>
            <div className="flex items-center justify-between">
              <span>MTTR High</span>
              <span className="font-semibold">4.2h</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Waiver governance" subtitle="Upcoming expiry + anomaly detection" />
          <div className="p-5 space-y-3 text-[13px]">
            <div className="flex items-center justify-between">
              <span>Expiring ≤ 7 days</span>
              <Link href="/admin/suppressions" className="flex items-center gap-1 font-semibold">
                6 <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <span>Expiring ≤ 30 days</span>
              <span className="font-semibold">23</span>
            </div>
            <Link href="/admin/suppressions" className="block p-3 rounded-md bg-sev-critical-bg border border-sev-critical/20 hover:bg-sev-critical-bg/80">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-sev-critical shrink-0 mt-0.5" />
                <div className="text-[12px]">
                  <div className="font-semibold text-sev-critical">Waiver anomaly</div>
                  <div className="text-unbound-text-secondary mt-0.5">
                    91% of QA BU (96 / 105 devices) has "#2 YOLO" waived. Approver: j.kim — 84% of those waivers granted on a single Friday. Likely a mute, not accepted risk. Click to review.
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* TOP 5 + ATTACK PATHS */}
      <div className="grid grid-cols-5 gap-5 mb-5">
        <Card className="col-span-3">
          <CardHeader
            title="Top 5 risk-weighted devices"
            subtitle="Ranked by severity × blast-radius escalators"
          />
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border">
                <th className="px-5 py-2 font-medium">#</th>
                <th className="px-5 py-2 font-medium">User</th>
                <th className="px-5 py-2 font-medium">BU</th>
                <th className="px-5 py-2 font-medium">Severity</th>
                <th className="px-5 py-2 font-medium">Escalators</th>
              </tr>
            </thead>
            <tbody>
              {[
                { n: 1, u: 'sarah.chen', bu: 'Eng-Platform', sev: '3C / 5H', esc: ['cloud creds', 'admin', 'prod repos'], s: 'critical' as const, id: 'HGXF2XKH45' },
                { n: 2, u: 'devtest-3', bu: 'QA', sev: '2C / 1H', esc: ['IMDS reach', 'no sandbox'], s: 'critical' as const, id: 'K43J9S77Z0' },
                { n: 3, u: 'marcus.w', bu: 'Finance', sev: '1C / 7H', esc: ['BYOD', 'corp repos', 'MITM CA'], s: 'critical' as const, id: 'PQ77XABC92' },
                { n: 4, u: 'raj.patel', bu: 'Eng-AI', sev: '1C / 2H', esc: ['personal acct', 'admin'], s: 'critical' as const, id: 'LMQP9P1QV2' },
                { n: 5, u: 'jenna.l', bu: 'DevOps', sev: '1C / 8H', esc: ['hook!', 'MCP!', 'no-policy'], s: 'critical' as const, id: 'TTY4X0ABCD' },
              ].map((r) => (
                <tr key={r.n} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                  <td className="px-5 py-3 text-unbound-text-muted">{r.n}</td>
                  <td className="px-5 py-3">
                    <Link href={`/fleet/devices/${r.id}`} className="text-unbound-text-primary font-medium hover:text-unbound-purple">
                      {r.u}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-unbound-text-tertiary">{r.bu}</td>
                  <td className="px-5 py-3"><SevBadge severity={r.s}>{r.sev}</SevBadge></td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">{r.esc.map((e) => (<Chip key={e}>+{e}</Chip>))}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-2">
          <CardHeader
            title="Attack-path chains active"
            subtitle='"Break the chain" — one-click policy push severs riskiest edge'
            right={<Zap className="w-4 h-4 text-unbound-purple" />}
          />
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
              <div className="text-[11px] text-unbound-text-muted mt-1">Sarah · Raj · Devtest-3</div>
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
              <div className="text-[11px] text-unbound-text-muted mt-1">Marcus</div>
            </div>
          </div>
        </Card>
      </div>

      {/* COMPLIANCE */}
      <Card>
        <CardHeader
          title="Compliance snapshot"
          subtitle="Per-framework control coverage — click a framework to drill into controls"
          right={
            <Link
              href="/compliance/controls"
              className="text-[12px] text-unbound-purple font-medium hover:underline"
            >
              Run evidence packet →
            </Link>
          }
        />
        <div className="p-5 grid grid-cols-4 gap-5">
          {[
            { fw: 'NIST CSF 2.0', pct: 78 },
            { fw: 'SOC 2 Type II', pct: 71 },
            { fw: 'ISO 27001:2022', pct: 94 },
            { fw: 'FedRAMP Mod', pct: 23, note: 'opt-in · not enrolled' },
          ].map((c) => (
            <Link key={c.fw} href="/compliance/controls" className="block group">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-[13px] font-medium text-unbound-text-primary">{c.fw}</div>
                  {c.note && (
                    <div className="text-[10px] text-unbound-text-muted uppercase tracking-wider">{c.note}</div>
                  )}
                </div>
                <div className="text-[13px] font-semibold text-unbound-text-primary">{c.pct}%</div>
              </div>
              <div className="h-2 rounded-full bg-unbound-bg overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    c.pct >= 90 ? 'bg-sev-low' : c.pct >= 70 ? 'bg-unbound-purple' : c.pct >= 40 ? 'bg-sev-high' : 'bg-sev-critical'
                  )}
                  style={{ width: `${c.pct}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <BreakChainModal
        open={!!chainOpen}
        onClose={() => setChainOpen(null)}
        chain={chainOpen?.chain ?? ''}
        devices={chainOpen?.devices ?? []}
      />
    </>
  );
}

function CoverageTile({
  icon,
  label,
  value,
  caption,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  caption: string;
  href?: string;
}) {
  return (
    <Link href={href ?? '#'} className="block p-4 hover:bg-unbound-bg-hover transition">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-unbound-text-muted">
        {icon}
        {label}
      </div>
      <div className="text-[22px] font-semibold text-unbound-text-primary mt-1">{value}</div>
      <div className="text-[11.5px] text-unbound-text-tertiary mt-0.5">{caption}</div>
    </Link>
  );
}
