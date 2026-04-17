'use client';

import { useState } from 'react';
import Link from '@/components/AppLink';
import { PageHeader, Card, CardHeader } from '@/components/Card';
import { Chip } from '@/components/SevBadge';
import { Help } from '@/components/Help';
import { mcpInventory, type McpEntry, hooksInventory, type HookEntry, type HookClass } from '@/lib/mock-data';
import { Monitor, Globe, ExternalLink, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'mcp' | 'hooks' | 'extensions' | 'agents';

const ruleTitle: Record<number, string> = {
  6: 'Unvetted MCP server',
  7: 'MCP auto-approve for write tools',
  9: 'Shell-executing hook',
  24: 'Binary code-signing / notarization mismatch',
};

export default function Page() {
  const [tab, setTab] = useState<Tab>('mcp');

  return (
    <>
      <PageHeader title="Inventory" meta="Reference · scanned from device configs · risk surfaces in Issues" />

      <div className="flex items-center gap-6 border-b border-unbound-border mb-4 text-[13px]">
        {([
          ['mcp', `MCP servers (${mcpInventory.length})`],
          ['hooks', `Hooks (${hooksInventory.length})`],
          ['extensions', 'Extensions'],
          ['agents', 'Agents & binaries'],
        ] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setTab(val as Tab)}
            className={cn(
              'py-2',
              tab === val
                ? 'border-b-2 border-unbound-purple font-semibold text-unbound-text-primary'
                : 'text-unbound-text-tertiary hover:text-unbound-text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'mcp' && <MCPTable />}
      {tab === 'hooks' && <HooksTable />}

      {(tab === 'extensions' || tab === 'agents') && (
        <Card className="p-6">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-unbound-purple shrink-0 mt-0.5" />
            <div className="text-[13px] text-unbound-text-secondary">
              {tab === 'extensions' && (
                <>
                  Cursor VS Code extensions + Claude plugins scanned from install directories. LLM-classified per extension
                  into AI-agent / AI-adjacent / benign-IDE. Non-catalog AI agents open as Finding #18.
                </>
              )}
              {tab === 'agents' && (
                <>
                  Per-device agent binary version + code-signing / notarization status + tamper check. Columns: agent · version
                  · signed-by · notarization · hash vs known-good · drift events (#24).
                </>
              )}
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

function MCPTable() {
  return (
    <Card>
      <CardHeader
        title="MCP servers — fleet inventory"
        meta={`${mcpInventory.length} detected · columns populated from live scan · no empty fields`}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Name</th>
              <th className="px-3 py-2.5 font-medium">Source</th>
              <th className="px-3 py-2.5 font-medium">Scope</th>
              <th className="px-3 py-2.5 font-medium">Command / URL</th>
              <th className="px-3 py-2.5 font-medium">Pin</th>
              <th className="px-3 py-2.5 font-medium">Auto-approved</th>
              <th className="px-3 py-2.5 font-medium">Devices</th>
              <th className="px-3 py-2.5 font-medium">Findings</th>
            </tr>
          </thead>
          <tbody>
            {mcpInventory.map((m) => (
              <McpRow key={m.name + m.commandOrUrl} m={m} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 text-[11px] text-unbound-text-tertiary border-t border-unbound-border flex items-center gap-3">
        <span>
          <Monitor className="w-3 h-3 inline mr-0.5" /> runs code locally on the device
        </span>
        <span>
          <Globe className="w-3 h-3 inline mr-0.5" /> sends prompts to a remote URL
        </span>
      </div>
    </Card>
  );
}

function McpRow({ m }: { m: McpEntry }) {
  const Icon = m.transportKind === 'http' || m.transportKind === 'sse' ? Globe : Monitor;
  const riskTint =
    m.matchedFindings.length >= 2
      ? 'hover:bg-sev-critical-bg/30'
      : m.matchedFindings.length === 1
      ? 'hover:bg-sev-high-bg/30'
      : 'hover:bg-unbound-bg-hover';

  return (
    <tr className={cn('border-b border-unbound-border last:border-0', riskTint)}>
      <td className="px-5 py-3">
        <div className="flex items-center gap-1.5">
          <span title={m.transportKind === 'http' ? 'Remote HTTP — sends prompts off-device' : m.transportKind === 'sse' ? 'Remote SSE — sends prompts off-device' : 'Local stdio — runs code on the device'}>
            <Icon className="w-3.5 h-3.5 text-unbound-text-muted cursor-help" />
          </span>
          <span className="font-semibold mono text-[12.5px]">{m.name}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-unbound-text-tertiary">{m.source}</td>
      <td className="px-3 py-3">
        <Chip>{m.scope}</Chip>
      </td>
      <td className="px-3 py-3 mono text-[11.5px] text-unbound-text-tertiary max-w-[340px] truncate" title={m.commandOrUrl}>
        {m.commandOrUrl}
      </td>
      <td className="px-3 py-3">
        {m.pin === '@latest' ? (
          <Help term="@latest" explain="Pulls the newest version each start — supply-chain attack surface. Compromised upstream = arbitrary code next run." />
        ) : m.pin === 'local' ? (
          <Chip title="Local binary · no registry pin · scan hash at onboarding">local</Chip>
        ) : m.pin === 'exact' ? (
          <span className="text-sev-low mono text-[11.5px]">exact</span>
        ) : (
          <span className="text-unbound-text-muted">—</span>
        )}
      </td>
      <td className="px-3 py-3">
        {m.toolsAutoApproved > 0 ? (
          <span
            title={`Auto-approved tools: ${m.autoApprovedNames.join(', ')}`}
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold cursor-help',
              m.autoApprovedNames.some((n) => /write|delete|push|create|update|execute|run/i.test(n))
                ? 'bg-sev-critical-bg text-sev-critical'
                : 'bg-sev-medium-bg text-sev-medium'
            )}
          >
            {m.toolsAutoApproved} tool{m.toolsAutoApproved > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-unbound-text-muted">—</span>
        )}
      </td>
      <td className="px-3 py-3 text-unbound-text-tertiary">{m.devices}</td>
      <td className="px-3 py-3">
        {m.matchedFindings.length > 0 ? (
          <Link
            href={`/issues?rule=${m.matchedFindings[0]}`}
            className="inline-flex items-center gap-1 text-unbound-purple font-semibold hover:underline"
            title={m.matchedFindings.map((id) => `#${id} ${ruleTitle[id] ?? ''}`).join(' · ')}
          >
            {m.matchedFindings.length} <ExternalLink className="w-3 h-3" />
          </Link>
        ) : (
          <span className="text-unbound-text-muted">—</span>
        )}
      </td>
    </tr>
  );
}

const hookClassStyle: Record<HookClass, { bg: string; fg: string; label: string; explain: string }> = {
  'benign-policy': {
    bg: 'bg-sev-low-bg',
    fg: 'text-sev-low',
    label: 'benign · policy',
    explain: 'Enforces a safety rule (e.g. block force-push, block prod). Classifier: 94–98% confidence, no action.',
  },
  'benign-workflow': {
    bg: 'bg-sev-low-bg',
    fg: 'text-sev-low',
    label: 'benign · workflow',
    explain: 'Local dev-loop automation (format, lint, test). No network, no exfil surface.',
  },
  'suspicious-network': {
    bg: 'bg-sev-medium-bg',
    fg: 'text-sev-medium',
    label: 'suspicious · network',
    explain: 'Hook makes outbound network calls to a non-catalog endpoint. Could be telemetry OR C2 — needs human review.',
  },
  'suspicious-exfil': {
    bg: 'bg-sev-high-bg',
    fg: 'text-sev-high',
    label: 'suspicious · exfil',
    explain: 'Hook writes prompts / session contents to a location that may leave corp boundary (Dropbox, iCloud, personal repo).',
  },
  'malicious-rce': {
    bg: 'bg-sev-critical-bg',
    fg: 'text-sev-critical',
    label: 'malicious · RCE',
    explain: 'Hook pipes remote content to a shell (curl | bash pattern) or execs arbitrary downloaded code. Classic supply-chain RCE.',
  },
};

function HooksTable() {
  return (
    <Card>
      <CardHeader
        title="Hooks — fleet inventory"
        meta={`${hooksInventory.length} detected · LLM-classified · rows with classification ≥ suspicious open as Finding #9`}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Name</th>
              <th className="px-3 py-2.5 font-medium">Source</th>
              <th className="px-3 py-2.5 font-medium">Scope</th>
              <th className="px-3 py-2.5 font-medium">Event</th>
              <th className="px-3 py-2.5 font-medium">Command</th>
              <th className="px-3 py-2.5 font-medium">Classification</th>
              <th className="px-3 py-2.5 font-medium">Devices</th>
              <th className="px-3 py-2.5 font-medium">Findings</th>
            </tr>
          </thead>
          <tbody>
            {hooksInventory.map((h) => (
              <HookRow key={h.name + h.command} h={h} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 text-[11px] text-unbound-text-tertiary border-t border-unbound-border">
        Classifier: <span className="mono">classifier-ensemble-v3 · unbound-hook-2026.04</span> · any row tagged
        <span className="mono"> suspicious-* </span> or <span className="mono"> malicious-* </span> opens a live #9 finding.
      </div>
    </Card>
  );
}

function HookRow({ h }: { h: HookEntry }) {
  const cls = hookClassStyle[h.classification];
  const riskTint =
    h.classification === 'malicious-rce'
      ? 'hover:bg-sev-critical-bg/30'
      : h.classification.startsWith('suspicious')
      ? 'hover:bg-sev-high-bg/30'
      : 'hover:bg-unbound-bg-hover';

  return (
    <tr className={cn('border-b border-unbound-border last:border-0', riskTint)}>
      <td className="px-5 py-3 font-semibold mono text-[12.5px]">{h.name}</td>
      <td className="px-3 py-3 text-unbound-text-tertiary">{h.source}</td>
      <td className="px-3 py-3">
        <Chip>{h.scope}</Chip>
      </td>
      <td className="px-3 py-3 mono text-[11.5px] text-unbound-text-tertiary">{h.event}</td>
      <td className="px-3 py-3 mono text-[11.5px] text-unbound-text-tertiary max-w-[340px] truncate" title={h.command}>
        {h.command}
      </td>
      <td className="px-3 py-3">
        <span
          title={`${cls.explain} · confidence ${(h.confidence * 100).toFixed(0)}%`}
          className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold cursor-help',
            cls.bg,
            cls.fg
          )}
        >
          {cls.label}
        </span>
      </td>
      <td className="px-3 py-3 text-unbound-text-tertiary">{h.devices}</td>
      <td className="px-3 py-3">
        {h.matchedFindings.length > 0 ? (
          <Link
            href={`/issues?rule=${h.matchedFindings[0]}`}
            className="inline-flex items-center gap-1 text-unbound-purple font-semibold hover:underline"
            title={h.matchedFindings.map((id) => `#${id} ${ruleTitle[id] ?? ''}`).join(' · ')}
          >
            {h.matchedFindings.length} <ExternalLink className="w-3 h-3" />
          </Link>
        ) : (
          <span className="text-unbound-text-muted">—</span>
        )}
      </td>
    </tr>
  );
}
