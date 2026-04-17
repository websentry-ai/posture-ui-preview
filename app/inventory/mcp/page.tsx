'use client';

import { useState } from 'react';
import { PageHeader, Card } from '@/components/Card';
import { Sparkles } from 'lucide-react';

type Tab = 'mcp' | 'hooks' | 'extensions' | 'agents';

const content: Record<Tab, { title: string; body: string; bullets: string[] }> = {
  mcp: {
    title: 'MCP servers',
    body: 'Flat searchable reference of every MCP server seen across the fleet. Risky servers surface in Issues #6 / #7.',
    bullets: [
      'Columns: name · publisher · device count · first/last seen · version · tools · catalog source',
      'Row click → Issue #6 when present',
      'Click device count → per-device drill-down',
    ],
  },
  hooks: {
    title: 'Hooks',
    body: 'PreToolUse · PostToolUse · SessionStart hooks across Claude / Codex / Cursor with AI classification per hook.',
    bullets: [
      'Classes: benign/policy · benign/workflow · suspicious/network · suspicious/exfil · malicious/rce',
      'Project-level hooks flagged even when benign (supply-chain surface)',
      'Signed-hook allowlist suppresses admin-approved hooks',
    ],
  },
  extensions: {
    title: 'Extensions',
    body: 'Cursor VS Code extensions + Claude plugins. LLM-classified as AI agent / AI-adjacent / benign.',
    bullets: [
      'Shadow AI detected: Cline · Roo-Cline · Kilo-Code · Continue · Windsurf',
      'Auto-opens Finding #18 on non-catalog AI extensions',
      'Override feeds classifier retraining',
    ],
  },
  agents: {
    title: 'Agents & binaries',
    body: 'Agent binary version + code-signing / notarization + tamper detection.',
    bullets: [
      'codesign / spctl / signtool attestation per device',
      'Hash drift from known-good vendor release (#24)',
      'Version fragmentation chart per agent family',
    ],
  },
};

export default function Page() {
  const [tab, setTab] = useState<Tab>('mcp');
  const c = content[tab];
  return (
    <>
      <PageHeader title="Inventory" meta="Reference — risk surfaces in Issues" />
      <div className="flex items-center gap-6 border-b border-unbound-border mb-4 text-[13px]">
        {(['mcp', 'hooks', 'extensions', 'agents'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              'py-2 ' +
              (tab === t
                ? 'border-b-2 border-unbound-purple font-semibold text-unbound-text-primary'
                : 'text-unbound-text-tertiary hover:text-unbound-text-primary')
            }
          >
            {content[t].title}
          </button>
        ))}
      </div>
      <Card className="p-5">
        <div className="flex items-start gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-unbound-purple shrink-0 mt-0.5" />
          <p className="text-[13px] text-unbound-text-secondary">{c.body}</p>
        </div>
        <ul className="text-[12.5px] text-unbound-text-tertiary space-y-1">
          {c.bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-unbound-text-muted">·</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-[11px] text-unbound-text-muted">
          Shipping M1 · schema defined · detection pipeline active
        </div>
      </Card>
    </>
  );
}
