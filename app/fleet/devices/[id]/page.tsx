import Link from 'next/link';
import { notFound } from 'next/navigation';
import { devices, findings } from '@/lib/mock-data';
import { Card, CardHeader } from '@/components/Card';
import { SevBadge, Chip } from '@/components/SevBadge';
import { ArrowLeft, Check, X, ChevronRight, Shield, Lock, Globe, Zap, AlertTriangle } from 'lucide-react';

export async function generateStaticParams() {
  return devices.map((d) => ({ id: d.id }));
}

export default function DeviceDetail({ params }: { params: { id: string } }) {
  const device = devices.find((d) => d.id === params.id);
  if (!device) return notFound();

  const deviceFindings = findings.filter((f) => f.device === device.id);

  return (
    <>
      {/* header */}
      <div className="mb-5">
        <Link href="/fleet/devices" className="inline-flex items-center gap-1 text-[12px] text-unbound-text-tertiary hover:text-unbound-purple mb-3">
          <ArrowLeft className="w-3.5 h-3.5" />
          Devices
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[20px] font-semibold text-unbound-text-primary">{device.user}</h1>
              <SevBadge severity={device.severity}>{device.risk}</SevBadge>
            </div>
            <div className="text-[13px] text-unbound-text-tertiary mt-1 mono">
              {device.id} · MacBook Pro M3 · macOS 15.2 · MDM: {device.mdm} · Scanner: {device.lastSync} ago
            </div>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
              Send to XSOAR
            </button>
            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-sev-critical text-white hover:bg-sev-critical/90">
              <AlertTriangle className="w-3.5 h-3.5" /> Freeze device
            </button>
          </div>
        </div>
      </div>

      {/* Blast radius */}
      <Card className="mb-5">
        <CardHeader
          title="Blast radius"
          subtitle="Factors that drive escalator math across findings on this device"
          right={<Zap className="w-4 h-4 text-unbound-purple" />}
        />
        <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
          {[
            { on: true, label: 'Cloud creds on disk', detail: '~/.aws/credentials, ~/.config/gcloud' },
            { on: true, label: 'Admin / sudo rights', detail: 'current user in admin group' },
            { on: true, label: 'Prod git write access', detail: '17 repos on github.com/corp' },
            { on: true, label: 'FileVault on', detail: 'disk encryption enforced' },
            { on: true, label: 'SIP on', detail: 'macOS System Integrity Protection enforced' },
            { on: true, label: 'Code-signing enforced', detail: 'spctl gatekeeper enabled' },
            { on: false, label: 'Sandbox read-only', detail: 'currently writable — escalator for #2, #3' },
          ].map((f) => (
            <div key={f.label} className="flex items-start gap-2">
              {f.on ? (
                <Check className="w-4 h-4 text-sev-low shrink-0 mt-0.5" />
              ) : (
                <X className="w-4 h-4 text-sev-critical shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-unbound-text-primary font-medium">{f.label}</div>
                <div className="text-[12px] text-unbound-text-tertiary">{f.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-unbound-border mb-4 text-[13px]">
        <button className="py-2 border-b-2 border-unbound-purple font-semibold text-unbound-text-primary">
          Issues <span className="text-unbound-text-muted font-normal">{deviceFindings.length}</span>
        </button>
        <button className="py-2 text-unbound-text-tertiary hover:text-unbound-text-primary">
          Inventory
        </button>
        <button className="py-2 text-unbound-text-tertiary hover:text-unbound-text-primary">
          Configuration
        </button>
        <button className="py-2 text-unbound-text-tertiary hover:text-unbound-text-primary">
          Timeline
        </button>
      </div>

      {/* Issues list for this device */}
      <div className="bg-white rounded-xl border border-unbound-border overflow-hidden mb-5">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">#</th>
              <th className="px-3 py-2.5 font-medium">Finding</th>
              <th className="px-3 py-2.5 font-medium">Agent</th>
              <th className="px-3 py-2.5 font-medium">First seen</th>
              <th className="px-3 py-2.5 font-medium">Escalators</th>
              <th className="px-3 py-2.5 font-medium">SLA</th>
            </tr>
          </thead>
          <tbody>
            {deviceFindings.map((f) => (
              <tr key={f.id} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3 mono text-[12px] text-unbound-text-muted">#{f.ruleId}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <SevBadge severity={f.severity} />
                    <Link href="/issues" className="text-unbound-text-primary font-medium hover:text-unbound-purple">
                      {f.title}
                    </Link>
                  </div>
                </td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{f.agent}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{f.firstSeen}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {f.escalators.map((e) => (<Chip key={e}>+{e}</Chip>))}
                  </div>
                </td>
                <td className="px-3 py-3 text-unbound-text-secondary">{f.slaLabel}</td>
              </tr>
            ))}
            {deviceFindings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-unbound-text-muted">
                  No issues on this device.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PIVOT block */}
      <Card>
        <CardHeader
          title="Pivot"
          subtitle="2am incident pivot — blast-radius check across the fleet"
        />
        <div className="p-5 grid grid-cols-2 gap-3 text-[13px]">
          <Link href="/issues" className="flex items-center justify-between p-3 rounded-md border border-unbound-border hover:bg-unbound-bg-hover">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-unbound-purple" />
              <span>Same MCP elsewhere?</span>
            </div>
            <div className="flex items-center gap-1 text-unbound-text-tertiary">
              <span className="font-semibold text-unbound-text-primary">27 devices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
          <Link href="/issues" className="flex items-center justify-between p-3 rounded-md border border-unbound-border hover:bg-unbound-bg-hover">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-unbound-purple" />
              <span>Same hook pattern?</span>
            </div>
            <div className="flex items-center gap-1 text-unbound-text-tertiary">
              <span className="font-semibold text-unbound-text-primary">3 devices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
          <button className="flex items-center justify-between p-3 rounded-md border border-unbound-border hover:bg-unbound-bg-hover text-left">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Isolate via Okta</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-unbound-text-muted" />
          </button>
          <button className="flex items-center justify-between p-3 rounded-md border border-unbound-border hover:bg-unbound-bg-hover text-left">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Revoke GitHub tokens</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-unbound-text-muted" />
          </button>
        </div>
      </Card>
    </>
  );
}
