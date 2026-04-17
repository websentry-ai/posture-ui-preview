import Link from '@/components/AppLink';
import { PageHeader, Card, CardHeader } from '@/components/Card';
import { SevBadge, Chip } from '@/components/SevBadge';
import { devices } from '@/lib/mock-data';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function BYODPage() {
  const byodDevices = devices.filter((d) => d.mdm === 'BYOD' || d.mdm === 'None (BYOD)');

  return (
    <>
      <PageHeader
        title="BYOD posture"
        meta={`${byodDevices.length} enrolled · 15 opt-in pending · 100% of BYOD has Critical finding`}
      />

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted">BYOD enrolled</div>
          <div className="text-[24px] font-semibold mt-1">{byodDevices.length}</div>
          <div className="text-[11px] text-unbound-text-tertiary mt-1">scanner installed + user opted-in</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted">Opt-in pending</div>
          <div className="text-[24px] font-semibold mt-1 text-sev-high">15</div>
          <div className="text-[11px] text-unbound-text-tertiary mt-1">known BYOD · awaiting user consent</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-wide text-unbound-text-muted">BYOD-specific SLA</div>
          <div className="text-[24px] font-semibold mt-1">48h</div>
          <div className="text-[11px] text-unbound-text-tertiary mt-1">Critical on BYOD · stricter than managed</div>
        </Card>
      </div>

      <Card className="mb-5 border-sev-critical/30">
        <div className="p-4 flex items-start gap-3 bg-sev-critical-bg/40">
          <ShieldAlert className="w-5 h-5 text-sev-critical shrink-0 mt-0.5" />
          <div className="text-[12.5px] text-unbound-text-secondary">
            <span className="font-semibold text-unbound-text-primary">BYOD is 3.1% of fleet, 100% of breach risk surface.</span> Every BYOD device requires explicit user opt-in before scanning; scope is posture-only, never file contents, never command history. Works-council disclosure required in EU — Dublin QA fleet pending legal review.
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="BYOD devices" meta="same schema as managed · stricter SLA" />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Device</th>
              <th className="px-3 py-2.5 font-medium">User</th>
              <th className="px-3 py-2.5 font-medium">Geo</th>
              <th className="px-3 py-2.5 font-medium">Risk</th>
              <th className="px-3 py-2.5 font-medium">Agents</th>
              <th className="px-3 py-2.5 font-medium">Posture</th>
            </tr>
          </thead>
          <tbody>
            {byodDevices.map((d) => (
              <tr key={d.id} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3 mono text-[12px]">
                  <Link href={`/fleet/devices/${d.id}`} className="text-unbound-purple hover:underline">
                    {d.id}
                  </Link>
                </td>
                <td className="px-3 py-3 font-medium">{d.user}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{d.location}</td>
                <td className="px-3 py-3"><SevBadge severity={d.severity}>{d.risk}</SevBadge></td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{d.agents}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {d.chips.map((c) => (<Chip key={c}>{c}</Chip>))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 text-[11px] text-unbound-text-tertiary flex items-center gap-1.5">
        <AlertTriangle className="w-3 h-3" />
        BYOD findings waived by default unless the device touches corp repos or corp cloud creds
      </div>
    </>
  );
}
