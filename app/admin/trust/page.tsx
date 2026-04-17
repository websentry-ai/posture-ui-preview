import { PageHeader, Card, CardHeader } from '@/components/Card';
import { FileText, ShieldCheck, Lock, Users, Cpu, Download } from 'lucide-react';

const artifacts = [
  { name: 'SOC 2 Type II report', date: 'period 2025-09 → 2026-03', auditor: 'Coalfire', file: 'soc2-type-ii-2026h1.pdf', kind: 'pdf' as const },
  { name: 'Pen-test letter', date: '2026-02-14', auditor: 'Bishop Fox', file: 'pentest-2026q1.pdf', kind: 'pdf' as const },
  { name: 'DPA template', date: 'v3.2 · 2026-03-20', auditor: 'Legal', file: 'dpa-template.pdf', kind: 'pdf' as const },
  { name: 'Sub-processor list', date: 'updated 2026-04-10', auditor: 'Internal', file: 'subprocessors.md', kind: 'md' as const },
  { name: 'CAIQ Lite (v5)', date: 'submitted 2026-03-31', auditor: 'Internal', file: 'caiq-lite-v5.xlsx', kind: 'xlsx' as const },
  { name: 'FedRAMP moderate roadmap', date: 'In Process target 2026-Q4', auditor: 'Internal', file: 'fedramp-plan.pdf', kind: 'pdf' as const },
];

const architecture = [
  { label: 'Tenancy', value: 'Logical isolation · per-tenant KMS (AWS KMS) · VPC per tenant in EU region' },
  { label: 'Data residency', value: 'us-east-1 (primary) · eu-west-1 (EU tenants) · ap-south-1 (India tenants)' },
  { label: 'Encryption', value: 'At rest: AES-256 via tenant KMS · In transit: TLS 1.3 only · FIPS 140-3 validated' },
  { label: 'Classifier', value: 'On-device · no prompt/evidence egress · model hash published per release' },
  { label: 'Retention', value: 'Default 13 months · configurable 6–36 months · WORM for signed evidence' },
  { label: 'Access control', value: 'SSO via Okta · SCIM provisioning · 4 RBAC roles · break-glass logged to audit' },
];

const modelCards = [
  { name: 'classifier-ensemble-v3', cutoff: '2026-03-01', fpClass: { hook: 0.078, mcp: 0.042, other: 0.023 }, adversarial: 'passed (see MCard)' },
  { name: 'unbound-supplychain-2026.04', cutoff: '2026-04-01', fpClass: { mcpPublisher: 0.091 }, adversarial: 'in progress' },
  { name: 'unbound-hook-2026.04', cutoff: '2026-04-01', fpClass: { rce: 0.097 }, adversarial: 'passed' },
];

export default function TrustPage() {
  return (
    <>
      <PageHeader
        title="Trust center"
        meta="Procurement-grade artifacts · signed · versioned · downloadable"
      />

      {/* Attestations */}
      <Card className="mb-5">
        <CardHeader title="Attestations & contracts" meta="SOC 2 · Pen test · DPA · CAIQ · FedRAMP" />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Artifact</th>
              <th className="px-3 py-2.5 font-medium">Date</th>
              <th className="px-3 py-2.5 font-medium">Auditor / source</th>
              <th className="px-3 py-2.5 font-medium">File</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {artifacts.map((a) => (
              <tr key={a.name} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3 font-medium flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-unbound-purple" />
                  {a.name}
                </td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{a.date}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{a.auditor}</td>
                <td className="px-3 py-3 mono text-[12px] text-unbound-text-tertiary">{a.file}</td>
                <td className="px-3 py-3 text-right">
                  <button className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded border border-unbound-border hover:bg-unbound-bg-hover">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Architecture */}
      <Card className="mb-5">
        <CardHeader title="Tenancy & data architecture" right={<Lock className="w-4 h-4 text-unbound-purple" />} />
        <div className="p-5 grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
          {architecture.map((a) => (
            <div key={a.label}>
              <div className="text-[10px] uppercase tracking-wide text-unbound-text-muted">{a.label}</div>
              <div className="text-unbound-text-secondary mt-0.5">{a.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Model cards */}
      <Card className="mb-5">
        <CardHeader title="Classifier lineage" meta="model cards · training cutoff · FP rate · adversarial eval" right={<Cpu className="w-4 h-4 text-unbound-purple" />} />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Model</th>
              <th className="px-3 py-2.5 font-medium">Training cutoff</th>
              <th className="px-3 py-2.5 font-medium">FP rate (class)</th>
              <th className="px-3 py-2.5 font-medium">Adversarial eval</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {modelCards.map((m) => (
              <tr key={m.name} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3 mono text-[12px] font-medium">{m.name}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{m.cutoff}</td>
                <td className="px-3 py-3 mono text-[11.5px] text-unbound-text-tertiary">
                  {Object.entries(m.fpClass).map(([k, v]) => (
                    <div key={k}>{k}: {(v * 100).toFixed(1)}%</div>
                  ))}
                </td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{m.adversarial}</td>
                <td className="px-3 py-3 text-right">
                  <button className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded border border-unbound-border hover:bg-unbound-bg-hover">
                    <Download className="w-3 h-3" /> Model card
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Change log */}
      <Card>
        <CardHeader title="Trust changelog" meta="append-only · signed" right={<ShieldCheck className="w-4 h-4 text-unbound-purple" />} />
        <ol className="p-5 space-y-2 text-[12.5px]">
          {[
            { t: '2026-04-14', e: 'SOC 2 Type II period extended → 2026-09' },
            { t: '2026-04-10', e: 'Sub-processor added: AWS eu-west-1 (EU residency launch)' },
            { t: '2026-03-31', e: 'CAIQ Lite v5 submitted · Azure co-sell listing' },
            { t: '2026-02-14', e: 'Bishop Fox pen-test letter issued · 0 criticals' },
            { t: '2026-02-01', e: 'FedRAMP In-Process roadmap accepted by sponsor agency' },
          ].map((x, i) => (
            <li key={i} className="flex gap-3">
              <span className="mono text-[11px] text-unbound-text-muted w-24 shrink-0">{x.t}</span>
              <span className="text-unbound-text-secondary">{x.e}</span>
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
