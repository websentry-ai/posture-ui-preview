'use client';

import { cn } from '@/lib/utils';

export type ChainNode = {
  label: string;
  sev: 'critical' | 'high' | 'medium';
  explain?: string;
};

export type Chain = {
  name: string;
  kind: 'curated' | 'dynamic';
  nodes: ChainNode[];
  devices: string[];
  deviceCount: number;
  breakEdge: { after: number; profile: string; effect: string };
  dynamicExplain?: string;
};

export default function AttackPathGraph({
  chain,
  onBreakChain,
}: {
  chain: Chain;
  onBreakChain: () => void;
}) {
  return (
    <div className="py-1">
      {/* chain nodes + arrows */}
      <div className="flex items-center gap-0.5 flex-wrap">
        {chain.nodes.map((node, i) => (
          <div key={i} className="flex items-center">
            <div
              title={node.explain}
              className={cn(
                'px-2 py-1 rounded-md text-[11.5px] font-semibold border whitespace-nowrap',
                node.sev === 'critical' && 'bg-sev-critical-bg text-sev-critical border-sev-critical/30',
                node.sev === 'high' && 'bg-sev-high-bg text-sev-high border-sev-high/30',
                node.sev === 'medium' && 'bg-sev-medium-bg text-sev-medium border-sev-medium/30',
                node.explain && 'cursor-help'
              )}
            >
              {node.label}
            </div>
            {i < chain.nodes.length - 1 && (
              <button
                onClick={i === chain.breakEdge.after ? onBreakChain : undefined}
                title={
                  i === chain.breakEdge.after
                    ? `Break chain here: deploy ${chain.breakEdge.profile} — ${chain.breakEdge.effect}`
                    : 'Not the recommended break-edge for this chain'
                }
                className={cn(
                  'mx-0.5 font-bold text-[14px] leading-none transition',
                  i === chain.breakEdge.after
                    ? 'text-unbound-purple hover:text-unbound-purple-hover cursor-pointer scale-110'
                    : 'text-unbound-text-muted cursor-default'
                )}
              >
                ›
              </button>
            )}
          </div>
        ))}
      </div>

      {/* break-chain CTA when clicking the arrow isn't obvious */}
      <div className="flex items-center justify-between mt-2 text-[11px]">
        <span className="text-unbound-text-muted">
          {chain.kind === 'dynamic' ? (
            <span className="inline-flex items-center gap-1">
              <span className="px-1 py-0 rounded bg-unbound-purple/10 text-unbound-purple font-semibold uppercase tracking-wider text-[9px]">AI</span>
              Novel chain · {chain.dynamicExplain}
            </span>
          ) : (
            <>Curated chain · break at <span className="text-unbound-purple font-semibold">›</span> (pos {chain.breakEdge.after + 1})</>
          )}
        </span>
        <button
          onClick={onBreakChain}
          className="text-[11px] text-unbound-purple font-semibold hover:underline"
        >
          Break this chain →
        </button>
      </div>
    </div>
  );
}
