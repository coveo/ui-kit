# Commerce Agent Chat Sample

Private local sample to chat with the commerce agent over AG-UI streaming.

## Structure

- `react-headless/` React headless implementation.

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
- `timezone <- VITE_TIMEZONE`
- `clientId <- VITE_CLIENT_ID`
- `contextUrl <- VITE_CONTEXT_URL`

## Commands

Run from `samples/commerce-agent-chat/react`:

- `pnpm dev` — starts the dev server on port 3001
- `pnpm lint:check`
- `pnpm lint:fix`
- `pnpm build`

Run from `samples/commerce-agent-chat/vue`:

- `pnpm dev` — starts the dev server on port 3002
- `pnpm lint:check`
- `pnpm lint:fix`
- `pnpm build`

Run from `samples/commerce-agent-chat/angular`:

- `pnpm dev` — starts Angular on port 3003
- `pnpm lint:check`
- `pnpm lint:fix`
- `pnpm build`

Run from `samples/commerce-agent-chat/vanilla`:

- `pnpm dev` — starts Vite on port 3004
- `pnpm lint:check`
- `pnpm lint:fix`
- `pnpm build`

Run from repository root:

- `pnpm turbo build --filter=@coveo/commerce-agent-chat-react`
- `pnpm turbo build --filter=@coveo/commerce-agent-chat-vue`
- `pnpm turbo build --filter=@coveo/commerce-agent-chat-angular`
- `pnpm turbo build --filter=@coveo/commerce-agent-chat-vanilla`

## Notes

- This sample is intentionally private and local-only.
- The invocation payload includes `forwardedProps.coveo` and omits `forwardedProps.policy`.
