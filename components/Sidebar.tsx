'use client';

import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  Laptop,
  Wrench,
  Map,
  Package,
  GitBranch,
  Clock,
  Shield,
  FileText,
  BookMarked,
  SlidersHorizontal,
  EyeOff,
  Server,
  Plug,
  Cog,
  ShieldCheck,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Item = { href: string; label: string; icon: any; soon?: boolean };
type Section = { title: string; items: Item[] };

const sections: Section[] = [
  {
    title: 'Security Posture',
    items: [
      { href: '/', label: 'Overview', icon: LayoutDashboard },
      { href: '/issues', label: 'Issues', icon: AlertTriangle },
      { href: '/drift', label: 'Drift & Baselines', icon: GitBranch },
      { href: '/timeline', label: 'Timeline', icon: Clock },
      { href: '/admin/suppressions', label: 'Suppressions', icon: EyeOff },
      { href: '/compliance/controls', label: 'Compliance', icon: Shield },
      { href: '/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { href: '/inventory/mcp', label: 'MCP · Hooks · Ext', icon: Package },
      { href: '/fleet/devices', label: 'Devices', icon: Laptop },
      { href: '/fleet/heatmap', label: 'BU heatmap', icon: Map },
      { href: '/fleet/byod', label: 'BYOD posture', icon: Users },
      { href: '/fleet/tools', label: 'AI Tools', icon: Wrench },
    ],
  },
  {
    title: 'Admin',
    items: [
      { href: '/admin/trust', label: 'Trust center', icon: BadgeCheck },
      { href: '/admin/catalogs/mcp', label: 'Catalogs', icon: BookMarked },
      { href: '/admin/rules', label: 'Detection Rules', icon: SlidersHorizontal },
      { href: '/admin/policies', label: 'Policies (MDM)', icon: ShieldCheck },
      { href: '/admin/integrations', label: 'Integrations', icon: Plug },
      { href: '/admin/setup', label: 'Setup', icon: Cog },
    ],
  },
];

const BASE = process.env.NODE_ENV === 'production' ? '/posture-ui-preview' : '';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[224px] shrink-0 sticky top-0 h-screen bg-[#0F0C22] text-white border-r border-[#1D1838] flex flex-col">
      <div className="px-4 py-4 border-b border-[#1D1838]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-unbound-purple flex items-center justify-center shadow-[0_0_0_1px_#2E2365]">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-white leading-tight tracking-tight">
              Unbound
            </div>
            <div className="text-[10.5px] text-[#8B88A0] leading-tight">
              AI Posture &amp; Discovery
            </div>
          </div>
          <span className="text-[9px] font-mono text-unbound-purple px-1.5 py-0.5 rounded border border-[#2E2365] bg-[#17132B] tracking-wider">
            AASB
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {sections.map((sec) => (
          <div key={sec.title} className="mb-3 px-2.5">
            <div className="px-2 pb-1.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-[#5F5C74]">
              {sec.title}
            </div>
            <ul className="space-y-0.5">
              {sec.items.map((item) => {
                const active =
                  item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                const Icon = item.icon;
                const href = item.href === '/' ? `${BASE}/` : `${BASE}${item.href}/`;
                return (
                  <li key={item.href}>
                    <a
                      href={href}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12.5px] transition-colors',
                        active
                          ? 'bg-[#241A52] text-white font-semibold border border-[#2E2365]'
                          : 'text-[#A6A4B5] hover:text-white hover:bg-[#17132B] border border-transparent'
                      )}
                    >
                      <Icon className="w-[14px] h-[14px] shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.soon && (
                        <span className="text-[9px] uppercase text-[#5F5C74] tracking-wider">
                          soon
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-[#1D1838] text-[10.5px] text-[#5F5C74] flex items-center justify-between">
        <span>Mock data · preview</span>
        <span className="font-mono text-[#8B88A0]">v11.2</span>
      </div>
    </aside>
  );
}
