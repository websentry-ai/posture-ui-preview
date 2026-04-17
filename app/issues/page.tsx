'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { findings } from '@/lib/mock-data';
import type { Finding } from '@/lib/mock-data';
import { PageHeader } from '@/components/Card';
import { SevBadge, Chip } from '@/components/SevBadge';
import IssueDrawer from '@/components/IssueDrawer';
import { Toast } from '@/components/Modal';
import { ChevronDown, ChevronRight, Filter, Upload, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabState = 'open' | 'triage' | 'waived' | 'closed';

export default function IssuesPage() {
  return (
    <Suspense fallback={null}>
      <IssuesPageInner />
    </Suspense>
  );
}

function IssuesPageInner() {
  const searchParams = useSearchParams();
  const ruleFilter = searchParams.get('rule');
  const [openFinding, setOpenFinding] = useState<Finding | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 2: true, 4: true, 22: true });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<TabState>('open');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (ruleFilter) {
      const id = Number(ruleFilter);
      setExpanded({ [id]: true });
    }
  }, [ruleFilter]);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openFinding) setOpenFinding(null);
      if (!openFinding) return;
      if (e.key === 'j' || e.key === 'k') {
        const i = findings.findIndex((f) => f.id === openFinding.id);
        const dir = e.key === 'j' ? 1 : -1;
        setOpenFinding(findings[(i + dir + findings.length) % findings.length]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openFinding]);

  const visible = useMemo(() => {
    if (tab !== 'open') return [];
    if (!ruleFilter) return findings;
    const id = Number(ruleFilter);
    return findings.filter((f) => f.ruleId === id);
  }, [tab, ruleFilter]);

  const groups = useMemo(() => {
    const g: Record<number, Finding[]> = {};
    for (const f of visible) {
      if (!g[f.ruleId]) g[f.ruleId] = [];
      g[f.ruleId].push(f);
    }
    return g;
  }, [visible]);

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
    1: 'critical',
    6: 'high',
    8: 'high',
    9: 'critical',
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
        meta={ruleFilter ? `Filtered to #${ruleFilter}` : `${findings.length} open`}
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Exported CSV with finding ledger + control mapping')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover"
            >
              <Upload className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        }
      />

      {/* status tabs */}
      <div className="flex items-center gap-6 border-b border-unbound-border mb-4 text-[13px]">
        {(
          [
            ['open', 'Open', findings.length],
            ['triage', 'In triage', 8],
            ['waived', 'Waived', 14],
            ['closed', 'Closed', 1238],
          ] as const
        ).map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setTab(val as TabState)}
            className={cn(
              'py-2',
              tab === val
                ? 'border-b-2 border-unbound-purple font-semibold text-unbound-text-primary'
                : 'text-unbound-text-tertiary hover:text-unbound-text-primary'
            )}
          >
            {label} <span className="text-unbound-text-muted font-normal">{count}</span>
          </button>
        ))}
      </div>

      {/* filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <FilterChip label="severity: Critical, High" onRemove={() => showToast('Filter removed')} />
        <FilterChip label="assigned: me" onRemove={() => showToast('Filter removed')} />
        <FilterChip label="first-seen: 7d" onRemove={() => showToast('Filter removed')} />
        {ruleFilter && (
          <a
            href="/issues"
            className="inline-flex items-center gap-1 px-2 py-1 text-[12px] rounded-md bg-unbound-purple text-white"
          >
            rule: #{ruleFilter}
            <span className="ml-1 opacity-70 hover:opacity-100">×</span>
          </a>
        )}
        <button
          onClick={() => showToast('Filter builder — coming soon')}
          className="inline-flex items-center gap-1 px-2 py-1 text-[12px] rounded-md border border-dashed border-unbound-border text-unbound-text-tertiary hover:text-unbound-text-primary"
        >
          <Filter className="w-3 h-3" />
          + filter
        </button>
      </div>

      {visible.length === 0 && (
        <div className="bg-white rounded-xl border border-unbound-border p-10 text-center">
          <div className="text-[14px] font-semibold text-unbound-text-primary mb-1">
            No findings in this state
          </div>
          <div className="text-[12.5px] text-unbound-text-tertiary">
            {tab === 'triage' && '8 findings in triage assigned to SOC team. Switch to Open to see live findings.'}
            {tab === 'waived' && '14 waivers active. See Admin → Suppressions for audit trail.'}
            {tab === 'closed' && '1,238 closed findings in the last 90 days. Includes scan-verified remediations.'}
          </div>
        </div>
      )}

      {/* groups */}
      {visible.length > 0 && (
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
                        <th className="px-3 py-2 font-medium w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((f) => (
                        <tr
                          key={f.id}
                          onClick={() => openAt(f)}
                          className="border-t border-unbound-border cursor-pointer hover:bg-white group"
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
                          <td
                            className={cn(
                              'px-3 py-2 font-medium',
                              f.slaBreach ? 'text-sev-critical' : 'text-unbound-text-secondary'
                            )}
                          >
                            {f.slaLabel}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded border border-unbound-border text-unbound-purple opacity-0 group-hover:opacity-100 transition">
                              Open <ExternalLink className="w-3 h-3" />
                            </span>
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
      )}

      {/* bulk actions */}
      {selected.size > 0 && (
        <div className="mt-4 p-3 bg-unbound-text-primary text-white rounded-lg flex items-center gap-3 text-[13px]">
          <span className="font-semibold">Selected {selected.size}</span>
          <div className="flex gap-2">
            <button
              onClick={() => showToast(`${selected.size} findings waived with reason + expiry`)}
              className="px-2.5 py-1 text-[12px] rounded bg-white/10 hover:bg-white/20"
            >
              Bulk waive
            </button>
            <button
              onClick={() => showToast(`${selected.size} findings assigned to SOC lead`)}
              className="px-2.5 py-1 text-[12px] rounded bg-white/10 hover:bg-white/20"
            >
              Assign to
            </button>
            <button
              onClick={() => showToast(`${selected.size} personalized messages drafted per user`)}
              className="px-2.5 py-1 text-[12px] rounded bg-white/10 hover:bg-white/20"
            >
              Forward user-step fix
            </button>
            <button
              onClick={() => showToast(`${selected.size} Jira tickets created`)}
              className="px-2.5 py-1 text-[12px] rounded bg-white/10 hover:bg-white/20"
            >
              Create Jira ({selected.size})
            </button>
            <button
              onClick={() => showToast(`Events shipped to Splunk HEC (CIM schema)`)}
              className="px-2.5 py-1 text-[12px] rounded bg-white/10 hover:bg-white/20"
            >
              → Splunk
            </button>
          </div>
        </div>
      )}

      <IssueDrawer
        finding={openFinding}
        onClose={close}
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
      />
      {toast && <Toast message={toast} kind="success" />}
    </>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 text-[12px] rounded-md bg-unbound-purple/10 text-unbound-purple">
      {label}
      <button onClick={onRemove} className="ml-1 opacity-70 hover:opacity-100">×</button>
    </div>
  );
}
