'use client';

import { useState } from 'react';
import { PageHeader, Card, CardHeader } from '@/components/Card';
import { SevBadge } from '@/components/SevBadge';
import { controls } from '@/lib/mock-data';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileDown, ChevronRight } from 'lucide-react';

type Framework = keyof typeof controls;
const frameworks: Framework[] = ['NIST CSF 2.0', 'SOC 2', 'ISO 27001'];

export default function ControlsPage() {
  const [fw, setFw] = useState<Framework>('NIST CSF 2.0');
  const list = controls[fw];
  const router = useRouter();

  return (
    <>
      <PageHeader
        title="Compliance"
        meta={fw}
        right={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-unbound-border bg-white overflow-hidden text-[12px]">
              {frameworks.map((f) => (
                <button
                  key={f}
                  onClick={() => setFw(f)}
                  className={
                    'px-3 py-1.5 ' +
                    (fw === f
                      ? 'bg-unbound-purple/10 text-unbound-purple font-medium'
                      : 'text-unbound-text-tertiary hover:bg-unbound-bg-hover')
                  }
                >
                  {f}
                </button>
              ))}
            </div>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover"
            >
              <FileDown className="w-3.5 h-3.5" /> Evidence packet
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader title="Controls" />
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
            {list.map((c) => {
              const sev = c.status.includes('Critical')
                ? 'critical'
                : c.status.includes('High') || c.status.toLowerCase().includes('finding')
                ? 'high'
                : 'low';
              const firstRule = c.findings?.match(/#(\d+)/)?.[1];
              return (
                <tr
                  key={c.id}
                  onClick={() => firstRule && router.push(`/issues?rule=${firstRule}`)}
                  className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover cursor-pointer"
                >
                  <td className="px-5 py-3 mono text-[12.5px] text-unbound-text-primary font-medium">
                    {c.id}
                  </td>
                  <td className="px-3 py-3">{c.name}</td>
                  <td className="px-3 py-3">
                    <SevBadge severity={sev as any}>{c.status}</SevBadge>
                  </td>
                  <td className="px-3 py-3 mono text-[12px] text-unbound-text-tertiary">
                    {c.findings || '—'}
                  </td>
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
