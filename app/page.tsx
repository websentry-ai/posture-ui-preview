'use client';

import { useState } from 'react';
import Link from '@/components/AppLink';
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
import AttackPathGraph, { type Chain } from '@/components/AttackPathGraph';
import { Brain } from 'lucide-react';

const chains: Chain[] = [
  {
    name: 'YOLO execution chain',
    kind: 'curated',
    nodes: [
      { label: 'YOLO', sev: 'critical', explain: 'Permission prompts disabled — agent runs shell without asking' },
      { label: 'sandbox off', sev: 'critical', explain: 'No OS fence around agent commands' },
      { label: 'cloud creds', sev: 'high', explain: '~/.aws/credentials readable by agent' },
      { label: 'prod-git write', sev: 'high', explain: 'Push access to 17 prod repos' },
    ],
    devices: ['sarah.chen', 'raj.patel', 'devtest-3'],
    deviceCount: 3,
    breakEdge: { after: 0, profile: 'claude-perm-ceiling.mobileconfig', effect: 'disables YOLO fleet-wide, collapses the chain at its root' },
  },
  {
    name: 'Personal-account leak chain',
    kind: 'curated',
    nodes: [
      { label: 'personal acct', sev: 'critical', explain: 'Claude signed in with @gmail on managed device' },
      { label: 'corp repos', sev: 'high', explain: 'Touches 12 corp GitHub repos' },
      { label: 'no DLP', sev: 'medium', explain: 'Consumer plan — outside ZDR contract' },
    ],
    devices: ['marcus.w'],
    deviceCount: 1,
    breakEdge: { after: 0, profile: 'claude-sso-only.mobileconfig', effect: 'MDM forces SSO sign-in only' },
  },
  {
    name: 'IMDS-exfil chain',
    kind: 'curated',
    nodes: [
      { label: 'IMDS reach', sev: 'critical', explain: 'Sandbox can reach 169.254.169.254' },
      { label: 'cloud creds', sev: 'high', explain: 'IAM role creds fetchable via metadata endpoint' },
      { label: 'data exfil', sev: 'high', explain: 'network_access=true in sandbox' },
    ],
    devices: ['devtest-3'],
    deviceCount: 1,
    breakEdge: { after: 0, profile: 'codex-imds-deny.toml', effect: 'denies 169.254.169.254 + RFC1918 in sandbox egress' },
  },
  {
    name: 'Hook persistence chain (novel)',
    kind: 'dynamic',
    nodes: [
      { label: 'malicious hook', sev: 'critical', explain: 'curl | bash in project .claude/settings.json' },
      { label: 'sandbox writable', sev: 'high', explain: 'Filesystem guards off' },
      { label: 'LaunchAgents', sev: 'high', explain: '~/Library/LaunchAgents writable — survives reboot' },
    ],
    devices: ['jenna.l'],
    deviceCount: 1,
    breakEdge: { after: 0, profile: 'claude-managed-hooks-only.mobileconfig', effect: 'allowManagedHooksOnly=true · project hooks ignored' },
    dynamicExplain: "jenna.l's device has a project-level hook + writable filesystem + LaunchAgent-writable — not a pattern we've seen before. AI composed this chain from her active escalators.",
  },
];

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
      className="block px-4 py-3 hover:bg-unbound-bg-hover transition-colors"
    >
      <div className="text-[10.5px] uppercase tracking-wide text-unbound-text-muted">{label}</div>
      <div className="flex items-baseline gap-2 mt-0.5">
        <div className="text-[20px] font-semibold text-unbound-text-primary leading-tight">{value}</div>
        {delta && (
          <div className={cn('text-[11.5px] font-medium flex items-center gap-0.5', dirColor)}>
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

      {/* What changed since Friday — LLM-authored narrative */}
      <Card className="mb-5">
        <CardHeader
          title="What changed since Friday 17:00"
          meta="narrative summary · regenerated every scan"
          right={
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-unbound-purple/10 text-unbound-purple text-[10px] font-semibold uppercase tracking-wider">
              <Brain className="w-3 h-3" /> AI
            </span>
          }
        />
        <div className="p-5 text-[13px] text-unbound-text-secondary leading-relaxed space-y-2">
          <p>
            <span className="font-semibold text-unbound-text-primary">3 new Criticals</span> landed over the weekend. Most severe: a malicious hook on jenna.l's DevOps laptop — a project-level `.claude/settings.json` piping pastebin content to bash. Classifier confidence 0.97.
          </p>
          <p>
            <span className="font-semibold text-unbound-text-primary">Sarah's YOLO is back</span>. Her 2026-03-22 waiver expired Friday 23:59; she flipped bypassPermissions on again 2h into Monday. Same device now composes the YOLO-execution chain with cloud-creds and prod-git-write — the exact combo that caused last quarter's Eng-Platform incident.
          </p>
          <p>
            <span className="font-semibold text-unbound-text-primary">Supply-chain inbox grew</span>: 2 unvetted MCPs added fleet-wide (unofficial-gh-mcp@latest on 4 devices; mcp-random-analytics on 1). Neither is on the approved catalog.
          </p>
          <p className="text-unbound-text-tertiary text-[12px]">
            Suggested sequence: break the YOLO chain on Sarah+Raj+devtest-3 with one policy push (collapses 3 findings), then triage the hook on jenna.l before her on-call window starts in 14h.
          </p>
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
          <CardHeader title="Attack-path chains" meta={`${chains.length} active`} right={<Zap className="w-4 h-4 text-unbound-purple" />} />
          <div className="p-5 space-y-4">
            {chains.map((c) => (
              <div key={c.name} className="pb-3 border-b border-unbound-border last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[12px] font-semibold text-unbound-text-primary">{c.name}</div>
                  <SevBadge severity="critical">{c.deviceCount} device{c.deviceCount > 1 ? 's' : ''}</SevBadge>
                </div>
                <AttackPathGraph
                  chain={c}
                  onBreakChain={() =>
                    setChainOpen({
                      chain: c.nodes.map((n) => n.label).join(' › '),
                      devices: c.devices,
                    })
                  }
                />
              </div>
            ))}
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
    <Link href={href ?? '#'} className="block px-4 py-3 hover:bg-unbound-bg-hover transition">
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-unbound-text-muted">
        {icon}
        {label}
      </div>
      <div className="text-[18px] font-semibold text-unbound-text-primary mt-0.5 leading-tight">{value}</div>
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
