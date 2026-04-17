import ComingSoon from '@/components/ComingSoon';

export default function Page() {
  return (
    <ComingSoon
      title="Hooks inventory"
      subtitle="Every PreToolUse / PostToolUse / SessionStart hook across Claude Code, Codex, Cursor."
      shipTarget="v1.0 (M1)"
      bullets={[
        {
          h: 'Per-hook AI classification',
          d: 'benign/policy · benign/workflow · suspicious/network · suspicious/exfil · malicious/rce — with the classifier reasoning and the invoked-script content fetched + classified when the hook calls `./scripts/X`.',
        },
        {
          h: 'Project-level vs user-level',
          d: 'Project-level hooks (delivered via cloned repos) show a Low disclosure finding even when classifier says benign — they are a supply-chain surface and deserve admin visibility.',
        },
        {
          h: 'Cross-link to signed-hook allowlist',
          d: 'Admin maintains a signed-hooks allowlist; hooks matching it auto-suppress. Unknown hooks fire #9.',
        },
      ]}
    />
  );
}
