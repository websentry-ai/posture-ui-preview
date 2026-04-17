import ComingSoon from '@/components/ComingSoon';

export default function Page() {
  return (
    <ComingSoon
      title="Extensions inventory"
      subtitle="Cursor VS Code extensions + Claude plugins seen across the fleet. AI-classified per extension."
      shipTarget="v1.0 (M1)"
      bullets={[
        {
          h: 'LLM-classified categories',
          d: 'Every extension auto-classified as "AI agent / AI-adjacent / benign IDE" with model/version/confidence attribution. Admin can override; classifier retrains on overrides.',
        },
        {
          h: 'Shadow AI tooling detected',
          d: 'Cline, Roo-Cline, Kilo-Code, Continue, Windsurf-extension show up here first. Each non-catalog AI extension auto-opens as Finding #18 on the devices running it.',
        },
        {
          h: 'Catalog link',
          d: 'Every row shows whether the extension is in the org\'s Approved Extensions Catalog (under Admin → Catalogs).',
        },
      ]}
    />
  );
}
