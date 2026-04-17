'use client';

import { useState } from 'react';
import Link from '@/components/AppLink';
import { Card, CardHeader } from '@/components/Card';
import { SevBadge, Chip } from '@/components/SevBadge';
import {
  ArrowLeft,
  ChevronRight,
  Shield,
  Lock,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import FreezeModal from '@/components/FreezeModal';
import { Toast } from '@/components/Modal';
import type { Finding } from '@/lib/mock-data';
import { useStore } from '@/lib/store';

type Device = (typeof import('@/lib/mock-data'))['devices'][number];

export default function DeviceDetailClient({
  device,
  findings: deviceFindings,
}: {
  device: Device;
  findings: Finding[];
}) {
  const [tab, setTab] = useState<'issues' | 'inventory' | 'configuration' | 'timeline'>('issues');
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [frozenMap, storeActions] = useStore((s) => s.frozenDevices);
  const frozen = frozenMap[device.id] ?? null;

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };

  return (
    <>
      {/* header */}
      <div className="mb-5">
        <Link href="/fleet/devices" className="inline-flex items-center gap-1 text-[12px] text-unbound-text-tertiary hover:text-unbound-purple mb-3">
          <ArrowLeft className="w-3.5 h-3.5" />
          Devices
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[20px] font-semibold text-unbound-text-primary">{device.user}</h1>
              <SevBadge severity={device.severity}>{device.risk}</SevBadge>
            </div>
            <div className="text-[13px] text-unbound-text-tertiary mt-1 mono">
              {device.id} · {device.os} · MDM: {device.mdm} · Scanner: {device.lastSync} ago
            </div>
            {frozen && (
              <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded-md text-[11.5px] font-medium bg-sev-critical-bg text-sev-critical border border-sev-critical/30">
                <AlertTriangle className="w-3 h-3" /> Frozen ({frozen}) · unfreeze requires CISO approval
                <button onClick={() => storeActions.clearFrozen(device.id)} className="ml-1 underline opacity-80 hover:opacity-100 font-normal">
                  unfreeze
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => showToast('SOAR case opened · pre-populated with device context + findings')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover"
            >
              Send to SIEM/SOAR
            </button>
            <button
              onClick={() => setFreezeOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-sev-critical text-white hover:bg-sev-critical/90"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Freeze device
            </button>
          </div>
        </div>
      </div>

      {/* Who + blast radius combined */}
      <Card className="mb-5">
        <div className="p-5 grid grid-cols-4 gap-4 text-[12.5px]">
          <Field label="Role">{device.role}</Field>
          <Field label="Manager">{device.manager}</Field>
          <Field label="Location">{device.location}</Field>
          <Field label="On-call">{device.onCall}</Field>
          <Field label="Last login">{device.lastLogin}</Field>
          <Field label="Agents">{device.agents}</Field>
          <Field label="MDM">{device.mdm}</Field>
          <Field label="BU">{device.bu}</Field>
        </div>
        <div className="px-5 pb-4 flex items-center gap-2 flex-wrap border-t border-unbound-border pt-3">
          <span className="text-[11px] uppercase tracking-wide text-unbound-text-muted font-medium mr-1">Blast radius</span>
          <Chip>✓ cloud creds</Chip>
          <Chip>✓ admin</Chip>
          <Chip>✓ prod git (17 repos)</Chip>
          <Chip>✓ FileVault</Chip>
          <Chip>✓ SIP</Chip>
          <Chip>✓ code-signed</Chip>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-sev-critical-bg text-sev-critical border border-sev-critical/30">✗ sandbox writable</span>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-unbound-border mb-4 text-[13px]">
        {([
          ['issues', `Issues ${deviceFindings.length}`],
          ['inventory', 'Inventory'],
          ['configuration', 'Configuration'],
          ['timeline', 'Timeline'],
        ] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val as any)}
            className={
              'py-2 ' +
              (tab === val
                ? 'border-b-2 border-unbound-purple font-semibold text-unbound-text-primary'
                : 'text-unbound-text-tertiary hover:text-unbound-text-primary')
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Issues tab */}
      {tab === 'issues' && (
        <div className="bg-white rounded-xl border border-unbound-border overflow-hidden mb-5">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
                <th className="px-5 py-2.5 font-medium">#</th>
                <th className="px-3 py-2.5 font-medium">Finding</th>
                <th className="px-3 py-2.5 font-medium">Agent</th>
                <th className="px-3 py-2.5 font-medium">First seen</th>
                <th className="px-3 py-2.5 font-medium">Escalators</th>
                <th className="px-3 py-2.5 font-medium">SLA</th>
              </tr>
            </thead>
            <tbody>
              {deviceFindings.map((f) => (
                <tr key={f.id} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                  <td className="px-5 py-3 mono text-[12px] text-unbound-text-muted">#{f.ruleId}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <SevBadge severity={f.severity} />
                      <Link href="/issues" className="text-unbound-text-primary font-medium hover:text-unbound-purple">
                        {f.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-unbound-text-tertiary">{f.agent}</td>
                  <td className="px-3 py-3 text-unbound-text-tertiary">{f.firstSeen}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {f.escalators.map((e) => (<Chip key={e}>+{e}</Chip>))}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-unbound-text-secondary">{f.slaLabel}</td>
                </tr>
              ))}
              {deviceFindings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-unbound-text-muted">
                    No issues on this device.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Inventory tab */}
      {tab === 'inventory' && (
        <div className="space-y-4 mb-5">
          <Card>
            <CardHeader title="MCP servers" />
            <div className="p-5 space-y-2 text-[13px]">
              <div className="flex items-center justify-between p-3 rounded-md border border-unbound-border">
                <div>
                  <div className="mono font-medium">github-official &gt;=1.2.0</div>
                  <div className="text-[11.5px] text-unbound-text-tertiary">Unbound catalog · r+w</div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-sev-low-bg text-sev-low border border-sev-low/30">ok</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md border border-sev-high/30 bg-sev-high-bg/30">
                <div>
                  <div className="mono font-medium">unofficial-gh-mcp@latest</div>
                  <div className="text-[11.5px] text-unbound-text-tertiary">Not in catalog · write-capable</div>
                </div>
                <Link href="/issues" className="text-[11px] px-2 py-0.5 rounded bg-sev-high text-white">Opens #6</Link>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Hooks" />
            <div className="p-5 space-y-2 text-[13px]">
              <div className="flex items-center justify-between p-3 rounded-md border border-sev-critical/40 bg-sev-critical-bg/30">
                <div>
                  <div className="mono font-medium">PreToolUse · .claude/settings.json:5</div>
                  <div className="text-[11.5px] text-unbound-text-tertiary">Classified MALICIOUS / RCE (0.97)</div>
                </div>
                <Link href="/issues" className="text-[11px] px-2 py-0.5 rounded bg-sev-critical text-white">Opens #9</Link>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Agent binaries" />
            <div className="p-5 grid grid-cols-2 gap-3 text-[13px]">
              <Field label="Claude Code">v1.0.3 · signed · notarized ✓</Field>
              <Field label="Cursor">v1.4.2 · signed · notarized ✓</Field>
            </div>
          </Card>
        </div>
      )}

      {/* Configuration tab */}
      {tab === 'configuration' && (
        <Card className="mb-5">
          <CardHeader title="Configuration drift" meta="vs baseline · 2026-04-12" />
          <div className="p-5 text-[12px] mono">
            <div className="rounded-md overflow-hidden border border-unbound-border">
              <DiffRow sign="-" content={'"defaultMode": "default"'} />
              <DiffRow sign="+" content={'"defaultMode": "bypassPermissions"'} added />
              <DiffRow sign="-" content={'"sandbox": { "enabled": true }'} />
              <DiffRow sign="+" content={'"sandbox": { "enabled": false }'} added />
              <DiffRow sign=" " content={'"permissions": {'} />
              <DiffRow sign="-" content={'  "allow": ["Bash(npm test:*)"],'} />
              <DiffRow sign="+" content={'  "allow": ["Bash"],'} added />
              <DiffRow sign="-" content={'  "deny": ["Bash(rm*)", "Bash(curl*)"]'} />
              <DiffRow sign="+" content={'  "deny": []'} added />
              <DiffRow sign=" " content={'}'} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="text-[11px] px-2 py-1 rounded-md border border-unbound-border hover:bg-unbound-bg-hover font-sans">
                Mark changes expected (update baseline)
              </button>
              <button className="text-[11px] px-2 py-1 rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover font-sans">
                Investigate → opens as #25
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline tab */}
      {tab === 'timeline' && (
        <Card className="mb-5">
          <CardHeader title="Device timeline" />
          <div className="p-5">
            <div className="relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-unbound-border" />
              <ol className="space-y-3">
                {[
                  { t: '2026-04-16 08:15', e: 'Scanner check-in · 3 findings open' },
                  { t: '2026-04-15 11:00', e: 'F-00271 (#2 YOLO) reopened — claimed fixed, still present' },
                  { t: '2026-04-14 14:00', e: 'User-step fix forwarded to sarah.chen via email' },
                  { t: '2026-04-14 09:22', e: 'F-00271 detected — first scan' },
                  { t: '2026-04-12 17:00', e: 'Config baseline signed · sha256:e8…91' },
                  { t: '2026-04-10 10:00', e: 'Device onboarded to Unbound · Jamf group Eng-Laptops' },
                ].map((x, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-unbound-purple shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-[13px] text-unbound-text-primary">{x.e}</div>
                      <div className="text-[11px] text-unbound-text-muted mt-0.5 mono">{x.t}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Card>
      )}

      {/* PIVOT block */}
      <Card>
        <CardHeader
          title="Pivot"
          meta="Blast-radius check · fleet pivot"
        />
        <div className="p-5 grid grid-cols-2 gap-3 text-[13px]">
          <Link href="/issues?rule=6" className="flex items-center justify-between p-3 rounded-md border border-unbound-border hover:bg-unbound-bg-hover">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-unbound-purple" />
              <span>Same MCP elsewhere?</span>
            </div>
            <div className="flex items-center gap-1 text-unbound-text-tertiary">
              <span className="font-semibold text-unbound-text-primary">27 devices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
          <Link href="/issues?rule=9" className="flex items-center justify-between p-3 rounded-md border border-unbound-border hover:bg-unbound-bg-hover">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-unbound-purple" />
              <span>Same hook pattern?</span>
            </div>
            <div className="flex items-center gap-1 text-unbound-text-tertiary">
              <span className="font-semibold text-unbound-text-primary">3 devices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
          <button
            onClick={() => showToast('Okta session revoked · user forced to re-auth')}
            className="flex items-center justify-between p-3 rounded-md border border-unbound-border hover:bg-unbound-bg-hover text-left"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Isolate via Okta</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-unbound-text-muted" />
          </button>
          <button
            onClick={() => showToast('GitHub tokens revoked · new tokens require CISO approval')}
            className="flex items-center justify-between p-3 rounded-md border border-unbound-border hover:bg-unbound-bg-hover text-left"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Revoke GitHub tokens</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-unbound-text-muted" />
          </button>
        </div>
      </Card>

      <FreezeModal
        open={freezeOpen}
        onClose={() => setFreezeOpen(false)}
        onConfirm={(i) => {
          storeActions.setFrozen(device.id, i.label);
          storeActions.addAction({
            kind: 'freeze',
            label: `Frozen · ${device.user}`,
            detail: `${i.label} · #INC-2183 · Slack #secops-pager notified`,
          });
          showToast(`Frozen (${i.label}) · #INC-2183 opened · audit ledger entry written`);
        }}
        deviceId={device.id}
        user={device.user}
      />
      {toast && <Toast message={toast} kind="success" />}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-unbound-text-muted">{label}</div>
      <div className="mt-0.5 text-unbound-text-secondary">{children}</div>
    </div>
  );
}

function DiffRow({ sign, content, added }: { sign: string; content: string; added?: boolean }) {
  return (
    <div
      className={
        'flex items-start ' +
        (sign === '+'
          ? 'bg-sev-low-bg/40'
          : sign === '-'
          ? 'bg-sev-critical-bg/30'
          : '')
      }
    >
      <div className="px-2 py-1 text-right text-unbound-text-muted select-none bg-white border-r border-unbound-border w-6 shrink-0">
        {sign}
      </div>
      <div className="px-3 py-1 text-[12px] text-unbound-text-primary whitespace-pre overflow-x-auto flex-1">
        {content}
      </div>
    </div>
  );
}
