import { PageHeader, Card, CardHeader } from '@/components/Card';
import { Chip } from '@/components/SevBadge';
import { mcpInbox } from '@/lib/mock-data';
import { CheckCircle2, XCircle, ShieldAlert, Plus, Upload, Sparkles } from 'lucide-react';

const approved = [
  { mcp: 'github-official', publisher: 'github (verified)', pin: '>=1.2.0', scope: 'r+w', source: 'Unbound curated' },
  { mcp: 'slack-official', publisher: 'anthropic', pin: '>=1.0.0', scope: 'r+w', source: 'Unbound curated' },
  { mcp: 'linear-mcp', publisher: 'linear (verified)', pin: '>=0.9.0', scope: 'r+w', source: 'Unbound curated' },
  { mcp: 'custom-db-mcp', publisher: 'internal', pin: 'exact 1.0.4', scope: 'w', source: 'Your org' },
  { mcp: 'postgres-read', publisher: 'your corp', pin: 'exact 0.8.2', scope: 'r', source: 'Your org' },
];

export default function MCPCatalog() {
  return (
    <>
      <PageHeader
        title="MCP catalog"
        meta="47 approved · 38 Unbound curated · 9 your org · 3 inbox"
        right={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
              <Upload className="w-3.5 h-3.5" />
              Import JSON
            </button>
            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
              <Plus className="w-3.5 h-3.5" />
              Add MCP
            </button>
          </div>
        }
      />

      {/* Inbox callout */}
      <div className="mb-5 p-4 rounded-xl bg-sev-high-bg border border-sev-high/20 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-sev-high shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-[13px] font-semibold text-unbound-text-primary">
            3 unvetted MCPs seen this week
          </div>
          <div className="text-[12px] text-unbound-text-secondary mt-0.5">
            Review and approve / reject / quarantine below. Enrichment from npm, GitHub, and the Unbound catalog network.
          </div>
        </div>
      </div>

      {/* Inbox */}
      <Card className="mb-5">
        <CardHeader title="Inbox" meta="sorted by device count" right={<Sparkles className="w-4 h-4 text-unbound-purple" />} />
        <div className="divide-y divide-unbound-border">
          {mcpInbox.map((m) => (
            <div key={m.name} className="p-5 hover:bg-unbound-bg-hover">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="mono text-[13.5px] font-semibold text-unbound-text-primary">{m.name}</div>
                  <div className="text-[12px] text-unbound-text-tertiary mt-0.5">
                    On {m.devices} devices · first-seen recently
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] rounded-md bg-sev-low-bg text-sev-low border border-sev-low/30 hover:bg-sev-low/10">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] rounded-md bg-sev-critical-bg text-sev-critical border border-sev-critical/30 hover:bg-sev-critical/10">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
                    Quarantine
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-[12px]">
                <Meta label="Publisher" value={m.publisher} />
                <Meta label="Downloads" value={m.downloads.toLocaleString()} />
                <Meta label="Age" value={m.age} />
                <Meta label="GitHub" value={m.github} />
              </div>

              <div className="mt-2 text-[12px]">
                <span className="text-unbound-text-muted">Tools: </span>
                <span className="mono text-unbound-text-secondary">{m.tools}</span>
              </div>
              <div className="mt-2 text-[12px] text-sev-high bg-sev-high-bg border border-sev-high/20 inline-flex px-2 py-1 rounded">
                Risk: {m.risk}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Approved catalog table */}
      <Card>
        <CardHeader
          title="Approved MCPs"
          meta="Admin-curated allowlist · drives #6"
          right={
            <div className="text-[11px] text-unbound-text-tertiary">
              Unbound proposed 4 new entries  ·{' '}
              <button className="text-unbound-purple font-semibold hover:underline">Review ↓</button>
            </div>
          }
        />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border">
              <th className="px-5 py-2.5 font-medium">MCP</th>
              <th className="px-3 py-2.5 font-medium">Publisher</th>
              <th className="px-3 py-2.5 font-medium">Pin</th>
              <th className="px-3 py-2.5 font-medium">Scope</th>
              <th className="px-3 py-2.5 font-medium">Source</th>
              <th className="px-3 py-2.5 font-medium">Used on</th>
            </tr>
          </thead>
          <tbody>
            {approved.map((a) => (
              <tr key={a.mcp} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3 mono text-[12.5px] text-unbound-text-primary font-medium">{a.mcp}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{a.publisher}</td>
                <td className="px-3 py-3 mono text-[12px]">{a.pin}</td>
                <td className="px-3 py-3"><Chip>{a.scope}</Chip></td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{a.source}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-unbound-text-muted">{label}</div>
      <div className="text-unbound-text-secondary mt-0.5 mono text-[12px]">{value}</div>
    </div>
  );
}
