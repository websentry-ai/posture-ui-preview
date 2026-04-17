import Link from 'next/link';
import { PageHeader } from '@/components/Card';
import { SevBadge, Chip } from '@/components/SevBadge';
import { devices } from '@/lib/mock-data';
import { Search, Filter } from 'lucide-react';

export default function DevicesPage() {
  return (
    <>
      <PageHeader
        title="Devices"
        subtitle="487 total · 472 managed · 15 BYOD · 37 CI runners"
        right={
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-unbound-border rounded-md bg-white text-[12px]">
              <Search className="w-3.5 h-3.5 text-unbound-text-muted" />
              <input
                placeholder="Search device or user…"
                className="bg-transparent outline-none w-[220px]"
              />
            </div>
            <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-xl border border-unbound-border overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Device</th>
              <th className="px-3 py-2.5 font-medium">User</th>
              <th className="px-3 py-2.5 font-medium">BU</th>
              <th className="px-3 py-2.5 font-medium">Risk</th>
              <th className="px-3 py-2.5 font-medium">Agents</th>
              <th className="px-3 py-2.5 font-medium">Last sync</th>
              <th className="px-3 py-2.5 font-medium">Drift</th>
              <th className="px-3 py-2.5 font-medium">MDM</th>
              <th className="px-3 py-2.5 font-medium">Posture</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d.id} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3 mono text-[12px]">
                  <Link href={`/fleet/devices/${d.id}`} className="text-unbound-purple hover:underline">
                    {d.id}
                  </Link>
                </td>
                <td className="px-3 py-3 font-medium">{d.user}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{d.bu}</td>
                <td className="px-3 py-3"><SevBadge severity={d.severity}>{d.risk}</SevBadge></td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{d.agents}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{d.lastSync}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary mono">{d.drift}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{d.mdm}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {d.chips.map((c) => (<Chip key={c}>{c}</Chip>))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
