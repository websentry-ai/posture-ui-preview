'use client';

import { useState } from 'react';
import { Modal } from './Modal';

export default function WaiveModal({
  open,
  onClose,
  findingTitle,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  findingTitle: string;
  onConfirm: (data: { reason: string; approver: string; scope: string; expiry: string; note: string }) => void;
}) {
  const [reason, setReason] = useState('approved-exception');
  const [expiry, setExpiry] = useState('30d');
  const [scope, setScope] = useState('per-instance');
  const [note, setNote] = useState('SEC-842: user in SSO-migration cohort');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Waive finding"
      subtitle={findingTitle}
      width="lg"
      footer={
        <>
          <button onClick={onClose} className="px-3 py-1.5 text-[12px] rounded-md border border-unbound-border hover:bg-white">
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ reason, approver: 'vis@unboundsecurity.ai', scope, expiry, note })}
            className="px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover"
          >
            Waive with audit trail
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Reason">
          <div className="space-y-1.5">
            {[
              ['approved-exception', 'Approved exception (documented elsewhere)'],
              ['compensating-control', 'Compensating control in place'],
              ['byod-contractor', 'BYOD / contractor device'],
              ['test-device', 'Test / non-prod device'],
              ['other', 'Other (explain in note)'],
            ].map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={val}
                  checked={reason === val}
                  onChange={(e) => setReason(e.target.value)}
                  className="accent-unbound-purple"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </Field>

        <Field label="Scope">
          <div className="flex gap-2 flex-wrap">
            {[
              ['per-instance', 'Per-instance'],
              ['device-scoped', 'Device-scoped'],
              ['type-mute', 'Finding-type (org-wide)'],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setScope(val)}
                className={
                  'px-2.5 py-1 text-[12px] rounded-md border transition ' +
                  (scope === val
                    ? 'border-unbound-purple bg-unbound-purple/10 text-unbound-purple font-medium'
                    : 'border-unbound-border text-unbound-text-tertiary hover:bg-unbound-bg-hover')
                }
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Expiry">
          <div className="flex gap-2 flex-wrap">
            {[
              ['7d', '7 days'],
              ['30d', '30 days'],
              ['90d', '90 days'],
              ['custom', 'Custom…'],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setExpiry(val)}
                className={
                  'px-2.5 py-1 text-[12px] rounded-md border transition ' +
                  (expiry === val
                    ? 'border-unbound-purple bg-unbound-purple/10 text-unbound-purple font-medium'
                    : 'border-unbound-border text-unbound-text-tertiary hover:bg-unbound-bg-hover')
                }
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-1.5 text-[11.5px] text-unbound-text-tertiary">
            On expiry the finding auto-reopens at original severity. Re-justification required before extending.
          </div>
        </Field>

        <Field label="Note / linked ticket">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-[13px] border border-unbound-border rounded-md bg-white focus:outline-none focus:border-unbound-purple"
          />
        </Field>

        <Field label="Approver">
          <div className="flex items-center gap-2 text-[12px] text-unbound-text-secondary">
            <span className="px-2 py-1 rounded-md bg-unbound-bg border border-unbound-border mono">
              vis@unboundsecurity.ai
            </span>
            <span className="text-unbound-text-muted">current user · CISO role</span>
          </div>
        </Field>

        <div className="rounded-md bg-sev-medium-bg border border-sev-medium/30 p-3 text-[12px] text-unbound-text-secondary">
          <div className="font-semibold mb-0.5">Compliance impact</div>
          Waiving this finding removes it from SOC 2 CC7.1 and NIST PR.PS-01 open lists until expiry. All state changes are recorded in the audit ledger and included in signed evidence packets.
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted font-medium mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}
