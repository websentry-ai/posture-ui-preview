import ComingSoon from '@/components/ComingSoon';

export default function Page() {
  return (
    <ComingSoon
      title="Users"
      subtitle="Per-user roll-up of AI agent posture across all of a user's devices. Built for offboarding, audit, and on-call attribution."
      shipTarget="v1.1 (Q2)"
      bullets={[
        {
          h: 'User list with aggregate severity',
          d: 'For each user: max severity across their devices, BU / manager / geo (pulled from Okta SCIM), on-call status, last login, count of devices they own.',
        },
        {
          h: 'User 360 with identity-first lens',
          d: "Same tabs as Device 360 (Issues / Inventory / Configuration / Timeline) but scoped to one person across devices. Useful when a user has multiple laptops, when they're being audited, or when they're leaving the company.",
        },
        {
          h: 'Offboarding playbook',
          d: 'One-click "revoke all agent auth for this user" — flips every device into signed-out state, clears their MCP credentials, archives their config snapshots into the signed evidence packet.',
        },
        {
          h: 'On-call correlation',
          d: "Users currently on-call (via PagerDuty integration) surface higher in the Risk-weighted Top 5 on Overview — a compromised on-call laptop is the worst-case blast radius.",
        },
      ]}
    />
  );
}
