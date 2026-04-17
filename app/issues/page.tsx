'use client';

import { useState, useMemo } from 'react';
import { findings } from '@/lib/mock-data';
import type { Finding } from '@/lib/mock-data';
import { PageHeader } from '@/components/Card';
import { SevBadge, Chip } from '@/components/SevBadge';
import IssueDrawer from '@/components/IssueDrawer';
import { ChevronDown, ChevronRight, Filter, Save, Command as CmdIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function IssuesPage() {
  const [openFinding, setOpenFinding] = useState<Finding | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 2: true, 4: true, 22: true });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    const g: Record<number, Finding[]> = {};
    for (const f of findings) {
      if (!g[f.ruleId]) g[f.ruleId] = [];
      g[f.ruleId].push(f);
    }
    return g;
  }, []);

  const ruleTitle: Record<number, string> = {
    2: 'YOLO / Bypass mode enabled',
    4: 'Base-URL / root-CA override',
    22: 'IMDS egress reachable',
    1: 'Personal account on managed device',
    6: 'Unvetted MCP server',
    8: 'Broad Bash auto-allow',
    9: 'Shell-executing hook (classified: malicious)',
  };

  const ruleSev: Record<number, 'critical' | 'high'> = {
    2: 'critical',
    4: 'critical',
    22: 'critical',
    1: 'high',
    6: 'high',
    8: 'high',
    9: 'high',
  };

  const toggleRule = (id: number) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const openAt = (f: Finding) => setOpenFinding(f);
  const close = () => setOpenFinding(null);
  const navigate = (dir: 1 | -1) => {
    if (!openFinding) return;
    const i = findings.findIndex((f) => f.id === openFinding.id);
    const next = findings[(i + dir + findings.length) % findings.length];
    setOpenFinding(next);
  };

  return (
    <>
      <PageHeader
        title="Issues"
        subtitle="The workbench — triage, assign, act. Keyboard: j/k cycle · w waive · n not-risky · m remediated · f forward"
        right={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
              <Save className="w-3.5 h-3.5" />
              Saved views
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
              <Upload className="w-3.5 h-3.5" />
              Export
            </button>
            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-unbound-text-primary text-white">
              <CmdIcon className="w-3.5 h-3.5" />K
            </button>
          </div>
        }
      />

      {/* status tabs */}
      <div className="flex items-center gap-6 border-b border-unbound-border mb-4 text-[13px]">
        <button className="py-2 border-b-2 border-unbound-purple font-semibold text-unbound-text-primary">
          Open <span className="text-unbound-text-muted font-normal">62</span>
        </button>
        <button className="py-2 text-unbound-text-tertiary hover:text-unbound-text-primary">
          In triage <span className="text-unbound-text-muted">8</span>
        </button>
        <button className="py-2 text-unbound-text-tertiary hover:text-unbound-text-primary">
          Waived <span className="text-unbound-text-muted">14</span>
        </button>
        <button className="py-2 text-unbound-text-tertiary hover:text-unbound-text-primary">
          Closed <span className="text-unbound-text-muted">1,238</span>
        </button>
      </div>

      {/* filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="inline-flex items-center gap-1 px-2 py-1 text-[12px] rounded-md bg-unbound-purple/10 text-unbound-purple">
          severity: Critical, High
          <button className="ml-1 opacity-70 hover:opacity-100">×</button>
        </div>
        <div className="inline-flex items-center gap-1 px-2 py-1 text-[12px] rounded-md bg-unbound-purple/10 text-unbound-purple">
          assigned: me
          <button className="ml-1 opacity-70 hover:opacity-100">×</button>
        </div>
        <div className="inline-flex items-center gap-1 px-2 py-1 text-[12px] rounded-md bg-unbound-purple/10 text-unbound-purple">
          first-seen: 7d
          <button className="ml-1 opacity-70 hover:opacity-100">×</button>
        </div>
        <button className="inline-flex items-center gap-1 px-2 py-1 text-[12px] rounded-md border border-dashed border-unbound-border text-unbound-text-tertiary hover:text-unbound-text-primary">
          <Filter className="w-3 h-3" />
          + filter
        </button>
        <div className="flex-1" />
        <div className="inline-flex items-center gap-2 text-[12px] text-unbound-text-tertiary">
          <span>Sort: severity × escalators</span>
          <span>·</span>
          <span>Group by: finding type</span>
          <span>·</span>
          <span>View: by type</span>
        </div>
      </div>

      {/* groups */}
      <div className="bg-white rounded-xl border border-unbound-border overflow-hidden">
        {Object.entries(groups).map(([ruleIdStr, list]) => {
          const ruleId = Number(ruleIdStr);
          const isOpen = expanded[ruleId];
          return (
            <div key={ruleId} className="border-b border-unbound-border last:border-0">
              <button
                onClick={() => toggleRule(ruleId)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-unbound-bg-hover"
              >
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-unbound-text-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-unbound-text-muted" />
                )}
                <div className="flex items-center gap-2">
                  <span className="mono text-[12px] text-unbound-text-muted">#{ruleId}</span>
                  <span className="text-[13.5px] font-medium text-unbound-text-primary">
                    {ruleTitle[ruleId]}
                  </span>
                </div>
                <div className="flex-1" />
                <SevBadge severity={ruleSev[ruleId]} />
                <span className="text-[12px] text-unbound-text-tertiary">
                  {list.length} device{list.length > 1 ? 's' : ''}
                </span>
              </button>
              {isOpen && (
                <table className="w-full text-[13px] border-t border-unbound-border bg-unbound-bg-hover/40">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted">
                      <th className="px-5 py-2 font-medium w-10"></th>
                      <th className="px-3 py-2 font-medium">User</th>
                      <th className="px-3 py-2 font-medium">Device</th>
                      <th className="px-3 py-2 font-medium">Agent</th>
                      <th className="px-3 py-2 font-medium">First seen</th>
                      <th className="px-3 py-2 font-medium">Escalators</th>
                      <th className="px-3 py-2 font-medium">SLA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((f) => (
                      <tr
                        key={f.id}
                        onClick={() => openAt(f)}
                        className="border-t border-unbound-border cursor-pointer hover:bg-white"
                      >
                        <td className="px-5 py-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.has(f.id)}
                            onChange={() => toggleSelect(f.id)}
                            className="accent-unbound-purple"
                          />
                        </td>
                        <td className="px-3 py-2 text-unbound-text-primary font-medium">{f.user}</td>
                        <td className="px-3 py-2 text-unbound-text-tertiary mono text-[12px]">
                          {f.device}
                        </td>
                        <td className="px-3 py-2 text-unbound-text-tertiary">{f.agent}</td>
                        <td className="px-3 py-2 text-unbound-text-tertiary">{f.firstSeen}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {f.escalators.slice(0, 3).map((e) => (
                              <Chip key={e}>+{e}</Chip>
                            ))}
                          </div>
                        </td>
                        <td className={cn('px-3 py-2 font-medium', f.slaBreach ? 'text-sev-critical' : 'text-unbound-text-secondary')}>
                          {f.slaLabel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>

      {/* bulk actions */}
      {selected.size > 0 && (
        <div className="mt-4 p-3 bg-unbound-text-primary text-white rounded-lg flex items-center gap-3 text-[13px]">
          <span className="font-semibold">Selected {selected.size}</span>
          <div className="flex gap-2">
            <button className="px-2.5 py-1 text-[12px] rounded bg-white/10 hover:bg-white/20">Bulk waive</button>
            <button className="px-2.5 py-1 text-[12px] rounded bg-white/10 hover:bg-white/20">Assign to</button>
            <button className="px-2.5 py-1 text-[12px] rounded bg-white/10 hover:bg-white/20">Forward user-step fix</button>
            <button className="px-2.5 py-1 text-[12px] rounded bg-white/10 hover:bg-white/20">Create Jira ({selected.size})</button>
            <button className="px-2.5 py-1 text-[12px] rounded bg-white/10 hover:bg-white/20">→ Splunk</button>
          </div>
        </div>
      )}

      <IssueDrawer
        finding={openFinding}
        onClose={close}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
      />
    </>
  );
}
