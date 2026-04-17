import ComingSoon from '@/components/ComingSoon';

export default function Page() {
  return (
    <ComingSoon
      title="AI Tools — Fleet posture"
      subtitle="Per-agent-family posture. Consolidates today's fragmented 'tools / mcp-servers / skills / permissions' pages into one coherent surface per tool."
      shipTarget="v1.0 (M1)"
      bullets={[
        {
          h: 'Per-agent dashboard',
          d: 'Claude Code · Cursor · Codex — each with device count, aggregate severity, MCP count (unvetted flagged), hook count, YOLO prevalence, sandbox-off prevalence, version distribution, policy coverage %.',
        },
        {
          h: 'Coverage gaps called out',
          d: 'Detected-but-not-scanned agents (Copilot · JetBrains AI · Gemini Code Assist · Windsurf) surface here as coverage gaps with device counts, so CISOs see the blind spots.',
        },
        {
          h: 'Drilldown tabs per tool',
          d: 'Issues / Inventory / Configuration / Timeline at fleet scope — the same four-tab pattern as Device 360, scoped to one tool.',
        },
      ]}
    />
  );
}
