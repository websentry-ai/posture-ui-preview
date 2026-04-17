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
  ShieldCheck,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import WaiveModal from './WaiveModal';
import ForwardModal from './ForwardModal';
import { Toast } from './Modal';
import { suggestedAction, whyNowNarrative, buManager } from '@/lib/mock-data';
import { Zap, Brain, User } from 'lucide-react';

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

  const confidenceChip = finding.classification
    ? finding.classification.confidence >= 0.95
      ? 'high confidence'
      : finding.classification.confidence >= 0.8
      ? 'medium confidence'
      : 'low confidence'
    : null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/25" onClick={onClose} />
      <div className="w-[620px] bg-white shadow-2xl flex flex-col border-l border-unbound-border">
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
            <SeverityPill finding={finding} />
            <h2 className="text-[16px] font-semibold text-unbound-text-primary">{finding.title}</h2>
          </div>
          <div className="mt-1 text-[12px] text-unbound-text-tertiary flex items-center gap-2 flex-wrap">
            <span>{finding.user} · {finding.bu} · {finding.device}</span>
            {buManager[finding.bu] && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10.5px] bg-unbound-bg border border-unbound-border">
                <User className="w-2.5 h-2.5" /> owner: {buManager[finding.bu]}
              </span>
            )}
          </div>
        </div>

        {/* status strip */}
        <div className="px-5 py-2 border-b border-unbound-border bg-unbound-bg-hover flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              Status
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
            <span className="text-unbound-text-muted">·</span>
            <span>SOC-L1-queue</span>
            <span className="text-unbound-text-muted">·</span>
            <span className={cn(finding.slaBreach ? 'text-sev-critical font-semibold' : '')}>SLA {finding.slaLabel}</span>
          </div>
        </div>
        <div className="px-5 py-2 border-b border-unbound-border flex flex-wrap gap-1.5">
          <button onClick={() => setWaiveOpen(true)} className="px-2.5 py-1 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
            Waive
          </button>
          <button onClick={() => { setStatus('remediated'); showToast('Marked remediated — next scan will verify'); }} className="px-2.5 py-1 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
            Mark remediated
          </button>
          <button onClick={() => showToast('Flagged Not Risky — de-prioritized')} className="px-2.5 py-1 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
            Not risky
          </button>
          <button onClick={() => setForwardOpen(true)} className="px-2.5 py-1 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
            Forward fix
          </button>
          <button onClick={() => showToast(`SOAR case opened · SEC-${Math.floor(Math.random() * 900) + 100}`)} className="px-2.5 py-1 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
            Open ticket
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto drawer-scroll">
          {/* AI-native guidance rows — rules-driven next action + LLM-narrative why-now */}
          {suggestedAction[finding.ruleId] && (
            <div className="px-5 py-4 border-b border-unbound-border bg-unbound-purple/5">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-unbound-purple shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-unbound-purple font-semibold">Suggested next action</div>
                  <div className="text-[13px] text-unbound-text-primary font-medium mt-0.5">{suggestedAction[finding.ruleId].title}</div>
                </div>
                <button
                  onClick={() => {
                    const sa = suggestedAction[finding.ruleId];
                    if (sa.profile) {
                      showToast(`${sa.profile}.mobileconfig queued · Jamf canary 10% first · ETA 14 min`);
                    } else {
                      showToast(sa.cta);
                    }
                  }}
                  className="px-2.5 py-1 text-[11.5px] rounded bg-unbound-purple text-white hover:bg-unbound-purple-hover shrink-0"
                >
                  {suggestedAction[finding.ruleId].cta}
                </button>
              </div>
            </div>
          )}

          {whyNowNarrative[finding.id] && (
            <div className="px-5 py-4 border-b border-unbound-border">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-unbound-text-muted mb-1.5">
                <Brain className="w-3.5 h-3.5 text-unbound-purple" />
                Why this matters now
                <span title="Generated at drawer-open time from device + finding + fleet + history context. Reviewable in the audit log." className="ml-1 px-1 py-0 rounded bg-unbound-bg text-[9px] uppercase tracking-wider text-unbound-text-tertiary font-medium cursor-help">
                  AI
                </span>
              </div>
              <p className="text-[12.5px] text-unbound-text-secondary leading-relaxed">{whyNowNarrative[finding.id]}</p>
            </div>
          )}

          <Section title="Evidence" meta="verified 38 min ago">
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

          {finding.classification && confidenceChip && (
            <Section title="Classification" icon={<Sparkles className="w-3.5 h-3.5 text-unbound-purple" />}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] bg-unbound-purple/10 text-unbound-purple border border-unbound-purple/20">
                  {finding.classification.class}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-sev-low-bg text-sev-low border border-sev-low/30" title={`confidence ${Math.round(finding.classification.confidence * 100)}%`}>
                  {confidenceChip}
                </span>
                <span className="text-[11px] mono text-unbound-text-muted">{finding.classification.model}</span>
              </div>
              <div className="text-[12px] text-unbound-text-secondary mt-2 leading-relaxed">
                {finding.classification.reasoning}
              </div>
              <div className="flex gap-1.5 mt-2">
                <button onClick={() => showToast('Classification confirmed · locked')} className="text-[11px] px-2 py-1 rounded bg-unbound-purple text-white">
                  Confirm
                </button>
                <button onClick={() => showToast('Override recorded · classifier will retrain')} className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
                  Override
                </button>
              </div>
            </Section>
          )}

          <Section title="Attack path">
            <ol className="space-y-1 text-[13px] text-unbound-text-secondary">
              {finding.attack.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mono text-unbound-purple">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            {finding.escalators.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {finding.escalators.map((e) => (
                  <span
                    key={e}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-sev-critical-bg text-sev-critical border border-sev-critical/20"
                  >
                    ✓ {e}
                  </span>
                ))}
              </div>
            )}
          </Section>

          <Section title="Remediation">
            <div className="space-y-3">
              <div className="rounded-md border border-unbound-border">
                <div className="px-3 py-2 border-b border-unbound-border flex items-center justify-between bg-unbound-bg-hover">
                  <div className="text-[12.5px] font-semibold">User-step fix</div>
                  <div className="flex gap-1">
                    {(['Slack', 'Email', 'Jira'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => { navigator.clipboard?.writeText(finding.userFix); showToast(`Copied · ${fmt}`); }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-white border border-unbound-border hover:bg-unbound-bg-hover"
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
                    <ShieldCheck className="w-3.5 h-3.5 text-unbound-purple" /> Admin fix
                  </div>
                  <button onClick={() => showToast(`Downloaded ${finding.adminFix.profile}`)} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-unbound-purple text-white hover:bg-unbound-purple-hover">
                    <Download className="w-3 h-3" /> Profile
                  </button>
                </div>
                <div className="p-3 text-[12.5px] space-y-1">
                  <div className="mono">{finding.adminFix.profile}</div>
                  <div className="text-unbound-text-tertiary">{finding.adminFix.scope}</div>
                  <div className="text-unbound-text-secondary text-[12px]">{finding.adminFix.effect}</div>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Compliance">
            <div className="flex flex-wrap gap-1.5">
              {finding.compliance.map((c) => (
                <span
                  key={c.framework}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-unbound-bg border border-unbound-border"
                  title={c.controls}
                >
                  <span className="font-medium">{c.framework}</span>
                  <span className="mono text-unbound-text-muted">{c.controls}</span>
                </span>
              ))}
            </div>
          </Section>

          <Section title="History">
            <ol className="space-y-1 text-[12.5px]">
              {finding.history.map((h, i) => (
                <li key={i} className="flex gap-2">
                  <Clock className="w-3 h-3 text-unbound-text-muted mt-1 shrink-0" />
                  <div>
                    <span className="mono text-unbound-text-tertiary text-[11.5px]">{h.t}</span>
                    <span className="text-unbound-text-secondary ml-2">{h.event}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          {finding.related.length > 0 && (
            <Section title="Related">
              <ul className="space-y-1 text-[12.5px]">
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

      <WaiveModal
        open={waiveOpen}
        onClose={() => setWaiveOpen(false)}
        findingTitle={finding.title}
        onConfirm={() => {
          setWaiveOpen(false);
          setStatus('waived');
          showToast('Waiver recorded · audit ledger updated');
        }}
      />
      <ForwardModal
        open={forwardOpen}
        onClose={() => setForwardOpen(false)}
        onConfirm={(i) => showToast(`Sent via ${i.channel} · ${i.user} · re-check scheduled in ${i.deadline}`)}
        user={finding.user}
        body={finding.userFix}
      />
      {toast && <Toast message={toast} kind="success" />}
    </div>
  );
}

function SeverityPill({ finding }: { finding: Finding }) {
  return (
    <div className="relative group">
      <SevBadge severity={finding.severity} />
      <div className="absolute top-full left-0 mt-1 w-60 p-2 bg-unbound-text-primary text-white rounded-md text-[11px] opacity-0 group-hover:opacity-100 pointer-events-none transition z-10 shadow-lg">
        <div className="font-semibold mb-1 flex items-center gap-1">
          <Info className="w-3 h-3" /> Severity math
        </div>
        <div className="mono leading-relaxed">
          Base High (#{finding.ruleId})
          {finding.escalators.map((e) => (
            <div key={e}>↑ {e} · +1 tier</div>
          ))}
          <div className="pt-1 mt-1 border-t border-white/30 font-semibold">
            = {finding.severity.toUpperCase()}
          </div>
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
