'use client';

import { useState } from 'react';
import Link from '@/components/AppLink';
import { Card, CardHeader, PageHeader } from '@/components/Card';
import { SevBadge, Chip } from '@/components/SevBadge';
import {
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  FileDown,
  Zap,
  Brain,
  Search,
  EyeOff,
  Server,
  Cpu,
  Webhook,
  Laptop,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { severityCounts, findings, mcpInventory, hooksInventory, devices } from '@/lib/mock-data';
import BreakChainModal from '@/components/BreakChainModal';
import { Toast } from '@/components/Modal';
import { useStore } from '@/lib/store';
import AttackPathGraph, { type Chain } from '@/components/AttackPathGraph';

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

export default function Overview() {
  const sev = severityCounts(findings);
  const [chainOpen, setChainOpen] = useState<null | { chain: string; devices: string[] }>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, actions] = useStore((s) => s.pendingActions);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2800); };

  // Risk distribution per inventory class — derived from live data
  const mcpRisky = mcpInventory.filter((m) => m.matchedFindings.length > 0).length;
  const hookRisky = hooksInventory.filter((h) => h.classification.startsWith('suspicious') || h.classification === 'malicious-rce').length;
  const hookMalicious = hooksInventory.filter((h) => h.classification === 'malicious-rce').length;

  // Governed × Risk quadrant — derived from devices list + fleet totals
  // Governed = MDM-enrolled + posture profile applied (Jamf / Intune, not BYOD / None)
  const riskyDevices = devices;
  const isGoverned = (mdm: string) => mdm !== 'None (BYOD)' && mdm !== 'BYOD';
  const cells = {
    blockNow: riskyDevices.filter((d) => !isGoverned(d.mdm)).length,        // ungoverned + high
    tighten:  riskyDevices.filter((d) =>  isGoverned(d.mdm)).length,        // governed + high
    triage:   243 - riskyDevices.filter((d) => !isGoverned(d.mdm)).length,  // ungoverned low/med
    allClear: 487 - riskyDevices.filter((d) =>  isGoverned(d.mdm)).length,  // governed low/med
  };

  return (
    <>
      <PageHeader
        title="Discovery & Posture"
        meta="Every AI coding agent, MCP server, hook and device across your org — ranked by remediation priority. · Last scan 38 min ago"
        right={
          <div className="flex gap-2">
            <button
              onClick={() => showToast('Discovery scan queued · 487 devices · canary 10% first')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-md border border-unbound-border bg-white text-unbound-text-secondary hover:bg-unbound-bg-hover"
            >
              <Search className="w-3.5 h-3.5" />
              Run discovery
            </button>
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

      {/* Unified KPI strip — 6 typed tiles with risk-distribution rows */}
      <Card className="mb-5">
        <div className="grid grid-cols-6 divide-x divide-unbound-border">
          <KpiTile
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            label="All findings"
            value={sev.critical + sev.high + sev.medium + sev.low}
            delta="+3"
            deltaDir="up"
            distribution={[
              { n: sev.critical, sev: 'critical' },
              { n: sev.high, sev: 'high' },
              { n: sev.medium, sev: 'medium' },
              { n: sev.low, sev: 'low' },
            ]}
            href="/issues"
          />
          <KpiTile
            icon={<Cpu className="w-3.5 h-3.5" />}
            label="Agents"
            value={3}
            delta="+0"
            deltaDir="flat"
            sub="Claude · Cursor · Codex"
            distribution={[
              { n: sev.critical, sev: 'critical' },
              { n: sev.high, sev: 'high' },
            ]}
            href="/fleet/tools"
          />
          <KpiTile
            icon={<Server className="w-3.5 h-3.5" />}
            label="MCP servers"
            value={mcpInventory.length}
            delta="+2 new"
            deltaDir="up"
            distribution={[{ n: mcpRisky, sev: 'high' }, { n: mcpInventory.length - mcpRisky, sev: 'low' }]}
            href="/inventory/mcp"
          />
          <KpiTile
            icon={<Webhook className="w-3.5 h-3.5" />}
            label="Hooks"
            value={hooksInventory.length}
            delta={`${hookMalicious} RCE`}
            deltaDir={hookMalicious > 0 ? 'up' : 'flat'}
            distribution={[
              { n: hookMalicious, sev: 'critical' },
              { n: hookRisky - hookMalicious, sev: 'high' },
              { n: hooksInventory.length - hookRisky, sev: 'low' },
            ]}
            href="/inventory/mcp"
          />
          <KpiTile
            icon={<Laptop className="w-3.5 h-3.5" />}
            label="Devices"
            value={487 + 15 + 228}
            delta="95% covered"
            deltaDir="flat"
            sub="487 managed · 15 BYOD · 228 unmanaged"
            distribution={[{ n: riskyDevices.length, sev: 'critical' }]}
            href="/fleet/devices"
          />
          <KpiTile
            icon={<EyeOff className="w-3.5 h-3.5" />}
            label="Dark fleet"
            value={228}
            delta="+3"
            deltaDir="up"
            sub="Seen on network · no scanner"
            href="/admin/setup"
          />
        </div>
      </Card>

      {/* HERO SUMMARY — one designed surface: quadrant + narrative in a single card */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-unbound-border bg-unbound-bg-hover/40">
          <div className="flex items-baseline gap-3">
            <h3 className="text-[13px] font-semibold text-unbound-text-primary tracking-tight">Posture summary</h3>
            <span className="text-[11px] text-unbound-text-muted">regenerated every scan · 38m ago</span>
          </div>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-unbound-purple/10 text-unbound-purple text-[10px] font-semibold uppercase tracking-wider">
            <Brain className="w-3 h-3" /> AI
          </span>
        </div>
        <div className="grid grid-cols-5 divide-x divide-unbound-border">
          <div className="col-span-3 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-unbound-text-muted">
                Governed × Risk · device posture
              </div>
              <span
                title="Governed = MDM-enrolled with posture profile applied (Jamf / Intune / Kandji). Ungoverned = BYOD or unmanaged."
                className="inline-flex items-center gap-1 text-[10.5px] text-unbound-text-muted cursor-help"
              >
                <Info className="w-3 h-3" />
                what counts as governed?
              </span>
            </div>
            <div className="grid grid-cols-[52px_1fr_1fr] gap-2 items-stretch">
              <div />
              <AxisLabel>Ungoverned</AxisLabel>
              <AxisLabel>Governed</AxisLabel>

              <YAxisLabel>High</YAxisLabel>
              <BigQuadCell count={cells.blockNow} title="Block now" tone="danger" onClick={() => showToast('Filtered /issues by ungoverned + high → Block now')} />
              <BigQuadCell count={cells.tighten} title="Tighten scopes" tone="amber" onClick={() => showToast('Filtered /issues by governed + high → Tighten scopes')} />

              <YAxisLabel>Low / med</YAxisLabel>
              <BigQuadCell count={cells.triage} title="Triage & decide" tone="yellow" onClick={() => showToast('Filtered /issues by ungoverned + low/med → Triage & decide')} />
              <BigQuadCell count={cells.allClear} title="All clear" tone="green" onClick={() => showToast('Filtered /issues by governed + low/med → All clear')} />
            </div>
          </div>
          <div className="col-span-2 p-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-unbound-text-muted mb-4">
              What changed since Friday 17:00
            </div>
            <div className="text-[13px] text-unbound-text-secondary leading-relaxed space-y-2.5">
              <p>
                <span className="font-semibold text-unbound-text-primary">3 new Criticals</span> over the weekend. Most severe: a malicious hook on jenna.l's laptop — project-level `.claude/settings.json` piping pastebin to bash. Classifier 0.97.
              </p>
              <p>
                <span className="font-semibold text-unbound-text-primary">Sarah's YOLO is back</span>. Waiver expired Friday 23:59; flipped bypassPermissions 2h into Monday. Same combo that broke Eng-Platform last quarter.
              </p>
              <p>
                <span className="font-semibold text-unbound-text-primary">Supply-chain inbox grew</span>: 2 unvetted MCPs added fleet-wide. Neither on catalog.
              </p>
              <p className="pt-1 border-t border-unbound-border text-unbound-text-tertiary text-[12px] leading-relaxed">
                <span className="font-semibold text-unbound-purple">Suggested:</span> break YOLO chain on Sarah+Raj+devtest-3 with one policy push (collapses 3 findings), then triage jenna.l before her on-call window in 14h.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* DOMINANT VIZ — attack-path chains, the hero visualization */}
      <Card className="mb-6 bg-gradient-to-b from-white to-unbound-bg-hover/20">
        <CardHeader
          title="Active attack-path chains"
          meta={`${chains.length} chains detected · break a single edge to collapse fleet-wide · curated + AI-composed`}
          right={<Zap className="w-4 h-4 text-unbound-purple" />}
        />
        <div className="p-7 grid grid-cols-2 gap-x-10 gap-y-8">
          {chains.map((c) => (
            <div key={c.name}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-[13.5px] font-semibold text-unbound-text-primary tracking-tight">{c.name}</span>
                  {c.kind === 'dynamic' && (
                    <span className="text-[9.5px] font-bold uppercase tracking-widest text-unbound-purple">novel · AI</span>
                  )}
                </div>
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

      {/* FOOTER — single card: SLA strip + anomaly banner + Top risk-weighted devices */}
      <Card className="mb-5">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-unbound-border">
          <div className="flex items-baseline gap-2">
            <h3 className="text-[14px] font-semibold text-unbound-text-primary">Top risk-weighted devices</h3>
            <span className="text-[11px] text-unbound-text-muted">5 of 730 · open Device 360 for evidence</span>
          </div>
          <div className="flex items-center gap-5 text-[11.5px]">
            <SlaStat label="SLA breach" value={<Link href="/issues" className="font-semibold text-sev-critical">1</Link>} />
            <SlaStat label="MTTR C/H" value={<span className="font-semibold tabular-nums">2.1d · 4.2h</span>} />
            <SlaStat label="Waivers active · ≤7d" value={<span className="font-semibold tabular-nums">6 · <span className="text-sev-medium">3</span></span>} />
          </div>
        </div>
        <Link href="/admin/suppressions" className="flex items-start gap-2 px-5 py-3 bg-sev-critical-bg/60 border-b border-sev-critical/20 hover:bg-sev-critical-bg transition-colors">
          <ShieldAlert className="w-4 h-4 text-sev-critical shrink-0 mt-0.5" />
          <div className="text-[12.5px]">
            <span className="font-semibold text-sev-critical">Waiver anomaly detected — </span>
            <span className="text-unbound-text-secondary">91% of QA BU has #2 YOLO waived by a single approver on one Friday. Likely a mute.</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-sev-critical ml-auto mt-0.5" />
        </Link>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border">
              <th className="px-5 py-2.5 font-medium">User</th>
              <th className="px-3 py-2.5 font-medium">BU</th>
              <th className="px-3 py-2.5 font-medium">Severity</th>
              <th className="px-3 py-2.5 font-medium">Escalators</th>
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

      {/* Row 4 — pending actions (conditional) */}
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

type DistributionDot = { n: number; sev: 'critical' | 'high' | 'medium' | 'low' };
const dotColor: Record<DistributionDot['sev'], string> = {
  critical: 'bg-sev-critical',
  high: 'bg-sev-high',
  medium: 'bg-sev-medium',
  low: 'bg-sev-low',
};

function KpiTile({
  icon,
  label,
  value,
  delta,
  deltaDir,
  sub,
  distribution,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delta?: string;
  deltaDir?: 'up' | 'down' | 'flat';
  sub?: string;
  distribution?: DistributionDot[];
  href?: string;
}) {
  const dirColor =
    deltaDir === 'up' ? 'text-sev-critical' : deltaDir === 'down' ? 'text-sev-low' : 'text-unbound-text-muted';
  const Arrow = deltaDir === 'up' ? ArrowUp : deltaDir === 'down' ? ArrowDown : null;
  return (
    <Link
      href={href ?? '/issues'}
      className="block px-4 py-3 hover:bg-unbound-bg-hover transition-colors"
    >
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-unbound-text-muted">
        <span className="text-unbound-text-muted">{icon}</span>
        {label}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <div className="text-[22px] font-semibold text-unbound-text-primary leading-none tracking-tight tabular-nums">{value}</div>
        {delta && (
          <div className={cn('text-[11px] font-medium flex items-center gap-0.5', dirColor)}>
            {Arrow && <Arrow className="w-3 h-3" />}
            {delta}
          </div>
        )}
      </div>
      {distribution && distribution.some((d) => d.n > 0) && (
        <div className="flex items-center gap-2 mt-2">
          {distribution.filter((d) => d.n > 0).map((d, i) => (
            <div key={i} className="flex items-center gap-1 text-[11px] font-medium text-unbound-text-tertiary tabular-nums">
              <span className={cn('w-1.5 h-1.5 rounded-full', dotColor[d.sev])} />
              {d.n}
            </div>
          ))}
        </div>
      )}
      {sub && !distribution?.some((d) => d.n > 0) && (
        <div className="mt-2 text-[10.5px] text-unbound-text-muted truncate">{sub}</div>
      )}
      {sub && distribution?.some((d) => d.n > 0) && (
        <div className="mt-1 text-[10.5px] text-unbound-text-muted truncate">{sub}</div>
      )}
    </Link>
  );
}

function AxisLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center text-[9px] font-bold uppercase tracking-widest text-unbound-text-muted">
      {children}
    </div>
  );
}
function YAxisLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end pr-1 text-[9px] font-bold uppercase tracking-widest text-unbound-text-muted whitespace-nowrap">
      {children}
    </div>
  );
}

const quadTone: Record<'danger' | 'amber' | 'yellow' | 'green', { bg: string; border: string; fg: string; dot: string }> = {
  danger: { bg: 'bg-sev-critical-bg', border: 'border-sev-critical/30', fg: 'text-sev-critical', dot: 'bg-sev-critical' },
  amber:  { bg: 'bg-sev-high-bg',     border: 'border-sev-high/30',     fg: 'text-sev-high',     dot: 'bg-sev-high' },
  yellow: { bg: 'bg-sev-medium-bg',   border: 'border-sev-medium/30',   fg: 'text-sev-medium',   dot: 'bg-sev-medium' },
  green:  { bg: 'bg-sev-low-bg',      border: 'border-sev-low/30',      fg: 'text-sev-low',      dot: 'bg-sev-low' },
};

function BigQuadCell({ count, title, tone, onClick }: { count: number; title: string; tone: keyof typeof quadTone; onClick: () => void }) {
  const t = quadTone[tone];
  const empty = count === 0;
  return (
    <button
      disabled={empty}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3.5 px-4 py-3.5 rounded-lg border text-left transition-all',
        empty
          ? 'bg-unbound-bg border-unbound-border opacity-50 cursor-default'
          : `${t.bg} ${t.border} hover:brightness-95 hover:shadow-sm`
      )}
    >
      <span className={cn('text-[26px] font-bold tabular-nums leading-none tracking-tight', empty ? 'text-unbound-text-muted' : t.fg)}>{count}</span>
      <span className={cn('text-[12.5px] font-semibold leading-tight', empty ? 'text-unbound-text-muted' : t.fg)}>{title}</span>
    </button>
  );
}

function SlaStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-unbound-text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
