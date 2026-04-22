# Commerce Agent Chat Sample

Private local sample to chat with the commerce agent over AG-UI streaming.

## Structure

- `react-headless/` React headless implementation.
- `services/` local classify service used by the sample.

## Current parity

React remains the reference implementation. Vue and Angular now match the same commerce rendering behavior for:

- Product carousel rendering (including image fallback and promo/original pricing display)
- Comparison summary/table rendering (including image row and dynamic attribute rows)
- Bundle display rendering (tabbed tiers, slot-level product mapping, and promo pricing)
- Next-actions rendering and loading fallbacks

Framework-specific template and styling details may still differ slightly.

## Setup

1. Install dependencies from repo root:
   `pnpm install`
2. Create local env file:
   `cp samples/commerce-agent-chat/.env.example samples/commerce-agent-chat/.env.local`
3. Fill required values in `.env.local`.

The sample always uses the Coveo agent API. The agent endpoint is derived automatically from the organization ID and environment.

For Angular, `VITE_*` variables are loaded into a generated runtime file instead of being written into source. The Angular package runs `pnpm run generate:config` automatically before `dev` and `build`, generating `angular/public/config.json` from `samples/commerce-agent-chat/.env.local` (fallback: `samples/commerce-agent-chat/.env`). The app fetches `/config.json` before bootstrap, and `angular/public/config.json` is git-ignored.
Angular dev requests are proxied through `angular/proxy.conf.js`:

- `/api/heuristics` -> classify service (classification model, run separately)

For Angular, these config fields must be non-empty:

- `config.accessToken` (`VITE_ACCESS_TOKEN`)
- `config.orgId` (`VITE_ORG_ID`)
- `config.platformUrl` (`VITE_PLATFORM_URL`)

Mapping used by Angular `generate:config` from `samples/commerce-agent-chat/.env.local` (or `.env`) to `angular/public/config.json`:

- `orgId <- VITE_ORG_ID`
- `accessToken <- VITE_ACCESS_TOKEN`
- `trackingId <- VITE_TRACKING_ID`
- `language <- VITE_LANGUAGE`
- `country <- VITE_COUNTRY`
- `currency <- VITE_CURRENCY`
- `contextUrl <- VITE_CONTEXT_URL`

## Commands

Run from `samples/commerce-agent-chat`:

- `pnpm dev` — starts both `services` and `react-headless` in parallel
- `pnpm dev:services` — starts only the classify service
- `pnpm dev:react` — starts only the React dev server

Run from `samples/commerce-agent-chat/react-headless`:

- `pnpm dev` — starts the React dev server
- `pnpm build`

Run from `samples/commerce-agent-chat/services`:

- `pnpm dev` — starts the classify service with file watching
- `pnpm start` — starts the classify service without file watching

## Notes

- This sample is intentionally private and local-only.
- The invocation payload includes `forwardedProps.coveo` and omits `forwardedProps.policy`.
