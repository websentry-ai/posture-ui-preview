import { PageHeader, Card, CardHeader } from '@/components/Card';
import { mdmProfiles } from '@/lib/mock-data';
import { Download, ShieldCheck } from 'lucide-react';

export default function PoliciesPage() {
  return (
    <>
      <PageHeader
        title="MDM policies"
        meta="13 signed templates · scoped rollout · rollback-on-regression"
        right={
          <div className="inline-flex rounded-md border border-unbound-border bg-white overflow-hidden text-[12px]">
            <button className="px-3 py-1.5 bg-unbound-purple/10 text-unbound-purple font-medium">Jamf</button>
            <button className="px-3 py-1.5 text-unbound-text-tertiary">Intune</button>
            <button className="px-3 py-1.5 text-unbound-text-tertiary">Kandji</button>
            <button className="px-3 py-1.5 text-unbound-text-tertiary">Workspace ONE</button>
          </div>
        }
      />

      <Card>
        <CardHeader
          title="Templates"
          meta="Signed · deploy-status tracked"
          right={<ShieldCheck className="w-4 h-4 text-unbound-purple" />}
        />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-unbound-text-muted border-b border-unbound-border bg-unbound-bg-hover">
              <th className="px-5 py-2.5 font-medium">Template</th>
              <th className="px-3 py-2.5 font-medium">Covers findings</th>
              <th className="px-3 py-2.5 font-medium">Deployed to</th>
              <th className="px-3 py-2.5 font-medium">Success</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {mdmProfiles.map((p) => (
              <tr key={p.name} className="border-b border-unbound-border last:border-0 hover:bg-unbound-bg-hover">
                <td className="px-5 py-3 mono text-[12.5px] text-unbound-text-primary font-medium">{p.name}</td>
                <td className="px-3 py-3 mono text-[12px] text-unbound-text-tertiary">{p.covers}</td>
                <td className="px-3 py-3 text-unbound-text-tertiary">{p.deployed}</td>
                <td className="px-3 py-3">
                  <span
                    className={
                      p.success === 'draft'
                        ? 'text-unbound-text-muted'
                        : p.success === '100%'
                        ? 'text-sev-low font-medium'
                        : 'text-unbound-text-primary'
                    }
                  >
                    {p.success}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <button className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] rounded-md bg-unbound-purple text-white hover:bg-unbound-purple-hover">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
