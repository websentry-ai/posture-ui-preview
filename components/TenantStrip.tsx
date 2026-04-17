import { tenant } from '@/lib/mock-data';
import { Globe, Cpu, Key } from 'lucide-react';

export default function TenantStrip() {
  return (
    <div className="border-b border-unbound-border bg-white px-6 py-1.5 flex items-center gap-3 text-[11px] text-unbound-text-muted overflow-x-auto">
      <div className="flex items-center gap-1 whitespace-nowrap">
        <Globe className="w-3 h-3" />
        <span className="mono">{tenant.region}</span>
      </div>
      <span>·</span>
      <div className="flex items-center gap-1 whitespace-nowrap">
        <Cpu className="w-3 h-3" />
        {tenant.classifier}
      </div>
      <span>·</span>
      <div className="flex items-center gap-1 whitespace-nowrap">
        <Key className="w-3 h-3" />
        <span className="mono">{tenant.signingKey}</span>
      </div>
      <div className="flex-1" />
      <div className="whitespace-nowrap text-[10px] uppercase tracking-wider">
        Preview · mock data
      </div>
    </div>
  );
}
