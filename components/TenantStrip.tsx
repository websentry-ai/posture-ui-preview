import { tenant } from '@/lib/mock-data';
import { Globe, Clock, Cpu, Key, Shield } from 'lucide-react';

export default function TenantStrip() {
  return (
    <div className="border-b border-unbound-border bg-white px-6 py-2 flex items-center gap-4 text-[11px] text-unbound-text-tertiary overflow-x-auto">
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Shield className="w-3 h-3 text-unbound-purple" />
        <span className="font-medium text-unbound-text-secondary">{tenant.org}</span>
      </div>
      <span className="text-unbound-text-muted">·</span>
      <div className="flex items-center gap-1 whitespace-nowrap">
        <Globe className="w-3 h-3" /> Region: <span className="mono">{tenant.region}</span>
      </div>
      <div className="flex items-center gap-1 whitespace-nowrap">
        <Clock className="w-3 h-3" /> Retention: {tenant.retention}
      </div>
      <div className="flex items-center gap-1 whitespace-nowrap">
        <Cpu className="w-3 h-3" /> Classifier: {tenant.classifier}
      </div>
      <div className="flex items-center gap-1 whitespace-nowrap">
        <Key className="w-3 h-3" /> Signing: <span className="mono">{tenant.signingKey}</span>
      </div>
      <span className="text-unbound-text-muted">·</span>
      <div className="flex items-center gap-1 whitespace-nowrap">
        {tenant.rbac}
      </div>
      <div className="flex-1" />
      <div className="whitespace-nowrap text-[10px] uppercase tracking-wider text-unbound-text-muted">
        Preview build · mock data
      </div>
    </div>
  );
}
