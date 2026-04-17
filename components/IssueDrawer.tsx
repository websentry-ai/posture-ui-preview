'use client';

import { useState } from 'react';
import type { Finding } from '@/lib/mock-data';
import { SevBadge } from '@/components/SevBadge';
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
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import WaiveModal from './WaiveModal';
import ForwardModal from './ForwardModal';
import { Toast } from './Modal';

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
  const [waiveOpen, setWaiveOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [status, setStatus] = useState<'open' | 'triage' | 'waived' | 'remediated'>('open');

  if (!finding) return null;

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2400);
  };

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
              <button onClick={onPrev} className="p-1.5 hover:bg-unbound-bg-hover rounded" title="Previous (k)">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={onNext} className="p-1.5 hover:bg-unbound-bg-hover rounded" title="Next (j)">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-unbound-bg-hover rounded" title="Close (esc)">
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

        {/* status strip + actions */}
        <div className="px-5 py-3 border-b border-unbound-border flex items-center justify-between bg-unbound-bg-hover flex-wrap gap-2">
          <div className="flex items-center gap-3 text-[12px]">
            <div className="flex items-center gap-1">
              Status:{' '}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="font-semibold bg-white border border-unbound-border rounded px-1.5 py-0.5 text-[12px]"
              >
                <option value="open">Open</option>
                <option value="triage">In triage</option>
                <option value="waived">Waived</option>
                <option value="remediated">Remediated</option>
              </select>
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
          <button
            onClick={() => setWaiveOpen(true)}
            className="px-2.5 py-1 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover"
          >
            Waive
          </button>
          <button
            onClick={() => {
              setStatus('remediated');
              showToast('Marked as remediated — next scan will verify. Will reopen if still present.');
            }}
            className="px-2.5 py-1 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover"
          >
            Mark remediated
          </button>
          <button
            onClick={() => showToast('Flagged as Not Risky — de-prioritized across org. Reopenable.')}
            className="px-2.5 py-1 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover"
          >
            Not risky
          </button>
          <button
            onClick={() => setForwardOpen(true)}
            className="px-2.5 py-1 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover"
          >
            Forward fix
          </button>
          <button
            onClick={() => showToast(`Jira ticket created — SEC-${Math.floor(Math.random() * 900) + 100}`)}
            className="px-2.5 py-1 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover"
          >
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
            <div className="mt-3 text-[11px] text-unbound-text-muted">
              Secrets visible in evidence are redacted client-side in the hosted tenant. Full unredacted evidence is stored in the customer region ({'us-east-1'}) and access-logged.
            </div>
          </Section>

          {finding.classification && (
            <Section title="AI classification" icon={<Sparkles className="w-3.5 h-3.5 text-unbound-purple" />}>
              <div className="rounded-md border border-unbound-border p-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-semibold text-unbound-text-primary">
                    {finding.classification.class}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-unbound-text-tertiary">
                    Confidence:
                    <span className="font-semibold text-unbound-text-primary">
                      {Math.round(finding.classification.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <div className="text-[12px] text-unbound-text-secondary mt-1 leading-relaxed">
                  {finding.classification.reasoning}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mono bg-unbound-bg border-t border-unbound-border pt-2 -mx-3 -mb-3 px-3 pb-2 rounded-b-md">
                  <div>
                    <span className="text-unbound-text-muted">model:</span> {finding.classification.model}
                  </div>
                  <div>
                    <span className="text-unbound-text-muted">version:</span> {finding.classification.version}
                  </div>
                  <div>
                    <span className="text-unbound-text-muted">classified:</span> {finding.classification.timestamp}
                  </div>
                  <div>
                    <span className="text-unbound-text-muted">reviewed:</span> {finding.classification.reviewedBy}
                  </div>
                </div>
                <div className="flex gap-1.5 mt-3">
                  <button
                    onClick={() => showToast('Marked as human-reviewed — confidence locked.')}
                    className="text-[11px] px-2 py-1 rounded bg-unbound-purple text-white hover:bg-unbound-purple-hover"
                  >
                    Confirm classification
                  </button>
                  <button
                    onClick={() => showToast('Override recorded — classifier will retrain with this signal.')}
                    className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover"
                  >
                    Override
                  </button>
                </div>
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
              <div>Base severity: <span className="font-semibold">{finding.severity === 'critical' ? 'High' : finding.severity}</span> (rule #{finding.ruleId})</div>
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
                    {(['Slack DM', 'Email', 'Jira'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => {
                          navigator.clipboard?.writeText(finding.userFix);
                          showToast(`Copied as ${fmt}`);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded bg-white border border-unbound-border hover:bg-unbound-bg-hover"
                      >
                        <Copy className="w-3 h-3" /> {fmt}
                      </button>
                    ))}
                  </div>
                </div>
                <pre className="mono text-[12px] p-3 whitespace-pre-wrap text-unbound-text-secondary leading-relaxed">{finding.userFix}</pre>
              </div>

              <div className="rounded-md border border-unbound-border">
                <div className="px-3 py-2 border-b border-unbound-border flex items-center justify-between bg-unbound-bg-hover">
                  <div className="text-[12.5px] font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-unbound-purple" /> Admin fix (fleet-wide)
                  </div>
                  <button
                    onClick={() => showToast(`Downloaded ${finding.adminFix.profile}`)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded bg-unbound-purple text-white hover:bg-unbound-purple-hover"
                  >
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
                    <span className="text-unbound-text-secondary hover:text-unbound-purple cursor-pointer">{r.title}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>

      <WaiveModal
        open={waiveOpen}
        onClose={() => setWaiveOpen(false)}
        findingTitle={finding.title}
        onConfirm={() => {
          setWaiveOpen(false);
          setStatus('waived');
          showToast('Waiver recorded with expiry + audit trail. Re-justification required before re-extension.');
        }}
      />
      <ForwardModal
        open={forwardOpen}
        onClose={() => setForwardOpen(false)}
        user={finding.user}
        body={finding.userFix}
      />
      {toast && <Toast message={toast} kind="success" />}
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
