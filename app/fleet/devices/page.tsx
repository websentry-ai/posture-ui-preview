'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/Card';
import { SevBadge, Chip } from '@/components/SevBadge';
import { devices } from '@/lib/mock-data';
import { Search, Filter, Snowflake } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function DevicesPage() {
  const [q, setQ] = useState('');
  const [frozenMap] = useStore((s) => s.frozenDevices);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return devices;
    return devices.filter(
      (d) =>
        d.id.toLowerCase().includes(needle) ||
        d.user.toLowerCase().includes(needle) ||
        d.bu.toLowerCase().includes(needle) ||
        d.agents.toLowerCase().includes(needle)
    );
  }, [q]);
  return (
    <>
      <PageHeader
        title="Devices"
        meta="487 total · 472 managed · 15 BYOD · 37 CI runners"
        right={
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-unbound-border rounded-md bg-white text-[12px]">
              <Search className="w-3.5 h-3.5 text-unbound-text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search device or user…"
                className="bg-transparent outline-none w-[220px]"
              />
            </div>
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
            {filtered.map((d) => {
              const frozenLevel = frozenMap[d.id];
              return (
                <tr key={d.id} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                  <td className="px-5 py-3 mono text-[12px]">
                    <Link href={`/fleet/devices/${d.id}`} className="text-unbound-purple hover:underline">
                      {d.id}
                    </Link>
                  </td>
                  <td className="px-3 py-3 font-medium">
                    {d.user}
                    {frozenLevel && (
                      <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-sev-critical-bg text-sev-critical border border-sev-critical/30">
                        <Snowflake className="w-2.5 h-2.5" /> frozen
                      </span>
                    )}
                  </td>
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
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-unbound-text-muted text-[12px]">
                  No devices match "{q}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
