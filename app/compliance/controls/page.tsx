import { PageHeader, Card, CardHeader } from '@/components/Card';
import { SevBadge } from '@/components/SevBadge';
import { controls } from '@/lib/mock-data';
import Link from 'next/link';
import { FileDown, ChevronRight } from 'lucide-react';

export default function ControlsPage() {
  return (
    <>
      <PageHeader
        title="Compliance controls"
        subtitle="NIST CSF 2.0 · 78% coverage — per-control drill with finding back-links"
        right={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-unbound-border bg-white overflow-hidden text-[12px]">
              <button className="px-3 py-1.5 bg-unbound-purple/10 text-unbound-purple font-medium">NIST CSF 2.0</button>
              <button className="px-3 py-1.5 text-unbound-text-tertiary">SOC 2</button>
              <button className="px-3 py-1.5 text-unbound-text-tertiary">ISO 27001</button>
              <button className="px-3 py-1.5 text-unbound-text-tertiary">FedRAMP</button>
            </div>
            <Link href="/reports" className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
              <FileDown className="w-3.5 h-3.5" /> Evidence packet
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader title="Controls" subtitle="Click any control → open findings mapped to it" />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Control</th>
              <th className="px-3 py-2.5 font-medium">Name</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium">Open findings</th>
              <th className="px-3 py-2.5 font-medium">90d trend</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {controls.map((c) => {
              const sev = c.status.includes('Critical') ? 'critical' : c.status.includes('High') ? 'high' : 'low';
              return (
                <tr key={c.id} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover cursor-pointer">
                  <td className="px-5 py-3 mono text-[12.5px] text-unbound-text-primary font-medium">{c.id}</td>
                  <td className="px-3 py-3">{c.name}</td>
                  <td className="px-3 py-3"><SevBadge severity={sev as any}>{c.status}</SevBadge></td>
                  <td className="px-3 py-3 mono text-[12px] text-unbound-text-tertiary">{(c as any).findings || '—'}</td>
                  <td className="px-3 py-3 mono">{c.trend}</td>
                  <td className="px-3 py-3 text-right">
                    <ChevronRight className="w-4 h-4 text-unbound-text-muted inline" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
