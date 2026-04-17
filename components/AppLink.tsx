import { cn } from '@/lib/utils';

const BASE = process.env.NODE_ENV === 'production' ? '/posture-ui-preview' : '';

export function resolvePath(href: string): string {
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return href;
  if (href.startsWith(BASE)) return href;
  return `${BASE}${href}`;
}

export default function AppLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>) {
  return (
    <a href={resolvePath(href)} className={cn(className)} {...rest}>
      {children}
    </a>
  );
}
