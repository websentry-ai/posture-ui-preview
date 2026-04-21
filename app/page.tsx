'use client';

import { useState } from 'react';
import Link from '@/components/AppLink';
import { Card, CardHeader } from '@/components/Card';
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

  const featuredChain = chains[0]; // YOLO execution chain — today's top call
  const otherChains = chains.slice(1);

  return (
    <>
      {/* Page header — bigger, more confident */}
      <div className="flex items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-unbound-text-primary tracking-tight leading-tight">
            Discovery &amp; Posture
          </h1>
          <p className="text-[13px] text-unbound-text-tertiary mt-1.5 max-w-[680px]">
            Every AI coding agent, MCP server, hook and device across your org — ranked by remediation priority.
            <span className="text-unbound-text-muted"> · Last scan 38m ago</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => showToast('Discovery scan queued · 487 devices · canary 10% first')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] rounded-md border border-unbound-border bg-white text-unbound-text-secondary hover:bg-unbound-bg-hover"
          >
            <Search className="w-3.5 h-3.5" />
            Run discovery
          </button>
          <button
            onClick={() => showToast('Signed PDF generated · posture-Q1-2026.pdf · sha256:7d…a81c')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export signed PDF
          </button>
        </div>
      </div>

      {/* TODAY'S TOP CALL — decision-framed hero */}
      <div className="mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-[#0F0C22] via-[#17132B] to-[#1D1838] text-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]">
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-white/10">
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-unbound-purple">
              ▸ Today&apos;s top call
            </span>
            <span className="text-[11px] text-[#8B88A0]">AI-ranked · 14h window before on-call shift</span>
          </div>
          <SevBadge severity="critical">{featuredChain.deviceCount} devices affected</SevBadge>
        </div>
        <div className="px-6 pt-5 pb-5 grid grid-cols-5 gap-6 items-center">
          <div className="col-span-3">
            <h2 className="text-[22px] font-bold tracking-tight leading-tight text-white">
              Break the YOLO execution chain on Sarah + Raj + devtest-3
            </h2>
            <p className="text-[13px] text-[#A6A4B5] mt-2 leading-relaxed">
              One policy push <span className="font-mono text-white/90 text-[12px] bg-white/5 px-1.5 py-0.5 rounded">claude-perm-ceiling.mobileconfig</span> disables bypass-permissions fleet-wide and collapses 3 findings in one action. Same combo broke Eng-Platform last quarter.
            </p>
            <div className="mt-4 rounded-lg bg-white/[0.04] border border-white/[0.08] p-3">
              <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#8B88A0] mb-2">Chain</div>
              <AttackPathGraph
                chain={featuredChain}
                onBreakChain={() =>
                  setChainOpen({
                    chain: featuredChain.nodes.map((n) => n.label).join(' › '),
                    devices: featuredChain.devices,
                  })
                }
              />
            </div>
          </div>
          <div className="col-span-2 flex flex-col gap-3">
            <button
              onClick={() =>
                setChainOpen({
                  chain: featuredChain.nodes.map((n) => n.label).join(' › '),
                  devices: featuredChain.devices,
                })
              }
              className="group w-full bg-unbound-purple hover:bg-unbound-purple-hover text-white rounded-lg px-5 py-4 text-left transition-all shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset] hover:shadow-[0_0_0_1px_rgba(123,86,251,0.4),0_8px_24px_-4px_rgba(123,86,251,0.35)]"
            >
              <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/80">Recommended action</div>
              <div className="text-[17px] font-bold mt-1.5 tracking-tight">Break this chain →</div>
              <div className="text-[11.5px] text-white/75 mt-1.5 leading-snug">
                Canary 10% → roll to all 3 devices · rollback on regression · 14 min ETA
              </div>
            </button>
            <div className="grid grid-cols-2 gap-2.5">
              <CalloutStat label="Findings collapsed" value="3" tone="purple" />
              <CalloutStat label="Deadline" value="14h" tone="amber" />
            </div>
            <div className="text-[11.5px] text-[#8B88A0] leading-snug pt-1">
              Prefer manual?{' '}
              <Link href="/issues" className="text-white/90 underline underline-offset-2 hover:text-unbound-purple">
                open the 3 findings individually →
              </Link>
            </div>
          </div>
        </div>
      </div>

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
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-unbound-text-muted">
                What changed since Friday 17:00
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-unbound-purple/10 text-unbound-purple text-[9.5px] font-semibold uppercase tracking-wider">
                <Brain className="w-3 h-3" /> AI
              </span>
            </div>
            <ul className="space-y-3 text-[13px] text-unbound-text-secondary leading-snug">
              <li className="flex gap-2.5">
                <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-sev-critical shrink-0" />
                <span>
                  <span className="font-semibold text-unbound-text-primary">3 new Criticals</span> over the weekend.
                  Worst: malicious hook on jenna.l — project-level <span className="font-mono text-[11.5px]">.claude/settings.json</span> piping pastebin to bash.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-sev-critical shrink-0" />
                <span>
                  <span className="font-semibold text-unbound-text-primary">Sarah&apos;s YOLO is back</span>. Waiver expired Friday 23:59 — same combo that broke Eng-Platform last quarter.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-sev-high shrink-0" />
                <span>
                  <span className="font-semibold text-unbound-text-primary">Supply-chain inbox grew</span>: 2 unvetted MCPs added fleet-wide. Neither on catalog.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Compact KPI strip — demoted, supporting inventory counts */}
      <div className="mb-6 flex items-stretch gap-0 rounded-xl border border-unbound-border bg-white divide-x divide-unbound-border overflow-hidden">
        <CompactKpi icon={<AlertTriangle className="w-3.5 h-3.5" />} label="All findings" value={sev.critical + sev.high + sev.medium + sev.low} delta="+3" deltaDir="up" distribution={[{ n: sev.critical, sev: 'critical' }, { n: sev.high, sev: 'high' }]} href="/issues" />
        <CompactKpi icon={<Cpu className="w-3.5 h-3.5" />} label="Agents" value={3} sub="Claude · Cursor · Codex" href="/fleet/tools" />
        <CompactKpi icon={<Server className="w-3.5 h-3.5" />} label="MCP servers" value={mcpInventory.length} delta="+2 new" deltaDir="up" distribution={[{ n: mcpRisky, sev: 'high' }]} href="/inventory/mcp" />
        <CompactKpi icon={<Webhook className="w-3.5 h-3.5" />} label="Hooks" value={hooksInventory.length} delta={`${hookMalicious} RCE`} deltaDir="up" distribution={[{ n: hookMalicious, sev: 'critical' }, { n: hookRisky - hookMalicious, sev: 'high' }]} href="/inventory/mcp" />
        <CompactKpi icon={<Laptop className="w-3.5 h-3.5" />} label="Devices" value={730} sub="487 managed · 243 unmanaged" href="/fleet/devices" />
        <CompactKpi icon={<EyeOff className="w-3.5 h-3.5" />} label="Dark fleet" value={228} delta="+3" deltaDir="up" sub="No scanner" href="/admin/setup" />
      </div>

      {/* Other active attack-path chains — supporting, since the featured one is in the hero */}
      <Card className="mb-6">
        <CardHeader
          title="Other active attack paths"
          meta={`${otherChains.length} chains · curated + AI-composed · featured chain is above`}
          right={<Zap className="w-4 h-4 text-unbound-purple" />}
        />
        <div className="p-6 grid grid-cols-3 gap-x-8 gap-y-6">
          {otherChains.map((c) => (
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

function CompactKpi({
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
    <Link href={href ?? '/issues'} className="flex-1 px-4 py-3 hover:bg-unbound-bg-hover transition-colors">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-unbound-text-muted">
        <span className="text-unbound-text-muted">{icon}</span>
        {label}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <div className="text-[19px] font-bold text-unbound-text-primary leading-none tracking-tight tabular-nums">{value}</div>
        {delta && (
          <div className={cn('text-[10.5px] font-medium flex items-center gap-0.5', dirColor)}>
            {Arrow && <Arrow className="w-2.5 h-2.5" />}
            {delta}
          </div>
        )}
      </div>
      {distribution && distribution.some((d) => d.n > 0) ? (
        <div className="flex items-center gap-2 mt-1.5">
          {distribution.filter((d) => d.n > 0).map((d, i) => (
            <div key={i} className="flex items-center gap-1 text-[10.5px] font-medium text-unbound-text-tertiary tabular-nums">
              <span className={cn('w-1.5 h-1.5 rounded-full', dotColor[d.sev])} />
              {d.n}
            </div>
          ))}
        </div>
      ) : sub ? (
        <div className="mt-1.5 text-[10px] text-unbound-text-muted truncate">{sub}</div>
      ) : null}
    </Link>
  );
}

function CalloutStat({ label, value, tone }: { label: string; value: string; tone: 'purple' | 'amber' }) {
  const toneClass = tone === 'purple'
    ? 'bg-unbound-purple/15 border-unbound-purple/30 text-white'
    : 'bg-sev-high/15 border-sev-high/40 text-white';
  const valueClass = tone === 'purple' ? 'text-unbound-purple' : 'text-sev-high';
  return (
    <div className={cn('rounded-md border px-3 py-2.5', toneClass)}>
      <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/70">{label}</div>
      <div className={cn('text-[20px] font-bold leading-none mt-1 tabular-nums', valueClass)}>{value}</div>
    </div>
  );
}
