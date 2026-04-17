import { cn, sevColor, sevDot, type Severity } from '@/lib/utils';

export function SevBadge({ severity, children }: { severity: Severity; children?: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium uppercase tracking-wide',
        sevColor[severity]
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', sevDot[severity])} />
      {children ?? severity}
    </span>
  );
}

export function SevPill({ severity, label }: { severity: Severity; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[12px]',
        sevColor[severity]
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', sevDot[severity])} />
      {label}
    </span>
  );
}

const CHIP_GLOSSARY: Record<string, string> = {
  'YOLO': 'Permission prompts disabled — agent runs commands without asking.',
  'SBoff': 'Sandbox disabled — no OS-level fence around agent commands.',
  'pers.acct': 'Personal account signed in on a managed device (not corp SSO).',
  'drift:3': 'Config drifted from signed baseline 3 times.',
  'IMDS': 'Agent can reach cloud-metadata endpoint (169.254.169.254) — path to credential theft.',
  'CA!': 'Custom root certificate installed — can intercept TLS and MITM traffic.',
  'BYOD': 'Bring-Your-Own-Device — not corp-issued. Stricter scope.',
  'corp-repos': 'Device has write access to corporate code repositories.',
  'hook!': 'Malicious shell-executing hook detected on the device.',
  'MCP!': 'Unvetted MCP (AI tool plug-in) — may be a supply-chain risk.',
  'no-policy': 'No enterprise MDM policy deployed — user can flip any setting.',
};

export function Chip({ children, title }: { children: React.ReactNode; title?: string }) {
  const text = typeof children === 'string' ? children : '';
  const explain = title ?? CHIP_GLOSSARY[text];
  return (
    <span
      title={explain}
      className={
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-unbound-bg text-unbound-text-tertiary border border-unbound-border' +
        (explain ? ' cursor-help' : '')
      }
    >
      {children}
    </span>
  );
}
