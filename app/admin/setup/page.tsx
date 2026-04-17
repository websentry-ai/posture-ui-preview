import { PageHeader, Card, CardHeader } from '@/components/Card';
import { Check, AlertCircle, Globe, Key, Shield, Users, Download, Rocket } from 'lucide-react';

export default function Page() {
  return (
    <>
      <PageHeader
        title="Setup"
        meta="4 of 6 steps complete"
        right={
          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
            <Download className="w-3.5 h-3.5" /> Download deployment guide
          </button>
        }
      />

      {/* Progress */}
      <Card className="mb-5">
        <CardHeader title="Onboarding progress" />
        <div className="p-5 space-y-3 text-[13px]">
          <Step done title="MDM connector" detail="Jamf Pro (prod) · Intune (prod) · Kandji (prod)" />
          <Step done title="Identity source" detail="Okta SCIM connected · 487 users syncing · BU/geo/manager attributes live" />
          <Step done title="Scanner rollout" detail="472 / 487 devices enrolled (96.9%) · 15 BYOD opt-in pending" />
          <Step done title="Data residency & privacy" detail="Region: us-east-1 · Retention: 13 months · EU-residency enabled for marcus.w (UK)" />
          <Step pending title="Works-council disclosure (EU)" detail="Template ready · pending legal review by mia.s · blocker for Dublin QA fleet" />
          <Step pending title="SIEM integration" detail="Splunk HEC connected · Sentinel pending credential rotation · Chronicle not configured" />
        </div>
      </Card>

      {/* Data handling */}
      <Card className="mb-5">
        <CardHeader title="Data handling" />
        <div className="p-5 grid grid-cols-2 gap-5 text-[13px]">
          <Row icon={<Globe className="w-4 h-4 text-unbound-purple" />} label="Region" value="us-east-1 (primary) · eu-west-1 (EU tenants)" />
          <Row icon={<Key className="w-4 h-4 text-unbound-purple" />} label="Encryption" value="BYOK (AWS KMS) · FIPS 140-3 validated" />
          <Row icon={<Shield className="w-4 h-4 text-unbound-purple" />} label="Classifier" value="Local (no data egress) · on-device agent" />
          <Row icon={<Users className="w-4 h-4 text-unbound-purple" />} label="RBAC" value="CISO · SOC lead · analyst · read-only auditor (via Okta groups)" />
          <Row icon={<Download className="w-4 h-4 text-unbound-purple" />} label="Retention" value="13 months default · configurable 6–36 months" />
          <Row icon={<Rocket className="w-4 h-4 text-unbound-purple" />} label="Shell-history scan" value="Disabled in EU · enabled US · user-level regex-filter-before-upload" />
        </div>
      </Card>

    </>
  );
}

function Step({ done, pending, title, detail }: { done?: boolean; pending?: boolean; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={
          'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ' +
          (done ? 'bg-sev-low text-white' : 'bg-unbound-bg border border-unbound-border text-unbound-text-muted')
        }
      >
        {done ? <Check className="w-3 h-3" /> : <span className="text-[10px]">…</span>}
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-[11.5px] text-unbound-text-tertiary mt-0.5">{detail}</div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-[10px] uppercase tracking-wide text-unbound-text-muted">{label}</div>
        <div className="text-unbound-text-secondary mt-0.5">{value}</div>
      </div>
    </div>
  );
}
