'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { Copy } from 'lucide-react';

export default function ForwardModal({
  open,
  onClose,
  user,
  body,
}: {
  open: boolean;
  onClose: () => void;
  user: string;
  body: string;
}) {
  const [channel, setChannel] = useState<'slack' | 'email' | 'jira' | 'teams'>('slack');
  const [deadline, setDeadline] = useState('3d');

  const preview = () => {
    if (channel === 'slack') {
      return `@${user.replace(' ', '.')} — Unbound Posture flagged the following on your device. Please address within ${deadline}.\n\n${body}\n\n(Reply "fixed" or use the inline buttons in the Unbound Slack app to confirm.)`;
    }
    if (channel === 'teams') {
      return `@${user.replace(' ', '.')} — Unbound Posture flagged the following. Please address within ${deadline}.\n\n${body}`;
    }
    if (channel === 'email') {
      return `Subject: [Unbound Posture] Action required on your device — ${deadline} deadline\n\nHi,\n\n${body}\n\nThanks,\nSecurity Team`;
    }
    return `Ticket summary: AI agent posture — user action required\n\nDescription:\n${body}\n\nAssignee: ${user}\nSLA: ${deadline}`;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Forward user-step fix"
      subtitle={`Recipient: ${user}`}
      width="lg"
      footer={
        <>
          <button onClick={onClose} className="px-3 py-1.5 text-[12px] rounded-md border border-unbound-border hover:bg-white">
            Cancel
          </button>
          <button
            onClick={() => navigator.clipboard?.writeText(preview())}
            className="px-3 py-1.5 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover inline-flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
          <button onClick={onClose} className="px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
            Send
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted font-medium mb-1.5">
            Channel
          </div>
          <div className="flex gap-2">
            {[
              ['slack', 'Slack DM'],
              ['teams', 'Teams DM'],
              ['email', 'Email'],
              ['jira', 'Jira ticket'],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setChannel(v as any)}
                className={
                  'px-2.5 py-1 text-[12px] rounded-md border transition ' +
                  (channel === v
                    ? 'border-unbound-purple bg-unbound-purple/10 text-unbound-purple font-medium'
                    : 'border-unbound-border text-unbound-text-tertiary hover:bg-unbound-bg-hover')
                }
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted font-medium mb-1.5">
            Deadline
          </div>
          <div className="flex gap-2">
            {['24h', '3d', '7d', '14d'].map((d) => (
              <button
                key={d}
                onClick={() => setDeadline(d)}
                className={
                  'px-2.5 py-1 text-[12px] rounded-md border transition ' +
                  (deadline === d
                    ? 'border-unbound-purple bg-unbound-purple/10 text-unbound-purple font-medium'
                    : 'border-unbound-border text-unbound-text-tertiary hover:bg-unbound-bg-hover')
                }
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted font-medium mb-1.5">
            Preview — this is what {user} will receive
          </div>
          <pre className="mono text-[12px] whitespace-pre-wrap bg-unbound-bg border border-unbound-border rounded-md p-3 text-unbound-text-secondary">
            {preview()}
          </pre>
        </div>

        <div className="text-[11.5px] text-unbound-text-tertiary">
          After sending, a scheduled re-check fires at the deadline. If the finding is still present, it reopens with a "claimed fixed, still present" history note.
        </div>
      </div>
    </Modal>
  );
}
