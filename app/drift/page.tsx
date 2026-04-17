'use client';

import { useState } from 'react';
import { PageHeader, Card, CardHeader } from '@/components/Card';
import { GitBranch } from 'lucide-react';
import Link from '@/components/AppLink';
import { Toast } from '@/components/Modal';
import { Help } from '@/components/Help';
import { cn } from '@/lib/utils';

type DriftRow = {
  device: string;
  user: string;
  agent: string;
  type: string;
  detected: string;
  material: boolean;
  file: string;
  diff: Array<{ sign: '-' | '+' | ' '; content: string }>;
  why?: string;
};

const drifts: DriftRow[] = [
  {
    device: 'HGXF2XKH45',
    user: 'sarah.chen',
    agent: 'Claude',
    type: 'sandbox.enabled: true → false',
    detected: '2h ago',
    material: true,
    file: '~/.claude/settings.json',
    diff: [
      { sign: ' ', content: '"sandbox": {' },
      { sign: '-', content: '  "enabled": true,' },
      { sign: '+', content: '  "enabled": false,' },
      { sign: ' ', content: '  "filesystem": { "allowWrite": ["./src/**"] }' },
      { sign: ' ', content: '}' },
    ],
    why: 'Sarah disabled the sandbox. Coupled with her re-enabled YOLO (F-00271), this re-composes the YOLO-execution chain.',
  },
  {
    device: 'TTY4X0ABCD',
    user: 'jenna.l',
    agent: 'Cursor',
    type: 'mcp.json: +unofficial-gh-mcp@latest',
    detected: '4h ago',
    material: true,
    file: '~/.cursor/mcp.json',
    diff: [
      { sign: ' ', content: '"mcpServers": {' },
      { sign: ' ', content: '  "linear-server": { ... },' },
      { sign: '+', content: '  "unofficial-gh-mcp": {' },
      { sign: '+', content: '    "command": "npx",' },
      { sign: '+', content: '    "args": ["-y", "unofficial-gh-mcp@latest"]' },
      { sign: '+', content: '  }' },
      { sign: ' ', content: '}' },
    ],
    why: 'New MCP from an unknown npm publisher (randomhandle123, 99 downloads, 14d old). Auto-pulls @latest on every Cursor start.',
  },
  {
    device: 'K43J9S77Z0',
    user: 'devtest-3',
    agent: 'Codex',
    type: 'writable_roots: ["./"] → ["/"]',
    detected: '1d ago',
    material: true,
    file: '~/.codex/config.toml',
    diff: [
      { sign: ' ', content: '[sandbox_workspace_write]' },
      { sign: '-', content: 'writable_roots = ["./"]' },
      { sign: '+', content: 'writable_roots = ["/"]' },
      { sign: ' ', content: 'network_access = true' },
    ],
    why: 'Filesystem fence removed. Combined with network_access=true, agent can write anywhere AND exfil. Matches IMDS-exfil chain.',
  },
  {
    device: 'PQ77XABC92',
    user: 'marcus.w',
    agent: 'Claude',
    type: 'prettier hook added to settings',
    detected: '5h ago',
    material: false,
    file: '~/.claude/settings.json',
    diff: [
      { sign: ' ', content: '"hooks": {' },
      { sign: '+', content: '  "PostToolUse": [{' },
      { sign: '+', content: '    "command": "./node_modules/.bin/prettier --write ${CLAUDE_FILE_PATH}"' },
      { sign: '+', content: '  }]' },
      { sign: ' ', content: '}' },
    ],
    why: 'Local-script hook, runs org-pinned prettier on saved files. Classifier: benign/workflow. No risk.',
  },
];

export default function Page() {
  const [filter, setFilter] = useState<'material' | 'all'>('material');
  const [toast, setToast] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true });
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2400); };
  const rows = filter === 'material' ? drifts.filter((d) => d.material) : drifts;
  return (
    <>
      <PageHeader
        title="Drift"
        meta={
          <>
            287 baselined · 12,418 signed snapshots · hourly{' '}
            <Help term="Sigstore anchor" explain="Public transparency log (Sigstore / Rekor). Auditors can independently verify this timeline wasn't retroactively edited." />
            {' '}· key sha256:7d…a81c
          </>
        }
        right={
          <div className="inline-flex rounded-md border border-unbound-border bg-white overflow-hidden text-[12px]">
            <button onClick={() => setFilter('material')} className={cn('px-3 py-1.5', filter === 'material' ? 'bg-unbound-purple/10 text-unbound-purple font-medium' : 'text-unbound-text-tertiary hover:bg-unbound-bg-hover')}>Material only</button>
            <button onClick={() => setFilter('all')} className={cn('px-3 py-1.5', filter === 'all' ? 'bg-unbound-purple/10 text-unbound-purple font-medium' : 'text-unbound-text-tertiary hover:bg-unbound-bg-hover')}>All drift</button>
          </div>
        }
      />

      <Card>
        <CardHeader
          title="Recent drift events"
          meta="#25 · signed baseline · diff on material change"
          right={<GitBranch className="w-4 h-4 text-unbound-purple" />}
        />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Device</th>
              <th className="px-3 py-2.5 font-medium">Agent</th>
              <th className="px-3 py-2.5 font-medium">Drift type</th>
              <th className="px-3 py-2.5 font-medium">Detected</th>
              <th className="px-3 py-2.5 font-medium">Material?</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => (
              <>
                <tr key={i} onClick={() => setExpanded((p) => ({ ...p, [i]: !p[i] }))} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover cursor-pointer">
                  <td className="px-5 py-3 mono text-[12px]">
                    <Link href={`/fleet/devices/${d.device}`} onClick={(e) => e.stopPropagation()} className="text-unbound-purple hover:underline">
                      {d.device}
                    </Link>
                    <div className="text-[11px] text-unbound-text-tertiary font-sans">{d.user}</div>
                  </td>
                  <td className="px-3 py-3 text-unbound-text-tertiary">{d.agent}</td>
                  <td className="px-3 py-3 mono text-[12px]">{d.type}</td>
                  <td className="px-3 py-3 text-unbound-text-tertiary">{d.detected}</td>
                  <td className="px-3 py-3">
                    {d.material ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sev-critical-bg text-sev-critical border border-sev-critical/30">
                        YES
                      </span>
                    ) : (
                      <span className="text-unbound-text-muted">no</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => showToast('Marked expected · baseline updated')} className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
                      Mark expected
                    </button>
                    <button onClick={() => showToast(`${d.device} re-baselined · signed sha256:${Math.random().toString(16).slice(2, 6)}…`)} className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
                      Re-baseline
                    </button>
                  </td>
                </tr>
                {expanded[i] && (
                  <tr className="border-b border-unbound-border bg-unbound-bg-hover/50">
                    <td colSpan={6} className="px-5 py-3">
                      <div className="text-[11px] text-unbound-text-tertiary mono mb-1.5">{d.file}</div>
                      <div className="mono bg-white rounded-md border border-unbound-border overflow-hidden text-[12px]">
                        {d.diff.map((line, j) => (
                          <div
                            key={j}
                            className={cn(
                              'flex',
                              line.sign === '+' && 'bg-sev-low-bg/40',
                              line.sign === '-' && 'bg-sev-critical-bg/30'
                            )}
                          >
                            <div className="px-2 py-0.5 text-right text-unbound-text-muted select-none bg-white border-r border-unbound-border w-6 shrink-0">
                              {line.sign}
                            </div>
                            <div className="px-3 py-0.5 whitespace-pre text-unbound-text-primary">{line.content}</div>
                          </div>
                        ))}
                      </div>
                      {d.why && (
                        <div className="mt-2 text-[12px] text-unbound-text-secondary flex items-start gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-unbound-purple/10 text-unbound-purple text-[10px] font-semibold uppercase tracking-wider shrink-0">AI</span>
                          <span>{d.why}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </Card>
      {toast && <Toast message={toast} kind="success" />}
    </>
  );
}
