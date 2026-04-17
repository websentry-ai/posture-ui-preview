'use client';

import type { Finding } from '@/lib/mock-data';
import { SevBadge, Chip } from '@/components/SevBadge';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Clock,
  Sparkles,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function IssueDrawer({
  finding,
  onClose,
  onPrev,
  onNext,
}: {
  finding: Finding | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  if (!finding) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/25" onClick={onClose} />
      <div className="w-[640px] bg-white shadow-2xl flex flex-col border-l border-unbound-border">
        {/* header */}
        <div className="px-5 py-4 border-b border-unbound-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-unbound-text-tertiary">
              <span className="font-semibold text-unbound-text-primary">#{finding.ruleId}</span>
              <span>·</span>
              <span>{finding.agent}</span>
              <span>·</span>
              <span>{finding.firstSeen}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={onPrev} className="p-1.5 hover:bg-unbound-bg-hover rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={onNext} className="p-1.5 hover:bg-unbound-bg-hover rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-unbound-bg-hover rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <SevBadge severity={finding.severity} />
            <h2 className="text-[16px] font-semibold text-unbound-text-primary">{finding.title}</h2>
          </div>
          <div className="mt-1 text-[12px] text-unbound-text-tertiary">
            {finding.user} · {finding.bu} · {finding.device}
          </div>
        </div>

        {/* actions */}
        <div className="px-5 py-3 border-b border-unbound-border flex items-center justify-between bg-unbound-bg-hover">
          <div className="flex items-center gap-3 text-[12px]">
            <div>
              Status: <span className="font-semibold">Open</span>
            </div>
            <div className="text-unbound-text-muted">·</div>
            <div>
              Assignee: <span className="font-semibold">SOC-L1-queue</span>
            </div>
            <div className="text-unbound-text-muted">·</div>
            <div className={cn(finding.slaBreach ? 'text-sev-critical font-semibold' : 'text-unbound-text-secondary')}>
              SLA: {finding.slaLabel}
            </div>
          </div>
        </div>
        <div className="px-5 py-2 border-b border-unbound-border flex flex-wrap gap-1.5">
          <button className="px-2.5 py-1 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
            Waive
          </button>
          <button className="px-2.5 py-1 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
            Not risky
          </button>
          <button className="px-2.5 py-1 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
            Mark remediated
          </button>
          <button className="px-2.5 py-1 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
            Forward fix
          </button>
          <button className="px-2.5 py-1 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
            Create Jira
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto drawer-scroll">
          <Section title="What">
            <p className="text-[13px] text-unbound-text-secondary leading-relaxed">
              {finding.title}. {finding.attack[0]}.
            </p>
          </Section>

          <Section title="Evidence" meta="Last verified 38 min ago">
            {finding.evidence.map((ev, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="text-[11.5px] font-medium text-unbound-text-tertiary mb-1 mono">
                  {ev.path}
                </div>
                <div className="mono bg-unbound-bg rounded-md border border-unbound-border overflow-hidden">
                  {ev.lines.map((l) => (
                    <div key={l.n} className="flex">
                      <div className="px-2 py-1 text-right text-unbound-text-muted select-none bg-white border-r border-unbound-border w-12 shrink-0 text-[11px]">
                        {l.n}
                      </div>
                      <div className="px-3 py-1 text-[12px] text-unbound-text-primary whitespace-pre overflow-x-auto">
                        {l.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Section>

          {finding.classification && (
            <Section title="AI classification" icon={<Sparkles className="w-3.5 h-3.5 text-unbound-purple" />}>
              <div className="rounded-md border border-unbound-border p-3 bg-white">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-unbound-text-primary">
                  {finding.classification.class}
                </div>
                <div className="text-[12px] text-unbound-text-secondary mt-1 leading-relaxed">
                  {finding.classification.reasoning}
                </div>
                <button className="text-[11px] text-unbound-purple font-medium mt-2 hover:underline">
                  Override classification
                </button>
              </div>
            </Section>
          )}

          <Section title="Why it matters">
            <div className="text-[12.5px] text-unbound-text-secondary mb-3">Attack path:</div>
            <ol className="space-y-1.5 text-[13px] text-unbound-text-secondary">
              {finding.attack.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mono text-unbound-purple">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            {finding.escalators.length > 0 && (
              <div className="mt-4">
                <div className="text-[12.5px] text-unbound-text-secondary mb-2">
                  Blast radius on this device (active escalators):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {finding.escalators.map((e) => (
                    <span
                      key={e}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] bg-sev-critical-bg text-sev-critical border border-sev-critical/20"
                    >
                      ✓ {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Section title="Severity explained">
            <div className="rounded-md bg-unbound-bg border border-unbound-border p-3 text-[12.5px] space-y-1 mono">
              <div>Base severity: <span className="font-semibold">High</span> (rule #{finding.ruleId})</div>
              {finding.escalators.map((e) => (
                <div key={e} className="text-sev-critical">↑ {e} &nbsp;+1 tier</div>
              ))}
              <div className="pt-2 border-t border-unbound-border mt-2 font-semibold">
                = {finding.severity.toUpperCase()}
              </div>
            </div>
          </Section>

          <Section title="Remediation">
            <div className="space-y-3">
              <div className="rounded-md border border-unbound-border">
                <div className="px-3 py-2 border-b border-unbound-border flex items-center justify-between bg-unbound-bg-hover">
                  <div className="text-[12.5px] font-semibold">User-step fix</div>
                  <div className="flex gap-1">
                    <button className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded bg-white border border-unbound-border hover:bg-unbound-bg-hover">
                      <Copy className="w-3 h-3" /> Slack DM
                    </button>
                    <button className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded bg-white border border-unbound-border hover:bg-unbound-bg-hover">
                      <Copy className="w-3 h-3" /> Email
                    </button>
                    <button className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded bg-white border border-unbound-border hover:bg-unbound-bg-hover">
                      <Copy className="w-3 h-3" /> Jira
                    </button>
                  </div>
                </div>
                <pre className="mono text-[12px] p-3 whitespace-pre-wrap text-unbound-text-secondary leading-relaxed">{finding.userFix}</pre>
              </div>

              <div className="rounded-md border border-unbound-border">
                <div className="px-3 py-2 border-b border-unbound-border flex items-center justify-between bg-unbound-bg-hover">
                  <div className="text-[12.5px] font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-unbound-purple" /> Admin fix (fleet-wide)
                  </div>
                  <button className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded bg-unbound-purple text-white hover:bg-unbound-purple-hover">
                    <Download className="w-3 h-3" /> Download profile
                  </button>
                </div>
                <div className="p-3 text-[12.5px] space-y-1.5">
                  <div>
                    <span className="text-unbound-text-muted">Profile:</span>{' '}
                    <span className="mono">{finding.adminFix.profile}</span>
                  </div>
                  <div>
                    <span className="text-unbound-text-muted">Scope:</span> {finding.adminFix.scope}
                  </div>
                  <div>
                    <span className="text-unbound-text-muted">Effect:</span>{' '}
                    <span className="text-unbound-text-secondary">{finding.adminFix.effect}</span>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Compliance">
            <div className="grid grid-cols-2 gap-2 text-[12.5px]">
              {finding.compliance.map((c) => (
                <div key={c.framework} className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-unbound-text-muted mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted">
                      {c.framework}
                    </div>
                    <div className="mono text-unbound-text-secondary">{c.controls}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="History">
            <ol className="space-y-1 text-[12.5px]">
              {finding.history.map((h, i) => (
                <li key={i} className="flex gap-3">
                  <Clock className="w-3.5 h-3.5 text-unbound-text-muted mt-0.5 shrink-0" />
                  <div>
                    <span className="mono text-unbound-text-tertiary">{h.t}</span>
                    <span className="text-unbound-text-secondary ml-2">{h.event}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          {finding.related.length > 0 && (
            <Section title="Related on this device">
              <ul className="space-y-1.5 text-[12.5px]">
                {finding.related.map((r) => (
                  <li key={r.id} className="flex items-center gap-2">
                    <SevBadge severity={r.severity} />
                    <span className="text-unbound-text-secondary">{r.title}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  meta,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  meta?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 border-b border-unbound-border last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-unbound-text-muted">
          {icon}
          {title}
        </div>
        {meta && <div className="text-[11px] text-unbound-text-muted">{meta}</div>}
      </div>
      {children}
    </div>
  );
}
