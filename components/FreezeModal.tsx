'use client';

import { Modal } from './Modal';
import { AlertTriangle, Check } from 'lucide-react';
import { useState } from 'react';

export default function FreezeModal({
  open,
  onClose,
  deviceId,
  user,
}: {
  open: boolean;
  onClose: () => void;
  deviceId: string;
  user: string;
}) {
  const [lvl, setLvl] = useState<'read-only' | 'network-restrict' | 'full-isolate'>('read-only');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Freeze device"
      subtitle={`${user} · ${deviceId}`}
      width="lg"
      footer={
        <>
          <button onClick={onClose} className="px-3 py-1.5 text-[12px] rounded-md border border-unbound-border hover:bg-white">
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[12px] rounded-md bg-sev-critical text-white hover:bg-sev-critical/90 font-semibold"
          >
            Confirm freeze
          </button>
        </>
      }
    >
      <div className="rounded-md bg-sev-critical-bg border border-sev-critical/30 p-3 flex items-start gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-sev-critical shrink-0 mt-0.5" />
        <div className="text-[12.5px] text-unbound-text-secondary">
          This is a destructive action. All freeze levels are reversible but the user will be unable to use AI coding agents until unfrozen. Every freeze is Slack-notified to <span className="mono">#secops-pager</span> and logged in the audit ledger.
        </div>
      </div>

      <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted font-medium mb-2">Choose level</div>

      <div className="space-y-2 mb-4">
        {[
          {
            v: 'read-only' as const,
            title: 'Read-only (recommended)',
            desc: 'Agent sandbox forced to read-only. User keeps shell/IDE. No data loss. Rollback in 1 click.',
          },
          {
            v: 'network-restrict' as const,
            title: 'Network restrict',
            desc: 'Block agent egress + force traffic through corp LLM gateway. User experience slower. Rollback in 1 click.',
          },
          {
            v: 'full-isolate' as const,
            title: 'Full isolate (Okta + gateway)',
            desc: 'Revoke GitHub tokens, force Okta re-auth, pull device from MDM group. User is logged out of corp resources until SOC lead approves unfreeze.',
          },
        ].map((o) => (
          <button
            key={o.v}
            onClick={() => setLvl(o.v)}
            className={
              'w-full text-left p-3 rounded-md border transition ' +
              (lvl === o.v
                ? 'border-unbound-purple bg-unbound-purple/5'
                : 'border-unbound-border hover:bg-unbound-bg-hover')
            }
          >
            <div className="flex items-start gap-2">
              <div
                className={
                  'w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ' +
                  (lvl === o.v ? 'border-unbound-purple bg-unbound-purple' : 'border-unbound-border')
                }
              >
                {lvl === o.v && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-unbound-text-primary">{o.title}</div>
                <div className="text-[12px] text-unbound-text-tertiary mt-0.5">{o.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-md bg-unbound-bg border border-unbound-border p-3 text-[12px] text-unbound-text-secondary space-y-1">
        <div><span className="text-unbound-text-muted">Notify:</span> #secops-pager · PagerDuty (on-call) · user via Slack DM</div>
        <div><span className="text-unbound-text-muted">Rollback:</span> unfreeze button on device page · CISO or SOC lead role required</div>
        <div><span className="text-unbound-text-muted">Audit entry:</span> who, when, level, reason, linked incident</div>
      </div>
    </Modal>
  );
}
