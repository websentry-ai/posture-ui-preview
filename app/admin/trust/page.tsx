'use client';

import { useState } from 'react';
import { PageHeader, Card, CardHeader } from '@/components/Card';
import { FileText, ShieldCheck, Lock, Cpu, Download } from 'lucide-react';
import { Toast } from '@/components/Modal';
import { Help } from '@/components/Help';
import { resolvePath } from '@/components/AppLink';

const artifacts: Array<{ name: React.ReactNode; date: string; auditor: string; file: string; sha: string }> = [
  { name: 'SOC 2 Type II report', date: 'period 2025-09 → 2026-03', auditor: 'Coalfire', file: 'soc2-type-ii-2026h1.pdf', sha: 'sha256:a2…91c' },
  { name: 'Pen-test letter', date: '2026-02-14', auditor: 'Bishop Fox', file: 'pentest-2026q1.pdf', sha: 'sha256:5f…b2d' },
  { name: <Help term="CAIQ Lite (v5)" explain="Consensus Assessments Initiative Questionnaire — industry-standard vendor security questionnaire from the Cloud Security Alliance. Procurement often requires this." />, date: 'submitted 2026-03-31', auditor: 'Internal', file: 'caiq-lite-v5.pdf', sha: 'sha256:8e…43a' },
  { name: 'FedRAMP moderate roadmap', date: 'In Process target 2026-Q4', auditor: 'Internal · sponsor: DoE', file: 'fedramp-plan.pdf', sha: 'sha256:3b…77e' },
];

const architecture: Array<{ label: string; value: React.ReactNode }> = [
  { label: 'Tenancy', value: <>Logical isolation · per-tenant <Help term="KMS" explain="Key Management Service — AWS-managed cryptographic key store. Each tenant gets its own isolated keys." /> (AWS KMS) · VPC per tenant in EU region</> },
  { label: 'Data residency', value: <>us-east-1 (primary) · eu-west-1 (EU tenants) · ap-south-1 (India tenants)</> },
  { label: 'Encryption', value: <>At rest: AES-256 via tenant KMS · In transit: TLS 1.3 only · <Help term="FIPS 140-3 validated" explain="US federal cryptographic standard. Required for FedRAMP / DoD / financial-services procurement." /></> },
  { label: 'Classifier', value: <>On-device · no prompt/evidence egress · model hash published per release</> },
  { label: 'Retention', value: <>13 months default · configurable 6–36 months · <Help term="WORM" explain="Write-Once-Read-Many — evidence cannot be altered or deleted until retention expires. Audit-grade immutability." /> for signed evidence</> },
  { label: 'Access control', value: <>SSO via Okta · SCIM provisioning · 4 RBAC roles · break-glass logged to audit</> },
];

const modelCards = [
  { name: 'classifier-ensemble-v3', cutoff: '2026-03-01', fpClass: { hook: 8, mcp: 4, other: 2 }, adversarial: 'passed (n=3,420)' },
  { name: 'unbound-supplychain-2026.04', cutoff: '2026-04-01', fpClass: { mcpPublisher: 9 }, adversarial: 'in progress' },
  { name: 'unbound-hook-2026.04', cutoff: '2026-04-01', fpClass: { rce: 10 }, adversarial: 'passed (n=1,890)' },
];

const subprocessors: Array<{ name: string; purpose: string; regions: string; dpa: React.ReactNode }> = [
  { name: 'Amazon Web Services', purpose: 'Hosting · KMS · S3', regions: 'us-east-1 · eu-west-1 · ap-south-1', dpa: 'AWS GDPR DPA v3.2' },
  { name: 'Anthropic', purpose: 'Opt-in enrichment · not required for core posture', regions: 'us-east-1', dpa: <Help term="ZDR addendum" explain="Zero Data Retention — Anthropic contractually discards our prompts after inference. Nothing used for training." /> },
  { name: 'Stripe', purpose: 'Billing', regions: 'us · eu', dpa: 'Stripe DPA' },
  { name: 'Vanta', purpose: 'Compliance evidence aggregator', regions: 'us-east-1', dpa: 'Vanta DPA v2' },
  { name: 'Cloudflare', purpose: 'CDN · WAF · DDoS protection', regions: 'global', dpa: 'Cloudflare DPA' },
  { name: 'Sentry', purpose: 'Error aggregation · no prompt content', regions: 'us-east-1', dpa: 'Sentry DPA' },
];

export default function TrustPage() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2800); };

  return (
    <>
      <PageHeader
        title="Trust center"
        meta="Procurement-grade artifacts · signed · versioned · downloadable"
      />

      {/* Attestations */}
      <Card className="mb-5">
        <CardHeader title="Attestations & contracts" meta="SOC 2 · Pen test · CAIQ · FedRAMP" />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Artifact</th>
              <th className="px-3 py-2.5 font-medium">Date</th>
              <th className="px-3 py-2.5 font-medium">Source</th>
              <th className="px-3 py-2.5 font-medium">File</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {artifacts.map((a) => (
              <tr key={a.file} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3 font-medium flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-unbound-purple" />
                  {a.name}
                </td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{a.date}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{a.auditor}</td>
                <td className="px-3 py-3 mono text-[11.5px]">
                  <div>{a.file}</div>
                  <div className="text-unbound-text-muted">{a.sha}</div>
                </td>
                <td className="px-3 py-3 text-right">
                  <a
                    href={resolvePath(`/trust/${a.file}`)}
                    download={a.file}
                    onClick={() => showToast(`Downloading ${a.file} · ${a.sha} · DRAFT stub · real signed copy on PO signing`)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded border border-unbound-border hover:bg-unbound-bg-hover"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* DPA inline */}
      <Card className="mb-5">
        <CardHeader title="Data Processing Addendum (DPA)" meta="v3.2 · updated 2026-03-20 · inline for copy-paste" />
        <div className="p-5 text-[12.5px] text-unbound-text-secondary leading-relaxed space-y-2 max-h-[220px] overflow-y-auto drawer-scroll">
          <p><strong>1. Processing scope.</strong> Unbound Security acts as Processor under GDPR Art. 28 for Customer Data including: device configuration state, finding metadata, scan manifests, waiver records, and user identifiers synced via SCIM. Prompt bodies are <em>not</em> processed by Unbound; classification is on-device.</p>
          <p><strong>2. Sub-processors.</strong> See the list below. Customer is notified 30 days before any sub-processor addition. Objection right per Art. 28(2).</p>
          <p><strong>3. International transfers.</strong> <Help term="SCCs Module 2" explain="EU-approved Standard Contractual Clauses, Module 2 — the data-transfer mechanism for controller-to-processor relationships under GDPR." /> where applicable. EU tenants may opt into eu-west-1 residency; data egress from region is prohibited by policy + technical controls (VPC egress rules).</p>
          <p><strong>4. Security measures.</strong> ISO 27001:2022 Annex A controls applied. Encryption at rest (AES-256, per-tenant KMS) and in transit (TLS 1.3, FIPS 140-3 validated). SOC 2 Type II report available above.</p>
          <p><strong>5. Retention & deletion.</strong> 13-month default; configurable 6–36 months. Hard-delete within 30 days of contract termination; certificate of destruction provided on request.</p>
          <p><strong>6. Breach notification.</strong> Customer notified within 72 hours of confirmed personal-data breach, per GDPR Art. 33.</p>
        </div>
        <div className="px-5 pb-4 flex gap-2">
          <button onClick={() => { navigator.clipboard?.writeText('Unbound DPA v3.2 — see /admin/trust for full text'); showToast('DPA text copied to clipboard'); }} className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
            Copy inline text
          </button>
          <button onClick={() => showToast('Signed DPA emailed to your procurement contact')} className="text-[11px] px-2 py-1 rounded border border-unbound-border hover:bg-unbound-bg-hover">
            Request signed copy
          </button>
        </div>
      </Card>

      {/* Sub-processors inline */}
      <Card className="mb-5">
        <CardHeader title="Sub-processors" meta="inline · updated 2026-04-10 · 30-day notice on changes" />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Processor</th>
              <th className="px-3 py-2.5 font-medium">Purpose</th>
              <th className="px-3 py-2.5 font-medium">Regions</th>
              <th className="px-3 py-2.5 font-medium">DPA</th>
            </tr>
          </thead>
          <tbody>
            {subprocessors.map((s) => (
              <tr key={s.name} className="border-b border-unbound-border last:border-0">
                <td className="px-5 py-2.5 font-medium">{s.name}</td>
                <td className="px-3 py-2.5 text-unbound-text-secondary">{s.purpose}</td>
                <td className="px-3 py-2.5 mono text-[11.5px] text-unbound-text-tertiary">{s.regions}</td>
                <td className="px-3 py-2.5 text-unbound-text-tertiary">{s.dpa}</td>
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
              <th className="px-3 py-2.5 font-medium">FP rate (%)</th>
              <th className="px-3 py-2.5 font-medium">
                <Help term="Adversarial eval" explain="Red-team stress test — thousands of hand-crafted malicious samples the classifier must catch. n = sample size." />
              </th>
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
                    <div key={k}>{k}: ~{v}%</div>
                  ))}
                </td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{m.adversarial}</td>
                <td className="px-3 py-3 text-right">
                  <a
                    href={resolvePath(`/trust/model-card-${m.name}.pdf`)}
                    download={`model-card-${m.name}.pdf`}
                    onClick={() => showToast(`Model card for ${m.name} · methodology link included · DRAFT stub`)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded border border-unbound-border hover:bg-unbound-bg-hover"
                  >
                    <Download className="w-3 h-3" /> Model card
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Change log */}
      <Card>
        <CardHeader title="Trust changelog" meta="append-only · hash-chained" right={<ShieldCheck className="w-4 h-4 text-unbound-purple" />} />
        <ol className="p-5 space-y-2 text-[12.5px]">
          {[
            { t: '2026-04-14', e: 'SOC 2 Type II period extended → 2026-09', sha: 'sha256:1a…e4b' },
            { t: '2026-04-10', e: 'Sub-processor added: AWS eu-west-1 (EU residency launch)', sha: 'sha256:7c…29f' },
            { t: '2026-02-14', e: 'Bishop Fox pen-test letter issued · 0 criticals', sha: 'sha256:5f…b2d' },
          ].map((x, i) => (
            <li key={i} className="flex gap-3 items-center">
              <span className="mono text-[11px] text-unbound-text-muted w-24 shrink-0">{x.t}</span>
              <span className="text-unbound-text-secondary flex-1">{x.e}</span>
              <span className="mono text-[10px] text-unbound-text-muted">{x.sha}</span>
            </li>
          ))}
        </ol>
      </Card>

      {toast && <Toast message={toast} kind="success" />}
    </>
  );
}
