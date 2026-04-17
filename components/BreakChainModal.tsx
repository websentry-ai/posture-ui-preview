'use client';

import { Modal } from './Modal';
import { Zap, Download, Users } from 'lucide-react';

export default function BreakChainModal({
  open,
  onClose,
  onConfirm,
  chain,
  devices,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm?: (info: { profileCount: number; deviceCount: number }) => void;
  chain: string;
  devices: string[];
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Break attack chain"
      subtitle={chain}
      width="lg"
      footer={
        <>
          <button onClick={onClose} className="px-3 py-1.5 text-[12px] rounded-md border border-unbound-border hover:bg-white">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm?.({ profileCount: 2, deviceCount: devices.length });
              onClose();
            }}
            className="px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover inline-flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5" /> Push 2 policies to {devices.length} devices
          </button>
        </>
      }
    >
      <div className="rounded-md bg-unbound-bg border border-unbound-border p-3 mb-4 mono text-[12.5px] leading-relaxed">
        {chain}
      </div>

      <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted font-medium mb-2">
        Recommended edge to sever
      </div>
      <div className="rounded-md border border-unbound-border p-3 mb-4">
        <div className="text-[13px] font-semibold text-unbound-text-primary mb-1">
          Disable YOLO across all {devices.length} devices
        </div>
        <div className="text-[12px] text-unbound-text-tertiary">
          Highest severity drop per-policy-push. Reduces chain risk from Critical → Medium by removing the unsupervised-execution step.
        </div>
      </div>

      <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted font-medium mb-2">
        Policies to deploy
      </div>
      <div className="space-y-2 mb-4">
        <PolicyRow name="claude-perm-ceiling.mobileconfig" scope={`${devices.length} devices · Engineering Laptops`} via="Jamf" />
        <PolicyRow name="claude-sandbox-enforce.mobileconfig" scope={`${devices.length} devices · Engineering Laptops`} via="Jamf" />
      </div>

      <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted font-medium mb-2">
        Affected users
      </div>
      <div className="rounded-md bg-unbound-bg border border-unbound-border p-3 flex items-center gap-2 text-[12px]">
        <Users className="w-4 h-4 text-unbound-text-muted" />
        {devices.join(' · ')}
      </div>

      <div className="mt-4 text-[11.5px] text-unbound-text-tertiary">
        Policies are signed by Unbound. Deploy status is tracked per-device; failures auto-retry. Expect scan-verified closure of 4 findings across these devices within the next scan cycle.
      </div>
    </Modal>
  );
}

function PolicyRow({ name, scope, via }: { name: string; scope: string; via: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-md border border-unbound-border bg-white">
      <div>
        <div className="mono text-[12.5px] font-medium">{name}</div>
        <div className="text-[11.5px] text-unbound-text-tertiary mt-0.5">{scope}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] px-2 py-0.5 rounded bg-unbound-bg border border-unbound-border">{via}</span>
        <button className="p-1 hover:bg-unbound-bg-hover rounded">
          <Download className="w-3.5 h-3.5 text-unbound-text-muted" />
        </button>
      </div>
    </div>
  );
}
