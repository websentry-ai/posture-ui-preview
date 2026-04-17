import ComingSoon from '@/components/ComingSoon';

export default function Page() {
  return (
    <ComingSoon
      title="MCP Server inventory"
      subtitle="Flat searchable reference: every MCP server seen across the fleet, regardless of risk status."
      shipTarget="v1.0 (M1)"
      bullets={[
        {
          h: 'Read-only reference',
          d: 'Risk detection surfaces in Issues (#6, #7). This page is the inventory — "does this MCP exist anywhere in our fleet?" Columns: name, publisher, device count, first-seen, last-seen, version, tools exposed, source (catalog vs unvetted).',
        },
        {
          h: 'Fast cross-link to Issues',
          d: 'Every unvetted MCP row links to its Issue #6 finding; every auto-approved write-tool links to #7.',
        },
        {
          h: 'Used on N devices',
          d: 'Aggregation column with click-through to the per-device list. Answers "how widespread is this?" in one hop.',
        },
      ]}
    />
  );
}
