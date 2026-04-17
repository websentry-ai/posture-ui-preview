import { PageHeader, Card, CardHeader } from '@/components/Card';
import { FileDown, FileText, Package, Users, Calendar } from 'lucide-react';

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports & evidence packets"
        subtitle="Signed PDFs for the board · auditor deliverables · ad-hoc exports"
      />

      {/* Executive report */}
      <Card className="mb-5">
        <CardHeader
          title="Quarterly signed posture report"
          subtitle="Board-ready. Signed PDF + editable PPTX + underlying CSV."
        />
        <div className="p-5 grid grid-cols-3 gap-4">
          <Format icon={FileText} label="Signed PDF" desc="With Unbound signing-key attestation" />
          <Format icon={Users} label="Editable PPTX" desc="5 pre-built slides (trend, BU heatmap, MTTR)" />
          <Format icon={Package} label="Underlying CSV" desc="Every number has provenance" />
        </div>
        <div className="px-5 pb-5 flex items-center gap-2">
          <select className="px-3 py-1.5 text-[12px] border border-unbound-border rounded-md bg-white">
            <option>Q1 2026 (Jan 1 → Mar 31)</option>
            <option>Q4 2025</option>
          </select>
          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
            <FileDown className="w-3.5 h-3.5" /> Generate report
          </button>
        </div>
      </Card>

      {/* Evidence packet */}
      <Card className="mb-5">
        <CardHeader
          title="Evidence packet — auditor deliverable"
          subtitle="Per-framework zip with immutable ledgers"
        />
        <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
          <Check label="Framework" value="SOC 2 Type II" />
          <Check label="Period" value="Q1 2026" />
          <Check label="Scope" value="Whole fleet" />
          <Check label="Output" value="PDF + ZIP + FedRAMP POA&M XLSX" />
        </div>
        <div className="px-5 pb-4 text-[12px] text-unbound-text-tertiary">
          Bundle contents:{' '}
          <span className="mono">
            control-coverage-report.pdf · finding-ledger.csv · waiver-ledger.csv · remediation-ledger.csv · policy-push-ledger.csv · scanner-integrity.json · auditor-readme.md
          </span>
        </div>
        <div className="px-5 pb-5">
          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
            <FileDown className="w-3.5 h-3.5" /> Generate packet
          </button>
        </div>
      </Card>

      {/* Weekly ops */}
      <Card>
        <CardHeader
          title="Weekly ops report"
          subtitle="Single page for team standup — what shipped, what's aging, MTTR by type"
        />
        <div className="p-5 grid grid-cols-4 gap-4 text-[13px]">
          <Stat label="Findings closed" value="47" />
          <Stat label="New this week" value="14" />
          <Stat label="MTTR Critical" value="2.1d" />
          <Stat label="MTTR High" value="4.2h" />
        </div>
        <div className="px-5 pb-5">
          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md border border-unbound-border bg-white hover:bg-unbound-bg-hover">
            <Calendar className="w-3.5 h-3.5" /> View full ops report
          </button>
        </div>
      </Card>
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

function Check({ label, value }: { label: string; value: string }) {
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
