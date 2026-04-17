# Unbound Posture — Preview

Static preview of the revamped **Posture & Discovery** section for Unbound Security's admin console. Wireframes rendered in the `unbound-fe` design system, mock data only.

## Live preview

After GitHub Pages deploys (usually within 1–2 minutes of a push to `main`):

**https://websentry-ai.github.io/posture-ui-preview/**

## Pages implemented

| Route | Purpose |
|---|---|
| `/` | **Overview (Command Center)** — delta-since-Friday, SLA breaches, top-5 risk-weighted, attack-path chains, compliance snapshot |
| `/issues` | **Issues workbench** — triage queue, full Issue drawer with evidence, AI classification, remediation, compliance, history |
| `/fleet/devices` | Device list with posture chips |
| `/fleet/devices/[id]` | Device 360 with blast radius, issue list, 2am-incident pivot |
| `/fleet/heatmap` | Fleet heatmap (BU × Severity) |
| `/admin/catalogs/mcp` | Approved MCP catalog + unvetted-MCP review inbox |
| `/compliance/controls` | NIST CSF 2.0 controls with per-control finding mapping |
| `/reports` | Executive / evidence-packet / weekly-ops exports |
| `/admin/policies` | MDM profile library (Jamf/Intune/Kandji signed templates) |

Soon (stubbed in nav): Users · AI Tools · Inventory · Drift · Timeline · Detection Rules · Suppressions · Integrations · Setup.

## Design tokens

- Tailwind v3 with unbound-purple `#7B56FB`, unbound borders `#EAEBEE`, Inter body + Fira Code for evidence blocks
- shadcn-adjacent component patterns (no runtime framework dep — pure Tailwind)
- Severity palette: critical / high / medium / low / info with consistent chip + pill components

## Local dev

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Build preview locally

```bash
npm run build
npx serve out
```

## Context

Full design doc + 23-finding catalog + CISO review:
[ai-gateway-data#pull/1725](https://github.com/websentry-ai/ai-gateway-data/pull/1725)
