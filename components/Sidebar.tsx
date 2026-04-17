'use client';

import Link from 'next/link';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Item = { href: string; label: string; icon: any; soon?: boolean };
type Section = { title: string; items: Item[] };

const sections: Section[] = [
  {
    title: 'Posture',
    items: [
      { href: '/', label: 'Overview', icon: LayoutDashboard },
      { href: '/issues', label: 'Issues', icon: AlertTriangle },
    ],
  },
  {
    title: 'Fleet',
    items: [
      { href: '/fleet/devices', label: 'Devices', icon: Laptop },
      { href: '/fleet/byod', label: 'BYOD posture', icon: Users },
      { href: '/fleet/heatmap', label: 'BU heatmap', icon: Map },
      { href: '/fleet/tools', label: 'AI Tools', icon: Wrench },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { href: '/inventory/mcp', label: 'MCP · Hooks · Extensions', icon: Package },
    ],
  },
  {
    title: 'Evidence',
    items: [
      { href: '/drift', label: 'Drift & Baselines', icon: GitBranch },
      { href: '/timeline', label: 'Timeline', icon: Clock },
      { href: '/compliance/controls', label: 'Compliance', icon: Shield },
      { href: '/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    title: 'Admin',
    items: [
      { href: '/admin/catalogs/mcp', label: 'Catalogs', icon: BookMarked },
      { href: '/admin/rules', label: 'Detection Rules', icon: SlidersHorizontal },
      { href: '/admin/suppressions', label: 'Suppressions', icon: EyeOff },
      { href: '/admin/policies', label: 'Policies (MDM)', icon: ShieldCheck },
      { href: '/admin/integrations', label: 'Integrations', icon: Plug },
      { href: '/admin/setup', label: 'Setup', icon: Cog },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[248px] shrink-0 sticky top-0 h-screen bg-white border-r border-unbound-border flex flex-col">
      <div className="px-5 py-5 border-b border-unbound-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-unbound-purple flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-unbound-text-primary leading-tight">
              Unbound
            </div>
            <div className="text-[11px] text-unbound-text-tertiary leading-tight">
              Posture Preview
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {sections.map((sec) => (
          <div key={sec.title} className="mb-4 px-3">
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-unbound-text-muted">
              {sec.title}
            </div>
            <ul className="space-y-0.5">
              {sec.items.map((item) => {
                const active =
                  item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors',
                        active
                          ? 'bg-unbound-purple/10 text-unbound-purple font-medium'
                          : 'text-unbound-text-secondary hover:bg-unbound-bg-hover'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.soon && (
                        <span className="text-[9px] uppercase text-unbound-text-muted tracking-wider">
                          soon
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-unbound-border text-[11px] text-unbound-text-muted">
        Mock data · static preview
      </div>
    </aside>
  );
}
