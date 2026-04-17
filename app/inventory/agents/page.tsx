import ComingSoon from '@/components/ComingSoon';

export default function Page() {
  return (
    <ComingSoon
      title="Agents & Binaries"
      subtitle="Agent binary version + code-signing / notarization status + tamper detection."
      shipTarget="v1.1 (Q2)"
      bullets={[
        {
          h: 'Code-signing and notarization check (#24)',
          d: 'macOS: `codesign -dv` team ID check + `spctl` notarization check against the vendor\'s known-good list. Windows: `signtool verify`. Linux: package signature + hash vs known-good.',
        },
        {
          h: 'Binary hash / tamper timeline',
          d: 'Per-device agent-binary hash recorded at onboarding; drift detection fires if the hash changes in ways not matching an official release.',
        },
        {
          h: 'Version fragmentation',
          d: 'Fleet distribution per agent: X devices on v1.0.3, Y on v1.0.1, 41 stale. Backed by #13 stale-binary rule (demoted to Info).',
        },
      ]}
    />
  );
}
