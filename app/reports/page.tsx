'use client';

import { useState } from 'react';
import { PageHeader, Card, CardHeader } from '@/components/Card';
import { FileDown, FileText, Package, Users } from 'lucide-react';
import { Toast } from '@/components/Modal';
import { Help } from '@/components/Help';

export default function ReportsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [period, setPeriod] = useState('Q1 2026');
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };
  const slug = period.toLowerCase().replace(' ', '-');
  return (
    <>
      <PageHeader title="Reports" meta="Auditor-ready signed evidence" />

      {/* Executive report */}
      <Card className="mb-5">
        <CardHeader title="Quarterly signed posture report" />
        <div className="p-5 grid grid-cols-3 gap-4">
          <Format icon={FileText} label="Signed PDF" desc="With Unbound signing-key attestation" />
          <Format icon={Users} label="Editable PPTX" desc="5 pre-built slides (trend, BU heatmap, MTTR)" />
          <Format icon={Package} label="Underlying CSV" desc="Every number has provenance" />
        </div>
        <div className="px-5 pb-5 flex items-center gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-1.5 text-[12px] border border-unbound-border rounded-md bg-white">
            <option value="Q1 2026">Q1 2026 (Jan 1 → Mar 31)</option>
            <option value="Q4 2025">Q4 2025</option>
            <option value="Q3 2025">Q3 2025</option>
          </select>
          <button onClick={() => showToast(`Generating posture-${slug}.pdf + .pptx + .csv · signed by sha256:7d…a81c · 3s`)} className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
            <FileDown className="w-3.5 h-3.5" /> Generate report
          </button>
        </div>
      </Card>

      {/* Evidence packet */}
      <Card className="mb-5">
        <CardHeader title="Evidence packet" meta="Per-framework zip · immutable ledgers" />
        <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
          <Check label="Framework" value="SOC 2 Type II" />
          <Check label="Period" value="Q1 2026" />
          <Check label="Scope" value="Whole fleet" />
          <Check label="Output" value={<>PDF + ZIP + FedRAMP <Help term="POA&M" explain="Plan of Actions & Milestones — the FedRAMP-mandated remediation-tracker format (XLSX)." /> XLSX</>} />
        </div>
        <div className="px-5 pb-4 text-[12px] text-unbound-text-tertiary">
          Bundle contents:{' '}
          <span className="mono">
            control-coverage-report.pdf · finding-ledger.csv · waiver-ledger.csv · remediation-ledger.csv · policy-push-ledger.csv · scanner-integrity.json · auditor-readme.md
          </span>
        </div>
        <div className="px-5 pb-5">
          <button onClick={() => showToast(`evidence-pack-SOC2-${slug.toUpperCase()}-fleet.zip · 7 files · signed manifest · 3s`)} className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
            <FileDown className="w-3.5 h-3.5" /> Generate packet
          </button>
        </div>
      </Card>
      {toast && <Toast message={toast} kind="success" />}
    </>
  );
}

function Format({ icon: Icon, label, desc }: { icon: any; label: string; desc: string }) {
  return (
    <div className="p-4 rounded-md border border-unbound-border bg-white">
      <Icon className="w-5 h-5 text-unbound-purple mb-2" />
      <div className="text-[13px] font-semibold">{label}</div>
      <div className="text-[12px] text-unbound-text-tertiary mt-0.5">{desc}</div>
    </div>
  );
}

function Check({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-unbound-text-muted">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-md border border-unbound-border bg-white">
      <div className="text-[10px] uppercase tracking-wide text-unbound-text-muted">{label}</div>
      <div className="text-[22px] font-semibold text-unbound-text-primary mt-1">{value}</div>
    </div>
  );
}
